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
}
