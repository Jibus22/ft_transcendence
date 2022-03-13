import { Backdrop, CircularProgress } from '@mui/material';
import { useMount } from 'ahooks';
import axios from 'axios';
import React, { useEffect, useState, Dispatch, useCallback } from 'react';
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
		playerGameLogic,
		setPlayerGameLogic,
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

	// let countInvit = 0;
	const [wsId, setWsId] = useState('');
	const [countInvit, setCountInvit] = useState(0);

	console.log(`countInvit inisde ManPage component: ${countInvit}`);

	useEffect(() => {
		console.log('INTO MAINPAGE UUSEFFECTTTTT');
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
			setDataUserBack(() => gameData);
			setBackInGame(true);
			setStartGame(true);
		});

		gameWs?.on('myerror', (message: string) => {
			console.log(`💌  Event: myerror -> ${message}`);
			//catch error
		});

		gameWs?.on('gaveUp', (usr: UserDto) => {
			console.log(`💌  Event: gaveUp ->`);
			console.log(usr);
			if (countInvit > 0) setCountInvit((c) => c - 1);
			setTimeSnack(false);
		});

		return () => {
			console.log('MAINPAGE CLEANUP');
			gameWs?.off('gaveUp');
			gameWs?.off('connect');
			gameWs?.off('disconnect');
			gameWs?.off('connect_error');
			gameWs?.off('error');
			gameWs?.off('gameFinished');
			gameWs?.off('goBackInGame');
			gameWs?.off('myerror');
		};
	}, [gameWs, countInvit]);

	useEffect(() => {
		gameWs?.on(
			'gameInvitation',
			async (challengerData: UserDto, challengerWsId: string) => {
				setCountInvit((c) => c + 1);
				console.log(`countInvit inside game invitation: ${countInvit}`);
				if (countInvit > 0) {
					gameWs?.emit('gameInvitResponse', {
						response: 'KO',
						to: challengerWsId,
					});
					setCountInvit((c) => c - 1);
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
				}
			},
		);

		return () => {
			gameWs?.off('gameInvitation');
		};
	}, [gameWs, countInvit]);

	const headerLeave = () => {
		if (!leaveGame && isHeader) {
			return (
				<div>
					<Header />
				</div>
			);
		}
	};

	const handleKo = useCallback(() => {
		gameWs?.emit(
			'gameInvitResponse',
			{ response: 'KO', to: wsId },
			(response: number) => {},
		);
		setPlayerGameLogic((prevState: PlayerGameLogic) =>
			clearPlayerGameLogic(prevState),
		);
		setCountInvit(countInvit - 1);
		console.log(`countInvit inside close CB after dec: ${countInvit}`);
		setTimeSnack(false);
		// navigate('/Mainpage');
	}, [countInvit, wsId]);

	const handleOk = useCallback(() => {
		gameWs?.emit(
			'gameInvitResponse',
			{ response: 'OK', to: wsId },
			(response: number) => {
				if (response === 0) setStartGame(true);
				console.log(`response event: ${response}`);
			},
		);
		setCountInvit(countInvit - 1);
		console.log(`countInvit inside ok CB after dec: ${countInvit}`);
		setTimeSnack(false);
		navigate('/Mainpage');
	}, [countInvit, wsId]);

	console.log('playerGameLogic');
	console.log(playerGameLogic);

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
					playerGameLogic={playerGameLogic}
					handleOk={handleOk}
					handleKo={handleKo}
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
