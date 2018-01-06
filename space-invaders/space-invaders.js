  if (!window.game) {
    window.game={};
  }
  
  var game = window.game;
  game.stage = this;
  // this will empty out all the clones
  game.stage.parent.controlBar.stopButton.hide();
  // get sprites
  game.enemy = getSprite('enemy');
  game.enemyBullet = getSprite('enemyBullet');
  game.player = getSprite('player');
  game.playerBullet = getSprite('playerBullet');
  game.startButton = getSprite('startButton');
  
  game.startButton.wearCostume(game.startButton.costumes.contents[0]);
  game.player.hide();
  game.player.gotoXY(0,-160);
  resetIntervals(game.intervals);
  resetIntervals(game.levelIntervals);
  game.intervals = [];
  game.levelIntervals = [];

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
  
  // character control
  var detectCharacterMovement = function() {
    if ( keys[keys.LEFT] ) {
      if (game.player.xPosition() > -game.maxXPos) game.player.changeXPosition(-10);
    }
    if ( keys[keys.RIGHT] ) {
      if (game.player.xPosition() < game.maxXPos) game.player.changeXPosition(10);
    }
  };
  
  game.intervals.push(setInterval(function(){
    detectCharacterMovement();
  }, 1000/24)); // 24 frames a sec
  
  // character control
  var detectSpaceBar = function() {
    if (keys[keys.SPACE]) {
      for (var i=0;i<game.bullets.length;i++) {
        // find the first hidden bullet and send it off
        var bullet = game.bullets[i];
        if (!bullet.isVisible) {
          bullet.speed = game.bulletSpeed;
          bullet.gotoXY(game.player.xPosition(), game.player.yPosition()+10);
          bullet.show();
          break;
        }
      }
    }
  };
  
  game.intervals.push(setInterval(function() {
    detectSpaceBar();
  }, 100));
  
  game.startButton.mouseEnter = function() {
    game.startButton.wearCostume(game.startButton.costumes.contents[1]);
  };
  
  game.startButton.mouseLeave = function() {
    game.startButton.wearCostume(game.startButton.costumes.contents[0]);
  };

  game.startButton.mouseClickLeft = function() {
    startLevel(false);
  };

  startGame();
  
  function getSprite(spriteName) {
    for (var i=0; i < game.stage.children.length; i++) {
      if (game.stage.children[i].name == spriteName) {
        return game.stage.children[i];
      }
    }
    console.error('not found ' + spriteName);
    return false;
  }
  
  
  function placeEnemies() {
    var rows = 3;
    var cols = game.enemies.length / rows;
    var enemyIndex = 0;
    var y=120;
    var x;

    for (var i = 0; i<rows; i++) {
      x=-199;
      for (var j = 0; j < cols; j++) {
        var enemy = game.enemies[enemyIndex++];
        enemy.gotoXY(x,y);
        game.enemies[i].setHeading(90);
        enemy.isHit = false;
        enemy.show();
        x+=40;
      }
      y-=40;
    }
  }
  
  function startGame() {
    game.level=1;
    game.lives=3;
    game.score=0;
    game.enemyLevelStartSpeed=1;
    game.enemyRowSpeed=game.enemyLevelStartSpeed;


    game.maxXPos = 205;
    game.maxYPos = -150;
    game.isMovingRight=true;
    game.lives=3;
    game.enemyCount=24; // make this miltiples of 3 so we can always have 3 rows
    game.bulletCount=3;
    game.bulletSpeed=10;
    
    game.player.hide();
    game.enemyBullet.hide();
    game.startButton.show();
    hideEnemies();
    wipeScreen("#000000");
    drawText('SPACE', 80, "#FFFFFF", 240, 60);
    drawText('INVADERS', 50, "#00e600", 240, 100);
  }
  
  function cleanupClones() {
    
    for (var i=game.stage.children.length - 1; i>-1; i--) {
      var child = game.stage.children[i];
      if (child instanceof SpriteMorph &&
          child.name.indexOf('gameClone')===0)
            game.stage.children.splice(i,1);
    }
    game.enemies = [];
    game.bullets = [];
  }

  function endGame() {
    resetIntervals(game.levelIntervals);
    resetIntervals(game.intervals);
    game.intervals = [];
    game.levelIntervals = [];
    
    game.startButton.hide();
    game.enemyBullet.hide();
    wipeScreen("#000000");
    

    // create a fresh copy of the enemy clones
    cleanupClones();
    drawScoreBoard();
    drawText('Game Over', 50, '#FFFFFF', 240,120);
  }

  function startLevel(playerHit) {
    resetIntervals(game.levelIntervals);
    game.isMovingRight=true;
    game.startButton.hide();
    game.enemyBullet.hide();
    wipeScreen("#000000");
    
    // create a fresh copy of the enemy clones
    cleanupClones();

    for (var i = 0; i<game.enemyCount; i++) {
      var c = game.enemy.newClone();
      c.name="gameCloneEnemy_" + i;
      c.index = i;
      game.enemies.push(c);
    }
    

    for (var i = 0; i<game.bulletCount; i++) {
      var c = game.playerBullet.newClone();
      c.name="gameCloneBullet_" + i;
      c.index = i;
      game.bullets.push(c);
    }

    setTimeout(function() {
        if (playerHit) {
          drawText("You're hit!", 30, '#FFFFFF', 240,90);
          drawText("Level is reset.", 30, '#FFFFFF', 240,120);
          game.enemyRowSpeed=game.enemyLevelStartSpeed;
        } else {
          drawText('Level ' + game.level, 50, '#FFFFFF', 240,120);
        }
        setTimeout(function() {
            wipeScreen("#000000");
            drawScoreBoard();
            game.player.show();
            placeEnemies();
            spinEnemies();
            game.levelIntervals.push(setInterval(startRandomEnemyFire, 3000));
            game.monitorNextLevelInterval = setInterval(monitorNextLevel, 3000);
            game.levelIntervals.push(game.monitorNextLevelInterval);
            setTimeout(function() {
              game.moveInterval = setInterval(moveEnemiesX, 50);
              game.levelIntervals.push(game.moveInterval);
            }, 100);
        }, 2000);
    }, 1);
  }
  
  function monitorNextLevel() {
    if (allEnemiesAreDead()) {
      game.enemyLevelStartSpeed+=.5;
      game.enemyRowSpeed = game.enemyLevelStartSpeed;
      game.level++;
      startLevel(false);
    }
  }
  
  function wipeScreen(color) {
    ctx = game.stage.penTrails().getContext('2d');
    ctx.save();
    ctx.rect(0,0,480,480);
    ctx.fillStyle = color;
    ctx.fill();
    game.stage.changed();
  }
  
  // size=18, color="#00e600", text='hello world',
  // xy is the center of the text
  function drawText(text, size, color, x, y) {
    ctx = game.stage.penTrails().getContext('2d');
    ctx.save();
    ctx.font = 'bold ' + size + 'px monospace';
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(text,x,y);
    game.stage.changed();
  }

  function drawScoreBoard() {
    var text = 'Lives:' + game.lives + '   Score:' +
      game.score + '   Level:' + game.level;
    ctx = game.stage.penTrails().getContext('2d');
    ctx.save();
    ctx.beginPath();
    ctx.rect(0,0, 480,35);
    ctx.fillStyle = "#000000";
    ctx.fill();
    game.stage.changed();
    drawText(text, 18, "#FFFFFF", 240, 20)
  }
  
  function hideEnemies() {
    if (game.enemies && game.enemies.length > 0) {
      for (var i=0; i<game.enemies.length;i++) {
        game.enemies[i].isHit = true;
        game.enemies[i].hide();
      }
    }
  }
  
  function spinEnemies() {
    for (var i=0; i<game.enemies.length;i++) {
      var randomTime = 100; // between 500 and 10000
      var randomDistance = Math.floor(Math.random() * 20) + 1; // between 0 and 20
      var enemy = game.enemies[i];
      game.intervals.push(setInterval(spinEnemy, randomTime, enemy, randomDistance));
    }
  }
  
  function spinEnemy(enemy, distance) {
    if (enemy.isVisible) enemy.turn(distance);
  };
  
  function doSwitchDirection() {
    for (var i=0; i<game.enemies.length;i++) {
      var enemy = game.enemies[i];
      if (!enemy.isVisible) continue;
      if (Math.abs(enemy.xPosition()) + game.enemyRowSpeed > game.maxXPos) {
        return true;
      }
    }
    return false;
  }
  
  function moveEnemiesX() {
    if (doSwitchDirection()) {
      game.isMovingRight = !game.isMovingRight;
      game.enemyRowSpeed+=.5;
      moveEnemiesY(-30);
    }
    
    for (var i=0; i<game.bullets.length;i++) {
      var bullet = game.bullets[i];
      if (!bullet.isVisible) continue;
      bullet.changeYPosition(bullet.speed);
      bullet.speed += .5;
      if (bullet.yPosition() > 180) bullet.hide();
    }
    
    for (var i=0; i<game.enemies.length;i++) {
      var enemy = game.enemies[i];
      if (!enemy.isVisible) continue;

      for (var j=0; j<game.bullets.length;j++) {
        var b = game.bullets[j];
        if (!b.isVisible) continue;
        var bPt = new Point(b.xPosition(), b.yPosition());
        var ePt = new Point(enemy.xPosition(), enemy.yPosition());
        // see if we are hit
        if (
              bPt.x < ePt.x + 15 &&
              bPt.x > ePt.x - 15 &&
              bPt.y > ePt.y - 15 &&
              bPt.y < ePt.y + 15
            ) {
          enemy.hide();
          enemy.isHit = true;
          b.hide();
          game.score+=10;
          drawScoreBoard();
          break;
        }
      }

      if (game.isMovingRight) {
        enemy.changeXPosition(game.enemyRowSpeed);
      } else {
        enemy.changeXPosition(-game.enemyRowSpeed);
      }
    }
  }
  
  function moveEnemiesY(distance) {
    for (var i=0; i<game.enemies.length;i++) {
      var enemy = game.enemies[i];
      if (!enemy.isVisible) continue;
      enemy.changeYPosition(distance);
      if (enemy.yPosition() <= game.maxYPos) {
        clearInterval(game.moveInterval);
        clearInterval(game.monitorNextLevelInterval);
        game.lives--;
        if (game.lives==0) {
          endGame();
        } else {
          startLevel(true); // true means enemy hit player
        }
        break;
      }
    }
  }

  function allEnemiesAreDead() {

    for (var i=0; i<game.enemies.length; i++) {
      if (!game.enemies[i].isHit) return false;
    }
    return true;
  }
  
  function getDistance(p1, p2) {
    return Math.sqrt((Math.pow(p2.y-p1.y,2))+(Math.pow(p2.x-p1.x,2)));
  }
  
  function removeChildClone(clone) {
    for (var i=game.stage.children.length-1; i>-1; i--) {
      if (clone === game.stage.children[i]) game.stage.children.splice(i,1);
    }
  }
  
  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }
  
  function Point(x, y) {
    this.x = x;
    this.y = y;
  }

  function getRandomLiveEnemy() {
    var liveEnemies = [];
    for (var i = game.enemies.length -1; i > -1; i--) {
      var enemy = game.enemies[i];
      if (enemy.isHit) continue;
      liveEnemies.push(enemy);
    }
    
    if (liveEnemies.length == 0) return false;
    var n = Math.floor(Math.random() * liveEnemies.length) + 1; // random number starting at 1
    return liveEnemies[n-1];
  }
  
  function startRandomEnemyFire() {
    var enemy = getRandomLiveEnemy();
    if (!enemy) return;
    
    game.enemyBullet.gotoXY(enemy.xPosition(), enemy.yPosition());
    game.enemyBullet.show();
    var vi = setInterval(function() {
      if (game.enemyBullet.yPosition() > -240) {
        game.enemyBullet.changeYPosition(-3);
        if (
            game.enemyBullet.xPosition() < game.player.xPosition() + 15 &&
            game.enemyBullet.xPosition() > game.player.xPosition() - 15 &&
            game.enemyBullet.yPosition() < game.player.yPosition()
        ) {
          clearInterval(vi);
          game.lives--;
          if (game.lives==0) {
            endGame();
          } else {
            clearInterval(game.monitorNextLevelInterval);
            clearInterval(game.moveInterval);
            startLevel(true); // true means enemy hit player
          }
        }
      }
    }, 1);
    
    setTimeout(function() {
      clearInterval(vi);
      game.enemyBullet.hide();
      
    }, 1000);
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
  
