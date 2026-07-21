import { useState, useEffect } from 'react'

export function useMedia() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/media')
      if (res.ok) {
        const data = await res.json()
        setMedia(data)
      } else {
        console.error('Failed to fetch media')
      }
    } catch (err) {
      console.error('Error fetching media:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const uploadMedia = async (file, metadata) => {
    const token = localStorage.getItem('yoga_portfolio_token')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', metadata.title || '')
    formData.append('caption', metadata.caption || '')

    const res = await fetch('/api/media/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Upload failed')
    }

    const data = await res.json()
    await fetchMedia()
    return data
  }

  const updateMedia = async (id, updates) => {
    const token = localStorage.getItem('yoga_portfolio_token')
    const res = await fetch(`/api/media/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Update failed')
    }

    await fetchMedia()
  }

  const deleteMedia = async (id) => {
    const token = localStorage.getItem('yoga_portfolio_token')
    const res = await fetch(`/api/media/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Delete failed')
    }

    await fetchMedia()
  }

  const reorderMedia = async (reordered) => {
    // Optimistic UI update
    setMedia(reordered)

    try {
      const token = localStorage.getItem('yoga_portfolio_token')
      const res = await fetch('/api/media/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reordered })
      })

      if (!res.ok) {
        throw new Error('Reordering failed on server')
      }
    } catch (err) {
      console.error(err)
      // Rollback or refetch
      await fetchMedia()
    }
  }

  return { media, loading, uploadMedia, updateMedia, deleteMedia, reorderMedia, refetch: fetchMedia }
}
