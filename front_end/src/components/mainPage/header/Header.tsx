import React, { useEffect } from 'react';
import './header.scss';
import { useMainPage } from '../../../MainPageContext';
import { NavLink as Link } from 'react-router-dom';
import { Badge, Avatar } from '@mui/material';
// import { withStyles } from '@material-ui/core/styles';

export default function Header() {
	const { data, userName, userImg, setUserName, setUserImg } = useMainPage();

	// const [lol, setlol] = useState('');

	useEffect(() => {
		if (data.length > 0) {
			setUserName(data[0].login);
			setUserImg(data[0].photo_url);
			// setlol(data[0].status);
		}
	});

	// 	if (document.getElementById("changeColorDemo").value !== "") {
	// 		document.getElementById("buttonDemo").style.background = "green";
	// 	 } else {
	// 		document.getElementById("buttonDemo").style.background = "skyblue";
	// 	 }
	//   }

	// const setStatusColor = (status: string) => {
	// 	if (status === 'offline') {
	// 		setColorStatus('red');
	// 	}
	// 	if (status === 'online') {
	// 		setColorStatus('red');
	// 	}
	// 	if (status === 'ingame') {
	// 		setColorStatus('orange');
	// 	}
	// };

	return (
		<div className=" d-flex flex-column mainHeader ">
			<nav className="navbar navbar-expand-lg  menuHeader stroke ">
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
					<Link className={(navData) => (navData.isActive ? 'active' : '')} to="/Setting">
						<div className="profil d-flex   ">
							<div className="profilLoggin  ">
								<h2 className="">{userName}</h2>
							</div>
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
						</div>
					</Link>
				</div>
			</nav>
			<div></div>
		</div>
	);
}
