const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { Document } = require("@langchain/core/documents");
const { Worker, Queue } = require("bullmq");
const { connection } = require('../config/redis');

console.log("pdfchunking worker initialized")

const splitter = new RecursiveCharacterTextSplitter(
    { 
        chunkSize: 1000,
        chunkOverlap: 150,
        separators: [
            "\n\n",
            "\n",
            ". ",
            "? ",
            "! ",
            "; ",
            ", ",
            " "
        ]
    })

const pdfChunkingQueue = new Queue("pdf-chunking", { connection });
const chunkEmbedingQueue = new Queue("pdf-chunk-embedding", { connection });


new Worker(
  "pdf-chunking",
  async (job) => {
    console.log(
      `=================================================================== > \n
      Processing Job ${job.id} and ${job.data.filename} and _id ${job.data._id} on ${new Date()} \n`
    );
    console.log(job.data.data.length)

    if(job.data.data){
        try {
            console.log("1: Chunking to be started File...");
            const docs = [
                new Document({
                    pageContent: job.data.data,
                    metadata: {
                        filename: job.data.filename
                    }
                })
            ];
            const chunks = await splitter.splitDocuments(docs)

            console.log(`2: Chunking done ... with size ${chunks.length}`);

            if(chunks.length > 0) {
              console.log("4: Sending it to Further queue for embedding")
              let embedJob = await chunkEmbedingQueue.add("chunkEmbedingQueue",{
                  filename: job.data.filename,
                  chunks : chunks,
                  _id: job.data._id
              },{
                attempts: 3,
                removeOnComplete: true,
                removeOnFail: false,
              })
              console.log(`${embedJob.id} successfully added to embeddings queue => for ${job.data.filename}`)

                console.log(`===================================================================\n `)
            }else console.log("File Not chunked")
        } catch (error) {
            console.error(`Error chunking PDF job ${job.id}:`, error);
            throw error;
        }
    }


    console.log(
      `Completed Job ${job.id}`
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
    console.log("Checking for existing failed tasks in chunking queue...");
    const failedJobs = await pdfChunkingQueue.getFailed();

    console.log("Failed jobs in chunking " + failedJobs.length)
    
    if (failedJobs.length === 0) {
      console.log("No failed tasks found in chunking worker.");
      return;
    }

    console.log(`Found ${failedJobs.length} failed tasks in chunking queue. Retrying them now...`);
    for (const job of failedJobs) {
      await job.retry();
      console.log(`Retrying Job ${job.id} for ${job.data.filename}`);
    }
  } catch (error) {
    console.error("Failed to check/retry items from chunking queue:", error);
  }
}

// Execute the check on startup
retryFailedJobs();