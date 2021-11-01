import React from 'react' 
import './chatRoom.scss'
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { pink } from '@mui/material/colors';
// import { BrowserRouter as Router, Link, Route, NavLink, Switch } from 'react-router-dom'



const ChatRoom = () => {
    return (
        <div className='mainChat  '>
         <Fab className='iconeChat' color="primary" aria-label="add" 
            sx={{width: 80, height: 80}}
         
         >
            <PeopleAltIcon sx={{width: 40, height: 40}}/>

            
        </Fab>
        </div>
    )
}


export default ChatRoom