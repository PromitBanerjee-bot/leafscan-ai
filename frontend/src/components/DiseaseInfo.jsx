const SEVERITY_CONFIG = {
  'None':     { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.25)',   icon: '✅', label: 'Healthy' },
  'Mild':     { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.25)',   icon: '🟡', label: 'Mild' },
  'Moderate': { color: '#fb923c', bg: 'rgba(251,146,60,0.1)',   border: 'rgba(251,146,60,0.25)',   icon: '🟠', label: 'Moderate' },
  'Severe':   { color: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.25)',  icon: '🔴', label: 'Severe' },
  'Unknown':  { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',  border: 'rgba(148,163,184,0.25)',  icon: '⚪', label: 'Unknown' },
}

function InfoSection({ icon, title, content, accentColor }) {
  return (
    <div style={{
      padding: '16px 18px',
      borderRadius: '14px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '8px', marginBottom: '8px',
      }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span style={{
          fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: accentColor || 'rgba(180,220,180,0.4)',
        }}>
          {title}
        </span>
      </div>
      <p style={{
        fontSize: '13px', lineHeight: 1.65,
        color: 'rgba(220,240,220,0.75)', margin: 0,
      }}>
        {content}
      </p>
    </div>
  )
}

export default function DiseaseInfo({ info, condition, is_healthy }) {
  if (!info) return null

  const severity = SEVERITY_CONFIG[info.severity] || SEVERITY_CONFIG['Unknown']

  return (
    <div style={{
      position: 'relative',
      borderRadius: '24px',
      border: '1px solid rgba(52,211,153,0.1)',
      background: 'linear-gradient(145deg, rgba(10,20,10,0.9), rgba(6,14,6,0.95))',
      overflow: 'hidden',
      marginTop: '12px',
    }}>

      {/* Top stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent)',
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
            background: 'rgba(52,211,153,0.1)',
            border: '1px solid rgba(52,211,153,0.2)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '16px',
          }}>
            📋
          </div>
          <div>
            <div style={{
              fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: 'rgba(180,220,180,0.35)', marginBottom: '2px',
            }}>
              Disease Information
            </div>
            <div style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '1rem', fontWeight: 700,
              color: 'rgba(220,240,220,0.9)',
            }}>
              {condition}
            </div>
          </div>
        </div>

        {/* Severity badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '99px',
          background: severity.bg,
          border: `1px solid ${severity.border}`,
        }}>
          <span style={{ fontSize: '12px' }}>{severity.icon}</span>
          <span style={{
            fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: severity.color,
          }}>
            {severity.label} Severity
          </span>
        </div>
      </div>

      {/* Description */}
      <div style={{ padding: '16px 24px 0' }}>
        <p style={{
          fontSize: '13px', lineHeight: 1.7,
          color: 'rgba(200,230,200,0.65)', margin: 0,
          fontStyle: 'italic',
        }}>
          {info.description}
        </p>
      </div>

      {/* Info grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: is_healthy ? '1fr' : '1fr 1fr',
        gap: '10px',
        padding: '16px 24px 24px',
      }}>

        <InfoSection
          icon="🦠"
          title="Cause"
          content={info.cause}
          accentColor="rgba(251,191,36,0.6)"
        />

        {!is_healthy && (
          <InfoSection
            icon="💊"
            title="Treatment"
            content={info.treatment}
            accentColor="rgba(52,211,153,0.6)"
          />
        )}

        <InfoSection
          icon="🛡️"
          title="Prevention"
          content={info.prevention}
          accentColor="rgba(96,165,250,0.6)"
        />

        {!is_healthy && (
          <InfoSection
            icon="⚠️"
            title="Action Required"
            content={
              info.severity === 'Severe'
                ? 'Immediate action required. This disease spreads rapidly and can cause significant crop loss. Apply treatment as soon as possible.'
                : info.severity === 'Moderate'
                ? 'Treatment is recommended. Monitor the spread and apply appropriate measures to prevent further damage.'
                : 'Monitor the plant closely and apply preventive measures to avoid disease progression.'
            }
            accentColor={severity.color}
          />
        )}

      </div>

    </div>
  )
}
