import axios from "axios";
import { useState } from "react";
import styled from "styled-components";
import ChatParticipant from "./ChatParticipant.component";
import BlockIcon from '@mui/icons-material/Block';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import AddModeratorIcon from '@mui/icons-material/AddModerator';
import RemoveModeratorIcon from '@mui/icons-material/RemoveModerator';
import Tooltip from "@mui/material/Tooltip";

const RoomSettings = ({ room, currentUser }: any) => {

	const [userDetail, setUserDetail] = useState<any | null>(null);

	const showUserDetail = (user: any) =>  {
		setUserDetail(user);
	};

	const isModerator = () => {
		if (isOwner())
			return true;
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
		axios.patch(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/room/${room.id}/password`, {
			password: newPassword
		}, { withCredentials: true })
		.then(() => alert("Password successfully set"))
		.catch(err => alert(`Cannot set password: ${err}`));
	}

	const addParticipant = async () => {
		const login = prompt("Enter the login of the participant");
		if (!login)
			return;
		try {
			const { data } = await axios.get(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/users/profile/${login}`, { withCredentials: true });
			console.log("DATA", data);
			const id = (data as any).user.id;
			if (!id) {
				alert(`Cannot find user '${login}'.`);
			}
			await axios.post(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/room/${room.id}/participant`, {
				id
			}, { withCredentials: true });
		} catch {
			alert(`User '${login}' not found or is already in the room.`);
			return;
		}
		window.dispatchEvent(new CustomEvent("shouldRefreshPublicRoom", { detail: { id: room.id } }));
	};

	const toggleModerator = async (user: any) => {
		try {
			await axios.patch(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/room/${room.id}/moderator`, {
				participant_id: user.id,
				is_moderator: !user.is_moderator
			}, { withCredentials: true });
			window.dispatchEvent(new CustomEvent("shouldRefreshPublicRoom", { detail: { id: room.id } }));
		} catch (e: any) { console.log(e) };
	};

	const makePublic = async () => {
		await axios.patch(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/room/${room.id}/privateStatus`, {
			is_private: false
		}, { withCredentials: true }).catch(err => console.log(`Cannot make public: ${err}`));
		window.dispatchEvent(new CustomEvent("shouldRefreshPublicRoom", { detail: { id: room.id } }));
	};

	const makePrivate = async () => {
		await axios.patch(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/room/${room.id}/privateStatus`, {
			is_private: true
		}, { withCredentials: true }).catch(err => console.log(`Cannot make public: ${err}`));
		window.dispatchEvent(new CustomEvent("shouldRefreshPublicRoom", { detail: { id: room.id } }));
	};

	const mute = async (user: any) => {
		try {
			const duration = prompt("Mute duration, in minutes");
			if (duration !== "" && !duration)
				return;
			if (parseInt(duration)) {
				await axios.post(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/room/${room.id}/restriction`, {
					participant_id: user.id,
					user_id: user.user.id,
					restriction_type: "mute",
					duration: parseInt(duration)
				}, { withCredentials: true });
			} else {
				alert("Invalid input: only number accepted");
			}
		} catch (e: any) { console.log(e) };
	}

	const ban = async (user: any) => {
		try {
			const duration = prompt("Ban duration, in minutes");
			if (duration !== "" && !duration) {
				return;
			}
			if (parseInt(duration)) {
				await axios.post(`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/room/${room.id}/restriction`, {
					participant_id: user.id,
					user_id: user.user.id,
					restriction_type: "ban",
					duration: parseInt(duration)
				}, { withCredentials: true });
			} else {
				alert("Invalid input: only number accepted");
			}
		} catch (e: any) { console.log(e) };
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
					{room.is_private && <Button onClick={() => makePublic()}>Set room as public</Button>}
					{!room.is_private && <Button onClick={() => makePrivate()}>Set room as private</Button>}
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
						<Tooltip title="Ban user"><button onClick={() => ban(user)}>
							<BlockIcon />
						</button></Tooltip>
						<Tooltip title="Mute user"><button onClick={() => mute(user)}>
							<VolumeOffIcon />
						</button></Tooltip>
						<Tooltip title={user.is_moderator ? "Remove moderator rights" : "Add moderator rights"}><button onClick={() => toggleModerator(user)}>
							{!user.is_moderator && (<AddModeratorIcon />)}
							{user.is_moderator && (<RemoveModeratorIcon />)}
						</button></Tooltip>
					</ActionButtons>
				)}
			</User>))
		}
		<Button onClick={() => addParticipant()}>+ Add participant</Button>
	</Wrapper>;
};

const Wrapper = styled.div`
	width: 100%;
	overflow-y: auto;
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
