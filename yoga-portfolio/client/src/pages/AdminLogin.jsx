import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) return
    setError('')
    setSubmitting(true)
    try {
      await signIn(username, password)
    } catch (err) {
      setError(err.message || 'Invalid username or password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.symbol}>ॐ</div>
        <h1 className={styles.title}>Hritik Gorane</h1>
        <p className={styles.sub}>Admin Portal</p>
        <div className={styles.divider}/>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.field}>
          <label className={styles.label}>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            className={styles.input} 
            placeholder="Enter username"
            required
          />
        </div>
        
        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className={styles.input} 
            placeholder="Enter password"
            required
          />
        </div>

        <button type="submit" className={styles.loginBtn} disabled={submitting}>
          {submitting ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
