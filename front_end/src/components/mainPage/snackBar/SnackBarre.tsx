import React, { useEffect, useState } from 'react';
import { LinearProgress } from '@mui/material';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { useMainPage } from '../../../MainPageContext';
import { User, Rank } from '../../type';
import './snackBarre.scss';
import { useNavigate } from 'react-router-dom';

interface Props {
	wsId: string;
	timeSnack: boolean;
	setTimeSnack: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SnackBarre({ wsId, timeSnack, setTimeSnack }: Props) {
	const { isFriends, gameWs, invitName, challengData, setStartGame, disableInvitOther } = useMainPage();

	const [progress, setProgress] = React.useState(0);

	const [userName, setUserName] = useState('');

	// const [countInvit, setCountInvit] = useState(1);
	// setCountInvit(countInvit + 1);

	const navigate = useNavigate();

	const handleClose = () => {
		gameWs?.emit('gameInvitResponse', { response: 'KO', to: wsId });
		setTimeSnack(false);
	};

	const handleOk = () => {
		gameWs?.emit('gameInvitResponse', { response: 'OK', to: wsId });

		setTimeSnack(false);
		setStartGame(true);
		navigate('/Mainpage');
	};

	useEffect(() => {
		// setCountInvit(countInvit + 1);

		// console.log(countInvit);

		const timer = setInterval(() => {
			setProgress((oldProgress) => {
				if (oldProgress === 102) {
					handleClose();
					return 0;
				}
				const diff = Math.random() * 0.4;
				return Math.min(oldProgress + diff, 102);
			});
		}, 20);

		return () => {
			clearInterval(timer);
		};
	}, []);

	// useEffect(() => {
	// 	if (countInvit > 1) {
	// 		console.log('DENIEEEEEED');
	// 		gameWs?.emit('gameInvitResponse', { response: 'KO', to: wsId });
	// 	}
	// }, [countInvit]);

	const action = (
		<>
			<div className="contentButton">
				<Button className="buttonMui" onClick={handleOk}>
					ACCEPT
				</Button>
				<Button className="buttonMui" onClick={handleClose}>
					REFUSE
				</Button>
			</div>
			<div className="progressMui">
				<LinearProgress variant="determinate" value={progress} />
			</div>
		</>
	);

	return (
		<div className="SnackBarreGame">
			<Snackbar
				open={timeSnack}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				message={`${challengData[0].login} Challenge you`}
				action={action}
			/>
		</div>
	);
}
