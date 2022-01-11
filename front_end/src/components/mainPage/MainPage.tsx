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

const MainPage = () => {
	const { timeSnack, setData, setTimeSnack } = useMainPage();
	const [wsStatus, setWsStatus] = useSafeState<Socket | undefined>(undefined);

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
		socket.on('connect', () => {
			setWsStatus(socket);
			console.log(`WS CONNECTED`);
		});

		socket.on('disconnect', () => {
			setWsStatus(undefined);
			console.log(`WS DISCONNECTED`);
		});

		socket.io.on("reconnect_attempt", async () => {
			console.log('🛑 RECONNECT ATTEMPT');
			setTimeout(async () => {
				await doConnectWs();
			}, (500));
		});

		socket.io.on("error", async (error) => {
			console.log('🛑  ERROR', error);
			setTimeout(async () => {
				await doConnectWs();
			}, (500));
		});

		// socket.io.on('error', (error) => {
		// 	console.log('RECEIVED ERROR', error);
		// });

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

		socket.on('connect_error', async (err) => {
			console.log('connect_error', err);
		});
		// socket.on('connect_error', async (err) => {
		// 	setWsStatus(undefined);
		// 	console.log(`ws connect_error due to ${err.message}: trying again...`);
		// 	await doConnectWs()
		// 		.then(async (socket) => {
		// 			if (socket.connected) {
		// 				console.log(`WS connected after retry.`, socket);
		// 				setWsStatus(socket);
		// 			} else {
		// 				console.log(`WS seems not connecter, retrying...`);
		// 				return await doConnectWs();
		// 			}
		// 		})
		// 		.then((socket) => {
		// 			console.log(`WS connected after retry.`, socket);
		// 			setWsStatus(socket);
		// 		})
		// 		.catch((err) => {
		// 			console.log(`WS failed to connect after retry: ${err}`);
		// 		});
		// });
	};

	// const tryReconnect = (socket: Socket) => {
	// 	console.log('try reconnect...........');
	// 	setTimeout(() => {
	// 		socket.io.open((err) => {
	// 			if (err) {
	// 				tryReconnect(socket);
	// 			}
	// 		});
	// 	}, 2000);
	// }

	const doConnectWs = async () => {
		return await axios('http://localhost:3000/auth/ws/token', {
			withCredentials: true,
		}).then((response) => {
			const { token } = response.data;
			if (!token) {
				throw new Error('no valid token');
			}
			return io('ws://localhost:3000/chat', {
				auth: {
					key: token,
				},
			});
		});
	};

	const connectWsStatus = async () => {
		try {
			await doConnectWs()
				.then((socket) => socket)
				.catch(async (err) => {
					console.log(`ws connection process failed due to: ${err}. [trying again...]`);
					return await doConnectWs();
				})
				.then((socket) => {
					setWsCallbacks(socket);
				})
				.catch((err) => {
					throw Error(err);
				});

		} catch (error) {
			const err = error as AxiosError;
			console.log(`ws connection process failed due to: ${err.message}`);
			setWsStatus(undefined);
			if (err.response?.status === 401) {
				// -> TODO : je pense que ds tous les cas il faut faire une redirection:
				//la ws va servir au jeu et au chat donc sans elle, rien ne marche
				navigate('/');
			}
		}
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
			{timeSnack && <SnackBarre onClose={resetTimeSnack} />}
			{isHeader ? (
				<div>
					<Header />
				</div>
			) : null}

			<Routes>
				<Route path="/MainPage" element={<Game wsStatus={wsStatus} />} />
				<Route path="/History-Game" element={<HistoryGame />} />
				<Route path="/Setting" element={<ParamUser />} />
				<Route path="/Rank" element={<UserRank />} />
				<Route path="*" element={<ErrorPage isHeader={setIsHeader} />} />
			</Routes>
		</div>
	);
};
export default MainPage;
