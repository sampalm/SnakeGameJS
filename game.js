var canvas, ctx, snake, food, foodSpawn, tileScale, playing, W, H, FPS;
		var globalTouch = [], offset = [];
		var playLabel, pointLabel, score;

		var key = {
			up: 87,
			right: 68,
			down: 83,
			left: 65
		}

		window.addEventListener("touchstart", touchStart);
		window.addEventListener("touchmove", touchMove);
		window.addEventListener("touchend", touchEnd);
		window.addEventListener("keydown", keyDown);
		window.addEventListener("resize", resizeWindow);

		function touchStart(e){
			e.preventDefault();

			var touch = e.touches[0];
			globalTouch = [touch.pageX, touch.pageY];

		}
		function touchMove(e){
			var touch = e.touches[0];

			offset = [touch.pageX - globalTouch[0], touch.pageY - globalTouch[1]];
		}
		function touchEnd(e){
			if(Math.abs(offset[0]) > Math.abs(offset[1]))
				snake.direction = [offset[0] / Math.abs(offset[0]), 0];

			else 
				snake.direction = [0, offset[1] / Math.abs(offset[1])];
		}

		function keyDown(e){

			if(!playing && (e.keyCode == key.up || e.keyCode == key.right || e.keyCode == key.down || e.keyCode == key.left))
				playing = true;

			if(e.keyCode == key.up && snake.direction[1] != 1){
				snake.direction = [0, -1];
			}
			else if(e.keyCode == key.right && snake.direction[0] != -1){
				snake.direction = [1, 0];
			}
			else if(e.keyCode == key.down && snake.direction[1] !=  -1){
				snake.direction = [0, 1];
			}
			else if(e.keyCode == key.left && snake.direction[0] != 1){
				snake.direction = [-1, 0];
			}


		}

		//Redimensiona o tamanho da janela
		function resizeWindow(){
			//Recupera o tamanho da janela
			W = window.innerWidth;
			H = window.innerHeight;

			//Seta canvas com o tamanho da janela
			canvas.width = W;
			canvas.height = H;

			tileScale = Math.max(Math.floor(W / 60), Math.floor(H / 60));
		}

		//Verifica se é um dispositivo móvel
		function isMobileDevice(){
			return /Android|iPhone|iPad|Windows Phone/i.test(navigator.userAgent);
		}

		function growSnake(){
			//snake.body.push([snake.body[2][0] + 0, snake.body[2][1] + 1]);
			snake.body.push(food.body);
		}

		function pickedFood(){
			var posX = snake.body[0][0] - food.body[0];
			var posY = snake.body[0][1] - food.body[1];
			if(posX == 0 && posY == 0){
				food.body = [Math.floor(Math.random() * (W / tileScale)), Math.floor(Math.random() * (H/ tileScale))];
				growSnake();
				pointLabel.update(50);
			}
		}

		//Inicia a configuração do jogo
		function init(){
			//Instanceia a canvas
			canvas = document.createElement("canvas");
			resizeWindow();
			FPS = 15;

			document.body.appendChild(canvas);
			ctx = canvas.getContext("2d");

			//...
			newGame();
			run();
		}

		function newGame(){
			score = 0;
			snake = new Snake();
			food = new Food();
			playLabel = new PlayLabel();
			pointLabel = new PointLabel();
			playing = false;
			foodSpawn = false;
		}

		function PointLabel(){
			this.color = "#627d01";

			this.update = function(p){
				if(!p)
					score++;
				else 
					score = score + p;
			}

			this.draw = function(){
				ctx.fillStyle = this.color;
				ctx.font = tileScale + "px 'Press Start 2P', cursive";
			}

		}

		function PlayLabel(){
			this.text;
			this.color = "#627d01";

			this.messages = {
				portrait: "Rotacione o dispositivo para pode jogar",
				landscape: "Arraste a tela para jogar",
				pc: "Pressione A,S,D,W para jogar",
				dev: "Em desenvolvimento..."
			};

			if(isMobileDevice()){
				this.text = this.messages["dev"];
			}
			else {
				this.text = this.messages["pc"];
			}

			this.draw = function(){
				ctx.fillStyle = this.color;
				ctx.font = tileScale + "px 'Press Start 2P', cursive";
				ctx.fillText(this.text, W / 2 - ctx.measureText(this.text).width / 2, H / 2);
			}
		}

		function Food(){
			var foodX = Math.floor(Math.random() * (W / tileScale));
			var foodY = Math.floor(Math.random() * (H / tileScale));
			this.color = "#F00";

			this.spawn = function(){
				for(var i = 0; i < snake.body.length; i++){
					if(foodX != snake.body[i][0] && foodY != snake.body[i][1]){
						return [foodX, foodY];
					} else {
						this.spawn();
					}
				}
			}

			this.body = this.spawn(); 

			this.draw = function(){
				foodSpawn = true;
				ctx.fillStyle = this.color;
				ctx.fillRect(this.body[0] * tileScale, this.body[1] * tileScale, tileScale, tileScale);
			}
		}

		function Snake(){
			this.body = [[10, 10], [10, 11], [10, 12]];
			this.color = "#253102";
			this.direction = [0, -1];

			this.update = function(){
				var nextPos = [this.body[0][0] + this.direction[0], this.body[0][1] + this.direction[1]];

				//Verifica se player esta "jogando" e cria um loop com a Snake
				if(!playing){
					//Snake anda para a direita
					if (this.direction[1] == -1 && nextPos[1] <= (H * 0.1/ tileScale)){
						this.direction = [1, 0];
					} 
					//Snake anda para baixo
					else if (this.direction[0] == 1 && nextPos[0] >= (W * 0.9/ tileScale)){
						this.direction = [0, 1];
					}
					//Snake anda para a direita
					else if (this.direction[1] == 1 && nextPos[1] >= (H * 0.9/ tileScale)){
						this.direction = [-1, 0];
					}
					//Snake anda para cima
					else if (this.direction[0] == -1 && nextPos[0] <= (W * 0.1/ tileScale)){
						this.direction = [0, -1];
					}
				}

				//Remove a ultima parte da calda
				this.body.pop();

				//Adiciona uma nova parte no inicio
				this.body.splice(0, 0, nextPos);

				//Verifica se player ultrapassou o limite da borda
				//Top Border
				if (snake.direction[1] == -1 && nextPos[1] < 0 || snake.direction[0] == 1 && nextPos[0] >= (W / tileScale) || snake.direction[1] == 1 && nextPos[1] >= (H / tileScale) || snake.direction[0] == -1 && nextPos[0] < 0){
					alert("FIM DE JOGO! \nSCORE: " + score);
					newGame();
				} 

				//Verifica se player atingiu o proprio corpo
				for(var i = 1; i < this.body.length; i++){
					if(nextPos[0] == this.body[i][0] && nextPos[1] == this.body[i][1]){
						alert("FIM DE JOGO! \nSCORE: " + score);
						newGame();
					}
				}

			}

			this.draw = function(){
				ctx.fillStyle = this.color;

				for(var i = 0; i < this.body.length; i++){
					ctx.fillRect(this.body[i][0] * tileScale, this.body[i][1] * tileScale, tileScale, tileScale);
				}

			}
		}

		//Atualiza as informações do jogo
		function update(){
			snake.update();
			pickedFood();
		}

		function run(){
			update();
			draw();

			setTimeout(run, 1000 / FPS);
		}

		function draw(){
			ctx.clearRect(0, 0, W, H);

			snake.draw();

			if(!playing){
				playLabel.draw();
			}
			else {
				food.draw();
				pointLabel.update();
				pointLabel.draw();

				//Imprime o Score na Tela
				if (score < 10){
					ctx.fillText("Score: 0000" + score, W / 2 - ctx.measureText("Score: " + score).width / 2, H);
				}
				else if (score > 10 && score < 100) {
 					ctx.fillText("Score: 000" + score, W / 2 - ctx.measureText("Score: " + score).width / 2, H);
				}
				else if (score > 100 && score < 1000){
					ctx.fillText("Score: 00" + score, W / 2 - ctx.measureText("Score: " + score).width / 2, H);
				}
				else if (score > 1000 && score < 10000){
					ctx.fillText("Score: 0" + score, W / 2 - ctx.measureText("Score: " + score).width / 2, H);
				}
				else {
					ctx.fillText("Score: " + score, W / 2 - ctx.measureText("Score: " + score).width / 2, H);
				} 
			}
		}

		init();