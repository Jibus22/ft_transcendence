import React from 'react';
// import './StyleHomePage.scss'
import { TitlePage, Loggin, Section } from '..';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Bounce, Fade, Flip, Hinge, Slide, Zoom } from 'react-awesome-reveal';

export default function Homepage() {
	const query = useMediaQuery('(max-width:900px)');

	return (
		<div className={` ${query ? 'd-flex flex-column' : 'd-flex justify-content-between'} HomePage `}>
			<div className="d-flex flex-column ">
				<TitlePage />
				{!query ? <Section /> : null}
			</div>

			<Loggin />
		</div>
	);
}
