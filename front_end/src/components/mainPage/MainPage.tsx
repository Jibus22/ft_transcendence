import { Backdrop, CircularProgress, useMediaQuery } from '@mui/material';
import { useMount } from 'ahooks';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { ErrorPage, Game, Header, HistoryGame, ParamUser, SnackBarre, UserRank } from '..';
import { useMainPage } from '../../MainPageContext';
import { OnlineGameRemooveType, OnlineGameType, UserDto, UserMe } from '../type';
import './mainPage.scss';

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
		setDisableInvitOther,
		disableInvitOther,
		data,
		userName,
	} = useMainPage();

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

	const [load, setLoad] = useState(false);

	let lol: string;

	const fetchDataUserMe = async () => {
		try {
			const response = await axios.get(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/me`, {
				withCredentials: true,
			});
			const user: UserMe = response.data;

			setData([response.data]);

			// console.log(response.data[0]['login']);

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

	const setWsCallbacks = (
		socket: Socket,
		stateSetter: (value: React.SetStateAction<Socket | undefined>) => void,
		login: string | undefined,
	) => {
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
			connectWs(`ws://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/chat`, setWsCallbacks, stateSetter, login);
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

	const gameCallbacks = (
		socket: Socket,
		stateSetter: (value: React.SetStateAction<Socket | undefined>) => void,
		login: string | undefined,
	) => {
		/* -----------------------
		 ** Connection
		 * -----------------------*/

		socket.on('connect', () => {
			console.log(`[GAME SOCKET 🎲 ] WS CONNECT`);
			setLoadingSocket(true);
		});

		socket.on('disconnect', () => {
			console.log(`[GAME SOCKET 🎲 ] WS DISCONNECTED`);
			doConnect(socket, stateSetter);
		});

		socket.on('connect_error', async (err) => {
			console.log('[GAME SOCKET 🎲 ] connect_error', err);
			connectWs(`ws://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/game`, gameCallbacks, stateSetter, login);
		});

		socket.io.on('error', (error) => {
			console.log('[GAME SOCKET 🎲 ] ⚠️ RECEIVED ERROR', error);
		});

		/* -----------------------
		 ** Game events
		 * -----------------------*/

		socket.on('gameFinished', (room: string) => {
			console.log(`💌  Event: gameFinished -> ${room}`);
			//enlever l'objet onlinegame de la liste des onlinegames
		});

		socket.on('goBackInGame', (obj: OnlineGameRemooveType) => {
			console.log(`💌  Event: goBackInGame ->`);
			// console.log('ici ====', obj);
			//Server detected the client was playing before disconnecting so it gives
			//thru this event an OnlineGameDto so that we can call the game component
			//and go back to the game.

			setDataUserBack(obj);

			if (login === obj.challenger.login) {
				setIsOpponant(true);
			} else {
				setIsOpponant(false);
			}
			setBackInGame(true);
			setIsGameRandom(true);
			setPlayerNewGameInvit(true);
			setStartGame(true);
		});

		socket.on('myerror', (message: string) => {
			console.log(`💌  Event: myerror -> ${message}`);
			//catch error
		});
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
		cbSetter: (socket: Socket, stateSetter: React.Dispatch<React.SetStateAction<Socket | undefined>>, pouet: string | undefined) => void,

		stateSetter: (value: React.SetStateAction<Socket | undefined>) => void,
		login: string | undefined,
	) => {
		await new Promise((res) => {
			setTimeout(() => {
				const socket = io(uri, {
					autoConnect: false,
					reconnection: false,
					forceNew: true,
				});
				cbSetter(socket, stateSetter, login);
				stateSetter(socket);
				doConnect(socket, stateSetter);
				res('');
			}, 500);
		});
	};

	useMount(async () => {
		await fetchDataUserMe()
			.then(async (login: string | undefined) => {
				await connectWs(`ws://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/game`, gameCallbacks, setGameWs, login);
				await connectWs(`ws://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/chat`, setWsCallbacks, setChatWs, login);
			})
			.catch((err) => {
				navigate('/');
			});
	});

	let i = 0;

	useEffect(() => {
		gameWs?.on('gameInvitation', async (challengerData, challengerWsId) => {
			i = i + 1;

			// console.log('count__invit ==', countInvit);
			console.log('int i  ==', i);
			if (i > 1) {
				console.log('au dessus de 1');
				setDisableInvitOther(false);
				gameWs?.emit('gameInvitResponse', { response: 'KO', to: challengerWsId });
			} else {
				console.log('is good');
				setChallengData([challengerData]);
				setWsId(challengerWsId);
				setTimeSnack(true);
				setDisableInvitOther(true);
			}

			// if (countInvit < 1) {
			// 	console.log('ici');
			// 	setChallengData([challengerData]);
			// 	setWsId(challengerWsId);
			// } else {
			// 	console.log('ELSEEEEEEE');
			// }
		});

		gameWs?.on('gaveUp', (usr: UserDto) => {
			console.log(`💌  Event: gaveUp ->`);
			console.log(usr);
			setTimeSnack(false);
		});
	}, [gameWs]);

	// console.log('disableother main ====', disableInvitOther);

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
			<Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={time}>
				<CircularProgress color="inherit" />
			</Backdrop>
			{timeSnack && <SnackBarre wsId={wsId} setTimeSnack={setTimeSnack} timeSnack={timeSnack} />}

			{/* <div>
				<button onClick={disconnectGameWs}>DISCONNECT GAME WS</button>
			</div> */}
			{headerLeave()}

			{/* <button onClick={blabla}> push </button> */}

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
