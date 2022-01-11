import { useRef, useState, useEffect } from 'react';

const InputPlayer = ({ id, label, value, disabled, onChange }) => {
    const [hasFocus, setHasFocus] = useState(false);
    const ref = useRef();

    useEffect(() => {
        if(document.hasFocus() && ref.current && ref.current.contains(document.activeElement)){
            setHasFocus(true);
        }
    }, [])

    return (
        <div style={{
            display: 'inline-block',
            borderRadius: 5,
            background: hasFocus ? 'rgba(164,233,255,0.5)' : 'transparent'
        }}>
            <div className='row'>
                <div className="col-sm-6 text-right">
                    <label htmlFor={id} className='verysmall'><small>{label}:</small></label>
                </div>
                <div className="col-sm-6">
                    <input
                        id={id}
                        type='text'
                        value={value}
                        className="form-control font-weight-bold player-input"
                        disabled={disabled}
                        onChange={onChange}
                        onFocus={() => setHasFocus(true)}
                        onBlur={() => setHasFocus(false)}/>
                </div>
            </div>
        </div>
    )
}

export default InputPlayer
