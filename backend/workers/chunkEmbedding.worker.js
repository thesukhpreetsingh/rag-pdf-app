const { Worker, Queue } = require("bullmq");
const { connection } = require('../config/redis');

const crypto = require('crypto');

const { OllamaEmbeddings } = require("@langchain/ollama");

console.log("pdfembeddngs worker initialized")
const chunkEmbedingQueue = new Queue("pdf-chunk-embedding", { connection });
const saveEmbedingQueue = new Queue("pdf-embedding-save", { connection });


const embeddings = new OllamaEmbeddings({
    model: "embeddinggemma:300m",//"nomic-embed-text", 
    baseUrl: "http://ollama:11434", // Default local port
});


new Worker(
  "pdf-chunk-embedding",
  async (job) => {
    console.log(
      `============================ pdf-chunk-embedding start======================================= > \n
      Processing Job ${job.id} and ${job.data.filename} and _id ${job.data._id} on ${new Date()} \n`
    );
    console.log(job.data.chunks.length)

    if(job.data.chunks.length>0){
        try {
            console.log(" = = = = = = = = = = = = = = = = = = = = = = = = = = >")
            console.log("1: embedding to be started for File...");

            let chunks = job.data.chunks;

            // console.log("typeof chunks ",typeof chunks);
            // console.log("Array.isArray(chunks) ",Array.isArray(chunks));
            // console.log("chunks[0] === > " , chunks[0]);
            const texts = chunks.map(chunk => chunk.pageContent);

            const vectors = await embeddings.embedDocuments(texts);

            // console.log(vectors)

            const points = vectors.map((vector, index) => ({
                id: crypto.randomUUID(),
                _id : job.data._id,
                indexID: index, 

                vector,

                payload: {
                    fileId: job.data._id,
                    fileName: job.data.filename,
                    chunkIndex: index,

                    text: chunks[index].pageContent
                }
            }));
            // console.log(points) // for info

            // console.log(texts) // for info

            console.log("\n========================================================================\n")

            console.log(`2: embeddings done ... with chunk size ${job.data.chunks.length} and vector length ${vectors.length}`);

            // console.log(vectors) // for info
            if(vectors.length > 0) {
                console.log("3: Sending vectors to Further queue for to get saved")
                let vectorSaveJob = await saveEmbedingQueue.add("saveEmbedingQueue",{
                    filename: job.data.filename,
                    points : points,
                    _id: job.data._id
                },{
                    attempts: 3,
                    removeOnComplete: true,
                    removeOnFail: false,
                })
                console.log(`${vectorSaveJob.id} successfully added to embeddings saving queue => for ${job.data.filename}`)

                console.log(`============================ embeddings creation process ended =======================================\n `)
            }else console.log("File Not embedded")
        } catch (error) {
            console.error(`Error embeddings PDF job ${job.id}:`, error);
            console.log(`============================= embeddings creation process error ended ======================================\n `)
            throw error;
        }
    }


    console.log(
      `Completed Job for embeddings ${job.id}`
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
    console.log("Checking for existing failed tasks for embeddings...");
    const failedJobs = await chunkEmbedingQueue.getFailed();

    // console.log("Failed jobs " + failedJobs.length)
    
    if (failedJobs.length === 0) {
        console.log("No failed tasks found for embeddings.");
        console.log("======================================================= > ")
      return;
    }

    console.log(`Found ${failedJobs.length} failed tasks. Retrying them now for embeddings...`);
    console.log("======================================================= > ")

    for (const job of failedJobs) {
      await job.retry();
      console.log(`Retrying Job ${job.id} for ${job.data.filename}`);
    }
  } catch (error) {
    console.error("Failed to check/retry items from queue:", error);
    console.log("======================================================= > ")
  }
}

// Execute the check on startup
retryFailedJobs();