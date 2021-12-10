import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useSpring, SpringValue } from 'react-spring';

interface Type {
	id: number;
	login: string;
	photo_url: string;
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
	fetchData: () => void;
	fetchDataUserMe: () => void;
	userName: string;
	setUserName: React.Dispatch<React.SetStateAction<string>>;
	userImg: string;
	setUserImg: React.Dispatch<React.SetStateAction<string>>;
	isFriends: boolean;
	setIsFriends: React.Dispatch<React.SetStateAction<boolean>>;
}

const MainPageContext = React.createContext({} as IMainPageContext);

const MainPageProvider = (props: any) => {
	const [timeSnack, setTimeSnack] = useState(false);
	const [testString, setTestString] = useState('default value');
	const [timer, setTimer] = useState(5000);
	const [isDisable, setIsDisable] = useState(true);
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const [userName, setUserName] = useState('');
	const [userImg, setUserImg] = useState('');
	const [isFriends, setIsFriends] = useState(false);

	const fetchData = async () => {
		const result = await axios('http://localhost:3000/users', {
			withCredentials: true,
		});
		setData(result.data);
	};

	const fetchDataUserMe = async () => {
		const result = await axios.get('http://localhost:3000/me', {
			withCredentials: true,
		});
		setData(result.data);
	};

	const ProviderValue = {
		timeSnack,
		setTimeSnack,
		testString,
		setTestString,
		timer,
		setTimer,
		isDisable,
		setIsDisable,
		loading,
		setLoading,
		data,
		setData,
		fetchDataUserMe,
		fetchData,
		userName,
		setUserName,
		userImg,
		setUserImg,
		isFriends,
		setIsFriends,
	};

	return <MainPageContext.Provider value={ProviderValue} {...props}></MainPageContext.Provider>;
};

const useMainPage = () => {
	return useContext(MainPageContext);
};

export { MainPageProvider, useMainPage };
