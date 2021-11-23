import React, { useState } from 'react' 
import './chatRoom.scss'
import Fab from '@mui/material/Fab';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

import { WindowChat } from '../..';
// import { BrowserRouter as Router, Link, Route, NavLink, Switch } from 'react-router-dom'
import { useSpring, animated } from 'react-spring'



const ChatRoom = () => {
    const props = useSpring({
        opacity: 1,
        transform: "translate(0px, 0px)",
        from: { opacity: 0, transform: "translate(0px, 0px)" } ,
        config: {
          delay: 500,
          duration: 500,
        },
      });

    var [window, setWindow] = useState(false);

    function handleClick() {
       setWindow(window = true)
    }

    if (window === true) {
        return <WindowChat/>
    }

    return (
        
        <div className='mainChat  '>
            <animated.div  style={props} className='w-100'> 
         <Fab className='iconeChat' color="primary" aria-label="add" onClick={handleClick}
            sx={{width: 80, height: 80}}>
            <PeopleAltIcon sx={{width: 40, height: 40}}/>
        
            
        </Fab>
        </animated.div>
       


        </div>
        
    )
}


export default ChatRoom