export interface User {
	id: string;
	login: string;
	photo_url: string;
	status: string;
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

export interface UserChallenge {
	login_opponent: string;
	login: string;
	photo_url: string;
}

export interface UserOnlineGame {
	login: string;
	photo_url: string;
	status: string;
	score: number;
}

export interface OnlineGameType {
	challenger: UserOnlineGame;
	opponent: UserOnlineGame;
	watch: string;
	createdAt: number;
}

export interface OnlineGameAndMapType {
	challenger: UserOnlineGame;
	opponent: UserOnlineGame;
	watch: string;
	map: null | 'one' | 'two' | 'three';
}

export interface OnlineGameRemooveType {
	challenger: UserOnlineGame;
	opponent: UserOnlineGame;
	watch: string;
	map: null | 'one' | 'two' | 'three';
	createdAt: number;
	id: string;
}
