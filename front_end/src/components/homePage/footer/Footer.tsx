import React from 'react' 
import './StyleFooter.css'


const Footer = () => {
  return (
    <div className='footer '>
        <footer className="bg-dark text-center text-white ">
            <div className="container p-4 MainFooter">
                <section className="mb-4 Cadre">
                <a className="btn btn-outline-light btn-floating m-1" href="#!" role="button">
                    <i className="fab fa-facebook-f"></i>
                </a>
              <a className="btn btn-outline-light btn-floating m-1" href="#!" role="button">
                  <i className="fab fa-twitter"></i>
            </a>
            <a className="btn btn-outline-light btn-floating m-1" href="#!" role="button">
                <i className="fab fa-google"></i>
            </a>
              <a className="btn btn-outline-light btn-floating m-1" href="#!" role="button">
                  <i className="fab fa-instagram"></i>
                </a>
              <a className="btn btn-outline-light btn-floating m-1" href="#!" role="button">
                <i className="fab fa-linkedin-in"></i>
            </a>
              <a className="btn btn-outline-light btn-floating m-1" href="#!" role="button"
                ><i className="fab fa-github"></i
              ></a>
            </section>
            <section className="">
              <form action="">
              </form>
            </section>
            <section className="mb-4 ParaFooter">
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt distinctio earum
                repellat quaerat voluptatibus placeat nam, commodi optio pariatur est quia magnam
                eum harum corrupti dicta, aliquam sequi voluptate quas.
              </p>
            </section>
            <section className="">
            </section>

          </div>
          <div className="text-center p-3 copyR">
            © 2021 Copyright:
            <a className="text-white" href='/'> FT Trancendence </a>
          </div>

        </footer>

            </div>
        )
}

export default Footer
