const chalk = require("chalk");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const mongoose = require("mongoose");
const {update} = require("../Actions/mongooseActions");
const responseDataModel = require("../models/responseDataModel");
const { response } = require("express");
const { bitrates } = require("./uploader");
const socket  = require("../index");
const { NONAME } = require("dns/promises");
const supabaseUrl = "https://xydasqjisznapwzbyoiu.supabase.co";
class Video {
  static bitrates = [
    { name: '360p', width: 640, height: 360, bitrate: '800k', audioBitrate: '96k' },
    { name: '480p', width: 854, height: 480, bitrate: '1400k', audioBitrate: '128k' },
    { name: '720p', width: 1280, height: 720, bitrate: '2800k', audioBitrate: '128k' },
  ];
  constructor(filename, filepath, sessionId,socket) {
    this.filename = filename;
    this.filepath = filepath;
    this.sessionId = sessionId;
    this.socket = socket;
  }
  
  async createFolders() {
    fs.mkdirSync("/video", { recursive: true });
    fs.mkdirSync(this.filename, { recursive: true });
    for (let bitrate of Video.bitrates) {
      fs.mkdirSync(`${this.filename}/${bitrate.name}`)
      fs.mkdirSync(`${this.filename}/${bitrate.name}/chunks`, { recursive: true })
    }
    await update(this.sessionId, 'status.folder_creation', "Done")
    this.socket.to(this.sessionId).emit("progress",{
      room : this.sessionId,
      progressName : "create-folders",
      index : 1
    });
  }
  async chunking() {
    let index = 0;
    return new Promise((res, rej) => {
      const createChunksForDifferentBitrates = () => {
        console.log(index);
        if (index < Video.bitrates.length) {
          ffmpeg(`./video/${this.filename}`).addOptions([
            `-vf scale=${Video.bitrates[index].width}:${Video.bitrates[index].height}`, // Scale video resolution
            `-b:v ${Video.bitrates[index].bitrate}`, // Set video bitrate
            `-b:a ${Video.bitrates[index].audioBitrate}`, // Set audio bitrate
            '-c:v libx264',
            '-c:a aac',
            '-hls_playlist_type vod',
            '-profile:v baseline', // Compatibility with older devices
            '-level 3.0',          // Set level
            '-start_number 0',     // Start segment numbering at 0
            '-hls_time 10',        // Duration of each segment in seconds  
            `-hls_segment_filename ${this.filename}/${Video.bitrates[index].name}/chunks/output_${Video.bitrates[index].name}_%03d.ts`,
            '-f hls'               // Output format: HLS
          ]).output(`${this.filename}/${Video.bitrates[index].name}/${Video.bitrates[index].name}.m3u8`)
            .on("progress", (progress) => {
              // console.clear();
              console.log(chalk.blue(`${parseInt(progress.percent)}% chunking has been done for ${Video.bitrates[index].name}`));
            })
            .on("end", async () => {
              let path = `status.chunking.${Video.bitrates[index].name.toString()}`;
              await update(this.sessionId, path, "Done")
              index++;
              createChunksForDifferentBitrates();
            }).on("error", (err) => {
              rej(chalk.red(err));
            }).run();
        }
        else {
          const outputFileContents = Video.bitrates.map((b) => {
            return `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(b.bitrate) * 1000},RESOLUTION=${b.width}x${b.height}\n${b.name}/${b.name}.m3u8`;
          }).join("\n");
          fs.writeFileSync(`${this.filename}/output.m3u8`, outputFileContents);
          console.log(fs.readFileSync(`${this.filename}/output.m3u8`, 'utf-8'));
          res();
        }
      }
      createChunksForDifferentBitrates();
    })
  }
  async deleteFolder() {
    fs.unlinkSync(`./video/${this.filename}`, { recursive: true }, (err, stderr) => {
      if (err) {
        console.log(chalk.red('an error occurred : ', err));
        return;
      }
      else if (stderr) {
        console.log(chalk.red('an error occurred : ', stderr));
        return;
      }
    })
    fs.rmdirSync(`./${this.filename}`, { recursive: true }, async (err, stderr) => {
      if (err) {
        console.log(chalk.red('an error occurred : ', err));
        return;
      }
      else if (stderr) {
        console.log(chalk.red('an error occurred : ', stderr));
        return;

      }
    })
    await update(this.sessionId, "status.cleanup", "Done")

  }


}
module.exports = Video;