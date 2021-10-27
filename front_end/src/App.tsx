import React  from 'react';
import { Homepage, MainPage } from './components';

import { BrowserRouter as Router, Route, Switch}  from 'react-router-dom';

const App = () => {
  return (
    <Router> 
      <div className=' home'>
        <Switch> 
           <Route exact path='/' component={Homepage}/>
           <Route path='/MainPage' component={ MainPage}/>
           {/* <Route component={ErrorPage}/> */}
       </Switch>
      </div>
      </Router>
  )
}

export default App;
