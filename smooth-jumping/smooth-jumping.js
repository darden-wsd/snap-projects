  if (!window.game) {
    window.game={};
  }
  
  var game = window.game;
  game.stage = this;
  game.player = getSprite('player');
  game.maxXPos = 205;
  game.maxYPos = -150;
  game.isJumping = false;
  game.platforms = [];
  game.jumpUpInterval = 0;
  game.fallingInterval = 0;
  game.playerLanded = false;
  
  // add as many platforms as needed
  addPlatormSprites();
  // game.platforms.push(getSprite('platform1'));
  // game.platforms.push(getSprite('platform2'));
  // game.platforms.push(getSprite('platform3'));
  // game.platforms.push(getSprite('platform4'));
  // game.platforms.push(getSprite('platform5'));

  resetIntervals(game.intervals);
  game.intervals = [];
  
  
  // setup keyboard events
  var keys = {};
  keys.SPACE = 32;
  keys.LEFT = 37;
  keys.RIGHT = 39;
  document.body.onkeyup =
  document.body.onkeydown = function(e) {
    var kc = e.keyCode || e.which;
    keys[kc] = e.type == 'keydown';
  };
  
  game.intervals.push(setInterval(function() {
    detectPlayerLanding();
  }, 1));
  
  game.intervals.push(setInterval(function(){
    detectCharacterMovement();
  }, 5)); // 24 frames a sec
    
  // character control
  var detectCharacterMovement = function() {
    if ( keys[keys.LEFT] ) {
      if (game.player.xPosition() > -game.maxXPos) game.player.changeXPosition(-1);
    }
    if ( keys[keys.RIGHT] ) {
      if (game.player.xPosition() < game.maxXPos) game.player.changeXPosition(1);
    }
  };

  game.intervals.push(setInterval(function() {
    detectSpaceBar();
  }, 100));
  
  // character control
  var detectSpaceBar = function() {
    if (keys[keys.SPACE] && !game.isJumping) {
      doJump();
    }
  };


  // add all the platform sprites to our array
  function addPlatormSprites(spriteName) {
    for (var i=0; i < game.stage.children.length; i++) {
      if (game.stage.children[i].name.indexOf("platform_") === 0) {
        game.platforms.push(game.stage.children[i]);
      }
    }
  }

  
  function getSprite(spriteName) {
    for (var i=0; i < game.stage.children.length; i++) {
      if (game.stage.children[i].name == spriteName) {
        return game.stage.children[i];
      }
    }
    console.error('not found ' + spriteName);
    return false;
  }
 
  
  function resetIntervals(iv) {
    try {
      if (iv && iv.length > 0) {
        for (var i=iv.length -1; i>-1; i--) {
          clearInterval(iv[i]);
          iv.pop();
        }
      }
    } catch (e) {
      console.error("error while trying to clear the intervals array", e);
    }
  }
  
  
 function doJump() {
    game.isJumping = true;
    var height = 100;
    var speed = 2;
    var speedInc = 0.02;
    var i = 0;
    
    var jumpInterval1 = setInterval(function() {
      i++;
      game.player.changeYPosition(speed);
      speed -= speedInc;
      if (i > height) {
        clearInterval(jumpInterval1);
        i = 0;
        speed += speedInc;
        game.player.changeYPosition(-speed);
        var jumpInterval2 = setInterval(function() {
          i++;
          game.player.changeYPosition(-speed);
          speed += speedInc;
          if (game.playerLanded) {
            clearInterval(jumpInterval2);
            game.isJumping = false;
          }
        }, 1);
      }
    }, 1);
  }
  
  var detectPlayerLanding = function() {
    game.playerLanded = false;
    for (var i=0; i < game.platforms.length; i++) {
      if (aIsLanded(game.player, game.platforms[i])) {
        game.playerLanded = true;
        // in case the player has fallen through the platform a bit, reposition
        // var platformHeight =
        var platformHeight = (game.platforms[i].bounds.corner.y - game.platforms[i].bounds.origin.y) / 2;
        var playerHeight = (game.player.bounds.corner.y - game.player.bounds.origin.y) / 2;
        // ((game.player.penBounds.corner.y - game.player.penBounds.origin.y) / 2);
        // +
        // ((game.platforms[i].penBounds.corner.y - game.platforms[i].penBounds.origin.y) / 2);
        game.player.setYPosition(game.platforms[i].yPosition() + playerHeight + platformHeight + 1);
        break;
      }
    }
  };
  
  
  /* detect if a is touching the top of b */
  function aIsLanded(a, b) {
      // a = player
      // b = platform
      // B = bottom
      // T = top
      // L = left
      // R = Right
      var aB = a.bounds.corner.y;
      var bT = b.bounds.origin.y;
      
      // reduce the hitbox on the player
      var aL = a.bounds.origin.x + 2;
      var aR = a.bounds.corner.x - 2;

      var bL = b.bounds.origin.x;
      var bR = b.bounds.corner.x;
      return (aB > bT && aB < bT+5 && aR > bL && aL < bR);
  }
