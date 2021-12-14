import React, { } from 'react';
import { useFormik } from 'formik';
import { IconButton , CircularProgress, TextField} from '@mui/material';
import { useSpring, animated } from 'react-spring'
import IconMess from './img/carbon_send-alt-filled.png'
import * as yup from 'yup';

interface Props {
  Loadingclick: () => void;
  disable: boolean;
  loading: boolean;
}

export default function FormPlay({ Loadingclick, disable, loading }: Props) {

    const anim = useSpring({
        opacity: 1,
        transform: "translate(0px, 0px)",
        from: { opacity: 0, transform: "translate(0px, 0px)" } ,
        config: {
          delay: 1000,
          duration: 700,
        },
      });

      
      

      const validationSchema = yup.object({
        loggin: yup.string().required('Enter a Nickname')
        
        
      });
      
  
    
      const formik = useFormik({
        initialValues: {
          loggin: '',
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
          
          Loadingclick()
          // console.log(values)
        },
      });

      

      

     
      

    return (
        <div className='before '>
        <animated.div style={anim}  className='w-100'> 
        <div className='formDivButton'>
            <form onSubmit={formik.handleSubmit} className={`${!Boolean(formik.errors.loggin) ? 'formDiv' : 'formDivButtonAnim '} d-flex w-100 h-100`}>
  
              <TextField className="muiButtonInput" name="loggin" placeholder='Nickname' autoComplete='off'
             
            value={formik.values.loggin}
            onChange={formik.handleChange}
            error={formik.touched.loggin && Boolean(formik.errors.loggin)}
            helperText={formik && formik.errors.loggin}
            disabled={!disable}
          />
        
          
            <div className='buttonDiv'  >     
            {loading &&  <CircularProgress size='1.4em' sx={{mt: '40%'}}  /> }
            {!loading &&  <IconButton type="submit" className='w-100 h-100'   >
                <img  src={IconMess} alt="" />
            </IconButton>
            }
            </div>
            
            </form>
            
           
          
          </div>
        </animated.div>
      </div>
    )
}
