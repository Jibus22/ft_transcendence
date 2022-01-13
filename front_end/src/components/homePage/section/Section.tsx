import React from 'react';
import './StyleSection.scss';
import FF from './photos/FF.png';
import MA from './photos/MA.png';
import JB from './photos/JB.png';
import VG from './photos/VG.png';
import BG from './photos/BG.png';
import { useSpring, animated } from 'react-spring';
import useMediaQuery from '@mui/material/useMediaQuery';

interface Props {
	img: string;
	name: string;
	info: string;
	translate: string;
	duration: number;
}

const UserInfo = ({ img, name, info, translate, duration }: Props) => {
	const anim = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: translate },
		config: {
			delay: 300,
			duration: duration,
		},
	});

	return (
		<animated.div style={anim} className="w-100">
			<div className="w-100 h-100 d-flex">
				<img src={img} alt="" />
				<div className="info ">
					<h3>{name}</h3>
					<p>{info}</p>
				</div>
			</div>
		</animated.div>
	);
};

export default function Section() {
	return (
		<div className="Section d-flex ">
			<div className=" listProfil-1  d-flex flex-column ">
				<div className=" profil profil1  ">
					<UserInfo img={FF} name={'Frfrance'} info={'Front-end Developer'} duration={1000} translate={'translate(-500px, 0px)'} />
				</div>
				<div className=" profil profil2  ">
					<UserInfo img={JB} name={'Jle-corr'} info={'Back-end Developer'} duration={1500} translate={'translate(-1000px, 0px)'} />
				</div>
				<div className=" profil profil3  ">
					<UserInfo img={MA} name={'Mrouchy'} info={'Back-end Developer'} duration={2000} translate={'translate(-1500px, 0px)'} />
				</div>
			</div>
			<div className="listProfil-2">
				<div className=" profil profil4  ">
					<UserInfo img={VG} name={'Vgoldman'} info={'Front-end Developer'} duration={1200} translate={'translate(-1000px, 0px)'} />
				</div>
				<div className=" profil profil5 ">
					<UserInfo img={BG} name={'Bvalette'} info={'Back-end Developer'} duration={1700} translate={'translate(-1000px, 0px)'} />
				</div>
			</div>
		</div>
	);
}
