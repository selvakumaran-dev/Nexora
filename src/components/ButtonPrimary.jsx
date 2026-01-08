import React from 'react'

export default function ButtonPrimary({ children, onClick, className = '' }) {
    return (
        <button
            onClick={onClick}
            className={`rounded-lg px-5 py-2.5 font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 hover:-translate-y-0.5 hover:shadow-xl ${className}`}
            style={{ background: 'var(--grad-primary)' }}
        >
            {children}
        </button>
    )
}
