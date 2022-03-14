import styled from 'styled-components';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { useMainPage } from '../../MainPageContext';
import { useNavigate } from 'react-router-dom';
import { UserChallenge, UserDto } from '../type';

const ChatParticipant = ({ user, currentUser }: any) => {
	const [friends, setFriends] = useState<any[]>([]);
	const [blocked, setBlocked] = useState<any[]>([]);
	const [profile, setProfile] = useState<any | null>(null);
	const [friendsLoading, setFriendsLoading] = useState<boolean>(false);
	const [playButtonVisible, setPlayButtonVisible] = useState<boolean>(true);
	let navigate = useNavigate();

	const getFriends = async () => {
		setFriendsLoading(true);
		const result = await axios
			.get(
				`http://${
					process.env.REACT_APP_BASE_URL || 'localhost:3000'
				}/users/friend`,
				{ withCredentials: true },
			)
			.catch(console.error);
		setFriends(result?.data || []);
		setFriendsLoading(false);
	};

	const getProfile = async () => {
		try {
			const result = await axios.get(
				`http://${
					process.env.REACT_APP_BASE_URL || 'localhost:3000'
				}/users/profile/${user.user.login}`,
				{
					withCredentials: true,
				},
			);
			setProfile(result?.data);
			console.log('PROFILE', result?.data);
		} catch (e: any) {
			console.log(e);
		}
	};

	const getBlocks = async () => {
		const result = await axios
			.get(
				`http://${
					process.env.REACT_APP_BASE_URL || 'localhost:3000'
				}/users/block`,
				{ withCredentials: true },
			)
			.catch(console.error);
		setBlocked(result?.data || []);
		console.log('REOADING BLOCKS', result?.data);
	};

	const isBlocked = () => {
		const block = blocked.filter((a: any) => a.id === user.user.id);
		return block.length > 0;
	};

	const isFriend = () => {
		const result = friends.filter((friend: any) => friend.id === user.user.id);
		return result.length > 0;
	};

	const addFriend = async (id: any) => {
		try {
			setFriendsLoading(true);
			await axios.post(
				`http://${
					process.env.REACT_APP_BASE_URL || 'localhost:3000'
				}/users/friend`,
				{
					id,
				},
				{ withCredentials: true },
			);
			window.dispatchEvent(new CustomEvent('friendsUpdated', { detail: {} }));
			getFriends();
		} catch (e: any) {
			console.log(e);
		}
	};

	const removeFriend = async (id: any) => {
		try {
			setFriendsLoading(true);
			await axios.delete(
				`http://${
					process.env.REACT_APP_BASE_URL || 'localhost:3000'
				}/users/friend`,
				{
					withCredentials: true,
					data: {
						id,
					},
				},
			);
			window.dispatchEvent(new CustomEvent('friendsUpdated', { detail: {} }));
			getFriends();
		} catch (e: any) {
			console.log(e);
		}
	};

	const { setStartGame, setSelectNav, setPlayerGameLogic } = useMainPage();
	const askGame = async (login: any) => {
		try {
			if (!playButtonVisible) return;
			const response = await axios.post(
				`http://${process.env.REACT_APP_BASE_URL || 'localhost:3000'}/game`,
				{ login_opponent: login },
				{
					withCredentials: true,
				},
			);
			setPlayButtonVisible(false);
			setTimeout(() => setPlayButtonVisible(true), 15000);
			const { login_opponent: string, ...userDto } = response.data;
			const opponent: Partial<UserDto> = userDto;
			setPlayerGameLogic(() => {
				return {
					isChallenge: true,
					isP1: true,
					opponent: opponent,
				};
			});
			setStartGame(true);
			setSelectNav(false);
			navigate('/Mainpage');
			window.dispatchEvent(
				new CustomEvent('gameStartedFromChat', { detail: { login } }),
			);
		} catch (e: any) {
			if (e.response.data) {
				alert(e.response.data.message);
			} else {
				alert(`Cannot start the game, make sure ${login} is online`);
			}
		}
	};

	const blockUser = async (id: any) => {
		try {
			await axios.post(
				`http://${
					process.env.REACT_APP_BASE_URL || 'localhost:3000'
				}/users/block`,
				{
					id,
				},
				{ withCredentials: true },
			);
			getBlocks();
		} catch (e: any) {
			console.log(e);
		}
	};

	const unblockUser = async (id: any) => {
		try {
			await axios.delete(
				`http://${
					process.env.REACT_APP_BASE_URL || 'localhost:3000'
				}/users/block`,
				{
					withCredentials: true,
					data: { id },
				},
			);
			getBlocks();
		} catch (e: any) {
			console.log(e);
		}
	};

	useEffect(() => {
		getFriends();
		getBlocks();
		getProfile();

		window.addEventListener('publicUserInfosUpdated', ({ detail }: any) => {
			console.log('INFO UPDTED', detail);
			if (detail.id === user.user.id) {
				console.log('UPDATED');
				getProfile();
			}
		});
	}, []);

	return (
		<>
			<DetailsView>
				<img
					src={profile?.user.photo_url || user?.user.photo_url}
					alt={user?.user.login}
				/>
				<h3>{profile?.user.login || user?.user.login}</h3>
				<span>{profile?.user.status || user?.user.status}</span>
			</DetailsView>
			{currentUser && user && currentUser.id !== user.user.id && (
				<ButtonRow>
					{!isFriend() && (
						<Tooltip title="Add as friend">
							<button onClick={() => addFriend(user.user.id)}>
								<PersonAddIcon />
							</button>
						</Tooltip>
					)}
					{isFriend() && (
						<Tooltip title="Remove friend">
							<button onClick={() => removeFriend(user.user.id)}>
								<PersonOffIcon />
							</button>
						</Tooltip>
					)}
					{user?.user.status === 'online' && (
						<Tooltip title="Send game request">
							<button onClick={() => askGame(user.user.login)}>
								<SportsEsportsIcon />
							</button>
						</Tooltip>
					)}
					{!isBlocked() && (
						<Tooltip title="Block user">
							<button onClick={() => blockUser(user.user.id)}>
								<VisibilityOffIcon />
							</button>
						</Tooltip>
					)}
					{isBlocked() && (
						<Tooltip title="Unblock user">
							<button onClick={() => unblockUser(user.user.id)}>
								<VisibilityIcon />
							</button>
						</Tooltip>
					)}
				</ButtonRow>
			)}
			{profile && (
				<ProfileView>
					<div>
						<span>{profile.games_won}</span>
						<span>Wins</span>
					</div>
					<div>
						<span>{profile.games_lost}</span>
						<span>Losses</span>
					</div>
					<div>
						<span>{profile.games_count}</span>
						<span>Games</span>
					</div>
				</ProfileView>
			)}
		</>
	);
};

const DetailsView = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	flex-direction: column;

	img {
		width: 60px;
		height: 60px;
		border-radius: 100%;
	}

	h3 {
		margin: 10px;
	}
`;

const ButtonRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;

	button {
		width: 40px;
		height: 40px;
		background-color: #f1f1f1;
		border: none;
		border-radius: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 5px;
	}
`;

const ProfileView = styled.div`
	display: flex;
	justify-content: space-evenly;
	margin-top: 20px;

	> div {
		display: flex;
		flex-direction: column;
		align-items: center;

		span:nth-child(1) {
			font-size: 20px;
		}
	}
`;

export default ChatParticipant;
