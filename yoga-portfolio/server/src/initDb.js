import pool from './db.js'
import bcrypt from 'bcryptjs'

export async function initDb() {
  const client = await pool.connect()
  try {
    console.log('Initializing database tables...')

    // 1. User table for admin credentials
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Seed default admin credentials if none exist
    const userRes = await client.query('SELECT * FROM users LIMIT 1')
    if (userRes.rows.length === 0) {
      const adminUsername = process.env.ADMIN_USERNAME || 'admin'
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
      const passwordHash = await bcrypt.hash(adminPassword, 10)
      await client.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
        [adminUsername, passwordHash]
      )
      console.log(`Created default admin user: ${adminUsername}`)
    }

    // 2. Site text content store (key-value schema)
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_content (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL
      )
    `)

    // Seed standard site contents
    const contentRes = await client.query('SELECT * FROM site_content LIMIT 1')
    if (contentRes.rows.length === 0) {
      const defaultContent = [
        ['hero_name', 'Hritik\nGorane'],
        ['hero_tagline', "I don't teach yoga. I create the space for you to meet yourself — honestly, quietly, fully."],
        ['about_heading', 'A teacher, not a seller.'],
        ['about_body_1', 'I am Hritik, a 22-year-old yoga and meditation instructor from Surat. I began this path not to build a brand or collect certificates — but because I genuinely believe in what yoga and meditation can unlock inside a human being.'],
        ['about_body_2', 'I currently work with private clients, adapting my teaching to meet each person exactly where they are — physically, emotionally, and spiritually. That is the only way I know how to teach.'],
        ['about_highlight', 'Yoga does not require a certificate. It requires truth. Anyone who teaches it otherwise is selling something.'],
        ['testimonial_text', 'What I found in these sessions was not just physical improvement — I found a quietness I had forgotten I had.'],
        ['testimonial_author', 'Private Client, 52 — Surat, India']
      ]
      for (const [key, val] of defaultContent) {
        await client.query(
          'INSERT INTO site_content (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
          [key, val]
        )
      }
      console.log('Seeded default site text content.')
    }

    // 3. Offerings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS offerings (
        id SERIAL PRIMARY KEY,
        icon VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        sort_order INTEGER NOT NULL
      )
    `)

    // Seed default offerings
    const offeringsRes = await client.query('SELECT * FROM offerings LIMIT 1')
    if (offeringsRes.rows.length === 0) {
      const defaultOfferings = [
        ['🧘', 'Private Yoga Sessions', 'One-on-one sessions tailored to your body, pace and goals. In person or online.', 1],
        ['🌬️', 'Meditation & Breathwork', 'Pranayama and meditation to create stillness, clarity and inner connection.', 2],
        ['🌿', 'Yoga for Seniors', 'Gentle, adaptive yoga for those 45+. Pace, breath and presence — not performance.', 3],
        ['🌱', 'Beginner Programs', 'Starting from scratch? Perfect. We build from the ground up, step by step.', 4],
        ['📿', 'Yoga Philosophy', 'The history, sutras, and deeper meaning behind the practice.', 5],
        ['🕊️', 'Ongoing Practice Plans', 'Monthly plans that evolve as you evolve, with regular feedback.', 6]
      ]
      for (const [icon, title, description, sort_order] of defaultOfferings) {
        await client.query(
          'INSERT INTO offerings (icon, title, description, sort_order) VALUES ($1, $2, $3, $4)',
          [icon, title, description, sort_order]
        )
      }
      console.log('Seeded default offerings list.')
    }

    // 4. Approach steps table
    await client.query(`
      CREATE TABLE IF NOT EXISTS approach_steps (
        id SERIAL PRIMARY KEY,
        step_num VARCHAR(10) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        sort_order INTEGER NOT NULL
      )
    `)

    // Seed default approach steps
    const stepsRes = await client.query('SELECT * FROM approach_steps LIMIT 1')
    if (stepsRes.rows.length === 0) {
      const defaultSteps = [
        ['01', 'I listen first', 'Before anything else, I observe you — your body, breath, energy. Every session begins with listening.', 1],
        ['02', 'I meet you where you are', 'Your practice belongs to you. I adapt every session to your current state, not a fixed program.', 2],
        ['03', 'I create space, not pressure', 'There is no rush, no comparison. The mat is a safe place. I hold that space with sincerity.', 3],
        ['04', 'I guide inward', 'My goal is not to teach you a pose. It is to help you discover the stillness already within you.', 4]
      ]
      for (const [step_num, title, description, sort_order] of defaultSteps) {
        await client.query(
          'INSERT INTO approach_steps (step_num, title, description, sort_order) VALUES ($1, $2, $3, $4)',
          [step_num, title, description, sort_order]
        )
      }
      console.log('Seeded default approach steps.')
    }

    // 5. Media gallery table
    await client.query(`
      CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        storage_path VARCHAR(255) DEFAULT '',
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) DEFAULT '',
        caption TEXT DEFAULT '',
        sort_order INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Seed default media items
    const mediaRes = await client.query('SELECT * FROM media LIMIT 1')
    if (mediaRes.rows.length === 0) {
      const defaultMedia = [
        ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', '', 'photo', 'Sun Salutation', 'Greeting the morning light at Surat beachfront.', 1],
        ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80', '', 'photo', 'Deep Meditation', 'Quietness in breath, clarity in mind.', 2],
        ['https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=800&q=80', '', 'photo', 'Vinyasa Flow', 'Finding fluidity, balance, and core strength.', 3],
        ['https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80', '', 'photo', 'Forest Zen', "Connecting with nature's quiet rhythm.", 4]
      ]
      for (const [url, storage_path, type, title, caption, sort_order] of defaultMedia) {
        await client.query(
          'INSERT INTO media (url, storage_path, type, title, caption, sort_order) VALUES ($1, $2, $3, $4, $5, $6)',
          [url, storage_path, type, title, caption, sort_order]
        )
      }
      console.log('Seeded default media items.')
    }

    // 6. Contact inquiries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('All database tables initialized and verified.')
  } catch (err) {
    console.error('Database initialization error:', err)
  } finally {
    client.release()
  }
}
