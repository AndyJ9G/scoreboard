const Teamlogo = ({ src, addclassname, onClick}) => {
    let className = 'teamlogo';
    let srcName = src;

    // return component
    return (
        <img className={`${className} ${addclassname}`} src={srcName} alt='' onClick={onClick}/>
    )
}

export default Teamlogo