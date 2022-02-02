import { Avatar, AvatarGroup, Badge, Button, useMediaQuery } from '@mui/material';
import axios, { AxiosError } from 'axios';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import 'semantic-ui-css/semantic.min.css';
import { useMainPage } from '../../../MainPageContext';
import { Game } from '../../type';
import FormHistory from './formHistory/FormHistory';
import './historyGame.scss';

const HistoryGame = () => {
	const props = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 170px)' },
		config: {
			delay: 300,
			duration: 300,
		},
	});

	const fade = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 0px)' },
		config: {
			delay: 2000,
			duration: 2000,
		},
	});

	const { userName, setStatusColor } = useMainPage();
	const [dataGame, setDataGame] = useState<Array<Game>>([]);
	const query = useMediaQuery('(max-width: 700px)');

	const [isActive, setIsActive] = useState(false);

	const fetchData = async () => {
		try {
			const { data } = await axios.get(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/game/history`, {
				withCredentials: true,
			});
			setDataGame(data);
		} catch (error) {
			const err = error as AxiosError;
			console.log(err);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const [isMyGame, setIsMyGame] = useState(false);

	const searchMyGame = () => {
		setIsMyGame(!isMyGame);
		setIsActive(!isActive);
	};

	const convertTime = (int: number, option: number) => {
		const date = new Date(int);
		let time;
		if (option === 1) {
			time = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
		}
		if (option === 2) {
			time = date.getMinutes() + ':' + date.getSeconds();
		}

		return time;
	};

	const userList = (data: any) => {
		return (
			<animated.div style={fade} className="animatedDiv" key={data.id}>
				<div className="infoHistory ">
					<div className="mainPlayer">
						{!query ? (
							<div className="userImg d-flex ">
								<AvatarGroup max={2}>
									<Badge
										overlap="circular"
										anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
										variant="dot"
										sx={{
											'.MuiBadge-badge': {
												backgroundColor: setStatusColor(data.players[0].user.status),
												color: setStatusColor(data.players[0].user.status),
												borderColor: setStatusColor(data.players[0].user.status),
												boxShadow: setStatusColor(data.players[0].user.status),
											},
											'.MuiBadge-badge::after': {
												borderColor: setStatusColor(data.players[0].user.status),
											},
										}}
									>
										<Avatar alt="userImg" src={data.players[0].user.photo_url} variant="square" className="domUser" />
									</Badge>
									<Badge
										overlap="circular"
										anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
										variant="dot"
										sx={{
											'.MuiBadge-badge': {
												backgroundColor: setStatusColor(data.players[1].user.status),
												color: setStatusColor(data.players[1].user.status),
												borderColor: setStatusColor(data.players[1].user.status),
												boxShadow: setStatusColor(data.players[1].user.status),
											},
											'.MuiBadge-badge::after': {
												borderColor: setStatusColor(data.players[1].user.status),
											},
										}}
									>
										<Avatar alt="userImg" src={data.players[1].user.photo_url} variant="rounded" className="extUser" />
									</Badge>
								</AvatarGroup>
							</div>
						) : null}
						<div className="playerName ">
							<div className="player d-flex ">
								<div className="playerDiv justify-content-end">
									<p>{data.players[0].user.login}</p>
								</div>
								<div className="vs">
									<p>vs</p>
								</div>
								<div className="playerDiv justify-content-start">
									<p>{data.players[1].user.login}</p>
								</div>
							</div>
						</div>
					</div>
					<div className="playerScore d-flex ">
						<div>
							<p>{data.players[0].score}</p>
						</div>
						<div className="semilicon">
							<p>:</p>
						</div>
						<div>
							<p>{data.players[1].score}</p>
						</div>
					</div>
					<div className="date d-flex flex-column ">
						<p>{convertTime(data.createdAt, 1)}</p>
					</div>
					<div className="duration d-flex ">
						<p>{convertTime(data.duration, 2)}</p>
					</div>
				</div>
			</animated.div>
		);
	};

	const [name, setName] = useState('');
	const [foundUsers, setFoundUsers] = useState<Array<Game>>([]);
	const [inKeyword, setInKeyWord] = useState(false);

	const filter = (e: ChangeEvent<HTMLInputElement>) => {
		const keyword = e.target.value;

		setInKeyWord(false);
		if (keyword !== '') {
			setInKeyWord(true);
			const results = dataGame.filter((dataGame) => {
				return (
					dataGame.players[0].user.login.toLocaleLowerCase().startsWith(keyword.toLocaleLowerCase()) ||
					dataGame.players[1].user.login.toLocaleLowerCase().startsWith(keyword.toLocaleLowerCase())
				);
			});
			setFoundUsers(results);
		} else {
			setFoundUsers(dataGame);
		}
		setName(keyword);
	};

	const userSortDate = (a: Game, b: Game) => {
		return b.createdAt - a.createdAt;
	};

	const sortByUser = () => {
		if (isMyGame) {
			const sortByName = dataGame.filter(
				(dataGame) => dataGame.players[0].user.login === userName || dataGame.players[1].user.login === userName,
			);
			return sortByName.sort(userSortDate).map((data) => userList(data));
		}
		if (foundUsers && foundUsers.length > 0) {
			return foundUsers.sort(userSortDate).map((data) => userList(data));
		}
		if (inKeyword === false) {
			return dataGame.sort(userSortDate).map((data) => userList(data));
		}
	};

	return (
		<animated.div style={props} className="w-100">
			<div className="mainHisUser  d-flex flex-column  ">
				<div className="searchCase ">
					<h1>History</h1>

					<div className="d-flex  MainmyGameDIv ">
						<div className="myGameDIv d-flex">
							<Button
								onClick={searchMyGame}
								className={`${isActive ? 'muiButtonActive' : 'muiButtonInactiv'} muiButton `}
								variant="contained"
								sx={{ width: 2 / 2, height: 2 / 2, textTransform: 'none' }}
							>
								My game
							</Button>
						</div>
						<div>
							<FormHistory name={name} filter={filter} isActive={isActive} />
						</div>
					</div>
				</div>

				<div className="dpdInfo ">
					<h3 className="infoPlayer">Player</h3>
					<h3 className="infoScore">Score</h3>
					<h3 className="infoDate">Date</h3>
					<h3 className="infoDuration">Duration</h3>
				</div>

				<div className="pageOverflow ">
					<div className="histUser ">{sortByUser()}</div>
				</div>
			</div>
		</animated.div>
	);
};

export default HistoryGame;
