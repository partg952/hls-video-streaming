const { exec } = require("child_process");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
class Video {
  constructor(filename, filepath) {
    this.filename = filename;
    this.filepath = filepath;
  }
  createFolders() {
    return new Promise((res, rej) => {
      exec(`mkdir ${this.filename} && mkdir ${this.filename}/chunks`, (err, stdout, stderr) => {
        if (stderr) {
          rej("THIS IS AN STD ERROR : " + stderr);
        }
        else if (err) {
          rej("THIS IS A NORMAL ERROR : " + err);
        }
        res("THE FOLDER HAS BEEN CREATED");
      })
    })
  }
  chunking() {
    return new Promise((res, rej) => {
      exec(`ffmpeg -i ${this.filepath}   -c:v libx264 -c:a aac -hls_time 2 -hls_playlist_type vod  -hls_segment_filename "${this.filename}/chunks/output%03d.ts" -start_number 0 ${this.filename}/output.m3u8`, (err, stderr, stdout) => {
        if (err) { rej("THIS IS A NORMAL ERROR : " + err); } else if (stderr) { rej("THIS IS AN STD ERROR : " + stderr); }
        res("THE CHUNKS HAVE BEEN CREATED")
      })
    })
  }


}
module.exports = Video;