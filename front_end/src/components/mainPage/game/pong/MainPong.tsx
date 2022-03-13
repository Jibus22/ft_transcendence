import { Avatar, Button, CircularProgress } from '@mui/material';
import clsx from 'clsx';
import React, { useEffect, useState, Dispatch } from 'react';
import { animated, useSpring } from 'react-spring';
import { useMainPage } from '../../../../MainPageContext';
import MapChoice from './mapChoice/MapChoice';
import PongGame from './mateo/PongGame';
import './pongGame.scss';
import { IOnlineGameRemove, UserDto, PlayerGameLogic } from '../../../type';
import { clearGameData, clearPlayerGameLogic } from '../../utils/utils';

interface IProps {
	setPlayerGameLogic: Dispatch<React.SetStateAction<PlayerGameLogic>>;
	playerGameLogic: PlayerGameLogic;
}

export default function MainPong({
	setPlayerGameLogic,
	playerGameLogic,
}: IProps) {
	console.log('--------- MAINPONG ---------');
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
		dialogueLoading,
		roomId,
		setRoomId,
		gameWs,
		opacity,
		setOpacity,
		watchGameScore,
		isWatchGame,
		setIsWatchGame,
		backInGame,
		setBackInGame,
		dataUserBack,
		setDataUserBack,
		open,
		setOpen,
	} = useMainPage();

	const [openDialogLoading, setOpenDialogLoading] = useState(false);
	const [count, setCount] = useState<number | undefined>();
	const [isChoiceMap, setIsChoiseMao] = useState(false);
	const [map, setMap] = useState<null | 'one' | 'two' | 'three'>(null);
	const [watchId, setWatchId] = useState('');
	const [acceptGame, setAcceptGame] = useState(false);
	const [pauseGame, setPauseGame] = useState(false);

	const closeGame = () => {
		if (isWatchGame) {
			gameWs?.emit('leaveWatchGame', watchGameScore.watch);
			setStartGame(false);
		} else {
			const game_ws = playerGameLogic.opponent.game_ws;
			gameWs?.emit('giveUpGame', {
				bcast: { room: roomId, watchers: watchId, op: game_ws },
			});
			setTimeout(function () {
				setStartGame(false);
			}, 1500);
		}
	};

	const [nbPlayer, setNbPlayer] = useState(0);
	const [disableMap, setDisableMap] = useState<boolean>(false);
	const [scoreJ1, setScoreJ1] = useState(-1);
	const [scoreJ2, setScoreJ2] = useState(-1);

	useEffect(() => {
		console.log('       MAINPONG.   USEFFECT MOUNTING');
		setLeaveGame(true);
		if (!isWatchGame) {
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

			if (!playerGameLogic.isP1) setNbPlayer(2);
			else {
				setNbPlayer(1);
				if (!acceptGame) setOpacity(true);
			}
		} else {
			if (watchGameScore?.watch === '') setStartGame(false);
			setNbPlayer(0);
			setScoreJ1(watchGameScore.challenger.score);
			setScoreJ2(watchGameScore.opponent.score);
			setMap(watchGameScore.map);
		}

		return () => {
			console.log('       MAINPONG.   USEFFECT MOUNTING CLEANUP');
			setLeaveGame(false);
			setIsWatchGame(false);
			setRoomId('');
			setOpen(false);
			setBackInGame(false);
			if (dataUserBack)
				setDataUserBack((prevState: IOnlineGameRemove) =>
					clearGameData(prevState),
				);
			setPlayerGameLogic((prevState: PlayerGameLogic) =>
				clearPlayerGameLogic(prevState),
			);
		};
	}, []);

	useEffect(() => {
		console.log('       MAINPONG.   USEFFECT count');
		gameWs?.on('countDown', (count: number) => {
			setCount(count);
		});

		return () => {
			gameWs?.off('countDown');
		};
	}, [gameWs, count]);

	useEffect(() => {
		console.log('       MAINPONG.   USEFFECT listeners');
		gameWs?.on('startGame', (room: string) => {
			console.log(`💌  Event: startGame -> ${room}`);
			setRoomId(room);
		});

		gameWs?.on('gameAccepted', (opponentData) => {
			console.log(`💌  Event: gameAccepted -> ${opponentData}`);
			setAcceptGame(true);
			setOpacity(false);
		});

		gameWs?.on('gameDenied', (opponentData) => {
			console.log(`💌  Event: gameDenied -> ${opponentData}`);
			setAcceptGame(false);
			setOpenDialogLoading(true);

			setTimeout(() => {
				setOpenDialogLoading(false);
				setStartGame(false);
			}, 1000);
		});

		gameWs?.on('newPlayerJoined', (opponent: UserDto) => {
			console.log(`💌  Event: newPlayerJoined -> `, opponent);
			setPlayerGameLogic((prevState: PlayerGameLogic) => {
				return {
					...prevState,
					opponent: opponent,
				};
			});
			setAcceptGame(true);
			setOpacity(false);
		});

		gameWs?.on(
			'getGameData',
			(gameData: { map: null | 'one' | 'two' | 'three'; watch: string }) => {
				console.log(`💌  Event: GameData ->`, gameData);
				setMap(gameData.map);
				setWatchId(gameData.watch);
			},
		);

		gameWs?.on('gaveUp', (usr: UserDto) => {
			console.log(`💌  Event: gaveUp -> `);
			console.log(usr);
			setStartGame(false);
		});

		gameWs?.on('playerGiveUp', (obj: UserDto) => {
			console.log(`💌  Event: playerGiveUp -> `);
			console.log(obj);
			setStartGame(false);
		});

		return () => {
			console.log('       MAINPONG.   USEFFECT listeners CLEANUP');
			gameWs?.off('startGame');
			gameWs?.off('playerGiveUp');
			gameWs?.off('getGameData');
			gameWs?.off('gameAccepted');
			gameWs?.off('gameDenied');
			gameWs?.off('newPlayerJoined');
			gameWs?.off('gaveUp');
			gameWs?.off('countDown');
		};
	}, [gameWs]);

	useEffect(() => {
		gameWs?.on('setMap', (room: string) => {
			gameWs?.emit('setMap', { room: room, map: map }, (watch: string) => {
				console.log('P1 callback watch return: ', watch);
				setWatchId(watch);
			});
		});

		return () => {
			gameWs?.off('setMap');
		};
	}, [gameWs, map]);

	const titlePrint = () => {
		if (playerGameLogic.isChallenge) {
			return <h1>Waiting for {playerGameLogic.opponent.login}...</h1>;
		} else {
			return <h1>Waiting for an opponent...</h1>;
		}
	};

	const infoOpponent = () => {
		if (playerGameLogic.opponent.login !== '') {
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
