import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Ball } from './Ball';
import { Player } from './Player';
import './PongGame.scss';
import '../pongGame.scss';

//Client
const W3CWebSocket = require('websocket').w3cwebsocket;
let client = new W3CWebSocket('ws://localhost:8000');

function getRandomInt(max: number) {
	return Math.floor(Math.random() * max);
}

function sleep(milliseconds: number) {
	const date = Date.now();
	let currentDate = null;
	do {
		currentDate = Date.now();
	} while (currentDate - date < milliseconds);
}

// type MyProps = {
// 	startGame: React.Dispatch<React.SetStateAction<boolean>>;
// };

class PongGame extends React.Component {
	///////////////////////////////////////////

	//////////////////////////////////////

	width = 700;
	height = 600;
	sleepduration = 5000;
	_canvasStyle = {
		margin: 'auto',
		width: this.width,
		height: this.height,
	};

	_widthPlayer: number = 15;
	_playerOne: Player = new Player('P1', 1, 'ArrowUp', 'ArrowDown', 80, this._widthPlayer, this._widthPlayer);
	_playerTwo: Player = new Player('P2', 2, 'ArrowUp', 'ArrowDown', 80, this._widthPlayer, this.width - 2 * this._widthPlayer);
	_ball: Ball = new Ball(this.width, this.height);
	_keystate: any = {};
	_canvas: HTMLCanvasElement | undefined = undefined;
	_ctx: CanvasRenderingContext2D | undefined = undefined;
	_P1: boolean = false;
	_P2: boolean = false;
	scoreP1: number = 0;
	scoreP2: number = 0;
	gamerunning = true;
	powerUp = true;
	imgBackground = new Image();
	Font:FontFace = new FontFace(
		"",
		""
	);

	constructor(props: any) {
		super(props);
	}

	sleep() {
		sleep(this.sleepduration);
	}

	_printText(str: string) {
		this._ctx!.fillStyle = 'black';
		this._ctx!.fillRect(0, 0, this.width, this.height);
		this._drawBackground();
		//this._ctx!.font = '30px Arial';
		this._ctx!.font = "30px Orbitron";
		this._ctx!.fillStyle = 'white';
		this._ctx!.fillText(str, this.width / 2 - (15 * str.length) / 2 + 1, this.height / 2 + 1);
		this._ctx!.fillStyle = '38FC25';
		this._ctx!.fillText(str, this.width / 2 - (15 * str.length) / 2, this.height / 2);
	}

	_initPongGame() {
		this._canvas = document.querySelector('canvas')!;
		this._ctx = this._canvas.getContext('2d')!;
		this.imgBackground.src ="Fondmap1.jpeg";
		this.imgBackground.alt ="alt";
		this.Font = new FontFace(
			"Orbitron",
			"url(https://fonts.gstatic.com/s/orbitron/v19/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyKS6BoWg1fDAlp7lk.woff)"
		);
		this.Font.load().then((font) => {
			document.fonts.add(font);
			this._ctx!.font = "30px Orbitron";
		});
		this._printText('Starting Game');
	}

	private _score(ret: number) {
		if (ret == 2) this.scoreP2++; //J2 score
		if (ret == 1) this.scoreP1++;
		this._ball.y = this.height / 2;
		this._ball.x = this.width / 2;
		this._ball.x_dir = Math.random() * 2 - 1;
		if (this._ball.x_dir <= 0 && this._ball.x > -0.7) this._ball.x_dir -= 0.5;
		if (this._ball.x_dir > 0 && this._ball.x < 0.7) this._ball.x_dir += 0.5;
		this._ball.y_dir = Math.random() * 2 - 1;
		client.send(
			JSON.stringify({
				type: 'message',
				object: 'Score',
				P1: this.scoreP1,
				P2: this.scoreP2,
			}),
		);
		if (!this.powerUp) return;
		let random = getRandomInt(100);
		if (random < 45) {
			//5)
			//Power up large paddle
			if (ret == 1) {
				this._playerOne._largePaddle(this.height);
				client.send(
					JSON.stringify({
						type: 'message',
						object: 'PowerUp',
						powerUp: 'large Paddle',
						J: ret,
					}),
				);
				this.gamerunning = false;
				this._printText('Player One large Paddle');
				setTimeout(() => (this.gamerunning = true), 1000);
			}
			if (ret == 2) {
				client.send(
					JSON.stringify({
						type: 'message',
						object: 'PowerUp',
						powerUp: 'large Paddle',
						J: ret,
					}),
				);
				this.gamerunning = false;
				this._printText('Player Two large Paddle');
				setTimeout(() => (this.gamerunning = true), 1000);
			}
		}
		if (random >= 55) {
			//95)
			//Power Up controle inverse
			if (ret == 2) {
				this._playerOne._invertControlTemporarily();
				client.send(
					JSON.stringify({
						type: 'message',
						object: 'PowerUp',
						powerUp: 'inverted Control',
						J: 1,
					}),
				);
				this.gamerunning = false;
				this._printText('Player One inverted Control');
				setTimeout(() => (this.gamerunning = true), 1000);
			}
			if (ret == 1) {
				client.send(
					JSON.stringify({
						type: 'message',
						object: 'PowerUp',
						powerUp: 'inverted Control',
						J: 2,
					}),
				);
				this.gamerunning = false;
				this._printText('Player Two inverted Control');
				setTimeout(() => (this.gamerunning = true), 1000);
			}
		}
	}

	private _update() {
		if (this._P1) {
			let ret = this._ball._update(this._playerOne, this._playerTwo);
			if (ret > 0)
				// someone scored
				this._score(ret);
			client.send(
				JSON.stringify({
					type: 'message',
					object: 'Ball',
					x: this._ball.x,
					y: this._ball.y,
				}),
			);
		}
		if (this._P1) {
			this._playerOne._update(this._keystate, this.height, this._ball);
			client.send(
				JSON.stringify({
					type: 'message',
					object: 'Player1',
					player: this._playerOne,
				}),
			);
		}
		if (this._P2) {
			this._playerTwo._update(this._keystate, this.height, this._ball);
			//console.log(client);
			client.send(
				JSON.stringify({
					type: 'message',
					object: 'Player2',
					player: this._playerTwo,
				}),
			);
		}
	}

	_drawBackground(){
		this._ctx!.fillStyle = 'black';
		this._ctx!.fillRect(0, 0, this.width, this.height);
		this._ctx!.drawImage(this.imgBackground, 0,0,700, 600);
	}

	_draw(){
		this._drawBackground();

		//draw Ball
		this._ctx!.fillStyle = '#38FC25';
		this._ctx!.beginPath();
		this._ctx!.arc(this._ball.x, this._ball.y, this._ball.size, 0, 2 * Math.PI);
		this._ctx!.fill();

		//Draw Player
		let gradient1 = this._ctx!.createLinearGradient(0, this.height/2, this._playerOne.width * 3, this.height/2)!;
		gradient1.addColorStop(0,"black");
		gradient1.addColorStop(0.5,"#38FC25");
		gradient1.addColorStop(1,"black");
		this._ctx!.fillStyle = gradient1;
		this._ctx!.fillRect(this._playerOne.x, this._playerOne.y, this._widthPlayer, this._playerOne.size);

		let gradient2 = this._ctx!.createLinearGradient(this.width - this._playerTwo.width * 3, this.height/2, this.width, this.height/2)!;
		gradient2.addColorStop(0,"black");
		gradient2.addColorStop(0.5,"#38FC25");
		gradient2.addColorStop(1,"black");
		this._ctx!.fillStyle = gradient2;
		this._ctx!.fillRect(this._playerTwo.x, this._playerTwo.y, this._widthPlayer, this._playerTwo.size);

		//Score
		this._ctx!.font = '30px Arial';
		this._ctx!.font = "30px Orbitron";

		this._ctx!.fillStyle = '#38FC25';
		this._ctx!.fillText(this.scoreP1 + ':' + this.scoreP2, this.width / 2 - (15 * 3) / 2, 30);
	};

	_startGame() {
		const keystate = this._keystate;
		document.addEventListener('keydown', function (evt) {
			evt.preventDefault();
			keystate[evt.key] = true;
		});
		document.addEventListener('keyup', function (evt) {
			evt.preventDefault();
			delete keystate[evt.key];
		});
		document.addEventListener(
			'ontouchstart',
			function (e) {
				e.preventDefault();
			},
			false,
		);
		document.addEventListener(
			'ontouchmove',
			function (e) {
				e.preventDefault();
			},
			false,
		);
		client.send(
			JSON.stringify({
				type: 'message',
				object: 'Ready',
			}),
		);
		//let _loop =
		setInterval(() => {
			if (this.gamerunning) this._update();
			if (this.gamerunning) this._draw();
		}, 10);
	}

	componentDidMount() {
		 let rep = prompt('J1 J2 ou W');
		 if (rep === 'J1') this._P1 = true;
		 else if (rep === 'J2') this._P2 = true;
		this._initPongGame();
		client.onmessage = (message: any) => {
			const data = JSON.parse(message.data);
			if (!this._P2 && data.object === 'Player2') {
				this._playerTwo = data.player;
			}
			if (!this._P1 && data.object === 'Player1') {
				this._playerOne = data.player;
			}
			if (!this._P1 && data.object === 'Ball') {
				this._ball.x = data.x;
				this._ball.y = data.y;
			}
			if (!this._P1 && data.object === 'Score') {
				this.scoreP1 = data.P1;
				this.scoreP2 = data.P2;
			}
			if (!this._P1 && data.object === 'PowerUp') {
				if (data.powerUp == 'inverted Control' && data.J == 2) this._playerTwo._invertControlTemporarily();
				if (data.powerUp == 'large Paddle' && data.J == 2) this._playerTwo._largePaddle(this.height);
				this.gamerunning = false;
				let message = 'Player ';
				if (data.J == 1) message += 'One ';
				else message += 'Two ';
				this._printText(message + data.powerUp);
				setTimeout(() => (this.gamerunning = true), 1000);
			}
			if (data.object === 'Ready') this.gamerunning = true;
			if (data.object === 'Pause') {
				this.gamerunning = false;
				this._printText('Jeu en pause');
			}
		};
		setTimeout(() => this._startGame(), 1000);
	}

	componentWillUnmount() {
		if (client) client.close();
	}

	private _touch(e: any) {
		console.log(e);
		e.preventDefault();
		var yPos = e.touches[0].pageY - e.touches[0].target.offsetTop - this._playerOne.size / 2;
		this._playerOne.y = yPos;
	}

	render() {
		return (
			<div className="pongGame">
				<canvas
					className="canvasGame"
					onTouchStart={(e) => this._touch(e)}
					onTouchMove={(e) => this._touch(e)}
					style={this._canvasStyle}
					width={this.width}
					height={this.height}
				/>
			</div>
		);
	}
}

export default PongGame;
