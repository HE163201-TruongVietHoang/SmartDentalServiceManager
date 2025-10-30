import React from 'react';

function Table({ columns, data, children }) {
  return (
    <table className="table table-striped table-bordered align-middle">
      <thead className="table-light">
        <tr>
          {columns.map((col, idx) => (
            <th key={idx}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {children || data.map((row, idx) => (
          <tr key={idx}>
            {Object.values(row).map((cell, i) => (
              <td key={i}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
