import React, { useState, useEffect } from 'react';
import './StyleLoggin.scss'
import { Link }  from 'react-router-dom';
import { Fade, Bounce } from "react-awesome-reveal";
import Lock from './other/Vector.png'

import { styled } from '@mui/material/styles';
import { purple } from '@mui/material/colors';
import Button, { ButtonProps } from '@mui/material/Button';
import axios from 'axios';



const Loggin = () => {

    let [apiLink, setApiLink] = useState<string>('');

    useEffect(() => {
        axios.get('https://api.intra.42.fr/oauth/authorize?client_id=7610cae5bea0cf5544204791cb2461c29e2d38081bcadfb36a30fa7b01531fb4&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fusers%2Fcallback&response_type=code&scope=public&state=coucou42')
        .then (response => response.data)
        .catch (err => console.log(err))
        // .then ( apiLink => setApiLink( users))

    })

    return (
    //     <Fade delay={1800} direction='up' className='fadeWrapper'>
    //     <div className='wrapper border '>
    //     <div className="formContent border">
    //         <div className="fadeIn first">
    //         <Bounce delay={2500} >
    //       <img width='100' src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/1200px-42_Logo.svg.png" alt="" />
    //       </Bounce>
    //     </div>
    //     <form className='TextLog'>
    //         <Link to="/MainPage">
    //         <Bounce delay={1300}  >
    //             <Button variant="contained" size="large">Sign in</Button>
    //             {/* <input type="submit" id="singIn" className="fadeIn fourth" value="Sign in"/> */}
    //             </Bounce>
    //          </Link>
    //     </form>
    //     <div>
    //     </div>
    // </div>

    // </div>
    // </Fade>
        <div className='mainLoggin '>
            <div className='welcome '>
                <h1>Welcome to  ft_transcendence</h1>
            </div>
            <div className='lockImg d-flex flex-column'>
                <img src={Lock} alt="" />
                <h1>Connect with 42</h1>
            </div>
            <div className='buttonConnect d-flex'>
                {/* <Link className='linkDiv' to="/MainPage"> */}
                <form className='TextLog w-100 h-100'>
                    <a href="https://api.intra.42.fr/oauth/authorize?client_id=7610cae5bea0cf5544204791cb2461c29e2d38081bcadfb36a30fa7b01531fb4&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fusers%2Fcallback&response_type=code&scope=public&state=coucou42">
                <Button className='buttonMuiConnect ' variant="contained" sx={{borderRadius: 2, textTransform: 'none' }}>Connect

                </Button>
                </a>
        </form>
                {/* </Link> */}


            </div>

        </div>
    )
}


export default Loggin
