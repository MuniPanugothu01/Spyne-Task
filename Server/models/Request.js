const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  inputUrl: String,
  outputUrl: String,
  status: { type: String, default: "pending" },
});

const requestSchema = new mongoose.Schema({
  requestId: String,
  productName: String,
  serialNumber: Number,
  images: [imageSchema],
  status: { type: String, default: "processing" },
  webhookUrl: String,
});

module.exports = mongoose.model("Request", requestSchema);
