import { Avatar, Button, CircularProgress } from '@mui/material';
import { useInterval } from 'ahooks';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { animated, useSpring } from 'react-spring';
import { useMainPage } from '../../../../MainPageContext';
import MapChoice from './mapChoice/MapChoice';
import PongGame from './mateo/PongGame';
import './pongGame.scss';
import { User, UserChallenge } from '../../../type';

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

	const {
		setStartGame,
		userName,
		userImg,
		dialogMui,
		setLeaveGame,
		isGameRandom,
		challengData,
		dataUserGame,
		dataUserChallenge,
		gameWs,
		isOpponant,
		opacity,
		setOpacity,
	} = useMainPage();
	const [open, setOpen] = useState(false);
	const [count, setCount] = useState(5);
	const [countMap, setCountMap] = useState(2000);
	const [isCount, setIsCount] = useState(false);
	const [interval, setInterval] = useState<number | undefined>(undefined);
	const [isChoiceMap, setIsChoiseMao] = useState(false);

	const [acceptGame, setAcceptGame] = useState(false);

	const closeGame = () => {
		setOpen(false);
		setStartGame(false);
		setLeaveGame(false);
	};

	const [data, setData] = useState<User[] | UserChallenge[]>([]);

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

		if (!isOpponant) {
			setData(challengData);
			// setOpacity();
			console.log('exterieur');
		} else {
			setData(dataUserChallenge);
			console.log('domicile');
			if (acceptGame === false) {
				setOpacity(true);
			}
		}

		if (isChoiceMap === false) {
			countMap > 0 && setTimeout(() => setCountMap(countMap - 1), 1000);
		}

		gameWs?.on('gameAccepted', (opponentData) => {
			console.log(`💌  Event: gameAccepted -> ${opponentData}`);
			setAcceptGame(true);
			setOpacity(false);
		});
		gameWs?.on('gameDenied', (opponentData) => {
			console.log(`💌  Event: gameDenied -> ${opponentData}`);
			setAcceptGame(false);
			closeGame();
		});

		return () => {
			setLeaveGame(false);
		};
	}, [countMap, gameWs]);

	const titlePrint = () => {
		if (!isGameRandom) {
			return <h1>Waiting for {data[0]?.login}...</h1>;
		} else {
			return <h1>Waiting for an opponent...</h1>;
		}
	};

	const titleMapSelect = () => {
		if (!disableMap) {
			if (isOpponant) {
				return <h1>Choose the map</h1>;
			}
			if (!isOpponant) {
				return <h1>Waiting for the player who chooses the map</h1>;
			}
		}
		if (disableMap) {
			if (!isOpponant) {
				return <h1>coucou les filouuu</h1>;
			}
		}
	};

	const infoOpponent = () => {
		if (!isGameRandom) {
			return (
				<>
					<Avatar alt="userImg" src={data[0]?.photo_url} />
					<div>
						<h1>{data[0]?.login}</h1>
					</div>
				</>
			);
		} else {
			return (
				<>
					<Avatar alt="userImg" />
					<div>
						<h1>Unknow</h1>
					</div>
				</>
			);
		}
	};

	return (
		<animated.div style={props} className="w-100  animatedGamePong ">
			<div className="divMainPongGame ">
				<div className="w-100 h-100">
					{count === 0 ? (
						<PongGame />
					) : (
						<div className="mainPongGame">
							<div className="titlePongGame">{isCount ? <span className="counterOutput">{count}</span> : titlePrint()}</div>

							<div className={clsx('infoUser', !isOpponant && 'infoUserReverse')}>
								<div className="photoUser">
									<Avatar alt="userImg" src={userImg} />
									<div>
										<h1>{userName}</h1>
									</div>
								</div>

								<div className="loadingVersus">{isCount ? <h1>VS</h1> : <CircularProgress />}</div>
								<div className={`${!opacity ? '' : 'photoOp'} photoUser `}>{infoOpponent()}</div>
							</div>
							<div className="titleMap">
								<div className="countMap"> {countMap === 0 || isChoiceMap ? null : countMap}</div>

								{/* {!disableMap ? <h1>Choose the map</h1> : null} */}
								{titleMapSelect()}

								{isOpponant && (
									<div className="selectMap">
										<MapChoice
											disableMap={disableMap}
											setDisableMap={setDisableMap}
											isChoiceMap={isChoiceMap}
											setIsChoiceMap={setIsChoiseMao}
											countMap={countMap}
											isOpponant={isOpponant}
										/>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
				<div className="closeButton">
					<Button className="buttonMui" variant="contained" onClick={() => setOpen(true)}>
						Leave
					</Button>

					<button onClick={countdown}>Start</button>
				</div>
				{dialogMui(open, () => setOpen(false), closeGame, 'Warning !', 'Are you sure you want to quit the game ?')}
			</div>
		</animated.div>
	);
}
