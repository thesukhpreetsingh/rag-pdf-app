const { Worker, Queue } = require("bullmq");
const { connection } = require('../config/redis');

console.log("saving embeddings worker initialized")
const saveEmbedingQueue = new Queue("pdf-embedding-save", { connection });

const { QdrantClient } = require("@qdrant/js-client-rest");
const qdrant = new QdrantClient({
  host: process.env.QDRANT_HOST,
  port: process.env.QDRANT_PORT
});

const BATCH_SIZE = 100;// you can save in ENV file as well
const collectionName = 'rag_vectors';

async function setupCollection() {

try {
    // 2. Check if the collection already exists
    console.log(`Checking if the collection rag_vectors exists`)
    const response = await qdrant.getCollections();
    const exists = response.collections.some(c => c.name === collectionName);

    if (!exists) {
        // 3. Create it explicitly if missing
        await qdrant.createCollection(collectionName, {
            vectors: {
                size: 768, // Match your embedding model dimension (e.g., OpenAI)
                distance: 'Cosine', // Similarity metric options: 'Cosine' | 'Euclid' | 'Dot'
            },
            // Optional: Optimize for low RAM usage by keeping payloads on disk
            on_disk_payload: true 
        });
        console.log(`Collection "${collectionName}" successfully created.`);
        } else {
        console.log(`Collection "${collectionName}" already exists.`);
        }
    } catch (error) {
        console.error('Error setting up collection:', error);
    }
}

setupCollection();


new Worker(
  "pdf-embedding-save",
  async (job) => {
    console.log(
      `============================ pdf-embedding-save to vector db start======================================= > \n
      Processing Job ${job.id} and ${job.data.filename} and _id ${job.data._id} on ${new Date()} \n`
    );
    console.log(job.data.points.length)

    if(job.data.points.length>0){
        try {
            console.log(" = = = = = = = = = = = = = = = = = = = = = = = = = = >")
            console.log("1: embedding to be saved for File...");

            if(job.data.points.length > 0) {
                console.log(`2: Starting the process to save the vectors in batches. = ${job.data.points.length} / ${BATCH_SIZE}`, (job.data.points.length/BATCH_SIZE))
                for (let i = 0; i < job.data.points.length; i += BATCH_SIZE) {
                    const batch = job.data.points.slice(i, i + BATCH_SIZE);

                    const result = await qdrant.upsert(collectionName, {
                        wait: true,
                        points: batch
                    });
                    console.log(result)
                }

                console.log(`============================ embeddings ended =======================================\n `)
            }else console.log("File embeddings Not Saved in vector db")
        } catch (error) {
            console.error(`Error saving embeddings in vector db for PDF job ${job.id}:`, error);
            console.log(`============================= saving embeddings to vector db error ended ======================================\n `)
            throw error;
        }
    }


    console.log(
      `Completed Job for saving embeddings ${job.id} to vector`
    );

    // return {
    //   status: "success",
    // };
  },
  {
    connection,
    concurrency: 1,
  }
);


async function retryFailedJobs() {
  try {
    console.log("======================================================= > ")
    console.log("Checking for existing failed tasks for saving embeddings to vectors...");
    const failedJobs = await saveEmbedingQueue.getFailed();

    // console.log("Failed jobs " + failedJobs.length)
    
    if (failedJobs.length === 0) {
        console.log("No failed tasks found for saving embeddings to vectors.");
        console.log("======================================================= > ")
      return;
    }

    console.log(`Found ${failedJobs.length} failed tasks. Retrying them now for saving embeddings to vectors...`);
    console.log("======================================================= > ")

    for (const job of failedJobs) {
      await job.retry();
      console.log(`Retrying Job ${job.id} for ${job.data.filename}`);
    }
  } catch (error) {
    console.error("Failed to check/retry items from saving embeddings to vectors queue:", error);
    console.log("======================================================= > ")
  }
}

// Execute the check on startup
retryFailedJobs();