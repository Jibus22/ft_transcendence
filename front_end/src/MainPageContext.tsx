import React, { useState, useContext } from 'react';
import axios, { AxiosError } from 'axios';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

interface Type {
	id: number;
	login: string;
	photo_url: string;
	storeCustomPhoto: boolean;
	hasTwoFASecret: boolean;
}

interface IMainPageContext {
	timeSnack: boolean;
	setTimeSnack: React.Dispatch<React.SetStateAction<boolean>>;
	testString: string;
	setTestString: React.Dispatch<React.SetStateAction<string>>;
	timer: number;
	setTimer: React.Dispatch<React.SetStateAction<number>>;
	printSnackBar: () => void;
	isDisable: boolean;
	setIsDisable: React.Dispatch<React.SetStateAction<boolean>>;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	data: Array<Type>;
	setData: React.Dispatch<React.SetStateAction<never[]>>;
	// fetchData: () => void;
	fetchDataUserMe: () => void;
	userName: string;
	setUserName: React.Dispatch<React.SetStateAction<string>>;
	userImg: string;
	setUserImg: React.Dispatch<React.SetStateAction<string>>;
	isFriends: boolean;
	setIsFriends: React.Dispatch<React.SetStateAction<boolean>>;
	customPhoto: boolean;
	setCustomPhoto: React.Dispatch<React.SetStateAction<boolean>>;
	openSure: boolean;
	setOpenSure: React.Dispatch<React.SetStateAction<boolean>>;
	onSubmit: (file: File, path: string) => void;
	onSubmitUpload: (file: File) => void;
	pathPop: string;
	setPathPop: React.Dispatch<React.SetStateAction<string>>;
	isUpload: boolean;
	setIsUpload: React.Dispatch<React.SetStateAction<boolean>>;
	selectedImage: File;
	setSelectedImage: React.Dispatch<React.SetStateAction<File>>;
	openUpload: boolean;
	setOpenUpload: React.Dispatch<React.SetStateAction<boolean>>;
	dialogMui: (open: boolean, disagree: () => void, agree: () => void, title: string, description: string) => void;
}

const MainPageContext = React.createContext({} as IMainPageContext);

const MainPageProvider = (props: any) => {
	const [timeSnack, setTimeSnack] = useState(false);
	const [timer, setTimer] = useState(5000);
	const [isDisable, setIsDisable] = useState(true);
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const [userName, setUserName] = useState('');
	const [userImg, setUserImg] = useState('');
	const [isFriends, setIsFriends] = useState(false);
	const [customPhoto, setCustomPhoto] = useState(true);
	const [openSure, setOpenSure] = useState(false);
	const [pathPop, setPathPop] = useState('');
	const [isUpload, setIsUpload] = useState(false);
	const [selectedImage, setSelectedImage] = useState();
	const [openUpload, setOpenUpload] = useState(false);

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
					<Button sx={{ color: 'red' }} onClick={disagree}>
						Disagree
					</Button>

					<Button onClick={agree}>Agree</Button>
				</DialogActions>
			</Dialog>
		);
	};

	const ProviderValue = {
		timeSnack,
		setTimeSnack,
		timer,
		setTimer,
		isDisable,
		setIsDisable,
		loading,
		setLoading,
		data,
		setData,
		fetchDataUserMe,
		// fetchData,
		userName,
		setUserName,
		userImg,
		setUserImg,
		isFriends,
		setIsFriends,
		customPhoto,
		setCustomPhoto,
		openSure,
		setOpenSure,
		onSubmit,
		onSubmitUpload,
		pathPop,
		setPathPop,
		isUpload,
		setIsUpload,
		selectedImage,
		setSelectedImage,
		openUpload,
		setOpenUpload,
		dialogMui,
	};

	return <MainPageContext.Provider value={ProviderValue} {...props}></MainPageContext.Provider>;
};

const useMainPage = () => {
	return useContext(MainPageContext);
};

export { MainPageProvider, useMainPage };
