import React, { Component } from 'react';
import TodoTitle from './TodoTitle.js';
import TodoList from './TodoList.js';
import './style/Todo.css';

function Todo(){
    return(
      <div className='container'>
        <TodoTitle text='Todo List' />
        <TodoList></TodoList>
      </div>
    )
}

export default Todo;
