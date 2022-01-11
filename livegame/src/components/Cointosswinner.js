import { useEffect, useState } from 'react';
import Button from './Button';
import Teamlogo from './Teamlogo';
import { toast } from 'react-toastify';

const Cointosswinner = ({ socket, statsdata, gamedata }) => {
    const [winner, setWinner] = useState('');

    // on render
    useEffect(() => {
        setWinner(statsdata.cointossteamwinner);
    }, [statsdata]);

    // winner
    function onClickWinner(value) {
        setWinner(value);
        socket.emit('playGUIupdate', { item: 'cointossteamwinner', value: value });
    }

    // enter
    function enter() {
        if(winner === ''){
            toast.error('Please select one Team', {autoClose: 1000, theme: 'dark'});
        }else{
            socket.emit('playGUIupdate', { item: 'enter', value: 'clicked' });
        }
    }

    return (
        <>
            <div className='container' id='cointosswinner'>
                <div className="row border">
                    <div className="d-block bg-info text-white col-sm-12 mb-2">Cointoss Winner</div>
                    <div className="w-100"></div>
                    <div className="col-sm-2 mb-2"></div>
                    <div className="col-sm-1 mb-2">
			            <Teamlogo src={gamedata.logo1} />
		            </div>
                    <div className="col-sm-3 mb-2">
                        <Button buttonclass={winner === 'team1' ? 'danger' : 'outline-danger'} text={gamedata.team1} onClick={(e) => onClickWinner('team1')}/>
                    </div>
                    <div className="col-sm-3 mb-2">
                        <Button buttonclass={winner === 'team2' ? 'warning' : 'outline-warning'} text={gamedata.team2} onClick={(e) => onClickWinner('team2')}/>
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

export default Cointosswinner
