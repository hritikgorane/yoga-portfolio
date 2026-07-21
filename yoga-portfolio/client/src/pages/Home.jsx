import { useEffect, useState } from 'react'
import { useMedia } from '../hooks/useMedia'
import Gallery from '../components/Gallery'
import ContactSection from '../components/ContactSection'
import YogaCanvas from '../components/YogaCanvas'
import styles from './Home.module.css'

export default function Home() {
  const { media, loading: mediaLoading } = useMedia()
  const [content, setContent] = useState({
    hero_name: 'Hritik\nGorane',
    hero_tagline: "I don't teach yoga. I create the space for you to meet yourself — honestly, quietly, fully.",
    about_heading: 'A teacher, not a seller.',
    about_body_1: 'I am Hritik, a 22-year-old yoga and meditation instructor from Surat. I began this path not to build a brand or collect certificates — but because I genuinely believe in what yoga and meditation can unlock inside a human being.',
    about_body_2: 'I currently work with private clients, adapting my teaching to meet each person exactly where they are — physically, emotionally, and spiritually. That is the only way I know how to teach.',
    about_highlight: 'Yoga does not require a certificate. It requires truth. Anyone who teaches it otherwise is selling something.',
    testimonial_text: 'What I found in these sessions was not just physical improvement — I found a quietness I had forgotten I had.',
    testimonial_author: 'Private Client, 52 — Surat, India'
  })
  
  const [offerings, setOfferings] = useState([
    { icon: '🧘', title: 'Private Yoga Sessions', description: 'One-on-one sessions tailored to your body, pace and goals. In person or online.', sort_order: 1 },
    { icon: '🌬️', title: 'Meditation & Breathwork', description: 'Pranayama and meditation to create stillness, clarity and inner connection.', sort_order: 2 },
    { icon: '🌿', title: 'Yoga for Seniors', description: 'Gentle, adaptive yoga for those 45+. Pace, breath and presence — not performance.', sort_order: 3 },
    { icon: '🌱', title: 'Beginner Programs', description: 'Starting from scratch? Perfect. We build from the ground up, step by step.', sort_order: 4 },
    { icon: '📿', title: 'Yoga Philosophy', description: 'The history, sutras, and deeper meaning behind the practice.', sort_order: 5 },
    { icon: '🕊️', title: 'Ongoing Practice Plans', description: 'Monthly plans that evolve as you evolve, with regular feedback.', sort_order: 6 }
  ])

  const [steps, setSteps] = useState([
    { step_num: '01', title: 'I listen first', description: 'Before anything else, I observe you — your body, breath, energy. Every session begins with listening.', sort_order: 1 },
    { step_num: '02', title: 'I meet you where you are', description: 'Your practice belongs to you. I adapt every session to your current state, not a fixed program.', sort_order: 2 },
    { step_num: '03', title: 'I create space, not pressure', description: 'There is no rush, no comparison. The mat is a safe place. I hold that space with sincerity.', sort_order: 3 },
    { step_num: '04', title: 'I guide inward', description: 'My goal is not to teach you a pose. It is to help you discover the stillness already within you.', sort_order: 4 }
  ])

  const [contentLoading, setContentLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/content')
        if (res.ok) {
          const data = await res.json()
          if (data.site) setContent(data.site)
          if (data.offerings && data.offerings.length) setOfferings(data.offerings)
          if (data.steps && data.steps.length) setSteps(data.steps)
        }
      } catch (err) {
        console.error('Error fetching database content:', err)
      } finally {
        setContentLoading(false)
      }
    }
    fetchContent()
  }, [])

  useEffect(() => {
    if (mediaLoading || contentLoading) return
    const reveals = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting)
          setTimeout(() => entry.target.classList.add('visible'), i * 80)
      })
    }, { threshold: 0.1 })
    reveals.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [mediaLoading, contentLoading])

  // Split hero name for styling (e.g. Hritik\nGorane -> Hritik with Gorane in italics)
  const heroNameParts = content.hero_name.split('\n')
  const firstName = heroNameParts[0] || 'Hritik'
  const lastName = heroNameParts[1] || 'Gorane'

  return (
    <main>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <svg className={styles.mandalaBg} viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="95" stroke="#7a9e7e" strokeWidth="0.5"/>
            <circle cx="100" cy="100" r="70" stroke="#7a9e7e" strokeWidth="0.5"/>
            <circle cx="100" cy="100" r="45" stroke="#7a9e7e" strokeWidth="0.5"/>
            <line x1="100" y1="5" x2="100" y2="195" stroke="#7a9e7e" strokeWidth="0.3"/>
            <line x1="5" y1="100" x2="195" y2="100" stroke="#7a9e7e" strokeWidth="0.3"/>
            <line x1="33" y1="33" x2="167" y2="167" stroke="#7a9e7e" strokeWidth="0.3"/>
            <line x1="167" y1="33" x2="33" y2="167" stroke="#7a9e7e" strokeWidth="0.3"/>
            <polygon points="100,20 180,150 20,150" stroke="#c4a882" strokeWidth="0.4" fill="none"/>
            <polygon points="100,180 20,50 180,50" stroke="#c4a882" strokeWidth="0.4" fill="none"/>
          </svg>
          <p className={styles.eyebrow}>Surat, India · Yoga & Meditation</p>
          <h1 className={styles.heroName}>
            {firstName}
            <br/>
            {lastName && <em>{lastName}</em>}
          </h1>
          <p className={styles.tagline}>{content.hero_tagline}</p>
          <div className={styles.heroCta}>
            <a href="#contact" className={styles.btnPrimary}>Begin the Journey</a>
            <a href="#gallery" className={styles.btnGhost}>See My Work</a>
          </div>
        </div>
        <div className={styles.heroRight}>
          <YogaCanvas />
        </div>
      </section>

      {/* ABOUT */}
      <section className={styles.about} id="about">
        <div className="reveal">
          <div className={styles.aboutNum}>01</div>
        </div>
        <div className="reveal">
          <p className="section-label">Who I Am</p>
          <h2 className={styles.aboutHeading}>{content.about_heading}</h2>
          <p className={styles.aboutBody}>{content.about_body_1}</p>
          {content.about_body_2 && <p className={styles.aboutBody}>{content.about_body_2}</p>}
          <div className={styles.aboutHighlight}>
            <p>"{content.about_highlight}"</p>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      {!mediaLoading && <Gallery media={media} />}
      {mediaLoading && <div className={styles.galleryLoading}>Loading gallery...</div>}

      {/* OFFERINGS */}
      <section className={styles.offer} id="offer">
        <div className={`${styles.offerHeader} reveal`}>
          <p className="section-label" style={{ color: 'var(--sage)' }}>What I Offer</p>
          <h2 className={styles.offerHeading}>Sessions from the heart.</h2>
        </div>
        <div className={styles.offerGrid}>
          {offerings.map((item, i) => (
            <div key={item.id || i} className={`${styles.offerCard} reveal`}>
              <div className={styles.offerIcon}>{item.icon}</div>
              <h3 className={styles.offerTitle}>{item.title}</h3>
              <p className={styles.offerDesc}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* APPROACH */}
      <section className={styles.approach}>
        <div className={`${styles.approachHeader} reveal`}>
          <p className="section-label">How I Teach</p>
          <h2 className={styles.approachHeading}>No script. No performance. Only presence.</h2>
        </div>
        <div className={styles.steps}>
          {steps.map((s, i) => (
            <div key={s.id || i} className={`${styles.step} reveal`}>
              <span className={styles.stepNum}>{s.step_num}</span>
              <div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className={styles.testimonial}>
        <p className={`${styles.testimText} reveal`}>"{content.testimonial_text}"</p>
        <div className={`${styles.testimLine} reveal`}/>
        <p className={`${styles.testimAuthor} reveal`}>{content.testimonial_author}</p>
      </section>

      {/* CONTACT */}
      <ContactSection />

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>Hritik Gorane</div>
        <p className={styles.footerCopy}>© 2025 · Surat, India</p>
        <div className={styles.footerSocial}>
          <a href="#">Instagram</a>
          <a href="#">YouTube</a>
          <a href="#">WhatsApp</a>
        </div>
      </footer>
    </main>
  )
} 

  
