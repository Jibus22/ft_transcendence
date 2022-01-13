import styled from "styled-components";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SendIcon from '@mui/icons-material/Send';

const ChatPanel = () => {

	const messages = [
		{ id: 0, author: "vgoldman", message: "Hello!", timestamp: 1639925559701 },
		{ id: 1, author: "vgoldman", message: "How you doing?", timestamp: 1639925559701 },
		{ id: 2, author: "bvalette", message: "Doing good, what about you?", timestamp: 1639925559701 },
		{ id: 3, author: "vgoldman", message: "Good, good...", timestamp: 1639925559701 },
		{ id: 4, author: "bvalette", message: "Oh, by the way, did I tell you that lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam", timestamp: 1639925559701 },
		{ id: 5, author: "vgoldman", message: "Oh, by the way, did I tell you that lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam", timestamp: 1639925559701 },
	];

	return (<MessagesPaneWrapper>
		<ChatHeader>
			<img src="https://i.pravatar.cc/200?d" alt=""/>
			<div>
				<h4>Test person</h4>
				<span>Online</span>
			</div>
			<button><NavigateNextIcon style={{color: "#444444"}} /></button>
		</ChatHeader>
		<ChatMessages>
			{messages.map(message => (
				<Message self={message.author === 'vgoldman'} key={message.id}>
					<span className="message-content">{message.message}
					<svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M6.7895 0C6.02488 3.47758 2.00431 6.12164 0.523383 6.81875C0.135401 6.93318 -0.0590963 7 0.0158405 7C0.0918121 7 0.2706 6.93774 0.523383 6.81875C2.83311 6.13753 12 3.76923 12 3.76923L6.7895 0Z" fill="#F1F1F1"/>
					</svg></span>
					<span className="message-date">{new Date(message.timestamp).toLocaleDateString() + ' ' + new Date(message.timestamp).toLocaleTimeString()}</span>
				</Message>
			))}
		</ChatMessages>
		<ChatField>
			<input type="text" placeholder="Type here" />
			<button>
				<SendIcon style={{color: "#ffffff"}} />
			</button>
		</ChatField>
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
		border-radius: 100%;
	}

	div:nth-child(2) {
		flex: 1;

		h4 {
			margin: 0;
			margin-bottom: -5px;
			color: #CA6C88;
		}

		span {
			font-size: 12px;
		}
	}

	button:nth-child(3) {
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