import React from 'react'
import './paramUser.scss'
import TextField from '@mui/material/TextField';
import { useSpring, animated } from 'react-spring'
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

import FF from './photos/FF.png'


const CssTextField = styled(TextField)({
    '& label.Mui-focused': {
      color: 'black',
      
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'grey',
        borderRadius: 20,
       
      },
      
      
    },
  });


const ParamUser = () => {
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
        
        <animated.div  style={props} className='w-100'> 
        <div className='mainParamUser d-flex flex-column'>
            <div className='userImg'>
                <img src={FF} alt="" />
            </div>
            <div className='userStat  d-flex'>
                <div className='game d-flex flex-column'>
                    <h1>32</h1>
                    <h2>Game</h2>
                </div>
                <div className='win d-flex flex-column'>
                    <h1>30</h1>
                    <h2>Win</h2>
                </div>
                <div className='loose  d-flex flex-column'>
                    <h1>2</h1>
                    <h2>Loose</h2>
                </div>
            </div>
            <div className='userLoggin '>
                <CssTextField className='loggin'  id="outlined-password-input" size='small' label="User 42 nickname"
                            sx={{width: 2/2}} />
            </div>
            <div className='userQuit'>
                <Button variant="contained">Disconnect</Button>

            </div>
       
    
       
        
       
        </div>
        </animated.div>
     
        
      
    )
}


export default ParamUser