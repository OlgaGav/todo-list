function FilterInput({ filterTerm, onFilterChange }) {
  return (
    <div>
      <label htmlFor="filterInput">Search todos:</label>
      <input
        id="filterInput"
        type="text"
        value={filterTerm}
        placeholder="Search by title..."
        onChange={(e) => onFilterChange(e.target.value)}
      ></input>
    </div>
  );
}

export default FilterInput;
