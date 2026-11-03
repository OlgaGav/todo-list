import TodoListItem from './TodoListItem.jsx';

function TodoList({todoList, onCompleteTodo}) {

  const filteredTodoList = todoList.filter(todo => todo.isCompleted === false) 

  if (filteredTodoList.length === 0) {
    return "Add todo above to get started";
  }

  return (
      <ul>
        {filteredTodoList.map((todo) => (
          <TodoListItem key={todo.id} todo={todo} onCompleteTodo={onCompleteTodo} />
        ))}
      </ul>
  );
}

export default TodoList;
