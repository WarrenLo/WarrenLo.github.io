import React, {Component} from 'react';

class TodoListCreate extends Component{
  render(){
    return(
      <label className='todo__create'>
        <input type='text' className='todo__input todo__create--text' id='todo__create'
        placeholder='create a new item'
        autoComplete='off'
        value={this.props.newItem}
        onChange={this.props.handleInputChange}
        onKeyDown={this.props.keyPressEnter}/>
        <span className='todo__ceate--text-border'></span>
        <button className='todo__input todo__create--submit' onClick={this.props.addTodo}>add</button>
      </label>
    )
  }
}

export default TodoListCreate;
