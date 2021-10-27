import React  from 'react' 
import  './StyleLoadingBarre.scss'


const Increment = () => {
    const elem = document.querySelector('.barre-done') as HTMLInputElement;
    var width = 10;
    const interval = setInterval(() => {
        if (width === 100) {
            clearInterval(interval);
        } else {
            width++;
            elem.style.width = width + '%';
            elem.innerHTML = width  + "%";
        }
    }, 25)

}



const LoadingBarre = () => {
    React.useEffect(() => {
        Increment()
    
      });

      return (
        <div className='HomeLoading d-flex flex-column'>  
            
            <div className="barre d-flex flex-column">
                
                <div  className="barre-done" data-done="70"></div>  
                <div className='loadingWrite d-flex justify-content-center'>
                    <h1>Loading </h1>
                    
                        <span className="let1">.</span>
                        <span className="let2">.</span>
                        <span className="let3">.</span>

                </div>
                <div className = "centered">
	            <div className = "blob-1"></div>
	            <div className = "blob-2"></div>
                
                
                
            </div>
            <div className=''>
                    <div className="pong-loader"></div> 
                </div>

            </div>
        </div>    
    )
    
}



export default LoadingBarre



