import React from 'react' 
import '../userRank.scss'
import { useSpring, animated } from 'react-spring'
import FF from '../img/FF.png'


import Button from '@mui/material/Button';

const Rankfriends = () => {
    const props = useSpring({
        opacity: 1,
        transform: "translate(0px, 0px)",
        from: { opacity: 0, transform: "translate(0px, 0px)" } ,
        config: {
      
          duration: 10,
        },
      });
   
   
    return (
        <animated.div  style={props} className='w-100'> 
        <div className='mainRankFriends d-flex flex-column '>
            <div className='MainUserRankdiv d-flex'>
                <div className='d-flex rankdiv rankdiv1'>
                    {/* <img  src={Rank} alt="" className='blasonRank'/>  */}
                
                    <h1 className='nbRank'>1</h1>
                    <img src={FF} alt="" className='photoRankUser' />
                    <h1 className='logginUser'>Frfrance</h1>
                </div>
                <div className='d-flex rankdiv rankdiv2'> 
                    <div className='d-flex flex-column  '>
                        <h1 className='statUser winUser'>Victory</h1>
                        
                        <h3 className='nbStat'>15</h3>
                    </div>
                    <div className='d-flex flex-column '>
                        <h1 className='statUser loosetUser'>Defeat</h1>
                        <h3 className='nbStat'>4</h3>
                     </div>
                     <div className='d-flex flex-column  '>
                        <h1 className='statUser gameUser'>Game</h1>
                        <h3 className='nbStat'>19</h3>
                    </div>
                </div>
                <div className='rankdiv rankdiv3'>
                     <Button variant="contained"   sx={{width: 2/2, borderRadius: 2}}>Challenge</Button>
                </div>
            </div>
            <div className='MainUserRankdiv d-flex'>
                <div className='d-flex rankdiv rankdiv1'>
                    {/* <img  src={Rank} alt="" className='blasonRank'/>  */}
                
                    <h1 className='nbRank'>1</h1>
                    <img src={FF} alt="" className='photoRankUser' />
                    <h1 className='logginUser'>Frfrance</h1>
                </div>
                <div className='d-flex rankdiv rankdiv2'> 
                    <div className='d-flex flex-column  '>
                        <h1 className='statUser winUser'>Victory</h1>
                        
                        <h3 className='nbStat'>15</h3>
                    </div>
                    <div className='d-flex flex-column '>
                        <h1 className='statUser loosetUser'>Defeat</h1>
                        <h3 className='nbStat'>4</h3>
                     </div>
                     <div className='d-flex flex-column  '>
                        <h1 className='statUser gameUser'>Game</h1>
                        <h3 className='nbStat'>19</h3>
                    </div>
                </div>
                <div className='rankdiv rankdiv3'>
                <Button variant="contained"   sx={{width: 2/2, borderRadius: 2}}>Challenge</Button>
                </div>
            </div>
            <div className='MainUserRankdiv d-flex'>
                <div className='d-flex rankdiv rankdiv1'>
                    {/* <img  src={Rank} alt="" className='blasonRank'/>  */}
                
                    <h1 className='nbRank'>1</h1>
                    <img src={FF} alt="" className='photoRankUser' />
                    <h1 className='logginUser'>Frfrance</h1>
                </div>
                <div className='d-flex rankdiv rankdiv2'> 
                    <div className='d-flex flex-column  '>
                        <h1 className='statUser winUser'>Victory</h1>
                        
                        <h3 className='nbStat'>15</h3>
                    </div>
                    <div className='d-flex flex-column '>
                        <h1 className='statUser loosetUser'>Defeat</h1>
                        <h3 className='nbStat'>4</h3>
                     </div>
                     <div className='d-flex flex-column  '>
                        <h1 className='statUser gameUser'>Game</h1>
                        <h3 className='nbStat'>19</h3>
                    </div>
                </div>
                <div className='rankdiv rankdiv3'>
                <Button variant="contained"   sx={{width: 2/2, borderRadius: 2}}>Challenge</Button>
                </div>
            </div>
            <div className='MainUserRankdiv d-flex'>
                <div className='d-flex rankdiv rankdiv1'>
                    {/* <img  src={Rank} alt="" className='blasonRank'/>  */}
                
                    <h1 className='nbRank'>1</h1>
                    <img src={FF} alt="" className='photoRankUser' />
                    <h1 className='logginUser'>Frfrance</h1>
                </div>
                <div className='d-flex rankdiv rankdiv2'> 
                    <div className='d-flex flex-column  '>
                        <h1 className='statUser winUser'>Victory</h1>
                        
                        <h3 className='nbStat'>15</h3>
                    </div>
                    <div className='d-flex flex-column '>
                        <h1 className='statUser loosetUser'>Defeat</h1>
                        <h3 className='nbStat'>4</h3>
                     </div>
                     <div className='d-flex flex-column  '>
                        <h1 className='statUser gameUser'>Game</h1>
                        <h3 className='nbStat'>19</h3>
                    </div>
                </div>
                <div className='rankdiv rankdiv3'>
                <Button variant="contained"   sx={{width: 2/2, borderRadius: 2}}>Challenge</Button>
                </div>
            </div>
            <div className='MainUserRankdiv d-flex'>
                <div className='d-flex rankdiv rankdiv1'>
                    {/* <img  src={Rank} alt="" className='blasonRank'/>  */}
                
                    <h1 className='nbRank'>1</h1>
                    <img src={FF} alt="" className='photoRankUser' />
                    <h1 className='logginUser'>Frfrance</h1>
                </div>
                <div className='d-flex rankdiv rankdiv2'> 
                    <div className='d-flex flex-column  '>
                        <h1 className='statUser winUser'>Victory</h1>
                        
                        <h3 className='nbStat'>15</h3>
                    </div>
                    <div className='d-flex flex-column '>
                        <h1 className='statUser loosetUser'>Defeat</h1>
                        <h3 className='nbStat'>4</h3>
                     </div>
                     <div className='d-flex flex-column  '>
                        <h1 className='statUser gameUser'>Game</h1>
                        <h3 className='nbStat'>19</h3>
                    </div>
                </div>
                <div className='rankdiv rankdiv3'>
                <Button variant="contained"   sx={{width: 2/2, borderRadius: 2}}>Challenge</Button>
                </div>
            </div>

            <div className='MainUserRankdiv d-flex'>
                <div className='d-flex rankdiv rankdiv1'>
                    {/* <img  src={Rank} alt="" className='blasonRank'/>  */}
                
                    <h1 className='nbRank'>1</h1>
                    <img src={FF} alt="" className='photoRankUser' />
                    <h1 className='logginUser'>Frfrance</h1>
                </div>
                <div className='d-flex rankdiv rankdiv2'> 
                    <div className='d-flex flex-column  '>
                        <h1 className='statUser winUser'>Victory</h1>
                        
                        <h3 className='nbStat'>15</h3>
                    </div>
                    <div className='d-flex flex-column '>
                        <h1 className='statUser loosetUser'>Defeat</h1>
                        <h3 className='nbStat'>4</h3>
                     </div>
                     <div className='d-flex flex-column  '>
                        <h1 className='statUser gameUser'>Game</h1>
                        <h3 className='nbStat'>19</h3>
                    </div>
                </div>
                <div className='rankdiv rankdiv3'>
                    <Button variant="contained"   sx={{width: 2/2, borderRadius: 2}}>Challenge</Button>
                </div>
            </div>

        </div>
        </animated.div>
     
    )
}

export default Rankfriends