import { useEffect, useState } from 'react';
import Flaglogo from './Flaglogo';

const Penaltytype = ({ text, value, disabled, gamedata, playerdata, onChange}) => {
    const [penaltylist, setPenaltylist] = useState([]);

    // on render
    useEffect(() => {
        setPenaltylist(gamedata.penaltylist);
    }, [gamedata]);

    return (
        <>
            <div className="row">
                <div className="col-sm-2 text-right">
                    <label className='verysmall'><small>{text}:</small></label>
                </div>
                <div className="col-sm-2">
                    <input type="text" value={value} className="form-control font-weight-bold" disabled={disabled} onChange={onChange}/>
                </div>
                <div className="col-sm-2">
                    <Flaglogo src='flag.png' />
                </div>
                <div className="col-sm-4 text-wrap align-middle penaltyname"><small>
                    {typeof penaltylist !== 'undefined' ? penaltylist.filter(item => item.id === value).map(filteredpenalty => filteredpenalty.name) : '' }
                </small></div>
            </div>
        </>
    )
}

export default Penaltytype
