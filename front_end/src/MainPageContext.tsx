import React, { useState, useContext } from 'react';
import axios, { AxiosError } from 'axios';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

interface Type {
	id: number;
	login: string;
	photo_url: string;
	status: string;
	storeCustomPhoto: boolean;
	hasTwoFASecret: boolean;
}

interface IMainPageContext {
	data: Array<Type>;
	timeSnack: boolean;
	isDisable: boolean;
	isFriends: boolean;
	loading: boolean;
	customPhoto: boolean;
	openSure: boolean;
	isUpload: boolean;
	openUpload: boolean;
	userStatus: boolean;
	selectedImage: File;
	timer: number;
	userName: string;
	userImg: string;
	pathPop: string;

	setData: React.Dispatch<React.SetStateAction<never[]>>;
	setTimeSnack: React.Dispatch<React.SetStateAction<boolean>>;
	setIsDisable: React.Dispatch<React.SetStateAction<boolean>>;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setCustomPhoto: React.Dispatch<React.SetStateAction<boolean>>;
	setIsFriends: React.Dispatch<React.SetStateAction<boolean>>;
	setOpenSure: React.Dispatch<React.SetStateAction<boolean>>;
	setIsUpload: React.Dispatch<React.SetStateAction<boolean>>;
	setOpenUpload: React.Dispatch<React.SetStateAction<boolean>>;
	setSelectedImage: React.Dispatch<React.SetStateAction<File>>;
	setTimer: React.Dispatch<React.SetStateAction<number>>;
	setUserName: React.Dispatch<React.SetStateAction<string>>;
	setUserImg: React.Dispatch<React.SetStateAction<string>>;
	setPathPop: React.Dispatch<React.SetStateAction<string>>;

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
	const [openUpload, setOpenUpload] = useState(false);
	const [isDisable, setIsDisable] = useState(true);
	const [customPhoto, setCustomPhoto] = useState(true);
	const [timer, setTimer] = useState(5000);
	const [userName, setUserName] = useState('');
	const [userImg, setUserImg] = useState('');
	const [pathPop, setPathPop] = useState('');
	const [selectedImage, setSelectedImage] = useState();

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
	};

	return <MainPageContext.Provider value={ProviderValue} {...props}></MainPageContext.Provider>;
};

const useMainPage = () => {
	return useContext(MainPageContext);
};

export { MainPageProvider, useMainPage };
