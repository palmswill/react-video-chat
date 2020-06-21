import React from 'react';
import './App.css';
import Users from './users.js'

function App() {
  
  return (
    <div>
    <div className="row" style={{height:"10vh","marginBottom":"0"}}>
    <div className="col s12 cyan lighten-5"  style={{height:"100%"}}></div>
    </div>
    <div className="row" style={{height:"90vh","marginBottom":"0"}}>
    <div className= "col s3 red lighten-3" style={{height:"100%"}}></div>
    <Users></Users>
    </div>
    </div>
  );
}

export default App;
