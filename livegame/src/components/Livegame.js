import Plays from './Plays';
import Action from './Action';
import Header from './Header';
import LiveGameHeader from './LiveGameHeader';
import GameStats from './GameStats';

const Livegame = ({socket,showPlays, showStats, selectedGame, setSelectedGame, showDrive, showField}) => {

  return (
    <div>
      <LiveGameHeader socket={socket} selectedGame={selectedGame} setSelectedGame={setSelectedGame} showField={showField}/>
      {selectedGame !== '' &&
        <>
          <Header socket={socket} showDrive={showDrive}/>
          <Plays socket={socket}/>
          {showPlays &&
            <Action socket={socket}/>
          }
          {showStats &&
            <GameStats socket={socket}/>
          }
        </>
      }
    </div>
    
  );
}

export default Livegame;
