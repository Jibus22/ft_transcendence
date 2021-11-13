import React from 'react' 
import './StyleSection.scss'
import FF from './photos/FF.png'
import MA from './photos/mateo.png'
import JB from './photos/jb.png'
import VG from './photos/VG.png'
import BG from './photos/BG.png'

import { Fade } from "react-awesome-reveal";

const Section = () => {
    return (
        <div className="Section d-flex">
        <div className=" listProfil  d-flex flex-column ">
            <div className=" profil profil1  ">
            
                <img  src={FF} alt="" /> 
                <div className='info '>
                    <h3>Frfrance</h3>
                    <p>Front-end Developer</p>
                </div>
              
             </div>
             
             <div className=" profil profil2  ">
        
                <img src={JB} alt="" /> 
                <div className='info'>
                    <h3>Jle-corr</h3>
                    <p>Back-end Developer</p>
                </div>
            
             </div>
             <div className=" profil profil3  ">
             
                <img  src={MA} alt="" /> 
                <div className='info'>
                    <h3>Mrouchy</h3>
                    <p>Back-end  Developer</p>
                </div>
           
             </div>
             
        </div>
        <div className='listProfil2'>
            <div className=" profil profil4  ">
             
                <img  src={VG} alt="" /> 
                <div className='info'>
                    <h3>Vgoldman</h3>
                    <p>Front-end Developer</p>
                </div>
                
             </div>
             <div className=" profil profil5  ">
             
                <img  src={BG} alt="" /> 
                <div className='info'>
                    <h3>Bvalette</h3>
                    <p>Back-end Developer</p>
                </div>
                
             </div>
        </div>
    </div>
)
}

export default Section