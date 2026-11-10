import { useState, useRef } from "react";
import TextInputWithLabel from "./../shared/TextInputWithLabel";
import {isValidTodoTitle} from './../utils/todoValidation'

function TodoForm({ onAddTodo }) {
  const [workingTodoTitle, setWorkingTodoTitle] = useState("");
  const inputRef = useRef();

  const handleAddTodo = (event) => {
    event.preventDefault();
    onAddTodo(workingTodoTitle);
    setWorkingTodoTitle("");
    inputRef.current.focus();
  };

  return (
    <form onSubmit={handleAddTodo}>
      <TextInputWithLabel
        elementId="todoTitle"
        labelText="Todo"
        onChange={(event) => setWorkingTodoTitle(event.target.value)}
        ref={inputRef}
        value={workingTodoTitle}
      />

      <button type="submit" disabled={!isValidTodoTitle(workingTodoTitle)}>
        Add Todo
      </button>
    </form>
  );
}

export default TodoForm;
