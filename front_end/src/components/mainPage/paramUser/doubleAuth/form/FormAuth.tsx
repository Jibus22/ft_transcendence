import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios, { AxiosError } from 'axios';
import { Dialog, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';

interface Props {
	closeQR: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FormAuth({ closeQR }: Props) {
	const [open, setOpen] = useState(false);

	let navigate = useNavigate();

	const disconectAuth = async () => {
		try {
			await axios.delete('http://localhost:3000/auth/signout', {
				withCredentials: true,
			});
			navigate('/');
		} catch (error) {
			console.log(error);
		}
	};

	const openDialog = () => {
		setOpen(true);

		setTimeout(function () {
			setOpen(false);
			disconectAuth();
		}, 4000);
	};

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
				const response = await axios.post('http://localhost:3000/auth/2fa/turn-on', token, {
					withCredentials: true,
				});

				if (response.status === 201) {
					openDialog();
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
		<div className="h-100 w-100 ">
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
									<SendIcon sx={{ color: '#ca6c88', width: 2 / 2, height: 2 / 2 }} />
								</IconButton>
							</InputAdornment>
						),
					}}
				/>
			</form>
			<Dialog
				open={open}
				// onClose={handleClick}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				scroll="body"
				className="mainDialogMui"
			>
				<DialogTitle id="alert-dialog-title" className="d-flex">
					<CheckCircleOutlineIcon sx={{ color: 'green' }} />
					<div className="titleDialogMui">
						<p>QR code validated</p>
					</div>
				</DialogTitle>
				<DialogContent className="contentDialogMui">
					<DialogContentText id="alert-dialog-description">You will be disconnected.</DialogContentText>
					<DialogContentText id="alert-dialog-description">Please identify yourself on the home page</DialogContentText>
					<CircularProgress className="circularDialogMui" />
				</DialogContent>
			</Dialog>
		</div>
	);
}
