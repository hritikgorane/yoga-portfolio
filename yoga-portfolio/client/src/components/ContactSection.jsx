import { useState } from 'react'
import { useContact } from '../hooks/useContact'
import styles from './ContactSection.module.css'

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', contact: '', message: '' })
  const { sendMessage, sending, sent, error } = useContact()

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    if (!form.name || !form.contact || !form.message) return
    await sendMessage(form)
  }
  
  return (
    <section className={styles.section} id="contact">
      <div className={styles.inner}>
        <div className={`${styles.left} reveal`}>
          <p className="section-label" style={{ color: 'var(--sage)' }}>Let's Connect</p>
          <h2 className={styles.heading}>Ready to begin your inner journey?</h2>
          <p className={styles.sub}>I take a limited number of private students so I can give each one my full attention. Reach out — no pressure, just a conversation.</p>         
        </div>
        <div className={`${styles.right} reveal`}>
          {sent ? (
            <div className={styles.success}>         
              <span>🙏</span>
              <p>Message received. I'll be in touch soon.</p>
            </div>
          ) : (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Your Name</label>
                <input name="name" value={form.name} onChange={handle} className={styles.input} placeholder="What shall I call you?" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email or WhatsApp</label>
                <input name="contact" value={form.contact} onChange={handle} className={styles.input} placeholder="How can I reach you?" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>What are you looking for?</label>
                <textarea name="message" value={form.message} onChange={handle} className={styles.textarea} rows={4} placeholder="Tell me a little about yourself..." />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button className={styles.btn} onClick={submit} disabled={sending}>
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}


