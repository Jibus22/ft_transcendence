import React, {  } from 'react';
import './paramUser.scss'
import {IconButton } from '@mui/material';
import LCB from './photos/Corbeille.png'
import LUP from './photos/bi_upload.png'
import L42 from './photos/Logo42.png'
import LDE from './photos/LogoDee.png'
import LCL from './photos/close-icon.png'

export interface Props {
    printPopup: () => void;

}

export default function PopUpUser({ printPopup }: Props) {

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

