import React, { useRef, useState, useEffect } from 'react'
import ReactDOM from 'react-dom';
import { Ball } from './Ball';
import { Player } from './Player';
import "./PongGame.css"

class PongGame extends React.Component {
	//ctx:CanvasRenderingContext2D;
	width = 700;
	height = 600;
	_canvasStyle = {
		'margin': 'auto',
		'width': this.width,
		'height': this.height
	}

	_widthPlayer:number = 15;
	_playerOne: Player = new Player('P1', 'ArrowUp', 'ArrowDown', 80, this._widthPlayer, this._widthPlayer);
	_playerTwo: Player = new Player('P2', 'w', 's', 80, this._widthPlayer, this.width - (2 * this._widthPlayer));
	_ball: Ball = new Ball(this.width, this.height);
	_keystate: any = {};
	_canvas: HTMLCanvasElement | undefined = undefined;
	_ctx: CanvasRenderingContext2D | undefined = undefined;

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
		this._playerOne._update(this._keystate, this.height);
		this._playerTwo._update(this._keystate, this.height);
		let ret = this._ball._update(this._playerOne, this._playerTwo);
		
		//if (ret === 1)
		//	;
		//else if (ret ===2)
		//	;
		if (ret > 0)
		{
			//TODO score 
			this._ball.y = this.height/2;
			this._ball.x = this.width/2;
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
		}, 1);
		//this._update();
		//this._draw();
	}

	componentDidMount() {
		this._initPongGame();
		setTimeout(() => this._startGame(), 1000);
	}

	private _touch(e: any) {
		console.log(e);
		e.preventDefault()
		var yPos = e.touches[0].pageY - e.touches[0].target.offsetTop - this._playerOne.size/2;
    	this._playerOne.y = yPos;
		//document.querySelector('div')!.innerHTML += '<p>test</p>';
	}

	render() {
		return <canvas
			id='canvasGame'
			onTouchStart={(e) => this._touch(e)}
			onTouchMove={(e) => this._touch(e)}
			style={this._canvasStyle}
			width={this.width}
			height={this.height} />
	}

}

/*const PongGame = () => {

  
	const canvas = new Canvas();

	return canvas.render();

}*/


export default PongGame