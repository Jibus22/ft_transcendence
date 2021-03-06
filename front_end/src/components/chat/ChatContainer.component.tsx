import { useEffect, useState } from "react";
import styled from "styled-components"
import ChatList from "./ChatList.component";
import ChatPanel from "./ChatPanel.component";
import axios from "axios";

declare let window: any;

const ChatContainer = ({ open }: any) => {

	const [chat, setChat] = useState<any>(null);
	const [currentUser, setCurrentUser] = useState<any>(null);

	const openChat = (room: any | null) => {
		setChat(room);
		window.chatId = room?.id;
	};

	const getCurrentUser = async () => {
		console.log("GETTING USER");
		try {
			const { data } = await axios.get(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/me`, { withCredentials: true });
			setCurrentUser(data);
		} catch (e: any) {
			console.log(e);
		}
	};

	useEffect(() => {
		getCurrentUser();
	}, []);

	return (<ChatContainerWrapper open={open}>
		{/* Chat list + Tabs */}
		<ChatList openChat={openChat} currentUser={currentUser} />
		{/* Messages pane */}
		{chat && <ChatPanel key={chat.id} room={chat} currentUser={currentUser} />}
	</ChatContainerWrapper>);
};

const ChatContainerWrapper = styled.div<{open: boolean}>`
	position: fixed;
	right: 10px;
	bottom: 100px;
	width: 600px;
	height: 500px;
	background-color: white;
	border-radius: 10px;
	overflow: hidden;

	display: flex;
	flex-direction: row;

	transform: translateY(20%);
	opacity: 0;
	transition: .2s ease all;
	pointer-events: none;

	@media (min-width: 1600px) {
		width: 800px;
		height: 700px;
	}

	${({ open }: any) => open && `
		opacity: 1;
		transform: translateY(0);
		pointer-events: inherit;
	`}
`;

export default ChatContainer;
