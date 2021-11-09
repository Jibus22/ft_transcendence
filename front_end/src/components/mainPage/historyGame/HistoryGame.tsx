import React  from 'react' 
import './historyGame.scss'

import 'semantic-ui-css/semantic.min.css'
import { Input } from 'semantic-ui-react'
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { pink } from '@mui/material/colors';
import { alpha, styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';


import { useSpring, animated } from 'react-spring'

import FF from '../../homePage/section/photos/FF.png'
import JB from '../../homePage/section/photos/jb.png'


const CssTextField = styled(TextField)({
    '& label.Mui-focused': {
      color: 'black',
      
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'grey',
      },
      
      
    },
  });

const HistoryGame= () => {

        const props = useSpring({
            opacity: 1,
            transform: "translate(0px, 0px)",
            from: { opacity: 0, transform: "translate(0px, 500px)" } ,
            config: {
              delay: 400,
              duration: 500,
            },});

    return (
      
        <animated.div  style={props} className='w-100'>   
        <div className='mainHisUser  d-flex flex-column  '>
            <div className='searchCase  '>
                <h1>History</h1>
                

                <CssTextField className='myGame'  id="outlined-password-input" size='small'
                            label="My game" />


                <CssTextField className='searchBarre'  id="outlined-password-input" size='small' label="Search"
                    InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: pink[50], fontSize: 20,  }} />
                      </InputAdornment> ),}}/>

               

            </div>


            <div className='dpdInfo  '>
                <h3 className='date'>Date</h3>
                <h3 className='score'>Player</h3>
                <h3 className='time' >Duration</h3>
            </div>

            <div className='pageOverflow'>
            <div className='histUser  '>
            
            <div className='infoHistory  '>
                <div className='date '>
                        <p>01/12/2020</p>
                        <p className='time'>23 : 44</p>
                        
                </div>
                <div className='userImg'>
                    <img className='relative' src={FF} alt="" />
                    <img className='absolute' src={JB} alt="" />

                </div>

                <div className='playerScore  '>
                    <div className='player d-flex '>
                        <p>frfrance</p>
                        <p className='vs'> VS</p>
                        <p>jl-core</p>
                    </div>
                    <div className='score d-flex '>
                        <p>14</p>
                        <p>:</p>
                        <p>1</p>
                    </div>
                        
                </div>

                <div className='duration '>
                    <p>00 : 2 : 33</p>
                </div>

               
            </div>
            <hr />
            <div className='infoHistory  '>
                <div className='date '>
                        <p>01/12/2020</p>
                        <p className='time'>23 : 44</p>
                        
                </div>
                <div className='userImg'>
                    <img className='relative' src={FF} alt="" />
                    <img className='absolute' src={JB} alt="" />

                </div>

                <div className='playerScore  '>
                    <div className='player d-flex '>
                        <p>frfrance</p>
                        <p className='vs'> VS</p>
                        <p>jl-core</p>
                    </div>
                    <div className='score d-flex '>
                        <p>5</p>
                        <p>:</p>
                        <p>1</p>
                    </div>
                        
                </div>

                <div className='duration '>
                    <p>00 : 2 : 33</p>
                </div>

               
            </div>
            <hr />
            <div className='infoHistory  '>
                <div className='date '>
                        <p>01/12/2020</p>
                        <p className='time'>23 : 44</p>
                        
                </div>
                <div className='userImg'>
                    <img className='relative' src={FF} alt="" />
                    <img className='absolute' src={JB} alt="" />

                </div>

                <div className='playerScore  '>
                    <div className='player d-flex '>
                        <p>frfrancdssdsdsdsdsde</p>
                        <p className='vs'> VS</p>
                        <p>jl-coredsdsdsdsdss</p>
                    </div>
                    <div className='score d-flex '>
                        <p>14</p>
                        <p>:</p>
                        <p>1</p>
                    </div>
                        
                </div>

                <div className='duration '>
                    <p>00 : 2 : 33</p>
                </div>

               
            </div>
            <hr />
            <div className='infoHistory  '>
                <div className='date '>
                        <p>01/12/2020</p>
                        <p className='time'>23 : 44</p>
                        
                </div>
                <div className='userImg'>
                    <img className='relative' src={FF} alt="" />
                    <img className='absolute' src={JB} alt="" />

                </div>

                <div className='playerScore  '>
                    <div className='player d-flex '>
                        <p>frfrancdssdsdsdsdsde</p>
                        <p className='vs'> VS</p>
                        <p>jl-coredsdsdsdsdss</p>
                    </div>
                    <div className='score d-flex '>
                        <p>14</p>
                        <p>:</p>
                        <p>1</p>
                    </div>
                        
                </div>

                <div className='duration '>
                    <p>00 : 2 : 33</p>
                </div>

               
            </div>
            
            <hr />
            
            </div>
            </div>
     
        </div>
        </animated.div>
      
    )
}

export default HistoryGame