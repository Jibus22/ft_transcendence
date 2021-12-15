import React from 'react';
import { Socket } from "socket.io-client";
import { Play, OnlineGame } from '../..';
import { useMainPage } from '../../../MainPageContext';

interface Props {
    wsStatus: Socket | undefined;
  }

export default function Game({wsStatus}: Props) {
	const { setTimeSnack, timer, setIsDisable, setLoading, setIsFriends } = useMainPage();

	function handleClick() {
        /*
         TEST MESSAGE EMIT for ingame status: set
         TODO: add `wsStatus && wsStatus.emit('ingame', 'out');`
            when user exits game!
        */
        wsStatus && wsStatus.emit('ingame', 'in');

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
