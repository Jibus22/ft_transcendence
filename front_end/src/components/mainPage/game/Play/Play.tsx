import { LoadingButton } from '@mui/lab';
import { Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { useMainPage } from '../../../../MainPageContext';
import FormPlay from './FormPlay';
import IconGame from './img/raquette.png';
import './play.scss';
import './safari.css';

interface Props {
	Loadingclick: () => void;
}

export default function Play({ Loadingclick }: Props) {
	const props = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 5vw)' },
		config: {
			delay: 300,
			duration: 300,
		},
	});

	const {
		isDisable,
		loading,
		setSelectQuery,
		setIsGameRandom,
		loadingSocket,
		setPlayerNewGameInvit,
		setIsOpponant,
		setPlayerNewGameJoin,
		setDataPlayerNewGameJoin,
	} = useMainPage();

	const [isForm, setIsForm] = useState<boolean>(false);

	function handleChangeWindow() {
		setIsForm(!isForm);
	}

	const fetchDataGameRandom = async () => {
		await axios({
			url: `http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/game/join`,
			method: 'POST',
			withCredentials: true,
		})
			.then((response) => {
				console.log(response);
				if (response.data === '') {
					setPlayerNewGameInvit(true);
					setIsOpponant(true);
				} else {
					setDataPlayerNewGameJoin(response.data);
					setIsOpponant(false);
					setPlayerNewGameJoin(true);
				}
			})
			.catch((err) => {
				console.error(err);
			});
	};

	useEffect(() => {
		setSelectQuery(true);

		return () => {
			setSelectQuery(false);
		};
	});

	const getGame = () => {
		setIsGameRandom(true);
		fetchDataGameRandom();
		// setStartGame(true);
		Loadingclick();
	};

	let buttonFriends;
	if (!isForm) {
		buttonFriends = (
			<div className="">
				<Button
					className="buttonMui buttonMuiFriend"
					variant="contained"
					disabled={!isDisable || !loadingSocket}
					onClick={handleChangeWindow}
					sx={{
						borderRadius: 3,
						width: 2 / 2,
						height: 2 / 2,
						textTransform: 'none',
					}}
				>
					Invite someone
				</Button>
			</div>
		);
	} else {
		buttonFriends = <FormPlay Loadingclick={Loadingclick} disable={isDisable} loading={loading} />;
	}

	return (
		<animated.div style={props} className="w-100 test">
			<div className="mainGameWindow d-flex flex-column ">
				<div className="msgPlay  ">
					<h1>Do you want to play now ? </h1>
				</div>

				<div className="iconePLayGame">{<img src={IconGame} alt="" />}</div>
				<div className="playRandom">
					<LoadingButton
						className="buttonMui"
						onClick={getGame}
						disabled={loading || !loadingSocket}
						variant="contained"
						sx={{
							width: 2 / 2,
							height: 2 / 2,
							textTransform: 'none',
						}}
					>
						{loading && <CircularProgress size="1.2em" />}
						{!loading && 'Play Now'}
					</LoadingButton>
					{buttonFriends}
				</div>
			</div>
		</animated.div>
	);
}
