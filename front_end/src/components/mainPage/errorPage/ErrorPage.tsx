import React, { useEffect, useRef } from 'react';
import './errorPage.scss';
import { useMount } from 'ahooks';
import { gsap, Linear } from 'gsap';

interface Props {
	isHeader: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ErrorPage({ isHeader }: Props) {
	useMount(() => {
		isHeader(false);
	});

	const boxCog1 = useRef<HTMLDivElement>(null);
	const boxCog2 = useRef<HTMLDivElement>(null);
	const boxWrongPara = useRef<HTMLDivElement>(null);

	useEffect(() => {
		gsap.to(boxCog1.current, { transformOrigin: '50% 50%', rotation: '+=360', repeat: -1, duration: 8, ease: Linear.easeNone });
		gsap.to(boxCog2.current, { transformOrigin: '50% 50%', rotation: '+=360', repeat: -1, duration: 8, ease: Linear.easeNone });
		gsap.to(boxCog2.current, { transformOrigin: '50% 50%', rotation: '+=360', repeat: -1, duration: 8, ease: Linear.easeNone });
	});

	return (
		<div className="mainErrorPage">
			<h1 className="first-four">4</h1>
			<div className="cog-wheel1">
				<div className="cog1" ref={boxCog1}>
					<div className="top"></div>
					<div className="down"></div>
					<div className="left-top"></div>
					<div className="left-down"></div>
					<div className="right-top"></div>
					<div className="right-down"></div>
					<div className="left"></div>
					<div className="right"></div>
				</div>
			</div>

			<div className="cog-wheel2">
				<div className="cog2" ref={boxCog2}>
					<div className="top"></div>
					<div className="down"></div>
					<div className="left-top"></div>
					<div className="left-down"></div>
					<div className="right-top"></div>
					<div className="right-down"></div>
					<div className="left"></div>
					<div className="right"></div>
				</div>
			</div>
			<h1 className="second-four">4</h1>
			<p className="wrong-para" ref={boxWrongPara}>
				Oh Noo ! Page not found !
			</p>
		</div>
	);
}
