import axios from "axios";
import { useState } from "react";
import styled from "styled-components";
import ChatParticipant from "./ChatParticipant.component";
import BlockIcon from '@mui/icons-material/Block';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import AddModeratorIcon from '@mui/icons-material/AddModerator';
import RemoveModeratorIcon from '@mui/icons-material/RemoveModerator';

const RoomSettings = ({ room, currentUser }: any) => {

	const [userDetail, setUserDetail] = useState<any | null>(null);

	const showUserDetail = (user: any) =>  {
		setUserDetail(user);
	};

	const isModerator = () => {
		let moderator = false;
		room.participants.forEach((participant: any) => {
			if (participant.user.id === currentUser.id && participant.is_moderator)
				moderator = true;
		});
		return moderator;
	};

	const isOwner = () => {
		let owner = false;
		room.participants.forEach((participant: any) => {
			if (participant.user.id === currentUser.id && participant.is_owner)
				owner = true;
		});
		return owner;
	};
	
	const changePassword = async () => {
		const newPassword = prompt("New password (empty for no password)");
		await axios.patch(`http://localhost:3000/room/${room.id}/password`, {
			password: newPassword
		}, { withCredentials: true });
	}

	const addParticipant = async () => {
		const login = prompt("Enter the login of the participant");
		
		try {
			const { data } = await axios.get(`http://localhost:3000/users/profile/${login}`, { withCredentials: true });
			const { id } = data;
			await axios.post(`http://localhost:3000/room/${room.id}/participant`, {
				id
			}, { withCredentials: true });
		} catch {
			alert(`User '${login}' not found or is already in the room.`);
			return;
		}
		window.dispatchEvent(new CustomEvent("shouldRefreshPublicRoom", { detail: { id: room.id } }));
	};

	const toggleModerator = async (user: any) => {
		await axios.patch(`http://localhost:3000/room/${room.id}/moderator`, {
			participant_id: user.id,
			is_moderator: !user.is_moderator
		}, { withCredentials: true });
		window.dispatchEvent(new CustomEvent("shouldRefreshPublicRoom", { detail: { id: room.id } }));
	};

	const mute = async (user: any) => {
		const duration = prompt("Mute duration, in minutes");
		if (duration) {
			await axios.post(`http://localhost:3000/room/${room.id}/restriction`, {
				user_id: user.id,
				restriction_type: "mute",
				duration: parseInt(duration)
			}, { withCredentials: true });
		}
	}

	const ban = async (user: any) => {
		const duration = prompt("Ban duration, in minutes");
		if (duration) {
			await axios.post(`http://localhost:3000/room/${room.id}/restriction`, {
				user_id: user.id,
				restriction_type: "ban",
				duration: parseInt(duration)
			}, { withCredentials: true });
		}
	}

	if (userDetail) {
		return (<ChatParticipant user={userDetail} currentUser={currentUser} />);
	}

	return <Wrapper>
		{isOwner() && (
			<>
				<h3>Chat settings</h3>
				<SettingsWrapper>
					<Button onClick={() => changePassword()}>Change/Set password</Button>
				</SettingsWrapper>
			</>
		)}
		<h3>Participants</h3>
		{
			room.participants.map((user: any) => (<User key={user.id}>
				<img onClick={() => showUserDetail(user)} src={user.user.photo_url} alt={user.user.login} />
				<span onClick={() => showUserDetail(user)}>{user.user.login}</span>
				{isModerator() && user.user.id !== currentUser.id && (
					<ActionButtons>
						<button onClick={() => ban(user)}>
							<BlockIcon />
						</button>
						<button onClick={() => mute(user)}>
							<VolumeOffIcon />
						</button>
						<button onClick={() => toggleModerator(user)}>
							{!user.is_moderator && (<AddModeratorIcon />)}
							{user.is_moderator && (<RemoveModeratorIcon />)}
						</button>
					</ActionButtons>
				)}
			</User>))
		}
		<Button onClick={() => addParticipant()}>+ Add participant</Button>
	</Wrapper>;
};

const Wrapper = styled.div`
	width: 100%;
	h3 {
		width: 100%;
		margin: 0;
		text-align: center;
	}
`;

const SettingsWrapper = styled.div`
	padding: 20px;
`;

const User = styled.div`
	display: flex;
	align-items: center;
	padding: 5px 20px;
	cursor: pointer;

	img {
		width: 40px;
		height: 40px;
		border-radius: 100%;
	}

	span {
		margin-left: 10px;
	}

`;

const Button = styled.div`
	width: 100%;
	padding: 10px;
	color: #CA6C88;
	border: none;
	background-color: white;
	text-align: center;
	cursor: pointer;
`;

const ActionButtons = styled.div`
	margin-left: auto;

	button {
		background-color: #F1F1F1;
		border: none;
		width: 30px;
		height: 30px;
		border-radius: 100%;
		margin: 5px;
	}
`;

export default RoomSettings;