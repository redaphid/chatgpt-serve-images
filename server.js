const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const IMAGE_DIR = path.join(__dirname, 'images');

app.use(express.static(IMAGE_DIR));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('New WebSocket connection');
});

function emitUpdate() {
  io.emit('update', { time: new Date().getTime() });
}

chokidar.watch(IMAGE_DIR).on('all', (event, path) => {
  console.log(`File ${path} has been ${event}`);
  emitUpdate();
});

app.get('/images', (req, res) => {
  fs.readdir(IMAGE_DIR, (err, files) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif)$/.test(file));
    const imagePaths = imageFiles.map((file) => `/${file}`);
    res.json(imagePaths);
  });
});

function getLocalIpAddress() {
  const ifaces = os.networkInterfaces();
  let localIp = 'Unknown';

  for (const ifaceName in ifaces) {
    const iface = ifaces[ifaceName];
    for (const item of iface) {
      if (item.family === 'IPv4' && !item.internal) {
        localIp = item.address;
        break;
      }
    }
    if (localIp !== 'Unknown') {
      break;
    }
  }

  return localIp;
}

const PORT = 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  const localIp = getLocalIpAddress();
  console.log(`Server running on port ${PORT}`);
  console.log(`Local IP address: ${localIp}`);
});

// Additional code for image enlargement and reduction
app.get('/enlarge', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'enlarge.html'));
});

