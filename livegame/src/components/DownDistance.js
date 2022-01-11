const DownDistance = ({ play }) => {

    // return component
    return (
        <span className="badge bg-primary text-light supersmall">
            {play.down} and {play.distance}
        </span>
    )
}

export default DownDistance