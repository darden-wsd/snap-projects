  if (!window.game) {
    window.game={};
  }
  
  var game = window.game;
  game.stage = this;
  game.player = getSprite('player');
  game.maxXPos = 240;
  game.maxYPos = -150;
  game.isJumping = false;
  game.isFalling = false;
  game.isLanded = true;
  game.platforms = [];
  game.jumpUpInterval = 0;
  game.fallingInterval = 0;

  // add as many platforms as needed
  addPlatormSprites();

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
    detectFloating();
  }, 1));
    
  game.intervals.push(setInterval(function() {
    detectPlayerLanding();
  }, 1));
  
  game.intervals.push(setInterval(function(){
    detectCharacterMovement();
  }, 5)); // 24 frames a sec
    
  // character control
  var detectCharacterMovement = function() {
    if ( keys[keys.LEFT] ) {
      if (game.player.xPosition() > -game.maxXPos) {
        game.player.changeXPosition(-1);
      }
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
    if (keys[keys.SPACE] && !game.isJumping && !game.isFalling) {
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
    game.isFalling = false;
    game.isLanded = false;
    var height = 100;
    var speed = 2;
    var speedInc = 0.02;
    var i = 0;
    
    var jumpInterval = setInterval(function() {
      i++;
      game.player.changeYPosition(speed);
      speed -= speedInc;
      if (i > height) {
        clearInterval(jumpInterval);
        doFall();
      }
    }, 1);
  }
  
 function doFall() {
    game.isFalling = true;
    var speed = 0;
    var speedInc = 0.02;
    var fallInterval = setInterval(function() {
      game.isFalling = true;
      game.player.changeYPosition(-speed);
      speed += speedInc;
      if (game.isLanded) {
        clearInterval(fallInterval);
        game.isJumping = false;
        game.isFalling = false;
      }
    }, 1);
  }
  
  var detectPlayerLanding = function() {
    for (var i=0; i < game.platforms.length; i++) {
      if (aIsLanded(game.player, game.platforms[i])) {
        game.isLanded = true;
        // in case the player has fallen through the platform a bit, reposition
        game.player.setBottom(game.platforms[i].top());
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
      var aB = a.bottom();
      var bT = b.top();
      
      // reduce the hitbox on the player
      var aL = a.left() + 2;
      var aR = a.right() - 2;

      var bL = b.left();
      var bR = b.right();
      return (game.isFalling && aB > bT && aB < bT+5 && aR > bL && aL < bR);
  }
  
  var detectFloating = function() {
    if (!game.isLanded) return;
    var playerY = game.player.bottom();
    var isFloating = true;
    var gap = 0;
    for (var i=0; i < game.platforms.length; i++) {
      gap = game.platforms[i].top() - game.player.bottom();
      // are we above a platform and less than 10 units?
      if (gap < 10 && gap > -5 &&
          game.player.right() >= game.platforms[i].left() &&
          game.player.left() <= game.platforms[i].right()) {
        isFloating = false;
        break;
      }
    }
    
    if (isFloating) {
      game.isLanded = false;
      doFall();
    }
  }
