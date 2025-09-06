import React, { useState } from 'react';

const SearchBar = ({ onSearch, placeholder = "Buscar...", className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={`search-bar ${className}`}>
      <div className="search-input-container">
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder={placeholder}
          className="search-input"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="search-clear-btn"
            style={{ background: 'transparent', border: 'none', position: 'absolute', right: '120px', boxShadow: 'none'}}
          >
            ×
          </button>
        )}
        <button type="submit" className="search-submit-btn">
          🔍
        </button>
      </div>
    </form>
  );
};

export default SearchBar;