import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';

const ARTICLES = [
  {
    id: 'aloe', color: '#E8F5E9', accent: '#2E7D32', emoji: '🌿',
    en: { title: 'Is Aloe Vera Good for Eczema?', summary: 'Aloe vera has soothing properties that may calm eczema flare-ups and reduce redness.', url: 'https://www.anitch.com/zh/blogs/education/is-aloe-vera-good-for-eczema' },
    zh: { title: '蘆薈對濕疹有幫助嗎？', summary: '蘆薈的舒緩特性可能有助平復濕疹發作及減少紅疹。', url: 'https://www.anitch.com/zh/blogs/education/is-aloe-vera-good-for-eczema' },
  },
  {
    id: 'calendula', color: '#FFF3E0', accent: '#E65100', emoji: '🌼',
    en: { title: 'Does Calendula Help Eczema?', summary: 'Calendula is known for anti-inflammatory effects that can support sensitive, eczema-prone skin.', url: 'https://www.anitch.com/zh/blogs/education/does-calendula-help-eczema' },
    zh: { title: '金盞花能改善濕疹嗎？', summary: '金盞花的抗炎特性有助敏感及濕疹肌膚。', url: 'https://www.anitch.com/zh/blogs/education/does-calendula-help-eczema' },
  },
  {
    id: 'chamomile', color: '#F3E5F5', accent: '#6A1B9A', emoji: '🌸',
    en: { title: 'Is Chamomile Good for Eczema?', summary: 'Chamomile contains compounds that may help reduce eczema symptoms and soothe irritated skin.', url: 'https://www.anitch.com/zh/blogs/education/is-chamomile-good-for-eczema' },
    zh: { title: '洋甘菊對濕疹有益嗎？', summary: '洋甘菊含有助舒緩皮膚炎症及刺激的成分。', url: 'https://www.anitch.com/zh/blogs/education/is-chamomile-good-for-eczema' },
  },
  {
    id: 'staph', color: '#E3F2FD', accent: '#1565C0', emoji: '🔬',
    en: { title: 'What is Staph & Why Does It Affect Eczema?', summary: 'Staph bacteria can worsen eczema. Understanding this link is key to managing flare-ups.', url: 'https://www.anitch.com/zh/blogs/education/what-is-staph' },
    zh: { title: '葡萄球菌是什麼？為何影響濕疹？', summary: '葡萄球菌會加重濕疹，了解這種聯繫有助控制病情。', url: 'https://www.anitch.com/zh/blogs/education/what-is-staph' },
  },
];

export default function LearnSection() {
  const { th, lang } = useApp();
  const [open, setOpen] = useState(null);

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: th.text, marginBottom: 10 }}>
        {lang === 'zh' ? '了解更多' : 'Learn more'}
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
        {ARTICLES.map(a => {
          const art = a[lang] || a.en;
          return (
            <div key={a.id} onClick={() => setOpen(a)} style={{
              minWidth: 160, borderRadius: 14, padding: '14px 14px',
              background: a.color, flexShrink: 0, cursor: 'pointer',
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{a.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: a.accent, lineHeight: 1.4 }}>{art.title}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: th.textMuted, marginTop: 4 }}>
        {lang === 'zh' ? '內容來自Anitch官方網站，不構成醫療建議。' : 'Content from Anitch official website. Not medical advice.'}
      </div>

      {/* Bottom sheet modal */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}
          onClick={() => setOpen(null)}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: th.card, borderRadius: '20px 20px 0 0', padding: '20px 20px 40px' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: th.border, margin: '0 auto 16px' }} />
            <div style={{ fontSize: 22, marginBottom: 8 }}>{open.emoji}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: th.text, marginBottom: 10 }}>{(open[lang] || open.en).title}</div>
            <div style={{ fontSize: 14, color: th.textSub, lineHeight: 1.6, marginBottom: 16 }}>{(open[lang] || open.en).summary}</div>
            <a href={(open[lang] || open.en).url} target="_blank" rel="noreferrer"
              style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 12, background: '#004B39', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              {lang === 'zh' ? '查看完整文章 →' : 'Read full article →'}
            </a>
            <button onClick={() => setOpen(null)} style={{ width: '100%', marginTop: 10, padding: 12, borderRadius: 12, background: 'none', border: `1px solid ${th.border}`, color: th.textSub, fontSize: 14, cursor: 'pointer' }}>
              {lang === 'zh' ? '關閉' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
