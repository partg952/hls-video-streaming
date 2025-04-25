const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
    video_name:{
        type:String,
        required:true
    },
    session_id : String,
    video_info : {
        filename:String,
        originalname:String,
        encoding:String,
        mimtype : String,
        size: Number
    },
    status : {
        folder_creation : String,
        chunking : {
            "360p" : String,
            "480p" : String,
            "720p" : String,
        },
        cleanup : String,
        uploading : String
    },
    playback_url: String
});
const videoModel = mongoose.model("videoModel",videoSchema);
module.exports = videoModel;