import { useState } from 'react'

export function useContact() {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = async ({ name, contact, message }) => {
    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, contact, message })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to send message')
      }

      setSent(true)
      return true
    } catch (err) {
      console.error(err)
      setError(err.message)
      return false
    } finally {
      setSending(false)
    }
  }

  return { sendMessage, sending, sent, error }
}
