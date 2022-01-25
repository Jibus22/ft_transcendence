import { Avatar, Button, CircularProgress } from '@mui/material';
import { useInterval } from 'ahooks';
import React, { useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { useMainPage } from '../../../../MainPageContext';
import MapChoice from './mapChoice/MapChoice';
import PongGame from './mateo/PongGame';
import './pongGame.scss';

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

	const { setStartGame, userName, userImg, dialogMui, setLeaveGame } = useMainPage();
	const [open, setOpen] = useState(false);

	const closeGame = () => {
		setOpen(false);
		setStartGame(false);
		setLeaveGame(false);
	};

	const handleClick = () => {
		setOpen(true);
	};
	const disagree = () => {
		setOpen(false);
	};

	const [count, setCount] = useState(5);
	const [countMap, setCountMap] = useState(7);
	const [isCount, setIsCount] = useState(false);
	const [interval, setInterval] = useState<number | undefined>(undefined);
	const [isChoiceMap, setIsChoiseMao] = useState(false);

	const countdown = () => {
		setIsCount(true);

		setInterval(1000);
	};

	const [disableMap, setDisableMap] = useState<boolean>(false);

	useInterval(() => {
		setCount(count - 1);
		if (count === 1) {
			setInterval(undefined);
		}
	}, interval);

	useEffect(() => {
		setLeaveGame(true);

		if (isChoiceMap === false) {
			countMap > 0 && setTimeout(() => setCountMap(countMap - 1), 1000);
		}

		return () => {
			setLeaveGame(false);
		};
	}, [countMap]);

	return (
		<animated.div style={props} className="w-100  animatedGamePong ">
			<div className="divMainPongGame ">
				<div className="w-100 h-100">
					{count === 0 ? (
						<PongGame />
					) : (
						<div className="mainPongGame">
							<div className="titlePongGame">
								{isCount ? <span className="counterOutput">{count}</span> : <h1>Waiting for an opponent...</h1>}
							</div>

							<div className="infoUser">
								<div className="photoUser">
									<Avatar alt="userImg" src={userImg} />
									<div>
										<h1>{userName}</h1>
									</div>
								</div>

								<div className="loadingVersus">{isCount ? <h1>VS</h1> : <CircularProgress />}</div>
								<div className="photoUser">
									<Avatar alt="userImg" />
									<div>
										<h1>unknown</h1>
									</div>
								</div>
							</div>
							<div className="titleMap">
								<div className="countMap"> {countMap === 0 || isChoiceMap ? null : countMap}</div>

								{!disableMap ? <h1>Choose the map</h1> : null}

								<div className="selectMap">
									<MapChoice
										disableMap={disableMap}
										setDisableMap={setDisableMap}
										isChoiceMap={isChoiceMap}
										setIsChoiceMap={setIsChoiseMao}
										countMap={countMap}
									/>
								</div>
							</div>
						</div>
					)}
				</div>
				<div className="closeButton">
					<Button className="buttonMui" variant="contained" onClick={handleClick}>
						Leave
					</Button>

					<button onClick={countdown}>Start</button>
				</div>
				{dialogMui(open, disagree, closeGame, 'Warning !', 'Are you sure you want to quit the game ?')}
			</div>
		</animated.div>
	);
}
