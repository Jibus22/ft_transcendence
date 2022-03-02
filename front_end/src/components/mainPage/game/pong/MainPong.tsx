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
		setPlayerNewGameInvit,
		playerNewGameInvit,
		setIsGameRandom,
		gameWs,
		isOpponant,
		opacity,
		setOpacity,
		leaveGame,
		playerNewGameJoin,
		dataPlayerNewGameJoin,
		watchGameScore,
		isWatchGame,
		setIsWatchGame,
	} = useMainPage();
	const [open, setOpen] = useState(false);
	const [openDialogLoading, setOpenDialogLoading] = useState(false);
	const [count, setCount] = useState<number | undefined>();

	const [isChoiceMap, setIsChoiseMao] = useState(false);
	const [map, setMap] = useState<null | 'one' | 'two' | 'three'>(null);
	const [roomId, setRoomId] = useState('');
	const [watchId, setWatchId] = useState('');
	const [acceptGame, setAcceptGame] = useState(false);

	const [dataGameRandomSocket, setDataGameRandomSocket] = useState<User>();

	const [loadingNewGamePlayer, setLoadingNewGamePlayer] = useState(false);

	const [load, setLoad] = useState(false);

	const [pauseGame, setPauseGame] = useState(false);

	const closeGame = () => {
		// setOpen(false);
		// setStartGame(false);
		// setLeaveGame(false);

		if (isWatchGame) {
			gameWs?.emit('leaveWatchGame', watchGameScore.watch);
			setOpen(false);
			setStartGame(false);
			setLeaveGame(false);
			setIsWatchGame(false);
		} else {
			gameWs?.emit('giveUpGame', { bcast: { room: roomId, watchers: watchId } });
			setOpen(false);
			setStartGame(false);
			setLeaveGame(false);
			setIsWatchGame(false);
			setMap(null);
			setWatchId('');
			setRoomId('');
		}
	};

	const [data, setData] = useState<User[] | UserChallenge[]>([]);
	const [nbPlayer, setNbPlayer] = useState(0);

	const [disableMap, setDisableMap] = useState<boolean>(false);

	const [scoreJ1, setScoreJ1] = useState(-1);
	const [scoreJ2, setScoreJ2] = useState(-1);

	useEffect(() => {
		if (isWatchGame) {
			setScoreJ1(watchGameScore.challenger.score);
			setScoreJ2(watchGameScore.opponent.score);
		}
	}, [isWatchGame, watchGameScore]);

	useEffect(() => {
		// setLeaveGame(true);

		if (!isOpponant) {
			setLeaveGame(true);
			setData(challengData);
			// console.log('exterieur');
			setScoreJ2(0);
			setScoreJ1(0);

			setNbPlayer(2);
		} else {
			setLeaveGame(true);
			setData(dataUserChallenge);
			// console.log('domicile');

			setNbPlayer(1);
			setScoreJ1(0);
			setScoreJ2(0);
			if (acceptGame === false) {
				setOpacity(true);
			}
		}

		return () => {
			// setIsGameRandom(false);
			// setLeaveGame(false);
			// setPlayerNewGameInvit(false);
			// setIsOpponant(false);
		};
	}, [isOpponant, leaveGame, dataUserChallenge]);

	useEffect(() => {
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
			// console.log(`count: ${count}`);
			setCount(count);
		});

		gameWs?.on('newPlayerJoined', (obj: User) => {
			console.log(`💌  Event: newPlayerJoined -> `, obj);
			setDataGameRandomSocket(obj);
			setAcceptGame(true);
			setOpacity(false);
		});

		return () => {
			setLeaveGame(false);
		};
	}, [gameWs, count, dataGameRandomSocket]);

	useEffect(() => {
		gameWs?.on('startGame', (room: string) => {
			console.log(`💌  Event: startGame -> ${room}`);
			setRoomId(room);
		});
	}, [gameWs]);

	useEffect(() => {
		gameWs?.on('setMap', (room: string) => {
			// console.log(`💌  Event: setMap -> ${cb}`);

			if (map !== null) {
				gameWs?.emit('setMap', { room: room, map: map }, (watch: string) => {
					console.log('P1 callback watch return: ', watch);
					setWatchId(watch);
				});
			}
			// console.log('map is ==== ', map);
		});

		gameWs?.on('getGameData', (gameData: { map: null | 'one' | 'two' | 'three'; watch: string }) => {
			console.log(`💌  Event: getMap ->`, gameData);
			setMap(gameData.map);
			setWatchId(gameData.watch);

			console.log('joueur 2 ===== map', map);
		});
	}, [map]);

	// useEffect(() => {
	// 	gameWs?.on('getGameData', (gameData: { map: null | 'one' | 'two' | 'three'; watch: string }) => {
	// 		console.log(`💌  Event: getMap ->`, gameData);
	// 		setMap(gameData.map);
	// 		setWatchId(gameData.watch);

	// 		console.log('joueur 2 ===== map', map);
	// 	});
	// }, [map]);

	useEffect(() => {
		if (isWatchGame) {
			// setLoad(true);

			setNbPlayer(0);
			setScoreJ1(watchGameScore.challenger.score);
			setScoreJ2(watchGameScore.opponent.score);

			setMap(watchGameScore.map);
		}
		// return () => {
		// 	setIsWatchGame(false);
		// };
	}, [isWatchGame, watchGameScore, map, scoreJ1, scoreJ2]);

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
		}
		if (playerNewGameInvit && acceptGame) {
			return (
				<>
					<Avatar alt="userImg" src={dataGameRandomSocket?.photo_url} />
					<div>
						<h1>{dataGameRandomSocket?.login}</h1>
					</div>
				</>
			);
		}

		if (playerNewGameJoin) {
			return (
				<>
					<Avatar alt="userImg" src={dataPlayerNewGameJoin?.photo_url} />
					<div>
						<h1>{dataPlayerNewGameJoin?.login}</h1>
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
			<div className="divMainPongGame">
				<div className="w-100 h-100 ">
					{((roomId !== '' && watchId !== '' && map !== null) || (isWatchGame && map !== null)) && scoreJ1 !== -1 && scoreJ2 !== -1 ? (
						<div className="container__MapGame">
							<PongGame
								map={map}
								room={roomId}
								watch={watchId}
								joueur={nbPlayer}
								socket={gameWs}
								setPauseGame={setPauseGame}
								scoreJ1={scoreJ1}
								scoreJ2={scoreJ2}
							/>
						</div>
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
								{isOpponant && !acceptGame ? <h1>Choose the map</h1> : null}

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
