import React, { useEffect, useState } from 'react';
import '../popUp.scss';
import IconButton from '@mui/material/Button';
import LDE from '../../photos/LogoDee.png';

export default function FormRandomUpload() {
	return (
		<div className="w-100 h-100">
			<IconButton sx={{ width: 2 / 2, height: 2 / 2 }} className="">
				<img src={LDE} alt="" />
			</IconButton>
		</div>
	);
}
