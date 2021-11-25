import React, {useState } from 'react';

import { Play, OnlineGame } from '../..';


export default function Game() {

    const[loading, setLoading] = useState<boolean>(false);
    const[isDisable, setIsDisable] = useState<boolean>(true)
    function handleClick() {
        setLoading(true);
        setIsDisable(false);
        setTimeout(function () {
            setLoading(false);
            setIsDisable(true);
        }, 5000);
    }

    

    return (
        <div className='d-flex'>
            <Play Loadingclick={handleClick} disable={isDisable} loading={loading} />
            <OnlineGame Loadingclick={handleClick} loading={loading}/>
          
        </div>
    )
}