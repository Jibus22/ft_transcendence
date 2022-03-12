import { LinearProgress } from '@mui/material';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { useEffect, useState } from 'react';
import { PlayerGameLogic } from '../../type';
import './snackBarre.scss';

interface IProps {
	timeSnack: boolean;
	playerGameLogic: PlayerGameLogic;
	handleOk: () => void;
	handleKo: () => void;
}

export default function SnackBarre({
	timeSnack,
	playerGameLogic,
	handleOk,
	handleKo,
}: IProps) {
	console.log('=====  SNACKBAR ====');
	let timer: NodeJS.Timer;
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		timer = setInterval(() => {
			setProgress((oldProgress) => {
				if (oldProgress === 102) {
					setTimeout(() => {
						handleKo();
					}, 0);
					clearInterval(timer);
					return -100;
				}
				const diff = Math.random() * 0.4;
				return Math.min(oldProgress + diff, 102);
			});
		}, 20);

		return () => {
			clearInterval(timer);
		};
	}, []);

	const action = (
		<>
			<div className="contentButton">
				<Button className="buttonMui" onClick={handleOk}>
					ACCEPT
				</Button>
				<Button className="buttonMui" onClick={handleKo}>
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
