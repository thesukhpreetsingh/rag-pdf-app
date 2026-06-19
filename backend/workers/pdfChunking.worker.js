const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { Document } = require("@langchain/core/documents");
const { Worker, Queue } = require("bullmq");
const { connection } = require('../config/redis');

console.log("pdfchunking worker initialized")

const splitter = new RecursiveCharacterTextSplitter(
    { 
        chunkSize: 750,
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


// OLLAMA_CLOUD_KEY


new Worker(
  "pdf-chunking",
  async (job) => {
    console.log(
      `Processing Job ${job.id} and ${job.data.filename} at ${new Date()}`
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

            if(result && result.text.length > 0) {
              console.log("4: Sending it to chunk queue")
              let parseJob = await pdfChunkingQueue.add("pdfChunkingQueue",{
                  filename: job.data.filename,
                  data : result.text
              },{
                attempts: 3,
                removeOnComplete: true,
                removeOnFail: false,
              })
              console.log(`${parseJob.id} successfully added => for ${job.data.filename}`)


            }else console.log("File Not Parsed")
        } catch (error) {
            console.error(`Error processing PDF job ${job.id}:`, error);
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