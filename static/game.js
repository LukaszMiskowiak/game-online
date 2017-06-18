// socket setup
let socket = io();
// players data declaration
let players = {},
    player = '';
// socket client logic
socket.on('connected', (data) => {
  player = data;
  players[player] = {up: false, left: false, right: false, shot: false};
  players[player].player = player;
});
// listening for state update
socket.on('state', (data) => {
  players = data;
});
// keyboard handlers
document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
  case 65: // A
      players[player].left = true;
      break;
  case 87: // W
      players[player].up = true;
      break;
  case 68: // D
      players[player].right = true;
      break;
  case 32: // Space
      players[player].shot = true;
      break;
  }
});
document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
  case 65: // A
      players[player].left = false;
      break;
  case 87: // W
      players[player].up = false;
      break;
  case 68: // D
      players[player].right = false;
      break;
    case 32: // Space
      players[player].shot = false;
      break;
  }
});
// Phaser props
const GAME = {
  states: 'game',
  props: {
    Width: 640,
    Height: 480
  },
  assets: {
    player1: {URL: 'static/spaceship.png', name: 'player1'},
    player2: {URL: 'static/spaceship1.png', name: 'player2'},
    bullet: {URL: 'static/bullet.png', name: 'bullet'}
  },
  ship: {
    acceleration: 300,
    drag: 300,
    maxVelocity: 300,
    angularVelocity: 200
  },
  bullet: {
    speed: 400,
    interval: 200,
    lifespan: 2000,
    maxCount: 30,
  }
};
// game setup
gameState = function(game) {
  this.player1;
  this.player2;
  this.bulletGroup;
  this.bulletInterval = 0;
};
gameState.prototype = {
  preload: function() {
    game.load.image( GAME.assets.player1.name, GAME.assets.player1.URL );
    game.load.image( GAME.assets.player2.name, GAME.assets.player2.URL );
    game.load.image( GAME.assets.bullet.name, GAME.assets.bullet.URL );
  },
  update: function() {
    this.movement(players['player1']);
    this.movement(players['player2']);
    game.physics.arcade.collide(this.player1, this.player2, () => {
      console.log('ships collide');
    }, null, this);
    game.physics.arcade.collide([this.player1, this.player2], this.bulletGroup, () => {
      console.log('bullets collide');
    }, null, this);
  },
  initGraphics: function(player, x, y) {
    this[player] = game.add.sprite(x, y, GAME.assets[player].name);
    this[player].angle = -0;
    this[player].anchor.set(.5,.5);
    this.bulletGroup = game.add.group();
  },
  initPhysics: function(player) {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.enable(this[player], Phaser.Physics.ARCADE);
    this[player].body.drag.set(GAME.ship.drag);
    this[player].body.maxVelocity.set(GAME.ship.maxVelocity);
    this.bulletGroup.enableBody = true;
    this.bulletGroup.physicsBodyType = Phaser.Physics.ARCADE;
    this.bulletGroup.createMultiple(GAME.bullet.maxCount, GAME.assets.bullet.name);
    this.bulletGroup.setAll('anchor.x', .5);
    this.bulletGroup.setAll('anchor.y', .5);
    this.bulletGroup.setAll('lifespan', GAME.bullet.lifespan);
  },
  create: function() {
    this.initGraphics('player1', 100, 100);
    this.initGraphics('player2', 300, 300);
    this.initPhysics('player1');
    this.initPhysics('player2');
    game.stage.disableVisibilityChange = true;
    this.player1.body.collideWorldBounds = true;
    this.player2.body.collideWorldBounds = true;
    cursors = game.input.keyboard.createCursorKeys();
  },
  shot: function(player) {
    if(game.time.now > this.bulletInterval) {
      let bullet = this.bulletGroup.getFirstExists(false);
      if(bullet) {
        let length = this[player.player].width * .5;
        let x = this[player.player].x + (Math.cos(this[player.player].rotation) * length);
        let y = this[player.player].y + (Math.sin(this[player.player].rotation) * length);
        bullet.reset(x, y);
        bullet.lifespan = GAME.bullet.lifespan;
        bullet.rotation = this[player.player].rotation;
        game.physics.arcade.velocityFromRotation(this[player.player].rotation, GAME.bullet.speed, bullet.body.velocity);
        this.bulletInterval = game.time.now + GAME.bullet.interval;
      }
    }
  },
  movement: function(player) {
    if(player.left) {
      this[player.player].body.angularVelocity = -GAME.ship.angularVelocity;
    } else {
      player.right ? this[player.player].body.angularVelocity = GAME.ship.angularVelocity : this[player.player].body.angularVelocity = 0;
    }
    player.up ? game.physics.arcade.accelerationFromRotation(this[player.player].rotation, GAME.ship.acceleration, this[player.player].body.acceleration) : this[player.player].body.acceleration.set(0);
    player.shot ? this.shot(player) : null;
    // player.player === 'player1' ? this.player1.position.x = player.x : this.player2.position.x = player.x;
    // player.player === 'player1' ? this.player1.position.y = player.y : this.player2.position.y = player.y;
  }
};
//
let game = new Phaser.Game(GAME.props.width, GAME.props.height, Phaser.auto, 'game');
game.state.add(GAME.states, gameState);
setTimeout(() => {setInterval(() => {
  socket.emit('keyboard', players[player]);
}, 1000/60)}, 2000);
setTimeout(() => {game.state.start(GAME.states)}, 3000);
