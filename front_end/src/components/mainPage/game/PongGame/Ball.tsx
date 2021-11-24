import { Player } from "./Player";

export class Ball {
	x: number;
	y: number;
	x_dir: number = -0.5;
	y_dir: number = -0.5;
	size: number = 5;

	constructor(
		public windowWidth: number,
		public windowHeigth: number
	) {
		this.x = this.windowWidth / 2;
		console.log(this.x);
		this.y = this.windowHeigth / 2;
		console.log(this.y);
	}

	_update(playerOne: Player, playerTwo: Player): Number{
		//collision avec le haut et le bas 
		if (this.y + this.y_dir - this.size < 0 || this.y + this.y_dir + this.size > this.windowHeigth)
			this.y_dir *= -1;
		//collision avec le player two
		if (this.x + this.x_dir + this.size > playerTwo.x) {
			if (this.y + this.y_dir + this.size > playerTwo.y
				&& this.y + this.y_dir + this.size < playerTwo.y + playerTwo.size)
				this.x_dir *= -1;
			else
				;//return 2;
		}

		//collision avec le player One
		if (this.x + this.x_dir - this.size < playerOne.x + playerOne.width) {
			if (this.y + this.y_dir + this.size > playerOne.y
				&& this.y + this.y_dir + this.size < playerOne.y + playerOne.size)
				this.x_dir *= -1;
			else
				;//return 1;
		}

		//collision avec le droite et le gauche 
		//if (this.x + this.x_dir - this.size < 0 || this.x + this.x_dir + this.size > this.windowWidth)
		//	this.x_dir *= -1;

		//Maj de la pos de la balle
		this.x += this.x_dir;
		this.y += this.y_dir;

		if (this.x < 0)
			return 1;
		if (this.x > this.windowWidth)
			return 2;
	
		return 0;
	}

}