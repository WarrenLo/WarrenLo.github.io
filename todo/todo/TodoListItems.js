import React, { Component } from 'react';

class TodoListItems extends Component{

  handleRemove = () => {
    this.props.removeTodo(this.props.items)
  }

  handleComplete = () =>{
    this.props.completeTodo(this.props.items)
  }

  render(){
    const {items} = this.props;
    const iconCompletedStyle = {
      backgroundColor: 'rgba(0,0,0,0.2)',
      border: '2px solid rgba(0, 0, 0, 0.2)',
    }
    const contentCompletedStyle = {
      color: 'rgba(0,0,0,0.2)',
      textDecoration: 'line-through',
    }
    return(
      <label className='todo__input todo__items--check check' data-id={items.id} data-completed={items.isCompleted}>
        <input type='checkbox' className='check__box' />
        <div className='check__icon' onClick={this.handleComplete}
        style={items.isCompleted ? iconCompletedStyle : null}></div>
        <div className='check__content' style={items.isCompleted ? contentCompletedStyle : null} onClick={this.handleComplete}>{items.todo}</div>
        <label className='check__delete' onClick={this.handleRemove}><i className="fas fa-times"></i></label>
      </label>
    )
  }
}

export default TodoListItems;
