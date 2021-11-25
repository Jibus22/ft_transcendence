import React from 'react' 
import './userRank.scss'
// import {RankFriends, RankWorld} from '../..'
import { useSpring, animated } from 'react-spring'
// import { BrowserRouter as Router, Route, NavLink} from 'react-router-dom'
// import {ToggleButton } from '@mui/material';

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
        // <Router>
        <animated.div  style={props} className='w-100'> 
        <div className='mainUserRank d-flex flex-column  '>
            {/* <div className='mainTitleRank d-flex  '>
                <div>
                     <h1>Leaderboard</h1>
                </div>
                <div className='d-flex toogleButton'>
                <NavLink  style={{ textDecoration: 'none', height: '100%', width: '100%' }}  to='/MainPage/Rank-Friends' activeClassName="selectedNav">
                    <ToggleButton value="left"  sx={{width: 2/2 , height: 2/2, border: 'none', textTransform: 'none'}} className='lolp'>
                        <p>World</p>
                    </ToggleButton>
                </NavLink>
                <NavLink  style={{ textDecoration: 'none', height: '100%', width: '100%' }}  to='/MainPage/Rank-World' activeClassName="selectedNav ">
                     <ToggleButton value="right"  sx={{width: 2/2, height: 2/2, border: 'none', textTransform: 'none'}}>
                        <p>Friends</p>
                    </ToggleButton>
                </NavLink>
                </div>
            
            </div> */}
            <div className='rankInfo d-flex '>
                <h3 className='nbRank'>Rank</h3>
                <h3 className='nbUser' >User</h3>
                <h3 className='nbGame'>Game</h3>
                <h3 className='nbWin'>Win</h3>
                <h3 className='nbLoose'>Looses</h3>

            </div>
           
            <div className='userPrintDIv'>
                {/* <Route exact path='/MainPage/Rank-Friends' component={ RankFriends }></Route>
                <Route exact path='/MainPage/Rank-World' component={ RankWorld}></Route> */}

            </div>
            


           

        </div>
        </animated.div>
        // </Router>
    )
}

export default UserRank