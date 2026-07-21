import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Auto-close menu on path or section link navigation
  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''} ${menuOpen ? styles.navOpen : ''}`}>
      <Link to="/" className={styles.logo} onClick={() => setMenuOpen(false)}>Hritik Gorane</Link>
      
      {/* Hamburger toggle button */}
      <button 
        className={`${styles.hamburger} ${menuOpen ? styles.hamburgerActive : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Navigation Menu"
      >
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </button>

      <ul className={`${styles.links} ${menuOpen ? styles.linksOpen : ''}`}>
        {isHome && <>
          <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
          <li><a href="#gallery" onClick={() => setMenuOpen(false)}>Gallery</a></li>
          <li><a href="#offer" onClick={() => setMenuOpen(false)}>Offerings</a></li>
          <li><a href="#contact" onClick={() => setMenuOpen(false)}>Connect</a></li>
        </>}
        {!isHome && <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>}
      </ul>
    </nav>
  )
}
