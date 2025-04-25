const mongoose = require("mongoose");
const responseDataModel = require("../models/responseDataModel");
module.exports.update = async function update(sessionId, path, data) {

    await responseDataModel.updateOne({ "session_id": sessionId }, {
        $set: {
            [path]: data
        }
    })
}
module.exports.getData = async function getData(sessionId) {
    const data = await responseDataModel.findOne({ "session_id": sessionId });
    if (!data) {
        return null;
    }
    return data;
}