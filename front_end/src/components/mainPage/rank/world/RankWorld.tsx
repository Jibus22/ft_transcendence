import React, { useState, Dispatch, SetStateAction } from 'react';
import '../userRank.scss';
import { useSpring, animated } from 'react-spring';
import { Avatar, Badge, useMediaQuery, CircularProgress, Tooltip, Fade, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useMainPage } from '../../../../MainPageContext';
import { User, Rank } from '../../../type';
import { useNavigate } from 'react-router-dom';
import MainPong from '../../game/pong/MainPong';
import axios, { AxiosError } from 'axios';

interface Props {
	data: Array<Rank>;
	dataFriends: User[];
	isWorld: boolean;
}

const RankWorld = ({ data, dataFriends, isWorld }: Props) => {
	const props = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 0px)' },
		config: {
			delay: 2000,
			duration: 2000,
		},
	});

	// const [friendsList, setFriendsRank] = useState<Array<User>>([]);
	const { setStatusColor, setIsGameRandom, setStartGame, userName, setDataUserGame, setTimeSnack, gameWs } = useMainPage();
	const query = useMediaQuery('(max-width: 1000px)');
	let navigate = useNavigate();
	const [time, setTime] = useState(false);

	// const fetchDataChallenge = async (data: User) => {
	// 	const game = {
	// 		loginP1: userName,
	// 		loginP2: data.login,
	// 		login: '',
	// 		photo_url: '',
	// 	};

	// 	try {
	// 		const response = await axios.post('http://localhost:3000/game', game, {
	// 			withCredentials: true,
	// 		});
	// 		setDataUserGame([response.data]);
	// 	} catch (error) {
	// 		const err = error as AxiosError;
	// 		if (err.response?.status === 403) {
	// 			const dataError = err.response?.data;
	// 			// setErrors({ loggin: dataError['message'] });
	// 			console.log(dataError);
	// 		}
	// 	}
	// };

	const fetchDataChallenge = async (data: User) => {
		const game = {
			login_opponent: data.login,
		};

		try {
			const response = await axios.post('http://localhost:3000/game', game, {
				withCredentials: true,
			});
			console.log(response);
		} catch (error) {
			const err = error as AxiosError;
			if (err.response?.status === 403) {
				const dataError = err.response?.data;
				// setErrors({ loggin: dataError['message'] });
				console.log(dataError);
			}
		}
	};

	const getGame = (data: User) => () => {
		fetchDataChallenge(data);

		// setTimeSnack(true);
		// console.log('hihihihiih');
		// gameWs?.on('gameInvitation', async (challengerData, cb) => {
		// 	console.log('111111')
		// });
		// fetchDataChallenge(data);
		// setIsGameRandom(false);
		// setTime(true);
		// setTimeout(() => {
		// 	setTime(false);
		// 	setStartGame(true);
		// 	navigate('/Mainpage');
		// }, 2000);
	};

	const userSortRank = (a: Rank, b: Rank) => {
		if (b.games_won === a.games_won) {
			return a.games_count - b.games_count;
		} else {
			return b.games_won - a.games_won;
		}
	};

	const userList = (data: any, rank: number) => {
		let disableStatus = false;

		if (data.user.status !== 'online') {
			disableStatus = true;
		}

		return (
			<div className="MainUserRankdiv " key={data.user.id}>
				<div className="nbRank ">
					<h1>{rank + 1}</h1>
				</div>

				{!query ? (
					<div className="imgUser ">
						<Badge
							overlap="circular"
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							variant="dot"
							sx={{
								'.MuiBadge-badge': {
									backgroundColor: setStatusColor(data.user.status),
									color: setStatusColor(data.user.status),
									borderColor: setStatusColor(data.user.status),
									boxShadow: setStatusColor(data.user.status),
								},
								'.MuiBadge-badge::after': {
									borderColor: setStatusColor(data.user.status),
								},
							}}
						>
							<Avatar alt="userImg" src={data.user.photo_url} variant="square" className="domUser" />
						</Badge>
					</div>
				) : null}

				<div className="logginUser d-flex ">
					<h1>{data.user.login}</h1>
				</div>

				<div className="d-flex nbStatGame">
					<h3>{data.games_count}</h3>
				</div>
				<div className="d-flex nbStatWin">
					<h3>{data.games_won}</h3>
				</div>
				<div className="d-flex nbStatLoose">
					<h3>{data.games_lost}</h3>
				</div>

				<div className="buttonDIv d-flex">
					<Tooltip
						className="lalala"
						title={<Typography fontSize={`${query ? '7px' : '0.7vw'} `}>You can't challenge someone offline or in games </Typography>}
						followCursor={true}
						TransitionComponent={Fade}
						TransitionProps={{ timeout: 600 }}
						disableHoverListener={!disableStatus}
					>
						<span className="spanTooltip">
							<LoadingButton
								className="muiButton"
								disabled={time || disableStatus}
								variant="contained"
								onClick={getGame(data.user)}
								sx={{ width: 2 / 2, textTransform: 'none', backgroundColor: '#E69C6A' }}
							>
								{time && !disableStatus && <CircularProgress size="1.2em" />}
								{!time && 'Challenge'}
							</LoadingButton>
						</span>
					</Tooltip>
				</div>
			</div>
		);
	};

	const sortByUser = () => {
		if (!isWorld) {
			const sortById = data.filter((e) => dataFriends.findIndex((x) => x.id === e.user.id) !== -1);

			return sortById.sort(userSortRank).map((data, rank) => userList(data, rank));
		} else {
			return data.sort(userSortRank).map((data, rank) => userList(data, rank));
		}
	};

	return (
		<animated.div style={props} className="w-100">
			<div className="mainRankFriends d-flex flex-column ">{sortByUser()}</div>
		</animated.div>
	);
};

export default RankWorld;
