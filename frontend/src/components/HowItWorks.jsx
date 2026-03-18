const STEPS = [
  {
    num:   '01',
    icon:  '📷',
    title: 'Upload Photo',
    desc:  'Take or upload a clear photo of the plant leaf you want to diagnose.',
  },
  {
    num:   '02',
    icon:  '🧠',
    title: 'AI Analysis',
    desc:  'EfficientNetB3 analyses visual patterns, textures, and colour signatures.',
  },
  {
    num:   '03',
    icon:  '🔬',
    title: 'Diagnosis',
    desc:  'The model identifies the disease class from 38 possible categories.',
  },
  {
    num:   '04',
    icon:  '✅',
    title: 'Results',
    desc:  'Get disease name, confidence score, and top 3 predictions instantly.',
  },
]

export default function HowItWorks() {
  return (
    <div style={{
      position: 'relative',
      borderRadius: '28px',
      border: '1px solid rgba(52,211,153,0.12)',
      background: 'linear-gradient(145deg, rgba(10,22,10,0.9), rgba(5,14,5,0.95))',
      padding: '40px 40px 36px',
      overflow: 'hidden',
    }}>

      {/* Background glow */}
      <div style={{
        position: 'absolute', bottom: '-80px', right: '-80px',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent)',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '12px', marginBottom: '32px',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'rgba(52,211,153,0.1)',
          border: '1px solid rgba(52,211,153,0.2)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '16px',
        }}>
          🌿
        </div>
        <div>
          <h2 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '1.4rem', fontWeight: 700,
            color: '#86efac', margin: 0, lineHeight: 1,
          }}>
            How It Works
          </h2>
          <p style={{
            fontSize: '12px', color: 'rgba(180,220,180,0.35)',
            margin: '4px 0 0', letterSpacing: '0.05em',
          }}>
            Four simple steps to diagnose your plant
          </p>
        </div>
      </div>

      {/* Steps */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
      }}>
        {STEPS.map((s, i) => (
          <div key={s.num} style={{
            position: 'relative',
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(52,211,153,0.08)',
            transition: 'border-color 0.2s',
          }}>

            {/* Step number background */}
            <div style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '3.5rem', fontWeight: 900,
              color: 'rgba(52,211,153,0.06)',
              lineHeight: 1, position: 'absolute',
              top: '12px', right: '16px',
              userSelect: 'none',
            }}>
              {s.num}
            </div>

            {/* Icon */}
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'rgba(52,211,153,0.08)',
              border: '1px solid rgba(52,211,153,0.15)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '20px',
              marginBottom: '16px',
            }}>
              {s.icon}
            </div>

            {/* Step indicator */}
            <div style={{
              fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#34d399', marginBottom: '6px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <div style={{
                width: '16px', height: '1px',
                background: '#34d399', opacity: 0.5,
              }} />
              Step {s.num}
            </div>

            {/* Title */}
            <div style={{
              fontSize: '15px', fontWeight: 700,
              color: 'rgba(220,240,220,0.9)',
              marginBottom: '8px', lineHeight: 1.2,
            }}>
              {s.title}
            </div>

            {/* Description */}
            <div style={{
              fontSize: '12px',
              color: 'rgba(180,220,180,0.4)',
              lineHeight: 1.6,
            }}>
              {s.desc}
            </div>

            {/* Connector arrow — except last */}
            {i < 3 && (
              <div style={{
                position: 'absolute',
                right: '-12px', top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(52,211,153,0.2)',
                fontSize: '18px', zIndex: 1,
              }}>
                →
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  )
}