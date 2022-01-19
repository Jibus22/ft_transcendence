import React, { useState } from 'react';
import './StyleLoggin.scss';
import FormLogin from './formLogin/FormLogin';
import unLock from './other/unlocked.png';
import inLock from './other/lock.png';
import Button from '@mui/material/Button';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useMount } from 'ahooks';

import { Bounce } from 'react-awesome-reveal';

export default function Loggin() {
	const [isKey, setIsKey] = useState(false);

	let navigate = useNavigate();
	const isLogged = async () => {
		try {
			const response = await axios.get(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/me/is-logged`, {
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

	useMount(() => {
		isLogged();
	});

	const changeUser = async () => {
		try {
			await axios.delete(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/auth/signout`, {
				withCredentials: true,
			});
			isLogged();
			setIsKey(false);
			navigate('/');
		} catch (error) {
			console.log(error);
		}
	};

	const logIn42 = (
		<div className="w-100 h-100">
			<div className="welcome ">
				<h1>Welcome to ft_transcendence</h1>
			</div>
			<div className="inLockImg d-flex flex-column">
				<img src={unLock} alt="" />
				<h1>Connect with 42</h1>
			</div>
			<div className="buttonConnect d-flex">
				<Bounce delay={1000} className="w-100 h1-100">
					<form className="TextLog w-100 h-100">
						{/* <a href="https://api.intra.42.fr/oauth/authorize?client_id=7610cae5bea0cf5544204791cb2461c29e2d38081bcadfb36a30fa7b01531fb4&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback&response_type=code&scope=public&state=coucou42"> */}
						<a href={`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_AUTH_CALLBACK_URL}&response_type=code&scope=public&state=coucou42`}>
							<Button className="buttonMuiConnect " variant="contained" sx={{ borderRadius: 2, textTransform: 'none' }}>
								Connect
							</Button>
						</a>
					</form>
				</Bounce>
			</div>
		</div>
	);

	////////////////////////////////////////
	//CHANGER ACOUNT

	////////////////////////////
	const logInKey = (
		<div className="w-100 loginInput ">
			<div className="welcome ">
				<h1>Welcome back to ft_transcendence</h1>
			</div>
			<div>
				<div className="lockImg d-flex flex-column">
					<img src={inLock} alt="" />
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

	return <div className="mainLoggin">{!isKey ? logIn42 : logInKey}</div>;
}
