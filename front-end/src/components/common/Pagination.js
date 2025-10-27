import React from 'react';
import Button from './Button';

function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
      <Button variant="secondary" onClick={onPrev} disabled={page <= 1}>Prev</Button>
      <span>{page} / {totalPages}</span>
      <Button variant="secondary" onClick={onNext} disabled={page >= totalPages}>Next</Button>
    </div>
  );
}

export default Pagination;
