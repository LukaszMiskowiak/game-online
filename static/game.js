let socket = io();


let playersArray = []

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
  }
});
document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
  }
});
let movement = {
  up: false,
  down: false,
  left: false,
  right: false
}
setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);

let states = {
  game: 'game'
};
let gameProperties = {
    screenWidth: 640,
    screenHeight: 480,
};
let graphicAssets = {
  ship: {URL: 'static/spaceship.png', name: 'ship'},
  bullet: {URL: 'static/bullet.png', name: 'bullet'}
};
let shipProperties = {
  startX: gameProperties.screenWidth * 0.5,
  startY: gameProperties.screenHeight * 0.5,
  acceleration: 300,
  drag: 300,
  maxVelocity: 300,
  angularVelocity: 200
};
let bulletProperties = {
  speed: 400,
  interval: 200,
  lifespan: 2000,
  maxCount: 30,
}

let gameState = function (game) {
  this.shipSprite;

  this.key_left;
  this.key_right;
  this.key_up;
  this.key_shot;

  this.bulletGroup;
  this.bulletInterval = 0;
}
gameState.prototype = {
  preload: function () {
    game.load.image( graphicAssets.ship.name, graphicAssets.ship.URL );
    game.load.image( graphicAssets.bullet.name, graphicAssets.bullet.URL );
  },

  update: function () {
    this.checkPlayerInput();
  },

  initGraphics: function () {
    this.shipSprite = game.add.sprite( shipProperties.startX, shipProperties.startY, graphicAssets.ship.name );
    this.shipSprite.angle = -0;
    this.shipSprite.anchor.set( 0.5, 0.5 );
    this.bulletGroup = game.add.group();
  },

  initPhysics: function () {
    game.physics.startSystem( Phaser.Physics.ARCADE );

    game.physics.enable( this.shipSprite, Phaser.Physics.ARCADE );
    this.shipSprite.body.drag.set( shipProperties.drag );
    this.shipSprite.body.maxVelocity.set( shipProperties.maxVelocity );

    this.bulletGroup.enableBody = true;
    this.bulletGroup.physicsBodyType = Phaser.Physics.ARCADE;
    this.bulletGroup.createMultiple( bulletProperties.maxCount, graphicAssets.bullet.name)
    this.bulletGroup.setAll('anchor.x', 0.5);
    this.bulletGroup.setAll('anchor.y', 0.5);
    this.bulletGroup.setAll('lifespan', bulletProperties.lifespan);
  },

  initKeyboard: function () {
    this.key_left = game.input.keyboard.addKey( Phaser.Keyboard.LEFT );
    this.key_right = game.input.keyboard.addKey( Phaser.Keyboard.RIGHT );
    this.key_up = game.input.keyboard.addKey( Phaser.Keyboard.UP );
    this.key_shot = game.input.keyboard.addKey( Phaser.Keyboard.SPACEBAR );
  },

  checkPlayerInput: function () {
    // for (id in playersArray) {
      let player = playersArray[playersArray.length-1];
      // console.log(player);

      if (player.left) this.shipSprite.body.angularVelocity = -shipProperties.angularVelocity;
      else if (player.right) this.shipSprite.body.angularVelocity = shipProperties.angularVelocity;
      else this.shipSprite.body.angularVelocity = 0;

      if (player.up) game.physics.arcade.accelerationFromRotation( this.shipSprite.rotation, shipProperties.acceleration, this.shipSprite.body.acceleration );
      else this.shipSprite.body.acceleration.set( 0 );

      if (player.down) {
        this.shot();
      }

      // if (this.key_left.isDown) this.shipSprite.body.angularVelocity = -shipProperties.angularVelocity;
      // else if (this.key_right.isDown) this.shipSprite.body.angularVelocity = shipProperties.angularVelocity;
      // else this.shipSprite.body.angularVelocity = 0;
      //
      // if (this.key_up.isDown) game.physics.arcade.accelerationFromRotation( this.shipSprite.rotation, shipProperties.acceleration, this.shipSprite.body.acceleration );
      // else this.shipSprite.body.acceleration.set( 0 );
      //
      // if (this.key_shot.isDown) {
      //   this.shot();
      // }
    // }
  },

  shot: function () {
    if (game.time.now > this.bulletInterval) {
      let bullet = this.bulletGroup.getFirstExists(false);
      if (bullet) {
        let length = this.shipSprite.width * 0.5;
        let x = this.shipSprite.x + ( Math.cos(this.shipSprite.rotation) * length );
        let y = this.shipSprite.y + ( Math.sin(this.shipSprite.rotation) * length );

        bullet.reset(x, y);
        bullet.lifespan = bulletProperties.lifespan;
        bullet.rotation = this.shipSprite.rotation;

        game.physics.arcade.velocityFromRotation( this.shipSprite.rotation, bulletProperties.speed, bullet.body.velocity );
        this.bulletInterval = game.time.now + bulletProperties.interval;
      }
    }
  },

  create: function () {
    this.initGraphics();
    this.initPhysics();
    this.initKeyboard();
    game.stage.disableVisibilityChange = true;
  }
}

socket.emit('new player');
socket.emit('movement', movement)
socket.on('state', function(player) {
  playersArray.push(player);
  // for (let id in players) {
  //   playersArray.push(players[id]);
  // }
})




let game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'game');
game.state.add(states.game, gameState);
setTimeout(() => {game.state.start(states.game)}, 3000);
