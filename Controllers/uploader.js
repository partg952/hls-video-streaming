const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
require('dotenv').config()
const supabase = createClient("https://xydasqjisznapwzbyoiu.supabase.co", process.env.SUPABASE_KEY);
const {update} = require("../Actions/mongooseActions");


class Uploader {
    static bitrates = [
        { name: '360p', width: 640, height: 360, bitrate: '800k', audioBitrate: '96k' },
        { name: '480p', width: 854, height: 480, bitrate: '1400k', audioBitrate: '128k' },
        { name: '720p', width: 1280, height: 720, bitrate: '2800k', audioBitrate: '128k' },
    ];
    constructor(foldername, sessionId) {
        this.foldername = foldername;
        this.sessionId = sessionId;
    }
    upload() {
        return new Promise((resolve, reject) => {
            const uploadChunks = (bitrateIndex) => {
                console.log(Uploader.bitrates.length);
                if (bitrateIndex < Uploader.bitrates.length) {

                    const contents = fs.readdirSync(this.foldername + `/${Uploader.bitrates[bitrateIndex].name}` + '/chunks');
                    const promises = contents.map(chunk => supabase.storage.from("video-chunks").upload(`${this.foldername}/${Uploader.bitrates[bitrateIndex].name}/${chunk}`, fs.readFileSync(`${this.foldername}/${Uploader.bitrates[bitrateIndex].name}/chunks/${chunk}`)));
                    promises.push(supabase.storage.from("video-chunks").upload(`${this.foldername}/${Uploader.bitrates[bitrateIndex].name}/${Uploader.bitrates[bitrateIndex].name}.m3u8`, fs.readFileSync(`${this.foldername}/${Uploader.bitrates[bitrateIndex].name}/${Uploader.bitrates[bitrateIndex].name}.m3u8`)))
                    Promise.all(promises).then(response => {
                        uploadChunks(bitrateIndex + 1);
                    }).catch(err => {
                        console.error(err);
                        reject(err);
                    })
                }
                else {
                    supabase.storage.from("video-chunks").upload(`${this.foldername}/output.m3u8`).then(async (data) => {
                        update(this.sessionId, 'status.uploading', "Done");
                        update(this.sessionId, 'playback_url', `https://xydasqjisznapwzbyoiu.supabase.co/storage/v1/object/public/video-chunks/${this.foldername}/720p/720p.m3u8`)
                        resolve();
                    }).catch(err => {
                        reject(err);
                    })
                }
            }
            uploadChunks(0);

        })
    }


}
module.exports = Uploader;