import React from 'react';
import '../popUp.scss';
import IconButton from '@mui/material/Button';
import LDE from '../../photos/LogoDee.png';
import { BigHead } from '@bigheads/core';
import { getRandomOptions } from './generateRandomAvatar';
import ReactDOMServer from 'react-dom/server';
import { useMainPage } from '../../../../../MainPageContext';
import axios from 'axios';

// interface IUser {
// 	storeCustomPhoto: boolean;
// }

interface Props {
	fetchDataMe: () => void;
}

export default function FormRandomUpload({ fetchDataMe }: Props) {
	const { fetchDataUserMe, customPhoto, setOpenSure } = useMainPage();

	const generateRandomAvatar = () => {
		const props = getRandomOptions();
		const svgToString = <BigHead {...props} />;

		return ReactDOMServer.renderToString(svgToString);
	};

	const svg = generateRandomAvatar();
	const blob = new Blob([svg], { type: 'image/svg+xml' });
	const file = new File([blob], 'random.svg', { type: 'image/svg' });

	const onSubmit = async () => {
		let data = new FormData();
		data.append('file', file);

		try {
			await axios.post('http://localhost:3000/me/photo', data, {
				withCredentials: true,
			});
			// fetchDataUserMe();
			fetchDataMe();
			if (customPhoto) {
				setOpenSure(true);
			} else {
				fetchDataUserMe();
			}
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div className="w-100 h-100">
			<IconButton sx={{ width: 2 / 2, height: 2 / 2 }} className="" onClick={onSubmit}>
				<img src={LDE} alt="" />
			</IconButton>
			<div></div>
		</div>
	);
}
