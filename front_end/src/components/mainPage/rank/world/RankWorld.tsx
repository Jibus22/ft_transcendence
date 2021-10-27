import React from 'react' 
import '../userRank.scss'
import { Fade } from "react-awesome-reveal";
import FF from '../img/FF.png'
import Rank from '../img/rank-3.svg'

const RankWorld = () => {
    return (
        <Fade direction='up' duration={400} className='w-100 fadeRankFriend'>
        <div className='mainRankFriends d-flex flex-column '>
            <div className='MainUserRankdiv d-flex '>
                <div className='d-flex rankdiv rankdiv1'>
                    <img  src={Rank} alt="" className='blasonRank'/> 
                    {/* nb Rank  */}
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
                    <h1>45</h1>
                </div>
            </div>

        </div>
        </Fade>
    )
}

export default RankWorld