const Button = ({ id, buttonclass, text, keytext, disabled, onClick}) => {
    let className = 'btn col btn-sm';

    // add class to button
    if (buttonclass) {
        className = className+' btn-'+buttonclass;
    }

    // return component
    return (
        <button id={id} onClick={onClick} disabled={disabled} className={className}>{text}{keytext && <> - <b>{keytext}</b></>}</button>
    )
}

export default Button
