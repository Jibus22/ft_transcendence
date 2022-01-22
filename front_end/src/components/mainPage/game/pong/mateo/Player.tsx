import { Ball } from './Ball';

export class Player {
	y: number = 10;
	size: number;

	constructor(
		public name: string,
		public num: number,
		public keyUp: string,
		public keyDown: string,
		public defaultSize: number,
		public width: number,
		public x: number,
	) {
		this.size = this.defaultSize;
	}

	_ballInPlayer(ball: Ball): boolean {
		// le centre de la balle est dans le pad
		if (ball.x > this.x && ball.x < this.x + this.width && ball.y > this.y && ball.y < this.y + this.size) return true;

		//Intersection cotes haut du pas avec le point le plus bas de la balle
		if (ball.x > this.x && ball.x < this.x + this.width && ball.y + ball.size > this.y && ball.y + ball.size < this.y + this.size)
			return true;

		//Intersection cotes bas du pas avec le point le plus haut de la balle
		if (ball.x > this.x && ball.x < this.x + this.width && ball.y - ball.size > this.y && ball.y - ball.size < this.y + this.size)
			return true;

		//Si point le plus a droite de la ballle est dans le pad
		if (ball.x + ball.size > this.x && ball.x + ball.size < this.x + this.width && ball.y > this.y && ball.y < this.y + this.size)
			return true;

		//Si point le plus a gauche de la ballle est dans le pad
		if (ball.x - ball.size > this.x && ball.x - ball.size < this.x + this.width && ball.y > this.y && ball.y < this.y + this.size)
			return true;

		//Meme chose avec les point en haut a gauche bas droit haut droit et haut gacuhe
		if (
			ball.x + ball.size > this.x &&
			ball.x + ball.size < this.x + this.width &&
			ball.y + ball.size > this.y &&
			ball.y + ball.size < this.y + this.size
		)
			return true;
		if (
			ball.x - ball.size > this.x &&
			ball.x - ball.size < this.x + this.width &&
			ball.y - ball.size > this.y &&
			ball.y - ball.size < this.y + this.size
		)
			return true;
		if (
			ball.x + ball.size > this.x &&
			ball.x + ball.size < this.x + this.width &&
			ball.y - ball.size > this.y &&
			ball.y - ball.size < this.y + this.size
		)
			return true;
		if (
			ball.x - ball.size > this.x &&
			ball.x - ball.size < this.x + this.width &&
			ball.y + ball.size > this.y &&
			ball.y + ball.size < this.y + this.size
		)
			return true;
		return false;
	}

	_update(keystate: any, height: number, ball: Ball) {
		let deplacement = 3;
		if (keystate[this.keyUp] && this.y - deplacement > 0) {
			this.y -= deplacement;
			if (this._ballInPlayer(ball)) this.y += deplacement;
		} else if (keystate[this.keyDown] && this.y + this.size + deplacement < height && !this._ballInPlayer(ball)) {
			this.y += deplacement;
			if (this._ballInPlayer(ball)) this.y -= deplacement;
		}
	}

	_invertControl() {
		let swap = this.keyDown;
		this.keyDown = this.keyUp;
		this.keyUp = swap;
	}

	_invertControlTemporarily() {
		this._invertControl();
		setTimeout(() => this._invertControl(), 10 * 1000);
	}

	_largePaddle(height: number) {
		let enlargement = 20;
		if (this.y + this.size + enlargement > height) this.y += height - (this.y + this.size + enlargement);
		this.size += enlargement;
		setTimeout(() => (this.size -= 20), 10 * 1000);
	}
}
