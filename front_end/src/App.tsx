<<<<<<< HEAD
import * as React from "react";
import { Homepage, MainPage, Chat } from './components';
=======
import * as React from 'react';
import { Homepage, MainPage } from './components';
>>>>>>> dev
// import ErrorPage from "./components/errorPage/ErrorPage";
import { Routes, Route } from 'react-router-dom';

import { MainPageProvider } from './MainPageContext';
import './app.css';

const App = () => {
<<<<<<< HEAD
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
=======
	return (
		<MainPageProvider>
			<div className="home App">
				<Routes>
					{/* <Route path='*' element={<ErrorPage />} /> */}
					<Route path="/" element={<Homepage />} />
					<Route path="/*" element={<MainPage />} />
				</Routes>
			</div>
		</MainPageProvider>
	);
};
>>>>>>> dev

export default App;
