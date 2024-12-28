const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://xydasqjisznapwzbyoiu.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZGFzcWppc3puYXB3emJ5b2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MzIzNTksImV4cCI6MjA0ODEwODM1OX0.BrA7Rx19oAI0vErQdZ79ovkKeQZarBAL4YmPT74I3wY");


class Uploader {
    static bitrates = [
        { name: '360p', width: 640, height: 360, bitrate: '800k', audioBitrate: '96k' },
        { name: '480p', width: 854, height: 480, bitrate: '1400k', audioBitrate: '128k' },
        { name: '720p', width: 1280, height: 720, bitrate: '2800k', audioBitrate: '128k' },
    ];
    constructor(foldername) {
        this.foldername = foldername;
    }
    upload() {
        return new Promise((resolve, reject) => {
            const uploadChunks = (bitrateIndex) => {
                console.log(Uploader.bitrates.length);
                if (bitrateIndex < Uploader.bitrates.length) {

                    const contents = fs.readdirSync(this.foldername + `/${Uploader.bitrates[bitrateIndex].name}` +'/chunks');
                    const promises = contents.map(chunk => supabase.storage.from("video-chunks").upload(`${this.foldername}/${Uploader.bitrates[bitrateIndex].name}/chunks/${chunk}`, fs.readFileSync(`${this.foldername}/${Uploader.bitrates[bitrateIndex].name}/chunks/${chunk}`)));
                    promises.push(supabase.storage.from("video-chunks").upload(`${this.foldername}/${Uploader.bitrates[bitrateIndex].name}/${Uploader.bitrates[bitrateIndex].name}.m3u8`, fs.readFileSync(`${this.foldername}/${Uploader.bitrates[bitrateIndex].name}/${Uploader.bitrates[bitrateIndex].name}.m3u8`)))
                    Promise.all(promises).then(response => {
                        uploadChunks(bitrateIndex + 1);
                    }).catch(err => {
                        console.error(err);
                        reject(err);
                    })
                }
                else {
                    supabase.storage.from("video-chunks").upload(`${this.foldername}/output.m3u8`).then(() => {
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