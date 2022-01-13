import React, { useState } from 'react';
import './mainPage.scss';
import { Routes, Route } from 'react-router-dom';
import { Header, ParamUser, UserRank, HistoryGame, Game, SnackBarre, ErrorPage } from '..';
import axios, { AxiosError } from 'axios';
import { useMainPage } from '../../MainPageContext';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useMount } from 'ahooks';
import { useSafeState } from 'ahooks';
import { Backdrop, CircularProgress } from '@mui/material';

const MainPage = () => {
	const { timeSnack, setData, setTimeSnack } = useMainPage();
	const [wsStatus, setWsStatus] = useSafeState<Socket | undefined>(undefined);
	const [time, setTime] = useState(false);
	const [isHeader, setIsHeader] = useState(true);

	let navigate = useNavigate();
	const fetchDataUserMe = async () => {
		try {
			const { data } = await axios.get('http://localhost:3000/me', {
				withCredentials: true,
			});

			setData([data]);
		} catch (error) {
			const err = error as AxiosError;
			if (err.response?.status === 401) {
				navigate('/');
			}
		}
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

		socket.on('publicRoomCreated', (message) => {
			console.log('✅  publicRoomCreated', message);
		});
		socket.on('publicRoomRemoved', (message) => {
			console.log('🚮  publicRoomRemoved', message);
		});

		socket.on('newMessage', (message) => {
			console.log(`💌  Event: newMessage ->`, message);
		});

		socket.on('participantJoined', (message) => {
			console.log(`💌  Event: participantJoined ->`, message);
		});

		socket.on('participantLeft', (message) => {
			console.log(`💌  Event: participantLeft ->`, message);
		});

		socket.on('userAdded', (message) => {
			console.log(`💌  Event: userAdded ->`, message);
		});

		socket.on('userBanned', (message) => {
			console.log(`💌  Event: userBanned ->`, message);
		});

		socket.on('userMuted', (message) => {
			console.log(`💌  Event: userMuted ->`, message);
		});

		socket.on('userModeration', (message) => {
			console.log(`💌  Event: userModeration ->`, message);
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

	useMount(() => {
		fetchDataUserMe();
		connectWsStatus();
	});

	const resetTimeSnack = () => {
		setTimeSnack(false);
	};

	return (
		<div className={`${isHeader ? 'mainPageBody' : ''} d-flex flex-column `}>
			<Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={time}>
				<CircularProgress color="inherit" />
			</Backdrop>
			{timeSnack && <SnackBarre onClose={resetTimeSnack} />}
			{isHeader ? (
				<div>
					<Header />
				</div>
			) : null}

			<Routes>
				<Route path="/MainPage/*" element={<Game wsStatus={wsStatus} />} />
				<Route path="/History-Game" element={<HistoryGame />} />
				<Route path="/Setting" element={<ParamUser setTime={setTime} />} />
				<Route path="/Rank" element={<UserRank />} />

				<Route path="*" element={<ErrorPage isHeader={setIsHeader} />} />
			</Routes>
		</div>
	);
};
export default MainPage;
