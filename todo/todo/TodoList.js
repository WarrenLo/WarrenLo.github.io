import React, {Component} from 'react';
import TodoListCreate from './TodoListCreate.js';
import TodoListItems from './TodoListItems.js';

class TodoList extends Component{
  constructor(props){
    super(props);
    this.state = {
      items:[],
      newItem: '',
    }
  }

  handleInputChange = (e) =>{
    this.setState({
      newItem: e.target.value
    })
  }

  keyPressEnter = (e) =>{
    if(e.which === 13){
      this.addTodo()
    }
  }

  addTodo = () =>{
    const {items, newItem} = this.state
    if(newItem.trim() !== ''){
      this.setState({
        items: items.concat({
          todo: newItem.trim(),
          id: (items.length > 0) ? (items[items.length-1].id + 1) : 0,
          isCompleted: false,
        }),
        newItem: '',
      })
    }else{
      alert('Please create a new item')
      this.setState({
        newItem: '',
      })
    }
  }

  removeTodo = (todo) => {
    this.setState({
      items: this.state.items.filter(item => item.id !== todo.id)
    })
  }

  completeTodo = (todo) =>{
    this.setState({
      items: this.state.items.map( item => {
        if(item.id !== todo.id){
          return item
        }else{
          return{
            ...item,
            isCompleted: !todo.isCompleted,
          }
        }
      })
    })
  }

  save = () => {
    localStorage.setItem('localItems', JSON.stringify(this.state.items))
  }

  get = () =>{
    const getItems = JSON.parse(localStorage.getItem('localItems'))
    if(getItems){
      this.setState({
        items: getItems
      })
    }
  }

  componentDidUpdate(prevProps,prevState){
    this.save();
  }

  componentDidMount(){
    this.get();
  }

  render(){
    return(
      <div className='todo'>
        <TodoListCreate newItem={this.state.newItem} handleInputChange={this.handleInputChange} addTodo={this.addTodo} keyPressEnter={this.keyPressEnter}/>
        {this.state.items.map(items => <TodoListItems key={items.id} items={items} removeTodo={this.removeTodo.bind(this)} completeTodo={this.completeTodo}/>)}
      </div>
    )
  }
}

export default TodoList;
