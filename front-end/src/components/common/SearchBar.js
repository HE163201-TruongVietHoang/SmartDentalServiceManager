import React from 'react';

function SearchBar({ value, onChange, placeholder }) {
  return (
    <input
      className="form-control mb-3"
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder || 'Tìm kiếm...'}
      style={{ maxWidth: 300 }}
    />
  );
}

export default SearchBar;
