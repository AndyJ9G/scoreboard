import { useEffect, useState } from 'react';
import Button from './Button';
import Teamlogo from './Teamlogo';
import { toast } from 'react-toastify';

const Halftime = ({ socket, statsdata, gamedata }) => {
    const [kickteam, setKickteam] = useState('');

    // on render
    useEffect(() => {
        setKickteam(statsdata.halftimekickteam);
    }, [statsdata]);

    // winner
    function onClickKickteam(value) {
        setKickteam(value);
        socket.emit('playGUIupdate', { item: 'halftimekickteam', value: value });
    }

    // enter
    function enter() {
        if(kickteam === ''){
            toast.error('Please select one Team', {autoClose: 1000, theme: 'dark'});
        }else{
            socket.emit('playGUIupdate', { item: 'enter', value: 'clicked' });
        }
    }

    return (
        <>
            <div className='container' id='halftimekickteam'>
                <div className="row border">
                    <div className="d-block bg-info text-white col-sm-12 mb-2">Who is kicking after Halftime</div>
                    <div className="w-100"></div>
                    <div className="col-sm-2 mb-2"></div>
                    <div className="col-sm-1 mb-2">
			            <Teamlogo src={gamedata.logo1} />
		            </div>
                    <div className="col-sm-3 mb-2">
                        <Button buttonclass={kickteam === 'team1' ? 'danger' : 'outline-danger'} text={gamedata.team1} onClick={(e) => onClickKickteam('team1')}/>
                    </div>
                    <div className="col-sm-3 mb-2">
                        <Button buttonclass={kickteam === 'team2' ? 'warning' : 'outline-warning'} text={gamedata.team2} onClick={(e) => onClickKickteam('team2')}/>
                    </div>
                    <div className="col-sm-1 mb-2">
			            <Teamlogo src={gamedata.logo2} />
		            </div>

                    <div className="w-100"></div>
                    <div className="col-sm-8 mb-2"></div>
                    <div className="col-sm-4 mb-2">
                        <Button buttonclass='success' text='Enter' onClick={enter}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Halftime
