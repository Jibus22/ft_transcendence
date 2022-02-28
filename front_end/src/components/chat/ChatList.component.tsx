import styled from "styled-components"
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import axios from "axios";
import { useEffect, useState }  from 'react'

declare let window: any;

const chatName = (chat: any, currentUser: any) => {
	try {
		if (chat.participants.length === 1) {
			return chat.participants[0].user.login;
		}
		if (chat.participants.length === 2) {
			if (chat.participants.filter((user: any) => user.user.id === currentUser.id).length > 0) {
				return chat.participants[0].user.login === currentUser.login
				? chat.participants[1].user.login
				: chat.participants[0].user.login;
			}
		}
	} catch {}
	let name = "";
	chat.participants.forEach((p: any) => name += p.user.login[0]);
	return name.slice(0, 8);
}

const ChatList = ({ openChat, currentUser }: any) => {

	const [tab, setTab] = useState(0);
	const [publicChats, setPublicChats] = useState([]);
	const [chats, setChats] = useState([]);
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [search, setSearch] = useState("");
	const [users, setUsers] = useState<any[]>([]);
	const [friends, setFriends] = useState<any[]>([]);

	const getChats = async () => {
		const { data } = await axios.get(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/me/rooms`, {
			withCredentials: true
		});
		setChats(data);
	};

	const getPublicRooms = async () => {
		window.roomsLoading = true;
		const { data } = await axios.get(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/room/publics`, {
			withCredentials: true
		});
		setPublicChats(data);
		window.roomsLoading = false;
	}

	const getUsers = async () => {
		const result = await axios.get(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/users`, { withCredentials: true }).catch(console.error);
		setUsers(result?.data || []);
	};

	const getFriends = async () => {
		if (window.friendsLoading)
			return;
		window.friendsLoading = true;
		const result = await axios.get(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/users/friend`, { withCredentials: true }).catch(console.error);
		setFriends(result?.data || []);
		window.friendsLoading = false;
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
			(chat: any) => chat.participants.length === 2
				&& chat.participants.filter((participant: any) => participant.user.id === userId).length > 0
				&& chat.participants.filter((participant: any) => participant.user.id === currentUser.id).length > 0
		);
		console.log("EXISTING CHATS", existingChats);
		if (existingChats.length > 0) {
			setSearchResults([]);
			setSearch("");
			return openChat(existingChats[0]);
		}
		const { data }: any = await axios.post(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/room`, {
			participants: [ ],
			is_private: true
		}, { withCredentials: true });
		const { id } = data;
		await axios.post(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/room/${id}/participant`, { id: userId }, { withCredentials: true });
		const data2 = (await axios.get(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}room/${id}/infos`, { withCredentials: true }))?.data;
		console.log("DATA", data, data2)
		setSearchResults([]);
		setSearch("");
		openChat(data2);
	};

	const createChat = async () => {
		const { data }: any = await axios.post(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/room`, {
			participants: [ ],
			is_private: false
		}, { withCredentials: true });
		openChat(data);
	};

	const openPublicRoom = async (roomId: any) => {
		const { data }: any = await axios.post(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/room/${roomId}/infos`, { withCredentials: true });
		openChat(data);
	};

	const joinPublicChatRoom = async (room: any) => {
		if (room.participants.filter((participant: any) => participant.user.id === currentUser.id).length > 0) {
			return openPublicRoom(room.id);
		}
		let password = null;
		if (room.is_password_protected) {
			password = prompt("Enter the password for this room");
			if (!password)
				return;
		}
		axios.patch(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/me/rooms/${room.id}`, { password }, { withCredentials: true })
		.then(data => {
			console.log("Joined public", data);
			openPublicRoom(room.id);
		})
		.catch(error => {
			console.log("CANNOT JOIN", error)
			alert("Wrong password!");
		});
	};

	useEffect(() => {
		getUsers();
		getChats();
		getFriends();
		getPublicRooms();
	}, []);

	window.addEventListener("publicRoomCreated", ({ detail }: any) => {
		if (window.roomsLoading)
			return;
		getPublicRooms();
	})

	window.addEventListener("publicRoomUpdated", ({ detail }: any) => {
		if (window.roomsLoading)
			return;
		getPublicRooms();
	})

	window.addEventListener("roomParticipantUpdated", ({ detail }: any) => {
		if (window.roomsLoading)
			return;
		getPublicRooms();
	})

	window.addEventListener("userAdded", ({ detail }: any) => {
		if (window.roomsLoading)
			return;
		getPublicRooms();
		getChats();
	})

	window.addEventListener("shouldRefreshPublicRoom", ({ detail }: any) => {
		openPublicRoom(detail.id);
	})

	window.addEventListener("friendsUpdated", ({ detail }: any) => {
		if (window.friendsLoading)
			return;
		getFriends();
	})

	return (
	<ChatListWrapper>
		<SearchField>
			<input type="text" placeholder="Search" value={search} onChange={onSearch} />
			<SearchIcon style={{ fontSize: "32px", color: "#CA6C88" }} className="icon" />
		</SearchField>
		{ tab === 0 && !search.length && (<List>
			{chats.map((chat: any) => (chat && <Preview key={chat.id} onClick={() => openChat(chat)}>
				{chat.participants.filter((user: any) => user?.user?.id !== currentUser?.id).slice(0, 3).map((user: any) => <img key={user.id} src={user?.user?.photo_url} alt={user?.user?.login} />)}
				<div>
					<h4>{chatName(chat, currentUser)}</h4>
				</div>
			</Preview>))}
			{!chats.length && <span className="empty-message">No chat yet</span>}
		</List>)}
		{ tab === 1 && !search.length && (<List>
			{friends.map((friend: any) => (<Preview key={friend.id} onClick={() => openChatHandler(friend.id)}>
				<img src={friend.photo_url} alt={friend.login} />
				<div>
					<h4>{friend.login}</h4>
				</div>
			</Preview>))}
			{!friends.length && <span className="empty-message">No friends yet</span>}
		</List>)}
		{ tab === 2 && !search.length && (
			<>
				<List>
					{publicChats.map((chat: any) => (<Preview key={chat.id} onClick={() => joinPublicChatRoom(chat)}>
						{chat.participants.filter((user: any) => user?.user?.id !== currentUser?.id).slice(0, 3).map((user: any) => <img key={user.id} src={user?.user?.photo_url} alt={user?.user?.login} />)}
						<div>
							<h4>{chatName(chat, currentUser)}</h4>
							<span>{chat.is_password_protected ? "locked" : ""}</span>
						</div>
					</Preview>))}
					{!publicChats.length && <span className="empty-message">No chat yet</span>}
				</List>
				<LargeButton onClick={() => createChat()}>+ Create chat</LargeButton>
			</>
		)}
		{ search.length > 0 && (<List>
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

	.empty-message {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
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
		width: 40px;
		height: 40px;
		border-radius: 100%;
		margin-left: -20px;
		background-color: white;
	}

	> img:nth-child(1) {
		margin: 0;
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

const LargeButton = styled.button`
	width: 100%;
	padding: 10px;
	color: #CA6C88;
	border: none;
	background-color: white;
`;

export default ChatList;
