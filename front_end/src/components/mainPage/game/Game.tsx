import { useMediaQuery } from '@mui/material';
import React from 'react';
import { Socket } from 'socket.io-client';
import { Play, OnlineGame } from '../..';
import { useMainPage } from '../../../MainPageContext';
import './game.scss';
import MainPong from './pong/MainPong';
import { Routes, Route } from 'react-router-dom';

interface Props {
	wsStatus: Socket | undefined;
}

export default function Game({ wsStatus }: Props) {
	const { setTimeSnack, timer, loading, setIsDisable, setLoading, setIsFriends, selectNav, setStartGame, startGame } = useMainPage();

	function handleClick() {
		/*
         TEST MESSAGE EMIT for ingame status: set
         TODO: add `wsStatus && wsStatus.emit('ingame', 'out');`
            when user exits game!
        */
		wsStatus && wsStatus.emit('ingame', 'in');

		setStartGame(true);

		// setLoading(true);
		// setIsDisable(false);
		// setTimeSnack(false);
		// setIsFriends(false);
		// setTimeout(function () {
		// 	setLoading(false);
		// 	setIsDisable(true);
		// 	setTimeSnack(true);
		// }, timer);
	}

	const test = () => {
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

	const isNavSelected = () => {
		if (selectNav) {
			return <OnlineGame Loadingclick={handleClick} />;
		} else {
			return <Play Loadingclick={handleClick} />;
		}
	};

	const query = useMediaQuery('(max-width:1060px)');

	// const OngletGame = () => {
	// 	return (
	// 		<Routes>
	// 			<Route path="/*" element={<Play Loadingclick={handleClick} />} />
	// 			<Route path="/Onlines-game" element={<OnlineGame Loadingclick={handleClick} />} />
	// 		</Routes>
	// 	);
	// };

	return (
		<div className="d-flex MainGame">
			{/* {!query ? (
				<div className="h-100 w-100 d-flex">
					<Play Loadingclick={handleClick} />
					<OnlineGame Loadingclick={handleClick} />
				</div>
			) : (
				<div className="h-100 w-100">{isNavSelected()}</div>
			)} */}
			<div className="h-100 w-100">{test()}</div>
		</div>
	);
}
