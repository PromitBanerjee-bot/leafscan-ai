function ConfidenceBar({ value }) {
  const pct = (value * 100).toFixed(1)
  const color =
    value >= 0.75 ? { bar: '#34d399', text: '#34d399', glow: 'rgba(52,211,153,0.4)' }
    : value >= 0.5  ? { bar: '#fbbf24', text: '#fbbf24', glow: 'rgba(251,191,36,0.4)' }
    :                 { bar: '#f87171', text: '#f87171', glow: 'rgba(248,113,113,0.4)' }
  return (
    <div style={{ margin: '20px 0' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-end', marginBottom: '10px',
      }}>
        <span style={{
          fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(180,220,180,0.4)',
        }}>
          Confidence
        </span>
        <span style={{
          fontFamily: '"Playfair Display", serif',
          fontSize: '2.2rem', fontWeight: 900,
          color: color.text, lineHeight: 1,
          textShadow: `0 0 20px ${color.glow}`,
        }}>
          {pct}%
        </span>
      </div>
      <div style={{
        position: 'relative', height: '6px',
        background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0,
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, ${color.bar}88, ${color.bar})`,
          borderRadius: '99px',
          boxShadow: `0 0 8px ${color.glow}`,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        {['0', '25', '50', '75', '100'].map(t => (
          <span key={t} style={{ fontSize: '9px', color: 'rgba(180,220,180,0.2)', fontWeight: 500 }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function PredRow({ rank, condition, crop, confidence }) {
  const pct     = (confidence * 100).toFixed(1)
  const isFirst = rank === 1
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 14px',
      background: isFirst ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.02)',
      borderRadius: '10px',
      border: isFirst ? '1px solid rgba(52,211,153,0.15)' : '1px solid rgba(255,255,255,0.04)',
      marginBottom: '6px',
    }}>
      <span style={{
        fontFamily: '"Playfair Display", serif',
        fontSize: '11px', fontWeight: 700,
        color: isFirst ? '#34d399' : 'rgba(52,211,153,0.3)',
        width: '22px', flexShrink: 0,
      }}>
        #{rank}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px', fontWeight: 600,
          color: isFirst ? 'rgba(220,240,220,0.9)' : 'rgba(180,220,180,0.6)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {condition}
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(180,220,180,0.3)', marginTop: '1px' }}>
          {crop}
        </div>
      </div>
      <div style={{ width: '60px', flexShrink: 0 }}>
        <div style={{
          height: '3px', background: 'rgba(255,255,255,0.06)',
          borderRadius: '99px', overflow: 'hidden', marginBottom: '3px',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: isFirst ? 'linear-gradient(90deg, #34d399, #6ee7b7)' : 'rgba(52,211,153,0.3)',
            borderRadius: '99px',
          }} />
        </div>
        <div style={{
          fontSize: '11px', fontWeight: 700, textAlign: 'right',
          color: isFirst ? '#4ade80' : 'rgba(180,220,180,0.4)',
        }}>
          {pct}%
        </div>
      </div>
    </div>
  )
}

function InfoPill({ label, value, accent }) {
  return (
    <div style={{
      padding: '12px 16px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '12px',
    }}>
      <div style={{
        fontSize: '9px', fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'rgba(180,220,180,0.3)', marginBottom: '5px',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '14px', fontWeight: 600,
        color: accent ? '#4ade80' : 'rgba(220,240,220,0.85)',
      }}>
        {value}
      </div>
    </div>
  )
}

export default function ResultCard({ result }) {

  if (!result) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100%', minHeight: '500px',
        boxSizing: 'border-box',
        borderRadius: '24px',
        border: '1px solid rgba(52,211,153,0.08)',
        background: 'linear-gradient(145deg, rgba(10,20,10,0.8), rgba(5,15,5,0.9))',
        textAlign: 'center', padding: '48px 32px', gap: '16px',
      }}>
        <div style={{ fontSize: '48px', opacity: 0.15 }}>🔬</div>
        <div style={{
          fontFamily: '"Playfair Display", serif',
          fontSize: '1.3rem', fontWeight: 700,
          color: 'rgba(180,220,180,0.2)',
        }}>
          Awaiting Analysis
        </div>
        <div style={{
          fontSize: '13px', color: 'rgba(180,220,180,0.15)',
          maxWidth: '220px', lineHeight: 1.6,
        }}>
          Upload a leaf image to see the diagnosis here
        </div>
      </div>
    )
  }

  const { condition, crop, confidence, is_healthy, top_3 } = result

  const theme = is_healthy
    ? {
        stripe:  'linear-gradient(90deg, #34d399, #10b981, #6ee7b7)',
        border:  'rgba(52,211,153,0.2)',
        glow:    'rgba(52,211,153,0.08)',
        badge:   { bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)', text: '#4ade80' },
        icon:    '✅',
        title:   'rgba(220,240,220,0.95)',
        ambient: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)',
      }
    : {
        stripe:  'linear-gradient(90deg, #f87171, #ef4444, #fca5a5)',
        border:  'rgba(239,68,68,0.2)',
        glow:    'rgba(239,68,68,0.06)',
        badge:   { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
        icon:    '⚠️',
        title:   '#fecaca',
        ambient: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)',
      }

  return (
    <div style={{
      position: 'relative', borderRadius: '24px',
      height: '100%', boxSizing: 'border-box',
      border: `1px solid ${theme.border}`,
      background: 'linear-gradient(145deg, rgba(12,22,12,0.95), rgba(6,14,6,0.98))',
      boxShadow: `0 0 40px ${theme.glow}, 0 20px 60px rgba(0,0,0,0.4)`,
      overflow: 'hidden', padding: '28px',
    }}>

      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: theme.stripe,
      }} />

      <div style={{
        position: 'absolute', top: '-60px', right: '-60px',
        width: '200px', height: '200px',
        background: theme.ambient, pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
        <div style={{
          fontSize: '2.8rem', lineHeight: 1, marginTop: '4px', flexShrink: 0,
          filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))',
        }}>
          {theme.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(180,220,180,0.35)', marginBottom: '4px',
          }}>
            Diagnosis Result
          </div>
          <div style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
            fontWeight: 700, lineHeight: 1.15,
            color: theme.title, marginBottom: '4px',
          }}>
            {condition}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(180,220,180,0.45)' }}>
            {crop}
          </div>
        </div>
        <div style={{
          flexShrink: 0, padding: '6px 14px', borderRadius: '99px',
          background: theme.badge.bg, border: `1px solid ${theme.badge.border}`,
          fontSize: '11px', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: theme.badge.text, whiteSpace: 'nowrap',
        }}>
          {is_healthy ? 'Healthy' : 'Diseased'}
        </div>
      </div>

      <div style={{
        height: '1px', margin: '4px 0 0',
        background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.1), transparent)',
      }} />

      {/* Low confidence warning */}
      {confidence < 0.5 && (
        <div style={{
          margin: '16px 0 0',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'rgba(251,191,36,0.08)',
          border: '1px solid rgba(251,191,36,0.25)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}>
          <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
          <div>
            <div style={{
              fontSize: '12px', fontWeight: 700,
              color: '#fbbf24', marginBottom: '4px',
              letterSpacing: '0.05em',
            }}>
              Low Confidence Warning
            </div>
            <div style={{
              fontSize: '12px', lineHeight: 1.6,
              color: 'rgba(251,191,36,0.7)',
            }}>
              The model is not confident about this prediction. Try uploading a
              clearer image with the leaf isolated against a plain background,
              good lighting, and the leaf filling most of the frame.
            </div>
            <div style={{
              marginTop: '10px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
            }}>
              {[
                '📷 Use good lighting',
                '🍃 Isolate the leaf',
                '🔍 Fill the frame',
                '📐 Shoot from above',
              ].map(tip => (
                <span key={tip} style={{
                  fontSize: '11px', fontWeight: 600,
                  color: 'rgba(251,191,36,0.6)',
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.15)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                }}>
                  {tip}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Medium confidence notice */}
      {confidence >= 0.5 && confidence < 0.75 && (
        <div style={{
          margin: '16px 0 0',
          padding: '10px 14px',
          borderRadius: '12px',
          background: 'rgba(251,146,60,0.06)',
          border: '1px solid rgba(251,146,60,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '14px', flexShrink: 0 }}>🟠</span>
          <div style={{
            fontSize: '12px', lineHeight: 1.5,
            color: 'rgba(251,146,60,0.7)',
          }}>
            <strong style={{ color: '#fb923c' }}>Moderate confidence.</strong>{' '}
            The prediction may not be fully accurate. Consider uploading a
            clearer image for a more reliable result.
          </div>
        </div>
      )}

      <ConfidenceBar value={confidence} />

      <div style={{
        height: '1px', margin: '4px 0 20px',
        background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.08), transparent)',
      }} />

      <div style={{
        fontSize: '10px', fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'rgba(180,220,180,0.3)', marginBottom: '10px',
      }}>
        Top Predictions
      </div>

      {top_3.map((p) => (
        <PredRow
          key={p.rank}
          rank={p.rank}
          condition={p.condition}
          crop={p.crop}
          confidence={p.confidence}
        />
      ))}

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '8px', marginTop: '16px',
      }}>
        <InfoPill label="Crop"      value={crop} />
        <InfoPill label="Health"    value={is_healthy ? '✓ Healthy' : '✗ Diseased'} accent={is_healthy} />
        <InfoPill label="Condition" value={condition} />
        <InfoPill label="Model"     value="EfficientNetB3" />
      </div>

    </div>
  )
}