export class Player{

	y:number = 10;
	size:number;

	constructor (
		public name:string,
		public keyUp:string,
		public keyDown:string,
		public defaultSize:number,
		public width:number,
		public x: number
	){
		this.size = this.defaultSize;
	}

	_update(keystate:any, height:number){
		if (keystate[this.keyUp] && this.y - 1 > 0)
			this.y -= 1;
		else if (keystate[this.keyDown] && this.y + this.size + 1 < height)
			this.y += 1;
	}
}