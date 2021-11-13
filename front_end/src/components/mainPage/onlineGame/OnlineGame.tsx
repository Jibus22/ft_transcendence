
import React from 'react'
import './onlineGame.scss'
import { useSpring, animated } from 'react-spring'
import Button from '@mui/material/Button';
import FF from '../../homePage/section/photos/FF.png'
import JB from '../../homePage/section/photos/jb.png'


const OnlineGame = () =>  {
    const props = useSpring({
        opacity: 1,
        transform: "translate(0px, 0px)",
        from: { opacity: 0, transform: "translate(0px, 500px)" } ,
        config: {
          delay: 400,
          duration: 500,
        },
      });
 



    return (
        <animated.div  style={props} className='w-100'> 
            <div className='mainOnlineGame d-flex flex-column'>
                <div className='title '>
                    <h1>Online Game</h1>
                </div>
                <div className='pageOverflow'>

                
                <div className='onlineDiv '>
                    <div className='partyOnline d-flex'>
                        <div className='userImg'>
                            <img src={FF} alt="" />
                            <img src={JB} alt="" />
                        </div>
                        <div className='userStat d-flex flex-column '>
                            <div className='player d-flex'>
                                <p>frfrance</p>
                                <p className='vs'> VS</p>
                                <p>jl-core</p>
                            </div>
                            <div className='score d-flex'>
                                <p>14</p>
                                <p>:</p>
                                <p>1</p>
                            </div> 
                        </div>
                        <div className='userWatch '>
                        <Button variant="contained"   sx={{borderRadius: 2, width: 2/2, mt: 2}}>Watch</Button>
                        </div>
                        

                
                    </div>
                    <hr />
                    
                </div>
                <div className='onlineDiv '>
                    <div className='partyOnline d-flex'>
                        <div className='userImg'>
                            <img src={FF} alt="" />
                            <img src={JB} alt="" />
                        </div>
                        <div className='userStat d-flex flex-column '>
                            <div className='player d-flex'>
                                <p>frfrance</p>
                                <p className='vs'> VS</p>
                                <p>jl-core</p>
                            </div>
                            <div className='score d-flex'>
                                <p>14</p>
                                <p>:</p>
                                <p>1</p>
                            </div> 
                        </div>
                        <div className='userWatch '>
                        <Button variant="contained"   sx={{borderRadius: 2, width: 2/2, mt: 2}}>Watch</Button>
                        </div>
                        

                
                    </div>
                    <hr />
                    
                </div>
                <div className='onlineDiv '>
                    <div className='partyOnline d-flex'>
                        <div className='userImg'>
                            <img src={FF} alt="" />
                            <img src={JB} alt="" />
                        </div>
                        <div className='userStat d-flex flex-column '>
                            <div className='player d-flex'>
                                <p>frfrance</p>
                                <p className='vs'> VS</p>
                                <p>jl-core</p>
                            </div>
                            <div className='score d-flex'>
                                <p>14</p>
                                <p>:</p>
                                <p>1</p>
                            </div> 
                        </div>
                        <div className='userWatch '>
                        <Button variant="contained"   sx={{borderRadius: 2, width: 2/2, mt: 2}}>Watch</Button>
                        </div>
                        

                
                    </div>
                    <hr />
                    
                </div>
                <div className='onlineDiv '>
                    <div className='partyOnline d-flex'>
                        <div className='userImg'>
                            <img src={FF} alt="" />
                            <img src={JB} alt="" />
                        </div>
                        <div className='userStat d-flex flex-column '>
                            <div className='player d-flex'>
                                <p>frfrance</p>
                                <p className='vs'> VS</p>
                                <p>jl-core</p>
                            </div>
                            <div className='score d-flex'>
                                <p>14</p>
                                <p>:</p>
                                <p>1</p>
                            </div> 
                        </div>
                        <div className='userWatch '>
                        <Button variant="contained"   sx={{borderRadius: 2, width: 2/2, mt: 2}}>Watch</Button>
                        </div>
                        

                
                    </div>
                    <hr />
                    
                </div>
                <div className='onlineDiv '>
                    <div className='partyOnline d-flex'>
                        <div className='userImg'>
                            <img src={FF} alt="" />
                            <img src={JB} alt="" />
                        </div>
                        <div className='userStat d-flex flex-column '>
                            <div className='player d-flex'>
                                <p>frfrance</p>
                                <p className='vs'> VS</p>
                                <p>jl-core</p>
                            </div>
                            <div className='score d-flex'>
                                <p>14</p>
                                <p>:</p>
                                <p>1</p>
                            </div> 
                        </div>
                        <div className='userWatch '>
                        <Button variant="contained"   sx={{borderRadius: 2, width: 2/2, mt: 2}}>Watch</Button>
                        </div>
                        

                
                    </div>
                    <hr />
                    
                </div>
                <div className='onlineDiv '>
                    <div className='partyOnline d-flex'>
                        <div className='userImg'>
                            <img src={FF} alt="" />
                            <img src={JB} alt="" />
                        </div>
                        <div className='userStat d-flex flex-column '>
                            <div className='player d-flex'>
                                <p>frfrance</p>
                                <p className='vs'> VS</p>
                                <p>jl-core</p>
                            </div>
                            <div className='score d-flex'>
                                <p>14</p>
                                <p>:</p>
                                <p>1</p>
                            </div> 
                        </div>
                        <div className='userWatch '>
                        <Button variant="contained"   sx={{borderRadius: 2, width: 2/2, mt: 2}}>Watch</Button>
                        </div>
                        

                
                    </div>
                    <hr />
                    </div>
                </div>
            </div>
        </animated.div>
    )
}

export default OnlineGame