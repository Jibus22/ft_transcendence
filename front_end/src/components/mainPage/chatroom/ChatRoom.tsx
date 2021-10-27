import React from 'react' 
import './chatRoom.scss'
// import { BrowserRouter as Router, Link, Route, NavLink, Switch } from 'react-router-dom'
import { Fade } from "react-awesome-reveal";

const ChatRoom = () => {
    return (
        <Fade direction='up' duration={400} className='w-100'> 
        <div className='mainChat'>

        </div>
        </Fade>
    )
}


export default ChatRoom