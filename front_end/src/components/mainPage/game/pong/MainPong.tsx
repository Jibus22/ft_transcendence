import React, { useEffect, useState } from 'react';
import './pongGame.scss';
import { useSpring, animated } from 'react-spring';
import PongGame from './mateo/PongGame';
import { useMainPage } from '../../../../MainPageContext';
import { Button, CircularProgress } from '@mui/material';

interface Props {
	loading: boolean;
}

export default function MainPong() {
	const props = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 500px)' },
		config: {
			delay: 350,
			duration: 350,
		},
	});

	const { setStartGame, startGame } = useMainPage();

	const closeGame = () => {
		setStartGame(false);
	};

	useEffect(() => {
		return () => {
			setStartGame(false);
		};
	}, []);

	return (
		<animated.div style={props} className="w-100 ">
			<div className="divMainPongGame ">
				{/* <PongGame startGame={setStartGame} /> */}

				<div className="mainPongGame">
					<PongGame startGame={setStartGame} />
					{/* <div className="titlePongGame">
						<h1>VS</h1>
					</div>
					<div className="readyButton">
						<Button className="buttonMui" variant="contained">
							Ready
						</Button>
					</div> */}
				</div>
				<div className="closeButton">
					<button onClick={closeGame}>Close game</button>
				</div>
			</div>
		</animated.div>
	);
}
