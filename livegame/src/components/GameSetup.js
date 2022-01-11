import GameDetails from './GameDetails';


function GameSetup({socket, selectedGame, setSelectedGame}) { 
  return (
    <div>
      <GameDetails socket={socket} selectedGame={selectedGame} setSelectedGame={setSelectedGame}/>

    </div>
  );
}

export default GameSetup;
