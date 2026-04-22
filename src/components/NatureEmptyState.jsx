import React from 'react';
import { STRINGS } from '../strings';

const NatureEmptyState = ({
  title = STRINGS.common.emptyStateTitle,
  body = STRINGS.common.emptyStateBody,
  action
}) => {
  return (
    <div className="empty-state" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      textAlign: 'center',
      animation: 'fadeInUp 0.6s ease-out'
    }}>
      <div className="illustration-container" style={{
        width: '240px',
        height: '180px',
        marginBottom: '1.5rem',
        position: 'relative'
      }}>
        {/* Hand-drawn style forest SVG */}
        <svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
          <path d="M40,120 Q60,80 80,120 Z" fill="#2D6A4F" opacity="0.8" />
          <path d="M70,130 Q90,70 110,130 Z" fill="#52B788" opacity="0.6" />
          <path d="M120,125 Q140,90 160,125 Z" fill="#1B4332" opacity="0.7" />
          <circle cx="150" cy="40" r="15" fill="#F4A261" opacity="0.3" />
          <path d="M20,135 L180,135" stroke="#6B4226" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <h3 style={{
        color: 'var(--nature-primary)',
        marginBottom: '0.5rem',
        fontSize: '1.25rem'
      }}>
        {title}
      </h3>

      <p style={{
        color: 'var(--text-muted)',
        maxWidth: '300px',
        lineHeight: '1.5',
        fontSize: '0.95rem',
        marginBottom: '1.5rem'
      }}>
        {body}
      </p>

      {action && (
        <button className="btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};

export default NatureEmptyState;
