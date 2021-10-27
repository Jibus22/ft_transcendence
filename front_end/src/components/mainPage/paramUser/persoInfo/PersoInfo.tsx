import React from 'react' 
import './persoInfo.scss'
// import { BrowserRouter as Router, Link, Route, NavLink, Switch } from 'react-router-dom'
import TextField from '@mui/material/TextField';
// import {  Formik, FormikHelpers, FormikProps, Form, Field, FieldProps, } from 'formik'
import { Fade } from "react-awesome-reveal";


interface MyFormValues {
     firstName: string;
     lastName: string;
   }
   



const PersoInfo = () => {

    

    return (
        <Fade direction='up' duration={300} className=' fadeMainInfoUser'>
        <div className='infoUser '>
             
   

         
          
        <div className='columnOne'>
             <div className='infoName' >
                  <h3>First name</h3>
                  <TextField id="" size='small'  />
             </div>
             <div className='infoName' >
                  <h3>Last name</h3>
                  <TextField id="" size='small'  />
             </div>
             </div>
             <div className='columntwo'>
                 <div className='infoName' >
                      <h3>Location</h3>
                      <TextField id="" size='small'  />
                 </div>
                 <div className='infoName' >
                  <h3>Email adresse</h3>
                  <TextField id="" size='small'  />
             </div>
             </div>
             <hr />

             <div className='columnOne'>
             <div className='infoName' >
                  <h3>Preferred language</h3>
                  <TextField id="" size='small'  />
             </div>
             <div className='infoName' >
                  <h3>Webite URL</h3>
                  <TextField id="" size='small'  />
             </div>
             </div>
             <div className='columntwo'>
                 <div className='infoName infoBio' >
                      <h3>Short bio</h3>
                      <TextField
                          id="outlined-textarea"
                         multiline
                         maxRows='3'/>
                      
                 </div>
                 
             </div>
           
             
    </div>
    </Fade>
    )
}

export default PersoInfo