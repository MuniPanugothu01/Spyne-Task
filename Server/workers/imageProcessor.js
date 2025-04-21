const { Queue, Worker } = require("bullmq");
const Request = require("../models/Request");
const fetch = require("node-fetch");
const path = require("path");

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
};
const imageQueue = new Queue("image-processing", { connection });

new Worker(
  "image-processing",
  async (job) => {
    const { requestId, inputUrl, imageIndex } = job.data;

    // Simulated processed image URL
    const outputUrl = `https://fake-storage.com/${path.basename(inputUrl)}`;

    const reqDoc = await Request.findOne({ requestId });
    reqDoc.images[imageIndex].outputUrl = outputUrl;
    reqDoc.images[imageIndex].status = "done";

    const allDone = reqDoc.images.every((img) => img.status === "done");
    reqDoc.status = allDone ? "done" : "processing";
    await reqDoc.save();

    if (allDone && reqDoc.webhookUrl) {
      await fetch(reqDoc.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status: "done" }),
      });
    }
  },
  { connection }
);

module.exports = { imageQueue };
