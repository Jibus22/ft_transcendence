import React, { useEffect, ChangeEvent, useState } from 'react';
import '../popUp.scss';
import IconButton from '@mui/material/Button';
import LUP from '../../photos/bi_upload.png';
import axios, { AxiosError } from 'axios';
import { useMainPage } from '../../../../../MainPageContext';
import ReportIcon from '@mui/icons-material/Report';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

export default function FormUpload() {
	const { fetchDataUserMe, customPhoto, setOpenSure, setIsUpload, selectedImage, setSelectedImage, setOpenUpload, openUpload } =
		useMainPage();

	const [isModif, setIsmodif] = useState(false);
	const [messData, setMessData] = useState('');

	const handleClick = () => {
		setOpenUpload(!openUpload);
	};

	useEffect(() => {
		if (!selectedImage) {
			return;
		}
		if (isModif) {
			onSubmit();
		}
	}, [selectedImage]);

	const onSubmit = async () => {
		let data = new FormData();

		if (customPhoto) {
			setIsUpload(true);
			setOpenSure(true);
			return;
		}

		if (selectedImage) {
			data.append('file', selectedImage);
		}

		try {
			await axios.post('http://localhost:3000/me/photo', data, {
				withCredentials: true,
			});

			fetchDataUserMe();
		} catch (error) {
			const err = error as AxiosError;

			if (err.response?.status === 400) {
				const dataError = err.response?.data;
				setMessData(dataError['error']);
				setOpenUpload(true);
			}
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setSelectedImage(e.target.files[0]);
			setIsmodif(true);
		}
	};

	return (
		<div className="w-100 h-100">
			<input accept="image/*" type="file" id="select-image" style={{ display: 'none' }} onChange={handleChange} />
			<label htmlFor="select-image" className="w-100 h-100">
				<IconButton sx={{ width: 2 / 2, height: 2 / 2 }} component="span">
					<img src={LUP} alt="" />
				</IconButton>
			</label>
			<Dialog
				open={openUpload}
				onClose={handleClick}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				scroll="body"
				className="mainDialogMui"
			>
				<DialogTitle id="alert-dialog-title" className="d-flex">
					<ReportIcon sx={{ color: 'orange' }} />
					<div className="titleDialogMui">
						<p>Warning !</p>
					</div>
				</DialogTitle>
				<DialogContent className="contentDialogMui">
					<DialogContentText id="alert-dialog-description">{messData}</DialogContentText>
				</DialogContent>
				<DialogActions className="actionDialogMui">
					<Button onClick={handleClick}>Agree</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
