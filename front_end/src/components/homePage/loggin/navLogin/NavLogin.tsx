import React, { useState } from 'react';
import '../StyleLoggin.scss';
import Drawer from '@mui/material/Drawer';

import DehazeIcon from '@mui/icons-material/Dehaze';
import IconButton from '@mui/material/IconButton';

type Anchor = 'top' | 'left' | 'bottom' | 'right';

export default function NavLogin() {
	const [isDrawerOpened, setDrawer] = useState(false);

	function toggleDrawerStatus() {
		setDrawer(true);
	}

	function closeDrawer() {
		setDrawer(false);
	}

	return (
		<div className="mainInfoNavLogin">
			<div>
				<IconButton className="iconButtonMui " onClick={toggleDrawerStatus}>
					{!isDrawerOpened ? <DehazeIcon /> : null}
				</IconButton>
			</div>

			<Drawer variant="temporary" open={isDrawerOpened} anchor="right" onClose={closeDrawer}>
				<div className="navTextMenu d-flex flex-column">
					<div className="nav42Logo">
						<img src="/42_logo.svg.png" alt="" />
					</div>
					<div className="nav42Welcome">
						<h1>Welcome to transcendance</h1>
					</div>
					<div className="navLock">
						<img src="/lock.png" alt="" />
					</div>
					<div className="navConnect d-flex flex-column">
						<h1>Connect with 42</h1>
					</div>
				</div>
			</Drawer>
		</div>
	);
}
