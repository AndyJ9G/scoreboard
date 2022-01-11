import { useEffect, useState } from 'react';
import Teamlogo from './Teamlogo';
import Button from './Button';
import { toast } from 'react-toastify';
import InputPlayer from './InputPlayer';

const Player = ({ text, value, team, disabled, gamedata, playerdata, onChange, onClick}) => {
    const [team1players, setTeam1players] = useState([]);
    const [team2players, setTeam2players] = useState([]);

    // on render
    useEffect(() => {
        setTeam1players(playerdata.team1details.players);
        setTeam2players(playerdata.team2details.players);
    }, [playerdata]);

    function checkValue(value){
        // check if the player is not a number between 0 and 99 or empty
        if(!value.target.value.match(/^$|\b(0?[0-9]|0?[1-9][0-9])\b/)){
            toast.error(value.target.value+' is not a player number', {autoClose: 1000, theme: 'dark'});
        }else{
            // check if player is not empty
            if(!value.target.value.match(/^$/)){
                value.target.value = Number(value.target.value);
            }
            onChange(value);
        }
    }

    return (
        <>
            <div className="row">
                <div className="col-sm-4 text-right">
                    <InputPlayer value={value} id={text} label={text} disabled={disabled} onChange={checkValue} />
                </div>
                <div className="col-sm-2">
                    <Button buttonclass={onClick ? 'outline-info btn-logo' : 'outline-light btn-logo'} text={<Teamlogo addclassname='teamlogosmall' src={team === 'team1' ? gamedata.logo1 : gamedata.logo2}/>} disabled={disabled} onClick={onClick}/>
                </div>
                <div className="col-sm-4 text-wrap align-middle playername">
                    <small>
                        {team === 'team1' ?
                        typeof team1players !== 'undefined' ? team1players.filter(player => player.number === value && player.number.length > 0).map(filteredplayer => filteredplayer.name) : '' :
                        typeof team2players !== 'undefined' ? team2players.filter(player => player.number === value && player.number.length > 0).map(filteredplayer => filteredplayer.name) : '' }
                    </small>
                </div>
            </div>
        </>
    )
}

export default Player
