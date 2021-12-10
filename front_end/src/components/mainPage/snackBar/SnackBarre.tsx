import React from 'react';
import './snackBarre.scss';
import Horloge from './img/Horloge.png';
import Emoji from './img/emoji.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useMainPage } from '../../../MainPageContext';

interface ISnackBarreProps {
	onClose: () => void;
}

export default function SnackBarre({ onClose }: ISnackBarreProps) {
	const { isFriends } = useMainPage();

	const notify = () => {
		!isFriends
			? toast(
					({ closeToast }) => (
						<div className="mainSnackBarre d-flex">
							<div className="snackBarImg">
								<img src={Horloge} alt="" />
							</div>
							<div className="snackBarText">
								<p>No one is here to play now.</p>
								<p>Retry later</p>
							</div>
						</div>
					),
					{
						onClose,
					},
			  )
			: toast(
					({ closeToast }) => (
						<div className="mainSnackBarre d-flex">
							<div className="snackBarImg">
								<img src={Emoji} alt="" />
							</div>
							<div className="snackBarText">
								<p>Your friend isn’t available for a</p>
								<p>game right now</p>
							</div>
						</div>
					),
					{
						onClose,
					},
			  );
	};

	notify();
	return (
		<div className="SnackBarreGame">
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick={false}
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover={false}
				limit={1}
			/>
		</div>
	);
}
