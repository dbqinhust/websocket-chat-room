///////////////////////////////////////////////
///////////// IMPORTS + VARIABLES /////////////
///////////////////////////////////////////////

const http = require('http'); 
const CONSTANTS = require('./utils/constants.js');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// You may choose to use the constants defined in the file below
const { PORT, CLIENT } = CONSTANTS;

///////////////////////////////////////////////
///////////// HTTP SERVER LOGIC ///////////////
///////////////////////////////////////////////

// Create the HTTP server
const server = http.createServer((req, res) => {
  // get the file path from req.url, or '/public/index.html' if req.url is '/'
  const filePath = ( req.url === '/' ) ? '/public/index.html' : req.url;

  // determine the contentType by the file extension
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  if (extname === '.js') contentType = 'text/javascript';
  else if (extname === '.css') contentType = 'text/css';

  fs.readFile(`${__dirname}/${filePath}`, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

///////////////////////////////////////////////
////////////////// WS LOGIC ///////////////////
///////////////////////////////////////////////

const wsServer = new WebSocket.Server({ server });


// wsServer is an instance of the ws WebSocket.Server class
wsServer.on('connection', (socket) => {
// this code will run each time a new client connects to the server
  console.log('New client connected!');
  // socket.send('Welcome to the server!'); 

  socket.on('message', (data) => {
  // the server will echo the message received back to the client
    // socket.send('message received: ' + data); 
    broadcast(data, socket); // broadcast the message to all other clients
  });
})
  

///////////////////////////////////////////////
////////////// HELPER FUNCTIONS ///////////////
///////////////////////////////////////////////

function broadcast(data, socketToOmit) {
  // Implement the broadcast pattern. Exclude the emitting socket!
  wsServer.clients.forEach((client) => {
    if (client !== socketToOmit && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Start the server listening on localhost:8080
server.listen(PORT, () => {
  console.log(`Listening on: http://localhost:${server.address().port}`);
});
