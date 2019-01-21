import React, {Component} from 'react'
import ChangeSize from './ChangeSize.js'
import BoardRow from './BoardRow.js'
import RowButton from './RowButton.js'
import ResetButton from './ResetButton.js'
import Information from './Information.js'
import Retract from './Retract.js'
import NoRetract from './NoRetract.js'
import CanvasBoard from './CanvasBoard.js'
import cloneDeep from 'lodash/cloneDeep';

class Board extends Component{
  constructor(props){
    super(props);
    this.boardSize = 19
    this.cols = Array(this.boardSize).fill([])
    this.state = {
      historyChess: [{
        chess: this.cols.map(n => Array(this.boardSize).fill(null)),
      }],
      blackIsNext: true,
      stepNumber: 0,
      historyBlack: [{black: ['Black']}],
      historyWhite: [{white: ['White']}],
      winner: null,
      winnerCoord: Array(10).fill(null),
    }
  }

  changeSize = (e) =>{
    this.boardSize = Number(e.target.getAttribute('size'))
    this.reset()
  }

  renderButton = (xIndex,yIndex) =>{
    const historyChess = this.state.historyChess.slice(0, this.state.stepNumber+1)
    const current = historyChess[historyChess.length-1]
    return(
      <RowButton
        key={xIndex+','+yIndex}
        index={xIndex+','+yIndex}
        onClick={() => this.handleClick(xIndex,yIndex)} chessEach={current.chess[xIndex][yIndex]}
        xIndex={xIndex}
        yIndex={yIndex}
        winner={this.state.winner}
        winnerCoord={this.state.winnerCoord}
      />
    )
  }

  handleClick = (xIndex,yIndex) =>{
    const {historyChess, stepNumber, blackIsNext, historyBlack, historyWhite, winner} = this.state
    const boardSize = this.boardSize

    const historyChessNew = historyChess.slice(0, stepNumber+1)
    const current = cloneDeep(historyChessNew[historyChessNew.length-1])
    const chessEach = current.chess


    const historyBlackNew = historyBlack.slice(0, ((blackIsNext)? (Math.floor(stepNumber/2)+1) : (Math.floor(stepNumber/2)+2)))
    const currentBlack = cloneDeep(historyBlackNew[historyBlackNew.length-1])
    const historyWhiteNew = historyWhite.slice(0, Math.floor(stepNumber/2)+1)
    const currentWhite = cloneDeep(historyWhiteNew[historyWhiteNew.length-1])


    if (chessEach[xIndex][yIndex] === null && winner === null){
      chessEach[xIndex][yIndex] = (blackIsNext)? 'B' : 'W';

      this.setState({
        historyChess: historyChessNew.concat([{
          chess: chessEach
        }]),
        stepNumber: historyChessNew.length,
        blackIsNext: !blackIsNext,

        historyBlack: (blackIsNext) ?
        historyBlackNew.concat([{black: [...currentBlack.black, (xIndex*(boardSize+1)+yIndex)],}]) :
        historyBlack,

        historyWhite: (blackIsNext) ?
        historyWhite :
        historyWhiteNew.concat([{white: [...currentWhite.white, (xIndex*(boardSize+1)+yIndex)],}]),
      })

      if(blackIsNext){
        this.calcWinner([...currentBlack.black, (xIndex*(boardSize+1)+yIndex)], currentWhite)
      }else{
        this.calcWinner(currentBlack, [...currentWhite.white, (xIndex*(boardSize+1)+yIndex)])
      }
    }
  }

  retract = () =>{
    this.setState({
      stepNumber: this.state.stepNumber-1,
      blackIsNext: !this.state.blackIsNext,
    })
  }

  noretract = () =>{
    this.setState({
      stepNumber: this.state.stepNumber+1,
      blackIsNext: !this.state.blackIsNext,
    })
  }

  calcWinner = (blackArray, whiteArray) =>{

    const boardSize = this.boardSize
    console.log(boardSize)
    let array = this.state.blackIsNext ? blackArray : whiteArray;
    for(let i = 1; i < array.length; i++){
      if(
        (array.includes(array[i])
        && array.includes(array[i]+1)
        && array.includes(array[i]+2)
        && array.includes(array[i]+3)
        && array.includes(array[i]+4))
        ){
        this.setState({
          winner: array[0],
          winnerCoord: [
            Math.floor(array[i]/(boardSize+1)),
            array[i]%(boardSize+1),
            Math.floor((array[i]+1)/(boardSize+1)),
            (array[i]+1)%(boardSize+1),
            Math.floor((array[i]+2)/(boardSize+1)),
            (array[i]+2)%(boardSize+1),
            Math.floor((array[i]+3)/(boardSize+1)),
            (array[i]+3)%(boardSize+1),
            Math.floor((array[i]+4)/(boardSize+1)),
            (array[i]+4)%(boardSize+1),
          ]
        })
      }else if(
        //左上右下
        ( array.includes(array[i])
        && array.includes(array[i]+1*(boardSize))
        && array.includes(array[i]+2*(boardSize))
        && array.includes(array[i]+3*(boardSize))
        && array.includes(array[i]+4*(boardSize)))
      ){
        this.setState({
          winner: array[0],
          winnerCoord: [
            Math.floor(array[i]/(boardSize+1)),
            array[i]%(boardSize+1),
            Math.floor((array[i]+1*(boardSize))/(boardSize+1)),
            (array[i]+1*(boardSize))%(boardSize+1),
            Math.floor((array[i]+2*(boardSize))/(boardSize+1)),
            (array[i]+2*(boardSize))%(boardSize+1),
            Math.floor((array[i]+3*(boardSize))/(boardSize+1)),
            (array[i]+3*(boardSize))%(boardSize+1),
            Math.floor((array[i]+4*(boardSize))/(boardSize+1)),
            (array[i]+4*(boardSize))%(boardSize+1),
          ]
        })
      }else if(
        (array.includes(array[i])
        && array.includes(array[i]+1*(boardSize+1))
        && array.includes(array[i]+2*(boardSize+1))
        && array.includes(array[i]+3*(boardSize+1))
        && array.includes(array[i]+4*(boardSize+1)))
        ){
          this.setState({
            winner: array[0],
            winnerCoord: [
              Math.floor(array[i]/(boardSize+1)),
              array[i]%(boardSize+1),
              Math.floor((array[i]+1*(boardSize+1))/(boardSize+1)),
              (array[i]+1*(boardSize+1))%(boardSize+1),
              Math.floor((array[i]+2*(boardSize+1))/(boardSize+1)),
              (array[i]+2*(boardSize+1))%(boardSize+1),
              Math.floor((array[i]+3*(boardSize+1))/(boardSize+1)),
              (array[i]+3*(boardSize+1))%(boardSize+1),
              Math.floor((array[i]+4*(boardSize+1))/(boardSize+1)),
              (array[i]+4*(boardSize+1))%(boardSize+1)
            ]
          })
      }else if(
        //左下右上
        (array.includes(array[i])
        && array.includes(array[i]+1*(boardSize+2))
        && array.includes(array[i]+2*(boardSize+2))
        && array.includes(array[i]+3*(boardSize+2))
        && array.includes(array[i]+4*(boardSize+2)))
        ){
          this.setState({
            winner: array[0],
            winnerCoord: [
              Math.floor(array[i]/(boardSize+1)),
              array[i]%(boardSize+1),
              Math.floor((array[i]+1*(boardSize+2))/(boardSize+1)),
              (array[i]+1*(boardSize+2))%(boardSize+1),
              Math.floor((array[i]+2*(boardSize+2))/(boardSize+1)),
              (array[i]+2*(boardSize+2))%(boardSize+1),
              Math.floor((array[i]+3*(boardSize+2))/(boardSize+1)),
              (array[i]+3*(boardSize+2))%(boardSize+1),
              Math.floor((array[i]+4*(boardSize+2))/(boardSize+1)),
              (array[i]+4*(boardSize+2))%(boardSize+1)
            ]
          })
      }
    }
  }

  reset = () =>{
    this.cols = Array(this.boardSize).fill([])
    this.setState({
      historyChess: [{
        chess: this.cols.map(n => Array(this.boardSize).fill(null)),
      }],
      blackIsNext: true,
      stepNumber: 0,
      historyBlack: [{black: ['Black']}],
      historyWhite: [{white: ['White']}],
      winner: null,
      winnerCoord: Array(10).fill(null)
    })
  }

  render(){
    const historyChess = this.state.historyChess;
    const current = historyChess[this.state.stepNumber];
    const buttonBoardLeft = 500-(this.boardSize*20) +'px'
    const buttonBoardStyle = {top:'120px', left:buttonBoardLeft};
    return(
      <div className='Board'>
        <CanvasBoard boardSize={this.boardSize}/>
        <div className='buttonBoard' style={buttonBoardStyle}>
          {this.cols.map( (n, index) =>
            <BoardRow
            key={index} yIndex={index} handleClick={this.handleClick} renderButton={this.renderButton} chess={current.chess} cols={this.cols} />)}
        </div>
        <div className='control'>
          <div className='control__changesize'>
            <ChangeSize changeSize={this.changeSize} size={15} active={(this.boardSize === 15)? 'active' : '' }/>
            <ChangeSize changeSize={this.changeSize} size={19} active={(this.boardSize === 19)? 'active' : '' }/>
          </div>
          <ResetButton reset={this.reset}/>
          <Information blackIsNext={this.state.blackIsNext} chess={current.chess} winner={this.state.winner}/>
          <div className='control__rets'>
            {(this.state.stepNumber > 0)? <Retract retract={this.retract}/> : ''}
            {(!(this.state.stepNumber === (historyChess.length-1)))? <NoRetract noretract={this.noretract}/> : ''}
          </div>
        </div>
      </div>
    )
  }
}

export default Board;
