import React, { useEffect, useState } from 'react';
import './navHeader.scss';
import { IconButton } from '@mui/material';
import DehazeIcon from '@mui/icons-material/Dehaze';

export default function NavHeader() {
	return (
		<div className="mainNavHeader">
			<div className="navButton">
				<IconButton className="buttonMui">
					<DehazeIcon />
				</IconButton>
			</div>
		</div>
	);
}
