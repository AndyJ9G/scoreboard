import { useState } from 'react';
import io from "socket.io-client";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useRoutes} from 'hookrouter';
import Navigation from './components/Navigation';
import Livegame from './components/Livegame';
import TeamSetup from "./components/TeamSetup";
import GameSetup from "./components/GameSetup";

const socket = io.connect('/');

function App() {
  const [showPlays, setShowPlays] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showDrive, setShowDrive] = useState(false);
  const [showField, setShowField] = useState(false);
  const [selectedGame, setSelectedGame] = useState('');

  const routes = {
    '/' : ()=> <GameSetup socket={socket} selectedGame={selectedGame} setSelectedGame={setSelectedGame}/>,
    '/livegame' : ()=>
      <Livegame socket={socket}
        showPlays={showPlays} showStats={showStats}
        selectedGame={selectedGame} setSelectedGame={setSelectedGame}
        showDrive={showDrive} showField={showField}
      />,
    '/teamsetup' : ()=><TeamSetup socket={socket}/>,
    '/gamesetup' : ()=><GameSetup socket={socket} selectedGame={selectedGame} setSelectedGame={setSelectedGame}/>,
  };
  const routeResults = useRoutes(routes);

  return (
    <div className='App container'>
      <div className='row'>
        <div className="col-sm-12">
          <Navigation
            socket={socket}
            showPlays={showPlays} setShowPlays={setShowPlays}
            showStats={showStats} setShowStats={setShowStats}
            selectedGame={selectedGame} setSelectedGame={setSelectedGame}
            showDrive={showDrive} setShowDrive={setShowDrive}
            showField={showField} setShowField={setShowField}
          />
          {routeResults || <h1>PAGE NOT FOUND</h1>}

          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default App;
