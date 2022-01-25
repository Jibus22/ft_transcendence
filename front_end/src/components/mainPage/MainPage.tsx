import { Backdrop, CircularProgress } from '@mui/material';
import { useMount, useSafeState } from 'ahooks';
import axios from 'axios';
import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { ErrorPage, Game, Header, HistoryGame, ParamUser, SnackBarre, UserRank } from '..';
import { useMainPage } from '../../MainPageContext';
import './mainPage.scss';

const MainPage = () => {
	const { timeSnack, setData, setTimeSnack, leaveGame } = useMainPage();
	// const [chatWs, setChatWs] = useSafeState<Socket | undefined>(undefined);
	const [chatWs, setChatWs] = useState<Socket | undefined>(undefined);
	// const [connectionTrieschatWs, setConnectionsTriesChatWs] = useState<number>(0);
	const [gameWs, setGameWs] = useState<Socket | undefined>(undefined);
	// const [connectionTriesgameWs, setConnectionsTriesGameWs] = useState<number>(0);
	const [time, setTime] = useState(false);
	const [isHeader, setIsHeader] = useState(true);

	let navigate = useNavigate();

	const fetchDataUserMe = async () => {
		return await axios
			.get('http://localhost:3000/me', {
				withCredentials: true,
			})
			.then((response) => {
				setData([response.data]);
			});
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

		socket.on ('publicRoomCreated', (message)=> {
			console.log(`💌  Event: publicRoomCreated ->`, message);
		});
  	socket.on ('publicRoomUpdated', (message)=> {
			console.log(`💌  Event: publicRoomUpdated ->`, message);
		});
  	socket.on ('publicRoomRemoved', (message)=> {
			console.log(`💌  Event: publicRoomRemoved ->`, message);
		});
  	socket.on ('newMessage', (message)=> {
			console.log(`💌  Event: newMessage ->`, message);
		});
  	socket.on ('roomParticipantUpdated', (message)=> {
			console.log(`💌  Event: roomParticipantUpdated ->`, message);
		});
  	socket.on ('userAdded', (message)=> {
			console.log(`💌  Event: userAdded ->`, message);
		});
  	socket.on ('userRemoved', (message)=> {
			console.log(`💌  Event: userRemoved ->`, message);
		});
  	socket.on ('userModeration', (message)=> {
			console.log(`💌  Event: userModeration ->`, message);
		});
  	socket.on ('userBanned', (message)=> {
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

	};
	const getAuthToken = async () => {
		return await axios('http://localhost:3000/auth/ws/token', {
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
			socket.on('disconnect', () => {console.log('user chose to leave !')});
			socket.disconnect();
		}
	}

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

	const connectWs = async (uri: string, cbSetter: (socket: Socket, stateSetter:
		React.Dispatch<React.SetStateAction<Socket | undefined>>
		) => void, stateSetter: (value: React.SetStateAction<Socket | undefined>) => void	) => {
			await new Promise(res => {
				setTimeout(() => {
					const socket = io(uri, {
						autoConnect: false,
						reconnection: false,
						forceNew: true
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
				await connectWs('ws://localhost:3000/game', gameCallbacks, setGameWs);
				await connectWs('ws://localhost:3000/chat', setWsCallbacks, setChatWs);
			})
			.catch((err) => {
				navigate('/');
			});
	});

	const resetTimeSnack = () => {
		setTimeSnack(false);
	};

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
			{timeSnack && <SnackBarre onClose={resetTimeSnack} />}
			<div><button onClick={disconnectGameWs} >DISCONNECT GAME WS</button></div>
			{headerLeave()}

			<Routes>
				<Route path="/MainPage" element={<Game chatWs={chatWs} />} />
				<Route path="/History-Game" element={<HistoryGame />} />
				<Route path="/Setting" element={<ParamUser setTime={setTime} />} />
				<Route path="/Rank" element={<UserRank />} />
				<Route path="*" element={<ErrorPage isHeader={setIsHeader} />} />
			</Routes>
		</div>
	);
};
export default MainPage;
