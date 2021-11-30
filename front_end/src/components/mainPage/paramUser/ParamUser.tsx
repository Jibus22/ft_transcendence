import React, { useState, useEffect} from 'react';
import './paramUser.scss'
import PopUpUser from './PopUp/PopUpUser';
import { useSpring, animated } from 'react-spring'
import {Switch, FormControlLabel, Button, IconButton } from '@mui/material';
import FormUser from './FormUser';
import PencilIcon from './photos/pencil-icon.png'

interface TypeCategoriesProps {
  data: Array<Type>;
  fetchData: () => void;
 
 
}
interface Type {
  id: number; login: string; photo_url: string;
}


export default function ParamUser({data, fetchData} : TypeCategoriesProps ) {
  const props = useSpring({
    opacity: 1,
    transform: "translate(0px, 0px)",
    from: { opacity: 0, transform: "translate(0px, 500px)" } ,
    config: {
        delay: 350,
        duration: 350,
    },
  });

    const[isModif, setIsModif] = useState<boolean>(false)
    const[isPop, setIsPop] = useState<boolean>(false)

    const [userName, setUserName] = useState('');
    const [userImg, setUserImg] = useState('');
    useEffect(() => {
        data.map(item => (
            setUserName(item.login),
            setUserImg(item.photo_url)
        ))
      });

    function toggleModif() {
      setIsModif(!isModif)
    }
    function printPopup()  {
      setIsPop(!isPop)
    }

    return (
      <animated.div  style={props} className='w-100 '> 
       <div className="mainParamUser d-flex flex-column">
          
          { isPop ? (
             <PopUpUser printPopup={printPopup} userImg={userImg}/>
          ) : null}

          <div onMouseEnter={toggleModif} onMouseLeave={toggleModif} className='imgUser '>
            <img src={userImg} alt="" className={`${ isModif &&  !isPop ?  'imgFilter ' : 'none'} `} />
            {isModif && !isPop ? (
                <div className='userModif'>
                  <IconButton sx={{width: 2/2, height: 2/2}} className="" onClick={printPopup} >
                      <img src={PencilIcon} alt="" />
                    </IconButton>
                </div>
            ) : null}   
          </div> 
          <div className={`${isPop ?  'mainStatUserBlur' : 'mainStatUser'} `} >

              
            <div className="StatUser d-flex flex-column">
              <div className='infoStatUser d-flex '>
                <div className=''><p>Game</p></div>
                <div className=''><p>Win</p></div>
                <div className=''><p>Looses</p></div>
              </div>
              <div className="statNbUser d-flex ">
              <div className=''><p>15</p></div>
                <div className='middleNbUser'><p>2</p></div>
                <div className=''><p>13</p></div>
              </div>
            </div>
            <div className='mainMaterialUiText '>
                 <FormUser isPop={isPop} userName={userName} fetchData={fetchData} />
            </div>
            <div className='switchMui '>
            <FormControlLabel disabled={isPop} control={
              <Switch  defaultChecked   />
            }label="2FA" labelPlacement="start"
            />
           </div>
           <div className='disconectMui'>
             <Button disabled={isPop} variant="text">Disconnect</Button>
           </div>  
        </div>
            
             
        </div>  

        </animated.div>
    
      
    )
}
