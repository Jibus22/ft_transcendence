import './paramUser.scss';
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { TextField, InputAdornment, IconButton, Alert } from '@mui/material';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import CheckIcon from '@mui/icons-material/Check';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import axios from 'axios';
import { useMainPage } from '../../../MainPageContext';

export interface Props {
	isPop: boolean;
	userName: string;
}

export default function FormUser({ isPop, userName }: Props) {
	const [isValidate, setIsValidate] = useState(false);
	const [isDisable, setIsDisable] = useState(true);

	function handleClick() {
		setIsDisable(false);
	}

	const { fetchDataUserMe } = useMainPage();

	function disableInputPop(): boolean {
		if (isDisable || isPop) return true;
		else return false;
	}

	const validationSchema = yup.object({
		nickname: yup.string().required('Enter a Nickname'),
	});
	const formik = useFormik({
		initialValues: {
			nickname: '',
		},
		validationSchema: validationSchema,
		onSubmit: async (values) => {
			const user = {
				login: values.nickname,
			};

			await axios.patch('http://localhost:3000/me', user, {
				withCredentials: true,
			});
			if (Boolean(formik.errors.nickname)) {
				setIsDisable(false);
			} else {
				setIsDisable(true);
				setIsValidate(true);
				setTimeout(function () {
					setIsValidate(false);
				}, 2200);
				fetchDataUserMe();
			}
		},
	});

	let placeHolder;
	isDisable ? (placeHolder = userName) : (placeHolder = 'nickname');

	return (
		<div className="w-100 h-100  d-flex flex-column">
			<form onSubmit={formik.handleSubmit} className={`${Boolean(formik.errors.nickname) ? 'formDivButtonAnim' : 'none'} w-100 h-100 `}>
				<TextField
					sx={{ width: 2 / 2 }}
					name="nickname"
					id="outlined-disabled"
					label={placeHolder}
					autoComplete="off"
					size={'small'}
					rows={1.2}
					placeholder={userName}
					value={formik.values.nickname}
					onChange={formik.handleChange}
					error={formik.touched.nickname && Boolean(formik.errors.nickname)}
					helperText={formik && formik.errors.nickname}
					disabled={disableInputPop()}
					inputProps={{
						maxLength: 18,
					}}
					InputProps={{
						endAdornment: (
							<InputAdornment position="end" disablePointerEvents={isPop}>
								{isDisable && (
									<IconButton onClick={handleClick}>
										<BorderColorIcon sx={{ color: '#e0e0e0', width: 2 / 2, height: 2 / 2 }} />
									</IconButton>
								)}
								{!isDisable && (
									<IconButton type="submit">
										<AddCircleRoundedIcon sx={{ color: '#e0e0e0', width: 2 / 2, height: 2 / 2 }} />
									</IconButton>
								)}
							</InputAdornment>
						),
					}}
				/>
			</form>

			{isValidate ? (
				<div className="alertValidateIcon ">
					<Alert sx={{ width: 2 / 2 }} severity="success" icon={<CheckIcon fontSize="inherit" />}>
						Saved
					</Alert>
				</div>
			) : null}
		</div>
	);
}
