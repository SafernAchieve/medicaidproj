import React from 'react';
import './App.css';
import DatabaseViewer from './components/DatabaseViewer';
import NYHealthData from './components/NYHealthData.jsx';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Database Viewer</h1>
      </header>
      <main>
        <DatabaseViewer />
                <NYHealthData />
      </main>
    </div>
  );
}

export default App; 