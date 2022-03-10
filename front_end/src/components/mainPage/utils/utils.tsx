import { PlayerGameLogic } from '../../type';

export const sleep = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export const clearPlayerGameLogic = (dataPlayerLogic: PlayerGameLogic) => {
	const opponent = dataPlayerLogic.opponent;
	opponent.id = '';
	opponent.login = '';
	opponent.status = '';
	opponent.game_ws = '';
	opponent.photo_url = '';
	dataPlayerLogic.opponent = opponent;
	dataPlayerLogic.isP1 = true;
	dataPlayerLogic.isChallenge = true;
	return dataPlayerLogic;
};
