import * as React from "react";
import { Homepage, MainPage, Chat } from './components';
// import ErrorPage from "./components/errorPage/ErrorPage";
import { Routes, Route} from "react-router-dom";
import './app.css'


const App = () => {
  return (
    
      <div className='home App'>
        

        
        <Routes> 
          {/* <Route path='*' element={<ErrorPage />} /> */}
           <Route path='/' element={ <Homepage/> }/>
           <Route path='/*' element={ <MainPage/> }/>
       </Routes>

       <Chat />
    
      </div>
  )
}

export default App;
