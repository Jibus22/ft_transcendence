import React, { useEffect, useState } from 'react';
import {
	InputAdornment,
	Button,
	FormControl,
	FormLabel,
	IconButton,
	AvatarGroup,
	Avatar,
	Badge,
	TextField,
	useMediaQuery,
	Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios, { AxiosError } from 'axios';
import './formHistory.scss';
import { makeStyles, withStyles } from '@mui/styles';

// const StyledTextField = withStyles({
// 	root: {
// 		'& label': {
// 			width: '100%',
// 			border: '1px solid black',
// 			// textAlign: 'left',
// 			// transformOrigin: 'left',
// 			'&.Mui-focused': {
// 				// transformOrigin: 'center',
// 			},
// 		},
// 	},
// })(TextField);

export default function FormHistory() {
	return (
		<div className="mainFormHistory children">
			<form className="w-100 h-100 formMainFormHistory d-flex">
				<TextField
					sx={{ width: 2 / 2 }}
					name="nickname"
					id="outlined-basic"
					variant="outlined"
					label="Search"
					autoComplete="off"
					// size={'small'}
					// rows={1.2}
					// placeholder={userName}
					// value={formik.values.nickname}
					// onChange={formik.handleChange}
					// error={formik.touched.nickname && Boolean(formik.errors.nickname)}
					// helperText={formik && formik.errors.nickname}
					// disabled={disableInputPop()}

					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<IconButton>
									<SearchIcon sx={{ color: 'white', width: 2 / 2, height: 2 / 2 }} />
								</IconButton>
							</InputAdornment>
						),
					}}
				/>
			</form>
		</div>
	);
}
