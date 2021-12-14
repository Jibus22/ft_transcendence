
import React, {useState, useEffect} from 'react';
import  './mainPage.scss'
import { Routes, Route} from "react-router-dom";
import { Header, ParamUser, UserRank, HistoryGame, Game} from '..';
// import ErrorPage from '../errorPage/ErrorPage';
import axios from 'axios';
import { io } from "socket.io-client";


const MainPage = () => {


    const [data, setData] = useState([]);

    const fetchData = async () => {
        const result = await axios (
            'http://localhost:3000/users', {withCredentials: true}
        );
        setData(result.data);
    }

    const connectWsStatus = async () => {
        await axios ('http://localhost:3000/auth/ws/token', {
            withCredentials: true
        }).then((response) => {
            const {token} = response.data;
            console.log('ws:', token);
            if (!token) {
                throw 'no valid token';
            }
            const socket = io("ws://localhost:3000",
            {
                auth: {
                   "key": token
                }
            });

            socket.on("connect_error", (err) => {
                console.log(`connect_error due to ${err.message}`);
            });

            socket.on("connect", () => console.log(`CONNECTED`));
            socket.on("disconnect", () => console.log(`DISCONNECTED`));
        })
        .catch((error) => {
            console.log(error);
        });
    }

        useEffect(() => {
            fetchData();
            connectWsStatus();
        }, [])


        return (

            <div className='mainPageBody d-flex flex-column ' >
                <div>
                    <Header data={data}/>
                </div>

                <Routes >
                    <Route path='/MainPage' element={ <Game/> }/>
                    <Route path='/History-Game' element={ <HistoryGame/> }/>
                    <Route path="/Setting" element={ <ParamUser data={data} fetchData={fetchData} /> }/>
                    <Route path='/Rank/*'element={ <UserRank/> }/>
                </Routes>


            </div>
        );
}

export default MainPage
