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
		const sortedMessages = (data as Array<any>).sort((a: any, b: any) => a.timestamp - b.timestamp);
		setMessages(sortedMessages);
	};

	const sendMessage = async () => {
		axios.post(`http://localhost:3000/room/${room.id}/message`,
		{ body: message },
		{ withCredentials: true });
		setMessage("");
	}

	const getNameIfDM = () => {
		if (room.participants.length === 1 && room.participants[0].user.id === currentUser.id) {
			return room.participants[0].user.login;
		}
		const isDM =
				room.participants.length === 2
				&& room.participants.filter((participant: any) => participant.user.id === currentUser.id).length > 0;
		if (!isDM)
			return null;
		const name =
			room.participants[0].user.login === currentUser.login
			? room.participants[1].user.login
			: room.participants[0].user.login
		return name;
	}

	const scrollChatDown = () => {
		try {
			const chat: any = document.querySelector("#chat-messages");
			chat.scrollTop = chat.scrollHeight;
		} catch {}
	};

	useEffect(() => {
		scrollChatDown();
	}, [messages]);

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
			{(<>
				{room.participants.slice(0, 3).map((user: any) => <img key={user.id} src={user.user.photo_url} alt={user.user.login} />)}
				<div>
					<h4>{ getNameIfDM() ? getNameIfDM() : chatName(room.participants) }</h4>
				</div>
			</>)}
			<button><NavigateNextIcon style={{color: "#444444"}} onClick={() => setDetailsOpen(true)} /></button>
		</ChatHeader>)}
		{detailsOpen && (<ChatHeader>
			<button><ArrowBackIosIcon style={{color: "#444444"}} onClick={() => setDetailsOpen(false)} /></button>
		</ChatHeader>)}
		{!detailsOpen && (<>
		<ChatMessages id="chat-messages">
			{messages.map((message: any) => (
				<Message self={message.sender.id === currentUser.id} key={message.id}>
					<span className="message-content">{message.body}
					<svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M6.7895 0C6.02488 3.47758 2.00431 6.12164 0.523383 6.81875C0.135401 6.93318 -0.0590963 7 0.0158405 7C0.0918121 7 0.2706 6.93774 0.523383 6.81875C2.83311 6.13753 12 3.76923 12 3.76923L6.7895 0Z" fill="#F1F1F1"/>
					</svg></span>
					<span className="message-date">{message.sender.id !== currentUser.id && `${message.sender.login} - `}{new Date(message.timestamp).toLocaleDateString() + ' ' + new Date(message.timestamp).toLocaleTimeString()}</span>
				</Message>
			))}
		</ChatMessages>
		<ChatField>
			<input type="text" placeholder="Type here" value={message} onChange={onMessage} onKeyPress={(e: any) => e.key === "Enter" && sendMessage()}/>
			<button onClick={sendMessage}>
				<SendIcon style={{color: "#ffffff"}} />
			</button>
		</ChatField>
		</>)}
		{detailsOpen && (
			<>
				{/* { !isGroup() && <ChatParticipant user={getUser()} currentUser={currentUser} /> } */}
				<RoomSettings room={room} currentUser={currentUser} />
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

	img {
		height: 35px;
		width: 35px;
		margin: 10px;
		margin-right: 0px;
		border-radius: 100%;
		margin-left: -10px;
		background-color: white;
	}

	img:nth-child(1) {
		margin-left: 10px;
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