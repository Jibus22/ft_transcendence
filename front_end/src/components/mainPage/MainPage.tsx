import React, { useEffect, useState } from 'react';
import './mainPage.scss';
import { Routes, Route } from 'react-router-dom';
import { Header, ParamUser, UserRank, HistoryGame, Game, SnackBarre } from '..';
import axios from 'axios';
import { useTimeout } from 'beautiful-react-hooks';
import { useInterval } from 'beautiful-react-hooks';
import { useMainPage } from '../../MainPageContext';

const MainPage = () => {
	const { timeSnack, setData, setTimeSnack, data } = useMainPage();

	const fetchData = async () => {
		try {
			const { data } = await axios('http://localhost:3000/users', {
				withCredentials: true,
			});
			setData(data);
			// console.log(data[0]);
		} catch (err) {
			console.log(err);
		}
	};
	// useEffect(() => {
	// 	console.log('data changed', data);
	// }, [data]);

	const [showContent, setShowContent] = useState(false);
	const [showContentt, setShowContentt] = useState(false);
	const [seconds, setSeconds] = useState(false);

	console.log('1', showContent);
	// console.log('1', seconds);
	// console.log('2', showContentt);
	useTimeout(() => {
		console.log('1', showContent);
		setShowContent(true);
	}, 3000);

	// useInterval(() => {
	// 	setSeconds(true);
	// }, 3000);

	useEffect(() => {
		fetchData();
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
				<Route path="/MainPage" element={<Game />} />
				<Route path="/History-Game" element={<HistoryGame />} />
				<Route path="/Setting" element={<ParamUser />} />

				<Route path="/Rank" element={<UserRank />} />
			</Routes>
		</div>
	);
};

export default MainPage;
