# HLS Video Chunking & Streaming Platform

A full-stack video processing platform that converts uploaded videos into HLS (HTTP Live Streaming) format using FFmpeg, provides real-time processing updates, and enables smooth playback through a web-based frontend.

---

## Overview

This project implements an end-to-end pipeline for Video-on-Demand (VOD) streaming. Users can upload videos through a web interface, track processing progress in real time, and stream the processed content using HLS-compatible players.

Each upload is handled as a session, allowing reliable tracking of long-running video processing jobs.

---

## Features

- Video upload with format and size validation
- Multi-resolution HLS generation (360p, 480p, 720p)
- Adaptive bitrate streaming using a master playlist
- Automatic .m3u8 playlist and segment creation
- Real-time progress updates using Socket.IO
- Session-based processing workflow
- MongoDB-backed metadata and session storage
- React-based frontend for upload, tracking, and playback
- Dockerized setup for consistent deployment

---

## Tech Stack

### Backend
- Node.js
- Express
- FFmpeg
- Multer
- Socket.IO
- MongoDB (Mongoose)

### Frontend
- React
- Socket.IO Client
- HLS-compatible video player

### Infrastructure
- Docker

---

## Architecture (High-Level)

1. User uploads a video via the frontend
2. Backend creates a unique processing session
3. Video is stored temporarily on disk
4. FFmpeg generates HLS renditions at 360p, 480p, and 720p
5. Resolution-specific playlists and segments are created
6. A master playlist is generated for adaptive streaming
7. Backend emits real-time progress events via Socket.IO
8. Processed assets are stored and made available for streaming
9. Temporary files are cleaned up after completion

---

## Adaptive Bitrate Streaming

The video processing pipeline supports adaptive bitrate streaming by generating multiple HLS renditions for each uploaded video.

The following resolutions are produced:

- 360p
- 480p
- 720p

Each resolution has its own HLS playlist and media segments. A master playlist references all renditions, allowing the video player to automatically switch between resolutions based on available network bandwidth and device performance.

This ensures smooth playback across low, medium, and high bandwidth environments.

---

## API Endpoints

### POST /video-upload

Uploads a video and starts the HLS processing pipeline.

- Content-Type: multipart/form-data
- Field name: video
- Supported format: .mp4
- Max size: 50MB

Response:
"sessionId"

---

### GET /get-video/:sessionId

Retrieves metadata and streaming information for a processed video session.

---

## Real-Time Communication

### Socket.IO Events

Client to Server:
- join: Join a session-specific room

Server to Client:
- progress: Emits processing stage updates (chunking, uploading, cleanup)
- error: Emits errors during processing

This enables the frontend to reflect live processing status for each upload.

---

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- FFmpeg
- Docker (optional but recommended)

---

### Installation

git clone https://github.com/your-username/hls-video-platform.git
cd hls-video-platform
npm install

---

### Environment Variables

Create a .env file:

MONGODB_URI=mongodb://localhost:27017/hls

---

### Run Locally

node index.js

The backend will be available at:

http://localhost:8080

---

### Run with Docker

docker build -t hls-video-platform .
docker run -p 8080:8080 --env-file .env hls-video-platform

---

## Frontend Usage

- Upload a video file
- Join the session using the returned session ID
- View real-time processing updates
- Stream the processed video using HLS playback

---

## Limitations

- Designed for Video-on-Demand (not live streaming)
- Free-tier hosting environments may limit processing time
- No DRM support

---

## Future Improvements

- Additional resolutions and bitrates
- Background job queues
- Cloud object storage (S3 / R2)
- Authentication and user accounts
- Live streaming support

---

## Why This Project?

This project demonstrates:
- Practical backend video processing with FFmpeg
- Adaptive bitrate streaming using HLS
- Real-time event-driven architecture using Socket.IO
- Full-stack integration of long-running backend jobs with frontend UX
- Production-style system design and deployment

---

## License

MIT License
