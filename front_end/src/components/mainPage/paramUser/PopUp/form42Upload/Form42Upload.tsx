import React from 'react';

import IconButton from '@mui/material/Button';
import L42 from '../../photos/Logo42.png';
import axios from 'axios';
import { useMainPage } from '../../../../../MainPageContext';

interface Props {
	fetchDataMe: () => void;
}

export default function Form42Upload({ fetchDataMe }: Props) {
	const { fetchData, customPhoto, setOpenSure } = useMainPage();

	const onSubmit = async () => {
		let data = new FormData();

		try {
			// const result = await axios.post('http://localhost:3000/me/useSchoolPhoto', data, {
			await axios.post('http://localhost:3000/me/useSchoolPhoto', data, {
				withCredentials: true,
			});
			fetchDataMe();

			if (customPhoto) {
				setOpenSure(true);
			} else {
				fetchData();
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
