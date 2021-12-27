import React, { useState, useEffect } from 'react';
import './StyleLoggin.scss';
import FormLogin from './formLogin/FormLogin';
import Lock from './other/Vector.png';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Loggin() {
	const matches = useMediaQuery('(max-width:1000px)');

	const [isNav, setIsNav] = useState(false);

	const [isKey, setIsKey] = useState(false);

	useEffect(() => {
		isLogged();
	}, []);

	let navigate = useNavigate();
	const isLogged = async () => {
		try {
			const response = await axios.get('http://localhost:3000/me/is-logged', {
				withCredentials: true,
			});

			const auth = response.headers['completed-auth'];
			if (response.status === 200) {
				if (auth === 'false') {
					setIsKey(true);
				}
				if (auth === 'true') {
					navigate('/MainPage');
				}
			}
		} catch (error) {
			const err = error as AxiosError;
			if (err.response?.status === 401) {
				return;
			}
		}
	};

	const changeUser = async () => {
		try {
			await axios.delete('http://localhost:3000/auth/signout', {
				withCredentials: true,
			});
			isLogged();
			setIsKey(false);
			navigate('/');

			// setTime(true);
			// setTimeout(function () {
			// 	setTime(false);
			// 	navigate('/');
			// }, 1500);
		} catch (error) {
			console.log(error);
		}
	};

	const deskop1 = (
		<div className="w-100 h-100">
			<div className="welcome ">
				<h1>Welcome to ft_transcendence</h1>
			</div>
			<div className="lockImg d-flex flex-column">
				<img src={Lock} alt="" />
				<h1>Connect with 42</h1>
			</div>
			<div className="buttonConnect d-flex">
				{/* <Bounce delay={1300} className='w-100 h1-100' > */}
				<form className="TextLog w-100 h-100">
					<a href="https://api.intra.42.fr/oauth/authorize?client_id=7610cae5bea0cf5544204791cb2461c29e2d38081bcadfb36a30fa7b01531fb4&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback&response_type=code&scope=public&state=coucou42">
						<Button className="buttonMuiConnect " variant="contained" sx={{ borderRadius: 2, textTransform: 'none' }}>
							Connect
						</Button>
					</a>
				</form>
				{/* </Bounce> */}
			</div>
		</div>
	);

	const deskop = (
		<div className="w-100 loginInput ">
			<div className="welcome ">
				<h1>Welcome back to ft_transcendence</h1>
			</div>
			<div>
				<div className="lockImg d-flex flex-column">
					<img src={Lock} alt="" />
					<h1>Connect with Key-Auth</h1>
				</div>
			</div>
			<div>
				<FormLogin />
			</div>
			<div className="disconectMui">
				<p onClick={changeUser}>Change account</p>
			</div>
		</div>
	);

	// function handleClick() {
	// 	setIsNav(!isNav);
	// }

	// return !matches ? (
	// 	<div className="mainLoggin">{deskop}</div>
	// ) : (
	// 	<div className="mainNavMenuLoggin d-flex ">
	// 		{isNav && null}
	// 		{!isNav && <NavLogin />}
	// 	</div>
	// );

	return (
		<div className="mainLoggin">
			{/* <div className="welcome ">
				<h1>Welcome to ft_transcendence</h1>
			</div>
			<div className="lockImg d-flex flex-column">
				<img src={Lock} alt="" />
				<h1>Connect with 42</h1>
			</div>
			<div className="buttonConnect d-flex">
				{/* <Bounce delay={1300} className='w-100 h1-100' > 
				<form className="TextLog w-100 h-100">
					<a href="https://api.intra.42.fr/oauth/authorize?client_id=7610cae5bea0cf5544204791cb2461c29e2d38081bcadfb36a30fa7b01531fb4&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback&response_type=code&scope=public&state=coucou42">
						<Button className="buttonMuiConnect " variant="contained" sx={{ borderRadius: 2, textTransform: 'none' }}>
							Connect
						</Button>
					</a>
				</form>
				{/* </Bounce> 
			</div> */}

			{!isKey ? deskop1 : deskop}
		</div>
	);
}
