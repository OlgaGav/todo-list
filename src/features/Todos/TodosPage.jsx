import { useState, useEffect, useCallback, useMemo } from "react";
import TodoList from "./TodoList/TodoList.jsx";
import TodoForm from "./TodoForm.jsx";
import { isValidTodoTitle } from "@/utils/todoValidation";
import SortBy from "@/shared/SortBy.jsx";
import useDebounce from "@/utils/useDebounce.js";
import FilterInput from "@/shared/FilterInput.jsx";

function TodosPage({ token }) {
  const [todoList, setTodoList] = useState([]);
  const [error, setError] = useState("");
  const [isTodoListLoading, setIsTodoListLoading] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterTerm, setFilterTerm] = useState("");
  const [dataVersion, setDataVersion] = useState(0);
  const debouncedFilterTerm = useDebounce(filterTerm, 300);

  const handleFilterChange = (newTerm) => {
    setFilterTerm(newTerm);
  };

  const invalidateCache = useCallback(() => {
    setDataVersion((prev) => prev + 1);
    console.log("Invalidating memo cache after todo mutation");
  }, []);

  useEffect(() => {
    async function fetchTodos() {
      setIsTodoListLoading(true);

      try {
        const paramsObject = {
          sortBy,
          sortDirection,
          limit: 100,
        };
        if (debouncedFilterTerm) {
          paramsObject.find = debouncedFilterTerm;
        }
        const params = new URLSearchParams(paramsObject);
        const options = {
          headers: { "X-CSRF-TOKEN": token },
          credentials: "include",
        };
        const response = await fetch(`/api/tasks?${params}`, options);

        if (response.status === 401) {
          throw new Error("unauthorized");
        }
        if (!response.ok) {
          throw new Error(`Could not load todos (${response.status})`);
        }
        const data = await response.json();
        setTodoList(data.tasks);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsTodoListLoading(false);
      }
    }
    if (token) {
      fetchTodos();
    }
  }, [token, sortBy, sortDirection, debouncedFilterTerm]);

  async function addTodo(title) {
    if (!isValidTodoTitle(title)) return;
    const newTodo = { id: Date.now(), title, isCompleted: false };
    setTodoList((previous) => [newTodo, ...previous]);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token },
        credentials: "include",
        body: JSON.stringify({ title, isCompleted: false }),
      });
      if (!response.ok) {
        throw new Error(`Could not add todo (${response.status})`);
      }
      const savedTodo = await response.json();
      setTodoList((previous) =>
        previous.map((todo) => (todo.id === newTodo.id ? savedTodo : todo)),
      );
      invalidateCache();
    } catch (error) {
      setTodoList((previous) =>
        previous.filter((todo) => todo.id !== newTodo.id),
      );
      setError(error.message);
    }
  }

  async function updateTodo(editedTodo) {
    const originalTodo = todoList.find((todo) => todo.id === editedTodo.id);
    setTodoList((previous) =>
      previous.map((todo) => (todo.id === editedTodo.id ? editedTodo : todo)),
    );
    try {
      const response = await fetch(`/api/tasks/${editedTodo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token },
        credentials: "include",
        body: JSON.stringify({
          title: editedTodo.title,
          isCompleted: editedTodo.isCompleted,
        }),
      });
      if (!response.ok) {
        throw new Error(`Could not update todo (${response.status})`);
      }
      invalidateCache();
    } catch (error) {
      setTodoList((previous) =>
        previous.map((todo) =>
          todo.id === editedTodo.id ? originalTodo : todo,
        ),
      );
      setError(error.message);
    }
  }

  async function completeTodo(id) {
    const originalTodo = todoList.find((todo) => todo.id === id);
    setTodoList((previous) =>
      previous.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: true } : todo,
      ),
    );
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token },
        credentials: "include",
        body: JSON.stringify({ isCompleted: true }),
      });
      if (!response.ok) {
        throw new Error(`Could not complete todo (${response.status})`);
      }
      invalidateCache();
    } catch (error) {
      setTodoList((previous) =>
        previous.map((todo) => (todo.id === id ? originalTodo : todo)),
      );
      setError(error.message);
    }
  }

  const filteredTodoList = useMemo(() => {
    console.log(`Recalculating filtered todos (v${dataVersion})`);
    return {
      version: dataVersion,
      todos: todoList.filter((todo) => !todo.completed),
    };
  }, [todoList, dataVersion]);

  return (
    <div>
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError("")}>Clear Error</button>
        </div>
      )}
      {isTodoListLoading && <p>Loading todos…</p>}

      <SortBy
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortByChange={setSortBy}
        onSortDirectionChange={setSortDirection}
      />
      <FilterInput
        filterTerm={filterTerm}
        onFilterChange={handleFilterChange}
      />
      <TodoForm onAddTodo={addTodo} />
      <TodoList
        todoList={todoList}
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
        dataVersion={dataVersion}
      />
    </div>
  );
}

export default TodosPage;
