import styled from "styled-components";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SendIcon from '@mui/icons-material/Send';
import axios from "axios";
import { useEffect, useState } from "react";
import ChatParticipant from "./ChatParticipant.component";
import RoomSettings from "./RoomSettings.component";

const chatName = (participants: any) => {
	let name = "";
	participants.forEach((p: any) => name += p.user.login[0]);
	return name;
}

const ChatPanel = ({ room, currentUser }: any) => {

	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<any[]>([]);
	const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

	const onMessage = (e: any) => {
		setMessage(e.target.value);
	};

	const getMessages = async () => {
		const { data } = await axios.get(`http://localhost:3000/room/${room.id}/message`, { withCredentials: true });
		setMessages(data)
	};

	const sendMessage = async () => {
		await axios.post(`http://localhost:3000/room/${room.id}/message`,
		{ body: message },
		{ withCredentials: true });
		setMessage("");
	}

	const getUser = () => {
		if (room.participants.length === 1)
			return room.participants[0];
		if (room.participants.length > 2)
			return null;
		if (!room.is_private)
			return null;
		return room.participants.filter((user: any) => user.user.id !== currentUser.id)[0];
	};

	const isGroup = () => {
		return !room.is_private;
	};

	window.addEventListener("newMessage", ({ detail }: any) => {
		const message: any = detail;
		if (message.room_id !== room.id) {
			return;
		}
		const found = messages.filter((m: any) => message.id === m.id);
		if (found.length > 0) {
			return;
		}
		setMessages([...messages, message]);
	});

	useEffect(() => {
		getMessages();
	}, []);

	return (<MessagesPaneWrapper>
		{!detailsOpen && (<ChatHeader>
			{/* {room.participants.length <= 2 && <img src={getUser()?.user.photo_url} alt={room.participants[0].user.login}/>}
			<div>
				{getUser() !== null && (<h4>{ getUser().user.login }</h4>)}
				{getUser() === null && (<h4>{ chatName(room.participants) }</h4>)}
				<span>{ getUser()?.user.status }</span>
			</div> */}
			{!isGroup() && (
			<>
				<img src={getUser()?.user.photo_url} alt={getUser()?.user.login}/>
				<div>
					<h4>{ getUser()?.user.login }</h4>
					<span>{ getUser()?.user.status }</span>
				</div>
			</>)}
			{isGroup() && (<>
				<div>
					<h4>{ chatName(room.participants) }</h4>
				</div>
			</>)}
			<button><NavigateNextIcon style={{color: "#444444"}} onClick={() => setDetailsOpen(true)} /></button>
		</ChatHeader>)}
		{detailsOpen && (<ChatHeader>
			<button><ArrowBackIosIcon style={{color: "#444444"}} onClick={() => setDetailsOpen(false)} /></button>
		</ChatHeader>)}
		{!detailsOpen && (<>
		<ChatMessages>
			{messages.map((message: any) => (
				<Message self={message.sender.id === currentUser.id} key={message.id}>
					<span className="message-content">{message.body}
					<svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M6.7895 0C6.02488 3.47758 2.00431 6.12164 0.523383 6.81875C0.135401 6.93318 -0.0590963 7 0.0158405 7C0.0918121 7 0.2706 6.93774 0.523383 6.81875C2.83311 6.13753 12 3.76923 12 3.76923L6.7895 0Z" fill="#F1F1F1"/>
					</svg></span>
					<span className="message-date">{new Date(message.timestamp).toLocaleDateString() + ' ' + new Date(message.timestamp).toLocaleTimeString()}</span>
				</Message>
			))}
		</ChatMessages>
		<ChatField>
			<input type="text" placeholder="Type here" value={message} onChange={onMessage}/>
			<button onClick={sendMessage}>
				<SendIcon style={{color: "#ffffff"}} />
			</button>
		</ChatField>
		</>)}
		{detailsOpen && (
			<>
				{ !isGroup() && <ChatParticipant user={getUser()} currentUser={currentUser} /> }
				{ isGroup() && <RoomSettings room={room} currentUser={currentUser} /> }
			</>
		)}
	</MessagesPaneWrapper>);
};

const MessagesPaneWrapper = styled.div`
	flex: 1;
	background-color: white;
	display: flex;
	flex-direction: column;
`;

const ChatHeader = styled.div`
	height: 45px;
	display: flex;
	flex-direction: row;
	align-items: center;

	img:nth-child(1) {
		height: 35px;
		width: 35px;
		margin: 10px;
		margin-right: 0px;
		border-radius: 100%;
	}

	> div {
		flex: 1;

		h4 {
			margin: 0;
			margin-bottom: -5px;
			margin-left: 10px;
			color: #CA6C88;
		}

		span {
			font-size: 12px;
			margin-left: 10px;
		}
	}

	button {
		height: 100%;
		border: none;
		background: none;
		cursor: pointer;
	}
`;

const ChatMessages = styled.div`
	flex: 1;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
`;

const ChatField = styled.div`
	height: 45px;
	display: flex;
	border-top: 0.5px solid #F1F1F1;

	input:nth-child(1) {
		height: 100%;
		flex: 1;
		padding: 10px;
		border-box: box-sizing;
		border: none;
	}

	button:nth-child(2) {
		height: 100%;
		padding: 10px;
		box-sizing: border-box;
		background-color: #CA6C88;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		border-radius: 5px 0 0 5px;
	}
`;

const Message = styled.div<{self: boolean}>`
	max-width: 75%;
	width: auto;
	margin: 2px 10px;
	margin-bottom: 2px;

	span.message-content {
		display: block;
		border-radius: 10px;
		background-color: #F1F1F1;
		padding: 5px 7px;
		position: relative;

		svg {
			position: absolute;
			bottom: -3px;
			left: -3px;
		}
	}

	span.message-date {
		font-size: 10px;
	}

	${({ self }) => self && `
	align-self: flex-end;

	span.message-content {
		background-color: #E69C6A;
		color: white;

		svg {
			transform: scaleX(-1);
			right: -4px;
			left: inherit;
	
			path {
				fill: #E69C6A;
			}
		}
	}

	span.message-date {
		display: block;
		text-align: right;
	}
	`}
`;

export default ChatPanel;