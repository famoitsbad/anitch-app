import React, { useState } from 'react'

// ─── ARTICLE DATA ─────────────────────────────────────────────────────────────
// Source: Anitch official website articles
// Topics: Aloe Vera, Calendula, Chamomile, Staphylococcus aureus

const ARTICLES = [
  {
    id: 'aloe',
    emoji: '🌿',
    color: '#004B39',
    lightColor: '#E8F2EE',
    readTime: '3 min',
    titleEN: 'Is Aloe Vera Good for Eczema?',
    titleZH: '蘆薈對濕疹有幫助嗎？',
    summaryEN: 'Aloe vera provides cooling relief and lightweight hydration for eczema-prone skin — but its role is more nuanced than you might think.',
    summaryZH: '蘆薈為濕疹皮膚提供清涼舒緩和輕盈保濕效果，但其作用比您想像的更為複雜。',
    contentEN: [
      {
        heading: 'What is aloe vera?',
        body: 'Aloe vera is a plant extract taken from the inner gel of the aloe leaf. It is mostly water, but also contains a range of compounds that help support hydration and skin comfort.',
      },
      {
        heading: 'Is it good for eczema?',
        body: 'Aloe vera can be helpful for eczema-prone skin, particularly when the skin feels dry, warm, or irritated. It provides a cooling effect on application and can help improve skin comfort without adding heaviness.',
      },
      {
        heading: 'How it supports the skin',
        bullets: [
          'Helps increase moisture levels in the skin',
          'Provides a cooling sensation on application',
          'Supports comfort in irritated areas',
        ],
        body: 'Its high water content makes it especially useful for lightweight formulations.',
      },
      {
        heading: 'When is it most useful?',
        bullets: [
          'Dry but not severely cracked skin',
          'Warm or irritated skin',
          'When lightweight hydration is needed',
        ],
        body: 'Because it is not occlusive, it does not seal moisture in the same way as heavier ingredients. It is often combined with other components that support the skin barrier more directly.',
      },
      {
        heading: 'Summary',
        body: 'Aloe vera is a gentle, lightweight ingredient that helps improve hydration and skin comfort. For eczema-prone skin, it works best as part of a broader formulation that also supports the skin barrier and reduces moisture loss.',
      },
    ],
    contentZH: [
      {
        heading: '什麼是蘆薈？',
        body: '蘆薈是從蘆薈葉內凝膠中提取的植物提取物。它主要由水組成，但也含有一系列有助於支持保濕和皮膚舒適度的化合物。',
      },
      {
        heading: '蘆薈對濕疹有益嗎？',
        body: '蘆薈對濕疹皮膚特別有幫助，尤其是當皮膚感到乾燥、溫熱或受刺激時。它在使用時提供清涼效果，並有助於在不增加沉重感的情況下改善皮膚舒適度。',
      },
      {
        heading: '如何支持皮膚',
        bullets: ['有助於增加皮膚水分', '使用時提供清涼感', '支持受刺激部位的舒適度'],
        body: '其高含水量使其特別適用於輕盈配方。',
      },
      {
        heading: '何時最有用？',
        bullets: ['乾燥但未嚴重龜裂的皮膚', '溫熱或受刺激的皮膚', '需要輕盈保濕時'],
        body: '由於它不具有封閉性，不能像較重的成分那樣鎖住水分。它通常與其他更直接支持皮膚屏障的成分結合使用。',
      },
      {
        heading: '總結',
        body: '蘆薈是一種溫和、輕盈的成分，有助於改善保濕和皮膚舒適度。對於濕疹皮膚，它最好作為更廣泛配方的一部分使用，同時支持皮膚屏障並減少水分流失。',
      },
    ],
  },
  {
    id: 'calendula',
    emoji: '🌼',
    color: '#C4784A',
    lightColor: '#FEF0E3',
    readTime: '3 min',
    titleEN: 'Does Calendula Help Eczema?',
    titleZH: '金盞花對濕疹有幫助嗎？',
    summaryEN: 'Calendula is a gentle botanical that helps calm and comfort eczema-prone skin — not as a treatment, but as a supportive ingredient.',
    summaryZH: '金盞花是一種溫和的植物成分，有助於舒緩和安撫濕疹皮膚，不是作為治療，而是作為輔助成分。',
    contentEN: [
      {
        heading: 'What is calendula?',
        body: 'Calendula is a plant extract derived from the marigold flower. It has been used in skincare for its calming properties and is commonly found in products formulated for delicate or reactive skin.',
      },
      {
        heading: 'Does calendula help eczema?',
        body: 'Calendula can be beneficial for eczema-prone skin because it helps reduce visible irritation and supports overall skin comfort. It is most useful during periods when the skin feels inflamed, dry, or sensitive, where a gentle soothing effect is needed.',
      },
      {
        heading: 'How it supports the skin',
        bullets: [
          'Helps calm visible redness',
          'Supports comfort in irritated areas',
          'Contributes to a more balanced skin surface',
        ],
        body: 'Its effect is subtle, but it can make the skin feel more manageable during flare-ups.',
      },
      {
        heading: 'Why it is used in eczema creams',
        body: 'Eczema-prone skin often reacts easily to stronger ingredients. Calendula provides a gentler approach, which is why it is frequently included alongside barrier-supporting and hydrating ingredients. It works best as part of a formulation that addresses multiple aspects of eczema, including dryness and barrier function.',
      },
      {
        heading: 'Summary',
        body: 'Calendula is a gentle, well-tolerated ingredient that helps soothe and calm eczema-prone skin. It is most effective when used as part of a broader skincare routine.',
      },
    ],
    contentZH: [
      {
        heading: '什麼是金盞花？',
        body: '金盞花是從萬壽菊花中提取的植物提取物。它因其鎮靜特性而被用於護膚，常見於針對嬌嫩或敏感皮膚配製的產品中。',
      },
      {
        heading: '金盞花對濕疹有幫助嗎？',
        body: '金盞花對濕疹皮膚有益，因為它有助於減少可見刺激並支持整體皮膚舒適度。它在皮膚感到發炎、乾燥或敏感的時期最為有用，需要溫和舒緩效果時效果最佳。',
      },
      {
        heading: '如何支持皮膚',
        bullets: ['有助於舒緩可見發紅', '支持受刺激部位的舒適度', '有助於皮膚表面更加平衡'],
        body: '其效果雖然微妙，但在發作期間可以讓皮膚感覺更易於管理。',
      },
      {
        heading: '為何用於濕疹霜',
        body: '濕疹皮膚通常容易對較強的成分產生反應。金盞花提供了一種更溫和的方法，這就是為什麼它經常與支持屏障和保濕成分一起使用。它最適合作為解決濕疹多個方面的配方的一部分，包括乾燥和屏障功能。',
      },
      {
        heading: '總結',
        body: '金盞花是一種溫和、耐受性好的成分，有助於舒緩和鎮靜濕疹皮膚。作為更廣泛護膚程序的一部分時效果最佳。',
      },
    ],
  },
  {
    id: 'chamomile',
    emoji: '🌸',
    color: '#7A6B8A',
    lightColor: '#F0EBF8',
    readTime: '3 min',
    titleEN: 'Is Chamomile Good for Eczema?',
    titleZH: '洋甘菊對濕疹皮膚有益嗎？',
    summaryEN: 'Chamomile is widely known for its calming properties — but how does it actually help eczema-prone skin? Here\'s what you need to know.',
    summaryZH: '洋甘菊以其鎮靜特性而廣為人知，但它究竟如何幫助濕疹皮膚？以下是您需要了解的內容。',
    contentEN: [
      {
        heading: 'What is chamomile?',
        body: 'Chamomile is a plant extract derived from flowers, commonly used in formulations designed for sensitive skin. It contains compounds that are known for their calming and skin-conditioning properties.',
      },
      {
        heading: 'Is chamomile good for eczema?',
        body: 'Chamomile can be helpful for eczema-prone skin, particularly when the skin feels irritated or reactive. It does not treat eczema directly, but it can help reduce discomfort and support a calmer skin appearance.',
      },
      {
        heading: 'How it actively helps',
        bullets: [
          'Reduces the appearance of redness',
          'Supports a more even skin surface',
          'Helps calm irritation',
        ],
        body: 'It is often used in products designed for regular or daily use due to its mild nature.',
      },
      {
        heading: 'When is it most useful?',
        bullets: [
          'Sensitive or reactive skin',
          'Mild flare-ups',
          'Areas where the skin feels uncomfortable or tight',
        ],
        body: 'It is less about repair, and more about maintaining comfort and balance.',
      },
      {
        heading: 'Summary',
        body: 'Chamomile is a gentle, calming ingredient that helps reduce irritation and improve skin comfort. It is well suited to eczema-prone skin when used as part of a balanced formulation.',
      },
    ],
    contentZH: [
      {
        heading: '什麼是洋甘菊？',
        body: '洋甘菊是從花朵中提取的植物提取物，常用於針對敏感皮膚設計的配方。它含有以其鎮靜和護膚特性而聞名的化合物。',
      },
      {
        heading: '洋甘菊對濕疹有益嗎？',
        body: '洋甘菊對濕疹皮膚特別有幫助，尤其是當皮膚感到受刺激或敏感時。它不能直接治療濕疹，但可以幫助減少不適並支持更平靜的皮膚外觀。',
      },
      {
        heading: '積極的幫助方式',
        bullets: ['減少發紅的外觀', '支持更均勻的皮膚表面', '有助於舒緩刺激'],
        body: '由於其溫和的性質，它通常用於設計為定期或日常使用的產品。',
      },
      {
        heading: '何時最有用？',
        bullets: ['敏感或易敏感的皮膚', '輕微發作', '皮膚感到不舒適或緊繃的部位'],
        body: '更多的是關於維持舒適和平衡，而不是修復。',
      },
      {
        heading: '總結',
        body: '洋甘菊是一種溫和的鎮靜成分，有助於減少刺激和改善皮膚舒適度。作為均衡配方的一部分使用時，非常適合濕疹皮膚。',
      },
    ],
  },
  {
    id: 'staph',
    emoji: '🔬',
    color: '#2A5A8A',
    lightColor: '#E8F0FA',
    readTime: '5 min',
    titleEN: 'What is Staph & Why Does It Affect Eczema?',
    titleZH: '什麼是金黃色葡萄球菌？為何影響濕疹？',
    summaryEN: 'Staphylococcus aureus is a naturally occurring bacterium that plays a key role in triggering eczema flare-ups. Here\'s how the cycle works.',
    summaryZH: '金黃色葡萄球菌是一種天然存在的細菌，在引發濕疹發作中起關鍵作用。以下是這個循環的運作方式。',
    contentEN: [
      {
        heading: 'What exactly is Staph?',
        body: 'Staphylococcus aureus is a naturally occurring bacterium found on the skin. Many people carry it without any issues. However, for those with eczema, it can play a key role in triggering flare-ups.',
        bullets: [
          'Around 20–30% of people carry it regularly',
          'It usually causes no problems on healthy skin',
          'Issues arise when the skin barrier is weakened',
        ],
      },
      {
        heading: 'Why does Staph matter for eczema?',
        body: 'Eczema weakens the skin\'s protective barrier, making it easier for Staph to grow and spread. When Staph levels increase, it can:',
        bullets: [
          'Irritate and damage the skin barrier',
          'Trigger inflammation and redness',
          'Increase itching',
          'Slow down skin recovery',
        ],
      },
      {
        heading: 'The flare-up cycle',
        body: 'This creates a cycle many eczema sufferers experience:\n\nWeakened skin → more Staph → more irritation → further damage',
      },
      {
        heading: 'Why is Staph so common in eczema?',
        body: 'Research shows that people with eczema tend to have much higher levels of Staph on their skin, especially during flare-ups. Eczema-prone skin lacks the same level of natural defences as healthy skin. You can think of eczema-prone skin as having a "leaky" barrier that allows moisture to escape, irritants to enter, and bacteria like Staph to thrive.',
      },
      {
        heading: 'What this means for eczema care',
        body: 'Understanding the role of Staphylococcus aureus helps explain why eczema can be persistent and why flare-ups keep returning. Eczema isn\'t just about dry skin — it is linked to the balance of bacteria on the skin. Managing eczema often involves addressing moisture loss, barrier function, and bacterial balance together.',
      },
      {
        heading: 'References',
        bullets: [
          'National Eczema Association: nationaleczema.org',
          'American Academy of Dermatology: aad.org',
          'Kong HH et al. Genome Research — skin microbiome & eczema flares',
          'Nakatsuji T et al. Science Translational Medicine — antimicrobials & Staph',
        ],
      },
    ],
    contentZH: [
      {
        heading: '金黃色葡萄球菌究竟是什麼？',
        body: '金黃色葡萄球菌是一種天然存在於皮膚上的細菌。許多人攜帶它而沒有任何問題。然而，對於患有濕疹的人來說，它可以在引發發作中起關鍵作用。',
        bullets: ['約20-30%的人定期攜帶', '在健康皮膚上通常不會造成問題', '當皮膚屏障受損時會出現問題'],
      },
      {
        heading: '為什麼金黃色葡萄球菌對濕疹重要？',
        body: '濕疹會削弱皮膚的保護屏障，使金黃色葡萄球菌更容易生長和擴散。當金黃色葡萄球菌水平增加時，它可以：',
        bullets: ['刺激和損壞皮膚屏障', '引發炎症和發紅', '加劇瘙癢', '減慢皮膚恢復'],
      },
      {
        heading: '發作循環',
        body: '這形成了許多濕疹患者經歷的循環：\n\n皮膚屏障受損 → 更多金黃色葡萄球菌 → 更多刺激 → 進一步損傷',
      },
      {
        heading: '為何金黃色葡萄球菌在濕疹中如此常見？',
        body: '研究表明，濕疹患者皮膚上的金黃色葡萄球菌水平往往高得多，尤其是在發作期間。濕疹皮膚缺乏與健康皮膚相同水平的天然防禦能力。您可以將濕疹皮膚視為具有「滲漏」屏障，導致水分流失、刺激物進入，以及像金黃色葡萄球菌這樣的細菌滋生。',
      },
      {
        heading: '這對濕疹護理意味著什麼',
        body: '了解金黃色葡萄球菌的作用有助於解釋為什麼濕疹可能持續存在，以及為什麼發作會不斷復發。濕疹不僅僅是關於乾燥皮膚，它與皮膚上的細菌平衡有關。管理濕疹通常涉及同時解決水分流失、屏障功能和細菌平衡問題。',
      },
      {
        heading: '參考資料',
        bullets: [
          '美國國家濕疹協會：nationaleczema.org',
          '美國皮膚病學學會：aad.org',
          'Kong HH等人，《基因組研究》——皮膚微生物組與濕疹發作',
          'Nakatsuji T等人，《科學轉化醫學》——抗菌物質與金黃色葡萄球菌',
        ],
      },
    ],
  },
]

// ─── ARTICLE MODAL ────────────────────────────────────────────────────────────
function ArticleModal({ article, onClose, isZh, th }) {
  const content = isZh ? article.contentZH : article.contentEN
  const title = isZh ? article.titleZH : article.titleEN

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}>
      <div style={{ background: th.white, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '500px', margin: '0 auto', maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: th.border, margin: '12px auto 0', flexShrink: 0 }} />

        {/* Header */}
        <div style={{ padding: '12px 20px 14px', borderBottom: `1px solid ${th.border}`, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: article.lightColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                {article.emoji}
              </div>
              <span style={{ fontSize: '10px', fontWeight: '700', color: article.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {isZh ? '濕疹知識' : 'Eczema Science'} · {article.readTime}
              </span>
            </div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: th.textPrimary, lineHeight: '1.3', letterSpacing: '-0.01em' }}>
              {title}
            </div>
          </div>
          <button style={{ background: 'none', border: 'none', fontSize: '20px', color: th.textMuted, cursor: 'pointer', padding: '0 0 0 12px', flexShrink: 0 }} onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div style={{ overflow: 'auto', padding: '20px 20px 40px' }}>
          {content.map((section, i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: th.textPrimary, marginBottom: '8px', letterSpacing: '-0.01em' }}>
                {section.heading}
              </div>
              {section.body && section.body.split('\n\n').map((para, j) => (
                <div key={j} style={{ fontSize: '14px', color: th.textSecondary, lineHeight: '1.7', marginBottom: para.includes('→') ? '0' : '8px',
                  background: para.includes('→') ? article.lightColor : 'transparent',
                  padding: para.includes('→') ? '10px 14px' : '0',
                  borderRadius: para.includes('→') ? '8px' : '0',
                  fontWeight: para.includes('→') ? '600' : '400',
                  color: para.includes('→') ? article.color : th.textSecondary,
                }}>
                  {para}
                </div>
              ))}
              {section.bullets && (
                <div style={{ marginTop: '6px' }}>
                  {section.bullets.map((b, j) => (
                    <div key={j} style={{ display: 'flex', gap: '10px', marginBottom: '6px', alignItems: 'flex-start' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: article.color, flexShrink: 0, marginTop: '7px' }} />
                      <div style={{ fontSize: '14px', color: th.textSecondary, lineHeight: '1.6' }}>{b}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Source note */}
          <div style={{ background: th.lightGrey, borderRadius: '10px', padding: '12px 14px', fontSize: '11px', color: th.textMuted, lineHeight: '1.5' }}>
            📖 {isZh
              ? '本文內容來自 Anitch 官方網站，僅供參考，不構成醫療建議。'
              : 'Content sourced from the Anitch official website for informational purposes only. Not medical advice.'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN LEARN SECTION COMPONENT ────────────────────────────────────────────
export default function LearnSection({ isZh, th }) {
  const [selectedArticle, setSelectedArticle] = useState(null)

  return (
    <div style={{ marginTop: '16px' }}>
      {/* Section header */}
      <div style={{ padding: '0 16px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: th.green, marginBottom: '4px' }}>
            {isZh ? '濕疹知識庫' : 'ECZEMA SCIENCE'}
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: th.textPrimary, letterSpacing: '-0.01em' }}>
            {isZh ? '深入了解您的皮膚' : 'Understand Your Skin'}
          </div>
        </div>
      </div>

      {/* Horizontal scroll cards */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 16px 8px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {ARTICLES.map(article => (
          <div key={article.id}
            style={{ flexShrink: 0, width: '220px', background: th.white, borderRadius: '16px', border: `1px solid ${th.border}`, overflow: 'hidden', cursor: 'pointer', boxShadow: `0 2px 8px ${th.shadow}`, transition: 'transform 0.2s, box-shadow 0.2s' }}
            onClick={() => setSelectedArticle(article)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${th.shadowMd}` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 2px 8px ${th.shadow}` }}>

            {/* Card color band */}
            <div style={{ height: '6px', background: article.color }} />

            <div style={{ padding: '14px' }}>
              {/* Emoji + read time */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: article.lightColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  {article.emoji}
                </div>
                <div style={{ fontSize: '10px', color: th.textMuted, fontWeight: '500' }}>
                  {article.readTime} {isZh ? '閱讀' : 'read'}
                </div>
              </div>

              {/* Title */}
              <div style={{ fontSize: '13px', fontWeight: '800', color: th.textPrimary, lineHeight: '1.3', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                {isZh ? article.titleZH : article.titleEN}
              </div>

              {/* Summary */}
              <div style={{ fontSize: '11px', color: th.textMuted, lineHeight: '1.5', marginBottom: '12px' }}>
                {isZh ? article.summaryZH : article.summaryEN}
              </div>

              {/* Read more */}
              <div style={{ fontSize: '12px', fontWeight: '700', color: article.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isZh ? '閱讀全文' : 'Read more'} →
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View all button */}
      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ background: th.greenLight, borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${th.greenSoft}`, cursor: 'pointer' }}
          onClick={() => window.open('https://www.anitch.com/zh', '_blank')}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: th.green }}>
              {isZh ? '查看更多文章' : 'View all articles'}
            </div>
            <div style={{ fontSize: '11px', color: th.textMuted, marginTop: '2px' }}>
              {isZh ? '前往 Anitch 官方網站' : 'Visit the Anitch official website'}
            </div>
          </div>
          <div style={{ fontSize: '20px', color: th.green }}>→</div>
        </div>
      </div>

      {/* Article modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          isZh={isZh}
          th={th}
        />
      )}
    </div>
  )
}
