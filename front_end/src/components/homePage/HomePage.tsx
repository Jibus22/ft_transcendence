import React from 'react';
import { TitlePage, Loggin, Section } from '..';
import useMediaQuery from '@mui/material/useMediaQuery';

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
