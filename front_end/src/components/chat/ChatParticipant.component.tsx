import styled from "styled-components";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BlockIcon from '@mui/icons-material/Block';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import axios from "axios";

const ChatParticipant = ({ user, currentUser }: any) => {

	const addFriend = async (id: any) => {
		await axios.post(`http://localhost:3000/users/friend`, {
			id
		}, { withCredentials: true });
	};

	const askGame = async (id: any) => {
		// ?
	};

	const blockUser = async (id: any) => {
		await axios.post(`http://localhost:3000/users/block`, {
			id
		}, { withCredentials: true });
	};

	return (
		<>
			<DetailsView>
				<img src={user.user.photo_url} alt={user.user.login} />
				<h3>{ user.user.login }</h3>
			</DetailsView>
			{ currentUser.id !== user.user.id && (<ButtonRow>
				<button><PersonAddIcon onClick={ () => addFriend(user.user.id) } /></button>
				<button><SportsEsportsIcon onClick={ () => askGame(user.user.id) } /></button>
				<button><BlockIcon onClick={ () => blockUser(user.user.id) } /></button>
			</ButtonRow>) }
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
		background-color: #F1F1F1;
		border: none;
		border-radius: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 5px;
	}
`;

export default ChatParticipant;