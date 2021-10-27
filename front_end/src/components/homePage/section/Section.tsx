import React from 'react' 
import './StyleSection.css'
import FF from './photos/FF.png'
import MA from './photos/mateo.png'
import JB from './photos/jb.png'
import VG from './photos/VG.png'
import BG from './photos/BG.png'

import { Fade } from "react-awesome-reveal";

const Section = () => {
    return (
        <div className="Section d-flex ">
        <div className=" listProfil  d-flex flex-column ">
            <div className=" profil profil1  ">
            <Fade direction='left' delay={2200}>  
                <img  src={FF} alt="" /> 
                <div className='info'>
                    <p>Frfrance</p>
                    <hr />
                    <p>Front-end developper</p>
                </div>
                </Fade>   
             </div>
             
             <div className=" profil profil2  ">
             <Fade direction='left' delay={2800}> 
                <img src={JB} alt="" /> 
                <div className='info'>
                    <p>Jle-corr</p>
                    <hr />
                    <p>Back-end developper</p>
                </div>
                </Fade>
             </div>
             <div className=" profil profil3  ">
             <Fade direction='left' delay={3200}> 
                <img  src={MA} alt="" /> 
                <div className='info'>
                    <p>Mrouchy</p>
                    <hr />
                    <p>Back-end  developper</p>
                </div>
                </Fade>
             </div>
             
        </div>
        <div className='listProfil2'>
            <div className=" profil profil4  ">
             <Fade direction='left' delay={3200}> 
                <img  src={VG} alt="" /> 
                <div className='info'>
                    <p>Vgoldman</p>
                    <hr />
                    <p>Front-end  developper</p>
                </div>
                </Fade>
             </div>
             <div className=" profil profil5  ">
             <Fade direction='left' delay={3200}> 
                <img  src={BG} alt="" /> 
                <div className='info'>
                    <p>Bvalette</p>
                    <hr />
                    <p>Back-end  developper</p>
                </div>
                </Fade>
             </div>
        </div>
    </div>
)
}

export default Section