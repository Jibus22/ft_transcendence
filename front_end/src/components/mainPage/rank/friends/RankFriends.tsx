import React from 'react' 
import '../userRank.scss'
import { useSpring, animated } from 'react-spring'
import FF from '../img/FF.png'
import {Avatar, Badge } from '@mui/material';

import Button from '@mui/material/Button';

const Rankfriends = () => {
    const props = useSpring({
        opacity: 1,
        transform: "translate(0px, 0px)",
        from: { opacity: 0, transform: "translate(0px, 0px)" } ,
        config: {
          delay: 1000,
          duration: 1100,
        },
      });
   
      let divUser = 
        <div className='MainUserRankdiv d-flex '>
        <div className='d-flex rankdiv rankdiv1'>
            <div className='nbRank '>
            <h1>1</h1>
            </div>
            <div className='imgUser '>
                <Badge  overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            variant="dot">
                        <Avatar alt="userImg" src={FF} variant='square' className='domUser' />
                </Badge>
            </div>
            <div className='logginUser d-flex '>
                <h1>Frfrance</h1>
            </div>
            
        </div>
        <div className='d-flex rankdiv rankdiv2'> 
            <div className='d-flex nbStatGame'>
                <h3>15</h3>
            </div>
            <div className='d-flex nbStatWin'>
                <h3>4</h3>
             </div>
             <div className='d-flex nbStatLoose'>
                <h3>19</h3>
            </div>
        </div>
        <div className='buttonDIv d-flex'>
             <Button className='muiButton'  variant="contained"   sx={{width: 2/2 , textTransform: 'none'}}>Challenge</Button>
        </div>
    </div>
      
   
    return (
        <animated.div  style={props} className='w-100'> 
        <div className='mainRankFriends d-flex flex-column '>
            {divUser}
            {divUser}
            {divUser}
            {divUser}
            {divUser}
           
            
          

        </div>
        </animated.div>
     
    )
}

export default Rankfriends