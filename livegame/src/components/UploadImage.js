import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UploadImage = ({socket}) => {
    const [fileData, setFileData] = useState('');
    const [previewImage, setPreviewImage] = useState('');

    // on render
    const onChangeHandler = (e) => {
        if(checkFile(e)){
            setFileData(e.target.files[0]);
            setPreviewImage(URL.createObjectURL(e.target.files[0]));
        }else{
            setFileData('');
            setPreviewImage('');
        }
    }

    const onClickHandler = () => {
        const data = new FormData();
        data.append('file',fileData);

        axios.post('/upload', data, { // receive two parameter endpoint url ,form data
        })
        .then(res => { // then print response
            toast.success(`Upload successfull`, {autoClose: 2000, theme: 'dark'});
            setFileData('');
            setPreviewImage('');
            // request team list
            socket.emit('getTeamList', { message: 'Client requesting teamlist' });
        })
        .catch(err => {
            toast.error(`Upload failed`, {autoClose: 2000, theme: 'dark'});
        })
    }

    const checkFile=(event)=>{
        //getting file object
        let files = event.target.files[0];
        //define message container
        let err = '';
        // define size limit = 2MB
        let size = 2000000;
        // list allow mime type
        const types = ['image/png', 'image/jpeg', 'image/gif'];
        // compare file type find doesn't matach
        if (types.every(type => files.type !== type)) {
            // create error message and assign to container   
            err += files.type+' is not a supported format\n';
        }else if (files.size > size) {
            // create error message and assign to container   
            err += files.type+' is to large\n';
        }
      
       if (err !== '') { // if message not same old that mean has error 
            event.target.value = null // discard selected file
            toast.error(`Error: ${err}`, {autoClose: 2000, theme: 'dark'});
            return false; 
        }
       return true;
    }

    const imgStyle =  {
        maxWidth: '200px',
        width: '100%',
        height: '100%'
    }

    return (
        <div className='container'>
            <div className='row border'>
                <div className="col-sm-2">
                    <div className='form-group-files'>
                        <label>Upload New Image:</label>
                    </div>
                </div>
                <div className="col-sm-4">
                    <div className='form-group-files'>
                        <input type="file" name='file' className='form-control' onChange={onChangeHandler}/>
                    </div>
                </div>
                {fileData !== '' &&
                <div className="col-sm-2">
                    <div className='form-group-files'>
                        <button type="button" className="btn col btn-sm btn-success" onClick={onClickHandler}>Upload</button>
                    </div>
                </div>
                }
                {previewImage !== '' &&
                    <div className="col-sm-4">
                        <img src={previewImage} style={imgStyle} alt=''/>
                    </div>
                }
            </div>
        </div>
    )
}

export default UploadImage
