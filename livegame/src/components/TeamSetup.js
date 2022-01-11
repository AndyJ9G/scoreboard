import UploadImage from './UploadImage';
import TeamList from './TeamList';

function TeamSetup({socket}) { 

  return (
    <div className='container'>
      <UploadImage socket={socket}/>
      <TeamList socket={socket}/>
    </div>
  );
}

export default TeamSetup;
