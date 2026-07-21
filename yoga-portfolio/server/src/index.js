import express from 'express'
import cors from 'cors'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import pool from './db.js'
import { initDb } from './initDb.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Auto-create local uploads directory if it does not exist
const UPLOADS_DIR = path.resolve(__dirname, '../uploads')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Serve uploaded images/videos statically
app.use('/uploads', express.static(UPLOADS_DIR))

// Initialize the database on startup
await initDb()

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Access token missing' })

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' })
    req.user = user
    next()
  })
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${uniqueSuffix}${ext}`)
  }
})
const upload = multer({ storage })

// --- AUTH ROUTER ---

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE username = $1', [username])
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }
    const user = userRes.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: 'hritik.gorane@gmail.com', // fallback mock details for display
        user_metadata: {
          full_name: 'Hritik Gorane'
        }
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: 'hritik.gorane@gmail.com',
    user_metadata: {
      full_name: 'Hritik Gorane'
    }
  })
})

// --- SITE CONTENT ROUTER ---

app.get('/api/content', async (req, res) => {
  try {
    const siteRes = await pool.query('SELECT * FROM site_content')
    const siteObj = {}
    siteRes.rows.forEach(row => {
      siteObj[row.key] = row.value
    })

    const offeringsRes = await pool.query('SELECT * FROM offerings ORDER BY sort_order ASC')
    const stepsRes = await pool.query('SELECT * FROM approach_steps ORDER BY sort_order ASC')

    res.json({
      site: siteObj,
      offerings: offeringsRes.rows,
      steps: stepsRes.rows
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/content', authenticateToken, async (req, res) => {
  const { site, offerings, steps } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Update site content key-value fields
    if (site) {
      for (const key in site) {
        await client.query(
          'INSERT INTO site_content (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
          [key, site[key]]
        )
      }
    }

    // Replace offerings list (simplifies syncing orders, deletes, and edits)
    if (offerings && Array.isArray(offerings)) {
      await client.query('DELETE FROM offerings')
      for (let i = 0; i < offerings.length; i++) {
        const item = offerings[i]
        await client.query(
          'INSERT INTO offerings (icon, title, description, sort_order) VALUES ($1, $2, $3, $4)',
          [item.icon || '🧘', item.title || '', item.description || '', i + 1]
        )
      }
    }

    // Replace approach steps
    if (steps && Array.isArray(steps)) {
      await client.query('DELETE FROM approach_steps')
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        await client.query(
          'INSERT INTO approach_steps (step_num, title, description, sort_order) VALUES ($1, $2, $3, $4)',
          [step.step_num || `0${i+1}`, step.title || '', step.description || '', i + 1]
        )
      }
    }

    await client.query('COMMIT')
    res.json({ success: true })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// --- MEDIA GALLERY ROUTER ---

app.get('/api/media', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM media ORDER BY sort_order ASC')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/media/upload', authenticateToken, upload.single('file'), async (req, res) => {
  const { title, caption } = req.body
  if (!req.file) return res.status(400).json({ error: 'No media file attached' })

  try {
    const filename = req.file.filename
    const publicUrl = `/uploads/${filename}`
    const mime = req.file.mimetype
    const type = mime.startsWith('video') ? 'video' : 'photo'

    const maxOrderRes = await pool.query('SELECT COALESCE(MAX(sort_order), 0) as max_order FROM media')
    const nextOrder = maxOrderRes.rows[0].max_order + 1

    const result = await pool.query(
      'INSERT INTO media (url, storage_path, type, title, caption, sort_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [publicUrl, filename, type, title || '', caption || '', nextOrder]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/media/reorder', authenticateToken, async (req, res) => {
  const { reordered } = req.body
  if (!Array.isArray(reordered)) return res.status(400).json({ error: 'Invalid payload' })

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (let i = 0; i < reordered.length; i++) {
      const item = reordered[i]
      await client.query('UPDATE media SET sort_order = $1 WHERE id = $2', [i + 1, item.id])
    }
    await client.query('COMMIT')
    res.json({ success: true })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

app.put('/api/media/:id', authenticateToken, async (req, res) => {
  const { id } = req.params
  const { title, caption } = req.body
  try {
    const result = await pool.query(
      'UPDATE media SET title = $1, caption = $2 WHERE id = $3 RETURNING *',
      [title || '', caption || '', id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Media not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/media/:id', authenticateToken, async (req, res) => {
  const { id } = req.params
  try {
    const mediaRes = await pool.query('SELECT * FROM media WHERE id = $1', [id])
    if (mediaRes.rows.length === 0) return res.status(404).json({ error: 'Media not found' })

    const item = mediaRes.rows[0]

    // If local file, delete from disk
    if (item.storage_path) {
      const filepath = path.join(UPLOADS_DIR, item.storage_path)
      if (fs.existsSync(filepath)) {
        await fs.promises.unlink(filepath)
      }
    }

    await pool.query('DELETE FROM media WHERE id = $1', [id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- CONTACT INQUIRIES ROUTER ---

app.post('/api/contacts', async (req, res) => {
  const { name, contact, message } = req.body
  if (!name || !contact || !message) {
    return res.status(400).json({ error: 'Please provide all details' })
  }
  try {
    const result = await pool.query(
      'INSERT INTO contacts (name, contact, message) VALUES ($1, $2, $3) RETURNING *',
      [name, contact, message]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM contacts WHERE id = $1', [id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Root Health Check / Fallback
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() })
})

// Start Server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Express API server running on http://localhost:${PORT}`)
})
