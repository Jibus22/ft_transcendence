import './play.scss'
import React, { useState } from 'react';
import IconGame from './img/Group.png'
import { useSpring, animated } from 'react-spring'
import { Button, CircularProgress   } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FormPlay from './FormPlay';

interface Props {
    Loadingclick : () => void;
    disable: boolean;
    loading: boolean;
  }
  

export default function Play({Loadingclick, disable, loading}: Props) {
    const props = useSpring({
        opacity: 1,
        transform: "translate(0px, 0px)",
        from: { opacity: 0, transform: "translate(0px, 500px)" } ,
        config: {
            delay: 300,
            duration: 300,
        },
      });

      const[isForm, setIsForm] = useState<boolean>(false);
     
        function handleChangeWindow() {
            setIsForm(!isForm)
        }

        let buttonFriends;
        if (!isForm) {
            buttonFriends = <div className=''> 
                 <Button className='buttonMui buttonMuiFriend' variant="contained" disabled={!disable} onClick={ handleChangeWindow }   
                            sx={{borderRadius: 3, width: 2/2, height: 2/2, textTransform: 'none'}}>
                Invit a friend
            </Button  > 
            </div>
          } else {
            buttonFriends = <FormPlay Loadingclick={ Loadingclick } disable={disable} loading={loading} />
          }

        

    return (

      
        <animated.div  style={props} className='w-100'> 
        <div className='mainGameWindow d-flex flex-column '>
            <div className='msgPlay  '>
                <h1>Do you want to play now ? </h1>
            </div>
            <div className='iconePLayGame'>
                <img src={IconGame} alt="" />
            </div>
            <div className='playRandom'>
            <LoadingButton className='buttonMui' onClick={Loadingclick} disabled={loading}  variant="contained"
                                sx={{borderRadius: 3, width: 2/2, height: 2/2, textTransform: 'none'}}>
                     {loading && <CircularProgress size='1.2em' />}
                     {!loading && 'Play Now'}
            </LoadingButton>
            {buttonFriends}  
            </div>   
        </div>
        </animated.div>
 
     
    )
}


