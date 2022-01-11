import Button from './Button';

const Cointoss = ({ socket }) => {
    // onClick event
    function onClick() {
        socket.emit('playGUIupdate', { item: 'enter', value: 'clicked' });
    }

    return (
        <>
            <div className='container' id='cointoss'>
                <div className="row border">
                    <div className="d-block bg-info text-white col-sm-12 mb-2">Cointoss</div>
                    <div className="w-100"></div>
                    <div className="col-sm-4 mb-2">
                        <Button buttonclass='danger' text='Start Game - Coin Toss' onClick={onClick}/>
                    </div>
                    <div className="col-sm-8 mb-2"></div>
                </div>
            </div>
        </>
    )
}

export default Cointoss
