import { TextField, InputAdornment, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';

export default function FormAuth() {
	const validationSchema = yup.object({
		key: yup.string().required('Enter a Nickname'),
	});
	const formik = useFormik({
		initialValues: {
			key: '',
		},
		validationSchema: validationSchema,
		onSubmit: async (values) => {
			console.log(values);
			const user = {
				login: values.key,
			};

			try {
				await axios.post('http://localhost:3000/auth/2fa/turn-on', {
					withCredentials: true,
				});
			} catch (error) {
				console.log(error);
			}
		},
	});

	return (
		<div className="h-100 w-100">
			<form onSubmit={formik.handleSubmit} className="h-100 w-100">
				<TextField
					className="muiButtonInput"
					label="Key"
					sx={{ width: 2 / 2 }}
					autoComplete="off"
					name="key"
					value={formik.values.key}
					onChange={formik.handleChange}
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
		</div>
	);
}
