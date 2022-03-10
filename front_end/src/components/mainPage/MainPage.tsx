import { Backdrop, CircularProgress, useMediaQuery } from '@mui/material';
import { useMount } from 'ahooks';
import axios from 'axios';
import React, { useEffect, useState, Dispatch } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import {
	ErrorPage,
	Game,
	Header,
	HistoryGame,
	ParamUser,
	SnackBarre,
	UserRank,
} from '..';
import { useMainPage } from '../../MainPageContext';
import {
	OnlineGameRemooveType,
	OnlineGameType,
	PlayerGameLogic,
	UserDto,
	UserMe,
} from '../type';
import './mainPage.scss';
import { doDisconnect, connectWs } from './socketInit/socketCoreInit';
import { gameCallbacks, setWsCallbacks } from './socketInit/socketCbInit';

const MainPage = () => {
	const {
		gameWs,
		challengData,
		setGameWs,
		setData,
		setChallengData,
		leaveGame,
		dialogueLoading,
		disconectAuth,
		setLoadingSocket,
		setIsGameRandom,
		setPlayerNewGameInvit,
		setIsOpponant,
		setStartGame,
		setBackInGame,
		setDataUserBack,
		setUserName,
		userName,
		setDisableInvitOther,
		disableInvitOther,
		data,
	} = useMainPage();

	// const [connectionTrieschatWs, setConnectionsTriesChatWs] = useState<number>(0);
	// const [gameWs, setGameWs] = useState<Socket | undefined>(undefined);
	// const [connectionTriesgameWs, setConnectionsTriesGameWs] = useState<number>(0);
	// const [load, setLoad] = useState(false);
	const [chatWs, setChatWs] = useState<Socket | undefined>(undefined);
	const [time, setTime] = useState(false);
	const [isHeader, setIsHeader] = useState(true);
	const [openDialog, setOpenDIalog] = useState(false);
	const [timeSnack, setTimeSnack] = useState(false);

	const navigate = useNavigate();

	const fetchDataUserMe = async (
		setter: Dispatch<React.SetStateAction<string>>,
	) => {
		try {
			const response = await axios.get(
				`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/me`,
				{
					withCredentials: true,
				},
			);
			const user: UserMe = response.data;
			setData([response.data]);
			setter(user.login);
			return user.login;
		} catch (error) {
			setOpenDIalog(true);
			setTimeout(function () {
				setOpenDIalog(false);
				disconectAuth();
				navigate('/');
			}, 3000);
		}
	};

	useMount(async () => {
		await fetchDataUserMe(setUserName)
			.then(async (login: string | undefined) => {
				await connectWs(
					`ws://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/game`,
					gameCallbacks,
					setGameWs,
					setLoadingSocket,
				);
				await connectWs(
					`ws://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/chat`,
					setWsCallbacks,
					setChatWs,
					setLoadingSocket,
				);
			})
			.catch(() => {
				navigate('/');
			});
	});

	let countInvit = 0;
	let timer: NodeJS.Timer;
	const [progress, setProgress] = React.useState(0);
	const [wsId, setWsId] = useState('');

	const handleCloseTimeSnack = () => {
		gameWs?.emit(
			'gameInvitResponse',
			{ response: 'KO', to: wsId },
			(response: number) => {
				if (response || !response) setTimeSnack(false);
			},
		);
		setTimeSnack(false);
		setPlayerGameLogic(new PlayerGameLogic());
		countInvit--;
		clearInterval(timer);
	};

	const handleOkTimeSnack = () => {
		gameWs?.emit(
			'gameInvitResponse',
			{ response: 'OK', to: wsId },
			(response: number) => {
				if (!response) {
					setTimeSnack(false);
					setStartGame(true);
					navigate('/Mainpage');
				}
			},
		);
		setTimeSnack(false);
		countInvit--;
		clearInterval(timer);
	};

	// const [opponent, setOpponent] = useState(new UserDto());
	// const [isP2, setIsP2] = useState(false);
	// const [isJoinGame, setIsJoinGame] = useState(false);
	const [playerGameLogic, setPlayerGameLogic] = useState(new PlayerGameLogic());

	useEffect(() => {
		gameWs?.on('gameFinished', (room: string) => {
			console.log(`💌  Event: gameFinished -> ${room}`);
			//enlever l'objet onlinegame de la liste des onlinegames
		});

		gameWs?.on('goBackInGame', (obj: OnlineGameRemooveType) => {
			console.log(`💌  Event: goBackInGame ->`);
			setDataUserBack(obj);

			if (userName === obj.challenger.login) {
				setIsOpponant(true);
			} else {
				setIsOpponant(false);
			}
			setBackInGame(true);
			setIsGameRandom(true);
			setPlayerNewGameInvit(true);
			setStartGame(true);
		});

		gameWs?.on('myerror', (message: string) => {
			console.log(`💌  Event: myerror -> ${message}`);
			//catch error
		});

		gameWs?.on(
			'gameInvitation',
			async (challengerData: UserDto, challengerWsId: string) => {
				countInvit++;
				if (countInvit > 1) {
					setDisableInvitOther(false);
					gameWs?.emit('gameInvitResponse', {
						response: 'KO',
						to: challengerWsId,
					});
					countInvit--;
				} else {
					// setChallengData([challengerData]);
					setPlayerGameLogic({
						...playerGameLogic,
						isP1: false,
						opponent: challengerData,
					});
					setWsId(challengerWsId);
					setTimeSnack(true);
					timer = setInterval(() => {
						setProgress((oldProgress) => {
							if (oldProgress === 102) {
								handleCloseTimeSnack();
								return 0;
							}
							const diff = Math.random() * 0.4;
							return Math.min(oldProgress + diff, 102);
						});
					}, 20);
					setDisableInvitOther(true);
				}
			},
		);

		gameWs?.on('gaveUp', (usr: UserDto) => {
			console.log(`💌  Event: gaveUp ->`);
			console.log(usr);
			setTimeSnack(false);
		});

		return () => {
			gameWs?.off('gaveUp');
			gameWs?.off('gameInvitation');
			gameWs?.off('connect');
			gameWs?.off('disconnect');
			gameWs?.off('connect_error');
			gameWs?.off('error');
			gameWs?.off('gameFinished');
			gameWs?.off('goBackInGame');
			gameWs?.off('myerror');
		};
	}, [gameWs]);

	function disconnectGameWs() {
		console.log('Click disconnect Chat ', gameWs?.id);
		doDisconnect(gameWs, setGameWs);
	}

	const headerLeave = () => {
		if (!leaveGame && isHeader) {
			return (
				<div>
					<Header />
				</div>
			);
		}
	};

	return (
		<div className={`${isHeader ? 'mainPageBody' : ''} d-flex flex-column `}>
			<Backdrop
				sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
				open={time}
			>
				<CircularProgress color="inherit" />
			</Backdrop>
			{timeSnack && (
				<SnackBarre
					timeSnack={timeSnack}
					handleOk={handleOkTimeSnack}
					handleClose={handleCloseTimeSnack}
					progress={progress}
					playerGameLogic={playerGameLogic}
				/>
			)}

			{/* <div>
				<button onClick={disconnectGameWs}>DISCONNECT GAME WS</button>
			</div> */}
			{headerLeave()}

			{/* <button onClick={blabla}> push </button> */}

			<Routes>
				<Route
					path="/MainPage"
					element={
						<Game
							chatWs={chatWs}
							setPlayerGameLogic={setPlayerGameLogic}
							playerGameLogic={playerGameLogic}
						/>
					}
				/>
				<Route path="/History-Game" element={<HistoryGame />} />
				<Route path="/Setting" element={<ParamUser setTime={setTime} />} />
				<Route
					path="/Rank"
					element={<UserRank setPlayerGameLogic={setPlayerGameLogic} />}
				/>
				<Route path="*" element={<ErrorPage isHeader={setIsHeader} />} />
			</Routes>

			{dialogueLoading(
				openDialog,
				'This page could not be loaded',
				'You will be disconnected.',
				'Please identify yourself on the home page',
			)}
		</div>
	);
};
export default MainPage;
