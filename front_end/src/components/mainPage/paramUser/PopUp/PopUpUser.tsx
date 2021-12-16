import React, { useEffect } from 'react';
import './popUp.scss';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import LCL from '../photos/close-icon.png';
import FormUpload from './formUpload/FormUpload';
import Form42Upload from './form42Upload/Form42Upload';
import FormRandomUpload from './formRandomUpload/FormRandomUpload';
import { useMainPage } from '../../../../MainPageContext';
import { BigHead } from '@bigheads/core';
import { getRandomOptions } from './formRandomUpload/generateRandomAvatar';
import ReactDOMServer from 'react-dom/server';

export interface Props {
	printPopup: () => void;
}

export default function PopUpUser({ printPopup }: Props) {
	const { setCustomPhoto, setOpenSure, openSure, data, onSubmit, pathPop, isUpload, onSubmitUpload, selectedImage, setIsUpload } =
		useMainPage();

	const generateRandomAvatar = () => {
		const props = getRandomOptions();
		const svgToString = <BigHead {...props} />;
		return ReactDOMServer.renderToString(svgToString);
	};
	const svg = generateRandomAvatar();
	const blob = new Blob([svg], { type: 'image/svg+xml' });
	const file = new File([blob], 'random.svg', { type: 'image/svg' });

	useEffect(() => {
		if (data.length > 0) {
			setCustomPhoto(data[0].storeCustomPhoto);
		}
	});

	const disagree = () => {
		setIsUpload(false);
		setOpenSure(false);
	};

	const agree = () => {
		if (!isUpload) {
			onSubmit(file, pathPop);
		} else {
			onSubmitUpload(selectedImage);
			setIsUpload(false);
		}
		setOpenSure(false);
	};

	return (
		<div className="mainPopUpUser d-flex">
			<div className="buttonPopUp 42Pop">
				<Form42Upload />
			</div>
			<div className="buttonPopUp deePop">
				<FormRandomUpload file={file} />
			</div>
			<div className="buttonPopUp dlPop">
				<FormUpload />
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
					<Button sx={{ color: 'red' }} onClick={disagree}>
						Disagree
					</Button>
					<Button onClick={agree}>Agree</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
