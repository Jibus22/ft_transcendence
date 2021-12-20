import React from 'react';
import '../popUp.scss';
import IconButton from '@mui/material/Button';
import LDE from '../../photos/LogoDee.png';
import { useMainPage } from '../../../../../MainPageContext';

export interface Props {
	file: File;
}

export default function FormRandomUpload({ file }: Props) {
	const { customPhoto, setOpenSure, onSubmit, setPathPop } = useMainPage();

	const isSubmit = () => {
		setPathPop('me/photo');

		if (customPhoto) {
			setOpenSure(true);
		} else {
			const path = 'me/photo';
			onSubmit(file, path);
		}
	};

	return (
		<div className="w-100 h-100">
			<IconButton sx={{ width: 2 / 2, height: 2 / 2 }} className="" onClick={isSubmit}>
				<img src={LDE} alt="" />
			</IconButton>
			<div></div>
		</div>
	);
}
