import React, { Component } from 'react'

class CanvasBoard extends Component{

  shouldComponentUpdate(nextProps){
    return nextProps.boardSize !== this.props.boardSize
  }

  componentDidMount(){ this.CreateCanvasBoard(this.props.boardSize) }

  componentDidUpdate(){ this.CreateCanvasBoard(this.props.boardSize) }

  CreateCanvasBoard = (boardSize) =>{
    let x = 40;
    let canvasSize = (boardSize+1)*40
    let center = x*(boardSize+1)/2
    var chess = document.querySelector('#canvas')
    var context = chess.getContext('2d')
    context.strokeStyle = '#000'
    context.lineWidth = 1.5;

    context.beginPath()
    context.arc(center, center, 5, 0, 2*Math.PI)
    context.closePath()

    context.moveTo(0,0)
    context.lineTo(0,canvasSize)

    context.moveTo(0,0)
    context.lineTo(canvasSize, 0)

    context.moveTo(canvasSize,0)
    context.lineTo(canvasSize,canvasSize)

    context.moveTo(0,canvasSize)
    context.lineTo(canvasSize, canvasSize)


    for( let i = 0; i<boardSize; i++){
      context.moveTo(x, x+x*i)
      context.lineTo(x*boardSize, x+x*i)
      context.moveTo(x+x*i, x)
      context.lineTo(x+x*i, x*boardSize)
    }
    context.stroke()
  }

  render(){
    const canvasLeft = 480-(this.props.boardSize*20) +'px'
    const canvasStyle = {top: '100px', left: canvasLeft}
    const canvasSize = (this.props.boardSize+1)*40 + 'px'

    return(
      <canvas id='canvas' width={canvasSize} height={canvasSize} style={canvasStyle}></canvas>
    )
  }
}

export default CanvasBoard
