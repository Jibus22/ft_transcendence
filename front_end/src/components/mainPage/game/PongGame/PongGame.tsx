import React, { useRef, useState, useEffect } from 'react'
import ReactDOM from 'react-dom';
import { Ball } from './Ball';
import { Player } from './Player';
import "./PongGame.css"

//Client
const W3CWebSocket = require('websocket').w3cwebsocket;
let client= new W3CWebSocket('ws://localhost:8000');

class PongGame extends React.Component {
	width = 700;
	height = 600;
	_canvasStyle = {
		'margin': 'auto',
		'width': this.width,
		'height': this.height
	}

	_widthPlayer:number = 15;
	_playerOne: Player = new Player('P1', 1, 'ArrowUp', 'ArrowDown', 80, this._widthPlayer, this._widthPlayer);
	_playerTwo: Player = new Player('P2', 2,'ArrowUp', 'ArrowDown', 80, this._widthPlayer, this.width - (2 * this._widthPlayer));
	_ball: Ball = new Ball(this.width, this.height);
	_keystate: any = {};
	_canvas: HTMLCanvasElement | undefined = undefined;
	_ctx: CanvasRenderingContext2D | undefined = undefined;
	_P1:boolean = false;
	_P2:boolean = false;
	scoreP1:number = 0;
	scoreP2:number = 0;


	constructor(props:any){
		super(props);
	}

	_initPongGame() {
		this._canvas = document.querySelector('canvas')!;
		this._ctx = this._canvas.getContext('2d')!;
		this._ctx.font = '30px Arial';
		this._ctx.fillStyle = 'grey';
		this._ctx.fillText('Starting Game',
			this.width / 2 - ((15 * 13) / 2) + 2,
			this.height / 2 + 2);
		this._ctx.fillStyle = 'white';
		this._ctx.fillText('Starting Game',
			this.width / 2 - ((15 * 13) / 2),
			this.height / 2);
	}

	private _update(): void{
		if (this._P1)
		{
			let ret = this._ball._update(this._playerOne, this._playerTwo);
			if (ret > 0) // someone scored
			{
				if (ret == 2)
				{
					//J2 score
					this.scoreP1++;
				}
				if (ret == 1)
				{
					//J1 score
					this.scoreP2++;
				}
				this._ball.y = this.height/2;
				this._ball.x = this.width/2;
				client.send(JSON.stringify({
					type: "message",
					object: "Score",
					P1: this.scoreP1,
					P2: this.scoreP2
				}))
				
			}
			client.send(JSON.stringify({
				type: "message",
				object: "Ball",
				x: this._ball.x,
				y: this._ball.y
			}))
		}
		if (this._P1)
		{
			this._playerOne._update(this._keystate, this.height, this._ball);
			client.send(JSON.stringify({
				type: "message",
				object: "Player1",
				player: this._playerOne,
			}))
		}
		if(this._P2)
		{
			this._playerTwo._update(this._keystate, this.height, this._ball);
			//console.log(client);
			client.send(JSON.stringify({
				type: "message",
				object: "Player2",
				player: this._playerTwo
			}))
		}
	}

	_draw = () => {
		//font 
		this._ctx!.fillStyle = "black";
		this._ctx!.fillRect(0, 0, this.width, this.height);
		this._ctx!.fillStyle = "white";

		//draw Ball
		this._ctx!.beginPath();
		this._ctx!.arc(this._ball.x, this._ball.y, this._ball.size, 0, 2 * Math.PI);
		this._ctx!.fill();

		//Draw Player
		this._ctx!.fillRect(this._playerOne.x, this._playerOne.y, this._widthPlayer, this._playerOne.size);
		this._ctx!.fillRect(this._playerTwo.x, this._playerTwo.y, this._widthPlayer, this._playerTwo.size);

		//Score
		this._ctx!.font = '30px Arial';
		this._ctx!.fillStyle = 'white';
		this._ctx!.fillText(this.scoreP1 + ':' + this.scoreP2 ,
			this.width / 2 - ((15 * 3) / 2),
			30);
	}

	_startGame() {
		const keystate = this._keystate;
		document.addEventListener('keydown', function (evt) {
			evt.preventDefault()
			keystate[evt.key] = true;
		});
		document.addEventListener('keyup', function (evt) {
			evt.preventDefault()
			delete keystate[evt.key];
		});
		document.addEventListener('ontouchstart', function (e) { e.preventDefault() }, false);
		document.addEventListener('ontouchmove', function (e) { e.preventDefault() }, false);

		//let _loop = 
		setInterval(() => {
			this._update();
			this._draw();
		}, 10);
	}

	componentDidMount() {
		console.log(client);
		//if (client.readyState !== WebSocket.OPEN)
		//	return;
		let rep = prompt("J1 J2 ou W");
		if (rep === 'J1')
			this._P1 = true;
		else if (rep === 'J2')
			this._P2 = true;
		this._initPongGame();
		client.onmessage = (message: any) => {
			const data = JSON.parse(message.data)
			if (this._P1 && data.object === "Player2")
			{
				this._playerTwo = data.player;
			}
			if (this._P2 && data.object === "Player1")
			{
				this._playerOne = data.player ;
			}
			if (this._P2 && data.object === "Ball")
			{
				this._ball.x = data.x;
				this._ball.y = data.y;
			}
			if(this._P2 && data.object === "Score")
			{
				this.scoreP1 = data.P1;
				this.scoreP2 = data.P2;
			}
		};
		setTimeout(() => this._startGame(), 1000);
	}

	componentWillUnmount() {
		if (client)
			client.close()
	}

	private _touch(e: any) {
		console.log(e);
		e.preventDefault()
		var yPos = e.touches[0].pageY - e.touches[0].target.offsetTop - this._playerOne.size/2;
    	this._playerOne.y = yPos;
	}

	render() {
		return (
		<div>
			<canvas
				id='canvasGame'
				onTouchStart={(e) => this._touch(e)}
				onTouchMove={(e) => this._touch(e)}
				style={this._canvasStyle}
				width={this.width}
				height={this.height} />
		</div>)
	}

}


export default PongGame