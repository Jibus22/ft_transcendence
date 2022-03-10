import { Avatar, Button, CircularProgress } from '@mui/material';
import { useInterval } from 'ahooks';
import clsx from 'clsx';
import React, { useEffect, useState, Dispatch } from 'react';
import { useNavigate } from 'react-router-dom';
import { animated, useSpring } from 'react-spring';
import { useMainPage } from '../../../../MainPageContext';
import MapChoice from './mapChoice/MapChoice';
import PongGame from './mateo/PongGame';
import './pongGame.scss';
import { User, UserChallenge, UserDto, PlayerGameLogic } from '../../../type';

interface IProps {
	setPlayerGameLogic: Dispatch<React.SetStateAction<PlayerGameLogic>>;
	playerGameLogic: PlayerGameLogic;
}

export default function MainPong({
	setPlayerGameLogic,
	playerGameLogic,
}: IProps) {
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
		// isGameRandom,
		// challengData,
		dialogueLoading,
		dataUserChallenge,
		// setDataUserChallenge,
		// setPlayerNewGameInvit,
		// playerNewGameInvit,
		// setIsGameRandom,
		roomId,
		setRoomId,
		gameWs,
		// isOpponant,
		opacity,
		setOpacity,
		leaveGame,
		// playerNewGameJoin,
		// setDataPlayerNewGameJoin,
		// dataPlayerNewGameJoin,
		watchGameScore,
		isWatchGame,
		setIsWatchGame,
		backInGame,
		dataUserBack,
		setDataUserBack,
		open,
		setOpen,
	} = useMainPage();

	const [openDialogLoading, setOpenDialogLoading] = useState(false);
	const [count, setCount] = useState<number | undefined>();

	const [isChoiceMap, setIsChoiseMao] = useState(false);
	const [map, setMap] = useState<null | 'one' | 'two' | 'three'>(null);
	// const [roomId, setRoomId] = useState('');
	const [watchId, setWatchId] = useState('');
	const [acceptGame, setAcceptGame] = useState(false);

	const [dataGameRandomSocket, setDataGameRandomSocket] = useState<User>();

	// const [loadingNewGamePlayer, setLoadingNewGamePlayer] = useState(false);

	// const [load, setLoad] = useState(false);

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
			const game_ws = playerGameLogic.opponent.game_ws;
			gameWs?.emit('giveUpGame', {
				bcast: { room: roomId, watchers: watchId, op: game_ws },
			});
			setOpen(false);
			setPlayerGameLogic(new PlayerGameLogic());
			setTimeout(function () {
				setStartGame(false);
				setLeaveGame(false);
				setIsWatchGame(false);
				setMap(null);
				setWatchId('');
				setRoomId('');
				setAcceptGame(false);
			}, 1500);
		}
	};

	// const [data, setData] = useState<User[] | UserChallenge[]>([]);
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
		if (backInGame) {
			setScoreJ1(dataUserBack.challenger.score);
			setScoreJ2(dataUserBack.opponent.score);
			setMap(dataUserBack.map);
			setRoomId(dataUserBack.id);
			setWatchId(dataUserBack.watch);
		} else {
			setScoreJ1(0);
			setScoreJ2(0);
		}

		if (!playerGameLogic.isP1) {
			setNbPlayer(2);
			setLeaveGame(true);
			// setData(challengData);
		} else {
			setNbPlayer(1);
			setLeaveGame(true);
			// setData(dataUserChallenge);

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
	}, [leaveGame, dataUserChallenge, nbPlayer]);

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

		gameWs?.on('newPlayerJoined', (opponent: UserDto) => {
			console.log(`💌  Event: newPlayerJoined -> `, opponent);
			// setDataGameRandomSocket(obj);
			setPlayerGameLogic({ ...playerGameLogic, opponent: opponent });
			setAcceptGame(true);
			setOpacity(false);
		});

		// return () => {
		// 	setLeaveGame(false);
		// 	console.log('QUITTTTTTTEEEEEEEE');
		// };
	}, [gameWs, count, dataGameRandomSocket, openDialogLoading]);

	useEffect(() => {
		gameWs?.on('startGame', (room: string) => {
			console.log(`💌  Event: startGame -> ${room}`);
			setRoomId(room);
		});

		gameWs?.on('gaveUp', (usr: UserDto) => {
			console.log(`💌  Event: gaveUp -> `);
			console.log(usr);
			setPlayerGameLogic(new PlayerGameLogic());
			setStartGame(false);
		});

		gameWs?.on('playerGiveUp', (obj: UserDto) => {
			console.log(`💌  Event: playerGiveUp -> `);
			console.log(obj);

			// setOpen(false);
			setPlayerGameLogic(new PlayerGameLogic());
			setStartGame(false);
			// setLeaveGame(false);
			// setIsWatchGame(false);
			// setMap(null);
			// setWatchId('');
			// setRoomId('');
		});

		return () => {
			setLeaveGame(false);
			gameWs?.off('startGame');
			gameWs?.off('playerGiveUp');
			gameWs?.off('setMap');
			gameWs?.off('getGameData');
			gameWs?.off('gameAccepted');
			gameWs?.off('gameDenied');
			gameWs?.off('countDown');
			gameWs?.off('newPlayerJoined');
			gameWs?.off('gaveUp');
		};
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

		gameWs?.on(
			'getGameData',
			(gameData: { map: null | 'one' | 'two' | 'three'; watch: string }) => {
				console.log(`💌  Event: GameData ->`, gameData);
				setMap(gameData.map);
				setWatchId(gameData.watch);
			},
		);
	}, [map]);

	// useEffect(() => {
	// 	if (backInGame) {
	// 		setOpen(false);
	// 		setStartGame(false);
	// 		setLeaveGame(false);
	// 		setIsWatchGame(false);

	// 		if (userName === dataUserBack.challenger.login) {
	// 			setNbPlayer(1);
	// 		} else {
	// 			setNbPlayer(2);
	// 		}
	// 	}
	// }, [backInGame, dataUserBack]);

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
		if (playerGameLogic.isChallenge) {
			return <h1>Waiting for {playerGameLogic.opponent.login}...</h1>;
		} else {
			return <h1>Waiting for an opponent...</h1>;
		}
	};

	const infoOpponent = () => {
		if (playerGameLogic.isChallenge) {
			return (
				<>
					<Avatar alt="userImg" src={playerGameLogic.opponent.photo_url} />
					<div>
						<h1>{playerGameLogic.opponent.login}</h1>
					</div>
				</>
			);
		}
		if (playerGameLogic.isP1 && acceptGame) {
			return (
				<>
					<Avatar alt="userImg" src={playerGameLogic.opponent.photo_url} />
					<div>
						<h1>{playerGameLogic.opponent.login}</h1>
					</div>
				</>
			);
		}

		if (!playerGameLogic.isP1) {
			return (
				<>
					<Avatar alt="userImg" src={playerGameLogic.opponent.photo_url} />
					<div>
						<h1>{playerGameLogic.opponent.login}</h1>
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
					{((roomId !== '' && watchId !== '' && map !== null) ||
						(isWatchGame && map !== null)) &&
					scoreJ1 !== -1 &&
					scoreJ2 !== -1 ? (
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
								{acceptGame || !playerGameLogic.isP1 ? (
									<span className="counterOutput">{count}</span>
								) : (
									titlePrint()
								)}
							</div>

							<div
								className={clsx(
									'infoUser',
									!playerGameLogic.isP1 && 'infoUserReverse',
								)}
							>
								<div className="photoUser">
									<Avatar alt="userImg" src={userImg} />
									<div>
										<h1>{userName}</h1>
									</div>
								</div>

								<div className="loadingVersus">
									{acceptGame || !playerGameLogic.isP1 ? (
										<h1>VS</h1>
									) : (
										<CircularProgress />
									)}
								</div>
								<div className={`${!opacity ? '' : 'photoOp'} photoUser `}>
									{infoOpponent()}
								</div>
							</div>
							<div className="titleMap">
								{playerGameLogic.isP1 && !acceptGame ? (
									<h1>Choose the map</h1>
								) : null}

								{playerGameLogic.isP1 && (
									<div className="selectMap">
										<MapChoice
											disableMap={disableMap}
											setDisableMap={setDisableMap}
											isChoiceMap={isChoiceMap}
											setIsChoiceMap={setIsChoiseMao}
											count={count}
											isOpponant={playerGameLogic.isP1}
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
					<Button
						className="buttonMui"
						variant="contained"
						onClick={() => setOpen(true)}
					>
						Leave
					</Button>
				</div>
				{dialogMui(
					open,
					() => setOpen(false),
					closeGame,
					'Warning !',
					'Are you sure you want to quit the game ?',
				)}
				{dialogueLoading(
					openDialogLoading,
					'Warning',
					'your opponent did not accept the invitation',
					'You will return to the home page',
				)}
				{dialogueLoading(
					pauseGame,
					'Warning',
					'Your opponent has disconnected',
					'',
				)}
			</div>
		</animated.div>
	);
}
