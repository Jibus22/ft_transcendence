import React, { useState, Dispatch } from 'react';
import '../userRank.scss';
import { useSpring, animated } from 'react-spring';
import {
	Avatar,
	Badge,
	useMediaQuery,
	CircularProgress,
	Tooltip,
	Fade,
	Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useMainPage } from '../../../../MainPageContext';
import { User, Rank } from '../../../type';
import { useNavigate } from 'react-router-dom';
import axios, {AxiosError} from 'axios';
import { UserDto, PlayerGameLogic } from '../../../type';

interface IProps {
	data: Array<Rank>;
	dataFriends: User[];
	isWorld: boolean;
	setPlayerGameLogic: Dispatch<React.SetStateAction<PlayerGameLogic>>;
}

const RankWorld = ({
	setPlayerGameLogic,
	data,
	dataFriends,
	isWorld,
}: IProps) => {
	const props = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 0px)' },
		config: {
			delay: 2000,
			duration: 2000,
		},
	});

	const { setStatusColor, setStartGame, setSelectNav, userName } =
		useMainPage();
	const query = useMediaQuery('(max-width: 1000px)');
	let navigate = useNavigate();
	const [time, setTime] = useState(false);

	const fetchDataChallenge = async (data: User) => {
		return await axios.post(
			`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/game`,
			{ login_opponent: data.login },
			{
				withCredentials: true,
			},
		).then((response) => {
			const { login_opponent: string, ...userDto } = response.data;
			const opponent: Partial<UserDto> = userDto;
			setPlayerGameLogic(() => {
				return {
					isChallenge: true,
					isP1: true,
					opponent: opponent,
				};
			});
		});
	};

	const getGame = (data: User) => async () => {
		await fetchDataChallenge(data)
			.then(() => {
				setStartGame(true);
				setSelectNav(false);
				navigate('/Mainpage');
			})
			.catch((error) => {
				const err = error as AxiosError;
				const res_err = err.response;
				alert(res_err?.data['message'] || 'There was an error with this user');
			});
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

		if (data.user.status !== 'online' || userName === data.user.login) {
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
							<Avatar
								alt="userImg"
								src={data.user.photo_url}
								variant="square"
								className="domUser"
							/>
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
						title={
							<Typography fontSize={`${query ? '7px' : '0.7vw'} `}>
								You can't challenge someone offline, in games or you
							</Typography>
						}
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
								sx={{
									width: 2 / 2,
									textTransform: 'none',
									backgroundColor: '#E69C6A',
								}}
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
			const sortById = data.filter(
				(e) => dataFriends.findIndex((x) => x.id === e.user.id) !== -1,
			);

			return sortById
				.sort(userSortRank)
				.map((data, rank) => userList(data, rank));
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
