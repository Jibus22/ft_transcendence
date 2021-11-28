import React, { useState }  from 'react'
import styled from 'styled-components'

const Chat = () => {

	const [open, setOpen] = useState(true);

	return (<>
		{open && <ChatContainer></ChatContainer>}
	</>);
}

const ChatContainer = styled.div`
	position: fixed;
	right: 10px;
	bottom: 10px;
	width: 200px;
	height: 200px;
	background-color: black;
`;

export default Chat