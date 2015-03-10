<html>
    <head>
    <script type="text/javascript" src="/static/js/jquery-1.7.min.js"></script>
    <script type="text/javascript" src="/static//js/jquery.tools.min.js"></script>
    <script type="text/javascript" src="/static/js/kinetic-v3.9.4.min.js"></script>
    <link rel="stylesheet" href="/static/css/pong.css" type="text/css" />
    <script type="text/javascript">
        
        /* game class */
        function Game(stage, foregroundLayer, player, opponent, ball) {
            this.stage = stage;
            this.foregroundLayer = foregroundLayer;
            this.level = 1;
            this.player = player;
            this.opponent = opponent,
            this.ball = ball;
            this.scoreMessages = new Array();
            this.running = false;
            this.turn = 1; // 1: player, 0: opponent
            this.over = false;
        };
        
        Game.prototype.stop = function() {
            this.running = false;
            this.stage.stop();
        };
        
        Game.prototype.start = function() {
            this.running = true;
            this.stage.start();
        };
        
        Game.prototype.levelUp = function(){
            var fl = this.foregroundLayer;
            var message = new Kinetic.Text({
                x : 350,
                y : 300,
                fontSize : 15,
                fontFamily : 'Calibri',
                text : 'Level Up',
                textFill : 'white'
            });
            this.scoreMessages.push(message);
            this.foregroundLayer.add(message);
            this.ball.levelUp(this.player);
            this.player.levelUp(100*this.level, this);
            this.level += 1;
            this.turn = 1;
            this.opponent.levelUp();
            this.resume(this.player.attrs.x + 15);                
        };
        
        Game.prototype.lifeLost = function(){
            if (this.player.lives > 0) {
                this.player.lifeLost();
                var message = new Kinetic.Text({
                    x : 350,
                    y : 300,
                    fontSize : 15,
                    fontFamily : 'Calibri',
                    text : '-1 life',
                    textFill : 'white'
                });
                this.scoreMessages.push(message);
                this.foregroundLayer.add(message);
            };
            this.opponent.lifeLost();
            this.ball.lifeLost(this.opponent);
            this.turn = 0;
            this.resume();            
        };
        
        Game.prototype.resume = function() {
            
                if (this.player.lives > 0) {
                    
                } else {
                    
                    this.stop();
                    for (i in this.scoreMessages){
                        this.foregroundLayer.remove(
                            this.scoreMessages[i])
                    };
                    var mbg = new Kinetic.Rect({
                        x : 260,
                        y : 250,
                        width: 300,
                        height: 120,
                        fill : '#666',
                        alpha : 0.9
                    });
                    var message = new Kinetic.Text({
                        x : 350,
                        y : 285,
                        fontSize : 14,
                        fontFamily : 'Calibri',
                        text : 'GAME OVER',
                        textFill : 'white'
                    });
                    var restart = new Kinetic.Text({
                        x : 320,
                        y : 310,
                        fontSize : 13,
                        fontFamily : 'Calibri',
                        text : 'press <F5> to restart',
                        textFill : 'white'
                    });
                    
                    $('#score').val(this.player.points);
                    $('#highscoreform').overlay({
                        load : true,
                        mask : {
                            color : 'black'
                        }
                    })
                    this.over = true;
                    this.foregroundLayer.add(mbg);
                    this.foregroundLayer.add(message);
                    this.foregroundLayer.add(restart);
                };
        };
        
        /* player class */
        function Player() {
            var config = {
                fill: 'white',
                x : 50,
                y : 300,
                width: 15,
                height: 60
            };
            Kinetic.Rect.call(this, config);
            this.speed = 4;
            this.lives = 3;
            this.points = 0;
            this.name = 'Player';
        };
        Player.prototype = new Kinetic.Rect({});
        Player.prototype.constructor = Player;
        
        Player.prototype.moveDown = function(playerSpeed) {
            if (this.attrs.y < 570) {
                this.attrs.y += this.speed;
            };
        };
        
        Player.prototype.moveUp = function(playerSpeed) {
            if (this.attrs.y > -30)
            this.attrs.y -= this.speed;
        };

        Player.prototype.moveLeft = function(playerSpeed) {
            if (this.attrs.x > 0) {
                this.attrs.x -= this.speed;
            };
        };

        Player.prototype.moveRight = function(playerSpeed) {
            if (this.attrs.x < 385) {
                this.attrs.x += this.speed;
            };
        };            
        
        Player.prototype.score = function(points, game){
            this.points += points;
            var scoreText = new Kinetic.Text({
                x : this.attrs.x,
                y : this.attrs.y+10,
                text : points,
                textFill : 'white',
                fontFamily : 'Calibri',
                fontSize : 15
            });
            game.scoreMessages.push(scoreText);
            game.foregroundLayer.add(scoreText);
        };
    
        Player.prototype.levelUp = function(points, game){
            this.speed += 1;
            this.score(points, game);
        };
    
        Player.prototype.lifeLost = function() {
            this.lives -= 1;
        };
        
        /* opponent class */
        function Opponent() {
            var config = {
                fill: 'white',
                x : 735,
                y : 300,
                width: 15,
                height: 60
            };
            Kinetic.Rect.call(this, config);
            this.speed = 4;
            this.moveTo = undefined;
            this.name = 'Opponent';
        };
        Opponent.prototype = new Kinetic.Rect({});
        Opponent.prototype.constructor = Opponent;
        
        Opponent.prototype.move = function(game, ball) {
            var new_y = undefined;
            
            // moving ball
            if (ball.speed > 0) {
                if (ball.attrs.x >= 425) {
                   new_y = ball.attrs.y; 
                } else { new_y = 300 };
                
                if (this.attrs.y < new_y) {
                    this.attrs.y += this.speed;
                } else if (this.attrs.y > new_y) {
                    this.attrs.y -= this.speed;
                }
                
            // opponents turn
            } else if (game.turn == 0) {
                if (this.moveTo > 0){
                    if (this.attrs.y < this.moveTo) {
                        this.attrs.y += this.speed;
                    } else {
                        this.attrs.y -= this.speed;
                    };
                    ball.setOnPlayerPosition(this);
                    this.moveTo -= this.speed;
                } else {
                    $('#ping')[0].play();
                    ball.start();
                };
            };
        };
        
        Opponent.prototype.levelUp = function(){
            this.speed += 1;
        };
        
        Opponent.prototype.lifeLost = function(){
            this.moveTo = parseInt(Math.random()*400);
        };
        
        /* ball class */
        function Ball() {
            var config = {
                radius : 10,
                fill : 'white',
                x : 75,
                y : 330
                
            };
            Kinetic.Circle.call(this, config);
            this.speed = 4;
            this.regularSpeed = 4;
            this.direction = { x: -1, y: -1 };
            
        };
        Ball.prototype = new Kinetic.Circle({});
        Ball.prototype.constructor = Ball;
        
        Ball.prototype.move = function(game, player, opponent){
            if (this.attrs.x <= 0) {
                game.lifeLost();
            }
            
            else if (this.attrs.x >= 800 ) {
                game.levelUp();
            }
            
            else if (this.speed > 0 && this.attrs.y <= 0 || this.speed > 0 && this.attrs.y >= 600) {
                this.direction.y = this.direction.y * (-1)
            }
            
            else if (this.speed > 0 && player.intersects(this.getPosition()) ||
                     this.speed > 0 && opponent.intersects(this.getPosition())) {
                
                $('#ping')[0].play();
                this.direction.x = this.direction.x * (-1);
                
                if (player.intersects(this.getPosition())) {
                    player.score(10*game.level, game);
                    this.attrs.x += 15;
                
                } else {
                    this.attrs.x -= 15;
                
                };
                
            } else if (this.speed == 0 && game.turn == 1){
                this.setOnPlayerPosition(player);
            };
            this.attrs.x += this.speed * this.direction.x;
            this.attrs.y += this.speed * this.direction.y;
        };
        
        Ball.prototype.start = function(){
            this.speed = this.regularSpeed;
        };
        
        Ball.prototype.stop = function(){
            this.speed = 0;
        };
        
        Ball.prototype.setOnPlayerPosition = function(side) {
            if (side.name == 'Player') {
                var x = 25;
            } else {
                var x = -10;
            };
            var x = side.getPosition().x + x;
            var y = side.getPosition().y + 30;
            this.setPosition({x : x, y : y});
        };
        
        Ball.prototype.levelUp = function(player) {
            this.speed += 1;
            this.regularSpeed += 1;
            this.stop();
            this.setOnPlayerPosition(player);
        };
        
        Ball.prototype.lifeLost = function(opponent) {
            this.stop();
            this.setOnPlayerPosition(opponent);
        };
   
        function initStage(){
            
            var stage = new Kinetic.Stage({
                container : "board",
                width: 800,
                height: 600
            })
            
            // background
            var backgroundLayer = new Kinetic.Layer();
            var background = new Kinetic.Rect({
                fill: 'black',
                x : 0,
                y : 0,
                width : 800,
                height : 600
            });
            
            var middleLine = new Kinetic.Group();
            for (var y = 0; y <= 700; y += 38.7) {
                var linePart = new Kinetic.Rect({
                    x : 398,
                    y : y,
                    width : 4,
                    height : 19.5,
                    fill : 'white'
                });
                middleLine.add(linePart);
            };
            
            backgroundLayer.add(background);
            backgroundLayer.add(middleLine);
            
            // foreground
            var foregroundLayer = new Kinetic.Layer();
            
            // player
            var player = new Player();
            foregroundLayer.add(player);
            
            // computer
            var opponent = new Opponent();
            foregroundLayer.add(opponent);
            
            // ball
            var ball = new Ball();
            foregroundLayer.add(ball);
            
            // game obj
            var game = new Game(stage, foregroundLayer,
                player, opponent, ball);
            
            // scoreboard
            var textLives = new Kinetic.Text({
                x : 0,
                y : 0,
                text : 'Lives: '+player.lives,
                textFill : 'white',
                padding : 5,
                fontSize : 8
            });
            foregroundLayer.add(textLives);
            
            var textLevel = new Kinetic.Text({
                x : 50,
                y : 0,
                text : 'Level :'+game.level,
                textFill: 'white',
                padding : 5,
                fontSize : 8                
            });
            foregroundLayer.add(textLevel);
            
            var textScore = new Kinetic.Text({
                x: 100,
                y : 0,
                text : 'Score: '+player.points,
                textFill : 'white',
                padding : 5,
                fontSize : 8                
            });
            foregroundLayer.add(textScore);
            
            var welcomeScreen = new Kinetic.Group();
            var wbg = new Kinetic.Rect({
                        x : 260,
                        y : 230,
                        width: 290,
                        height: 120,
                        fill : '#666',
                        alpha: 0.9
            });
            var controlsHead = new Kinetic.Text({
                        x : 295,
                        y : 245,
                        fontSize : 12,
                        fontFamily : 'Calibri',
                        text : 'controls:',
                        textFill : 'white'
            });            var controls = new Kinetic.Text({
                        x : 295,
                        y : 265,
                        fontSize : 12,
                        fontFamily : 'Calibri',
                        text : 'use w,a,s,d or arrows to move',
                        textFill : 'white'
            });
            var controlsBall = new Kinetic.Text({
                        x : 295,
                        y : 285,
                        fontSize : 12,
                        fontFamily : 'Calibri',
                        text : 'SPACE starts the ball',
                        textFill : 'white'
            });            
            var start = new Kinetic.Text({
                        x : 295,
                        y : 315,
                        fontSize : 13,
                        fontFamily : 'Calibri',
                        text : 'press SPACE to start game',
                        textFill : 'white'
            });
            welcomeScreen.add(wbg);
            welcomeScreen.add(controlsHead);
            welcomeScreen.add(controls);
            welcomeScreen.add(controlsBall);
            welcomeScreen.add(start);
            foregroundLayer.add(welcomeScreen);
            
            stage.add(backgroundLayer);
            stage.add(foregroundLayer);
            
            // key events
            var input = {};
            document.addEventListener('keydown', function(e){
                
                if (game.running == true) {
                    e.preventDefault();
                };
                
                input[e.which] = true;
                
                // start game
                if (input[32] == true && game.over == false) {
                    e.preventDefault();
                    if (game.running == false) {
                        foregroundLayer.remove(welcomeScreen);
                        game.start();
                        game.ball.stop();
                        game.ball.setOnPlayerPosition(game.player);
                    } else {
                        if (game.turn == 1) {
                            game.ball.start();
                        };
                    };
                };
                
            });
            document.addEventListener('keyup', function(e){
                input[e.which] = false;
            });
            
            stage.onFrame(function(){
                if (input[40] == true || input[83] == true) {
                    player.moveDown();
                } else if (input[38] == true || input[87] == true ) {
                    player.moveUp();
                } else if (input[37] == true || input[65] == true) {
                    player.moveLeft(); 
                } else if (input[39] == true || input[68] == true) {
                    player.moveRight();
                }; 
                opponent.move(game, ball);
                ball.move(game, player, opponent);
                for ( i in game.scoreMessages ) {
                    game.scoreMessages[i].attrs.y -= 5;
                    game.scoreMessages[i].setAlpha(
                        game.scoreMessages[i].attrs.alpha - 0.01);
                };
                // refresh scoreboard
                textLives.attrs.text = 'Lives: '+player.lives;
                textLevel.attrs.text = 'Level: '+game.level;
                textScore.attrs.text = 'Score: '+player.points;
                foregroundLayer.draw();
            });
            
        }; 
        
        $(function(){
            initStage();
        });
        
    </script>    
    </head>
    <body>
        <audio id="ping">
            <source src="/site_media/sfx/hit-pipe.wav" type="audio/wav" />
        </audio>
        <div id="board"></div>
        <div id="highscore">
            <h2>Comments</h2>
            <ul> </ul>
        </div>
        <div id="highscoreform">
            <form action="/utils/save_highscore/" method="post">
                <input type="hidden" id="score" value="" name="score" />
                <label>Your name: </label><input type="text" name="name" /><br />
                <label>Your comment: </label><textarea name="comment"></textarea><br />
                <label>&nbsp;</label><input type="submit" value="submit" />
                <input type='hidden' name='csrfmiddlewaretoken' value='2lg9A9OR6PPBBhgH44EPZa7edY4tKDMY' />
            </form> 
        </div>
        
        <script type="text/javascript">
        
          var _gaq = _gaq || [];
          _gaq.push(['_setAccount', 'UA-4428239-8']);
          _gaq.push(['_trackPageview']);
        
          (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
          })();
        
        </script>        
        
    </body>
</html>
