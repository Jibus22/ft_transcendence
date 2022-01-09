import React, { useState, useEffect } from 'react';
import '../userRank.scss';
import { useSpring, animated } from 'react-spring';
import { Avatar, Badge } from '@mui/material';
import axios, { AxiosError } from 'axios';

import Button from '@mui/material/Button';
import { useMainPage } from '../../../../MainPageContext';

interface Users {
	id: string;
	login: string;
	photo_url: string;
	game: number;
	win: number;
	looses: number;
	status: string;
}

const RankWorld = () => {
	const props = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 0px)' },
		config: {
			delay: 1000,
			duration: 1100,
		},
	});

	const [data, setData] = useState<Array<Users>>([]);
	const { setStatusColor } = useMainPage();

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const { data } = await axios.get('https://run.mocky.io/v3/0fc0d0b5-3e27-439f-b6ed-e0f79845b2e9', {
				withCredentials: true,
			});
			setData(data);
		} catch (error) {
			const err = error as AxiosError;
			console.log(err);
		}
	};

	const userSortRank = (a: Users, b: Users) => {
		if (b.win === a.win) {
			return a.game - b.game;
		} else {
			return b.win - a.win;
		}
	};

	const userList = data.sort(userSortRank).map((data, rank: number) => {
		return (
			<div className="MainUserRankdiv d-flex " key={data.id}>
				<div className="d-flex rankdiv rankdiv1">
					<div className="nbRank ">
						<h1>{rank + 1}</h1>
					</div>
					<div className="imgUser ">
						<Badge
							overlap="circular"
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							variant="dot"
							sx={{
								'.MuiBadge-badge': {
									backgroundColor: setStatusColor(data.status),
									color: setStatusColor(data.status),
									borderColor: setStatusColor(data.status),
									boxShadow: setStatusColor(data.status),
								},
								'.MuiBadge-badge::after': {
									borderColor: setStatusColor(data.status),
								},
							}}
						>
							<Avatar alt="userImg" src={data.photo_url} variant="square" className="domUser" />
						</Badge>
					</div>
					<div className="logginUser d-flex ">
						<h1>{data.login}</h1>
					</div>
				</div>
				<div className="d-flex rankdiv rankdiv2">
					<div className="d-flex nbStatGame">
						<h3>{data.game}</h3>
					</div>
					<div className="d-flex nbStatWin">
						<h3>{data.win}</h3>
					</div>
					<div className="d-flex nbStatLoose">
						<h3>{data.looses}</h3>
					</div>
				</div>
				<div className="buttonDIv d-flex">
					<Button className="muiButton" variant="contained" sx={{ width: 2 / 2, textTransform: 'none' }}>
						Challenge
					</Button>
				</div>
			</div>
		);
	});

	return (
		<animated.div style={props} className="w-100">
			<div className="mainRankFriends d-flex flex-column ">{userList}</div>
		</animated.div>
	);
};

export default RankWorld;
