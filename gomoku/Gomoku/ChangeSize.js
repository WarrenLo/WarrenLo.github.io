import React, { Component } from 'react'

class ChangeSize extends Component{
  shouldComponentUpdate(nextProps){
    return nextProps.active !== this.props.active
  }
  render(){
    return(
      <button className={'control__changesize--btn ' + this.props.active} size={this.props.size} onClick={this.props.changeSize}>
        {this.props.size + ' X ' + this.props.size}
      </button>
    )
  }
}

export default ChangeSize;
