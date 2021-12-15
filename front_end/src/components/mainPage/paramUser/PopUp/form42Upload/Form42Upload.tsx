import React from 'react';

import IconButton from '@mui/material/Button';
import L42 from '../../photos/Logo42.png';
import axios from 'axios';
import { useMainPage } from '../../../../../MainPageContext';

export default function Form42Upload() {
	const { customPhoto, setOpenSure, userImg } = useMainPage();

	const onSubmit = async () => {
		if (userImg.startsWith('https://cdn.intra.42.fr/')) {
			return;
		}

		let data = new FormData();

		try {
			await axios.post('http://localhost:3000/me/useSchoolPhoto', data, {
				withCredentials: true,
			});
			if (customPhoto) {
				setOpenSure(true);
			}
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div className="w-100 h-100">
			<IconButton sx={{ width: 2 / 2, height: 2 / 2 }} className="" onClick={onSubmit}>
				<img src={L42} alt="" />
			</IconButton>
		</div>
	);
}
