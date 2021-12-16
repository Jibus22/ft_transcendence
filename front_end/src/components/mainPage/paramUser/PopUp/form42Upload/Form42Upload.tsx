import React from 'react';

import IconButton from '@mui/material/Button';
import L42 from '../../photos/Logo42.png';
import { useMainPage } from '../../../../../MainPageContext';

export default function Form42Upload() {
	const { customPhoto, setOpenSure, setPathPop } = useMainPage();

	const isSubmit = () => {
		setPathPop('me/useSchoolPhoto');
		if (customPhoto) {
			setOpenSure(true);
		}
	};

	return (
		<div className="w-100 h-100">
			<IconButton sx={{ width: 2 / 2, height: 2 / 2 }} className="" onClick={isSubmit}>
				<img src={L42} alt="" />
			</IconButton>
		</div>
	);
}
