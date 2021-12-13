
function showCookies() {
	return document.cookie;
}
document.cookie = 'X-Authorization=' + 'TEST_______________________________' + '; path=/';
console.log('cookies:', showCookies());



const socket = io("ws://localhost:3000",
{
  auth: {
    token: "test______"
  }
});

socket.on("connect_error", (err) => {
	console.log(`connect_error due to ${err.message}`);
});

socket.on("connect", () => {
	console.log(`CONNECTED`);
	console.log(socket);
});

socket.on("disconnect", () => {
	console.log(`DISCONNECTED`);
	console.log(socket);
});


const message = document.getElementById('message');
const messages = document.getElementById('messages');

const handleSubmitNewMessage = () => {
	socket.emit('ingame', { data: ingame.checked })
	socket.emit('online', { data: online.checked })
}

// socket.on('message', ({ data }) => {
// 	handleNewMessage(data);
// })

// const handleNewMessage = (message) => {
// 	messages.appendChild(buildNewMessage(message));
// }

// const buildNewMessage = (message) => {
// 	const li = document.createElement("li");
// 	li.appendChild(document.createTextNode(message))
// 	return li;
// }
