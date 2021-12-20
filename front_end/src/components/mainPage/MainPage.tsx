import React, { useEffect, useState } from 'react';
import './mainPage.scss';
import { Routes, Route } from 'react-router-dom';
import { Header, ParamUser, UserRank, HistoryGame, Game, SnackBarre } from '..';
import axios from 'axios';
import { useMainPage } from '../../MainPageContext';
import { io, Socket } from 'socket.io-client';

const MainPage = () => {
	const { timeSnack, setData, setTimeSnack } = useMainPage();
	const [wsStatus, setWsStatus] = useState<Socket | undefined>(undefined);

	const fetchDataUserMe = async () => {
		try {
			const { data } = await axios.get('http://localhost:3000/me', {
				withCredentials: true,
			});
			setData([data]);
		} catch (err) {
			console.log(err);
		}
	};

	const connectWsStatus = async () => {
		await axios('http://localhost:3000/auth/ws/token', {
			withCredentials: true,
		})
			.then((response) => {
				const { token } = response.data;
				if (!token) {
					throw new Error('no valid token');
				}
				const socket = io('ws://localhost:3000', {
					auth: {
						key: token,
					},
				});

				socket.on('connect_error', (err) => {
					setWsStatus(undefined);
					console.log(`ws connect_error due to ${err.message}`);
				});

				socket.on('connect', () => {
					setWsStatus(socket);
					console.log(`WS CONNECTED`);
				});

				socket.on('error', (error) => {
					console.log(error);
				});

				socket.on('disconnect', () => {
					setWsStatus(undefined);
					console.log(`WS DISCONNECTED`);
				});
			})
			.catch((error) => {
				setWsStatus(undefined);
				console.log(error);
			});
	};

	useEffect(() => {
		fetchDataUserMe();
		connectWsStatus();
	}, []);

	const resetTimeSnack = () => {
		setTimeSnack(false);
	};

	return (
		<div className="mainPageBody d-flex flex-column ">
			{timeSnack && <SnackBarre onClose={resetTimeSnack} />}
			<div>
				<Header />
			</div>

			<Routes>
				<Route path="/MainPage" element={<Game wsStatus={wsStatus} />} />
				<Route path="/History-Game" element={<HistoryGame />} />
				<Route path="/Setting" element={<ParamUser />} />
				<Route path="/Rank" element={<UserRank />} />
			</Routes>
		</div>
	);
};
export default MainPage;
