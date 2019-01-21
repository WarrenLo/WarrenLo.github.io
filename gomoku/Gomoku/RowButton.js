import React from 'react'

const RowButton = (props) =>{
  const {xIndex, yIndex, chessEach, winner, winnerCoord} = props;

  const winnerLine = (winner &&
   ((xIndex === winnerCoord[0] && yIndex === winnerCoord[1]) ||
    (xIndex === winnerCoord[2] && yIndex === winnerCoord[3]) ||
    (xIndex === winnerCoord[4] && yIndex === winnerCoord[5]) ||
    (xIndex === winnerCoord[6] && yIndex === winnerCoord[7]) ||
    (xIndex === winnerCoord[8] && yIndex === winnerCoord[9]) ))

  return(
    <button className={'btn ' + (winnerLine ? ((winner === 'Black') ? 'btn__winner-black' : 'btn__winner-white') : '')} data-index={props.index} onClick={props.onClick}>
      {(chessEach !== null) ?
        (chessEach === 'B' ? <div className='chess chessBlack'></div> : <div className='chess chessWhite'></div>) : null}
    </button>
  )
}

export default RowButton;
