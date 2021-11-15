
import React from 'react'
import './onlineGame.scss'
import { useSpring, animated } from 'react-spring'
import Button from '@mui/material/Button';
import FF from '../../homePage/section/photos/FF.png'
import JB from '../../homePage/section/photos/jb.png'


const OnlineGame = () =>  {
    const props = useSpring({
        opacity: 1,
        transform: "translate(0px, 0px)",
        from: { opacity: 0, transform: "translate(0px, 500px)" } ,
        config: {
          delay: 400,
          duration: 500,
        },
      });
 
      let divTest =   <div className='partyOnline d-flex'>
                <div className='userImg d-flex'>
                    <div className='imgDom'>
                        <img src={FF} alt="" />
                    </div>
                    <div className='imgExt'>
                     <img src={JB} alt="" />
                    </div>

                </div>
                <div className='userStat d-flex flex-column  '>
                    <div className='player d-flex '>
                        <p className='user' >frfrance</p>
                        <p className='vs'>vs</p>
                        <p className='user'>jl-core</p>
                    </div>
                    <div className='score d-flex'>
                        <p>14</p>
                        <p className='semiliconGame'>:</p>
                        <p>1</p>
                    </div> 
                </div>
                <div className='userWatch '>
                <Button className='muiButton' variant="contained"   sx={{borderRadius: 4, width: 2/2, textTransform: 'none'}}>Watch</Button>
                </div>
                  </div>


    return (
        <animated.div  style={props} className='w-100'> 
            <div className='mainOnlineGame d-flex flex-column '>
                <div className='title '>
                    <h1>Online game</h1>
                </div>
                <div className='pageOverflow'>
                <div className='onlineDiv '>
                   {divTest}
                   {divTest}
                   {divTest}
                   {divTest}
                </div>

                </div>
            </div>
        </animated.div>
    )
}

export default OnlineGame