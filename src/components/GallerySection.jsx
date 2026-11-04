import React, { useState, useEffect } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, Maximize2, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import HoloBadge from './ui/HoloBadge';
import { galleryService } from '../services/galleryService';

export default function GallerySection() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    let isMounted = true;
    galleryService.getPhotos('all').then((data) => {
      if (isMounted) {
        setPhotos(data || []);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev < filteredPhotos.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredPhotos.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, photos, activeCategory]);

  // Category tab filters
  const defaultCategories = ['all', 'opening ceremony', 'codeathon', 'ideathon', 'event moments'];
  const photoCategories = photos.map((p) => p.category?.toLowerCase()).filter(Boolean);
  const availableCategories = Array.from(new Set([...defaultCategories, ...photoCategories]));

  const filteredPhotos = photos.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  const activePhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section id="gallery" className="section" style={{ position: 'relative', padding: '5.5rem 0 4rem 0' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div className="section-header center" style={{ marginBottom: '2.5rem' }}>
          <HoloBadge variant="teal" icon={Camera}>
            EVENT ARCHIVE
          </HoloBadge>
          <h2 className="heading-section">
            PHOTO GALLERY
          </h2>
          <p className="section-lead">
            Visual chronicle of HackFest 3.0 — from opening keynotes and intense coding sprints to final stage demos.
          </p>

          {/* Category Filter Tabs */}
          {photos.length > 0 && availableCategories.length > 2 && (
            <div
              style={{
                display: 'inline-flex',
                gap: '0.45rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: '1.25rem',
                background: 'rgba(8, 10, 9, 0.7)',
                padding: '0.35rem 0.5rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-subtle, rgba(57, 255, 136, 0.15))',
              }}
            >
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '9999px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    border: activeCategory === cat ? '1px solid #39FF88' : '1px solid transparent',
                    background: activeCategory === cat ? 'rgba(57, 255, 136, 0.15)' : 'transparent',
                    color: activeCategory === cat ? '#39FF88' : 'var(--text-muted, #94A3B8)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cat === 'all' ? `ALL (${photos.length})` : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  height: '240px',
                  borderRadius: '12px',
                  background: 'rgba(11, 23, 17, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPhotos.length === 0 && (
          <div
            style={{
              maxWidth: '650px',
              margin: '0 auto',
              background: 'linear-gradient(145deg, rgba(11, 23, 17, 0.7) 0%, rgba(8, 10, 9, 0.9) 100%)',
              border: '1px dashed rgba(57, 255, 136, 0.2)',
              borderRadius: '16px',
              padding: '3.5rem 2rem',
              textAlign: 'center',
            }}
          >
            <Camera size={44} style={{ color: 'rgba(57, 255, 136, 0.4)', margin: '0 auto 1rem auto', display: 'block' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Gallery In Preparation
            </h3>
            <p style={{ color: 'var(--color-text-secondary, #94A3B8)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
              Event photographs and media captures will appear here once published by the HackFest 3.0 photography team.
            </p>
          </div>
        )}

        {/* Photos Grid */}
        {!loading && filteredPhotos.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setLightboxIndex(index)}
                style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#0B1711',
                  border: '1px solid var(--border-subtle, rgba(57, 255, 136, 0.2))',
                  cursor: 'pointer',
                  aspectRatio: '16 / 10',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                  transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(57, 255, 136, 0.5)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(57, 255, 136, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(57, 255, 136, 0.2)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5)';
                }}
              >
                {/* Image */}
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.4s ease',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.style.background = '#111827';
                  }}
                />

                {/* Top Badges */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.75rem',
                    right: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      background: 'rgba(8, 10, 9, 0.85)',
                      color: '#39FF88',
                      border: '1px solid rgba(57, 255, 136, 0.3)',
                      backdropFilter: 'blur(8px)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {photo.category || 'EVENT'}
                  </span>

                  {photo.upload_date && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        background: 'rgba(8, 10, 9, 0.85)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {formatDate(photo.upload_date)}
                    </span>
                  )}
                </div>

                {/* Bottom Overlay Info */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '1.75rem 1rem 0.85rem 1rem',
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 60%, transparent 100%)',
                    zIndex: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {photo.title}
                    </h4>
                    {photo.caption && (
                      <p
                        style={{
                          fontSize: '0.78rem',
                          color: '#CBD5E1',
                          margin: '0.2rem 0 0 0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {photo.caption}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(57, 255, 136, 0.15)',
                      border: '1px solid rgba(57, 255, 136, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#39FF88',
                      flexShrink: 0,
                    }}
                  >
                    <Maximize2 size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {activePhoto && (
          <div
            onClick={() => setLightboxIndex(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.94)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.25rem',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* Top Toolbar */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '4px',
                    background: 'rgba(57, 255, 136, 0.15)',
                    color: '#39FF88',
                    border: '1px solid rgba(57, 255, 136, 0.35)',
                    textTransform: 'uppercase',
                  }}
                >
                  {activePhoto.category || 'EVENT'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {lightboxIndex + 1} / {filteredPhotos.length}
                </span>
              </div>

              <button
                onClick={() => setLightboxIndex(null)}
                aria-label="Close Lightbox"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Central Image with Navigation Buttons */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                overflow: 'hidden',
              }}
            >
              {filteredPhotos.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredPhotos.length - 1));
                  }}
                  aria-label="Previous photo"
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    zIndex: 10,
                    background: 'rgba(0, 0, 0, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: '46px',
                    height: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <img
                src={activePhoto.image_url}
                alt={activePhoto.title}
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: '92vw',
                  maxHeight: '74vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
                }}
              />

              {filteredPhotos.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev < filteredPhotos.length - 1 ? prev + 1 : 0));
                  }}
                  aria-label="Next photo"
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    zIndex: 10,
                    background: 'rgba(0, 0, 0, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: '46px',
                    height: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Bottom Caption Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '900px',
                margin: '0 auto',
                textAlign: 'center',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: '0 0 0.3rem 0',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {activePhoto.title}
              </h3>
              {activePhoto.caption && (
                <p style={{ color: '#CBD5E1', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
                  {activePhoto.caption}
                </p>
              )}
              {activePhoto.upload_date && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.4rem' }}>
                  Uploaded on {formatDate(activePhoto.upload_date)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

