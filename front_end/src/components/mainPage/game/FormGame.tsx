import { Formik, Field } from 'formik';
import { IconButton, InputAdornment, Button, CircularProgress   } from '@mui/material';
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

    const lol = props.click;
    


    const submit = (values: Values) => {
        console.log(values);
        alert(JSON.stringify(values, null, 2));
       
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
        <div className='formDivButton '>
          <form onSubmit={ handleSubmit } className="d-flex w-100 h-100  formDiv ">
            <Field style={style} name="loggin" placeholder="Nickname" autoComplete="off" />
            <div className='buttonDiv' >                
            <IconButton type="submit" className='w-100 h-100' onClick={lol}   >
                <img src={IconMess} alt="" />
            </IconButton>
            </div>
          </form>
          </div>
        ) }
      </Formik>
      </div>
    )
}
