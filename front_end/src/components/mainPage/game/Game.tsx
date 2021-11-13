import React, { useState } from 'react';

import './game.scss'
// import { BrowserRouter as Router, Link, Route, NavLink, Switch, useHistory } from 'react-router-dom'

import IconGame from './img/Group.png'
import { useSpring, animated } from 'react-spring'
import { IconButton, Button, CircularProgress   } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FormGame from './FormGame';



  




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

     
        const[loading, setLoading] = useState(false);
        function handleClick() {
                setLoading(true);
                console.log(loading)
                setInterval(() => {
                    setLoading(false);
                }, 2000);
                console.log(loading)
        }


        const[isLoggedIn, setisLoggedIn] = useState(false)
        function handleLoginClick() {
            setisLoggedIn(true)
        }
        function handleLogoutClick() {
            setisLoggedIn(false)
        }
        let button;
        if (!isLoggedIn) {
            button = <div> 
                 <Button className='buttonMui buttonMuiFriend' variant="contained" onClick={ handleLoginClick }   
            sx={{borderRadius: 3, width: 2/2, height: 2/2, textTransform: 'none'}}>
                Invit a friend
            </Button  > 
            </div>
          } else {
            button = <FormGame click={ handleLogoutClick } />
          }

    return (

      
        <animated.div  style={props} className='w-100'> 
        <div className='mainGameWindow d-flex flex-column '>
            <div className='msgPlay  '>
                <h1>Do you want to play now ? </h1>
            </div>
            <div className='iconePLayGame'>
                <img src={IconGame} alt="" />
            </div>

            <div className='playRandom '>
           
            <LoadingButton className='buttonMui' onClick={handleClick} disabled={loading}  variant="contained"
                sx={{borderRadius: 3, width: 2/2, height: 2/2, textTransform: 'none'}}>
                     {loading && <CircularProgress size={35}  />}
                     {!loading && 'Play Now'}
            </LoadingButton>
          {button}
       
            </div>   
        </div>
        </animated.div>
 
     
    )
}


export default GameWindow

