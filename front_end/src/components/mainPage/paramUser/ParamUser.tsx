import React, { useState, useEffect } from 'react';
import './paramUser.scss'
import TextField from '@mui/material/TextField';
import { useSpring, animated } from 'react-spring'
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

import FF from './photos/FF.png'

import AddUser from './Adduser'
import ListUser from './Listuser';
import Test from './test'
import { Formik, Field } from 'formik';
import axios, {AxiosResponse} from 'axios';
import { Agent } from 'http';


const CssTextField = styled(TextField)({
    '& label.Mui-focused': {
      color: 'black',
      
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'grey',
        borderRadius: 20,
       
      },
      
      
    },
  });


  


const ParamUser = () => {
    // const props = useSpring({
    //     opacity: 1,
    //     transform: "translate(0px, 0px)",
    //     from: { opacity: 0, transform: "translate(0px, 500px)" } ,
    //     config: {
    //       delay: 400,
    //       duration: 500,
    //     },
    //   });
    

    const [users, setUser] = useState <Array<string>>([]);
    let [selectedUser, setSlectedUser] = useState(0);
    

    useEffect(() => {
        axios.get('https://jsonplaceholder.typicode.com/users') .then (response => response.data)
                                                                .then ( users => setUser( users))
                                                                .catch (err => console.log(err))
    })
    
    return (
        
        <div style={ { minHeight: '100vh'} } className="container-fluid p-5 bg-light d-flex flex-column justify-content-center align-items-center">
            <Test></Test>
        <ListUser users={ users  } selectUser={ (index : number) => setSlectedUser(selectedUser = index ) } />  
        <hr className="w-100 my-5" />
        <AddUser user={ users && users[selectedUser] ? users[selectedUser] : null } />
        
      </div>
    
      
    )
}


export default ParamUser






 // <animated.div  style={props} className='w-100'> 
        // <div className='mainParamUser d-flex flex-column'>
        //     <div className='userImg'>
        //         <img src={FF} alt="" />
        //     </div>
        //     <div className='userStat  d-flex'>
        //         <div className='game d-flex flex-column'>
        //             <h1>32</h1>
        //             <h2>Game</h2>
        //         </div>
        //         <div className='win d-flex flex-column'>
        //             <h1>30</h1>
        //             <h2>Win</h2>
        //         </div>
        //         <div className='loose  d-flex flex-column'>
        //             <h1>2</h1>
        //             <h2>Loose</h2>
        //         </div>
        //     </div>
        //     <div className='userLoggin '>
        //         <CssTextField className='loggin'  id="outlined-password-input" size='small' label="User 42 nickname"
        //                     sx={{width: 2/2}} />
        //     </div>
        //     <div className='userQuit'>
        //         <Button variant="contained">Disconnect</Button>

        //     </div>
       
    
       
        
       
        // </div>
        // </animated.div>