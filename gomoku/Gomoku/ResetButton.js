import React from 'react'

const ResetButton = (props) =>{
  return(
    <button className='control__btn control__reset' onClick={props.reset}>
      Restart
    </button>
  )
}

export default ResetButton;
