import React from 'react' 
import './StyleHomePage.scss'
import { TitlePage, Loggin , Section} from '..';


export default function Homepage(){
        return ( 
        <div  className='App mainHome d-flex flex-column justify-content-between pt-5 border'>
      <div className="bg"></div>
      <div className="bg bg2"></div>
      <div className="bg bg3"></div>
      <div  className='Home d-flex '>
        <div className='d-flex flex-column  w-100 '>
        <TitlePage/>
        <Section/>
        </div>
        <Loggin/>
      </div>
    </div>
    )
    
}
