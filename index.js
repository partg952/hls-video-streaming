const express = require("express");
const {exec} = require("child_process");
const app = express();
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const Video = require("./video");
const chalk = require("chalk");
const {v2 : cloudinary} = require("cloudinary");
const Uploader = require("./uploader");



app.get("/",(req,res) => {
  res.send("hello world");
})
const storage = multer.diskStorage({
  destination : "video",
  filename : (req,file,cb) => {
    cb(null,`${file.fieldname}_${file.originalname}`)
  }
})
const videoUpload = multer({
      storage : storage,
      limits : {
        fileSize : 50000000
      },
      fileFilter(req,file,cb) {
        if (!file.originalname.includes(".mp4")) {
          return cb(new Error("Please upload a video file"));
        }
        cb(undefined,"the file is a fit");
      }

});

app.post("/video-upload",videoUpload.single('video'),async (req,res) => {
  try {
    console.log(req.file);
    const mainFolder = req.file.filename;
    const filepath = req.file.path;
    const videoInstance = new Video(mainFolder,filepath); 
    await videoInstance.createFolders();
    await videoInstance.chunking();
    const uploaderInstance = new Uploader(req.file.filename);
    await uploaderInstance.upload()
    res.send("video chunks created");
  }
  catch(err) {
    console.log(err);
    res.send("An Error occurred : " + err);
  }
  

})

app.listen(8080,() => {
  console.log("api is listening")
});
