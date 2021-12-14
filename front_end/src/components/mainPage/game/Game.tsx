import React, { useState } from 'react';
import { Socket } from "socket.io-client";
import { OnlineGame, Play } from '../..';


interface Props {
    wsStatus: Socket | undefined;
  }
export default function Game({wsStatus}: Props) {

    const[loading, setLoading] = useState<boolean>(false);
    const[isDisable, setIsDisable] = useState<boolean>(true)
    function handleClick() {
        /*
         TEST MESSAGE EMIT for ingame status: set
         TODO: add `wsStatus && wsStatus.emit('ingame', 'out');`
            when user exits game!
        */
        wsStatus && wsStatus.emit('ingame', 'in');

        setLoading(true);
        setIsDisable(false);
        setTimeout(function () {
            setLoading(false);
            setIsDisable(true);
        }, 5000);
    }



    return (
        <div className='d-flex MainGame'>
            <Play Loadingclick={handleClick} disable={isDisable} loading={loading} />
            <OnlineGame Loadingclick={handleClick} loading={loading}/>

        </div>
    )
}
