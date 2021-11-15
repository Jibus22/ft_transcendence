import React from 'react' 
import './header.scss'
import {NavLink} from 'react-router-dom'
import { Badge } from '@mui/material';
import FF from '../../homePage/section/photos/FF.png'



const Header = () => {

 
    return (
      
    <div className=' d-flex flex-column mainHeader '>
    <nav className="navbar navbar-expand-lg  menuHeader ">

        <div className="d-flex  mainNavMenu">
            <ul className="navbar-nav headerMenu  w-100 ">
                <li className="nav-item  linkLogoNav">
                    <NavLink  to='/MainPage' className='toNavLink'   activeClassName="selectedNave" >
                      
                            <h1>Games</h1>
                            
                    </NavLink>
                </li>
                
                <li className="nav-item leaderDiv  " >
                    <NavLink to="/MainPage/Rank-Friends" className='toNavLink'   activeClassName="selectedNave" > 
                      
                         <h1>LeaderBoard</h1>
                    </NavLink>
                </li>

    
                <li className="nav-item linkLogoNav " >
                    <NavLink  to='/MainPage/historyGame' className='toNavLink'     activeClassName="selectedNave"> 
                        
                         <h1>History</h1>
                    </NavLink>
                </li>

            </ul>
            
            </div>
        
        
        <div className='logHeader d-flex '>
            <NavLink style={{ textDecoration: 'none' }} to='/MainPage/setting' className='w-100 '>
            <div className="profil d-flex  " >
                <div className='profilLoggin  '>
                    <h2 className=''>Frfrance</h2>
                </div>
                <div className='profilLogginImg '>
                <Badge  anchorOrigin={{vertical: 'bottom', horizontal: 'right',}}
                color="success" overlap="circular" badgeContent=" " >
                    <img  className=''   src={FF} alt="" /> 
                </Badge>
                    
                </div>
            </div>
            </NavLink>
        </div>
   
    </nav>
        <div>
       
        </div>

       
    </div>
    
    
    
    
   
    )
}

export default Header