import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useAuth } from '../context/AuthContext'
import { useMedia } from '../hooks/useMedia'
import { GripVertical, Trash2, Pencil, Upload, LogOut, MessageSquare, X, Check, FileText, Plus } from 'lucide-react'
import styles from './Admin.module.css'

export default function Admin() {
  const { user, signOut } = useAuth()
  const { media, loading, uploadMedia, updateMedia, deleteMedia, reorderMedia } = useMedia()
  const [tab, setTab] = useState('media')
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({ title: '', caption: '' })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  
  // Contacts Inbox States
  const [messages, setMessages] = useState([])
  const [msgsLoaded, setMsgsLoaded] = useState(false)

  // CMS Content States
  const [siteForm, setSiteForm] = useState({
    hero_name: '',
    hero_tagline: '',
    about_heading: '',
    about_body_1: '',
    about_body_2: '',
    about_highlight: '',
    testimonial_text: '',
    testimonial_author: ''
  })
  const [offeringsForm, setOfferingsForm] = useState([])
  const [stepsForm, setStepsForm] = useState([])
  const [contentLoading, setContentLoading] = useState(true)
  const [contentLoaded, setContentLoaded] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [dragOver, setDragOver] = useState(false)

  // Fetch contact inquiries
  const loadMessages = async () => {
    const token = localStorage.getItem('yoga_portfolio_token')
    try {
      const res = await fetch('/api/contacts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      console.error('Error loading contacts:', err)
    } finally {
      setMsgsLoaded(true)
    }
  }

  // Fetch CMS site content
  const loadSiteContent = async () => {
    setContentLoading(true)
    try {
      const res = await fetch('/api/content')
      if (res.ok) {
        const data = await res.json()
        if (data.site) setSiteForm(data.site)
        if (data.offerings) setOfferingsForm(data.offerings)
        if (data.steps) setStepsForm(data.steps)
        setContentLoaded(true)
      }
    } catch (err) {
      console.error('Error loading site content:', err)
    } finally {
      setContentLoading(false)
    }
  }

  const handleTabChange = (t) => {
    setTab(t)
    if (t === 'messages' && !msgsLoaded) loadMessages()
    if (t === 'content' && !contentLoaded) loadSiteContent()
  }

  const handleFileDrop = async (files) => {
    if (!files?.length) return
    setUploading(true)
    for (const file of Array.from(files)) {
      try {
        await uploadMedia(file, uploadForm)
      } catch (e) {
        alert('Upload failed: ' + e.message)
      }
    }
    setUploadForm({ title: '', caption: '' })
    setUploading(false)
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return
    const reordered = Array.from(media)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    reorderMedia(reordered)
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditForm({ title: item.title, caption: item.caption })
  }

  const saveEdit = async (id) => {
    await updateMedia(id, editForm)
    setEditingId(null)
  }

  const deleteMsg = async (id) => {
    const token = localStorage.getItem('yoga_portfolio_token')
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        setMessages(m => m.filter(x => x.id !== id))
      }
    } catch (err) {
      console.error('Error deleting message:', err)
    }
  }

  // --- CMS Content Management handlers ---
  const handleSiteFieldChange = (key, value) => {
    setSiteForm(f => ({ ...f, [key]: value }))
  }

  const handleOfferingChange = (index, field, value) => {
    const updated = [...offeringsForm]
    updated[index] = { ...updated[index], [field]: value }
    setOfferingsForm(updated)
  }

  const addOffering = () => {
    setOfferingsForm([...offeringsForm, { icon: '🧘', title: 'New Offering', description: '', sort_order: offeringsForm.length + 1 }])
  }

  const removeOffering = (index) => {
    setOfferingsForm(offeringsForm.filter((_, i) => i !== index))
  }

  const handleStepChange = (index, field, value) => {
    const updated = [...stepsForm]
    updated[index] = { ...updated[index], [field]: value }
    setStepsForm(updated)
  }

  const saveContentChanges = async (e) => {
    e.preventDefault()
    setSaveStatus('Saving content changes...')
    
    const token = localStorage.getItem('yoga_portfolio_token')
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          site: siteForm,
          offerings: offeringsForm,
          steps: stepsForm
        })
      })

      if (res.ok) {
        setSaveStatus('Site content saved successfully! 🙏')
        setTimeout(() => setSaveStatus(''), 4000)
      } else {
        const err = await res.json()
        setSaveStatus(`Error saving: ${err.error || 'Request failed'}`)
      }
    } catch (err) {
      setSaveStatus(`Network error: ${err.message}`)
    }
  }

  return (
    <div className={styles.page}>
      {/* Mobile Admin Header */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileTitle}>
          <span className={styles.mobileSymbol}>ॐ</span> Admin
        </div>
        <div className={styles.mobileNav}>
          <button 
            className={`${styles.mobileNavItem} ${tab === 'media' ? styles.mobileActive : ''}`} 
            onClick={() => handleTabChange('media')}
            title="Media Gallery"
          >
            <Upload size={18}/>
          </button>
          <button 
            className={`${styles.mobileNavItem} ${tab === 'content' ? styles.mobileActive : ''}`} 
            onClick={() => handleTabChange('content')}
            title="Site Content"
          >
            <FileText size={18}/>
          </button>
          <button 
            className={`${styles.mobileNavItem} ${tab === 'messages' ? styles.mobileActive : ''}`} 
            onClick={() => handleTabChange('messages')}
            title="Messages"
          >
            <MessageSquare size={18}/>
          </button>
          <button 
            className={styles.mobileSignOutBtn} 
            onClick={signOut}
            title="Sign Out"
          >
            <LogOut size={18}/>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <div className={styles.sideSymbol}>ॐ</div>
          <p className={styles.sideName}>Hritik Gorane</p>
          <p className={styles.sideEmail}>{user?.username || user?.email}</p>
        </div>
        <nav className={styles.sideNav}>
          <button className={`${styles.navItem} ${tab === 'media' ? styles.active : ''}`} onClick={() => handleTabChange('media')}>
            <Upload size={16}/> Media Gallery
          </button>
          <button className={`${styles.navItem} ${tab === 'content' ? styles.active : ''}`} onClick={() => handleTabChange('content')}>
            <FileText size={16}/> Site Content (CMS)
          </button>
          <button className={`${styles.navItem} ${tab === 'messages' ? styles.active : ''}`} onClick={() => handleTabChange('messages')}>
            <MessageSquare size={16}/> Messages
          </button>
        </nav>
        <button className={styles.signOutBtn} onClick={signOut}>
          <LogOut size={14}/> Sign Out
        </button>
      </aside>

      {/* Main Container */}
      <main className={styles.main}>
        
        {/* TAB 1: MEDIA GALLERY */}
        {tab === 'media' && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Media Gallery</h1>
              <p className={styles.pageDesc}>Upload photos & videos. Drag to reorder how they appear on your portfolio.</p>
            </div>

            {/* Upload zone */}
            <div
              className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFileDrop(e.dataTransfer.files) }}
            >
              <div className={styles.uploadIcon}>📸</div>
              <p className={styles.uploadText}>Drop photos or videos here</p>
              <p className={styles.uploadSub}>or</p>
              <label className={styles.uploadBtn}>
                Choose Files
                <input type="file" multiple accept="image/*,video/*" style={{ display: 'none' }}
                  onChange={e => handleFileDrop(e.target.files)} />
              </label>
              <div className={styles.uploadMeta}>
                <input
                  placeholder="Title (optional)"
                  value={uploadForm.title}
                  onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                  className={styles.metaInput}
                />
                <input
                  placeholder="Caption (optional)"
                  value={uploadForm.caption}
                  onChange={e => setUploadForm(f => ({ ...f, caption: e.target.value }))}
                  className={styles.metaInput}
                />
              </div>
              {uploading && <p className={styles.uploading}>Uploading... 🙏</p>}
            </div>

            {/* Media list with drag-and-drop */}
            {loading ? (
              <p className={styles.loading}>Loading gallery database...</p>
            ) : media.length === 0 ? (
              <p className={styles.empty}>No media yet. Upload your first photo or video above!</p>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="media-list">
                  {(provided) => (
                    <div className={styles.mediaList} {...provided.droppableProps} ref={provided.innerRef}>
                      {media.map((item, index) => (
                        <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                          {(provided, snapshot) => (
                            <div
                              className={`${styles.mediaItem} ${snapshot.isDragging ? styles.dragging : ''}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <div className={styles.dragHandle} {...provided.dragHandleProps}>
                                <GripVertical size={16} color="#8a8278"/>
                              </div>
                              <div className={styles.mediaThumb}>
                                {item.type === 'video'
                                  ? <video src={item.url} className={styles.thumb}/>
                                  : <img src={item.url} alt={item.title} className={styles.thumb}/>
                                }
                                <span className={styles.typeTag}>{item.type}</span>
                              </div>
                              <div className={styles.mediaInfo}>
                                {editingId === item.id ? (
                                  <div className={styles.editForm}>
                                    <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" className={styles.editInput}/>
                                    <input value={editForm.caption} onChange={e => setEditForm(f => ({ ...f, caption: e.target.value }))} placeholder="Caption" className={styles.editInput}/>
                                  </div>
                                ) : (
                                  <>
                                    <p className={styles.itemTitle}>{item.title || <em style={{color:'var(--muted)'}}>No title</em>}</p>
                                    <p className={styles.itemCaption}>{item.caption || ''}</p>
                                  </>
                                )}
                              </div>
                              <div className={styles.mediaActions}>
                                {editingId === item.id ? (
                                  <>
                                    <button className={styles.actionBtn} onClick={() => saveEdit(item.id)} title="Save"><Check size={15}/></button>
                                    <button className={styles.actionBtn} onClick={() => setEditingId(null)} title="Cancel"><X size={15}/></button>
                                  </>
                                ) : (
                                  <button className={styles.actionBtn} onClick={() => startEdit(item)} title="Edit"><Pencil size={15}/></button>
                                )}
                                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => { if(confirm('Delete this?')) deleteMedia(item.id) }} title="Delete">
                                  <Trash2 size={15}/>
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        )}

        {/* TAB 2: SITE CONTENT EDITOR (CMS) */}
        {tab === 'content' && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Site Content Editor</h1>
              <p className={styles.pageDesc}>Modify all page headings, paragraphs, offerings, steps and testimonials.</p>
            </div>

            {contentLoading ? (
              <p className={styles.loading}>Loading page content configurations...</p>
            ) : (
              <form onSubmit={saveContentChanges}>
                {/* HERO SECTION */}
                <div className={styles.formSection}>
                  <h2 className={styles.sectionLegend}>Hero Section</h2>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <label className={styles.formLabel}>Instructor Name</label>
                      <textarea
                        rows={2}
                        value={siteForm.hero_name}
                        onChange={e => handleSiteFieldChange('hero_name', e.target.value)}
                        className={styles.formTextarea}
                        placeholder="Use \n for italicizing the second word (e.g. Hritik\nGorane)"
                      />
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <label className={styles.formLabel}>Hero Tagline / Subtitle</label>
                      <textarea
                        rows={3}
                        value={siteForm.hero_tagline}
                        onChange={e => handleSiteFieldChange('hero_tagline', e.target.value)}
                        className={styles.formTextarea}
                      />
                    </div>
                  </div>
                </div>

                {/* ABOUT SECTION */}
                <div className={styles.formSection}>
                  <h2 className={styles.sectionLegend}>About Section (01)</h2>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <label className={styles.formLabel}>About Heading</label>
                      <input
                        type="text"
                        value={siteForm.about_heading}
                        onChange={e => handleSiteFieldChange('about_heading', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <label className={styles.formLabel}>About Description Paragraph 1</label>
                      <textarea
                        rows={4}
                        value={siteForm.about_body_1}
                        onChange={e => handleSiteFieldChange('about_body_1', e.target.value)}
                        className={styles.formTextarea}
                      />
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <label className={styles.formLabel}>About Description Paragraph 2 (Optional)</label>
                      <textarea
                        rows={4}
                        value={siteForm.about_body_2}
                        onChange={e => handleSiteFieldChange('about_body_2', e.target.value)}
                        className={styles.formTextarea}
                      />
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <label className={styles.formLabel}>Highlight Quote</label>
                      <textarea
                        rows={2}
                        value={siteForm.about_highlight}
                        onChange={e => handleSiteFieldChange('about_highlight', e.target.value)}
                        className={styles.formTextarea}
                      />
                    </div>
                  </div>
                </div>

                {/* TESTIMONIAL SECTION */}
                <div className={styles.formSection}>
                  <h2 className={styles.sectionLegend}>Testimonial Banner</h2>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <label className={styles.formLabel}>Quote Text</label>
                      <textarea
                        rows={3}
                        value={siteForm.testimonial_text}
                        onChange={e => handleSiteFieldChange('testimonial_text', e.target.value)}
                        className={styles.formTextarea}
                      />
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <label className={styles.formLabel}>Author & Attributes</label>
                      <input
                        type="text"
                        value={siteForm.testimonial_author}
                        onChange={e => handleSiteFieldChange('testimonial_author', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </div>

                {/* OFFERINGS LIST */}
                <div className={styles.formSection}>
                  <h2 className={styles.sectionLegend}>What I Offer (Grid)</h2>
                  
                  {offeringsForm.map((offering, idx) => (
                    <div key={idx} className={styles.listCard}>
                      <div className={styles.cardHeader}>
                        <span className={styles.cardNum}>Offering #{idx + 1}</span>
                        <button type="button" className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => removeOffering(idx)}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                      
                      <div className={styles.row}>
                        <div className={styles.col} style={{ flex: '0 0 100px', minWidth: '80px' }}>
                          <label className={styles.formLabel}>Emoji Icon</label>
                          <input
                            type="text"
                            value={offering.icon}
                            onChange={e => handleOfferingChange(idx, 'icon', e.target.value)}
                            className={styles.formInput}
                            style={{ textAlign: 'center' }}
                          />
                        </div>
                        <div className={styles.col}>
                          <label className={styles.formLabel}>Offering Title</label>
                          <input
                            type="text"
                            value={offering.title}
                            onChange={e => handleOfferingChange(idx, 'title', e.target.value)}
                            className={styles.formInput}
                          />
                        </div>
                      </div>
                      <div className={styles.row}>
                        <div className={styles.col}>
                          <label className={styles.formLabel}>Offering Description</label>
                          <textarea
                            rows={2}
                            value={offering.description}
                            onChange={e => handleOfferingChange(idx, 'description', e.target.value)}
                            className={styles.formTextarea}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button type="button" className={styles.addBtn} onClick={addOffering}>
                    <Plus size={14}/> Add New Offering
                  </button>
                </div>

                {/* APPROACH STEPS */}
                <div className={styles.formSection}>
                  <h2 className={styles.sectionLegend}>How I Teach (Steps)</h2>

                  {stepsForm.map((step, idx) => (
                    <div key={idx} className={styles.listCard}>
                      <div className={styles.row}>
                        <div className={styles.col} style={{ flex: '0 0 100px', minWidth: '80px' }}>
                          <label className={styles.formLabel}>Step Number</label>
                          <input
                            type="text"
                            value={step.step_num}
                            onChange={e => handleStepChange(idx, 'step_num', e.target.value)}
                            className={styles.formInput}
                          />
                        </div>
                        <div className={styles.col}>
                          <label className={styles.formLabel}>Step Title</label>
                          <input
                            type="text"
                            value={step.title}
                            onChange={e => handleStepChange(idx, 'title', e.target.value)}
                            className={styles.formInput}
                          />
                        </div>
                      </div>
                      <div className={styles.row}>
                        <div className={styles.col}>
                          <label className={styles.formLabel}>Step Description</label>
                          <textarea
                            rows={2}
                            value={step.description}
                            onChange={e => handleStepChange(idx, 'description', e.target.value)}
                            className={styles.formTextarea}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit row */}
                <div style={{ marginBottom: '40px' }}>
                  <button type="submit" className={styles.submitBtn}>
                    Save Changes
                  </button>
                  {saveStatus && <span className={styles.saveStatus}>{saveStatus}</span>}
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: CONTACT MESSAGES */}
        {tab === 'messages' && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Contact Messages</h1>
              <p className={styles.pageDesc}>People who reached out from your portfolio contact form.</p>
            </div>
            {!msgsLoaded ? (
              <p className={styles.loading}>Loading inbox messages...</p>
            ) : messages.length === 0 ? (
              <p className={styles.empty}>No messages yet.</p>
            ) : (
              <div className={styles.msgList}>
                {messages.map(msg => (
                  <div key={msg.id} className={styles.msgCard}>
                    <div className={styles.msgTop}>
                      <div>
                        <p className={styles.msgName}>{msg.name}</p>
                        <p className={styles.msgContact}>{msg.contact}</p>
                      </div>
                      <div className={styles.msgMeta}>
                        <span className={styles.msgDate}>{new Date(msg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <button className={styles.deleteBtn2} onClick={() => { if(confirm('Delete this message?')) deleteMsg(msg.id) }}><Trash2 size={14}/></button>
                      </div>
                    </div>
                    <p className={styles.msgText}>{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
