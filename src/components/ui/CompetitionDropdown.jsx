import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Trophy, Code2, Lightbulb } from 'lucide-react';

export default function CompetitionDropdown({
  value,
  onChange,
  availableCompetitions = [],
  name = 'arena',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listboxRef = useRef(null);
  const triggerRef = useRef(null);

  const options = [
    {
      id: 'codeathon',
      name: 'Codeathon',
      badge: 'Day 1 • Individual',
      icon: Code2,
      isClosed: availableCompetitions.find((c) => c.id === 'codeathon')?.registrationOpen === false,
    },
    {
      id: 'ideathon',
      name: 'Ideathon',
      badge: 'Day 1 • Team 3–4',
      icon: Lightbulb,
      isClosed: availableCompetitions.find((c) => c.id === 'ideathon')?.registrationOpen === false,
    },
    {
      id: 'hackathon',
      name: 'Hackathon',
      badge: 'Day 2 • Team 3–4',
      icon: Trophy,
      isClosed: availableCompetitions.find((c) => c.id === 'hackathon')?.registrationOpen === false,
    },
  ];

  const selectedOption = options.find((opt) => opt.id === value) || options[0];

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

  // Sync highlighted index when opened
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex((opt) => opt.id === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value]);

  const selectOption = (opt) => {
    if (opt.isClosed) return;
    onChange({
      target: {
        name,
        value: opt.id,
      },
    });
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          selectOption(options[highlightedIndex]);
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

  const SelectedIcon = selectedOption.icon;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        userSelect: 'none',
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input for standard form serialization */}
      <input type="hidden" name={name} value={value} />

      {/* Dropdown Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="competition-listbox"
        aria-label="Select competition"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.8rem 1rem',
          background: 'rgba(11, 23, 17, 0.95)',
          border: isOpen ? '1px solid #39FF88' : '1px solid #1C382A',
          borderRadius: '8px',
          color: '#F4F4F5',
          fontFamily: 'var(--font-body)',
          fontSize: '0.94rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          boxShadow: isOpen
            ? '0 0 0 2px rgba(57, 255, 136, 0.2), 0 8px 24px rgba(0, 0, 0, 0.5)'
            : '0 4px 12px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'rgba(57, 255, 136, 0.1)',
              border: '1px solid rgba(57, 255, 136, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#39FF88',
              flexShrink: 0,
            }}
          >
            <SelectedIcon size={15} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontWeight: 600, color: '#FFFFFF', letterSpacing: '0.01em', lineHeight: '1.2' }}>
              {selectedOption.name}
            </span>
            <span style={{ fontSize: '0.76rem', color: '#9CA3AF', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em', marginTop: '2px' }}>
              {selectedOption.badge}
              {selectedOption.isClosed && ' • (REGISTRATION CLOSED)'}
            </span>
          </div>
        </div>

        <ChevronDown
          size={18}
          color="#9CA3AF"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            flexShrink: 0,
            marginLeft: '0.75rem',
          }}
        />
      </button>

      {/* Custom Dark Listbox Menu */}
      {isOpen && (
        <ul
          id="competition-listbox"
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 100,
            margin: 0,
            padding: '6px',
            listStyle: 'none',
            background: '#0B1711',
            border: '1px solid #1C382A',
            borderRadius: '10px',
            boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            maxHeight: '280px',
            overflowY: 'auto',
          }}
        >
          {options.map((opt, index) => {
            const isSelected = opt.id === value;
            const isHighlighted = index === highlightedIndex;
            const Icon = opt.icon;

            return (
              <li
                key={opt.id}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.isClosed}
                onClick={() => selectOption(opt)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '6px',
                  cursor: opt.isClosed ? 'not-allowed' : 'pointer',
                  background: isSelected
                    ? 'rgba(57, 255, 136, 0.12)'
                    : isHighlighted
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'transparent',
                  color: opt.isClosed ? '#6B7280' : isSelected ? '#FFFFFF' : '#D1D5DB',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  marginBottom: index < options.length - 1 ? '3px' : 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '5px',
                      background: isSelected
                        ? 'rgba(57, 255, 136, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected
                        ? '1px solid rgba(57, 255, 136, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? '#39FF88' : '#9CA3AF',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontWeight: isSelected ? 600 : 500,
                          fontSize: '0.92rem',
                          color: opt.isClosed ? '#6B7280' : isSelected ? '#39FF88' : '#F3F4F6',
                        }}
                      >
                        {opt.name}
                      </span>
                      {opt.isClosed && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#EF4444',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          CLOSED
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        color: isSelected ? '#A7F3D0' : '#9CA3AF',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.02em',
                        marginTop: '2px',
                      }}
                    >
                      {opt.badge}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <Check size={16} color="#39FF88" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
