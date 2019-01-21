import React from 'react'

const BoardRow = (props) =>{
  return(
    <div className='row'>
      {props.cols.map( (n, index) => props.renderButton(index, props.yIndex))}
    </div>
  )
}

export default BoardRow;
