var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
app.set('port', 5000);
//load files
app.use('/static', express.static(__dirname + '/static'));
app.use('/static/spaceship.png', express.static(__dirname + '/static/spaceship/png'));
app.use('/static/spaceship1.png', express.static(__dirname + '/static/spaceship1/png'));
// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});
// Logic
let playersString = ['player1', 'player2'],
    players = {};
io.on('connection', function(socket) {
  if (playersString[0] === 'player1') {
    players['player1'] = {player: playersString[0]};
  } else if (playersString[0] === 'player2') {
    players['player2'] = {player: playersString[0]};
  }
  socket.emit('connected', playersString.shift());
  socket.on('disconnect', () => {
    playersString = ['player1','player2'];
    players = [];
  });
  socket.on('keyboard', (data) => {
    players[data.player].left = data.left;
    players[data.player].right = data.right;
    players[data.player].up = data.up;
    players[data.player].shot = data.shot;
    socket.emit('state', players);
  })
});
// Data Structure:
  // players = {
    // player1: {
      // player: 'player1',
      // up: true,
      // left: true,
      // right: true,
      // shot: true
    // },
    // player2: {
      // player: 'player2',
      // up: true,
      // left: true,
      // right: true,
      // shot: true
    // }
  // }
//
