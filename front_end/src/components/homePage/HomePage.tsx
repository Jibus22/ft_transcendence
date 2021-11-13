import React from 'react' 
import './StyleHomePage.scss'
import { TitlePage, Loggin, Footer, Section} from '..';


const Homepage = () => {
        return ( 
        <div  className='App mainHome d-flex flex-column justify-content-between pt-5'>
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
      {/* <div className=''>
        <Footer/>
      </div> */}
    </div>
    )
    
}

export default Homepage
