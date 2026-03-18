import { useState, useCallback } from 'react'
import axios from 'axios'

import Hero        from './components/Hero.jsx'
import Uploader    from './components/Uploader.jsx'
import ResultCard  from './components/ResultCard.jsx'
import HowItWorks  from './components/HowItWorks.jsx'
import DiseaseInfo from './components/DiseaseInfo.jsx'
import GradCam from './components/GradCam.jsx'

const API_URL = 'http://localhost:8000'

export default function App() {
  const [result,       setResult]       = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)

  const handleUpload = useCallback(async (file) => {
    setImagePreview(URL.createObjectURL(file))
    setResult(null)
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const { data } = await axios.post(`${API_URL}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setResult(data)
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Prediction failed. Make sure the backend is running.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '1152px', padding: '0 24px' }}>

        <Hero />

        {/* Two column grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          alignItems: 'stretch',
        }}>

          {/* Left — uploader */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Uploader
              onUpload={handleUpload}
              imagePreview={imagePreview}
              loading={loading}
            />
          </div>

          {/* Right — result card */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {error && (
              <div style={{
                borderRadius: '12px',
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.1)',
                color: '#fca5a5',
                fontSize: '14px',
                padding: '12px 16px',
                marginBottom: '16px',
              }}>
                ⚠️ {error}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <ResultCard result={result} />
            </div>
          </div>

        </div>

        {/* Supported crops */}
        <div style={{ marginTop: '24px' }}>
          <p style={{
            fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(180,220,180,0.35)', marginBottom: '10px',
          }}>
            Supported Crops
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              '🍎 Apple','🫐 Blueberry','🍒 Cherry','🌽 Corn',
              '🍇 Grape','🍊 Orange','🍑 Peach','🌶️ Pepper',
              '🥔 Potato','🫐 Raspberry','🌱 Soybean','🎃 Squash',
              '🍓 Strawberry','🍅 Tomato',
            ].map((c) => (
              <span key={c} style={{
                fontSize: '12px', fontWeight: 500,
                color: 'rgba(180,220,180,0.55)',
                border: '1px solid rgba(52,211,153,0.15)',
                background: 'rgba(52,211,153,0.05)',
                borderRadius: '8px', padding: '4px 10px',
              }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Disease info and Grad-CAM — only shown after prediction */}
        {result && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: result.gradcam_image ? '1fr 1fr' : '1fr',
            gap: '24px',
            marginTop: '24px',
          }}>
            <DiseaseInfo
              info={result.disease_info}
              condition={result.condition}
              is_healthy={result.is_healthy}
            />
            {result.gradcam_image && (
              <GradCam
                gradcamImage={result.gradcam_image}
                originalImage={imagePreview}
              />
            )}
          </div>
        )}

        {/* How It Works */}
        <div style={{ marginTop: '48px' }}>
          <HowItWorks />
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'rgba(187,247,208,0.15)',
          letterSpacing: '0.05em',
          borderTop: '1px solid rgba(52,211,153,0.06)',
          padding: '24px 0',
          marginTop: '16px',
        }}>
          LeafScan AI &nbsp;·&nbsp; EfficientNetB3 Transfer Learning &nbsp;·&nbsp;
          PlantVillage Dataset &nbsp;·&nbsp; 97.74% Accuracy
        </p>

      </div>
    </div>
  )
}