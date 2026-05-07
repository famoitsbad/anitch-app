import React, { useState } from 'react'
import { LOGO_BASE64 } from '../lib/logo'

const STEPS_EN = [
  {
    icon: '👋',
    title: "Welcome to Anitch Diary!",
    desc: "Your personal eczema companion. In just 3 quick steps, we'll show you how to get the most out of the app.",
    tip: null,
    screen: 'welcome'
  },
  {
    icon: '📝',
    title: "Log your skin daily",
    desc: "Every day, take 60 seconds to record your skin condition. Rate severity, mark affected areas, and note any triggers.",
    tip: "💡 Tip: Tap the body figure to mark exactly where your skin is affected — mild, moderate, or severe.",
    screen: 'log'
  },
  {
    icon: '🔍',
    title: "Track your triggers",
    desc: "Log what you ate, the weather, your stress levels, and skincare products. The more you log, the smarter your insights become.",
    tip: "💡 Tip: You can add custom triggers specific to you — like a certain shampoo or fabric.",
    screen: 'triggers'
  },
  {
    icon: '🧠',
    title: "Discover your patterns",
    desc: "After a few days, head to Insights. The app analyses your data and tells you what's actually causing your flares.",
    tip: "💡 Example: \"Your skin flares 80% of the time the day after high stress.\"",
    screen: 'insights'
  },
  {
    icon: '📸',
    title: "Take skin photos",
    desc: "Upload a daily photo to visually track your healing progress. Compare before & after to see real improvement over time.",
    tip: "🔒 Privacy: Only you can see your photos. We never access or store them.",
    screen: 'photo'
  },
  {
    icon: '🌿',
    title: "You're ready to start!",
    desc: "Log your first entry today. Even one log is a step towards understanding your skin better.",
    tip: null,
    screen: 'done'
  },
]

const STEPS_ZH = [
  {
    icon: '👋',
    title: '歡迎使用 Anitch 日記！',
    desc: '您的個人濕疹助手。只需3個簡單步驟，我們將帶您了解如何充分利用此App。',
    tip: null,
    screen: 'welcome'
  },
  {
    icon: '📝',
    title: '每天記錄皮膚狀況',
    desc: '每天花60秒記錄您的皮膚狀況。評估嚴重程度、標記受影響部位，並記錄可能的誘因。',
    tip: '💡 提示：點擊身體模型，精確標記皮膚受影響的部位——輕度、中度或重度。',
    screen: 'log'
  },
  {
    icon: '🔍',
    title: '追蹤您的誘發因素',
    desc: '記錄飲食、天氣、壓力程度和護膚品使用情況。記錄越多，分析越精準。',
    tip: '💡 提示：您可以添加專屬的自定義誘因——例如某種洗髮精或特定面料。',
    screen: 'triggers'
  },
  {
    icon: '🧠',
    title: '發現您的皮膚規律',
    desc: '記錄幾天後，前往「分析」頁面。App會分析您的數據，告訴您真正引發濕疹的原因。',
    tip: '💡 例如：「您在壓力大的隔天，有80%的機率出現皮膚發作。」',
    screen: 'insights'
  },
  {
    icon: '📸',
    title: '拍攝皮膚照片',
    desc: '上傳每日照片，直觀追蹤皮膚修復進度。使用前後對比功能，見證真實的改善過程。',
    tip: '🔒 私隱保護：只有您才能看到自己的照片，我們絕不存取或儲存您的照片。',
    screen: 'photo'
  },
  {
    icon: '🌿',
    title: '您已準備好開始了！',
    desc: '今天就記錄第一筆資料吧。即使只有一筆記錄，也是了解您皮膚的第一步。',
    tip: null,
    screen: 'done'
  },
]

const SCREEN_PREVIEWS = {
  welcome: (
    <div style={{ background: '#004B39', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌿</div>
      <div style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>Anitch Diary</div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>擺脫濕疹困擾</div>
    </div>
  ),
  log: (
    <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #E8E8E8' }}>
      <div style={{ fontSize: '10px', fontWeight: '700', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>🌡 Overall Severity</div>
      <div style={{ height: '8px', borderRadius: '4px', background: 'linear-gradient(to right,#C5D9C2,#E8C84A,#E8A04A,#E86A5A)', marginBottom: '16px', position: 'relative' }}>
        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', border: '3px solid #F7984C', position: 'absolute', top: '50%', left: '44%', transform: 'translateY(-50%)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {['🔥 Itching','🌹 Redness','🌵 Dryness','🧊 Swelling'].map(s => (
          <div key={s} style={{ padding: '6px 8px', border: '1px solid #E8E8E8', borderRadius: '6px', fontSize: '11px', color: '#666' }}>{s}</div>
        ))}
      </div>
    </div>
  ),
  triggers: (
    <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #E8E8E8' }}>
      <div style={{ fontSize: '10px', fontWeight: '700', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>🔍 Triggers</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {['Dairy 🥛','Stress 😮‍💨','Pollen 🌿','Gluten 🌾'].map((t, i) => (
          <div key={t} style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '11px', background: i < 2 ? '#004B39' : 'white', color: i < 2 ? 'white' : '#666', border: `1px solid ${i < 2 ? '#004B39' : '#E8E8E8'}` }}>{t}</div>
        ))}
      </div>
      <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
        <div style={{ flex: 1, padding: '6px 10px', border: '1px dashed #E8E8E8', borderRadius: '6px', fontSize: '11px', color: '#AAA' }}>+ Custom trigger...</div>
        <div style={{ padding: '6px 12px', background: '#004B39', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>Add</div>
      </div>
    </div>
  ),
  insights: (
    <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #E8E8E8' }}>
      <div style={{ fontSize: '10px', fontWeight: '700', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>🧠 Pattern Insights</div>
      <div style={{ background: '#E8F2EE', borderRadius: '8px', padding: '10px', marginBottom: '8px', display: 'flex', gap: '8px' }}>
        <div style={{ fontSize: '16px' }}>😮‍💨</div>
        <div style={{ fontSize: '11px', color: '#004B39', lineHeight: '1.4' }}>Your skin flares 80% of the time after high-stress days.</div>
      </div>
      <div style={{ background: '#E8F2EE', borderRadius: '8px', padding: '10px', display: 'flex', gap: '8px' }}>
        <div style={{ fontSize: '16px' }}>🍽️</div>
        <div style={{ fontSize: '11px', color: '#004B39', lineHeight: '1.4' }}>Dairy appeared 4× during your flare days.</div>
      </div>
    </div>
  ),
  photo: (
    <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #E8E8E8' }}>
      <div style={{ fontSize: '10px', fontWeight: '700', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>📸 Before & After</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, background: '#F9F9FB', borderRadius: '8px', padding: '20px 0', textAlign: 'center', border: '1px solid #E8E8E8' }}>
          <div style={{ fontSize: '20px' }}>📅</div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>Jan 1</div>
          <div style={{ fontSize: '10px', color: '#E86A5A', fontWeight: '600' }}>Sev. 8</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#004B39' }}>→</div>
        <div style={{ flex: 1, background: '#E8F2EE', borderRadius: '8px', padding: '20px 0', textAlign: 'center', border: '1px solid #C5D9C2' }}>
          <div style={{ fontSize: '20px' }}>📅</div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>Feb 1</div>
          <div style={{ fontSize: '10px', color: '#004B39', fontWeight: '600' }}>Sev. 2</div>
        </div>
      </div>
    </div>
  ),
  done: (
    <div style={{ background: 'linear-gradient(135deg,#004B39,#1A6B54)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
      <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏆</div>
      <div style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>Ready to start!</div>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>Your skin journey begins today</div>
    </div>
  ),
}

export default function Onboarding({ lang = 'en', onComplete }) {
  const [step, setStep] = useState(0)
  const isZh = lang === 'zh'
  const steps = isZh ? STEPS_ZH : STEPS_EN
  const current = steps[step]
  const isLast = step === steps.length - 1
  const progress = (step / (steps.length - 1)) * 100

  return (
    <div style={{ minHeight: '100vh', background: '#F9F9FB', display: 'flex', flexDirection: 'column', fontFamily: "'Lato',sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#004B39', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src={LOGO_BASE64} alt="anitch" style={{ height: '22px' }} />
        <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
          onClick={onComplete}>
          {isZh ? '跳過' : 'Skip'}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', background: '#E8E8E8' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#004B39', transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ flex: 1, padding: '32px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        {/* Step counter */}
        <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px', textAlign: 'center' }}>
          {step + 1} / {steps.length}
        </div>

        {/* Icon */}
        <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>{current.icon}</div>

        {/* Title */}
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#000', textAlign: 'center', marginBottom: '12px', letterSpacing: '-0.01em', lineHeight: '1.3' }}>
          {current.title}
        </h2>

        {/* Description */}
        <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', lineHeight: '1.7', marginBottom: '24px' }}>
          {current.desc}
        </p>

        {/* Screen preview */}
        <div style={{ marginBottom: '20px' }}>
          {SCREEN_PREVIEWS[current.screen]}
        </div>

        {/* Tip */}
        {current.tip && (
          <div style={{ background: '#E8F2EE', borderRadius: '10px', padding: '12px 14px', border: '1px solid #C5D9D3', fontSize: '13px', color: '#004B39', lineHeight: '1.5', marginBottom: '16px' }}>
            {current.tip}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          {step > 0 && (
            <button style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1.5px solid #E8E8E8', background: 'white', color: '#666', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              onClick={() => setStep(s => s - 1)}>
              {isZh ? '上一步' : 'Back'}
            </button>
          )}
          <button style={{ flex: 2, padding: '14px', borderRadius: '10px', border: 'none', background: '#004B39', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em' }}
            onClick={() => isLast ? onComplete() : setStep(s => s + 1)}>
            {isLast ? (isZh ? '開始記錄 🌿' : 'Start Logging 🌿') : (isZh ? '下一步 →' : 'Next →')}
          </button>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? '20px' : '6px', height: '6px', borderRadius: '3px', background: i === step ? '#004B39' : '#D0D0D0', transition: 'all 0.3s', cursor: 'pointer' }}
              onClick={() => setStep(i)} />
          ))}
        </div>
      </div>
    </div>
  )
}
