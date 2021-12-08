import React, { useState } from 'react';
import './popUp.scss';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import LCB from '../photos/Corbeille.png';
import LUP from '../photos/bi_upload.png';
import L42 from '../photos/Logo42.png';
import LDE from '../photos/LogoDee.png';
import LCL from '../photos/close-icon.png';

import FormUpload from './formUpload/FormUpload';

export interface Props {
	printPopup: () => void;
	userImg: string;
}

export default function PopUpUser({ printPopup, userImg }: Props) {
	const [open, setOpen] = useState(false);

	const [name, setName] = useState('');
	const [selectedFile, setSelectedFile] = useState<
		string | ReadonlyArray<string> | number | undefined
	>(undefined);

	const handleClick = () => {
		setOpen(!open);
	};

	return (
		<div className="mainPopUpUser d-flex">
			<div className="buttonPopUp deletPop">
				<IconButton sx={{ width: 2 / 2, height: 2 / 2 }} onClick={handleClick} className="">
					<img src={LCB} alt="" />
				</IconButton>
			</div>
			<div className="buttonPopUp 42Pop">
				<IconButton sx={{ width: 2 / 2, height: 2 / 2 }} className="">
					<img src={L42} alt="" />
				</IconButton>
			</div>
			<div className="buttonPopUp deePop">
				<IconButton sx={{ width: 2 / 2, height: 2 / 2 }} className="">
					<img src={LDE} alt="" />
				</IconButton>
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
				open={open}
				onClose={handleClick}
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
					<DialogContentText id="alert-dialog-description">
						Are you sure you want to delete your photo?
					</DialogContentText>
				</DialogContent>
				<DialogActions className="actionDialogMui">
					<Button onClick={handleClick}>Disagree</Button>
					<Button sx={{ color: 'red' }} onClick={handleClick}>
						Agree
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
