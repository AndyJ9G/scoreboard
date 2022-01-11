import Teamlogo from './Teamlogo';
import Button from './Button';
import { toast } from 'react-toastify';
import InputYard from './InputYard';

const Yard = ({ text, yard, team, disabled, gamedata, onChange, onClick }) => {

    function checkValue(value){
        // check if the yard is not a number between 0 and 50 or empty
        if(!value.target.value.match(/^$|\b(0?[0-9]|0?[1-4][0-9]|0?50)\b/)){
            toast.error(value.target.value+' is not a valid yard line', {autoClose: 1000, theme: 'dark'});
        }else{
            // check if yard is empty = we change to 0
            if(value.target.value.match(/^$/)){
                value.target.value = 0;
            }else{
                value.target.value = Number(value.target.value);
            }
            onChange(value);
        }
    }

    return (
        <>
            <div className="row">
                <div className="col-sm-9 text-right">
                    <InputYard value={yard} id={text} label={text} disabled={disabled} onChange={checkValue} />
                </div>
                
                <div className="col-sm-3">
                    <Button buttonclass={onClick ? 'outline-info btn-logo' : 'outline-light btn-logo'} text={<Teamlogo addclassname='teamlogosmall' src={team === 'team1' ? gamedata.logo1 : gamedata.logo2}/>} onClick={onClick}/>
                </div>
            </div>
        </>
    )
}

export default Yard
