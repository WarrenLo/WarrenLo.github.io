import React from 'react'

const Information = (props) =>{
  let info;
  const winner = props.winner

  if(winner){
    info = winner + ' win'
  }else{
    info = (props.blackIsNext) ? <div className='chess chessBlack'></div> : <div className='chess chessWhite'></div>
  }

  return(
    <h4 className={'control__info ' + (winner ? ((winner === 'Black') ? 'control__info--black' : 'control__info--white') : '')}>
       {(!winner) ? <div className='control__info--text'>Next is </div> : ''}
       {info}
    </h4>
  )
}

export default Information;
