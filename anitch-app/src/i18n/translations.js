export const translations = {
  en: {
    appName: 'Anitch',
    appSubtitle: 'Eczema Diary',
    // Nav
    nav: { home: 'Home', log: 'Log', history: 'History', insights: 'Insights', profile: 'Profile' },
    // Auth
    auth: {
      welcome: 'Welcome to', welcomeSub: 'Your personal eczema companion',
      email: 'Email address', password: 'Password', name: 'Your name',
      login: 'Sign In', signup: 'Create Account', logout: 'Sign Out',
      noAccount: "Don't have an account?", hasAccount: 'Already have an account?',
      signupLink: 'Sign up', loginLink: 'Sign in',
      loggingIn: 'Signing in...', signingUp: 'Creating account...',
    },
    // Home
    home: {
      greeting: 'Good morning', greetingEvening: 'Good evening',
      sub: 'Your skin needs a check-in today.',
      streak: 'day streak', keepGoing: 'Keep it going!',
      avgSeverity: 'Avg Severity', flareDays: 'Flare Days',
      daysLogged: 'Days Logged', bestWeek: 'Best Week',
      logBtn: '✦ Log Today\'s Condition',
      last7: 'Last 7 days', noEntries: 'No entries yet — start logging!',
      todayLogged: '✓ Today already logged',
    },
    // Log
    log: {
      title: "How's your skin today?",
      sub: 'Take a moment to record — every entry builds your picture.',
      severity: 'Overall Severity', noneToSevere: 'None → Severe',
      bodyMap: 'Affected Areas', bodyMapSub: 'Select severity then tap body zones:',
      mild: 'Mild (dry, slightly red)', moderate: 'Moderate (itchy, inflamed)', severe: 'Severe (oozing, cracked)',
      symptoms: 'Symptoms', triggers: 'Possible Triggers Today',
      food: 'Food & Drink', environment: 'Environment', lifestyle: 'Lifestyle',
      treatments: 'Treatments Applied', twiceDaily: 'Twice daily', morning: 'Morning', asNeeded: 'As needed',
      photo: 'Skin Photo', photoSub: 'Tap to upload a photo of your skin today',
      notes: 'Notes for Today', notesPlaceholder: 'Anything worth noting — food, new products, how you feel...',
      save: '✦ Save Today\'s Entry', saving: 'Saving...', saved: '✦ Entry Saved!',
      sevDesc: ['Clear — looking good!','Very mild','Mild','Mild-moderate','Moderate — manageable','Moderate','Moderate-severe','Severe — take care','Very severe','Extreme — see a doctor'],
    },
    // Symptoms
    symptoms: { itching:'Itching', redness:'Redness', dryness:'Dryness', weeping:'Weeping/Oozing', swelling:'Swelling', burning:'Burning/Stinging' },
    // Triggers
    triggers: {
      dairy:'Dairy 🥛', gluten:'Gluten 🌾', eggs:'Eggs 🥚', nuts:'Nuts 🥜', alcohol:'Alcohol 🍷', spicy:'Spicy 🌶️', seafood:'Seafood 🦐',
      pollen:'High Pollen 🌿', cold:'Cold/Dry Air 🌬️', heat:'Heat & Sweat 🥵', pets:'Pet Dander 🐾', dust:'Dust Mites 🏠', pollution:'Air Pollution 🌫️',
      sleep:'Poor Sleep 😴', stress:'High Stress 😮‍💨', newProduct:'New Product 🧴', exercise:'Exercise 🏃', emotion:'Emotional 😟',
    },
    // Body zones
    zones: { head:'Head', neck:'Neck', leftArm:'Left Arm', rightArm:'Right Arm', torso:'Torso', leftLeg:'Left Leg', rightLeg:'Right Leg', hands:'Hands', feet:'Feet' },
    // History
    history: { title:'Your Journey', sub:'Every flare, every improvement.', noEntries:'No entries yet. Start logging today!', severity:'Severity', noPhoto:'No photo' },
    // Insights
    insights: {
      title:'Your Patterns', sub:'Last 30 days · Share with your dermatologist',
      avgSeverity:'Avg Severity', flareDays:'Flare Days', daysLogged:'Days Logged', bestWeek:'Best Week',
      chart:'14-Day Severity Trend', topTriggers:'Your Top Triggers',
      export:'📄 Export for Dermatologist', noData:'Log at least 7 days to see insights.',
      vsLastMonth:'vs last month', streak:'day streak',
    },
    // Profile
    profile: {
      title:'Profile', language:'Language', notifications:'Daily Reminder',
      notifSub:'Remind me to log every day at:', save:'Save Settings', saved:'Saved!',
      dangerZone:'Account', logout:'Sign Out',
    },
    // Severity labels
    sevLabels: ['Clear','Very Mild','Mild','Mild-Mod','Moderate','Moderate','Mod-Severe','Severe','V.Severe','Extreme'],
    scoreLabels: { mild:'Mild', moderate:'Moderate', severe:'Severe' },
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    days: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  },
  zh: {
    appName: 'Anitch',
    appSubtitle: '濕疹日記',
    nav: { home: '主頁', log: '記錄', history: '歷史', insights: '分析', profile: '我的' },
    auth: {
      welcome: '歡迎使用', welcomeSub: '您的個人濕疹日記',
      email: '電郵地址', password: '密碼', name: '您的名字',
      login: '登入', signup: '建立帳號', logout: '登出',
      noAccount: '還沒有帳號？', hasAccount: '已有帳號？',
      signupLink: '立即註冊', loginLink: '登入',
      loggingIn: '登入中...', signingUp: '建立帳號中...',
    },
    home: {
      greeting: '早安', greetingEvening: '晚安',
      sub: '今天記錄一下您的皮膚狀況吧。',
      streak: '天連續記錄', keepGoing: '繼續保持！',
      avgSeverity: '平均嚴重度', flareDays: '發作天數',
      daysLogged: '記錄天數', bestWeek: '最佳週次',
      logBtn: '✦ 記錄今日狀況',
      last7: '最近7天', noEntries: '尚未有記錄，開始記錄吧！',
      todayLogged: '✓ 今日已記錄',
    },
    log: {
      title: '今天皮膚狀況如何？',
      sub: '花點時間記錄——每一筆都在累積您的健康圖像。',
      severity: '整體嚴重程度', noneToSevere: '無 → 嚴重',
      bodyMap: '受影響部位', bodyMapSub: '選擇嚴重程度，再點擊身體部位：',
      mild: '輕度（乾燥、略紅）', moderate: '中度（搔癢、發炎）', severe: '重度（滲液、龜裂）',
      symptoms: '症狀', triggers: '今日可能誘發因素',
      food: '飲食', environment: '環境', lifestyle: '生活習慣',
      treatments: '今日用藥', twiceDaily: '每日兩次', morning: '早上', asNeeded: '按需使用',
      photo: '皮膚照片', photoSub: '點擊上傳今日皮膚照片',
      notes: '今日備注', notesPlaceholder: '任何值得記錄的事——飲食、新產品、心情……',
      save: '✦ 儲存今日記錄', saving: '儲存中...', saved: '✦ 已儲存！',
      sevDesc: ['完全無症狀！','極輕微','輕微','輕至中度','中度——尚可控制','中度','中至重度','嚴重——請多休息','非常嚴重','極度嚴重——請盡快就醫'],
    },
    symptoms: { itching:'搔癢', redness:'發紅', dryness:'乾燥', weeping:'滲液／流水', swelling:'腫脹', burning:'灼熱／刺痛' },
    triggers: {
      dairy:'乳製品 🥛', gluten:'麩質 🌾', eggs:'雞蛋 🥚', nuts:'堅果 🥜', alcohol:'酒精 🍷', spicy:'辛辣食物 🌶️', seafood:'海鮮 🦐',
      pollen:'花粉偏高 🌿', cold:'寒冷乾燥 🌬️', heat:'悶熱出汗 🥵', pets:'寵物皮屑 🐾', dust:'塵蟎 🏠', pollution:'空氣污染 🌫️',
      sleep:'睡眠不足 😴', stress:'壓力大 😮‍💨', newProduct:'新產品 🧴', exercise:'運動 🏃', emotion:'情緒波動 😟',
    },
    zones: { head:'頭部', neck:'頸部', leftArm:'左手臂', rightArm:'右手臂', torso:'軀幹', leftLeg:'左腿', rightLeg:'右腿', hands:'手部', feet:'足部' },
    history: { title:'記錄歷程', sub:'每次發作，每次改善。', noEntries:'尚未有記錄，今天開始吧！', severity:'嚴重度', noPhoto:'無照片' },
    insights: {
      title:'規律趨勢', sub:'最近30天 · 可列印給皮膚科醫生',
      avgSeverity:'平均嚴重度', flareDays:'發作天數', daysLogged:'記錄天數', bestWeek:'最佳週次',
      chart:'近14天嚴重程度', topTriggers:'主要誘發因素',
      export:'📄 匯出給皮膚科醫生', noData:'記錄至少7天後即可查看分析。',
      vsLastMonth:'比上月', streak:'天連續記錄',
    },
    profile: {
      title:'個人設定', language:'語言', notifications:'每日提醒',
      notifSub:'每天提醒我記錄，時間：', save:'儲存設定', saved:'已儲存！',
      dangerZone:'帳號', logout:'登出',
    },
    sevLabels: ['無','極輕微','輕微','輕中度','中度','中度','中重度','嚴重','非常嚴重','極度嚴重'],
    scoreLabels: { mild:'輕度', moderate:'中度', severe:'重度' },
    months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    days: ['日','一','二','三','四','五','六'],
  }
}
