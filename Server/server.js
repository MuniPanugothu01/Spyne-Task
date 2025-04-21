const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const uploadRoutes = require("./routes/index");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/ImagesUrl", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.post("/api/upload", upload.single("csv"), uploadRoutes.uploadCSV);
app.get("/api/status/:requestId", uploadRoutes.checkStatus);

app.listen(5000, () => console.log("Server running on port 5000"));
