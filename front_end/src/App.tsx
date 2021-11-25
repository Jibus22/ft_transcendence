import * as React from "react";
import { Homepage, MainPage } from './components';
// import ErrorPage from "./components/errorPage/ErrorPage";
import { Routes, Route} from "react-router-dom";



const App = () => {
  return (
    
      <div className='home'>
   

        
        <Routes> 
          {/* <Route path='*' element={<ErrorPage />} /> */}
           <Route path='/' element={ <Homepage/> }/>
           <Route path='/*' element={ <MainPage/> }/>
       </Routes>
    
      </div>
  )
}

export default App;
