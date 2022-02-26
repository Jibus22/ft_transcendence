//import { useRef, useState, useEffect } from 'react';
//import ReactDOM from 'react-dom';
import { Socket } from 'socket.io-client';
import React from 'react';
import { Ball } from './Ball';
import { Player } from './Player';
import './PongGame.scss';
import '../pongGame.scss';

//Client
//const W3CWebSocket = require('websocket').w3cwebsocket;
//let client = new W3CWebSocket('ws://localhost:8000');

interface Score {
	score1: number;
	score2: number;
}

interface BallPos {
	x: number;
	y: number;
}

interface PowerUp {
	effect: string;
	playerNb: number;
}

function getRandomInt(max: number) {
	return Math.floor(Math.random() * max);
}

//TODO: Potentially resources expensive algo -> improve it
function sleep(milliseconds: number) {
	const date = Date.now();
	let currentDate = null;
	do {
		currentDate = Date.now();
	} while (currentDate - date < milliseconds);
}

type MyProps = {
	joueur: number;
	map: null | 'one' | 'two' | 'three';
	socket: Socket | undefined;
	room: string;
	watch: string;
};

class PongGame extends React.Component<MyProps> {
	///////////////////////////////////////////

	//////////////////////////////////////

	width = 700;
	height = 400;
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
	font: string = '30px Arial';
	fillStyle: string = 'white';
	fontFace: FontFace = new FontFace('', '');
	map: number = 0;

	broadcast = {
		room: this.props.room,
		watchers: this.props.watch,
	};

	sleep() {
		sleep(this.sleepduration);
	}

	_printText(str: string) {
		this._drawBackground();
		this._ctx!.fillStyle = this.fillStyle;
		this._ctx!.fillText(str, this.width / 2 - (15 * str.length) / 2, this.height / 2);
	}

	_printPowerUp(str: string) {
		this._ctx!.fillStyle = this.fillStyle;
		this._ctx!.fillText(str, this.width / 2 - (15 * str.length) / 2, this.height / 2 + 30);
	}

	_initPongGame() {
		this._canvas = document.querySelector('canvas')!;
		this._ctx = this._canvas.getContext('2d')!;
		this.font = '30px Arial';
		this._ctx!.font = this.font;
		if (this.props.map === 'one') this.map = 0;
		else if (this.props.map === 'two') this.map = 1;
		else this.map = 2;
		if (this.map === 0) this.powerUp = false;
		if (this.map === 1) {
			this.imgBackground.src = 'Fondmap1.jpeg';
			this.imgBackground.alt = 'alt';
			this.fontFace = new FontFace(
				'Orbitron',
				'url(https://fonts.gstatic.com/s/orbitron/v19/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyKS6BoWg1fDAlp7lk.woff)',
			);
			this.fillStyle = '38FC25';
			this._ctx!.fillStyle = this.fillStyle;
			this._ctx!.shadowColor = '#38FC25';
			this._ctx!.shadowBlur = 30;
			this.fontFace.load().then((font) => {
				document.fonts.add(font);
				this.font = '30px Orbitron';
				this._ctx!.font = this.font;
			});
		}
		if (this.map === 2) {
			this.imgBackground.src = 'Fondmap2.jpg';
			this.imgBackground.alt = 'alt';
			this.fontFace = new FontFace('Chonburi', 'url(https://fonts.gstatic.com/s/chonburi/v8/8AtqGs-wOpGRTBq66LWdHLz5ixfY.woff2)');
			this.fillStyle = '#CFB217';
			this._ctx!.fillStyle = this.fillStyle;
			this._ctx!.shadowColor = '#EAD043';
			this._ctx!.shadowBlur = 30;
			this.fontFace.load().then((font) => {
				document.fonts.add(font);
				this.font = '30px Chonburi';
				this._ctx!.font = this.font;
			});
		}
		this._printText('Starting Game');
	}

	private _score(ret: number) {
		//Maj Score
		if (ret === 2) this.scoreP2++; //J2 score
		if (ret === 1) this.scoreP1++;

		this.props.socket?.emit('scoreUpdate', {
			bcast: this.broadcast,
			score: {
				score1: this.scoreP1,
				score2: this.scoreP2,
			},
		});

		if (this.scoreP1 >= 10) {
			this.gamerunning = false;
			this._printText('Player One win');
			return;
		}
		if (this.scoreP2 >= 10) {
			this.gamerunning = false;
			this._printText('Player Two win');
			return;
		}

		//Affichage du score
		this.gamerunning = false;
		if (ret === 1) this._printText('Player One score');
		if (ret === 2) this._printText('Player Two score');
		setTimeout(() => (this.gamerunning = true), 2000);

		//Balle au centre
		this._ball.y = this.height / 2;
		this._ball.x = this.width / 2;

		//Direction de la balle
		if (ret === 2) this._ball.x_dir = Math.random() + 1;
		if (ret === 1) this._ball.x_dir = Math.random() - 2;
		this._ball.y_dir = Math.random() * 4 - 2;
		if (this._ball.y_dir <= 1 && this._ball.y_dir >= 0) this._ball.y_dir = 1;
		if (this._ball.y_dir >= -1 && this._ball.y_dir < 0) this._ball.y_dir = 1;

		//Power Up
		if (!this.powerUp) return;
		let random = getRandomInt(100);
		if (random < 10) {
			//Power up large paddle
			if (ret === 1) {
				this._playerOne._largePaddle(this.height);
				this.props.socket?.emit('powerUpUpdate', {
					bcast: this.broadcast,
					powerup: {
						effect: 'large Paddle',
						playerNb: ret,
					},
				});
				this._printPowerUp('Player One large Paddle');
			}
			if (ret === 2) {
				this.props.socket?.emit('powerUpUpdate', {
					bcast: this.broadcast,
					powerup: {
						effect: 'large Paddle',
						playerNb: ret,
					},
				});
				this._printPowerUp('Player Two large Paddle');
			}
		}
		if (random >= 90) {
			//Power Up controle inverse
			if (ret === 2) {
				this._playerOne._invertControlTemporarily();
				this.props.socket?.emit('powerUpUpdate', {
					bcast: this.broadcast,
					powerup: {
						effect: 'inverted Control',
						playerNb: 1,
					},
				});
				this._printPowerUp('Player One inverted Control');
			}
			if (ret === 1) {
				this.props.socket?.emit('powerUpUpdate', {
					bcast: this.broadcast,
					powerup: {
						effect: 'inverted Control',
						playerNb: 2,
					},
				});
				this._printPowerUp('Player Two inverted Control');
			}
		}
	}

	private _update() {
		if (this._P1) {
			let ret = this._ball._update(this._playerOne, this._playerTwo);
			if (ret > 0) this._score(ret); // someone scored
			this.props.socket?.emit('ballPosUpdate', {
				bcast: this.broadcast,
				ballpos: {
					x: this._ball.x,
					y: this._ball.y,
				},
			});
		}
		if (this._P1) {
			this._playerOne._update(this._keystate, this.height, this._ball);
			this.props.socket?.emit('playerUpdate', {
				bcast: this.broadcast,
				gamePlayer: this._playerOne,
				playerNb: 1,
			});
		}
		if (this._P2) {
			this._playerTwo._update(this._keystate, this.height, this._ball);
			this.props.socket?.emit('playerUpdate', {
				bcast: this.broadcast,
				gamePlayer: this._playerTwo,
				playerNb: 2,
			});
		}
	}

	_drawBackground() {
		if (this.map < 2) this._ctx!.fillStyle = 'black';
		if (this.map === 2) this._ctx!.fillStyle = 'white';
		this._ctx!.fillRect(0, 0, this.width, this.height);

		if (this.map >= 1) this._ctx!.drawImage(this.imgBackground, 0, 0, 700, 600);
	}

	_draw() {
		this._drawBackground();

		//filet map0
		if (this.map === 0) {
			this._ctx!.fillStyle = '#B9B9B9';
			this._ctx!.fillStyle = '#6E6E6E';
			this._ctx!.fillRect(this.width / 2 - 2, 0, 2, this.height);
			this._ctx!.fillStyle = 'white';
		}

		//draw Ball
		this._ctx!.fillStyle = this.fillStyle;
		this._ctx!.beginPath();
		this._ctx!.arc(this._ball.x, this._ball.y, this._ball.size, 0, 2 * Math.PI);
		this._ctx!.fill();

		//Draw Player1
		if (this.map === 1) {
			let gradient1 = this._ctx!.createLinearGradient(0, this.height / 2, this._playerOne.width * 3, this.height / 2)!;
			gradient1.addColorStop(0, 'black');
			gradient1.addColorStop(0.5, '#38FC25');
			gradient1.addColorStop(1, 'black');
			this._ctx!.fillStyle = gradient1;
		}
		if (this.map === 2) {
			let gradient1 = this._ctx!.createLinearGradient(0, this.height / 2, this._playerOne.width * 3, this.height / 2)!;
			gradient1.addColorStop(0, '#88642F');
			gradient1.addColorStop(0.5, '#E6C619');
			gradient1.addColorStop(1, '#E6C619');
			//gradient1.addColorStop(1,"#88642F");
			this._ctx!.fillStyle = gradient1;
		}
		this._ctx!.fillRect(this._playerOne.x, this._playerOne.y, this._widthPlayer, this._playerOne.size);

		//Draw Player 2
		if (this.map === 1) {
			let gradient2 = this._ctx!.createLinearGradient(
				this.width - this._playerTwo.width * 3,
				this.height / 2,
				this.width,
				this.height / 2,
			)!;
			gradient2.addColorStop(0, 'black');
			gradient2.addColorStop(0.5, '#38FC25');
			gradient2.addColorStop(1, 'black');
			this._ctx!.fillStyle = gradient2;
		}
		if (this.map === 2) {
			let gradient2 = this._ctx!.createLinearGradient(
				this.width - this._playerTwo.width * 3,
				this.height / 2,
				this.width,
				this.height / 2,
			)!;
			gradient2.addColorStop(0, '#E6C619');
			gradient2.addColorStop(0.5, '#E6C619');
			gradient2.addColorStop(1, '#88642F');
			this._ctx!.fillStyle = gradient2;
		}
		this._ctx!.fillRect(this._playerTwo.x, this._playerTwo.y, this._widthPlayer, this._playerTwo.size);

		//Score
		this._ctx!.fillStyle = this.fillStyle;
		if (this.map === 0) this._ctx!.fillText(this.scoreP1 + ' ' + this.scoreP2, this.width / 2 - (15 * 3) / 2, 30);
		else this._ctx!.fillText(this.scoreP1 + ':' + this.scoreP2, this.width / 2 - (15 * 3) / 2, 30);
	}

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
		setInterval(() => {
			if (this.gamerunning) this._update();
		}, 10);
		setInterval(() => {
			if (this.gamerunning) this._draw();
		}, 30);
	}

	componentDidMount() {
		if (this.props.joueur === 1) this._P1 = true;
		else if (this.props.joueur === 2) this._P2 = true;
		this._initPongGame();
		this.props.socket?.on('playerUpdate', (player: Player, nb: number) => {
			if (nb === 1) this._playerOne = player;
			else if (nb === 2) this._playerTwo = player;
		});

		this.props.socket?.on('ballPosUpdate', (ballPos: BallPos) => {
			this._ball.x = ballPos.x;
			this._ball.y = ballPos.y;
		});

		this.props.socket?.on('scoreUpdate', (score: Score) => {
			const p1Score = score.score1 > this.scoreP1;
			this.scoreP1 = score.score1;
			this.scoreP2 = score.score2;

			//Affichage du gagnant
			if (this.scoreP1 >= 10) {
				this.gamerunning = false;
				this._printText('Player One win');
				return;
			}
			if (this.scoreP2 >= 10) {
				this.gamerunning = false;
				this._printText('Player Two win');
				return;
			}

			//Affichage du score
			this.gamerunning = false;
			if (p1Score) this._printText('Player One score');
			else this._printText('Player Two score');
			setTimeout(() => (this.gamerunning = true), 2000);
		});

		this.props.socket?.on('powerUpUpdate', (powerUp: PowerUp) => {
			if (powerUp.effect === 'inverted Control' && powerUp.playerNb === 2 && this._P2) this._playerTwo._invertControlTemporarily();
			if (powerUp.effect === 'large Paddle' && powerUp.playerNb === 2 && this._P2) this._playerTwo._largePaddle(this.height);
			let message = 'Player ';
			if (powerUp.playerNb === 1) message += 'One ';
			else message += 'Two ';
			this._printPowerUp(message + powerUp.effect);
		});

		setTimeout(() => this._startGame(), 1000);
	}

	componentWillUnmount() {
		//if (client) client.close();
	}

	private _touch(e: any) {
		console.log(e);
		e.preventDefault();
		let yPos = e.touches[0].pageY - e.touches[0].target.offsetTop - this._playerOne.size / 2;
		this._playerOne.y = yPos;
	}

	render() {
		return (
			<div className="pongGame">
				{
					<canvas
						className="h-100 w-100 canvasGame"
						onTouchStart={(e) => this._touch(e)}
						onTouchMove={(e) => this._touch(e)}
						style={this._canvasStyle}
						width={this.width}
						height={this.height}
					/>
				}
			</div>
		);
	}
}

export default PongGame;
