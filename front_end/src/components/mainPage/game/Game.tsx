import { useMediaQuery } from '@mui/material';
import React from 'react';
import { Socket } from 'socket.io-client';
import { OnlineGame, Play } from '../..';
// import { Play, OnlineGame } from '../..';
import { useMainPage } from '../../../MainPageContext';
import './game.scss';
import MainPong from './pong/MainPong';

interface Props {
	wsStatus: Socket | undefined;
}

export default function Game({ wsStatus }: Props) {
	const { setTimeSnack, loading, setIsDisable, setLoading, setIsFriends, selectNav, setStartGame, startGame } = useMainPage();

	// const { selectNav, setStartGame, startGame } = useMainPage();

	const query = useMediaQuery('(max-width:1060px)');
	function handleClick() {
		/*
         TEST MESSAGE EMIT for ingame status: set
         TODO: add `wsStatus && wsStatus.emit('ingame', 'out');`
            when user exits game!
        */
		wsStatus && wsStatus.emit('ingame', 'in');

		// setStartGame(true);

		setLoading(true);
		setIsDisable(false);
		// setIsFriends(false);
		// setTimeSnack(false);

		setTimeout(function () {
			setLoading(false);
			setIsDisable(true);
			setStartGame(true);
			// setTimeSnack(true);
		}, 1500);
	}

	const selectGame = () => {
		if (!query) {
			if (!startGame) {
				return (
					<div className="h-100 w-100 d-flex">
						<Play Loadingclick={handleClick} />
						<OnlineGame Loadingclick={handleClick} />
					</div>
				);
			} else {
				return <MainPong />;
			}
		} else {
			if (selectNav) {
				return <OnlineGame Loadingclick={handleClick} />;
			}
			if (startGame) {
				return <MainPong />;
			} else {
				return <Play Loadingclick={handleClick} />;
			}
		}
	};

	return (
		<div className="d-flex MainGame">
			<div className="h-100 w-100">{selectGame()}</div>
		</div>
	);
}
