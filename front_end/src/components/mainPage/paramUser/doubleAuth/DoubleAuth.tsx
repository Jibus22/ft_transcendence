import React, { useEffect, useState } from 'react';
import '../paramUser.scss';
import { Modal, Box, FormControlLabel, Switch, Button } from '@mui/material';
import { useMainPage } from '../../../../MainPageContext';
import axios from 'axios';
import FormAuth from './form/FormAuth';

interface Props {
	isPop: boolean;
	dataFa: boolean;
}

export default function DoubleAuth({ isPop, dataFa }: Props) {
	const style = {
		position: 'absolute' as 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: '27%',
		height: '58%',
		bgcolor: 'white',
		border: '1px solid #000',
		borderRadius: '6%',
		boxShadow: 24,
		p: 4,
	};

	const { dialogMui } = useMainPage();

	const [iFa, setFa] = useState(false);

	const [url, setUrl] = useState('');
	const [open, setOpen] = useState(false);
	const [openDeleteKey, setOpenDeleteKey] = useState(false);
	const [code, setCode] = useState('');

	useEffect(() => {
		if (dataFa === true) {
			setFa(true);
		}
	}, [dataFa]);

	const disagree = () => {
		setOpenDeleteKey(false);
		setFa(true);
	};

	const agree = async () => {
		setOpenDeleteKey(false);
		deleteKey();
	};

	const handleChange = () => {
		setFa(!iFa);

		if (!iFa) {
			activeAuth();
			setOpen(true);
		}
		if (iFa === true) {
			setOpenDeleteKey(true);
		}
	};

	const activeAuth = async () => {
		await axios({
			url: 'http://localhost:3000/auth/2fa/generate',
			method: 'POST',
			withCredentials: true,
			responseType: 'blob',
		}).then((response) => {
			setCode(response.headers.secretkey);
			setUrl(window.URL.createObjectURL(new Blob([response.data])));
		});
	};

	const deleteKey = async () => {
		await axios({
			url: 'http://localhost:3000/auth/2fa/turn-off',
			method: 'POST',
			withCredentials: true,
		}).catch((error) => {
			console.log(error);
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
			{dialogMui(openDeleteKey, disagree, agree, 'Warning !', 'Are you sure you want to remove your OAuth system ?')}
			<button onClick={deleteKey}>OFF</button>
			<Modal open={open} onClose={handleClose}>
				<Box sx={style}>
					<div className="d-flex flex-column">
						<div className="titleInfo">
							<h1>Scan the QR code with your favorite app</h1>
						</div>

						<div className="imgQR">
							<img src={url} alt="" />
						</div>
						<div className="infoKey">
							<h2>Or enter this code : </h2>
							<h3>{code}</h3>
						</div>

						<div className="d-flex buttonInput ">
							<div className="buttonQR">
								<Button className="buttonMui" variant="contained" onClick={handleClose}>
									Cancel
								</Button>
							</div>
							<div className="inputQR ">
								<FormAuth closeQR={setOpen} />
							</div>
						</div>
					</div>
				</Box>
			</Modal>
		</div>
	);
}
