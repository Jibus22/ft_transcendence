import * as React from "react";
import { Homepage, MainPage, Chat } from './components';
// import ErrorPage from "./components/errorPage/ErrorPage";
import { Routes, Route } from 'react-router-dom';

import { MainPageProvider } from './MainPageContext';
import './app.css';

const App = () => {
	return (
		<MainPageProvider>
			<div className="home App">
				<Routes>
					{/* <Route path='*' element={<ErrorPage />} /> */}
					<Route path="/" element={<Homepage />} />
					<Route path="/*" element={(<><MainPage /><Chat /></>)} />
				</Routes>
			</div>
		</MainPageProvider>
	);
};

export default App;
