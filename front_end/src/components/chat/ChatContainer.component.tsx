import { useState } from "react";
import styled from "styled-components"
import ChatList from "./ChatList.component";
import ChatPanel from "./ChatPanel.component";
import axios from "axios";

const ChatContainer = ({ open }: any) => {

	const [chat, setChat] = useState<any>(null);

	const openChat = (room: any) => {
		setChat(room);
	};

	return (<ChatContainerWrapper open={open}>
		{/* Chat list + Tabs */}
		<ChatList openChat={openChat} />
		{/* Messages pane */}
		{chat && <ChatPanel key={chat.id} room={chat} />}
	</ChatContainerWrapper>);
};

const ChatContainerWrapper = styled.div<{open: boolean}>`
	position: fixed;
	right: 10px;
	bottom: 100px;
	width: 500px;
	height: 400px;
	background-color: white;
	border-radius: 10px;
	overflow: hidden;

	display: flex;
	flex-direction: row;

	transform: translateY(20%);
	opacity: 0;
	transition: .2s ease all;
	pointer-events: none;

	${({ open }: any) => open && `
		opacity: 1;
		transform: translateY(0);
		pointer-events: inherit;
	`}
`;

export default ChatContainer;