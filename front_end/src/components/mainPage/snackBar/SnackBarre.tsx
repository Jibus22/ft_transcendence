import { LinearProgress } from '@mui/material';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { PlayerGameLogic } from '../../type';
import './snackBarre.scss';

interface IProps {
	timeSnack: boolean;
	handleOk: () => void;
	handleClose: () => void;
	progress: number;
	playerGameLogic: PlayerGameLogic;
}

export default function SnackBarre({
	timeSnack,
	handleOk,
	handleClose,
	progress,
	playerGameLogic,
}: IProps) {
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
