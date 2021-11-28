import React, {useState, useEffect} from 'react';
import './header.scss'

import {NavLink as Link } from "react-router-dom"
import { Badge, Avatar } from '@mui/material';


interface TypeCategoriesProps {
    data: Array<Type>;
}
interface Type {
    id: number; login: string; photo_url: string;
  }

export default function Header({ data }: TypeCategoriesProps){

    const [userName, setUserName] = useState('');
    const [userImg, setUserImg] = useState('');
    
    useEffect(() => {
        data.map(item => (
            setUserName(item.login),
            setUserImg(item.photo_url)
        
        ))
    });

   
    return (
      
    <div className=' d-flex flex-column mainHeader '>
    <nav className="navbar navbar-expand-lg  menuHeader ">
        <div className="d-flex  mainNavMenu">
            <ul className="navbar-nav headerMenu  w-100 ">
                <li className="nav-item  linkLogoNav">
                    <Link className={(navData) => navData.isActive ? "selectedNave" : "" } to="/MainPage" >
                            <h1>Games</h1>
                    </Link>
                </li>
                
                <li className="nav-item leaderDiv  " >
                    <Link className={(navData) => navData.isActive ? "selectedNave" : "" } to="/Rank" >
                         <h1>LeaderBoard</h1>
                    </Link>
                </li>

                <li className="nav-item linkLogoNav " >
                    <Link className={(navData) => navData.isActive ? "selectedNave" : "" } to="/History-Game" >
                         <h1>History</h1>
                    </Link>
                </li>
            </ul>
            </div>
        
        <div className='logHeader d-flex '>
          
            <Link className={(navData) => navData.isActive ? "active" : "" } to="/Setting" >
            <div className="profil d-flex   " >
                <div className='profilLoggin  '>
                    <h2 className=''>{userName}</h2>
                </div>
                <div className='profilLogginImg '>
                
                <Badge  overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"  sx={{  }}>
                   <Avatar alt="userImg" src={userImg}  />
                </Badge>
                    
                </div>
            </div>
            </Link>
            
        </div>
   
    </nav>
        <div>
       
        </div>

       
    </div>
    
    
    
    
   
    )
}
