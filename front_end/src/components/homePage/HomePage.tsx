import React from 'react';
// import './StyleHomePage.scss'
import { TitlePage, Loggin, Section } from '..';

export default function Homepage() {
	return (
		<div className="d-flex HomePage  justify-content-between pt-5">
			<div className="d-flex flex-column ">
				<TitlePage />
				<Section />
			</div>
			<Loggin />
		</div>
	);
}
