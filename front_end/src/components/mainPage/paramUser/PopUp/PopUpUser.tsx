import React, { useEffect } from 'react';
import './popUp.scss';
import { IconButton } from '@mui/material';
import '../safari.css';
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
	const {
		setCustomPhoto,
		setOpenSure,
		openSure,
		data,
		onSubmit,
		pathPop,
		isUpload,
		onSubmitUpload,
		selectedImage,
		setIsUpload,
		dialogMui,
	} = useMainPage();

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

			{dialogMui(openSure, disagree, agree, 'Warning !', 'Are you sure you want to delete your photo?')}
		</div>
	);
}
