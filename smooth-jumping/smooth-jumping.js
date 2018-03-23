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
  game.platforms.push(getSprite('platform1'));
  game.platforms.push(getSprite('platform2'));
  game.platforms.push(getSprite('platform3'));
  game.platforms.push(getSprite('platform4'));
  game.platforms.push(getSprite('platform5'));

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
        break;
      }
    }
  };
  
  
  /* detect if a is touching the top of b */
  function aIsLanded(a, b) {
      var aB = a.bounds.corner.y;
      var bT = b.bounds.origin.y;
      
      // reduce the hitbox on the player
      var aL = a.bounds.origin.x + 5;
      var aR = a.bounds.corner.x - 5;

      var bL = b.bounds.origin.x;
      var bR = b.bounds.corner.x;
      
      return (aB > bT && (aR > bL && aL < bR));
  }
