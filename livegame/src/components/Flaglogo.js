const Flaglogo = ({ src}) => {
    let className = 'flag';
    let srcName = src;

    // return component
    return (
        <img className={className} src={srcName} alt=''/>
    )
}

export default Flaglogo