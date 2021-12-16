import React from 'react';
import '../popUp.scss';
import IconButton from '@mui/material/Button';
import LDE from '../../photos/LogoDee.png';
import { BigHead } from '@bigheads/core';
import { getRandomOptions } from './generateRandomAvatar';
import ReactDOMServer from 'react-dom/server';
import { useMainPage } from '../../../../../MainPageContext';
import axios from 'axios';

export interface Props {
	isAgree: boolean;
}

export default function FormRandomUpload({ isAgree }: Props) {
	const { fetchDataUserMe, customPhoto, setOpenSure, openSure, onSubmit } = useMainPage();

	const generateRandomAvatar = () => {
		const props = getRandomOptions();
		const svgToString = <BigHead {...props} />;

		return ReactDOMServer.renderToString(svgToString);
	};

	const svg = generateRandomAvatar();
	const blob = new Blob([svg], { type: 'image/svg+xml' });
	const file = new File([blob], 'random.svg', { type: 'image/svg' });

	const isSubmit = () => {
		if (customPhoto) {
			console.log('is custom photo');
			setOpenSure(true);
		} else {
			console.log('else isSubmbit');
			onSubmit(file);
		}
	};

	// const onSubmit = async () => {
	// 	let data = new FormData();
	// 	data.append('file', file);

	// 	try {
	// 		await axios.post('http://localhost:3000/me/photo', data, {
	// 			withCredentials: true,
	// 		});

	// 		if (customPhoto) {
	// 			setOpenSure(true);
	// 		} else {
	// 			fetchDataUserMe();
	// 		}
	// 	} catch (err) {
	// 		console.log(err);
	// 	}
	// };

	return (
		<div className="w-100 h-100">
			<IconButton sx={{ width: 2 / 2, height: 2 / 2 }} className="" onClick={isSubmit}>
				<img src={LDE} alt="" />
			</IconButton>
			<div></div>
		</div>
	);
}
