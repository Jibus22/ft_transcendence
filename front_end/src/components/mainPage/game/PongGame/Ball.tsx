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

	_intersect_segment(
			xa : number,
			ya : number,
			xb : number,
			yb : number,
			xc : number,
			yc : number,
			xd : number,
			yd : number,
		):boolean
	{
		let det:number = (xb - xa) * (yc -yd) - ((xc - xd) * (yb - ya));
		if (det === 0)
			return false;
		else
		{
			let t1 =(((xc - xa) * (yc - yd)) - ((xc - xd) * (yc - ya))) / det;
			let t2 =(((xb - xa) * (yc - ya)) - ((xc - xa) * (yb - ya))) / det;
			if (t1 > 1 || t1 < 0 || t2 > 1 || t2 < 0)
				return false;
			else
				return true;
		}
	}

	_update(playerOne: Player, playerTwo: Player): number{
		//collision avec le haut et le bas 
		if (this.y + this.y_dir - this.size < 0 || this.y + this.y_dir + this.size > this.windowHeigth)
			this.y_dir *= -1;

		//collision avec le player two
		if (this._intersect_segment(this.x - 3 * this.x_dir, this.y - 3 * this.y_dir, this.x + this.size + this.x_dir, this.y + this.size + this.y_dir,
				playerTwo.x, playerTwo.y, playerTwo.x, playerTwo.y + playerTwo.size)
		)
			this.x_dir *= -1;
		else if (this._intersect_segment(this.x - 3 * this.x_dir, this.y - 3 * this.y_dir, this.x + this.x_dir, this.y + this.size + this.y_dir,
			playerTwo.x, playerTwo.y, playerTwo.x +playerTwo.width, playerTwo.y)
		)
			this.y_dir *= -1;
		else if (this._intersect_segment(this.x - 3 * this.x_dir, this.y - 3 * this.y_dir, this.x + this.x_dir, this.y - this.size + this.y_dir,
			playerTwo.x, playerTwo.y + playerTwo.size, playerTwo.x +playerTwo.width, playerTwo.y + playerTwo.size)
		)
			this.y_dir *= -1;

		//collision avec le player One
		if (this._intersect_segment(this.x - 3 * this.x_dir, this.y - 3 * this.y_dir, this.x - this.size + this.x_dir, this.y - this.size + this.y_dir,
			playerOne.x + playerOne.width , playerOne.y, playerOne.x + playerOne.width, playerOne.y + playerOne.size)
	
		)
			this.x_dir *= -1;
		else if (this._intersect_segment(this.x, this.y, this.x+ this.x_dir, this.y + this.size + this.y_dir,
			playerOne.x , playerOne.y, playerOne.x +playerOne.width, playerOne.y)
		)
			this.y_dir *= -1;
		else if (this._intersect_segment(this.x, this.y, this.x+ this.x_dir, this.y - this.size + this.y_dir,
			playerOne.x, playerOne.y + playerOne.size, playerOne.x +playerOne.width, playerOne.y + playerOne.size)
		)
			this.y_dir *= -1;

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