import Rush from './Rush';
import Runplayer from './Runplayer';

const Intercepted = ({ socket, statsdata, gamedata, playerdata }) => {
    return (
        <>
            <div className='container'>
                <div className="row border">
                    <div className="d-block bg-danger text-white col-sm-12">Intercepted</div>
                </div>
            </div>
            <Runplayer text='Returned' socket={socket} statsdata={statsdata} disabled={true} gamedata={gamedata} playerdata={playerdata}/>
            <Rush socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
        </>
    )
}

export default Intercepted
