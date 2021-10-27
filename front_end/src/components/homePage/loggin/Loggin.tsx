import React  from 'react' 
import './StyleLoggin.scss'
import { Link }  from 'react-router-dom';
import { Fade, Bounce } from "react-awesome-reveal";
import Button from '@mui/material/Button';


const Loggin = () => {
    return (
        <Fade delay={1800} direction='up' className='fadeWrapper'>
        <div className='wrapper '>
        <div id="formContent">
            <div className="fadeIn first">    
            <Bounce delay={2500} >
          <img width='100' src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/1200px-42_Logo.svg.png" alt="" />
          </Bounce>
        </div>
        <form className='TextLog'>
            <Link to="/MainPage">
            <Bounce delay={1300}  >
                <Button variant="contained" size="large">Sign in</Button>
                {/* <input type="submit" id="singIn" className="fadeIn fourth" value="Sign in"/> */}
                </Bounce>
             </Link>
        </form>
        <div>
        </div>
    </div> 
   
    </div>
    </Fade>
    )
}


export default Loggin