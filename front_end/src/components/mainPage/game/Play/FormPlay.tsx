import { CircularProgress, IconButton, TextField } from '@mui/material';
import axios, { AxiosError } from 'axios';
import { useFormik } from 'formik';
import React, { useState, Dispatch } from 'react';
import { animated, useSpring } from 'react-spring';
import * as yup from 'yup';
import { string } from 'yup/lib/locale';
import { useMainPage } from '../../../../MainPageContext';
import { UserChallenge, UserDto, PlayerGameLogic } from '../../../type';
import IconMess from './img/carbon_send-alt-filled.png';

interface IProps {
	Loadingclick: () => void;
	disable: boolean;
	loading: boolean;
	setPlayerGameLogic: Dispatch<React.SetStateAction<PlayerGameLogic>>;
}

export default function FormPlay({ Loadingclick, disable, loading, setPlayerGameLogic }: IProps) {
	const anim = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 0px)' },
		config: {
			delay: 1000,
			duration: 700,
		},
	});

	const { userName, setDataUserGame, setIsGameRandom, setDataUserChallenge, setIsOpponant } = useMainPage();

	const validationSchema = yup.object({
		loggin: yup.string().required('Enter a Nickname'),
	});

	const formik = useFormik({
		initialValues: {
			loggin: '',
		},
		validationSchema: validationSchema,
		onSubmit: async (values, { setErrors }) => {
			try {
				const response = await axios.post(
					`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/game`,
					{ login_opponent: values.loggin },
					{
						withCredentials: true,
					},
				);
				const { login_opponent: string, ...userDto } = response.data;
				const opponent: Partial<UserDto> = userDto;
				setPlayerGameLogic({ isChallenge: true, isP1: true, opponent: opponent });

				// setDataUserChallenge([response.data]);
				// setIsOpponant(true);
				// setIsGameRandom(false);
				Loadingclick();
			} catch (error) {
				const err = error as AxiosError;

				if (err.response?.status === 404) {
					setErrors({ loggin: 'User not found' });
				}
				if (err.response?.status === 403) {
					const dataError = err.response?.data;
					setErrors({ loggin: dataError['message'] });
				}
			}
		},
	});

	return (
		<div className="before ">
			<animated.div style={anim} className="w-100">
				<div className="formDivButton">
					<form
						onSubmit={formik.handleSubmit}
						className={`${!Boolean(formik.errors.loggin) ? 'formDiv' : 'formDivButtonAnim '} d-flex w-100 h-100`}
					>
						<TextField
							className="muiButtonInput"
							name="loggin"
							placeholder="Nickname"
							autoComplete="off"
							value={formik.values.loggin}
							onChange={formik.handleChange}
							error={formik.touched.loggin && Boolean(formik.errors.loggin)}
							helperText={formik && formik.errors.loggin}
							disabled={!disable}
							inputProps={{
								maxLength: 10,
							}}
						/>

						<div className="buttonDiv">
							{loading && <CircularProgress />}
							{!loading && (
								<IconButton type="submit" className="w-100 h-100">
									<img src={IconMess} alt="" />
								</IconButton>
							)}
						</div>
					</form>
				</div>
			</animated.div>
		</div>
	);
}
