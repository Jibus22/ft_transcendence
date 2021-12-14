import React, { useState, useEffect, ChangeEvent } from 'react';
import '../popUp.scss';
import IconButton from '@mui/material/Button';
import LUP from '../../photos/bi_upload.png';
import { useMount } from 'ahooks';
import axios from 'axios';
import { useMainPage } from '../../../../../MainPageContext';

interface Props {
	fetchDataMe: () => void;
}

export default function FormUpload({ fetchDataMe }: Props) {
	const { setData, fetchDataUserMe, customPhoto, setOpenSure } = useMainPage();

	const [selectedImage, setSelectedImage] = useState<File | undefined>();

	useEffect(() => {
		if (!selectedImage) return;
		onSubmit();
	}, [selectedImage]);

	// useMount(() => {
	// 	if (!selectedImage) return;
	// 	onSubmit();
	// });
	console.log(selectedImage);
	const onSubmit = async () => {
		let data = new FormData();

		if (selectedImage) {
			data.append('file', selectedImage);
		}

		try {
			const result = await axios
				.post('http://localhost:3000/me/photo', data, {
					withCredentials: true,
				})
				.then((response) => {
					// if (response.status !== HttpStatus.CREATED) {
					// 	// response.body.message; ?
					// 	//afficher message user : upload failed
					// }
				});
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

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setSelectedImage(e.target.files[0]);
		}
	};

	return (
		<div className="w-100 h-100">
			<input accept="image/*" type="file" id="select-image" style={{ display: 'none' }} onChange={handleChange} />
			<label htmlFor="select-image" className="w-100 h-100">
				<IconButton sx={{ width: 2 / 2, height: 2 / 2 }} component="span">
					<img src={LUP} alt="" />
				</IconButton>
			</label>
		</div>
	);
}
