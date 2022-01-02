import React, { useState } from 'react';
import './historyGame.scss';
import 'semantic-ui-css/semantic.min.css';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { pink } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { useSpring, animated } from 'react-spring';
import FF from '../../homePage/section/photos/FF.png';
import JB from '../../homePage/section/photos/JB.png';
import { InputAdornment, Button, AvatarGroup, Avatar, Badge } from '@mui/material';

const CssTextField = styled(TextField)({
	'& label.Mui-focused': {
		color: 'white',
	},
	'& .MuiOutlinedInput-root': {
		'& fieldset': {
			borderColor: '#E69C6A',
		},
	},
});

const HistoryGame = () => {
	const props = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 500px)' },
		config: {
			delay: 300,
			duration: 300,
		},
	});

	let divHistory = (
		<div className="infoHistory ">
			<div className="userImg d-flex ">
				<AvatarGroup max={2}>
					<Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" sx={{}}>
						<Avatar alt="userImg" src={FF} variant="square" className="domUser" />
					</Badge>
					<Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" sx={{}}>
						<Avatar alt="userImg" src={JB} variant="rounded" className="extUser" />
					</Badge>
				</AvatarGroup>
			</div>

			<div className="playerName ">
				<div className="player d-flex ">
					<p>frfrance</p>
					<p className="vs">vs</p>
					<p>jl-core</p>
				</div>
			</div>
			<div className="playerScore d-flex ">
				<div>
					<p>5</p>
				</div>
				<div className="semilicon">
					<p>:</p>
				</div>
				<div>
					<p>12</p>
				</div>
			</div>
			<div className="date d-flex flex-column ">
				<p>01/12/21</p>
				<p className="timeHours">23 : 44</p>
			</div>
			<div className="duration d-flex ">
				<p>00:00:15</p>
			</div>
		</div>
	);

	const [isActive, setIsActive] = useState(false);

	function handleIsActive() {
		setIsActive(!isActive);
	}

	return (
		<animated.div style={props} className="w-100">
			<div className="mainHisUser  d-flex flex-column  ">
				<div className="searchCase ">
					<h1>History</h1>

					<div className="d-flex">
						<div className="myGameDIv d-flex">
							<Button
								onClick={handleIsActive}
								className={`${isActive ? 'muiButtonActive' : 'muiButtonInactiv'} muiButton`}
								variant="contained"
								sx={{ width: 2 / 2, textTransform: 'none' }}
							>
								My game
							</Button>
						</div>
						<div>
							<CssTextField
								sx={{ textDecoration: 'none', height: 2 / 2 }}
								autoComplete="off"
								className="searchBarre "
								id="outlined-basic"
								variant="outlined"
								size="small"
								label="Search"
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<SearchIcon sx={{ color: pink[50], fontSize: 20 }} />
										</InputAdornment>
									),
								}}
							/>
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
					<div className="histUser ">
						{divHistory}
						{divHistory}
						{divHistory}
						{divHistory}
						{divHistory}
					</div>
				</div>
			</div>
		</animated.div>
	);
};

export default HistoryGame;
