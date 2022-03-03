import React, { useState } from 'react';
import '../StyleLoggin.scss';
import Drawer from '@mui/material/Drawer';

import DehazeIcon from '@mui/icons-material/Dehaze';
import IconButton from '@mui/material/IconButton';

export default function NavLogin() {
	const [isDrawerOpened, setDrawer] = useState(false);
	const [isLock, setLock] = useState(true);

	function toggleDrawerStatus() {
		setDrawer(true);
	}

	function closeDrawer() {
		setDrawer(false);
	}
	function toggleUnlock() {
		setLock(!isLock);
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
					<div className="navLock" onMouseOver={toggleUnlock} onMouseLeave={toggleUnlock}>
						<a
							href={`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_AUTH_CALLBACK_URL}&response_type=code&scope=public&state=coucou42`}
						>
							{isLock ? <img src="/lock-1.1s-200px.svg" alt="" /> : <img src="/unlock-1.1s-200px.svg" alt="" />}
						</a>
					</div>
					<div className="navConnect d-flex flex-column">
						<h1>Connect with 42</h1>
					</div>
				</div>
			</Drawer>
		</div>
	);
}
