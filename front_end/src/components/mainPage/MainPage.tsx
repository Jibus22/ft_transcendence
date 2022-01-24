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
	const [wsStatus, setWsStatus] = useSafeState<Socket | undefined>(undefined);
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

	const setWsCallbacks = (socket: Socket) => {
		/* -----------------------
		 ** Connection
		 * -----------------------*/

		socket.on('connect', () => {
			console.log(`WS CONNECT`);
		});

		socket.on('disconnect', () => {
			console.log(`WS DISCONNECTED`);
			doConnect(socket);
		});

		socket.on('connect_error', async (err) => {
			console.log('connect_error', err);
			connectWsStatus();
		});

		socket.io.on('error', (error) => {
			console.log('⚠️ RECEIVED ERROR', error);
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
  	socket.on ('userMuted', (message)=> {
			console.log(`💌  Event: userMuted ->`, message);
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

	const doConnect = async (socket: Socket) => {
		setTimeout(async () => {
			await getAuthToken()
				.then((token) => {
					console.log('DOCONNECT');
					socket.auth = { key: `${token}` };
					socket.connect();
				})
				.catch((err) => {
					console.log('DOCONNECT ERROR ->', err);
					setWsStatus(undefined);
					doConnect(socket);
				});
		}, 1000);
	};

	const connectWsStatus = async () => {
		setTimeout(() => {
			const socket = io('ws://localhost:3000/chat', {
				autoConnect: false,
				reconnection: false,
			});
			setWsCallbacks(socket);
			setWsStatus(socket);
			doConnect(socket);
		}, 500);
	};

	useMount(async () => {
		await fetchDataUserMe()
			.then(() => {
				connectWsStatus();
			})
			.catch((err) => {
				navigate('/');
			});
	});

	const resetTimeSnack = () => {
		setTimeSnack(false);
	};

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
			{headerLeave()}

			<Routes>
				<Route path="/MainPage" element={<Game wsStatus={wsStatus} />} />
				<Route path="/History-Game" element={<HistoryGame />} />
				<Route path="/Setting" element={<ParamUser setTime={setTime} />} />
				<Route path="/Rank" element={<UserRank />} />
				<Route path="*" element={<ErrorPage isHeader={setIsHeader} />} />
			</Routes>
		</div>
	);
};
export default MainPage;
