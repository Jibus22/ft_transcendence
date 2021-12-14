import React, { useState } from 'react';
import './popUp.scss';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import LCB from '../photos/Corbeille.png';
import LCL from '../photos/close-icon.png';
import FormUpload from './formUpload/FormUpload';
import Form42Upload from './form42Upload/Form42Upload';
import FormRandomUpload from './formRandomUpload/FormRandomUpload';
import axios from 'axios';
import { useMainPage } from '../../../../MainPageContext';

export interface Props {
	printPopup: () => void;
}

interface IUser {
	storeCustomPhoto: boolean;
}

export default function PopUpUser({ printPopup }: Props) {
	const { setCustomPhoto, customPhoto, setOpenSure, openSure, fetchData } = useMainPage();

	const handleClick = () => {
		setOpenSure(!openSure);
	};

	const disagree = () => {
		setCustomPhoto(true);
		setOpenSure(false);
	};
	const agree = () => {
		// setCustomPhoto(false);
		setOpenSure(false);
		fetchData();
	};

	const FetchDatame = async () => {
		try {
			const { data }: { data: IUser } = await axios.get('http://localhost:3000/me', {
				withCredentials: true,
			});
			setCustomPhoto(data.storeCustomPhoto);
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div className="mainPopUpUser d-flex">
			{/* <div className="buttonPopUp deletPop">
				<IconButton sx={{ width: 2 / 2, height: 2 / 2 }} onClick={handleClick} className="">
					<img src={LCB} alt="" />
				</IconButton>
			</div> */}
			<div className="buttonPopUp 42Pop">
				<Form42Upload fetchDataMe={FetchDatame} />
			</div>
			<div className="buttonPopUp deePop">
				<FormRandomUpload fetchDataMe={FetchDatame} />
			</div>
			<div className="buttonPopUp dlPop">
				<FormUpload fetchDataMe={FetchDatame} />
			</div>
			<div className="buttonPopUp closePop" onClick={printPopup}>
				<IconButton sx={{ width: 2 / 2 }}>
					<img src={LCL} alt="" />
				</IconButton>
			</div>
			<Dialog
				open={openSure}
				onClose={disagree}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				scroll="body"
				className="mainDialogMui"
			>
				<DialogTitle id="alert-dialog-title" className="d-flex">
					<ErrorIcon sx={{ color: 'orange' }} />
					<div className="titleDialogMui">
						<p>Warning !</p>
					</div>
				</DialogTitle>
				<DialogContent className="contentDialogMui">
					<DialogContentText id="alert-dialog-description">Are you sure you want to delete your photo?</DialogContentText>
				</DialogContent>
				<DialogActions className="actionDialogMui">
					<Button onClick={disagree}>Disagree</Button>
					<Button sx={{ color: 'red' }} onClick={agree}>
						Agree
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
