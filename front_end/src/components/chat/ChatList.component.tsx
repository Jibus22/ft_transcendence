import styled from "styled-components"
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import axios from "axios";
import { useEffect, useState }  from 'react'

const chatName = (participants: any, currentUser: any) => {
	const user = getUser(participants, currentUser);
	if (user) {
		return user.user.login;
	}
	let name = "";
	participants.forEach((p: any) => name += p.user.login[0]);
	return name;
}

const getUser = (participants: any, currentUser: any) => {
	if (!currentUser)
		return null;
	if (participants.length === 1) {
		return participants[0];
	}
	if (participants.length === 2) {
		return participants.filter((user: any) => user.user.id !== currentUser.id)[0];
	}
	return null;
}

const ChatList = ({ openChat, currentUser }: any) => {

	const [tab, setTab] = useState(0);
	const [publicChats, setPublicChats] = useState([]);
	const [chats, setChats] = useState([]);
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [search, setSearch] = useState("");
	const [users, setUsers] = useState<any[]>([]);

	const getChats = async () => {
		const { data } = await axios.get("http://localhost:3000/room/all", {
			withCredentials: true
		});
		setChats(data);
	};

	const getUsers = async () => {
		const result = await axios.get("http://localhost:3000/users", { withCredentials: true }).catch(console.error);
		setUsers(result?.data || []);
	};

	const onSearch = (e: any) => {
		const term = e.target.value;
		setSearch(term);
		if (!term.length)
			return setSearchResults([]);

		const result: any[] = users.filter(
			(user: any) => user.login.indexOf(term) > -1
		).sort((a: any, b: any) => a.login.indexOf(term) - b.login.indexOf(term));
		setSearchResults(result);
	};

	const openChatHandler = async (userId: any) => {
		const existingChats = chats.filter(
			(chat: any) => chat.participants.length === 2 &&
				chat.participants.filter((participant: any) => participant.user.id === userId).length > 0
		);
		if (existingChats.length > 0) {
			setSearchResults([]);
			setSearch("");
			return openChat(existingChats[0]);
		}
		const { data }: any = await axios.post("http://localhost:3000/room", {
			participants: [ ],
			is_private: true
		}, { withCredentials: true });
		const { id } = data;
		await axios.post(`http://localhost:3000/room/${id}/participant`, { id: userId }, { withCredentials: true });
		setSearchResults([]);
		setSearch("");
		openChat(data);
	}

	useEffect(() => {
		getUsers();
	}, []);

	useEffect(() => {
		getChats();
	}, []);

	return (
	<ChatListWrapper>
		<SearchField>
			<input type="text" placeholder="Search" value={search} onChange={onSearch} />
			<SearchIcon style={{ fontSize: "32px", color: "#CA6C88" }} className="icon" />
		</SearchField>
		{ tab === 0 && !searchResults.length && (<List>
			{chats.map((chat: any) => (<Preview key={chat.id} onClick={() => openChat(chat)}>
				{/* {chat.participants.length === 1 && (<img src={chat.participants[0].user.photo_url} alt={chat.participants[0].user.login} />)} */}
				{/* {chat.participants.length === 2 && (<img src={chat.participants[1].user.photo_url} alt={chat.participants[1].user.login} />)} */}
				{getUser(chat.participants, currentUser) !== null && (<img src={getUser(chat.participants, currentUser).user.photo_url} alt={getUser(chat.participants, currentUser).user.login} />)}
				<div>
					<h4>{chatName(chat.participants, currentUser)}</h4>
					<p>{chat.id}</p>
				</div>
			</Preview>))}
		</List>)}
		{ tab === 2 && !searchResults.length && (<List>
			{publicChats.map((chat: any) => (<Preview key={chat.id}>
				<div>
					<h4>{chatName(chat.participants, currentUser)}</h4>
					<p>{chat.id}</p>
				</div>
			</Preview>))}
		</List>)}
		{ searchResults.length > 0 && (<List>
			{searchResults.map((user: any) => (<Preview key={user.id} onClick={() => openChatHandler(user.id)}>
				<img src={user.photo_url} alt={user.login} />
				<div>
					<h4>{user.login}</h4>
				</div>
			</Preview>))}
		</List>)}
		<Tabs>
			<Tab selected={tab === 0} onClick={() => setTab(0)}>
				<ChatIcon />
			</Tab>
			<Tab selected={tab === 1} onClick={() => setTab(1)}>
				<PersonIcon />
			</Tab>
			<Tab selected={tab === 2} onClick={() => setTab(2)}>
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