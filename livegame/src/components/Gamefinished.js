const Gamefinished = ({ socket }) => {

    return (
        <>
            <div className='container' id='gamefinished'>
                <div className="row border">
                    <div className="d-block bg-info text-white col-sm-12 mb-2">Game Finished</div>
                    <div className="w-100"></div>
                    <div className="col-sm-12 mb-2">
                        <p>Game Finished. Check Stats and Plays under Game-Controls.</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Gamefinished
