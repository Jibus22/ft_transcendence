import React, { useState, useRef, useEffect, Dispatch } from 'react';
import './safari.css';
import PopUpUser from './PopUp/PopUpUser';
import { useSpring, animated } from 'react-spring';
import { Button, IconButton, Avatar } from '@mui/material';
import FormUser from './FormUser';
import PencilIcon from './photos/pencil-icon.png';
import { useMainPage } from '../../../MainPageContext';
import { useHover } from 'ahooks';
import DoubleAuth from './doubleAuth/DoubleAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Props {
	setTime: Dispatch<React.SetStateAction<boolean>>;
}

export default function ParamUser({ setTime }: Props) {
	const props = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 170px)' },
		config: {
			delay: 350,
			duration: 350,
		},
	});

	const { userImg, userName, dialogMui, data } = useMainPage();
	const ref = useRef<HTMLDivElement>(null);
	const isHovering = useHover(ref);

	let navigate = useNavigate();

	const [isPop, setIsPop] = useState<boolean>(false);

	const [dataFa, setDataFa] = useState(false);

	useEffect(() => {
		if (data.length > 0) {
			setDataFa(data[0].hasTwoFASecret);
		}
	}, [data]);

	function printPopup() {
		setIsPop(!isPop);
	}

	const [open, setOpen] = useState(false);
	const disagree = () => {
		setOpen(false);
	};

	const agree = async () => {
		setOpen(false);
		try {
			await axios.delete(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/auth/signout`, {
				withCredentials: true,
			});
			setTime(true);
			setTimeout(function () {
				setTime(false);
				navigate('/');
			}, 1500);
		} catch (error) {
			console.log(error);
		}
	};

	const disconect = async () => {
		setOpen(true);
	};

	return (
		<animated.div style={props} className="w-100 ">
			<div className="mainParamUser d-flex flex-column">
				{isPop ? <PopUpUser printPopup={printPopup} /> : null}
				<div ref={ref} className="imgUser ">
					<Avatar
						alt="userImg"
						src={userImg}
						sx={{ width: 2 / 2, height: 2 / 2 }}
						className={`${isHovering && !isPop ? 'imgFilter ' : ''} `}
					/>

					{isHovering && !isPop ? (
						<div className="userModif">
							<IconButton sx={{ width: 2 / 2, height: 2 / 2 }} className="" onClick={printPopup}>
								<img src={PencilIcon} alt="" />
							</IconButton>
						</div>
					) : null}
				</div>
				<div className={`${isPop ? 'mainStatUserBlur' : 'mainStatUser'} `}>
					<div className="StatUser d-flex flex-column">
						<div className="infoStatUser d-flex ">
							<div className="">
								<p>Games</p>
							</div>
							<div className="">
								<p>Wins</p>
							</div>
							<div className="">
								<p>loses</p>
							</div>
						</div>
						<div className="statNbUser d-flex ">
							<div className="">
								<p>15</p>
							</div>
							<div className="middleNbUser">
								<p>2</p>
							</div>
							<div className="">
								<p>13</p>
							</div>
						</div>
					</div>
					<div className="mainMaterialUiText ">
						<FormUser isPop={isPop} userName={userName} />
					</div>

					<DoubleAuth isPop={isPop} dataFa={dataFa} />
					<div className="disconectMui">
						<Button disabled={isPop} onClick={disconect} variant="text">
							Disconnect
						</Button>
					</div>
				</div>
				{dialogMui(open, disagree, agree, 'Warning !', 'Are you sure you want to disconnect ?')}
			</div>
		</animated.div>
	);
}
