import React from 'react';
import { Link } from 'react-router-dom';
import './Page.css';

function Page({ title, children, wide }) {
  return (
    <div className={`page-container ${wide ? 'page-container-wide' : ''}`}>
      <Link to="/" className="back-btn">← Back to Home</Link>
      <h1 className="page-title">{title}</h1>
      <div className="page-content">{children}</div>
    </div>
  );
}

export default Page;