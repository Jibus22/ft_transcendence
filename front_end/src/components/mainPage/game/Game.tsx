
import React from 'react'
import './game.scss'
// import { BrowserRouter as Router, Link, Route, NavLink, Switch, useHistory } from 'react-router-dom'
import Button from '@mui/material/Button';


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

    // const [loading, setLoading] = React.useState(false);
    // function handleClick() {
    //     setLoading(true);
    // }
      
 
     

    return (

      
        <animated.div  style={props} className='w-100'> 
        <div className='mainGameWindow d-flex flex-column'>
            <div className='msgPlay'>
                <h1>Do you want to play now ? </h1>
            </div>
            <div className='playRandom '>
               
                 <Button variant="contained"   sx={{borderRadius: 3, width: 2/2, height: 2/2}}>Play</Button> 
                 
            



            </div>
            <div className='playFriend '>
             <Button variant="contained"   sx={{borderRadius: 3, width: 2/2, height: 2/2}}>Invit Friend</Button>
            </div>
            
            
            
        </div>
        </animated.div>
 
     
    )
}


export default GameWindow

