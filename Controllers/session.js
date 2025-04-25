const { v4: uuidv4 } = require("uuid");
const responseDataModel = require("../models/responseDataModel");
module.exports = function createSession(videoName, videoInfo) {
    const uuid = uuidv4().toString();
    const videoDoc = new responseDataModel({
        video_name: videoName,
        session_id: uuid,
        video_info: videoInfo,
        status: {
            folder_creation: "Pending",
            chunking: {
                "360p": "Pending",
                "480p": "Pending",
                "720p": "Pending"

            },
            cleanup: "Pending",
            uploading: "Pending"

        },
        playback_url: "Pending"
    })
    videoDoc.save().then(() => console.log("document created")).catch(err => console.log(err))
    return uuid;


}