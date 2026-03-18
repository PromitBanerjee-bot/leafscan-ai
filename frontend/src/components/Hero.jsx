const STATS = [
  { number: '97.74%', label: 'Accuracy',       icon: '🎯' },
  { number: '38',     label: 'Disease Classes', icon: '🦠' },
  { number: '14',     label: 'Crop Species',    icon: '🌿' },
  { number: '54K+',   label: 'Training Images', icon: '🖼️' },
]

export default function Hero() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '64px 16px 48px',
      position: 'relative',
    }}>

      {/* Ambient top glow */}
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '600px', height: '200px',
        background: 'radial-gradient(ellipse, rgba(52,211,153,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Badge */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          border: '1px solid rgba(52,211,153,0.35)',
          background: 'rgba(52,211,153,0.08)',
          color: '#4ade80',
          fontSize: '11px', fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          borderRadius: '99px', padding: '8px 20px',
        }}>
          <span>🌿</span>
          AI-Powered Plant Pathology
        </span>
      </div>

      {/* Title */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <h1 style={{
          fontFamily: '"Playfair Display", serif',
          fontWeight: 900,
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          lineHeight: 1.0,
          letterSpacing: '-0.03em',
          margin: 0,
          background: 'linear-gradient(135deg, #86efac 0%, #34d399 30%, #10b981 60%, #86efac 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 40px rgba(52,211,153,0.3))',
        }}>
          LeafScan AI
        </h1>
      </div>

      {/* Subtitle */}
      <p style={{
        fontSize: '1.1rem', fontWeight: 300,
        color: 'rgba(200,230,200,0.6)',
        maxWidth: '500px', margin: '0 auto 32px',
        lineHeight: 1.7, textAlign: 'center',
        letterSpacing: '0.01em',
      }}>
        Upload a photo of any plant leaf and get an instant, accurate diagnosis
        powered by deep learning.
      </p>

      {/* Divider */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '16px',
        marginBottom: '40px',
      }}>
        <div style={{
          height: '1px', width: '60px',
          background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.4))',
        }} />
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#34d399',
          boxShadow: '0 0 10px rgba(52,211,153,0.6)',
        }} />
        <div style={{
          height: '1px', width: '60px',
          background: 'linear-gradient(90deg, rgba(52,211,153,0.4), transparent)',
        }} />
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        justifyContent: 'center', gap: '12px',
      }}>
        {STATS.map((s) => (
          <div key={s.label} style={{
            minWidth: '150px',
            borderRadius: '16px',
            border: '1px solid rgba(52,211,153,0.15)',
            background: 'linear-gradient(145deg, rgba(15,30,15,0.8), rgba(8,18,8,0.9))',
            padding: '16px 20px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>

            {/* Card glow */}
            <div style={{
              position: 'absolute', top: '-20px', left: '50%',
              transform: 'translateX(-50%)',
              width: '80px', height: '60px',
              background: 'radial-gradient(ellipse, rgba(52,211,153,0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Icon */}
            <div style={{
              fontSize: '18px', marginBottom: '8px',
              filter: 'grayscale(0.3)',
            }}>
              {s.icon}
            </div>

            {/* Number */}
            <span style={{
              display: 'block',
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700, fontSize: '1.8rem',
              color: '#4ade80', lineHeight: 1,
              marginBottom: '6px',
              textShadow: '0 0 20px rgba(74,222,128,0.3)',
            }}>
              {s.number}
            </span>

            {/* Label */}
            <span style={{
              display: 'block',
              fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'rgba(180,210,180,0.45)',
            }}>
              {s.label}
            </span>

          </div>
        ))}
      </div>

    </div>
  )
}