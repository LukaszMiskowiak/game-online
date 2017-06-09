var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
app.use('/image/spaceship.png', express.static(__dirname + '/image/spaceship/png'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

// Add the WebSocket handlers

var players = {};
let player

io.on('connection', function(socket) {
  let size = Object.keys(players).length;
  let id;
  if (size < 2) {
    size === 0 ? id = 1: id = 2;
    socket.on('new player', function() {
      players[socket.id] = {
        // id: id,
        left: false,
        right: false,
        up: false,
        down: false,
        // x: 300,
        // y: 300
      };
    });
  }

  socket.on('movement', function(data) {
    player = players[socket.id] || {};
    data.up ? player.up = true:player.up = false;
    data.left ? player.left = true:player.left = false;
    data.right ? player.right = true:player.right = false;
    data.down ? player.down = true:player.down = false;
  });
  socket.on('position', function(data) {

  })
});

io.on
setInterval(function() {
  io.sockets.emit('state', player);
}, 1000 / 120);
