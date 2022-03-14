import React from 'react';
import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import './formHistory.scss';

interface Props {
	name: string;
	filter: (e: React.ChangeEvent<HTMLInputElement>) => void;
	isActive: boolean;
}

export default function FormHistory({ name, filter, isActive }: Props) {
	return (
		<div className="mainFormHistory children">
			<TextField
				sx={{ width: 2 / 2 }}
				name="nickname"
				id="outlined-basic"
				variant="outlined"
				label="Search"
				autoComplete="off"
				value={name}
				onChange={filter}
				disabled={isActive}
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
							<SearchIcon sx={{ color: 'white' }} />
						</InputAdornment>
					),
				}}
			/>
		</div>
	);
}
