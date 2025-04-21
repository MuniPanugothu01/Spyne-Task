const { parseCSV } = require("../utils/csvParser");
const Request = require("../models/Request");
const { imageQueue } = require("../workers/imageProcessor");
const { v4: uuidv4 } = require("uuid");

exports.uploadCSV = async (req, res) => {
  try {
    const parsedData = await parseCSV(req.file.path);
    const requestId = uuidv4();

    for (const row of parsedData) {
      const images = row["Input Image Urls"]
        .split(",")
        .map((url) => url.trim());

      const newRequest = await Request.create({
        requestId,
        productName: row["Product Name"],
        serialNumber: row["S. No."],
        images: images.map((url) => ({ inputUrl: url })),
        status: "processing",
        webhookUrl: req.body.webhookUrl || null,
      });

      for (let i = 0; i < images.length; i++) {
        await imageQueue.add("process-image", {
          requestId,
          imageIndex: i,
          inputUrl: images[i],
        });
      }
    }

    res.status(202).json({ requestId });
  } catch (err) {
    res
      .status(500)
      .json({ error: "CSV parsing or DB error", details: err.message });
  }
};

exports.checkStatus = async (req, res) => {
  const data = await Request.findOne({ requestId: req.params.requestId });
  if (!data) return res.status(404).json({ error: "Request not found" });

  res.json({
    requestId: data.requestId,
    status: data.status,
    images: data.images,
  });
};
