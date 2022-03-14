import SendIcon from '@mui/icons-material/Send';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import axios, { AxiosError } from 'axios';
import { useFormik } from 'formik';
import React from 'react';
import { Bounce } from 'react-awesome-reveal';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import './formLogin.scss';

export default function FormLogin() {
	let navigate = useNavigate();

	const validationSchema = yup.object({
		key: yup.number().required('Enter a key').typeError('Only number'),
	});
	const formik = useFormik({
		initialValues: {
			key: '',
		},
		validationSchema: validationSchema,
		onSubmit: async (values, { setErrors, resetForm }) => {
			const token = {
				token: values.key,
			};

			try {
				const response = await axios.post(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/auth/2fa/authenticate`, token, {
					withCredentials: true,
				});

				if (response.status === 201) {
					navigate('/MainPage');
				}
			} catch (error) {
				const err = error as AxiosError;
				if (err.response?.status === 400) {
					setErrors({ key: 'Wrong key' });
					values.key = '';
				}
			}
		},
	});

	return (
		<div className="mainFormLogin">
			<Bounce delay={1000} className="w-100 h1-100">
				<form onSubmit={formik.handleSubmit} className={`${Boolean(formik.errors.key) ? 'formDivButtonAnim' : 'none'} w-100 h-100 `}>
					<TextField
						className="muiButtonInput"
						label="Key"
						id="outlined-disabled"
						sx={{ width: 2 / 2 }}
						autoComplete="off"
						name="key"
						placeholder="key"
						value={formik.values.key}
						onChange={formik.handleChange}
						helperText={formik && formik.errors.key}
						inputProps={{
							maxLength: 6,
						}}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton type="submit">
										<SendIcon sx={{ color: '#e0e0e0', width: 2 / 2, height: 2 / 2 }} />
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
				</form>
			</Bounce>
		</div>
	);
}
