import { useRef, useState } from 'react'

export default function Uploader({ onUpload, imagePreview, loading }) {
  const inputRef                = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (file) => {
    if (!file) return
    const allowed = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowed.includes(file.type)) {
      alert('Please upload a JPG or PNG image.')
      return
    }
    onUpload(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      height: '100%',
      boxSizing: 'border-box',
    }}>

      {/* Label */}
      <p style={{
        fontSize: '11px', fontWeight: 600,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        color: 'rgba(180,220,180,0.4)', margin: 0,
      }}>
        📷 Upload Leaf Image
      </p>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          cursor: 'pointer',
          borderRadius: '20px',
          flex: 1,
          border: dragging
            ? '2px dashed rgba(52,211,153,0.7)'
            : '2px dashed rgba(52,211,153,0.25)',
          background: dragging
            ? 'rgba(20,40,20,0.7)'
            : 'rgba(20,40,20,0.5)',
          padding: imagePreview ? '0' : '32px',
          textAlign: 'center',
          userSelect: 'none',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          minHeight: '300px',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {loading ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '32px', height: '32px',
              border: '2px solid #34d399',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: '14px', color: 'rgba(180,220,180,0.5)' }}>
              Analysing leaf ...
            </span>
          </div>
        ) : imagePreview ? (
          <img
            src={imagePreview}
            alt="Uploaded leaf"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '18px',
              display: 'block',
            }}
          />
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '48px', opacity: 0.3 }}>🍃</span>
            <p style={{ fontSize: '14px', color: 'rgba(180,220,180,0.4)', margin: 0 }}>
              Drag & drop or{' '}
              <span style={{ color: '#34d399', textDecoration: 'underline' }}>
                click to upload
              </span>
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(180,220,180,0.25)', margin: 0 }}>
              JPG or PNG
            </p>
          </div>
        )}
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  )
}