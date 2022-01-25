import React, { useState, useEffect } from 'react';
import './userRank.scss';
import { RankWorld } from '../..';
import { User, Rank } from '../../type';
import { useSpring, animated } from 'react-spring';
import axios, { AxiosError } from 'axios';

const UserRank = () => {
	const props = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 5vw)' },
		config: {
			delay: 300,
			duration: 300,
		},
	});

	const [isWorld, setIsWorld] = useState(true);
	const [data, setData] = useState<Rank[]>([]);
	const [dataFriends, setDataFriends] = useState<Array<User>>([]);

	function handleClick() {
		setIsWorld(!isWorld);
	}

	useEffect(() => {
		fetchData();
		fetchDataFriends();
	}, []);

	const fetchData = async () => {
		try {
			const { data } = await axios.get('http://localhost:3000/game/leaderboard', {
				withCredentials: true,
			});
			setData(data);
		} catch (error) {
			const err = error as AxiosError;
			console.log(err);
		}
	};
	const fetchDataFriends = async () => {
		try {
			const { data } = await axios.get('http://localhost:3000/users/friend', {
				withCredentials: true,
			});
			setDataFriends(data);
		} catch (error) {
			const err = error as AxiosError;
			console.log(err);
		}
	};

	return (
		<animated.div style={props} className="w-100">
			<div className="mainUserRank d-flex flex-column  ">
				<div className="mainTitleRank d-flex  ">
					<div>
						<h1>Leaderboard</h1>
					</div>
					<div className="mainSwitch">
						<div className="switch-button">
							<input onClick={handleClick} className="switch-button-checkbox" type="checkbox"></input>
							<label className="switch-button-label d-flex " htmlFor="">
								<div className={`${isWorld ? 'divSwitchOff' : 'divSwitchOn'} d-flex divSwitchButton`}>
									<span className="switch-button-label-span">World</span>
								</div>
								<div className={`${!isWorld ? 'divSwitchOff' : 'divSwitchOn'} d-flex divSwitchButton2`}>
									<span className="switch-button-label-span">Friends</span>
								</div>
							</label>
						</div>
					</div>
				</div>
				<div className="rankInfo d-flex ">
					<h3 className="nbRank">Rank</h3>
					<h3 className="nbUser">User</h3>
					<h3 className="nbGame">Game</h3>
					<h3 className="nbWin">Win</h3>
					<h3 className="nbLoose">Looses</h3>
				</div>

				<div className="userPrintDIv">
					<RankWorld data={data} dataFriends={dataFriends} isWorld={isWorld} />
				</div>
			</div>
		</animated.div>
	);
};

export default UserRank;
