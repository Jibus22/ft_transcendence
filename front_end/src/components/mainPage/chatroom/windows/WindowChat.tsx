import React, { useState, useEffect, lazy } from 'react' 
import './windowChat.scss'
import { useSpring, animated } from 'react-spring'
import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';
import { pink } from '@mui/material/colors';
import {ChatRoom} from '../../../index'
import {styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import OutlinedInput from '@mui/material/OutlinedInput';

const CssTextField = styled(TextField)({
 
    '& label.Mui-focused': {
      color: 'black',
      
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'grey',
      },
      
      
    },
  });


const WindowChat = () => {
    const props = useSpring({
        opacity: 1,
        transform: "translate(0px, 0px)",
        from: { opacity: 0, transform: "translate(0px, 0px)" } ,
        config: {
          delay: 500,
          duration: 500,
        },
      });

    var [window, setWindow] = useState(true);

    function handleClick() {
       setWindow(window = false)
    }

    if (window == false) {
        return (
            
                 <ChatRoom/>
        
        )
    }


    return (
        
        <div className='mainWindowChat d-flex'>
       
            <div className='mainNav d-flex flex-column '>
                <div className='infoNav d-flex '>
                <CssTextField className='searchBarre '  id="outlined-password-input" size='small'
                   InputProps={{ startAdornment: (
                     
                        <SearchIcon sx={{ color: pink[50], fontSize: 13, mb: 0.5   }} />
                     ),}}/>
                <IconButton >
                        <AddToPhotosIcon  sx={{fontSize: 19, mt:1.4, color: pink[50]}} />
                    </IconButton>

                </div>
                
            </div>
            <div className='mainMessage d-flex flex-column '>
                <div className='infoChat d-flex flex-column'>
                    <div className='exitIcon ' onClick={handleClick}>
                    <IconButton >
                        <CancelIcon  sx={{width:30, height:30, color: pink[50]}} />
                    </IconButton>
                    </div>
                    {/* <div className='border'>

                    </div> */}
                    <div className='inputMessage '>
                        
                         {/* <OutlinedInput placeholder="Please enter text" /> */}
                    </div>
                    

                </div>
            </div>
            
        </div>
    )
}


export default WindowChat