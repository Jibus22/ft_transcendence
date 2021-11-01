
import React from 'react'
import './game.scss'
// import { BrowserRouter as Router, Link, Route, NavLink, Switch, useHistory } from 'react-router-dom'

import { useSpring, animated } from 'react-spring'



const GameWindow = () => {
    const props = useSpring({
        opacity: 1,
        transform: "translate(0px, 0px)",
        from: { opacity: 0, transform: "translate(0px, 500px)" } ,
        config: {
          delay: 400,
          duration: 500,
        },
      });
 
     

    return (

        // <Fade direction='up' duration={400} className='w-100'> 
        <animated.div  style={props} className='w-100'> 
        <div className='mainGameWindow '>

            
            
            
        </div>
        </animated.div>
 
     
    )
}


export default GameWindow

