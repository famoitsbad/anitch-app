import React, { useState } from 'react'
import { LOGO_BASE64 } from '../lib/logo'

const FEATURES = [
  { icon: '📝', en: 'Daily Diary', zh: '每日記錄', descEN: 'Log severity, symptoms and triggers in under 60 seconds', descZH: '60秒內記錄嚴重程度、症狀和誘發因素' },
  { icon: '🫀', en: 'Body Map', zh: '身體地圖', descEN: 'Tap affected zones on a body silhouette to track flare locations', descZH: '點擊身體部位，精確追蹤發作位置' },
  { icon: '🧠', en: 'Smart Insights', zh: '智能分析', descEN: 'Discover what triggers your flares with AI-powered pattern analysis', descZH: 'AI驅動的規律分析，找出您的濕疹誘因' },
  { icon: '💊', en: 'Product Tips', zh: '產品建議', descEN: 'Get personalised Anitch product recommendations based on your skin data', descZH: '根據您的皮膚數據，獲得個人化的Anitch產品建議' },
  { icon: '📸', en: 'Photo Timeline', zh: '照片時間軸', descEN: 'Track your skin visually with before & after photo comparisons', descZH: '以照片記錄皮膚變化，直觀感受改善進度' },
  { icon: '📄', en: 'Doctor Export', zh: '醫生報告', descEN: 'Generate a clean PDF summary to share with your dermatologist', descZH: '生成清晰的PDF報告，方便與皮膚科醫生分享' },
]

const TESTIMONIALS = [
  { name: 'Sarah L.', location: 'Hong Kong', avatar: '🌸', textEN: '"I finally understand what triggers my flares. After 3 months of logging, I discovered dairy was my #1 culprit. Life-changing!"', textZH: '"我終於明白是什麼引發了我的濕疹。記錄3個月後，我發現乳製品是主要誘因。改變了我的生活！"', stars: 5 },
  { name: 'Jason K.', location: 'Taipei', avatar: '🌿', textEN: '"The correlation insights are incredible. The app told me my flares happen after stressful days — it was right 80% of the time!"', textZH: '"相關性分析太厲害了。App告訴我壓力大的隔天容易發作——準確率高達80%！"', stars: 5 },
  { name: 'Emily W.', location: 'Sydney', avatar: '💚', textEN: '"Tracking with Anitch Diary + using Anitch Barrier products together has been the best combo for my skin. Highly recommend!"', textZH: '"配合使用Anitch日記和Anitch屏障修復產品，是我皮膚最好的組合！強烈推薦！"', stars: 5 },
]

const WHY_US = [
  { icon: '🔬', en: 'Science-Backed', zh: '科學依據', descEN: 'Built on research showing that consistent tracking helps identify personal eczema triggers with up to 80% accuracy.', descZH: '研究表明，持續追蹤可幫助識別個人濕疹誘因，準確率高達80%。' },
  { icon: '🎯', en: 'Personalised', zh: '個人化體驗', descEN: 'Unlike generic health apps, every insight is based on YOUR data. Your triggers are unique — your app should reflect that.', descZH: '與普通健康App不同，每一條洞察都基於您的數據。您的誘因是獨特的——您的App也應如此。' },
  { icon: '🌿', en: 'Anitch Ecosystem', zh: 'Anitch生態系統', descEN: 'Seamlessly integrated with Anitch skincare products. Get recommendations based on your logged symptoms.', descZH: '與Anitch護膚產品無縫整合，根據您的症狀記錄獲取產品建議。' },
]

export default function Landing({ onGetStarted, onSignIn }) {
  const [lang, setLang] = useState('zh')
  const isZh = lang === 'zh'

  return (
    <div style={{ fontFamily: "'Lato','Helvetica Neue',sans-serif", background: '#FFFFFF', overflowX: 'hidden' }}>

      {/* Top nav */}
      <div style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E8E8E8', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 }}>
        <img src={LOGO_BASE64} alt="anitch" style={{ height: '22px', filter: 'invert(18%) sepia(72%) saturate(500%) hue-rotate(120deg)' }} />
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #E8E8E8', background: 'transparent', fontSize: '12px', cursor: 'pointer', color: '#888', fontWeight: '600' }}
            onClick={() => setLang(isZh ? 'en' : 'zh')}>
            {isZh ? 'EN' : '繁中'}
          </button>
          <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #004B39', background: 'transparent', fontSize: '13px', cursor: 'pointer', color: '#004B39', fontWeight: '700' }}
            onClick={onSignIn}>
            {isZh ? '登入' : 'Sign In'}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg, #004B39 0%, #1A6B54 60%, #2ECC8A 100%)', padding: '60px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '6px 16px', fontSize: '11px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '600', marginBottom: '20px' }}>
          {isZh ? '擺脫濕疹困擾' : 'Freedom from Eczema'}
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'white', lineHeight: '1.3', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          {isZh ? 'Anitch 濕疹日記\n掌握您的皮膚健康' : 'Anitch Eczema Diary\nTake Control of Your Skin'}
        </h1>

        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', marginBottom: '32px', maxWidth: '320px', margin: '0 auto 32px' }}>
          {isZh ? '輕鬆追蹤濕疹狀況，智能分析誘因，重拾健康肌膚。' : 'Effortlessly track your eczema, intelligently analyse triggers, and reclaim healthy skin.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <button style={{ padding: '16px 40px', borderRadius: '12px', background: 'white', color: '#004B39', fontSize: '16px', fontWeight: '800', border: 'none', cursor: 'pointer', letterSpacing: '0.02em', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
            onClick={onGetStarted}>
            {isZh ? '立即免費開始 →' : 'Start for Free →'}
          </button>
          <button style={{ padding: '12px 28px', borderRadius: '12px', background: 'transparent', color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600', border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}
            onClick={onSignIn}>
            {isZh ? '已有帳號？登入' : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '0', marginTop: '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', backdropFilter: 'blur(10px)' }}>
          {[
            { num: '10,000+', labelZH: '活躍用戶', labelEN: 'Active Users' },
            { num: '80%', labelZH: '誘因識別準確率', labelEN: 'Trigger Accuracy' },
            { num: '4.9★', labelZH: '用戶評分', labelEN: 'User Rating' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>{s.num}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', marginTop: '4px' }}>{isZh ? s.labelZH : s.labelEN}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '60px 24px', background: '#F9F9FB' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#004B39', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
            {isZh ? '核心功能' : 'Core Features'}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#000', letterSpacing: '-0.02em', marginBottom: '10px' }}>
            {isZh ? '您需要的一切，都在這裡' : 'Everything You Need'}
          </h2>
          <p style={{ fontSize: '14px', color: '#888', lineHeight: '1.6' }}>
            {isZh ? '專為濕疹患者設計，每一個功能都有其意義。' : 'Designed specifically for eczema patients — every feature has a purpose.'}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '20px 16px', border: '1px solid #E8E8E8', boxShadow: '0 2px 8px rgba(0,75,57,0.06)' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{f.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#000', marginBottom: '6px' }}>{isZh ? f.zh : f.en}</div>
              <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.5' }}>{isZh ? f.descZH : f.descEN}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Us */}
      <div style={{ padding: '60px 24px', background: '#004B39' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
            {isZh ? '為何選擇我們' : 'Why Choose Us'}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' }}>
            {isZh ? '不只是日記，更是您的皮膚助手' : 'More Than a Diary — Your Skin Partner'}
          </h2>
        </div>
        {WHY_US.map((w, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '28px', flexShrink: 0 }}>{w.icon}</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>{isZh ? w.zh : w.en}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6' }}>{isZh ? w.descZH : w.descEN}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div style={{ padding: '60px 24px', background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#004B39', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
            {isZh ? '用戶好評' : 'What Users Say'}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#000', letterSpacing: '-0.02em' }}>
            {isZh ? '真實用戶，真實改變' : 'Real Users, Real Results'}
          </h2>
        </div>
        {TESTIMONIALS.map((tm, i) => (
          <div key={i} style={{ background: '#F9F9FB', borderRadius: '16px', padding: '20px', marginBottom: '12px', border: '1px solid #E8E8E8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '28px' }}>{tm.avatar}</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>{tm.name}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{tm.location}</div>
              </div>
              <div style={{ marginLeft: 'auto', color: '#F7984C', fontSize: '14px' }}>{'★'.repeat(tm.stars)}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#444', lineHeight: '1.6', fontStyle: 'italic' }}>
              {isZh ? tm.textZH : tm.textEN}
            </div>
          </div>
        ))}
      </div>

      {/* Final CTA */}
      <div style={{ padding: '60px 24px 80px', background: 'linear-gradient(160deg,#004B39,#1A6B54)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'white', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          {isZh ? '今天就開始您的皮膚之旅' : 'Start Your Skin Journey Today'}
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px', lineHeight: '1.6' }}>
          {isZh ? '免費使用 · 無需信用卡 · 立即開始' : 'Free to use · No credit card · Start instantly'}
        </p>
        <button style={{ padding: '18px 48px', borderRadius: '14px', background: 'white', color: '#004B39', fontSize: '16px', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'block', width: '100%', maxWidth: '320px', margin: '0 auto 16px' }}
          onClick={onGetStarted}>
          {isZh ? '立即免費開始 🌿' : 'Start for Free 🌿'}
        </button>
        <button style={{ padding: '14px 32px', borderRadius: '14px', background: 'transparent', color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600', border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer', display: 'block', width: '100%', maxWidth: '320px', margin: '0 auto' }}
          onClick={onSignIn}>
          {isZh ? '已有帳號？登入' : 'Already have an account? Sign in'}
        </button>

        <div style={{ marginTop: '40px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
          © 2026 Anitch® · {isZh ? '擺脫濕疹困擾' : 'Freedom from Eczema'}
        </div>
      </div>
    </div>
  )
}
