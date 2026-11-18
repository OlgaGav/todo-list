import { useState } from "react";
import TodoList from "./TodoList/TodoList.jsx";
import TodoForm from "./TodoForm.jsx";

function TodosPage() {
  const [todoList, setTodoList] = useState([]);

  function addTodo(todoTitle) {
    const newTodo = {
      id: Date.now(),
      title: todoTitle,
      isCompleted: false,
    };
    setTodoList((previous) => [newTodo, ...previous]);
  }

  function updateTodo(editedTodo) {
    const updatedTodos = todoList.map((todo) =>
      todo.id === editedTodo.id ? { ...editedTodo } : todo,
    );
    setTodoList(updatedTodos);
  }

  function completeTodo(id) {
    const updatedTodoList = todoList.map((todo) =>
      todo.id === id ? { ...todo, isCompleted: true } : todo,
    );
    setTodoList(updatedTodoList);
  }
  return (
    <>
    
      <TodoForm onAddTodo={addTodo} />
      <TodoList
        todoList={todoList}
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
      /></>
  );
}

export default TodosPage;
