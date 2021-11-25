
import React, {useState, useEffect} from 'react';
import  './mainPage.scss'
import { Routes, Route} from "react-router-dom";
import { Header, ParamUser, UserRank, HistoryGame, Game} from '..';
// import ErrorPage from '../errorPage/ErrorPage';
import axios from 'axios';


const MainPage = () => {

    const [data, setData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const result = await axios (
                'http://localhost:3000/users',
            );
            setData(result.data)
        }
        fetchData()
    }, [])




    




    
        return (
            
            <div className='mainPageBody d-flex flex-column border' >
                <div>
                    <Header data={data}/>
                </div>
                <Routes>
                    <Route path='/MainPage' element={ <Game/> }/>
                    <Route path='/History-Game' element={ <HistoryGame/> }/>
                    <Route path="/Setting" element={ <ParamUser data={data}/> }/>
                    <Route path='/Rank'element={ <UserRank/> }/>
                </Routes>
            </div>
        );
}

export default MainPage