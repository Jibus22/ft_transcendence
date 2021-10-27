import React from 'react'
import './paramUser.scss'
import {HistoryGame, PersoInfo} from '../..'
import { BrowserRouter as Router, Route, NavLink} from 'react-router-dom'

import FF from './photos/FF.png'

import { Fade } from "react-awesome-reveal";



const ParamUser = () => {
    


    return (
        
        <Router> 

        <Fade direction='up' duration={400} className='w-100'>
        
        <div className='mainParamUser d-flex'>

            <div className='ongletParamUser '>
                <h1>My setting</h1>
                <hr />
            
                <NavLink  style={{ textDecoration: 'none' }} to='/MainPage/setting' className='navInfo'   
                activeClassName="selectedNav">
                <div className='personalInfo'>
                    <h3>Personal info</h3>
                </div>
                </NavLink>
                <NavLink style={{ textDecoration: 'none' }}  to='/MainPage/historyGame' className='navHistory' 
                activeClassName="selectedNav">
                <div className='ratioInfo'>
                    <h3>Historique Game</h3>
                    
                </div>
                </NavLink>
                
            </div>
            
           
        
        <div className='ParamUser  '>
           <div className='mainProfilUser '>
               <div>
                   <img src={FF} alt="" />
               </div>
               <div className='statLoginUser'>
                    <h1>Kazuuma</h1>
                    <div className='statUser'> 
                        <div className='userPlay userStat'>
                            <h3>32</h3>
                            <h1>Game</h1>

                </div>
                <div className='userWin userStat'>
                    <h3>20</h3>
                    <h1>Victoire</h1>
                    
                </div>
                <div className='userLoose userStat'>
                    <h3>12</h3>
                    <h1>Defaite</h1>
                    
                </div>
                </div>
                </div>
           </div>
            


            <div>
            {/* <PersoInfo/> */}
            </div>

            <Route exact path='/MainPage/setting' component={ PersoInfo }></Route>
            <Route exact path='/MainPage/historyGame' component={ HistoryGame }></Route>
        
        </div>
        
        
        <div>

        </div>
        
    
       
        
       
        </div>
        </Fade>
        </Router>
        
      
    )
}


export default ParamUser