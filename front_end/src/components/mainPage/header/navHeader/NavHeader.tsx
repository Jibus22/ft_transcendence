import DehazeIcon from '@mui/icons-material/Dehaze';
import { IconButton } from '@mui/material';
import React from 'react';
import './navHeader.scss';

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
