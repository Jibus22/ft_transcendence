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
		dialogueLoading,
		dataUserChallenge,
		gameWs,
		isOpponant,
		opacity,
		setOpacity,
	} = useMainPage();
	const [open, setOpen] = useState(false);
	const [openDialogLoading, setOpenDialogLoading] = useState(false);
	const [count, setCount] = useState<number | undefined>();

	const [isChoiceMap, setIsChoiseMao] = useState(false);
	const [map, setMap] = useState<null | 'one' | 'two' | 'three'>(null);
	const [roomId, setRoomId] = useState('');
	const [acceptGame, setAcceptGame] = useState(false);

	const closeGame = () => {
		setOpen(false);
		setStartGame(false);
		setLeaveGame(false);
	};

	const [data, setData] = useState<User[] | UserChallenge[]>([]);
	const [nbPlayer, setNbPlayer] = useState(0);

	const [disableMap, setDisableMap] = useState<boolean>(false);

	useEffect(() => {
		setLeaveGame(true);

		if (!isOpponant) {
			setData(challengData);
			//console.log('exterieur');]
			setNbPlayer(1);
		} else {
			setData(dataUserChallenge);
			//console.log('domicile');
			setNbPlayer(2);
			if (acceptGame === false) {
				setOpacity(true);
			}
		}

		gameWs?.on('gameAccepted', (opponentData) => {
			console.log(`💌  Event: gameAccepted -> ${opponentData}`);
			setAcceptGame(true);
			setOpacity(false);
		});
		gameWs?.on('gameDenied', (opponentData) => {
			console.log(`💌  Event: gameDenied -> ${opponentData}`);
			setAcceptGame(false);
			setOpenDialogLoading(true);
			setTimeout(function () {
				setOpenDialogLoading(false);
				closeGame();
			}, 3000);
		});

		gameWs?.on('countDown', (count: number) => {
			setCount(count);
		});

		gameWs?.on('startGame', (room: string) => {
			console.log(`💌  Event: startGame -> ${room}`);
			setRoomId(room);
		});

		return () => {
			setLeaveGame(false);
		};
	}, [gameWs, count, map]);

	useEffect(() => {
		if (map !== null) {
			gameWs?.on('setMap', (cb: (map: string) => void) => {
				cb(map);
				// console.log(`💌  Event: setMap -> ${cb}`);
				console.log('map is ==== ', map);
			});
		}
	}, [map]);

	const titlePrint = () => {
		if (!isGameRandom) {
			return <h1>Waiting for {data[0]?.login}...</h1>;
		} else {
			return <h1>Waiting for an opponent...</h1>;
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
			console.log('fdwsfdfsdfsgsdgdsfdssdf');
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
							<div className="titlePongGame">
								{acceptGame || !isOpponant ? <span className="counterOutput">{count}</span> : titlePrint()}
							</div>

							<div className={clsx('infoUser', !isOpponant && 'infoUserReverse')}>
								<div className="photoUser">
									<Avatar alt="userImg" src={userImg} />
									<div>
										<h1>{userName}</h1>
									</div>
								</div>

								<div className="loadingVersus">{acceptGame || !isOpponant ? <h1>VS</h1> : <CircularProgress />}</div>
								<div className={`${!opacity ? '' : 'photoOp'} photoUser `}>{infoOpponent()}</div>
							</div>
							<div className="titleMap">
								{isOpponant ? <h1>Choose the map</h1> : null}

								{isOpponant && (
									<div className="selectMap">
										<MapChoice
											disableMap={disableMap}
											setDisableMap={setDisableMap}
											isChoiceMap={isChoiceMap}
											setIsChoiceMap={setIsChoiseMao}
											count={count}
											isOpponant={isOpponant}
											setMap={setMap}
											map={map}
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
				</div>
				{dialogMui(open, () => setOpen(false), closeGame, 'Warning !', 'Are you sure you want to quit the game ?')}
				{dialogueLoading(openDialogLoading, 'Warning', 'your opponant did not accept the invitation', 'You will return to the home page')}
			</div>
		</animated.div>
	);
}
