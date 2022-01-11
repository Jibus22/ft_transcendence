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

	const connectWsStatus = async () => {
		try {
			const response = await axios('http://localhost:3000/auth/ws/token', {
				withCredentials: true,
			});
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
		} catch (error) {
			const err = error as AxiosError;
			if (err.response?.status === 401) {
				navigate('/');
			}
			setWsStatus(undefined);
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
