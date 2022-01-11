import Rush from './Rush';
import Runplayer from './Runplayer';

const Lateral = ({ socket, statsdata, gamedata, playerdata }) => {
    return (
        <>
            <div className='container'>
                <div className="row border">
                    <div className="d-block bg-dark text-white col-sm-12">Lateral</div>
                </div>
            </div>
            <Runplayer text='Rusher' socket={socket} statsdata={statsdata} disabled={true} gamedata={gamedata} playerdata={playerdata}/>
            <Rush socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
        </>
    )
}

export default Lateral
