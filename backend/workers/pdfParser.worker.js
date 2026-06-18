// workers/pdf.worker.js
const { PDFParse } = require('pdf-parse');

const { Worker, Queue } = require("bullmq");

console.log("pdfParser worker initialized")

const connection = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
}

const pdfQueue = new Queue("pdf-processing", { connection, concurrency:1 });

const pdfChunkingQueue = new Queue("pdf-chunking", { connection, concurrency:1 });

new Worker(
  "pdf-processing",
  async (job) => {
    console.log(
      `Processing Job ${job.id} and ${job.data.filename} at ${new Date()}`
    );
    // console.log(job.data)
    console.log(process.env.PDF_PARSER_URL + job.data.path)

    if(job.data.path){
        try {
            // console.log("1: Fetching File...");
            const filePath = process.env.PDF_PARSER_URL + job.data.path
            console.log(`1: Attempting to fetch and parse file from: ${filePath}`);
            const data = await new PDFParse({url:filePath});
            console.log("2: Fetching and parsing complete")
            const result = await data.getText();
            console.log("3 : Extraction of data from parsed pdf complete = with length => "+result.text.length)
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
    console.log("Checking for existing failed tasks...");
    const failedJobs = await pdfQueue.getFailed();

    // console.log("Failed jobs " + failedJobs.length)
    
    if (failedJobs.length === 0) {
      console.log("No failed tasks found.");
      return;
    }

    console.log(`Found ${failedJobs.length} failed tasks. Retrying them now...`);
    for (const job of failedJobs) {
      await job.retry();
      console.log(`Retrying Job ${job.id} for ${job.data.filename}`);
    }
  } catch (error) {
    console.error("Failed to check/retry items from queue:", error);
  }
}

// Execute the check on startup
retryFailedJobs();