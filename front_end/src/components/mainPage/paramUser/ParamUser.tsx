import React, { useState, useRef } from 'react';
import './paramUser.scss';
import PopUpUser from './PopUp/PopUpUser';
import { useSpring, animated } from 'react-spring';
import { Switch, FormControlLabel, Button, IconButton, Avatar } from '@mui/material';
import FormUser from './FormUser';
import PencilIcon from './photos/pencil-icon.png';
import { useMainPage } from '../../../MainPageContext';
import { useHover } from 'ahooks';
import DoubleAuth from './doubleAuth/DoubleAuth';

export default function ParamUser() {
	const props = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 500px)' },
		config: {
			delay: 350,
			duration: 350,
		},
	});

	const { userImg, userName } = useMainPage();
	const ref = useRef<HTMLDivElement>(null);
	const isHovering = useHover(ref);

	const [isPop, setIsPop] = useState<boolean>(false);

	function printPopup() {
		setIsPop(!isPop);
	}

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
								<p>Game</p>
							</div>
							<div className="">
								<p>Win</p>
							</div>
							<div className="">
								<p>Looses</p>
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
					<DoubleAuth isPop={isPop} />
					<div className="disconectMui">
						<Button disabled={isPop} variant="text">
							Disconnect
						</Button>
					</div>
				</div>
			</div>
		</animated.div>
	);
}
