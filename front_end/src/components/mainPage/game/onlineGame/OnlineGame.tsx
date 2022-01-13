import React, { useState, useEffect } from 'react';
import './onlineGame.scss';
import { useSpring, animated } from 'react-spring';
import { useMainPage } from '../../../../MainPageContext';
import FF from '../../../homePage/section/photos/FF.png';
import JB from '../../../homePage/section/photos/JB.png';
import { AvatarGroup, Avatar, Badge, CircularProgress } from '@mui/material';
import { LoadingButton } from '@mui/lab';

interface Props {
	Loadingclick: () => void;
}

export default function OnlineGame({ Loadingclick }: Props) {
	const { setSelectQuery } = useMainPage();
	const props = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 500px)' },
		config: {
			delay: 300,
			duration: 300,
		},
	});

	useEffect(() => {
		setSelectQuery(true);

		return () => {
			setSelectQuery(false);
		};
	});

	const { loading } = useMainPage();
	const [time, setTime] = useState(false);
	function handleClick() {
		setTime(true);
		setTimeout(function () {
			setTime(false);
		}, 2000);
	}

	let divTest = (
		<div className="partyOnline d-flex ">
			<div className="userImg d-flex">
				<AvatarGroup max={2}>
					<Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" sx={{}}>
						<Avatar alt="userImg" src={FF} variant="square" className="domUser" />
					</Badge>
					<Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" sx={{}}>
						<Avatar alt="userImg" src={JB} variant="rounded" className="extUser" />
					</Badge>
				</AvatarGroup>
			</div>

			<div className="userStat d-flex flex-column ">
				<div className="player d-flex ">
					<p className="user">frfrance12</p>
					<p className="vs">vs</p>
					<p className="user">jl-core122</p>
				</div>
				<div className="score d-flex">
					<p>14</p>
					<p className="semiliconGame">:</p>
					<p>1</p>
				</div>
			</div>
			<div className="userWatch d-flex  ">
				<LoadingButton
					className="muiButton"
					onClick={handleClick}
					disabled={loading || time}
					variant="contained"
					sx={{
						borderRadius: 4,
						width: 2 / 2,
						height: 2 / 2,
						textTransform: 'none',
						backgroundColor: '#E69C6A',
					}}
				>
					{(loading || time) && <CircularProgress size="1.2em" />}
					{!loading && !time && 'Watch'}
				</LoadingButton>
			</div>
		</div>
	);

	return (
		<animated.div style={props} className="w-100">
			<div className="mainOnlineGame d-flex flex-column ">
				<div className="title">
					<h1>Onlines game</h1>
				</div>
				<div className="pageOverflow">
					<div className="onlineDiv">
						{divTest}
						{divTest}
						{divTest}
						{divTest}
						{divTest}
						{divTest}
						{divTest}
						{divTest}
					</div>
				</div>
			</div>
		</animated.div>
	);
}
