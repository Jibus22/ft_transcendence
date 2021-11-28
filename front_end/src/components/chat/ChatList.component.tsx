import styled from "styled-components"
import SearchIcon from '@mui/icons-material/Search';
import { useState } from "react";
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';

const contacts = [
	{ id: 0, name: "Marie", lastMessage: "Hey!", profilePicture: "https://i.pravatar.cc/200" },
	{ id: 1, name: "Georges", lastMessage: "What about last time", profilePicture: "https://i.pravatar.cc/200?a" },
	{ id: 2, name: "Johnny", lastMessage: "Hey!sfesfe sefse fesif seif", profilePicture: "https://i.pravatar.cc/200?b" },
	{ id: 3, name: "Tom", lastMessage: "Hey! esef esifesfes", profilePicture: "https://i.pravatar.cc/200?c" },
	{ id: 4, name: "Micheal", lastMessage: "Hey!", profilePicture: "https://i.pravatar.cc/200?d" },
	{ id: 5, name: "Jean-Marc", lastMessage: "Hey!", profilePicture: "https://i.pravatar.cc/200?e" },
];

const ChatList = () => {

	const [tab, setTab] = useState(0);

	return (
	<ChatListWrapper>
		<SearchField>
			<input type="text" placeholder="Search" />
			<SearchIcon style={{ fontSize: "32px;", color: "#CA6C88" }} className="icon" />
		</SearchField>
		<List>
			{contacts.map(contact => (<Preview>
				<img src={contact.profilePicture} alt={contact.name} />
				<div>
					<h4>{contact.name}</h4>
					<p>{contact.lastMessage}</p>
				</div>
			</Preview>))}
		</List>
		<Tabs>
			<Tab selected={tab === 0} onClick={() => setTab(0)}>
				<ChatIcon />
			</Tab>
			<Tab selected={tab === 1} onClick={() => setTab(1)}>
				<PeopleIcon />
			</Tab>
		</Tabs>
	</ChatListWrapper>);
}

const ChatListWrapper = styled.div`
	width: 175px;
	background-color: #F1F1F1;

	display: flex;
	flex-direction: column;
`;

const SearchField = styled.div`
	height: 45px;
	display: flex;
	align-items: center;

	input {
		flex: 1;
		box-sizing: border-box;
		max-width: 75%;
		background: none;
		border: none;
		color: #CA6C88;
		padding: 10px;
	}

	.icon {
		width: 30px;
	}
`;

const List = styled.div`
	flex: 1;
	overflow-y: auto;

	::-webkit-scrollbar {
		display: none;
	}
`;

const Preview = styled.div`
	padding: 10px;
	display: flex;
	align-items: center;
	cursor: pointer;

	:hover {
		background-color: white;
	}

	> img {
		width: 50px;
		height: 50px;
		border-radius: 100%;
	}

	> div {
		display: flex;
		flex-direction: column;
		margin-left: 5px;

		h4 {
			margin: 0px;
			color: #CA6C88;
		}
		p {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			width: 90px;
		}
	}
`;

const Tabs = styled.div`
	height: 45px;
	display: flex;
`;

const Tab = styled.button<{selected: boolean}>`
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	background: none;
	border: none;
	background: white;
	color: #222326;

	${({selected}) => selected && `
	color: #CA6C88;
	background: #F1F1F1;
	`}
`;

export default ChatList;