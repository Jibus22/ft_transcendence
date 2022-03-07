import React, { useEffect, useState } from 'react';
import { LinearProgress } from '@mui/material';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { useMainPage } from '../../../MainPageContext';
import { User, Rank } from '../../type';
import './snackBarre.scss';
import { useNavigate } from 'react-router-dom';

interface Props {
	timeSnack: boolean;
	handleClose: ()=>void;
	handleOk:()=>void;
	progress:number
}

export default function SnackBarre({timeSnack, handleOk, handleClose, progress }: Props) {
	const { isFriends, gameWs, invitName, challengData, setStartGame } = useMainPage();

	const [userName, setUserName] = useState('');

	const navigate = useNavigate();

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
