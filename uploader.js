const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://xydasqjisznapwzbyoiu.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZGFzcWppc3puYXB3emJ5b2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MzIzNTksImV4cCI6MjA0ODEwODM1OX0.BrA7Rx19oAI0vErQdZ79ovkKeQZarBAL4YmPT74I3wY");


class Uploader {
    constructor(foldername) {
        this.foldername = foldername;
    }
    upload() {
        return new Promise((resolve, reject) => {

            const contents = fs.readdirSync(this.foldername + '/chunks');
            const promises = contents.map(chunk => supabase.storage.from("video-chunks").upload(`${this.foldername}/chunks/${chunk}`, fs.readFileSync(`${this.foldername}/chunks/${chunk}`)));
            Promise.all(promises).then(response => {
                console.log(response);
                resolve(response);
            }).catch(err => {
                console.error(err);
                reject(err);
            })

        })
    }


}
module.exports = Uploader;