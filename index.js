const express = require("express");
const app = express();
const createSession = require("./Controllers/session");
const multer = require("multer");
const Video = require("./Controllers/video");
const {update, getData} = require("./Actions/mongooseActions");
const Uploader = require("./Controllers/uploader");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());
const server = createServer(app);
const socket = new Server(server, {
  cors: {
    origin: "*"
  }
});

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("connection success");
}).catch(err => {
  console.log(err);
})
app.get("/", (req, res) => {
  res.send("hello world");
})
const storage = multer.diskStorage({
  destination: "video",
  filename: (req, file, cb) => {
    cb(null, `video_${file.originalname}`);
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

socket.on("connection", (client) => {
  console.log("a user connected");
  client.on("join", (room) => {
    client.join(room);
    console.log(`${client.id} joined room ${room}`);
  })
  client.on("progress", (data) => {
    console.log(data.name);
    client.to(data.room).emit(data.name, data.data);
  });
  client.on("error", (err) => {
    console.log(err);
    client.emit("error", {
      message: "An error occurred",
      error: err
    });
  }
  )
})

app.post("/video-upload", videoUpload.single('video'), async (req, res) => {
  console.log(req.file);
  const sessionId = createSession(req.file.filename, {
    filename: req.file.filename,
    originalname: req.file.originalname,
    encoding: req.file.encoding,
    mimetype: req.file.mimetype,
    size: req.file.size
  });

  const mainFolder = req.file.filename;
  const filepath = req.file.path;
  const videoInstance = new Video(mainFolder, filepath, sessionId, socket);
  console.log(sessionId);
  setImmediate(async () => {
    try {
      res.send(sessionId);
      console.log(req.file);
      videoInstance.createFolders();
      await videoInstance.chunking();
      socket.to(sessionId).emit("progress", {
        room: sessionId,
        progressName: "chunking",
        index: 2
      });
      const uploaderInstance = new Uploader(req.file.filename, sessionId);
      await uploaderInstance.upload()
      socket.to(sessionId).emit("progress", {
        room: sessionId,
        progressName: "uploading",
        index: 3
      });
      videoInstance.deleteFolder();
      socket.to(sessionId).emit("progress", {
        room: sessionId,
        progressName: "cleanup",
        index: 4
      });
      console.log("everything done")

    }
    catch (err) {
      console.log(err);
      socket.to(sessionId).emit("error",err);
      videoInstance.deleteFolder();
    }
    
  })

})
app.get("/get-video/:sessionId", async (req, res) => {
  const sessionId = req.params.sessionId;
  const data = await getData(sessionId);
  console.log(data);
  if (!data) {
    return res.status(404).send("No data found");
  }
  res.send(data);
}
)
server.listen(8080, () => {
  console.log("api is listening")
});


module.exports = socket;
