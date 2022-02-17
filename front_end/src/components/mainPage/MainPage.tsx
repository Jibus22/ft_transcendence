import { Backdrop, CircularProgress } from '@mui/material';
import { useMount, useSafeState } from 'ahooks';
import axios, { AxiosError } from 'axios';
import { generatePrimeSync } from 'crypto';
import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { ErrorPage, Game, Header, HistoryGame, ParamUser, SnackBarre, UserRank } from '..';
import { useMainPage } from '../../MainPageContext';
import './mainPage.scss';

import { User, Rank } from '../type';

const MainPage = () => {
	const { gameWs, challengData, setGameWs, setData, setChallengData, leaveGame, dialogueLoading, disconectAuth } = useMainPage();

	// const [chatWs, setChatWs] = useSafeState<Socket | undefined>(undefined);
	const [chatWs, setChatWs] = useState<Socket | undefined>(undefined);
	// const [connectionTrieschatWs, setConnectionsTriesChatWs] = useState<number>(0);

	// const [gameWs, setGameWs] = useState<Socket | undefined>(undefined);

	// const [connectionTriesgameWs, setConnectionsTriesGameWs] = useState<number>(0);
	const [time, setTime] = useState(false);
	const [isHeader, setIsHeader] = useState(true);
	const [openDialog, setOpenDIalog] = useState(false);

	const [wsId, setWsId] = useState('');

	let navigate = useNavigate();

	const [timeSnack, setTimeSnack] = useState(false);

	const fetchDataUserMe = async () => {
		try {
			const response = await axios.get(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/me`, {
				withCredentials: true,
			});
			setData([response.data]);
		} catch (error) {
			setOpenDIalog(true);
			setTimeout(function () {
				setOpenDIalog(false);
				disconectAuth();
			}, 3000);
		}
	};

	const setWsCallbacks = (socket: Socket, stateSetter: (value: React.SetStateAction<Socket | undefined>) => void) => {
		/* -----------------------
		 ** Connection
		 * -----------------------*/

		socket.on('connect', () => {
			console.log(`[CHAT SOCKET 🍄 ] WS CONNECT`);
			stateSetter(socket);
		});

		socket.on('disconnect', () => {
			console.log(`[CHAT SOCKET 🍄 ] WS DISCONNECTED`);
			doConnect(socket, stateSetter);
		});

		socket.on('connect_error', async (err) => {
			console.log('[CHAT SOCKET 🍄 ] connect_error', err);
			connectWs('ws://localhost:3000/chat', setWsCallbacks, stateSetter);
		});

		socket.io.on('error', (error) => {
			console.log('[CHAT SOCKET 🍄 ] ⚠️ RECEIVED ERROR', error);
		});

		/* -----------------------
		 ** Events
		 * -----------------------*/

		socket.on('publicRoomCreated', (message) => {
			console.log(`💌  Event: publicRoomCreated ->`, message);
			window.dispatchEvent(new CustomEvent('publicRoomCreated', { detail: message }));
		});
		socket.on('publicRoomUpdated', (message) => {
			console.log(`💌  Event: publicRoomUpdated ->`, message);
			window.dispatchEvent(new CustomEvent('publicRoomUpdated', { detail: message }));
		});
		socket.on('publicRoomRemoved', (message) => {
			console.log(`💌  Event: publicRoomRemoved ->`, message);
		});
		socket.on('newMessage', (message) => {
			console.log(`💌  Event: newMessage ->`, message);
			window.dispatchEvent(new CustomEvent('newMessage', { detail: message }));
		});
		socket.on('roomParticipantUpdated', (message) => {
			console.log(`💌  Event: roomParticipantUpdated ->`, message);
			window.dispatchEvent(new CustomEvent('roomParticipantUpdated', { detail: message }));
		});
		socket.on('userAdded', (message) => {
			console.log(`💌  Event: userAdded ->`, message);
			window.dispatchEvent(new CustomEvent('userAdded', { detail: message }));
		});
		socket.on('userRemoved', (message) => {
			console.log(`💌  Event: userRemoved ->`, message);
		});
		socket.on('userModeration', (message) => {
			console.log(`💌  Event: userModeration ->`, message);
		});
		socket.on('userBanned', (message) => {
			console.log(`💌  Event: userBanned ->`, message);
		});
	};

	const gameCallbacks = (socket: Socket, stateSetter: (value: React.SetStateAction<Socket | undefined>) => void) => {
		/* -----------------------
		 ** Connection
		 * -----------------------*/

		socket.on('connect', () => {
			console.log(`[GAME SOCKET 🎲 ] WS CONNECT`);
		});

		socket.on('disconnect', () => {
			console.log(`[GAME SOCKET 🎲 ] WS DISCONNECTED`);
			doConnect(socket, stateSetter);
		});

		socket.on('connect_error', async (err) => {
			console.log('[GAME SOCKET 🎲 ] connect_error', err);
			connectWs('ws://localhost:3000/game', gameCallbacks, stateSetter);
		});

		socket.io.on('error', (error) => {
			console.log('[GAME SOCKET 🎲 ] ⚠️ RECEIVED ERROR', error);
		});

		/* -----------------------
		 ** Game events
		 * -----------------------*/

		// This is for test
		// const wait = (timeToDelay: number) => new Promise((resolve) => setTimeout(resolve, timeToDelay));

		//Cet event devrait être mis 'off' quand on est sur la page d'attente d'un
		//jeu/en train de jouer.

		// socket.on('gameInvitation', async (challengerData, challengerWsId) => {
		// 	console.log(`💌  Event: gameInvitation ->`, challengerData, ` -- id: ${challengerWsId}`);
		// 	// Afficher une notification avec challengerData (userDto) et créer
		// 	// un onClick event qui reste 10sec à l'écran
		// 	// Si dans les 10 secondes
		// 	//
		// 	// Si c'est OK, afficher la page d'attente du jeu (sans avoir la possibilité
		// 	// de choisir la map, puisqu'on est l'invité)
		// 	// Sinon, virer la notif
		// 	// setTest(challengerData);

		// 	test = 'coucou';

		// 	// setWsId(challengerWsId);

		// 	// socket.emit('gameInvitResponse', { response: 'OK', to: challengerWsId });
		// 	// socket.emit('gameInvitResponse', { response: 'KO', to: challengerWsId });
		// });

		//Cet event devrait être mis 'on' que sur la page d'attente du jeu

		// socket.on('gameDenied', (opponentData) => {
		// 	console.log(`💌  Event: gameDenied -> ${opponentData}`);
		// 	// Afficher une notif ou whatever qui dit que l'opposant n'a pas accepté
		// 	// de jouer avec lui, et retourner sur la page d'accueil. (Parce que si cet
		// 	// event est trigger c'est que le user se trouve sur la page d'attente
		// 	// du jeu)
		// });

		//Cet event devrait être mis 'on' que sur la page d'attente du jeu

		// socket.on('gameAccepted', (opponentData) => {
		// 	console.log(`💌  Event: gameAccepted -> ${opponentData}`);
		// 	// quand on en est là c'est qu'on est sur la page d'attente du jeu.
		// 	// enlever le voile gris sur la photo de l'opponent pour montrer que
		// 	// c'est good.
		// });

		socket.on('newOnlineGame', (obj: any) => {
			console.log(`💌  Event: newOnlineGame -> ${obj}`);
			//catch error
		});

		socket.on('gameFinished', (room: string) => {
			console.log(`💌  Event: gameFinished -> ${room}`);
			//catch error
		});

		socket.on('myerror', (message: string) => {
			console.log(`💌  Event: myerror -> ${message}`);
			//catch error
		});

		/// ---------------- TEST --------------------

		socket.on('serverToClient', async (data: string) => {
			console.log(`💌  Event: serverToClient ->`, data);
			socket.emit('clientToServer', 'This is a message from Client');
		});
		/// ---------------- TEST END ----------------
	};

	/* -----------------------
	 ** Initialization
	 * -----------------------*/

	const getAuthToken = async () => {
		return await axios(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/auth/ws/token`, {
			withCredentials: true,
		}).then((response) => {
			const { token } = response.data;
			if (!token) {
				throw new Error('no valid token');
			}
			return token;
		});
	};

	const doDisconnect = async (socket: Socket | undefined, stateSetter: (value: React.SetStateAction<Socket | undefined>) => void) => {
		stateSetter(undefined);
		if (socket) {
			socket.off('disconnect');
			socket.on('disconnect', () => {
				console.log('user chose to leave !');
			});
			socket.disconnect();
		}
	};

	const doConnect = async (socket: Socket, stateSetter: (value: React.SetStateAction<Socket | undefined>) => void) => {
		setTimeout(async () => {
			await getAuthToken()
				.then((token) => {
					console.log('DOCONNECT', socket);
					socket.auth = { key: `${token}` };
					socket.connect();
				})
				.catch((err) => {
					console.log('DOCONNECT ERROR ->', err);
					stateSetter(undefined);
					doConnect(socket, stateSetter);
				});
		}, 1000);
	};

	const connectWs = async (
		uri: string,
		cbSetter: (socket: Socket, stateSetter: React.Dispatch<React.SetStateAction<Socket | undefined>>) => void,
		stateSetter: (value: React.SetStateAction<Socket | undefined>) => void,
	) => {
		await new Promise((res) => {
			setTimeout(() => {
				const socket = io(uri, {
					autoConnect: false,
					reconnection: false,
					forceNew: true,
				});
				cbSetter(socket, stateSetter);
				stateSetter(socket);
				doConnect(socket, stateSetter);
				res('');
			}, 500);
		});
	};

	useMount(async () => {
		await fetchDataUserMe()
			.then(async () => {
				await connectWs(`ws://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/game`, gameCallbacks, setGameWs);
				await connectWs(`ws://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/chat`, setWsCallbacks, setChatWs);
			})
			.catch((err) => {
				navigate('/');
			});
	});

	useEffect(() => {
		gameWs?.on('gameInvitation', async (challengerData, challengerWsId) => {
			setChallengData([challengerData]);

			setWsId(challengerWsId);
			setTimeSnack(true);
		});
	}, [gameWs, challengData, wsId]);

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

	const blabla = () => {
		console.log('test emit client- server');
		gameWs?.emit('testaccept', 'voila voila voila...');
	};

	return (
		<div className={`${isHeader ? 'mainPageBody' : ''} d-flex flex-column `}>
			<Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={time}>
				<CircularProgress color="inherit" />
			</Backdrop>
			{timeSnack && <SnackBarre wsId={wsId} setTimeSnack={setTimeSnack} timeSnack={timeSnack} />}

			<div>
				<button onClick={disconnectGameWs}>DISCONNECT GAME WS</button>
			</div>
			{headerLeave()}

			<button onClick={blabla}> push </button>

			<Routes>
				<Route path="/MainPage" element={<Game chatWs={chatWs} />} />
				<Route path="/History-Game" element={<HistoryGame />} />
				<Route path="/Setting" element={<ParamUser setTime={setTime} />} />
				<Route path="/Rank" element={<UserRank />} />
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
