import { Backdrop, CircularProgress } from '@mui/material';
import { useMount } from 'ahooks';
import axios from 'axios';
import React, { useEffect, useState, Dispatch } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
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
import { IOnlineGameRemove, PlayerGameLogic, UserDto, UserMe } from '../type';
import './mainPage.scss';
import { connectWs } from './socketInit/socketCoreInit';
import { gameCallbacks, setWsCallbacks } from './socketInit/socketCbInit';
import { clearPlayerGameLogic } from './utils/utils';

const MainPage = () => {
	console.log('--------- MAINPAGE ---------');
	const {
		gameWs,
		setGameWs,
		setData,
		leaveGame,
		dialogueLoading,
		disconectAuth,
		setLoadingSocket,
		setStartGame,
		setBackInGame,
		setDataUserBack,
		setUserName,
		userName,
		setDisableInvitOther,
	} = useMainPage();

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
			setData(user);
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
			.then(async () => {
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

	const [playerGameLogic, setPlayerGameLogic] = useState(() => {
		return new PlayerGameLogic();
	});

	const handleCloseTimeSnack = () => {
		gameWs?.emit(
			'gameInvitResponse',
			{ response: 'KO', to: wsId },
			(response: number) => {
				if (response || !response) setTimeSnack(false);
			},
		);
		setTimeSnack(false);
		setPlayerGameLogic((prevState: PlayerGameLogic) =>
			clearPlayerGameLogic(prevState),
		);
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

	useEffect(() => {
		gameWs?.on('gameFinished', (room: string) => {
			console.log(`💌  Event: gameFinished -> ${room}`);
			//enlever l'objet onlinegame de la liste des onlinegames
		});

		gameWs?.on('goBackInGame', (gameData: IOnlineGameRemove) => {
			console.log(`💌  Event: goBackInGame ->`);
			if (userName === gameData.challenger.login)
				setPlayerGameLogic(() => {
					return {
						opponent: gameData.opponent,
						isP1: true,
						isChallenge: false,
					};
				});
			else
				setPlayerGameLogic(() => {
					return {
						opponent: gameData.challenger,
						isP1: false,
						isChallenge: false,
					};
				});
			setDataUserBack(gameData);
			setBackInGame(true);
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
					setPlayerGameLogic((prevState: PlayerGameLogic) => {
						return {
							...prevState,
							isP1: false,
							opponent: challengerData,
						};
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
			{headerLeave()}
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
