import DehazeIcon from '@mui/icons-material/Dehaze';
import CloseIcon from '@mui/icons-material/Close';
import { Avatar, Badge, Drawer, IconButton } from '@mui/material';
import { NavLink as Link } from 'react-router-dom';
import React, { useState } from 'react';
import './navHeader.scss';
import { useMainPage } from '../../../../MainPageContext';

interface Props {
	userName: string;
	userImg: string;
}

export default function NavHeader({ userName, userImg }: Props) {
	const [isDrawerOpened, setDrawer] = useState(false);
	const [isLock, setLock] = useState(true);

	const { setSelectNav } = useMainPage();

	const toggleDrawerStatus = () => {
		setDrawer(true);
	};

	const closeDrawer = () => {
		setDrawer(false);
	};

	const isMainPage = (option: number) => () => {
		closeDrawer();
		if (option === 1) {
			setSelectNav(true);
		} else {
			setSelectNav(false);
		}
	};

	return (
		<div className="mainNavHeader">
			<div className="navButton">
				<IconButton className="buttonMui" onClick={toggleDrawerStatus}>
					<DehazeIcon />
				</IconButton>
			</div>
			<div className="lala">
				<Drawer className="drawerMui" open={isDrawerOpened} anchor="left" onClose={closeDrawer}>
					<div className="navTextMenu d-flex flex-column">
						<div className="closeNav">
							<IconButton className="buttonMui" onClick={closeDrawer}>
								<CloseIcon />
							</IconButton>
						</div>
						<div className="userNav">
							<Badge
								overlap="circular"
								anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
								variant="dot"
								sx={{
									'.MuiBadge-badge': {
										backgroundColor: 'green',
										color: 'green',
										borderColor: 'green',
										boxShadow: 'green',
									},
									'.MuiBadge-badge::after': {
										borderColor: 'green',
									},
								}}
							>
								<Avatar alt="userImg" src={userImg} />
							</Badge>
							<h1>{userName}</h1>
						</div>

						<div className="mainNav">
							<div className="navHeader" onClick={isMainPage(2)}>
								<Link to="/MainPage">
									<h1>New games</h1>
								</Link>
							</div>
							<Link to="/MainPage">
								<div className="navHeader" onClick={isMainPage(1)}>
									<h1>Onlines games</h1>
								</div>
							</Link>
							<div className="navHeader" onClick={closeDrawer}>
								<Link to="/Rank">
									<h1>Leaderboard</h1>
								</Link>
							</div>
							<div className="navHeader" onClick={closeDrawer}>
								<Link to="/History-Game">
									<h1>History</h1>
								</Link>
							</div>
							<div className="navHeader" onClick={closeDrawer}>
								<Link to="/Setting">
									<h1>Settings</h1>
								</Link>
							</div>
						</div>
					</div>
				</Drawer>
			</div>
		</div>
	);
}
