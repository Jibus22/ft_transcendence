import React, { useEffect, useState } from 'react';
import { LinearProgress } from '@mui/material';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { useMainPage } from '../../../MainPageContext';
import './snackBarre.scss';

interface ISnackBarreProps {
	cb: () => void;
}

export default function SnackBarre({ cb }: ISnackBarreProps) {
	const { isFriends, setTimeSnack, timeSnack } = useMainPage();

	const [open, setOpen] = useState(true);
	const [progress, setProgress] = React.useState(0);

	const handleClose = () => {
		// setOpen(false);

		// if (typeof cb === 'function') {
		// 	cb('OK');
		// }

		console.log(cb);

		setTimeSnack(false);

		// console.log('dsjkfdsgfgdsgfdsfgdskfgkds', cb);
	};

	useEffect(() => {
		console.log('COMPONANT MONTERRRR ');

		const timer = setInterval(() => {
			setProgress((oldProgress) => {
				if (oldProgress === 102) {
					setTimeSnack(false);
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

	const action = (
		<>
			<div className="contentButton">
				<Button className="buttonMui" onClick={handleClose}>
					ACCEPT
				</Button>
				{/* <Button className="buttonMui" onClick={handleClose}>
					REFUSE
				</Button> */}
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
				autoHideDuration={99999000}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				onClose={handleClose}
				message="[login] Challenge you"
				action={action}
			/>
		</div>
	);
}
