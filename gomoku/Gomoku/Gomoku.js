import React from 'react';
import Title from './Title.js';
import Board from './Board.js';
import './style/Gomoku.css';

const Gomoku = () =>{
  return(
    <div className='container'>
      <Title />
      <div className='boardContainer'>
        <Board />
      </div>
    </div>
  )
}

export default Gomoku;
