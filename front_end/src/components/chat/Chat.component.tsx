import React, { useState } from 'react';
import styled from 'styled-components';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';
import ChatContainer from './ChatContainer.component';

const Chat = () => {
	const [open, setOpen] = useState(false);

	const toggle = () => {
		setOpen(!open);
	};

	return (
		<>
			<ChatButton onClick={toggle}>
				<PeopleIcon style={{ color: '#CA6C88', fontSize: '38px' }} className={`icon ${!open ? 'open' : ''}`} />
				<CloseIcon style={{ color: '#CA6C88', fontSize: '42px' }} className={`icon ${open ? 'open' : ''}`} />
			</ChatButton>
			<ChatContainer open={open} />
		</>
	);
};

const ChatButton = styled.button`
	border-radius: 100%;
	background-color: white;
	border: none;
	width: 70px;
	height: 70px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: fixed;
	right: 20px;
	bottom: 20px;

	.icon {
		transform: scale(0);
		opacity: 0;
		transition: all 0.2s ease;
		position: absolute;
	}

	.open {
		opacity: 1;
		transform: scale(1);
	}
`;

export default Chat;
