
import React, {useState, useEffect} from 'react';
import  './mainPage.scss'
import { Routes, Route} from "react-router-dom";
import { Header, ParamUser, UserRank, HistoryGame, Game} from '..';
// import ErrorPage from '../errorPage/ErrorPage';
import axios from 'axios';
import { io, Socket } from "socket.io-client";


const MainPage = () => {


    const [wsStatus, setWsStatus] = useState<Socket | undefined>(undefined);
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
        })
        .then((response) => {
            const {token} = response.data;
            if (!token) {
                throw new Error('no valid token');
            }
            const socket = io("ws://localhost:3000",
            {
                auth: {
                   "key": token
                }
            });

            socket.on("connect_error", (err) => {
                setWsStatus(undefined);
                console.log(`ws connect_error due to ${err.message}`);
            });

            socket.on("connect", () => {
                setWsStatus(socket);
                console.log(`WS CONNECTED`)
            });
            socket.on("disconnect", () => {
                setWsStatus(undefined);
                console.log(`WS DISCONNECTED`)
            });
        })
        .catch((error) => {
            setWsStatus(undefined);
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
                    <Route path='/MainPage' element={ <Game wsStatus={wsStatus}/> }/>
                    <Route path='/History-Game' element={ <HistoryGame/> }/>
                    <Route path="/Setting" element={ <ParamUser data={data} fetchData={fetchData} /> }/>
                    <Route path='/Rank/*'element={ <UserRank/> }/>
                </Routes>


            </div>
        );
}

export default MainPage
