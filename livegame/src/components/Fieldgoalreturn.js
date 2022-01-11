import Rush from './Rush';
import Runplayer from './Runplayer';

const Fieldgoalreturn = ({ socket, statsdata, gamedata, playerdata }) => {
    return (
        <>
            <Runplayer text='Returned' socket={socket} statsdata={statsdata} disabled={true} gamedata={gamedata} playerdata={playerdata}/>
            <Rush socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
        </>
    )
}

export default Fieldgoalreturn
