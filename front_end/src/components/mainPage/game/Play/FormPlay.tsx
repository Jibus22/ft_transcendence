import { CircularProgress, IconButton, TextField } from '@mui/material';
import { useFormik } from 'formik';
import React from 'react';
import { animated, useSpring } from 'react-spring';
import * as yup from 'yup';
import { useMainPage } from '../../../../MainPageContext';
import IconMess from './img/carbon_send-alt-filled.png';

interface Props {
	Loadingclick: () => void;
	disable: boolean;
	loading: boolean;
}

export default function FormPlay({ Loadingclick, disable, loading }: Props) {
	const anim = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 0px)' },
		config: {
			delay: 1000,
			duration: 700,
		},
	});

	const { setIsFriends } = useMainPage();

	const validationSchema = yup.object({
		loggin: yup.string().required('Enter a Nickname'),
	});

	const formik = useFormik({
		initialValues: {
			loggin: '',
		},
		validationSchema: validationSchema,
		onSubmit: (values) => {
			Loadingclick();
			setIsFriends(true);
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
