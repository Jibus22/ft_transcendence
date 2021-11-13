import React, { useState, useEffect, lazy } from 'react' 
import  './mainPage.scss'
import { BrowserRouter as Router, Route} from 'react-router-dom'
import { Header, LoadingBarre, GameWindow, ParamUser, UserRank, HistoryGame, ChatRoom, OnlineGame} from '..';
import { Fade } from "react-awesome-reveal";

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
                   
                    <Route exact path='/MainPage' component={ GameWindow }></Route>
                    <Route exact path='/MainPage' component={ OnlineGame }></Route>
           

                  

                    <Route exact path='/MainPage/historyGame' component={ HistoryGame } ></Route>
                        
                    {/* <Route path={["/MainPage/setting", "/MainPage/historyGame"]} component={ParamUser} /> */}
                    <Route exact path={"/MainPage/setting"} component={ParamUser} />
                    
                    <Route exact path={'/MainPage/Rank-Friends'} component={UserRank} />


                    <Route path='/MainPage'    component={ ChatRoom }></Route>

              
                </div>
              
                    
               
                </Router>
            </div>
          
        );

    
    

}

export default MainPage