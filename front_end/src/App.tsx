import React, { FC, useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

const App: FC = () => {

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
			fetch('http://back_end_server/hello')
			.then(res => {

			  if (res.ok) {
          return res.json();
        } else {
          throw Error('Could not fetch data')
        }
			})
			.then(data => {
        setData(data);
			})
			.catch(err => {
				setError(err.message);
			})
	}, [])


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <div>
          <p>{(data && {data}) || ( error && `Could not get data... Error: ${error}`) || 'Waiting' }</p>
        </div>
      </header>
    </div>
	)
}

export default App;

