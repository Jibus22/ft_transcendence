import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import '../popUp.scss';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/Button';
import LUP from '../../photos/bi_upload.png';
import axios from 'axios';
import '../popUp.scss';
import { useMainPage } from '../../../../../MainPageContext';

export default function FormUpload() {
	const { fetchData } = useMainPage();

	const [selectedImage, setSelectedImage] = useState<File | undefined>();
	const [imageUrl, setImageUrl] = useState('');

	console.log(imageUrl);

	useEffect(() => {
		onSubmit();
	}, [selectedImage]);

	const onSubmit = async () => {
		let data = new FormData();
		console.log(selectedImage);
		if (selectedImage) {
			data.append('photo_url', selectedImage);
		}
		try {
			const result = await axios.post('http://localhost:3000/me/photo', data, {
				withCredentials: true,
			});
			console.log(result);

			fetchData();
		} catch (err) {
			console.log(err);
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		console.log('use');
		if (e.target.files) {
			setSelectedImage(e.target.files[0]);
		}
	};

	return (
		<div className="w-100 h-100">
			<input
				accept="image/*"
				type="file"
				id="select-image"
				style={{ display: 'none' }}
				onChange={handleChange}
			/>
			<label htmlFor="select-image" className="w-100 h-100">
				<IconButton sx={{ width: 2 / 2, height: 2 / 2 }} component="span">
					<img src={LUP} alt="" />
				</IconButton>
			</label>
		</div>
	);
}
