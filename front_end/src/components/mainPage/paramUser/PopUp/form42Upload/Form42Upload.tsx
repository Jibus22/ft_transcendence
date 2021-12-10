import React, { useState, useEffect, ChangeEvent } from 'react';

import IconButton from '@mui/material/Button';
import L42 from '../../photos/Logo42.png';
import axios from 'axios';
import { useFormik } from 'formik';
import { useMainPage } from '../../../../../MainPageContext';

export default function Form42Upload() {
	const { fetchDataUserMe } = useMainPage();

	const onSubmit = async () => {
		let data = new FormData();
		// console.log(selectedImage);
		// if (selectedImage) {
		// 	data.append('file', selectedImage);
		// }
		try {
			const result = await axios.post('http://localhost:3000/me/photo', data, {
				withCredentials: true,
			});
			fetchDataUserMe();
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
