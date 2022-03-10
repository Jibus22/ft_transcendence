import React, { useEffect, useState } from 'react';
import { LinearProgress } from '@mui/material';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { useMainPage } from '../../../MainPageContext';
import { User, Rank, PlayerGameLogic } from '../../type';
import './snackBarre.scss';
import { useNavigate } from 'react-router-dom';

interface IProps {
	timeSnack: boolean;
	handleOk: () => void;
	handleClose: () => void;
	progress: number;
	playerGameLogic: PlayerGameLogic;
}

export default function SnackBarre({ timeSnack, handleOk, handleClose, progress, playerGameLogic }: IProps) {
	const { isFriends, gameWs, invitName, challengData, setStartGame, disableInvitOther } = useMainPage();

	const [userName, setUserName] = useState('');

	// const [countInvit, setCountInvit] = useState(1);
	// setCountInvit(countInvit + 1);

	const navigate = useNavigate();

	useEffect(() => {
		// setCountInvit(countInvit + 1);

		// console.log(countInvit);

		return () => {};
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
				message={`${playerGameLogic.opponent.login} Challenge you`}
				action={action}
			/>
		</div>
	);
}
