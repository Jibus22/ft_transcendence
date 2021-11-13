import React, { Component } from 'react';
import { Formik, Field } from 'formik';




  


type FormValues = {
    
    name: string;
    username: string;
    email: string;
  };


const AddUser = (props : any) => {


    const user = props.user

    const obj = {
        age :18,
        ville: 'bastia'
    }
    
    // console.log(obj)
    
    // console.log(user)
    // console.log(...user)

    const getInitialValues = () => {
        return user ? { ...user } : { name: '', username: '', email: '' }
      }
    

      
      const submit = (values: FormValues) => {
        console.log(values);
        alert(JSON.stringify(values, null, 2));
       
      };
    return (
      
            <Formik 
            initialValues={ getInitialValues() }
            onSubmit={ submit }
            enableReinitialize={ true }
          >
            { ({ handleSubmit}) => (
              <form onSubmit={ handleSubmit } className="d-flex flex-column">
                <Field name="name" placeholder="name" />
                <Field name="username" placeholder="username" />
                <Field name="email" placeholder="email" />
                <button type="submit">save</button>
              </form>
            ) }
          </Formik>
          
        )
    
}

export default AddUser;