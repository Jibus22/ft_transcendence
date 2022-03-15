import { CircularProgress, IconButton, TextField } from '@mui/material';
import axios, { AxiosError } from 'axios';
import { useFormik } from 'formik';
import React, { Dispatch } from 'react';
import { animated, useSpring } from 'react-spring';
import * as yup from 'yup';
import { UserDto, PlayerGameLogic } from '../../../type';
import IconMess from './img/carbon_send-alt-filled.png';

interface IProps {
	Loadingclick: () => void;
	disable: boolean;
	loading: boolean;
	setPlayerGameLogic: Dispatch<React.SetStateAction<PlayerGameLogic>>;
}

export default function FormPlay({
	Loadingclick,
	disable,
	loading,
	setPlayerGameLogic,
}: IProps) {
	const anim = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 0px)' },
		config: {
			delay: 1000,
			duration: 700,
		},
	});

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
				setPlayerGameLogic(() => {
					return {
						isChallenge: true,
						isP1: true,
						opponent: opponent,
					};
				});

				Loadingclick();
			} catch (error) {
				const err = error as AxiosError;
				const res_err = err.response;
				if (res_err?.status === 404) setErrors({ loggin: 'User not found' });
				else if (res_err?.status === 403)
					setErrors({ loggin: res_err?.data['message'] });
				else setErrors({ loggin: 'Error, go to sleep' });
			}
		},
	});

	return (
		<div className="before ">
			<animated.div style={anim} className="w-100">
				<div className="formDivButton">
					<form
						onSubmit={formik.handleSubmit}
						className={`${
							!Boolean(formik.errors.loggin) ? 'formDiv' : 'formDivButtonAnim '
						} d-flex w-100 h-100`}
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
