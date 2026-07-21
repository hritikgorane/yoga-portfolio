import { useState } from 'react'
import styles from './Gallery.module.css'

export default function Gallery({ media }) {
  const [lightbox, setLightbox] = useState(null)
  const [filter, setFilter] = useState('all')

  const filtered = media.filter(m => filter === 'all' || m.type === filter)

  return (
    <section className={styles.section} id="gallery">
      <div className={styles.header}>
        <p className="section-label">Gallery</p>
        <h2 className={styles.heading}>Practice in motion.</h2>
        <div className={styles.filters}>
          {['all','photo','video'].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
              onClick={() => setFilter(f)}
            >{f}</button>
          ))}
        </div>
      </div>
                                                                                                                            
      {filtered.length === 0 ? (
        <p className={styles.empty}>No media yet — check back soon.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className={styles.card}
              style={{ animationDelay: `${i * 0.06}s` }}
              onClick={() => setLightbox(item)}
            >
              {item.type === 'video' ? (
                <video src={item.url} className={styles.media} muted playsInline />
              ) : (
                <img src={item.url} alt={item.title || 'Yoga'} className={styles.media} loading="lazy" />
              )}
              <div className={styles.overlay}>
                <span className={styles.typeTag}>{item.type}</span>
                {item.title && <p className={styles.title}>{item.title}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.close} onClick={() => setLightbox(null)}>✕</button>
          <div className={styles.lightboxInner} onClick={e => e.stopPropagation()}>
            {lightbox.type === 'video' ? (
              <video src={lightbox.url} controls autoPlay className={styles.lightboxMedia} />
            ) : (
              <img src={lightbox.url} alt={lightbox.title} className={styles.lightboxMedia} />
            )}
            {(lightbox.title || lightbox.caption) && (
              <div className={styles.lightboxInfo}>
                {lightbox.title && <p className={styles.lightboxTitle}>{lightbox.title}</p>}
                {lightbox.caption && <p className={styles.lightboxCaption}>{lightbox.caption}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
