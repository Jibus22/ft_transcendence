export interface User {
	id: string;
	login: string;
	photo_url: string;
	status: string;
	game_ws?: string;
}

export interface Rank {
	games_count: number;
	games_won: number;
	games_lost: number;
	user: User;
}

export interface Players {
	score: number;
	user: User;
}

export interface Game {
	id: string;
	createdAt: number;
	duration: number;
	players: Array<Players>;
}

export interface UserMe {
	id: number;
	login: string;
	photo_url: string;
	status: string;
	storeCustomPhoto: boolean;
	hasTwoFASecret: boolean;
	games_nbr: number;
	wins_nbr: number;
	losses_nbr: number;
}

export interface LoginGame {
	loginP1: string;
	loginP2: string;
	login: string;
	photo_url: string;
}

export interface IUserChallenge {
	login_opponent: string;
	login: string;
	photo_url: string;
	game_ws: string;
}

export class UserDto {
	game_ws: string = '';
	id: string = '';
	login: string = '';
	photo_url: string = '';
	status: string = '';
}

export class PlayerGameLogic {
	opponent: Partial<UserDto> = new UserDto();
	isP1: boolean = true;
	isChallenge: boolean = true;
}

export class UserChallenge {
	login_opponent: string = '';
	login: string = '';
	photo_url: string = '';
	game_ws: string = '';
}

export interface IUserOnlineGame {
	login: string;
	photo_url: string;
	status: string;
	score: number;
	game_ws: string;
}

export interface OnlineGameType {
	challenger: IUserOnlineGame;
	opponent: IUserOnlineGame;
	watch: string;
	createdAt: number;
}

export interface OnlineGameAndMapType {
	challenger: IUserOnlineGame;
	opponent: IUserOnlineGame;
	watch: string;
	map: null | 'one' | 'two' | 'three';
}

export interface IOnlineGameRemove {
	challenger: IUserOnlineGame;
	opponent: IUserOnlineGame;
	watch: string;
	map: null | 'one' | 'two' | 'three';
	createdAt: number;
	id: string;
}

export interface IBigUser {
	id: string;
	login: string;
	photo_url: string;
	status: string;
	score: number;
	game_ws: string;
}
