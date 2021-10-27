import React from 'react' 
import './userRank.scss'
import {RankFriends, RankWorld} from '../..'
import { Fade } from "react-awesome-reveal";
import { BrowserRouter as Router, Route, NavLink} from 'react-router-dom'

const UserRank = () => {
    return (
        <Router>
        <Fade direction='up' duration={400} className='w-100'>
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
        </Fade>
        </Router>
    )
}

export default UserRank