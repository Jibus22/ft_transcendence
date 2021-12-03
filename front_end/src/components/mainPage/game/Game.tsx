import React from 'react';

import { Play, OnlineGame } from '../..';
import { useMainPage } from '../../../MainPageContext';

export default function Game() {
	const { setTimeSnack, timer, setIsDisable, setLoading, setIsFriends } = useMainPage();

	function handleClick() {
		setLoading(true);
		setIsDisable(false);
		setTimeSnack(false);
		setIsFriends(false);
		setTimeout(function () {
			setLoading(false);
			setIsDisable(true);
			setTimeSnack(true);
		}, timer);
	}

	return (
		<div className="d-flex MainGame">
			<Play Loadingclick={handleClick} />
			<OnlineGame Loadingclick={handleClick} />
		</div>
	);
}
