import React, { useState } from 'react';
import './paramUser.scss'
import {Switch, FormControlLabel, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LCB from './photos/Corbeille.png'
import LUP from './photos/bi_upload.png'
import L42 from './photos/Logo42.png'
import LDE from './photos/LogoDee.png'
import LCL from './photos/close-icon.png'
import { styled } from '@mui/material/styles';

export interface Props {
    printPopup: () => void;

}

export default function PopUpUser({ printPopup }: Props) {


    const [ isPicture, setIsPicture] = useState('');
    const [isSrc, setIsSrc] = useState('');

   


    const Input = styled('input')({
        display: 'none',
      });

    return (
        <div className="mainPopUpUser d-flex">
            <div className="buttonPopUp deletPop">
            <IconButton sx={{width: 2/2, height: 2/2}} className="" >
                <img src={LCB} alt="" />
            </IconButton>
            </div>
            <div className="buttonPopUp 42Pop">
            <IconButton sx={{width: 2/2, height: 2/2}} className="" >
                 <img src={L42} alt="" />
            </IconButton>
            </div>
            <div className="buttonPopUp deePop">
            <IconButton sx={{width: 2/2, height: 2/2}} className="" >
                <img src={LDE} alt="" />
            </IconButton>
            </div>
            <div className="buttonPopUp dlPop">


            {/* <input type="file" name="file" onChange={changeHandler} className='inputImg' /> */}

            
            {/* <label htmlFor="contained-button-file">
            <Input accept="image/*" id="contained-button-file" multiple type="file" />
                <IconButton sx={{width: 2/2, height: 2/2}} component="span" >
                    <img src={LUP} alt="" />
                </IconButton> 
      </label> */}
            
            <IconButton sx={{width: 2/2, height: 2/2}} component="span" >
                <img src={LUP} alt="" />
            </IconButton>  
            </div>
           
            <div className="buttonPopUp closePop" onClick={printPopup}>
                <img src={LCL} alt="" />
            </div>
          </div>
    )
}

