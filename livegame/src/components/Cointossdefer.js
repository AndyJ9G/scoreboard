import { useEffect, useState } from 'react';
import Button from './Button';
import Teamlogo from './Teamlogo';
import { toast } from 'react-toastify';

const Cointossdefer = ({ socket, statsdata, gamedata }) => {
    const [deferdecision, setDeferdecision] = useState('');

    // on render
    useEffect(() => {
        setDeferdecision(statsdata.cointossteamdeferdecision);
    }, [statsdata]);

    // kick
    function onClickDeferdecision(value) {
        setDeferdecision(value);
        socket.emit('playGUIupdate', { item: 'cointossteamdeferdecision', value: value });
    }

    // enter
    function enter() {
        if(!deferdecision || deferdecision === ''){
            toast.error('Please select the Decision', {autoClose: 1000, theme: 'dark'});
        }else{
            socket.emit('playGUIupdate', { item: 'enter', value: 'clicked' });
        }
    }

    return (
        <>
            <div className='container' id='cointossdefer'>
                <div className="row border">
                    <div className="d-block bg-secondary text-white col-sm-12 mb-2">Cointoss Defered</div>
                    <div className="w-100"></div>
                    <div className="col-sm-2 mb-2">
                        <label className="form-label float-right containertext">Defered Decision:</label>
                    </div>
                    <div className="col-sm-3 mb-2">
                        <Button buttonclass={statsdata.cointossteamwinner === 'team1' ? 'warning' : 'danger'}
                        text={statsdata.cointossteamwinner === 'team1' ? gamedata.team2 : gamedata.team1}/>
                    </div>
                    <div className="col-sm-1 mb-2">
			            <Teamlogo src={statsdata.cointossteamwinner === 'team1' ? gamedata.logo2 : gamedata.logo1} />
		            </div>
                    <div className="col-sm-1 mb-2">
                        <label className="form-label float-right">Decision:</label>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={deferdecision === 'kick' ? 'warning' : 'outline-warning'} text='Kick' onClick={(e) => onClickDeferdecision('kick')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={deferdecision === 'receive' ? 'success' : 'outline-success'} text='Receive' onClick={(e) => onClickDeferdecision('receive')}/>
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

export default Cointossdefer
