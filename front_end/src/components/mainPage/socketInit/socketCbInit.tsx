import React from 'react';
import { Socket } from 'socket.io-client';
import { sleep } from '../utils/utils';
import { doConnect, connectWs } from './socketCoreInit';

export const setWsCallbacks = (
	socket: Socket,
	stateSetter: (value: React.SetStateAction<Socket | undefined>) => void,
	stateSetter2: (value: React.SetStateAction<boolean>) => void,
) => {
	/* -----------------------
	 ** Connection
	 * -----------------------*/

	socket.on('connect', () => {
		console.log(`[CHAT SOCKET 🍄 ] WS CONNECT`);
		stateSetter(socket);
	});

	socket.on('disconnect', () => {
		console.log(`[CHAT SOCKET 🍄 ] WS DISCONNECTED`);
		doConnect(socket, stateSetter);
	});

	socket.on('connect_error', async (err) => {
		console.log('[CHAT SOCKET 🍄 ] connect_error', err);
		connectWs(
			`ws://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/chat`,
			setWsCallbacks,
			stateSetter,
			stateSetter2,
		);
	});

	socket.io.on('error', (error) => {
		console.log('[CHAT SOCKET 🍄 ] ⚠️ RECEIVED ERROR', error);
	});

	/* -----------------------
	 ** Events
	 * -----------------------*/

	socket.on('publicRoomCreated', (message) => {
		console.log(`💌  Event: publicRoomCreated ->`, message);
		window.dispatchEvent(
			new CustomEvent('publicRoomCreated', { detail: message }),
		);
	});
	socket.on('publicRoomUpdated', (message) => {
		console.log(`💌  Event: publicRoomUpdated ->`, message);
		window.dispatchEvent(
			new CustomEvent('publicRoomUpdated', { detail: message }),
		);
	});
	socket.on('publicRoomRemoved', (message) => {
		console.log(`💌  Event: publicRoomRemoved ->`, message);
	});
	socket.on('newMessage', (message) => {
		console.log(`💌  Event: newMessage ->`, message);
		window.dispatchEvent(new CustomEvent('newMessage', { detail: message }));
	});
	socket.on('roomParticipantUpdated', (message) => {
		console.log(`💌  Event: roomParticipantUpdated ->`, message);
		window.dispatchEvent(
			new CustomEvent('roomParticipantUpdated', { detail: message }),
		);
	});
	socket.on('userAdded', (message) => {
		console.log(`💌  Event: userAdded ->`, message);
		window.dispatchEvent(new CustomEvent('userAdded', { detail: message }));
	});
	socket.on('userRemoved', (message) => {
		console.log(`💌  Event: userRemoved ->`, message);
	});
	socket.on('userModeration', (message) => {
		console.log(`💌  Event: userModeration ->`, message);
		window.dispatchEvent(
			new CustomEvent('publicRoomUpdated', { detail: message }),
		);
	});
	socket.on('userBanned', (message) => {
		console.log(`💌  Event: userBanned ->`, message);
	});
	socket.on('publicUserInfosUpdated', (message) => {
		console.log(`💌  Event: publicUserInfosUpdated ->`, message);
		window.dispatchEvent(
			new CustomEvent('publicRoomUpdated', { detail: message }),
		);
	});
};

export const gameCallbacks = (
	socket: Socket,
	stateSetter: (value: React.SetStateAction<Socket | undefined>) => void,
	stateSetter2: (value: React.SetStateAction<boolean>) => void,
) => {
	/* -----------------------
	 ** Connection
	 * -----------------------*/

	socket.on('connect', async () => {
		console.log(`[GAME SOCKET 🎲 ] WS CONNECT`);
		await sleep(1000);
		stateSetter2(true);
	});

	socket.on('disconnect', () => {
		console.log(`[GAME SOCKET 🎲 ] WS DISCONNECTED`);
		doConnect(socket, stateSetter);
	});

	socket.on('connect_error', async (err) => {
		console.log('[GAME SOCKET 🎲 ] connect_error', err);
		connectWs(
			`ws://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/game`,
			gameCallbacks,
			stateSetter,
			stateSetter2,
		);
	});

	socket.io.on('error', (error) => {
		console.log('[GAME SOCKET 🎲 ] ⚠️ RECEIVED ERROR', error);
	});
};
