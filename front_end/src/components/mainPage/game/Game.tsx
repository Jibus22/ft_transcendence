import React, { useEffect, Dispatch } from 'react';
import { Socket } from 'socket.io-client';
import { OnlineGame, Play } from '../..';
// import { Play, OnlineGame } from '../..';
import { useMainPage } from '../../../MainPageContext';
import { PlayerGameLogic } from '../../type';
import './game.scss';
import MainPong from './pong/MainPong';

import { configResponsive, useResponsive } from 'ahooks';

interface IProps {
	chatWs: Socket | undefined;
	setPlayerGameLogic: Dispatch<React.SetStateAction<PlayerGameLogic>>;
	playerGameLogic: PlayerGameLogic;
}

configResponsive({
	small: 1060,
});

export default function Game({
	chatWs,
	setPlayerGameLogic,
	playerGameLogic,
}: IProps) {
	const {
		isWatchGame,
		setIsDisable,
		setLoading,
		selectNav,
		setStartGame,
		startGame,
	} = useMainPage();

	const responsive = useResponsive();
	function handleClick() {
		/*
         TEST MESSAGE EMIT for ingame status: set
         TODO: add `chatWs && chatWs.emit('ingame', 'out');`
            when user exits game!
        */
		chatWs && chatWs.emit('ingame', 'in');

		setLoading(true);
		setIsDisable(false);

		setTimeout(function () {
			setLoading(false);
			setIsDisable(true);
			setStartGame(true);
		}, 1500);
	}

	useEffect(() => {
		window.addEventListener('gameStartedFromChat', () => {
			handleClick();
		});

		return () => {
			window.removeEventListener('gameStartedFromChat', () => {
				handleClick();
			});
		};
	}, []);

	const selectGame = () => {
		if (responsive.small) {
			if (!startGame) {
				return (
					<div className="h-100 w-100 d-flex">
						<Play
							Loadingclick={handleClick}
							setPlayerGameLogic={setPlayerGameLogic}
							playerGameLogic={playerGameLogic}
						/>

						<OnlineGame Loadingclick={handleClick} />
					</div>
				);
			} else {
				return (
					<MainPong
						setPlayerGameLogic={setPlayerGameLogic}
						playerGameLogic={playerGameLogic}
					/>
				);
			}
		}
		if (!responsive.small) {
			if (selectNav) {
				return <OnlineGame Loadingclick={handleClick} />;
			}
			if (startGame || isWatchGame) {
				return (
					<MainPong
						setPlayerGameLogic={setPlayerGameLogic}
						playerGameLogic={playerGameLogic}
					/>
				);
			} else {
				return (
					<Play
						Loadingclick={handleClick}
						setPlayerGameLogic={setPlayerGameLogic}
						playerGameLogic={playerGameLogic}
					/>
				);
			}
		}
	};

	return (
		<div className="d-flex MainGame">
			<div className="h-100 w-100">{selectGame()}</div>
		</div>
	);
}
