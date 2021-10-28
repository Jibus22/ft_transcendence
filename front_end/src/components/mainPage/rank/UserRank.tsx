import React from 'react' 
import './userRank.scss'
import {RankFriends, RankWorld} from '../..'
import { useSpring, animated } from 'react-spring'
import { BrowserRouter as Router, Route, NavLink} from 'react-router-dom'

const UserRank = () => {

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
        <Router>
        <animated.div  style={props} className='w-100'> 
        <div className='mainUserRank w-100 d-flex flex-column  '>
            <div className='titleRank d-flex flex-column '>
                <h1>Leaderboard</h1>
                <hr />
            </div>
            <div className="mainNav">
                <ul className='d-flex '> 
                    <li className='nav-item '>
                        <NavLink  style={{ textDecoration: 'none' }}  to='/MainPage/Rank-Friends'
                        activeClassName="selectedNav">
                            <h3>Friends</h3>

                        </NavLink>
                    </li>
                    <li className='nav-item'>
                    <NavLink  style={{ textDecoration: 'none' }}  to='/MainPage/Rank-World'
                    activeClassName="selectedNav">
                            <h3>World</h3>
                    </NavLink>
                    </li>
                </ul>
            </div>
            <Route exact path='/MainPage/Rank-Friends' component={ RankFriends }></Route>
            <Route exact path='/MainPage/Rank-World' component={ RankWorld}></Route>

        </div>
        </animated.div>
        </Router>
    )
}

export default UserRank