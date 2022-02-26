import clsx from 'clsx';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import '../pongGame.scss';
import PB from './img/Pong-basic.png';
import PC from './img/Pong.classic.png';
import PD from './img/pong_design.png';

interface Props {
	disableMap: boolean;
	isChoiceMap: boolean;
	count: number | undefined;
	isOpponant: boolean;
	setDisableMap: Dispatch<SetStateAction<boolean>>;
	setIsChoiceMap: Dispatch<SetStateAction<boolean>>;
	map: null | 'one' | 'two' | 'three';
	setMap: Dispatch<SetStateAction<null | 'one' | 'two' | 'three'>>;
}

export default function MapChoice({ disableMap, setDisableMap, isChoiceMap, setIsChoiceMap, count, isOpponant, setMap, map }: Props) {
	// const [map, setMap] = useState<null | 'one' | 'two' | 'three'>(null);

	const selectedMap = (str: null | 'one' | 'two' | 'three') => () => {
		setMap(str);
		setDisableMap(true);
	};

	const randMap = (min: number, max: number) => {
		const number = Math.floor(Math.random() * (max - min + 1) + min);

		if (number === 1) {
			setMap('one');
			setDisableMap(true);
		}
		if (number === 2) {
			setMap('two');
			setDisableMap(true);
		}
		if (number === 3) {
			setMap('three');
			setDisableMap(true);
		}
	};

	useEffect(() => {
		if (map !== null) {
			setIsChoiceMap(true);
		}
		if (count === 1 && isChoiceMap === false) {
			randMap(1, 3);
			return;
		}
	}, [count]);

	return (
		<>
			<div
				className={clsx(
					'map',
					map === 'one' || map == null ? 'active' : 'inactive',
					(!disableMap || !isOpponant) && 'buttonTransform',
					map === 'one' && disableMap && 'mapBig',
				)}
			>
				<button disabled={disableMap} onClick={selectedMap('one')}>
					<img src={PC} alt="" />
				</button>
			</div>
			<div
				className={clsx(
					'map',
					map === 'two' || map == null ? 'active' : 'inactive',
					!disableMap && 'buttonTransform',
					map === 'two' && disableMap && 'mapBig',
				)}
			>
				<button disabled={disableMap} onClick={selectedMap('two')}>
					<img src={PB} alt="" />
				</button>
			</div>
			<div
				className={clsx(
					'map',
					map === 'three' || map == null ? 'active' : 'inactive',
					!disableMap && 'buttonTransform',
					map === 'three' && disableMap && 'mapBig',
				)}
			>
				<button disabled={disableMap} onClick={selectedMap('three')}>
					<img src={PD} alt="" />
				</button>
			</div>
		</>
	);
}
