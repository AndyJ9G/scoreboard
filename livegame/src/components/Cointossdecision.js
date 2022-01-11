import { useEffect, useState } from 'react';
import Button from './Button';
import Teamlogo from './Teamlogo';
import { toast } from 'react-toastify';

const Cointossdecision = ({ socket, statsdata, gamedata }) => {
    const [decision, setDecision] = useState('');

    // on render
    useEffect(() => {
        setDecision(statsdata.cointossteamdecision);
    }, [statsdata]);

    // kick
    function onClickDecision(value) {
        setDecision(value);
        socket.emit('playGUIupdate', { item: 'cointossteamdecision', value: value });
    }

    // enter
    function enter() {
        if(!decision || decision === ''){
            toast.error('Please select the Decision', {autoClose: 1000, theme: 'dark'});
        }else{
            socket.emit('playGUIupdate', { item: 'enter', value: 'clicked' });
        }
    }

    return (
        <>
            <div className='container' id='cointossdecision'>
                <div className="row border">
                    <div className="d-block bg-info text-white col-sm-12 mb-2">Cointoss Decision</div>
                    <div className="w-100"></div>
                    <div className="col-sm-1 mb-2">
                        <label className="form-label float-right containertext">Winner:</label>
                    </div>
                    <div className="col-sm-3 mb-2">
                        <Button buttonclass={statsdata.cointossteamwinner === 'team1' ? 'danger' : 'warning'}
                        text={statsdata.cointossteamwinner === 'team1' ? gamedata.team1 : gamedata.team2}/>
                    </div>
                    <div className="col-sm-1 mb-2">
			            <Teamlogo src={statsdata.cointossteamwinner === 'team1' ? gamedata.logo1 : gamedata.logo2} />
		            </div>
                    <div className="col-sm-1 mb-2">
                        <label className="form-label float-right">Decision:</label>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={decision === 'kick' ? 'warning' : 'outline-warning'} text='Kick' onClick={(e) => onClickDecision('kick')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={decision === 'receive' ? 'success' : 'outline-success'} text='Receive' onClick={(e) => onClickDecision('receive')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={decision === 'defer' ? 'secondary' : 'outline-secondary'} text='Defer' onClick={(e) => onClickDecision('defer')}/>
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

export default Cointossdecision
