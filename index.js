const express = require("express");
const { exec } = require("child_process");
const app = express();
const fs = require("fs");
const multer = require("multer");
const Video = require("./video");
const chalk = require("chalk");
const Uploader = require("./uploader");
const supabaseUrl = "https://xydasqjisznapwzbyoiu.supabase.co";


app.get("/", (req, res) => {
  res.send("hello world");
})
const storage = multer.diskStorage({
  destination: "video",
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${file.originalname}`)
  }
})
const videoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.includes(".mp4")) {
      return cb(new Error("Please upload a video file"));
    }
    cb(undefined, "the file is a fit");
  }

});

app.post("/video-upload", videoUpload.single('video'), async (req, res) => {

  try {
    console.log(req.file);
    const mainFolder = req.file.filename;
    const filepath = req.file.path;
    
    const videoInstance = new Video(mainFolder, filepath);
    try {
      fs.readdirSync(req.file.filename);
    }
    catch (err) {
      videoInstance.createFolders();
      await videoInstance.chunking();
    }
    const uploaderInstance = new Uploader(req.file.filename);
    await uploaderInstance.upload()
    videoInstance.deleteFolder();
    const response = {
      "name": req.file.filename,
      "type": req.file.mimetype,
      "mainfile_url": `${supabaseUrl}/storage/v1/object/public/video-chunks/${req.file.filename}/output.m3u8`
    };
    res.json(response);
  }
  catch (err) {
    console.log(err);
    res.send("An Error occurred : " + err);
  }
})

app.listen(8080, () => {
  console.log("api is listening")
});
