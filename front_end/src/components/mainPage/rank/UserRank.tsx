import React from 'react' 
import './userRank.scss'
import {RankFriends, RankWorld} from '../..'
import { useSpring, animated } from 'react-spring'
import {NavLink as Link, Routes, Route } from "react-router-dom"
import {ToggleButton } from '@mui/material';

const UserRank = () => {

    const props = useSpring({
        opacity: 1,
        transform: "translate(0px, 0px)",
        from: { opacity: 0, transform: "translate(0px, 500px)" } ,
        config: {
          delay: 300,
          duration: 300,
        },
      });

    return (
        <animated.div  style={props} className='w-100'> 
        <div className='mainUserRank d-flex flex-column  '>
            <div className='mainTitleRank d-flex  '>
                <div>
                     <h1>Leaderboard</h1>
                </div>
                <div className='d-flex toogleButton'>
                <Link  style={{ textDecoration: 'none', height: '100%', width: '100%' }}  to='/Rank/World' className={(navData) => navData.isActive ? "selectedNave" : "" }>
                    <ToggleButton value="left"  sx={{width: 2/2 , height: 2/2, border: 'none', textTransform: 'none'}} className='lolp'>
                        <p>World</p>
                    </ToggleButton>
                </Link>
                <Link  style={{ textDecoration: 'none', height: '100%', width: '100%' }}  to='/Rank/Friends' className={(navData) => navData.isActive ? "selectedNave" : "" }>
                     <ToggleButton value="right"  sx={{width: 2/2, height: 2/2, border: 'none', textTransform: 'none'}}>
                        <p>Friends</p>
                    </ToggleButton>
                </Link>
                </div>
            
            </div>
            <div className='rankInfo d-flex '>
                <h3 className='nbRank'>Rank</h3>
                <h3 className='nbUser' >User</h3>
                <h3 className='nbGame'>Game</h3>
                <h3 className='nbWin'>Win</h3>
                <h3 className='nbLoose'>Looses</h3>

            </div>
           
            <div className='userPrintDIv'>
                <Routes>
                    <Route path='/Friends' element={ <RankFriends/> }/>
                    <Route path='/World' element={ <RankWorld/> }/>
                </Routes>
            </div>
        </div>
        </animated.div>
    )
}

export default UserRank