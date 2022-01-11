import React, { useEffect } from 'react';
import './header.scss';
import { useMainPage } from '../../../MainPageContext';
import { NavLink as Link } from 'react-router-dom';
import { Badge, Avatar, useMediaQuery } from '@mui/material';
// import { withStyles } from '@material-ui/core/styles';

export default function Header() {
	const { data, userName, userImg, setUserName, setUserImg } = useMainPage();

	const query = useMediaQuery('(max-width:850px)');

	useEffect(() => {
		if (data.length > 0) {
			setUserName(data[0].login);
			setUserImg(data[0].photo_url);
			// setlol(data[0].status);
		}
	});

	return (
		<div className=" d-flex flex-column mainHeader ">
			<nav className="navbar   menuHeader stroke ">
				<div className="d-flex  mainNavMenu">
					<ul className="navbar-nav headerMenu  w-100 ">
						<li className="nav-item  linkLogoNav">
							<Link className={(navData) => (navData.isActive ? 'selectedNave' : '')} to="/MainPage">
								<h1>Games</h1>
							</Link>
						</li>

						<li className="nav-item leaderDiv  ">
							<Link className={(navData) => (navData.isActive ? 'selectedNave' : '')} to="/Rank">
								<h1>LeaderBoard</h1>
							</Link>
						</li>

						<li className="nav-item linkLogoNav ">
							<Link className={(navData) => (navData.isActive ? 'selectedNave' : '')} to="/History-Game">
								<h1>History</h1>
							</Link>
						</li>
					</ul>
				</div>

				<div className="logHeader d-flex ">
					<Link className={(navData) => (navData.isActive && query ? 'selectedNave' : '')} to="/Setting">
						<div className="profil d-flex   ">
							<div className="profilLoggin  ">
								<h2 className="">{userName}</h2>
							</div>
							{!query ? (
								<div className="profilLogginImg ">
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
								</div>
							) : null}
						</div>
					</Link>
				</div>
			</nav>
			<div></div>
		</div>
	);
}
