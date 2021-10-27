import React, { useState, useEffect, lazy } from 'react' 
import  './mainPage.scss'
import { BrowserRouter as Router, Route} from 'react-router-dom'
import { Header, ChatRoom, GameWindow, ParamUser, UserRank, HistoryGame} from '..';


const MainPage = () => {
    // var [loading, setLoading] = useState(true);
    
  

    // useEffect(() => {
        
    //     setTimeout(() => {
            
    //         setLoading(loading = false)
    //     }, 2900);
    //   });


    // if (loading == true) {
    //     return <LoadingBarre/>
    // }
   

        return (
            
            <div className='mainPageBody d-flex flex-column' >
            <Router> 
                <div>
                    <Route  path='/MainPage'  component={ Header }></Route>
                </div>
                <div className='d-flex '>
                    <Route exact path='/MainPage/home' component={ GameWindow }></Route>
                    <Route exact path='/MainPage/home' component={ ChatRoom }></Route>

                    <Route exact path='/MainPage/historyGame' component={ HistoryGame } ></Route>
                        
                    {/* <Route path={["/MainPage/setting", "/MainPage/historyGame"]} component={ParamUser} /> */}
                    <Route path={"/MainPage/setting"} component={ParamUser} />
                    <Route path={'/MainPage/Rank-Friends'} component={UserRank} />
              
                </div>
                
                </Router>
            </div>
          
        );

    
    

}

export default MainPage