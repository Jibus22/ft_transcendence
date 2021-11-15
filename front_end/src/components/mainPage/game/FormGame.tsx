import React, { useState } from 'react';
import { Formik, Field } from 'formik';
import { IconButton , CircularProgress   } from '@mui/material';
import { useSpring, animated } from 'react-spring'
import IconMess from './img/carbon_send-alt-filled.png'

const style = {
    width: '90%',
    height: '100%',
    border: 'none',
    backgroundColor: 'rgba(202,108,136, 0.7)',
    borderRadius: '10px 0px 0px 10px',
    borderTop: '1px solid  rgba(255, 255, 255, 0.7)',
    borderBottom: '1px solid  rgba(255, 255, 255, 0.7)',
    borderLeft: '1px solid  rgba(255, 255, 255, 0.7)',
    paddingLeft: '20px',
    paddingRight: '15px',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '25px',
    color: 'white',
    outline: 'none',
  };

  interface Values {
    loggin: string,

  }

  

  export default function FormGame(props : any) {

    const anim = useSpring({
        opacity: 1,
        transform: "translate(0px, 0px)",
        from: { opacity: 0, transform: "translate(0px, 0px)" } ,
        config: {
          delay: 1000,
          duration: 700,
        },
      });

    const[loading, setLoading] = useState(false);
        
    const submit = (values: Values) => {
        setLoading(true);
        setInterval(() => {
            setLoading(false);
        }, 2000);
        console.log(values);
      
       
      };

    return (
        <div className='before '>

            
        <Formik  initialValues={{ 
            loggin: '', 
        }}
        onSubmit={ submit }
        enableReinitialize={ true }
      >
        { ({ handleSubmit}) => (
        <animated.div  style={anim} className='w-100'> 
        <div className='formDivButton'>
          <form onSubmit={ handleSubmit } className="d-flex w-100 h-100  formDiv  ">
            <Field style={style} name="loggin" placeholder="Nickname" autoComplete="off" />
            <div className='buttonDiv'  >     
            {loading &&  <CircularProgress size={25} sx={{mt: 2}}  /> }
            {!loading &&  <IconButton type="submit" className='w-100 h-100'   >
                <img  src={IconMess} alt="" />
            </IconButton>
            }
            </div>
          </form>
          </div>
        </animated.div>
        ) }
      </Formik>
      </div>
    )
}
