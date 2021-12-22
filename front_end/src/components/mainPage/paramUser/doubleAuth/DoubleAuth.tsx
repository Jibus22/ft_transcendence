import React, { useEffect, useState } from 'react';
import { Modal, Box, FormControlLabel, Switch, Button } from '@mui/material';
import { useMainPage } from '../../../../MainPageContext';
import axios, { AxiosError } from 'axios';
import FormAuth from './form/FormAuth';
import QR from './qr.png';

interface Props {
	isPop: boolean;
}

export default function DoubleAuth({ isPop }: Props) {
	const style = {
		position: 'absolute' as 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: 400,

		bgcolor: 'white',

		border: '2px solid #000',
		boxShadow: 24,
		p: 4,
	};

	const { data, fetchDataUserMe } = useMainPage();
	const [iFa, setFa] = useState(false);
	const [url, setUrl] = useState('');
	const [open, setOpen] = useState(false);

	// useMount(() => {
	// 	if (data.length > 0) {
	// 		setFa(data[0].hasTwoFASecret);
	// 	}
	// });

	const handleChange = () => {
		setFa(!iFa);

		if (!iFa) {
			activeAuth();
			setOpen(true);
		}
	};

	const activeAuth = async () => {
		await axios({
			url: 'http://localhost:3000/auth/2fa/generate',
			method: 'POST',
			withCredentials: true,
			responseType: 'blob',
		}).then((response) => {
			console.log(response.headers['secretKey']);
			setUrl(window.URL.createObjectURL(new Blob([response.data])));
			console.log(url);
		});
	};

	// const [open, setOpen] = React.useState(false);
	// const handleOpen = () => setOpen(true);

	//localhost:3000/auth/2fa/turn-off
	const deleteKey = async () => {
		await axios({
			url: 'http://localhost:3000/auth/2fa/turn-off',
			method: 'POST',
			withCredentials: true,
		}).then((response) => {
			console.log(response);
		});
	};

	const handleClose = () => {
		deleteKey();
		setOpen(false);
		setFa(false);
	};

	return (
		<div className="switchMui ">
			<FormControlLabel control={<Switch checked={iFa} onChange={handleChange} />} label="2FA" disabled={isPop} />

			<button onClick={deleteKey}>OFF</button>
			<Modal open={open} onClose={handleClose}>
				<Box sx={style}>
					<div className="d-flex flex-column">
						<div className="titleInfo">
							<h1>Scan the QR code</h1>
						</div>

						<div className="imgQR">
							<img src={url} alt="" />
						</div>
						<div className="infoKey">
							<h2>ou copier colle la clee</h2>
						</div>

						<div className="d-flex buttonInput ">
							<div className="buttonQR">
								<Button className="buttonMui" variant="contained" onClick={handleClose}>
									Cancel
								</Button>
							</div>
							<div className="inputQR ">
								<FormAuth />
							</div>
						</div>
					</div>
				</Box>
			</Modal>
		</div>
	);
}
