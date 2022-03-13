import {
	OnlineGameAndMapType,
	IBigUser,
	IOnlineGameRemove,
	PlayerGameLogic,
} from '../../type';

export const sleep = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

const clearUser = (usr: Partial<IBigUser>) => {
	usr.photo_url = '';
	usr.game_ws = '';
	usr.status = '';
	usr.login = '';
	usr.score = 0;
	usr.id = '';
};

export const clearPlayerGameLogic = (dataPlayerLogic: PlayerGameLogic) => {
	clearUser(dataPlayerLogic.opponent);
	dataPlayerLogic.isP1 = true;
	dataPlayerLogic.isChallenge = true;
	return dataPlayerLogic;
};

export const clearGameData = (gameData: IOnlineGameRemove) => {
	gameData.watch = '';
	gameData.map = null;
	gameData.createdAt = 0;
	gameData.id = '';
	clearUser(gameData.challenger);
	clearUser(gameData.opponent);
	return gameData;
};

export const clearWatchGameScore = (gameData: OnlineGameAndMapType) => {
	clearUser(gameData.opponent);
	clearUser(gameData.challenger);
	gameData.watch = '';
	gameData.map = null;
	return gameData;
};
