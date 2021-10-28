import React from 'react' 
import './header.scss'
import {NavLink} from 'react-router-dom'
import Logo from './src/logo.svg'
import Icon from '@mdi/react'
import { mdiCogOutline, mdiBellOutline, mdiCrownOutline, mdiGamepadVariantOutline } from '@mdi/js';

import FF from '../../homePage/section/photos/FF.png'



const Header = () => {

 
    return (
      
    <div className=' d-flex flex-column mainHeader'>
    <nav className="navbar navbar-expand-lg  menuHeader ">
        <img className='logo' src={Logo} alt="" />
        <div className="container-fluid  ">
            <ul className="navbar-nav headerMenu ">
                <li className="nav-item  linkLogoNav">
                    <NavLink 
                    to='/MainPage' className='navGame'   activeClassName="selectedNave" >
                        <Icon path={mdiGamepadVariantOutline} title="Setting Profile" size={1.1}
                            className='iconeNewGame iconHeader ' />
                    </NavLink>
                </li>
                
                <li className="nav-item linkLogoNav" >
                    <NavLink to="/MainPage/Rank-Friends"  activeClassName="selectedNave" > 
                        <Icon path={mdiCrownOutline} title="Setting Profile" size={1.1}
                         className='iconeRank iconHeader' />
                    </NavLink>
                </li>

                <li className="nav-item linkLogoNav" >
                    <NavLink 
                    to='/MainPage/setting' className='navParam'   activeClassName="selectedNave"> 
                        <Icon path={mdiCogOutline} title="Setting" size={1.1}
                            className='iconeSetting iconHeader' />
                    </NavLink>
                </li>

                <li className="nav-item linkLogoNav" >
                    <NavLink  style={{ textDecoration: 'none' }}
                    to='/MainPage/historyGame' className='navParam'   activeClassName="selectedNave"> 
                        <h2>history</h2>
                    </NavLink>
                </li>

            </ul>
            <div>
            </div>

        
        
        <div className='logHeader d-flex '>
            <NavLink style={{ textDecoration: 'none' }} to='/MainPage/setting'>
            <div className="profil d-flex" >
                <h2>Frfrance</h2>
                <img  src={FF} alt="" /> 
            </div>
            </NavLink>
    </div>
    </div>
    </nav>
        <div>
       
        </div>

       
    </div>
    
    
    
    
   
    )
}

export default Header