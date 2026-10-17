import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomSelect - Accessible, dark-themed dropdown for HackFest 3.0
 * 
 * Features:
 * - Deep-ink / dark charcoal menu surface matching the HackFest theme
 * - Consistent border colors, corner radii and typography
 * - Subtle mint/green hover indicator and clear active/selected state
 * - Full keyboard navigation (ArrowUp, ArrowDown, Enter, Space, Escape, Tab)
 * - Outside click & touch dismissal
 * - High z-index floating menu so it never clips or overlaps lower elements
 * - Internal scrolling with clean custom scrollbar for long option lists
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  label,
  sublabel,
  name,
  id,
  disabled = false,
  required = false,
  error = false,
  style = {},
  triggerStyle = {},
  menuStyle = {},
  className = '',
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listboxRef = useRef(null);
  const triggerRef = useRef(null);

  // Normalize options array into { value, label, sublabel, disabled }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: String(opt), label: String(opt) };
    }
    return {
      value: opt.value !== undefined ? opt.value : opt.id,
      label: opt.label || opt.name || String(opt.value),
      sublabel: opt.sublabel || opt.description || null,
      disabled: Boolean(opt.disabled),
      badge: opt.badge || null,
    };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Sync highlighted option when opening
  useEffect(() => {
    if (isOpen) {
      const idx = normalizedOptions.findIndex((opt) => String(opt.value) === String(value));
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('[role="option"]');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (option) => {
    if (option.disabled || disabled) return;
    if (onChange) {
      // Support both direct value or synthetic event pattern
      onChange({
        target: {
          name: name || selectId,
          value: option.value,
        },
      });
    }
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = (prev + 1) % normalizedOptions.length;
          while (normalizedOptions[next]?.disabled && next !== prev) {
            next = (next + 1) % normalizedOptions.length;
          }
          return next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = (prev - 1 + normalizedOptions.length) % normalizedOptions.length;
          while (normalizedOptions[next]?.disabled && next !== prev) {
            next = (next - 1 + normalizedOptions.length) % normalizedOptions.length;
          }
          return next;
        });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex >= 0 && normalizedOptions[highlightedIndex]) {
          handleSelect(normalizedOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        fontFamily: 'inherit',
        ...style,
      }}
    >
      {/* Optional Form Label */}
      {label && (
        <label
          htmlFor={selectId}
          style={{
            display: 'block',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            color: error ? '#f87171' : 'var(--text-muted, #94a3b8)',
            letterSpacing: '0.05em',
            marginBottom: '0.4rem',
            textTransform: 'uppercase',
          }}
        >
          {label} {required && <span style={{ color: '#81C14B' }}>*</span>}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${selectId}-listbox`}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: disabled ? '#0B0F17' : '#111827',
          border: `1px solid ${
            error
              ? '#ef4444'
              : isOpen
              ? '#81C14B'
              : 'var(--border-medium, rgba(255, 255, 255, 0.14))'
          }`,
          borderRadius: 'var(--radius-sm, 6px)',
          color: selectedOption ? '#F6F4ED' : '#64748b',
          fontSize: '0.9rem',
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: isOpen
            ? '0 0 0 2px rgba(129, 193, 75, 0.25), 0 4px 12px rgba(0, 0, 0, 0.4)'
            : 'none',
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
          ...triggerStyle,
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flexGrow: 1,
            fontWeight: selectedOption ? 500 : 400,
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          size={16}
          style={{
            flexShrink: 0,
            color: isOpen ? '#81C14B' : 'var(--text-muted, #94a3b8)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease, color 0.2s ease',
          }}
        />
      </button>

      {/* Floating Menu Surface */}
      {isOpen && (
        <div
          ref={listboxRef}
          id={`${selectId}-listbox`}
          role="listbox"
          tabIndex={-1}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: '#0D131F', // Deep ink charcoal
            border: '1px solid rgba(129, 193, 75, 0.35)', // Subtle moss green border
            borderRadius: 'var(--radius-sm, 8px)',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.75), 0 0 20px rgba(129, 193, 75, 0.12)',
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '4px',
            overscrollBehavior: 'contain',
            ...menuStyle,
          }}
        >
          {normalizedOptions.length === 0 ? (
            <div
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                color: '#64748b',
                textAlign: 'center',
              }}
            >
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt, index) => {
              const isSelected = String(opt.value) === String(value);
              const isHighlighted = highlightedIndex === index;

              return (
                <div
                  key={`${opt.value}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.65rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '4px',
                    fontSize: '0.88rem',
                    lineHeight: '1.35',
                    cursor: opt.disabled ? 'not-allowed' : 'pointer',
                    background: isSelected
                      ? 'rgba(129, 193, 75, 0.18)'
                      : isHighlighted
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'transparent',
                    color: opt.disabled
                      ? '#475569'
                      : isSelected
                      ? '#81C14B' // Active mint green text
                      : isHighlighted
                      ? '#FFFFFF'
                      : '#E2E8F0',
                    borderLeft: isSelected
                      ? '3px solid #81C14B'
                      : isHighlighted
                      ? '3px solid rgba(129, 193, 75, 0.5)'
                      : '3px solid transparent',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: isSelected ? 600 : 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                      }}
                    >
                      {opt.label}
                    </div>
                    {opt.sublabel && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#94a3b8',
                          marginTop: '2px',
                        }}
                      >
                        {opt.sublabel}
                      </div>
                    )}
                  </div>

                  {opt.badge && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#94a3b8',
                        flexShrink: 0,
                      }}
                    >
                      {opt.badge}
                    </span>
                  )}

                  {isSelected && (
                    <Check
                      size={15}
                      style={{
                        color: '#81C14B',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
