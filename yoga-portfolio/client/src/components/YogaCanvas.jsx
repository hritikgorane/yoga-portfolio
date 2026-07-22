import { useEffect, useRef, useState } from 'react'
import styles from './YogaCanvas.module.css'

// Pose joint coordinates in 3D space (projected to 2D at render time)
const POSES = {
  tadasana: {
    name: 'Tadasana',
    sanskrit: 'ताडासन · Mountain Pose',
    desc: 'The foundation of all standing postures. Focuses on vertical alignment and centering.',
    joints: {
      hips: { x: 0, y: -0.1, z: 0 },
      spine: { x: 0, y: 0.1, z: 0 },
      chest: { x: 0, y: 0.3, z: 0 },
      neck: { x: 0, y: 0.4, z: 0 },
      head: { x: 0, y: 0.52, z: 0 },
      lShoulder: { x: -0.15, y: 0.3, z: 0 },
      lElbow: { x: -0.18, y: 0.05, z: 0 },
      lWrist: { x: -0.18, y: -0.2, z: 0 },
      rShoulder: { x: 0.15, y: 0.3, z: 0 },
      rElbow: { x: 0.18, y: 0.05, z: 0 },
      rWrist: { x: 0.18, y: -0.2, z: 0 },
      lHip: { x: -0.1, y: -0.1, z: 0 },
      lKnee: { x: -0.1, y: -0.4, z: 0 },
      lAnkle: { x: -0.1, y: -0.7, z: 0 },
      rHip: { x: 0.1, y: -0.1, z: 0 },
      rKnee: { x: 0.1, y: -0.4, z: 0 },
      rAnkle: { x: 0.1, y: -0.7, z: 0 }
    }
  },
  vrksasana: {
    name: 'Vrksasana',
    sanskrit: 'वृक्षासन · Tree Pose',
    desc: 'A standing balance pose that cultivates steady focus, patience, and foot grounding.',
    joints: {
      hips: { x: 0, y: -0.1, z: 0 },
      spine: { x: 0, y: 0.1, z: 0 },
      chest: { x: 0, y: 0.3, z: 0 },
      neck: { x: 0, y: 0.4, z: 0 },
      head: { x: 0, y: 0.52, z: 0 },
      lShoulder: { x: -0.15, y: 0.3, z: 0 },
      lElbow: { x: -0.18, y: 0.55, z: 0 },
      lWrist: { x: -0.05, y: 0.72, z: 0 },
      rShoulder: { x: 0.15, y: 0.3, z: 0 },
      rElbow: { x: 0.18, y: 0.55, z: 0 },
      rWrist: { x: 0.05, y: 0.72, z: 0 },
      lHip: { x: -0.1, y: -0.1, z: 0 },
      lKnee: { x: -0.1, y: -0.4, z: 0 },
      lAnkle: { x: -0.1, y: -0.7, z: 0 },
      rHip: { x: 0.1, y: -0.1, z: 0 },
      rKnee: { x: 0.32, y: -0.25, z: 0.15 },
      rAnkle: { x: 0.1, y: -0.4, z: 0 }
    }
  },
  samakonasana: {
    name: 'Samakonasana',
    sanskrit: 'समकोणासन · Straight Angle Splits',
    desc: 'An intense lateral split that demonstrates active flexibility and deep hip opening.',
    joints: {
      hips: { x: 0, y: -0.5, z: 0 },
      spine: { x: 0, y: -0.3, z: 0 },
      chest: { x: 0, y: -0.1, z: 0 },
      neck: { x: 0, y: 0.0, z: 0 },
      head: { x: 0, y: 0.12, z: 0 },
      lShoulder: { x: -0.15, y: -0.1, z: 0 },
      lElbow: { x: -0.4, y: -0.1, z: 0 },
      lWrist: { x: -0.65, y: -0.1, z: 0 },
      rShoulder: { x: 0.15, y: -0.1, z: 0 },
      rElbow: { x: 0.4, y: -0.1, z: 0 },
      rWrist: { x: 0.65, y: -0.1, z: 0 },
      lHip: { x: -0.1, y: -0.5, z: 0 },
      lKnee: { x: -0.45, y: -0.5, z: 0 },
      lAnkle: { x: -0.8, y: -0.5, z: 0 },
      rHip: { x: 0.1, y: -0.5, z: 0 },
      rKnee: { x: 0.45, y: -0.5, z: 0 },
      rAnkle: { x: 0.8, y: -0.5, z: 0 }
    }
  },
  paschimottanasana: {
    name: 'Paschimottanasana',
    sanskrit: 'पश्चिमोट्टानासन · Seated Forward Bend',
    desc: 'A deep forward fold stretching the entire back side of the body, calming the heart.',
    joints: {
      hips: { x: 0.3, y: -0.5, z: 0 },
      spine: { x: 0.1, y: -0.4, z: 0 },
      chest: { x: -0.1, y: -0.35, z: 0 },
      neck: { x: -0.22, y: -0.38, z: 0 },
      head: { x: -0.32, y: -0.4, z: 0 },
      lShoulder: { x: -0.08, y: -0.38, z: -0.1 },
      lElbow: { x: -0.28, y: -0.42, z: -0.1 },
      lWrist: { x: -0.48, y: -0.46, z: -0.05 },
      rShoulder: { x: -0.08, y: -0.32, z: 0.1 },
      rElbow: { x: -0.28, y: -0.38, z: 0.1 },
      rWrist: { x: -0.48, y: -0.44, z: 0.05 },
      lHip: { x: 0.2, y: -0.5, z: -0.05 },
      lKnee: { x: -0.15, y: -0.5, z: -0.05 },
      lAnkle: { x: -0.5, y: -0.5, z: -0.05 },
      rHip: { x: 0.2, y: -0.5, z: 0.05 },
      rKnee: { x: -0.15, y: -0.5, z: 0.05 },
      rAnkle: { x: -0.5, y: -0.5, z: 0.05 }
    }
  },
  yoganidrasana: {
    name: 'Yoganidrasana',
    sanskrit: 'योगनिद्रासन · Yogi Sleep Pose',
    desc: 'An advanced supine fold where both legs wrap behind the neck, cultivating absolute quietness.',
    joints: {
      hips: { x: 0, y: -0.4, z: 0 },
      spine: { x: 0, y: -0.2, z: -0.1 },
      chest: { x: 0, y: 0.0, z: -0.15 },
      neck: { x: 0, y: 0.1, z: -0.1 },
      head: { x: 0, y: 0.22, z: -0.05 },
      lShoulder: { x: -0.15, y: 0.0, z: -0.1 },
      lElbow: { x: -0.25, y: -0.2, z: 0.0 },
      lWrist: { x: -0.1, y: -0.35, z: 0.1 },
      rShoulder: { x: 0.15, y: 0.0, z: -0.1 },
      rElbow: { x: 0.25, y: -0.2, z: 0.0 },
      rWrist: { x: 0.1, y: -0.35, z: 0.1 },
      lHip: { x: -0.1, y: -0.4, z: 0 },
      lKnee: { x: -0.3, y: -0.05, z: 0.1 },
      lAnkle: { x: -0.05, y: 0.12, z: -0.05 },
      rHip: { x: 0.1, y: -0.4, z: 0 },
      rKnee: { x: 0.3, y: -0.05, z: 0.1 },
      rAnkle: { x: 0.05, y: 0.12, z: -0.05 }
    }
  }
}

// Connections between joints (bones)
const BONES = [
  ['hips', 'spine'],
  ['spine', 'chest'],
  ['chest', 'neck'],
  ['neck', 'head'],
  ['chest', 'lShoulder'],
  ['lShoulder', 'lElbow'],
  ['lElbow', 'lWrist'],
  ['chest', 'rShoulder'],
  ['rShoulder', 'rElbow'],
  ['rElbow', 'rWrist'],
  ['hips', 'lHip'],
  ['lHip', 'lKnee'],
  ['lKnee', 'lAnkle'],
  ['hips', 'rHip'],
  ['rHip', 'rKnee'],
  ['rKnee', 'rAnkle']
]

const copyCoords = (coords) => {
  const copy = {}
  for (const k in coords) {
    copy[k] = { x: coords[k].x, y: coords[k].y, z: coords[k].z }
  }
  return copy
}

export default function YogaCanvas() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [activePoseKey, setActivePoseKey] = useState('tadasana')
  const [loading, setLoading] = useState(true)

  const activePoseKeyRef = useRef(activePoseKey)
  const currentPositionsRef = useRef(null)

  if (!currentPositionsRef.current) {
    currentPositionsRef.current = copyCoords(POSES.tadasana.joints)
  }

  useEffect(() => {
    activePoseKeyRef.current = activePoseKey
  }, [activePoseKey])

  useEffect(() => {
    setLoading(false)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let rotationAngleY = 0
    let rotationAngleX = 0
    let lastTime = performance.now()

    let isDragging = false
    let previousMousePosition = { x: 0, y: 0 }

    const handleMouseDown = (e) => {
      isDragging = true
      previousMousePosition = { x: e.clientX, y: e.clientY }
    }
    const handleMouseMove = (e) => {
      if (!isDragging) return
      const deltaX = e.clientX - previousMousePosition.x
      const deltaY = e.clientY - previousMousePosition.y
      rotationAngleY += deltaX * 0.01
      rotationAngleX += deltaY * 0.01
      previousMousePosition = { x: e.clientX, y: e.clientY }
    }
    const handleMouseUp = () => {
      isDragging = false
    }
    const handleTouchStart = (e) => {
      isDragging = true
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const handleTouchMove = (e) => {
      if (!isDragging) return
      const deltaX = e.touches[0].clientX - previousMousePosition.x
      const deltaY = e.touches[0].clientY - previousMousePosition.y
      rotationAngleY += deltaX * 0.01
      rotationAngleX += deltaY * 0.01
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleMouseUp)

    // Handle high DPI screens
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const tick = (time) => {
      const deltaTime = (time - lastTime) / 1000
      lastTime = time

      const width = canvas.width / (window.devicePixelRatio || 1)
      const height = canvas.height / (window.devicePixelRatio || 1)

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // 1. Draw Background Cream Color (matching site's --cream #f5f0e8)
      ctx.fillStyle = '#f5f0e8'
      ctx.fillRect(0, 0, width, height)

      // Get target pose joints
      const targetPose = POSES[activePoseKeyRef.current].joints

      // 2. Interpolate current positions towards target
      const lerpSpeed = 0.08 // speed of morphing
      for (const joint in currentPositionsRef.current) {
        const curr = currentPositionsRef.current[joint]
        const dest = targetPose[joint]
        curr.x += (dest.x - curr.x) * lerpSpeed
        curr.y += (dest.y - curr.y) * lerpSpeed
        curr.z += (dest.z - curr.z) * lerpSpeed
      }

      // 3. Manual rotation handled by event listeners

      // 4. Set up center and scale
      const centerX = width / 2
      const isMobile = width < 900
      const centerY = height / 2 - (isMobile ? 70 : 20)
      const scale = Math.min(width, height) * (isMobile ? 0.38 : 0.45)

      // 5. Draw concentric rotating mandala floor rings (ellipses in perspective)
      // Ground center corresponds to y = -0.6
      const baseY = centerY - (-0.6) * scale // ground center position

      const drawMandalaRings = () => {
        ctx.save()
        // concentric rings
        const ringRadii = [0.45, 0.65, 0.85] // scaled multipliers
        const ringOpacities = [0.18, 0.12, 0.08]
        const ringSpeeds = [0.03, -0.02, 0.01]

        ringRadii.forEach((rMult, idx) => {
          const rx = scale * rMult
          const ry = rx * 0.22 // perspective flatten

          ctx.beginPath()
          ctx.ellipse(centerX, baseY, rx, ry, 0, 0, 2 * Math.PI)
          ctx.strokeStyle = '#7a9e7e'
          ctx.lineWidth = 1
          ctx.globalAlpha = ringOpacities[idx]

          // Set dashed line pattern and rotate by animating dashOffset
          const dashLen = 8
          const gapLen = 12
          ctx.setLineDash([dashLen, gapLen])
          // Direction and speed of ring rotation
          const speedFactor = ringSpeeds[idx] * time * 0.1
          ctx.lineDashOffset = speedFactor
          ctx.stroke()
        })
        ctx.restore()
      }

      drawMandalaRings()

      // 6. Project 3D coordinates to 2D
      const projected = {}

      for (const name in currentPositionsRef.current) {
        const p = currentPositionsRef.current[name]

        const y = p.y

        // Apply rotation around the X-axis (up/down)
        const cosX = Math.cos(rotationAngleX)
        const sinX = Math.sin(rotationAngleX)
        const rotY1 = y * cosX - p.z * sinX
        const rotZ1 = y * sinX + p.z * cosX

        // Apply rotation around the Y-axis (left/right)
        const cosY = Math.cos(rotationAngleY)
        const sinY = Math.sin(rotationAngleY)
        const rotX2 = p.x * cosY - rotZ1 * sinY
        const rotZ2 = p.x * sinY + rotZ1 * cosY

        // 2D projection
        projected[name] = {
          x: centerX + rotX2 * scale,
          y: centerY - rotY1 * scale,
          z: rotZ2
        }
      }

      // 7. Render bones (lines)
      // Sort bones by their average depth (Z) to draw from back to front
      const bonesWithDepth = BONES.map(bone => {
        const p1 = projected[bone[0]]
        const p2 = projected[bone[1]]
        const avgZ = (p1.z + p2.z) / 2
        return { bone, p1, p2, avgZ }
      })

      bonesWithDepth.sort((a, b) => a.avgZ - b.avgZ)

      bonesWithDepth.forEach(({ p1, p2, avgZ }) => {
        ctx.save()

        // Depth-based fade (mapping Z from approx -0.7 to 0.7 to opacity and width)
        const depthFactor = (avgZ + 0.8) / 1.6 // 0 to 1
        const opacity = 0.35 + Math.max(0, Math.min(1, depthFactor)) * 0.45
        const widthMultiplier = 0.5 + Math.max(0, Math.min(1, depthFactor)) * 0.7

        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)

        // Sage green color (#7a9e7e) with depth-based opacity
        ctx.strokeStyle = `rgba(122, 158, 126, ${opacity})`
        ctx.lineWidth = 9 * widthMultiplier * (scale / 220)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // Soft drop shadow to make it feel premium & volumetric
        ctx.shadowColor = 'rgba(26, 38, 32, 0.04)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetY = 2

        ctx.stroke()
        ctx.restore()
      })

      // 8. Render Special Parts (Pelvis and Head)
      // A. Pelvis oval
      const pelvisProj = projected['hips']
      if (pelvisProj) {
        ctx.save()
        const depthFactor = (pelvisProj.z + 0.8) / 1.6
        const opacity = 0.4 + Math.max(0, Math.min(1, depthFactor)) * 0.4
        const sizeMult = 0.6 + Math.max(0, Math.min(1, depthFactor)) * 0.6

        ctx.beginPath()
        const radiusX = 14 * sizeMult * (scale / 220)
        const radiusY = 10 * sizeMult * (scale / 220)
        ctx.ellipse(pelvisProj.x, pelvisProj.y, radiusX, radiusY, 0, 0, 2 * Math.PI)
        ctx.fillStyle = `rgba(122, 158, 126, ${opacity})`
        ctx.fill()

        // Gold trim
        ctx.strokeStyle = `rgba(196, 168, 130, ${opacity + 0.2})`
        ctx.lineWidth = 2 * (scale / 220)
        ctx.stroke()
        ctx.restore()
      }

      // B. Head sphere
      const headProj = projected['head']
      const neckProj = projected['neck']
      if (headProj && neckProj) {
        ctx.save()
        const depthFactor = (headProj.z + 0.8) / 1.6
        const opacity = 0.4 + Math.max(0, Math.min(1, depthFactor)) * 0.4
        const sizeMult = 0.6 + Math.max(0, Math.min(1, depthFactor)) * 0.6

        // Head is positioned a bit higher from neck
        const headRadius = 18 * sizeMult * (scale / 220)

        // Draw head skull
        ctx.beginPath()
        ctx.arc(headProj.x, headProj.y, headRadius, 0, 2 * Math.PI)
        ctx.fillStyle = `rgba(122, 158, 126, ${opacity})`
        ctx.fill()

        // Gold crown/accent ring for premium finish
        ctx.strokeStyle = `rgba(196, 168, 130, ${opacity + 0.2})`
        ctx.lineWidth = 2 * (scale / 220)
        ctx.stroke()
        ctx.restore()
      }

      // 9. Render joints (glowing gold circles)
      // Exclude head from default joint rendering since we drew special head part
      const jointsToDraw = Object.keys(projected).filter(name => name !== 'head')

      // Sort joints by depth
      const sortedJointNames = [...jointsToDraw].sort((a, b) => projected[a].z - projected[b].z)

      sortedJointNames.forEach(name => {
        const j = projected[name]
        ctx.save()

        const depthFactor = (j.z + 0.8) / 1.6
        const opacity = 0.6 + Math.max(0, Math.min(1, depthFactor)) * 0.4
        const radius = (name === 'hips' ? 5 : 4) * (0.6 + Math.max(0, Math.min(1, depthFactor)) * 0.6) * (scale / 220)

        // Earth gold color (#c4a882)
        ctx.beginPath()
        ctx.arc(j.x, j.y, radius, 0, 2 * Math.PI)
        ctx.fillStyle = `rgba(196, 168, 130, ${opacity})`
        ctx.shadowColor = 'rgba(196, 168, 130, 0.4)'
        ctx.shadowBlur = 6
        ctx.fill()

        // Tiny white inner highlight dot for polished 3D appearance
        ctx.beginPath()
        ctx.arc(j.x - radius * 0.25, j.y - radius * 0.25, radius * 0.25, 0, 2 * Math.PI)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.85})`
        ctx.fill()

        ctx.restore()
      })

      // Continue animation loop
      animationFrameId = window.requestAnimationFrame(tick)
    }

    animationFrameId = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.cancelAnimationFrame(animationFrameId)
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown)
        canvas.removeEventListener('touchstart', handleTouchStart)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [])

  return (
    <div className={styles.canvasContainer} ref={containerRef}>
      {loading && <div className={styles.loading}>Connecting Canvas...</div>}

      <canvas ref={canvasRef} className={styles.canvas} style={{ touchAction: 'none', cursor: 'grab' }} />

      {/* Hero Quote Overlay Integrated Perfectly */}
      <div className={styles.heroQuoteOverlay}>
        <p>"My motive is to help my student meet himself - honestly and fully."</p>
        <div className={styles.quoteLine} />
        <span className={styles.quoteAttr}>Hritik Gorane</span>
      </div>

      {/* Floating Info Panel showing active pose details */}
      <div className={styles.infoPanel}>
        <h3 className={styles.infoTitle}>{POSES[activePoseKey].name}</h3>
        <p className={styles.infoSanskrit}>{POSES[activePoseKey].sanskrit}</p>
        <p className={styles.infoDesc}>{POSES[activePoseKey].desc}</p>
      </div>

      {/* Pose Selection Controls */}
      <div className={styles.controls}>
        {Object.keys(POSES).map((poseKey) => (
          <button
            key={poseKey}
            className={`${styles.btn} ${activePoseKey === poseKey ? styles.btnActive : ''}`}
            onClick={() => setActivePoseKey(poseKey)}
          >
            {POSES[poseKey].name}
          </button>
        ))}
      </div>
    </div>
  )
}
