import axios from 'axios';
import React from 'react';
import { io, Socket } from 'socket.io-client';

/* -----------------------
 ** Initialization
 * -----------------------*/

const getAuthToken = async () => {
	return await axios(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/auth/ws/token`, {
		withCredentials: true,
	}).then((response) => {
		const { token } = response.data;
		if (!token) {
			throw new Error('no valid token');
		}
		return token;
	});
};

export const doDisconnect = async (socket: Socket | undefined, stateSetter: (value: React.SetStateAction<Socket | undefined>) => void) => {
	stateSetter(undefined);
	if (socket) {
		socket.off('disconnect');
		socket.on('disconnect', () => {
			console.log('user chose to leave !');
		});
		socket.disconnect();
	}
};

export const doConnect = async (socket: Socket, stateSetter: (value: React.SetStateAction<Socket | undefined>) => void) => {
	setTimeout(async () => {
		await getAuthToken()
			.then((token) => {
				console.log('DOCONNECT', socket);
				socket.auth = { key: `${token}` };
				socket.connect();
				stateSetter(socket);
			})
			.catch((err) => {
				console.log('DOCONNECT ERROR ->', err);
				stateSetter(undefined);
				doConnect(socket, stateSetter);
			});
	}, 1000);
};

export const connectWs = async (
	uri: string,
	cbSetter: (socket: Socket, stateSetter: React.Dispatch<React.SetStateAction<Socket | undefined>>, pouet: string | undefined) => void,

	stateSetter: (value: React.SetStateAction<Socket | undefined>) => void,
	login: string | undefined,
) => {
	await new Promise((res) => {
		setTimeout(() => {
			const socket = io(uri, {
				autoConnect: false,
				reconnection: false,
				forceNew: true,
			});
			cbSetter(socket, stateSetter, login);
			stateSetter(socket);
			doConnect(socket, stateSetter);
			res('');
		}, 500);
	});
};
