import ErrorIcon from '@mui/icons-material/Error';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { io, Socket } from 'socket.io-client';
import axios, { AxiosError } from 'axios';
import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserMe, LoginGame, User, UserChallenge, UserOnlineGame, OnlineGameType, OnlineGameAndMapType } from './components/type';
import { boolean } from 'yup';

interface IMainPageContext {
	data: Array<UserMe>;

	dataUserGame: Array<LoginGame>;
	dataUserChallenge: Array<UserChallenge>;

	dataPlayerNewGameJoin: User;

	challengData: Array<User>;
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
	userName: string;
	userImg: string;
	pathPop: string;

	setData: Dispatch<SetStateAction<never[]>>;
	setDataUserGame: Dispatch<SetStateAction<LoginGame[]>>;
	setDataUserChallenge: Dispatch<SetStateAction<UserChallenge[]>>;
	setDataPlayerNewGameJoin: Dispatch<SetStateAction<User>>;

	setChallengData: Dispatch<SetStateAction<User[]>>;

	watchGameScore: OnlineGameAndMapType;
	setWatchGameScore: Dispatch<SetStateAction<OnlineGameAndMapType>>;

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
	setUserName: Dispatch<SetStateAction<string>>;
	setUserImg: Dispatch<SetStateAction<string>>;
	setPathPop: Dispatch<SetStateAction<string>>;

	printSnackBar: () => void;
	fetchDataUserMe: () => void;
	onSubmit: (file: File, path: string) => void;
	onSubmitUpload: (file: File) => void;
	dialogMui: (open: boolean, disagree: () => void, agree: () => void, title: string, description: string) => void;
	setStatusColor: (status: string) => string;

	isGameRandom: boolean;
	setIsGameRandom: Dispatch<SetStateAction<boolean>>;

	dialogueLoading: (open: boolean, text: string, h1: string, h2: string) => void;
	disconectAuth: () => void;

	gameWs: Socket | undefined;
	setGameWs: Dispatch<SetStateAction<Socket | undefined>>;

	invitName: string;
	setInvitName: Dispatch<SetStateAction<string>>;

	isOpponant: boolean;
	setIsOpponant: Dispatch<SetStateAction<boolean>>;

	opacity: boolean;
	setOpacity: Dispatch<SetStateAction<boolean>>;

	playerNewGameInvit: boolean;
	setPlayerNewGameInvit: Dispatch<SetStateAction<boolean>>;

	playerNewGameJoin: boolean;
	setPlayerNewGameJoin: Dispatch<SetStateAction<boolean>>;

	isWatchGame: boolean;
	setIsWatchGame: Dispatch<SetStateAction<boolean>>;

	loadingSocket: boolean;
	setLoadingSocket: Dispatch<SetStateAction<boolean>>;

	countInvit: number;
	setCountInvit: Dispatch<SetStateAction<number>>;
}

const MainPageContext = React.createContext({} as IMainPageContext);

const MainPageProvider = (props: any) => {
	const [data, setData] = useState([]);
	const [dataUserGame, setDataUserGame] = useState([]);

	const [dataPlayerNewGameJoin, setDataPlayerNewGameJoin] = useState();

	const [dataUserChallenge, setDataUserChallenge] = useState([]);

	const [watchGameScore, setWatchGameScore] = useState([]);

	const [challengData, setChallengData] = useState([]);

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
	const [userName, setUserName] = useState('');
	const [userImg, setUserImg] = useState('');
	const [pathPop, setPathPop] = useState('');
	const [selectedImage, setSelectedImage] = useState();
	const [selectQuery, setSelectQuery] = useState(false);

	const [isGameRandom, setIsGameRandom] = useState(false);

	const [gameWs, setGameWs] = useState<Socket | undefined>(undefined);

	const [invitName, setInvitName] = useState('');

	const [isOpponant, setIsOpponant] = useState(false);
	const [opacity, setOpacity] = useState(false);

	const navigate = useNavigate();

	const [playerNewGameInvit, setPlayerNewGameInvit] = useState(false);

	const [playerNewGameJoin, setPlayerNewGameJoin] = useState(false);

	// const [dataHistory, setDataHistory] = useState([]);

	const [loadingSocket, setLoadingSocket] = useState(false);

	const [isWatchGame, setIsWatchGame] = useState(false);

	const [countInvit, setCountInvit] = useState(0);

	const fetchDataUserMe = async () => {
		try {
			const { data } = await axios.get(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/me`, {
				withCredentials: true,
			});
			setData([data]);
		} catch (err) {
			console.log(err);
		}
	};

	const disconectAuth = async () => {
		try {
			await axios.delete(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/auth/signout`, {
				withCredentials: true,
			});
			navigate('/');
		} catch (error) {
			console.log(error);
		}
	};

	const onSubmit = async (file: File, path: string) => {
		let data = new FormData();
		data.append('file', file);
		try {
			await axios.post(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/` + path, data, {
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
			await axios.post(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/me/photo`, data, {
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

	const dialogueLoading = (open: boolean, title: string, h1: string, h2: string) => {
		return (
			<Dialog
				open={open}
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
					<DialogContentText id="alert-dialog-description">{h1}</DialogContentText>
					<DialogContentText id="alert-dialog-description">{h2}</DialogContentText>
					<CircularProgress className="circularDialogMui" />
				</DialogContent>
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
		data,
		dataUserGame,
		dataUserChallenge,

		challengData,

		timeSnack,
		isDisable,
		loading,
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

		setData,
		setDataUserGame,
		setDataUserChallenge,

		setChallengData,

		setSelectQuery,
		setCustomPhoto,
		setTimeSnack,
		setIsDisable,
		setLoading,
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

		isGameRandom,
		setIsGameRandom,

		dialogueLoading,

		disconectAuth,

		gameWs,
		setGameWs,

		invitName,
		setInvitName,
		isOpponant,
		setIsOpponant,

		opacity,
		setOpacity,
		playerNewGameInvit,
		setPlayerNewGameInvit,

		playerNewGameJoin,
		setPlayerNewGameJoin,
		dataPlayerNewGameJoin,
		setDataPlayerNewGameJoin,

		watchGameScore,
		setWatchGameScore,

		isWatchGame,
		setIsWatchGame,

		loadingSocket,
		setLoadingSocket,

		countInvit,
		setCountInvit,
	};

	return <MainPageContext.Provider value={ProviderValue} {...props}></MainPageContext.Provider>;
};

const useMainPage = () => {
	return useContext(MainPageContext);
};

export { MainPageProvider, useMainPage };
