// Install the necessary package first by running:
// npm install ws

const WebSocket = require('ws');
const fs = require('fs');
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const wss = new WebSocket.Server({ server });

let connections = {};

function onConnect(socket){
  const connection={
    UID:`${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    socket:socket
  }
  connections[connection.UID]=connection;
  socket.send(JSON.stringify({type:'UID',UID:connection.UID}));
}


wss.on('connection', (socket) => {
  console.log('A player connected.');
onConnect(socket);

  socket.on('message', (message) => {
    const data = JSON.parse(message);


    if (data.type === 'chat') {
      for (const UID in connections) {
        if (UID !== data.UID) {
          connections[UID].socket.send(JSON.stringify({ type: 'chat', message: data.message ,pName:data.pName }));
        }
      }
    }


  });

  socket.on('close', () => {
    console.log('A player disconnected.');
    for (const UID in connections) {
      if (connections[UID].socket === socket) {
        delete connections[UID];
        break;
      }
    }
  });
});

server.listen(8080);

