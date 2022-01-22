import ErrorIcon from '@mui/icons-material/Error';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import axios, { AxiosError } from 'axios';
import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import { UserMe } from './components/type';

interface IMainPageContext {
	data: Array<UserMe>;
	timeSnack: boolean;
	isDisable: boolean;
	isFriends: boolean;
	loading: boolean;
	customPhoto: boolean;
	openSure: boolean;
	isUpload: boolean;
	openUpload: boolean;
	selectNav: Boolean;
	startGame: Boolean;
	leaveGame: boolean;
	userStatus: boolean;
	selectQuery: boolean;
	selectedImage: File;
	timer: number;
	userName: string;
	userImg: string;
	pathPop: string;

	setData: Dispatch<SetStateAction<never[]>>;
	setTimeSnack: Dispatch<SetStateAction<boolean>>;
	setIsDisable: Dispatch<SetStateAction<boolean>>;
	setLoading: Dispatch<SetStateAction<boolean>>;
	setSelectQuery: Dispatch<SetStateAction<boolean>>;
	setCustomPhoto: Dispatch<SetStateAction<boolean>>;
	setIsFriends: Dispatch<SetStateAction<boolean>>;
	setOpenSure: Dispatch<SetStateAction<boolean>>;
	setIsUpload: Dispatch<SetStateAction<boolean>>;
	setOpenUpload: Dispatch<SetStateAction<boolean>>;
	setStartGame: Dispatch<SetStateAction<boolean>>;
	setSelectNav: Dispatch<SetStateAction<boolean>>;
	setLeaveGame: Dispatch<SetStateAction<boolean>>;
	setSelectedImage: Dispatch<SetStateAction<File>>;
	setTimer: Dispatch<SetStateAction<number>>;
	setUserName: Dispatch<SetStateAction<string>>;
	setUserImg: Dispatch<SetStateAction<string>>;
	setPathPop: Dispatch<SetStateAction<string>>;

	printSnackBar: () => void;
	fetchDataUserMe: () => void;
	onSubmit: (file: File, path: string) => void;
	onSubmitUpload: (file: File) => void;
	dialogMui: (open: boolean, disagree: () => void, agree: () => void, title: string, description: string) => void;
	setStatusColor: (status: string) => string;
}

const MainPageContext = React.createContext({} as IMainPageContext);

const MainPageProvider = (props: any) => {
	const [data, setData] = useState([]);

	const [timeSnack, setTimeSnack] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isFriends, setIsFriends] = useState(false);
	const [openSure, setOpenSure] = useState(false);
	const [isUpload, setIsUpload] = useState(false);
	const [selectNav, setSelectNav] = useState(false);
	const [startGame, setStartGame] = useState(false);
	const [openUpload, setOpenUpload] = useState(false);
	const [leaveGame, setLeaveGame] = useState(false);
	const [isDisable, setIsDisable] = useState(true);
	const [customPhoto, setCustomPhoto] = useState(true);
	const [timer, setTimer] = useState(5000);
	const [userName, setUserName] = useState('');
	const [userImg, setUserImg] = useState('');
	const [pathPop, setPathPop] = useState('');
	const [selectedImage, setSelectedImage] = useState();
	const [selectQuery, setSelectQuery] = useState(false);

	// const [dataHistory, setDataHistory] = useState([]);

	const fetchDataUserMe = async () => {
		try {
			const { data } = await axios.get('http://localhost:3000/me', {
				withCredentials: true,
			});
			setData([data]);
		} catch (err) {
			console.log(err);
		}
	};

	// const fetchDataHistory = async () => {
	// 	try {
	// 		const { data } = await axios.get('http://localhost:3000/game/history', {
	// 			withCredentials: true,
	// 		});
	// 		setDataHistory(data);
	// 	} catch (error) {
	// 		const err = error as AxiosError;
	// 		console.log(err);
	// 	}
	// };

	const onSubmit = async (file: File, path: string) => {
		let data = new FormData();
		data.append('file', file);
		try {
			await axios.post('http://localhost:3000/' + path, data, {
				withCredentials: true,
			});
			fetchDataUserMe();
		} catch (err) {
			console.log(err);
		}
	};
	const onSubmitUpload = async (file: File) => {
		let data = new FormData();
		if (customPhoto) {
			setOpenSure(true);
		}

		if (file) {
			data.append('file', file);
		}
		try {
			await axios.post('http://localhost:3000/me/photo', data, {
				withCredentials: true,
			});
			fetchDataUserMe();
		} catch (error) {
			const err = error as AxiosError;
			if (err.response?.status === 400) {
				setOpenUpload(true);
				return;
			}
		}
	};

	const dialogMui = (open: boolean, disagree: () => void, agree: () => void, title: string, description: string) => {
		return (
			<Dialog
				open={open}
				onClose={disagree}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				scroll="body"
				className="mainDialogMui"
			>
				<DialogTitle id="alert-dialog-title" className="d-flex">
					<ErrorIcon sx={{ color: 'orange' }} />
					<div className="titleDialogMui">
						<p>{title}</p>
					</div>
				</DialogTitle>
				<DialogContent className="contentDialogMui">
					<DialogContentText id="alert-dialog-description">{description}</DialogContentText>
				</DialogContent>
				<DialogActions className="actionDialogMui">
					<Button className="buttonMui" sx={{ color: 'red' }} onClick={disagree}>
						Disagree
					</Button>

					<Button className="buttonMui" onClick={agree}>
						Agree
					</Button>
				</DialogActions>
			</Dialog>
		);
	};

	const setStatusColor = (status: string): string => {
		if (status === 'offline') {
			return '#FF3F00';
		}
		if (status === 'online') {
			return 'green';
		}
		if (status === 'ingame') {
			return '#FFC900';
		} else {
			return 'green';
		}
	};

	const ProviderValue = {
		timeSnack,
		timer,
		isDisable,
		loading,
		data,
		userName,
		userImg,
		isFriends,
		customPhoto,
		openSure,
		pathPop,
		isUpload,
		selectedImage,
		openUpload,
		selectQuery,
		selectNav,
		startGame,
		leaveGame,

		setSelectQuery,
		setCustomPhoto,
		setTimeSnack,
		setTimer,
		setIsDisable,
		setLoading,
		setData,
		fetchDataUserMe,
		setUserName,
		setUserImg,
		setIsFriends,
		setOpenSure,
		onSubmit,
		onSubmitUpload,
		setPathPop,
		setIsUpload,
		setSelectedImage,
		setOpenUpload,
		dialogMui,
		setStatusColor,
		setStartGame,
		setSelectNav,
		setLeaveGame,

		// dataHistory,
		// setDataHistory,

		// fetchDataHistory,
	};

	return <MainPageContext.Provider value={ProviderValue} {...props}></MainPageContext.Provider>;
};

const useMainPage = () => {
	return useContext(MainPageContext);
};

export { MainPageProvider, useMainPage };
