import React  from 'react' 
import './historyGame.scss'

import 'semantic-ui-css/semantic.min.css'
import { Input } from 'semantic-ui-react'
import { Fade } from "react-awesome-reveal";

import FF from '../../homePage/section/photos/FF.png'
import JB from '../../homePage/section/photos/jb.png'


const InputN = () => <Input className='myGameBar' 
           transparent={true} 
placeholder='My game' />

const InputSearch = () => <Input className='searchBar' icon='search'
            iconPosition='left' transparent={true} 
placeholder='Search...' />

const HistoryGame= () => {

  

    return (
      
        <Fade direction='up' duration={300} className='w-100'>
            
        <div className='mainHisUser  d-flex flex-column  '>
            <div className='searchCase '>
              
                <InputN/>
                <InputSearch />

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
         </Fade>
      
    )
}

export default HistoryGame