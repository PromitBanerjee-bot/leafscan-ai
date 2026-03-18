import { useState } from 'react'

export default function GradCam({ gradcamImage, originalImage }) {
  const [showHeatmap, setShowHeatmap] = useState(true)

  if (!gradcamImage) return null

  return (
    <div style={{
      position: 'relative',
      borderRadius: '24px',
      border: '1px solid rgba(52,211,153,0.12)',
      background: 'linear-gradient(145deg, rgba(10,20,10,0.9), rgba(6,14,6,0.95))',
      overflow: 'hidden',
      marginTop: '12px',
    }}>

      {/* Top stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(251,146,60,0.5), transparent)',
      }} />

      {/* Header */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(251,146,60,0.1)',
            border: '1px solid rgba(251,146,60,0.2)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '16px',
          }}>
            🔥
          </div>
          <div>
            <div style={{
              fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: 'rgba(180,220,180,0.35)', marginBottom: '2px',
            }}>
              Grad-CAM Visualisation
            </div>
            <div style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '1rem', fontWeight: 700,
              color: 'rgba(220,240,220,0.9)',
            }}>
              Model Attention Heatmap
            </div>
          </div>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          style={{
            padding: '8px 16px', borderRadius: '99px',
            border: '1px solid rgba(251,146,60,0.3)',
            background: showHeatmap
              ? 'rgba(251,146,60,0.15)'
              : 'rgba(255,255,255,0.03)',
            color: showHeatmap ? '#fb923c' : 'rgba(180,220,180,0.5)',
            fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
            letterSpacing: '0.05em',
          }}
        >
          {showHeatmap ? '🔥 Heatmap ON' : '📷 Original'}
        </button>
      </div>

      {/* Explanation */}
      <div style={{ padding: '14px 24px 0' }}>
        <p style={{
          fontSize: '12px', lineHeight: 1.65,
          color: 'rgba(180,220,180,0.45)', margin: 0,
        }}>
          The heatmap shows which regions of the leaf the model focused on
          when making its prediction.{' '}
          <span style={{ color: '#ef4444', fontWeight: 600 }}>Red/warm areas</span>
          {' '}indicate high attention,{' '}
          <span style={{ color: '#3b82f6', fontWeight: 600 }}>blue/cool areas</span>
          {' '}indicate low attention.
        </p>
      </div>

      {/* Image display */}
      <div style={{ padding: '16px 24px 24px' }}>
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <img
            src={showHeatmap
              ? `data:image/png;base64,${gradcamImage}`
              : originalImage
            }
            alt={showHeatmap ? 'Grad-CAM heatmap' : 'Original image'}
            style={{
              width: '100%',
              display: 'block',
              borderRadius: '16px',
            }}
          />

          {/* Label overlay */}
          <div style={{
            position: 'absolute', bottom: '12px', left: '12px',
            padding: '4px 10px', borderRadius: '6px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            fontSize: '11px', fontWeight: 600,
            color: showHeatmap ? '#fb923c' : 'rgba(220,240,220,0.8)',
          }}>
            {showHeatmap ? '🔥 Attention Heatmap' : '📷 Original Image'}
          </div>
        </div>

        {/* Colour scale legend */}
        {showHeatmap && (
          <div style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{
              fontSize: '10px', fontWeight: 600,
              color: 'rgba(180,220,180,0.35)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              flexShrink: 0,
            }}>
              Low
            </span>
            <div style={{
              flex: 1, height: '8px', borderRadius: '4px',
              background: 'linear-gradient(90deg, #3b82f6, #22c55e, #fbbf24, #ef4444)',
            }} />
            <span style={{
              fontSize: '10px', fontWeight: 600,
              color: 'rgba(180,220,180,0.35)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              flexShrink: 0,
            }}>
              High
            </span>
          </div>
        )}
      </div>

    </div>
  )
}