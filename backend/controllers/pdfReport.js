/**
 * pdfReport.js  — ES Module (import/export)
 * Backend: Node.js + Puppeteer
 *
 * INSTALL:  npm install puppeteer
 *
 * Total Pages: 9
 * Page 1 — Cover
 * Page 2 — About Numerology, Importance & Sacred Systems
 * Page 3 — Chaldean & Pythagorean Analysis
 * Page 4 — Compatibility & Personality
 * Page 5 — Challenges, Remedies & Career
 * Page 6 — Name Suggestions
 * Page 7 — Final Advice & Summary
 * Page 8 — Current Name 5-Year Forecast  ← NEW
 * Page 9 — Suggested Name 5-Year Forecast
 *
 * FIXES:
 * 1. Page alignment: Each .page div uses exact A4 height with page-break-after:always
 *    and flexbox column so header/footer stick top/bottom on every page.
 * 2. Current name 5-year forecast added as Page 8 (before suggested name forecast).
 */

import puppeteer from 'puppeteer';

// ── Letter value maps ────────────────────────────────────────
const CHALDEAN_MAP = {
  A:1,I:1,J:1,Q:1,Y:1,B:2,K:2,R:2,C:3,G:3,L:3,S:3,
  D:4,M:4,T:4,E:5,H:5,N:5,X:5,U:6,V:6,W:6,O:7,Z:7,F:8,P:8,
};
const PYTH_MAP = {
  A:1,J:1,S:1,B:2,K:2,T:2,C:3,L:3,U:3,D:4,M:4,V:4,
  E:5,N:5,W:5,F:6,O:6,X:6,G:7,P:7,Y:7,H:8,Q:8,Z:8,I:9,R:9,
};

// ── Planet / Remedy data ─────────────────────────────────────
const REMEDIES = {
  1:{planet:'Sun (Surya)',     symbol:'☉', day:'Sunday',    colors:'Red, Orange, Gold',         gem:'Ruby / Garnet',              mantra:'Om Hraam Hreem Hraum Sah Suryaya Namah',   trait:'Leadership & Authority'},
  2:{planet:'Moon (Chandra)',  symbol:'☽', day:'Monday',    colors:'White, Silver, Pearl',      gem:'Pearl / Moonstone',          mantra:'Om Shraam Shreem Shraum Sah Chandraya Namah', trait:'Intuition & Sensitivity'},
  3:{planet:'Jupiter (Guru)',  symbol:'♃', day:'Thursday',  colors:'Yellow, Gold',              gem:'Yellow Sapphire / Topaz',    mantra:'Om Graam Greem Graum Sah Gurave Namah',   trait:'Wisdom & Expansion'},
  4:{planet:'Rahu / Uranus',   symbol:'☊', day:'Saturday',  colors:'Blue, Grey, Electric Blue', gem:'Hessonite (Gomed)',          mantra:'Om Raam Reem Raum Sah Rahave Namah',       trait:'Innovation & Change'},
  5:{planet:'Mercury (Budha)', symbol:'☿', day:'Wednesday', colors:'Green, Emerald',            gem:'Emerald / Green Tourmaline', mantra:'Om Braam Breem Braum Sah Budhaya Namah',   trait:'Communication & Intellect'},
  6:{planet:'Venus (Shukra)',  symbol:'♀', day:'Friday',    colors:'Pink, White, Light Blue',   gem:'Diamond / White Sapphire',   mantra:'Om Draam Dreem Draum Sah Shukraya Namah',  trait:'Love & Harmony'},
  7:{planet:'Ketu / Neptune',  symbol:'☋', day:'Monday',    colors:'Purple, Violet, Grey',      gem:"Cat's Eye (Lehsunia)",       mantra:'Om Straam Streem Straum Sah Ketave Namah', trait:'Spirituality & Mysticism'},
  8:{planet:'Saturn (Shani)',  symbol:'♄', day:'Saturday',  colors:'Black, Dark Blue, Indigo',  gem:'Blue Sapphire / Amethyst',   mantra:'Om Praam Preem Praum Sah Shanishcharaya Namah', trait:'Discipline & Karma'},
  9:{planet:'Mars (Mangal)',   symbol:'♂', day:'Tuesday',   colors:'Red, Scarlet, Coral',       gem:'Red Coral / Carnelian',      mantra:'Om Kraam Kreem Kraum Sah Bhaumaya Namah',  trait:'Courage & Energy'},
};

const NUMBER_MEANINGS = {
  1:'The Leader — Independent, driven, a pioneer who carves their own path.',
  2:'The Diplomat — Cooperative, sensitive, a natural peacemaker and partner.',
  3:'The Creator — Expressive, joyful, gifted with communication and creativity.',
  4:'The Builder — Practical, disciplined, a foundation of stability and hard work.',
  5:'The Explorer — Freedom-loving, adaptable, magnetic and full of adventure.',
  6:'The Nurturer — Caring, responsible, drawn to family, beauty, and harmony.',
  7:'The Seeker — Introspective, analytical, a spiritual and intellectual investigator.',
  8:'The Achiever — Ambitious, powerful, destined for material and worldly success.',
  9:'The Humanitarian — Compassionate, wise, here to uplift and inspire others.',
  11:'Master Number 11 — The Intuitive Visionary. Rare spiritual insight and heightened sensitivity.',
  22:'Master Number 22 — The Master Builder. Power to turn the grandest dreams into reality.',
  33:'Master Number 33 — The Master Teacher. A beacon of healing, compassion, and truth.',
};

// ── 5-Year Forecast Data ─────────────────────────────────────
const FORECAST_THEMES = {
  1:[
    {title:'Year of New Beginnings',   theme:'Leadership & Identity',    focus:'Career Launch',    energy:'⬆️ Rising',  color:'#d97706'},
    {title:'Year of Partnerships',     theme:'Collaboration & Growth',   focus:'Relationships',    energy:'🔄 Balanced',color:'#7c3aed'},
    {title:'Year of Creative Power',   theme:'Expression & Recognition', focus:'Personal Brand',   energy:'⬆️ Peak',   color:'#16a34a'},
    {title:'Year of Solid Foundation', theme:'Stability & Hard Work',    focus:'Finance & Assets', energy:'🔄 Steady', color:'#1d4ed8'},
    {title:'Year of Freedom & Change', theme:'Expansion & Travel',       focus:'New Horizons',     energy:'⚡ Dynamic',color:'#dc2626'},
  ],
  2:[
    {title:'Year of Harmony',          theme:'Balance & Cooperation',    focus:'Relationships',    energy:'🔄 Balanced',color:'#7c3aed'},
    {title:'Year of Creative Flow',    theme:'Expression & Joy',         focus:'Personal Growth',  energy:'⬆️ Rising', color:'#16a34a'},
    {title:'Year of Structure',        theme:'Discipline & Planning',    focus:'Career & Finance', energy:'🔄 Steady', color:'#1d4ed8'},
    {title:'Year of Transformation',   theme:'Change & Adventure',       focus:'New Directions',   energy:'⚡ Dynamic',color:'#dc2626'},
    {title:'Year of Inner Wisdom',     theme:'Spirituality & Clarity',   focus:'Self Discovery',   energy:'⬆️ Peak',   color:'#d97706'},
  ],
  3:[
    {title:'Year of Expression',       theme:'Communication & Creativity',focus:'Creative Projects',energy:'⬆️ Peak',  color:'#16a34a'},
    {title:'Year of Foundation',       theme:'Stability & Building',     focus:'Finance & Home',   energy:'🔄 Steady', color:'#1d4ed8'},
    {title:'Year of Freedom',          theme:'Adventure & Change',       focus:'New Experiences',  energy:'⚡ Dynamic',color:'#dc2626'},
    {title:'Year of Healing',          theme:'Family & Nurturing',       focus:'Relationships',    energy:'🔄 Balanced',color:'#7c3aed'},
    {title:'Year of Mastery',          theme:'Spiritual Growth',         focus:'Inner Wisdom',     energy:'⬆️ Rising', color:'#d97706'},
  ],
  4:[
    {title:'Year of Building',         theme:'Discipline & Hard Work',   focus:'Career & Finance', energy:'🔄 Steady', color:'#1d4ed8'},
    {title:'Year of Adventure',        theme:'Freedom & Change',         focus:'New Opportunities',energy:'⚡ Dynamic',color:'#dc2626'},
    {title:'Year of Love',             theme:'Harmony & Relationships',  focus:'Family & Romance', energy:'🔄 Balanced',color:'#7c3aed'},
    {title:'Year of Reflection',       theme:'Spirituality & Wisdom',    focus:'Inner Growth',     energy:'⬆️ Rising', color:'#d97706'},
    {title:'Year of Achievement',      theme:'Power & Recognition',      focus:'Material Success', energy:'⬆️ Peak',   color:'#16a34a'},
  ],
  5:[
    {title:'Year of Change',           theme:'Freedom & Adventure',      focus:'New Directions',   energy:'⚡ Dynamic',color:'#dc2626'},
    {title:'Year of Nurturing',        theme:'Love & Family',            focus:'Relationships',    energy:'🔄 Balanced',color:'#7c3aed'},
    {title:'Year of Wisdom',           theme:'Spirituality & Study',     focus:'Inner Journey',    energy:'⬆️ Rising', color:'#d97706'},
    {title:'Year of Power',            theme:'Ambition & Achievement',   focus:'Career & Wealth',  energy:'⬆️ Peak',   color:'#16a34a'},
    {title:'Year of Completion',       theme:'Humanitarianism & Service',focus:'Legacy Building',  energy:'🔄 Steady', color:'#1d4ed8'},
  ],
  6:[
    {title:'Year of Love & Harmony',   theme:'Family & Relationships',   focus:'Home & Romance',   energy:'🔄 Balanced',color:'#7c3aed'},
    {title:'Year of Discovery',        theme:'Spirituality & Mystery',   focus:'Inner Exploration',energy:'⬆️ Rising', color:'#d97706'},
    {title:'Year of Power',            theme:'Achievement & Wealth',     focus:'Career Milestone', energy:'⬆️ Peak',   color:'#16a34a'},
    {title:'Year of Transformation',   theme:'Completion & Release',     focus:'Letting Go',       energy:'🔄 Steady', color:'#1d4ed8'},
    {title:'Year of New Beginnings',   theme:'Leadership & Fresh Start', focus:'New Identity',     energy:'⚡ Dynamic',color:'#dc2626'},
  ],
  7:[
    {title:'Year of Spiritual Awakening',theme:'Intuition & Wisdom',    focus:'Inner Growth',     energy:'⬆️ Rising', color:'#d97706'},
    {title:'Year of Material Power',   theme:'Achievement & Wealth',     focus:'Financial Goals',  energy:'⬆️ Peak',   color:'#16a34a'},
    {title:'Year of Completion',       theme:'Service & Compassion',     focus:'Relationships',    energy:'🔄 Steady', color:'#1d4ed8'},
    {title:'Year of New Cycle',        theme:'Leadership & Independence',focus:'Fresh Beginnings', energy:'⚡ Dynamic',color:'#dc2626'},
    {title:'Year of Partnership',      theme:'Collaboration & Balance',  focus:'Love & Business',  energy:'🔄 Balanced',color:'#7c3aed'},
  ],
  8:[
    {title:'Year of Abundance',        theme:'Power & Achievement',      focus:'Career & Wealth',  energy:'⬆️ Peak',   color:'#16a34a'},
    {title:'Year of Wisdom',           theme:'Completion & Closure',     focus:'Life Lessons',     energy:'🔄 Steady', color:'#1d4ed8'},
    {title:'Year of Rebirth',          theme:'New Beginnings & Courage', focus:'Identity Reset',   energy:'⚡ Dynamic',color:'#dc2626'},
    {title:'Year of Partnerships',     theme:'Cooperation & Love',       focus:'Relationships',    energy:'🔄 Balanced',color:'#7c3aed'},
    {title:'Year of Growth',           theme:'Creativity & Expansion',   focus:'Personal Brand',   energy:'⬆️ Rising', color:'#d97706'},
  ],
  9:[
    {title:'Year of Completion',       theme:'Humanitarian Service',     focus:'Legacy & Giving',  energy:'🔄 Steady', color:'#1d4ed8'},
    {title:'Year of New Dawn',         theme:'Leadership & Courage',     focus:'New Chapter',      energy:'⚡ Dynamic',color:'#dc2626'},
    {title:'Year of Partnership',      theme:'Cooperation & Sensitivity',focus:'Love & Business',  energy:'🔄 Balanced',color:'#7c3aed'},
    {title:'Year of Creativity',       theme:'Expression & Joy',         focus:'Creative Growth',  energy:'⬆️ Rising', color:'#d97706'},
    {title:'Year of Mastery',          theme:'Stability & Achievement',  focus:'Career Milestones',energy:'⬆️ Peak',   color:'#16a34a'},
  ],
};

const YEAR_PREDICTIONS = {
  1:['Naya naam dharan karne ke baad pehla saal aapke liye nayi shuruaat leke aata hai. Career mein leadership opportunities milenge. Financial growth steady rahegi. Ek strong identity establish hogi.','Doosra saal teamwork aur partnerships ke liye ideal hai. Kisi important vyakti se mulakat ho sakti hai jo aapke future ko shape kare. Business mein collaboration se faayda.','Teesre saal aapki creativity peak par hogi. Public recognition milne ke zyada chances hain. Side projects aur creative ventures ke liye sahi waqt. Social circle expand hoga.','Chauthe saal financial planning aur investment pe focus karo. Property ya long-term assets mein invest karne ka acha waqt. Career mein stability aur recognition milegi.','Paanchwa saal travel, adventure aur naye opportunities leke aata hai. Career change ya promotion possible. International connections banne ke chances. Dynamic energy rahegi.'],
  2:['Naam badlne ke baad pehle saal relationships aur partnerships mein sudhaar aayega. Life partner ya business partner ke saath harmony badegi. Emotional balance milega.','Doosre saal creative projects mein safalta milegi. Kala, music, ya communication fields mein recognition. Social life vibrant rahegi. New friendships bannenge.','Teesre saal career mein systematic approach se badi success milegi. Financial discipline se savings badenge. Ghar se related kaam karein — renovation ya purchase possible.','Chauthe saal life mein exciting changes aayenge. Travel opportunities milenge. Purane routine ko change karne ka sahi time. New skills seekhne ki umang rahegi.','Paanchwe saal deep introspection aur spiritual growth hogi. Meditation ya yoga se peace milegi. Hidden talents saamne aayenge. Important life decisions ke liye clarity milegi.'],
  3:['Naye naam ke saath pehla saal communication aur creative expression ka hoga. Writing, speaking, ya social media mein recognition milegi. Fun aur joy life mein badega.','Doosre saal strong foundation banaoge — finances, health, aur career mein stability. Ghar ya zameen khareedne ke liye acha saal. Disciplined efforts se bada reward milega.','Teesre saal major life changes aur new adventures aayenge. Job change, relocation, ya naya business start karne ka possibility. Exciting but unpredictable energy rahegi.','Chauthe saal family aur relationships par dhyan do. Ghar mein harmony badegi. Health ke liye special care karein. Dono aur seva se satisfaction milegi.','Paanchwe saal aatmik gyan aur mastery milegi. Ek important life chapter poora hoga. Agar koi bhi unfinished business hai toh yeh saal resolve karne ka sahi time hai.'],
  4:['Pehle saal mehnat aur discipline se strong career foundation banegi. Real estate ya long-term investments ke liye ideal time. Patience rakhein — slow but steady progress hogi.','Doosre saal exciting opportunities aur changes aayenge. Purane restrictions khatam honge. Travel ya new city mein shift karne ka possibility. Energy high rahegi.','Teesre saal love aur relationships mein khushhali aayegi. Marriage ya serious commitment possible. Ghar sunder banane ki ichha hogi. Creative pursuits mein success.','Chauthe saal introspection aur spiritual growth ka time. Meditation, study, aur self-improvement pe focus karo. Important insights milenge jo future guide karenge.','Paanchwe saal financial abundance aur career peak experience karoge. Business expansion ya promotion possible. Apne dreams achieve karne ka yeh golden period hai.'],
  5:['Naye naam ke saath pehla saal freedom aur change leke aata hai. Naye opportunities explore karo. Career mein exciting shift possible. Dynamic energy aur confidence badega.','Doosre saal home, family, aur love relationships pe focus hoga. Ghar banana ya expand karna possible. Relationships mein depth aur commitment aayegi. Nurturing energy.','Teesre saal wisdom aur spiritual depth milegi. Study, research, ya spiritual practices mein maan lagega. Alone time beneficial rahega. Important life truths samajh aayenge.','Chauthe saal material success aur power aapke paas aayegi. Career mein leadership role. Financial goals achieve hone ke zyada chances. Ambition ko channel karo correctly.','Paanchwe saal service aur giving se deep satisfaction milegi. Community work ya charity mein involvement. Relationships mein unconditional love. Ek meaningful chapter complete hoga.'],
  6:['Pehle saal love, family, aur home life flourish karenge. Romantic relationships deep honge. Ghar ko beautiful banane ki ichha. Dono dene aur lene mein balance aayega.','Doosre saal spiritual awakening aur self-discovery ka period. Inner wisdom strong hogi. Alone time valuable rahega. Hidden truths saamne aayenge. Trust your intuition.','Teesre saal career peak aur financial abundance. Business ya job mein major achievement. Material goals achieve honge. Power aur influence badega. Hard work pay off hoga.','Chauthe saal ek important life cycle complete hoga. Release karo jo kaam nahi karta. Forgiveness aur acceptance se peace milegi. Next chapter ke liye ready ho jao.','Paanchwe saal fresh energy aur new beginnings. Nayi identity ke saath aage badho. Leadership opportunities milenge. Jo peechhe choda uska reward ab milega.'],
  7:['Pehle saal deep spiritual insights aur intuitive wisdom milegi. Meditation powerful rahega. Research ya study mein interest badega. Inner clarity se better decisions loge.','Doosre saal financial goals achieve karne ka powerful time. Business mein expansion. Career mein recognition aur authority. Material world mein success clearly dikhegi.','Teesre saal compassion aur service through relationships. Meaningful connections banenge. Family bonds strong honge. Ek purana chapter beautifully close hoga.','Chauthe saal nayi shuruaat ke liye courageous kadam uthao. New projects, new city, ya new career path explore karo. Leadership naturally aayegi. Bold moves rewarding honge.','Paanchwe saal cooperation aur partnerships mein success. Business partner ya life partner ke saath deep harmony. Compromise aur balance se sab kuch possible hoga.'],
  8:['Pehle saal career peak aur financial abundance ka golden time hai. Jo bhi invest karoge — time, money, energy — multiplied return milega. Authority aur power badegi.','Doosre saal important life lessons aur spiritual completion. Purane patterns khatam karo. Wisdom milegi jo agle level ke liye prepare karti hai. Let go of baggage.','Teesre saal fresh energy ke saath naya chapter shuru karo. Independence aur leadership naturally aayegi. New ventures launch karne ka perfect time. Confidence high hoga.','Chauthe saal important relationships aur partnerships mein harmony. Business collaborations mein success. Love life mein depth. Balance aur cooperation ke through growth.','Paanchwe saal creativity aur self-expression peak par hogi. Communication skills se naam banta hai. Joyful energy aur social success. New creative projects launch karo.'],
  9:['Naye naam ke saath pehla saal ek mahatvapurn cycle ka aant aur naya adhyay ka aarambh hai. Service aur giving se satisfaction milegi. Old relationships resolve honge.','Doosre saal ek naya strong self emerge karega. Independence aur courage se aage badho. New projects aur ventures start karne ka sahi time. Purane doubts khatam honge.','Teesre saal partnership aur cooperation se growth milegi. Business partner ya life partner ke saath synergy powerful hogi. Communication skills peak par hongi.','Chauthe saal creativity aur joy life mein zyada aayegi. Creative projects mein recognition. Social connections vibrant honge. Express yourself freely — world sun raha hai.','Paanchwe saal stability aur solid foundation banana — finances, career, health mein. Disciplined efforts se ek lasting legacy build hogi. Systematic approach se big goals achieve hoge.'],
};

const LUCKY_MONTHS = [
  ['January','March','September'],
  ['February','June','October'],
  ['March','July','November'],
  ['April','August','December'],
  ['May','September','January'],
];

const FORECAST_ICONS  = ['🌱','🌿','🌳','🏆','🌟'];
const YEAR_LABELS     = ['First Year','Second Year','Third Year','Fourth Year','Fifth Year'];
// ── FIX 1: Updated total pages from 8 to 9
const TOTAL_PAGES     = 9;

// ── Utility ──────────────────────────────────────────────────
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const gradeColor    = g => ({'A+':'#059669',A:'#16a34a','B+':'#d97706',B:'#ea580c',C:'#dc2626'}[g] ?? '#d97706');
const gradeLabel    = g => ({'A+':'Exceptional — Elite Vibration',A:'Excellent — Very Strong Alignment','B+':'Good — Above Average Harmony',B:'Average — Moderate Alignment',C:'Weak — Correction Strongly Advised'}[g] ?? 'Under Analysis');
const strengthColor = s => ({VeryStrong:'#059669',Master:'#7c3aed',Strong:'#1d4ed8',Moderate:'#d97706',Weak:'#dc2626'}[s] ?? '#d97706');

const today       = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
const reportId    = `NC-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const currentYear = new Date().getFullYear();

// ── Compute chaldean number from name string ─────────────────
function calcChaldean(nameStr) {
  let sum = 0;
  for (const ch of nameStr.toUpperCase()) {
    if (ch === ' ') continue;
    sum += CHALDEAN_MAP[ch] || 0;
  }
  let root = sum;
  while (root > 9 && root !== 11 && root !== 22 && root !== 33) {
    root = String(root).split('').reduce((a,d) => a + parseInt(d), 0);
  }
  return { compound: sum, root };
}

// ── Letter boxes ─────────────────────────────────────────────
function letterBoxes(name, map, accent, bg) {
  return [...name.toUpperCase()].map(ch => {
    if (ch === ' ') return `<span style="display:inline-block;width:10px"></span>`;
    const val = map[ch];
    return `<span style="display:inline-flex;flex-direction:column;align-items:center;
      background:${bg};border:1.5px solid ${accent}33;border-radius:8px;
      padding:5px 7px;margin:2px;min-width:28px;box-shadow:0 1px 3px rgba(0,0,0,.05)">
      <b style="font-size:13px;color:${accent};font-family:'Playfair Display',Georgia,serif">${ch}</b>
      <span style="font-size:9px;color:${accent}99;margin-top:2px;font-weight:700">${val ?? '–'}</span>
    </span>`;
  }).join('');
}

// ── Compat bar ────────────────────────────────────────────────
function compatBar(label, value) {
  const pct     = Math.min(100, Math.max(0, value || 0));
  const color   = pct >= 80 ? '#16a34a' : pct >= 65 ? '#d97706' : '#dc2626';
  const bgColor = pct >= 80 ? '#dcfce7' : pct >= 65 ? '#fef3c7' : '#fee2e2';
  const verdict = pct >= 80 ? 'Excellent' : pct >= 65 ? 'Good' : pct >= 50 ? 'Average' : 'Weak';
  return `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
        <span style="font-size:11px;color:#374151;font-weight:500">${esc(label)}</span>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:9px;background:${bgColor};color:${color};border-radius:99px;
            padding:2px 8px;font-weight:700">${verdict}</span>
          <b style="font-size:13px;color:${color}">${pct}%</b>
        </div>
      </div>
      <div style="background:#f3f4f6;border-radius:99px;height:8px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,${color}cc,${color});border-radius:99px"></div>
      </div>
    </div>`;
}

// ── Section heading ───────────────────────────────────────────
function sectionHeading(icon, title, subtitle, accentColor = '#d97706') {
  return `
    <div style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:3px">
        <div style="width:28px;height:28px;border-radius:8px;background:${accentColor}18;
          display:flex;align-items:center;justify-content:center;font-size:14px">${icon}</div>
        <div class="serif" style="font-size:18px;font-weight:700;color:#111827">${esc(title)}</div>
      </div>
      <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;
        font-weight:600;padding-left:38px">${esc(subtitle)}</div>
    </div>`;
}

// ── FIX 2: pageHeader — now also accepts totalPages override ──
const pageHeader = (section, page, name, total = TOTAL_PAGES) => `
  <div style="display:flex;justify-content:space-between;align-items:center;
    border-bottom:2px solid #f3f4f6;padding-bottom:10px;margin-bottom:22px;flex-shrink:0">
    <div style="display:flex;align-items:center;gap:8px">
      <div style="width:3px;height:14px;background:linear-gradient(180deg,#d97706,#b45309);border-radius:2px"></div>
      <span style="font-size:9px;font-weight:800;color:#374151;letter-spacing:2px;text-transform:uppercase">${esc(section)}</span>
    </div>
    <div style="display:flex;align-items:center;gap:12px">
      <span style="font-size:9px;color:#d1d5db">${esc(name)}</span>
      <span style="font-size:8px;background:#f3f4f6;color:#9ca3af;border-radius:4px;padding:2px 7px;font-weight:600">Page ${page}/${total}</span>
    </div>
  </div>`;

// ── FIX 3: pageFooter — flex-shrink:0 so it never gets squeezed
const pageFooter = (page, total = TOTAL_PAGES) => `
  <div style="flex-shrink:0;padding-top:14px;border-top:1px solid #f3f4f6;
    display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:8px;color:#d1d5db">Numerology Name Correction · Premium Report</span>
    <span style="font-size:8px;color:#e5e7eb;font-family:monospace">${reportId}</span>
    <span style="font-size:8px;color:#d1d5db">Page ${page} of ${total}</span>
  </div>`;

// ── Insight card ─────────────────────────────────────────────
function insightCard(icon, label, text, gradient, borderColor, labelColor) {
  if (!text) return '';
  return `
    <div style="background:${gradient};border:1.5px solid ${borderColor};border-radius:12px;
      padding:16px 18px;margin-bottom:14px;page-break-inside:avoid">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span style="font-size:12px">${icon}</span>
        <span style="font-size:9px;font-weight:800;text-transform:uppercase;
          letter-spacing:1.5px;color:${labelColor}">${esc(label)}</span>
      </div>
      <div style="font-size:12px;color:#374151;line-height:1.8">${esc(text)}</div>
    </div>`;
}

// ── Suggestion cards ──────────────────────────────────────────
function suggestionCards(suggestions) {
  if (!suggestions?.length) {
    return `
      <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:2px solid #86efac;
        border-radius:16px;padding:32px;text-align:center">
        <div style="font-size:36px;margin-bottom:12px">✅</div>
        <p style="font-size:16px;font-weight:800;color:#15803d;margin:0 0 6px;
          font-family:'Playfair Display',Georgia,serif">Your Name is Already Optimal!</p>
        <p style="font-size:12px;color:#166534;margin:0;line-height:1.7">
          No corrections needed. Your name carries perfectly aligned vibrations with your date of birth.</p>
      </div>`;
  }
  return suggestions.slice(0, 5).map((s, idx) => {
    const sg  = s.compatScore >= 85 ? 'A+' : s.compatScore >= 75 ? 'A' : s.compatScore >= 65 ? 'B+' : 'B';
    const gc  = gradeColor(sg);
    const pow = s.isPowerful;
    const rank = ['🥇','🥈','🥉','4️⃣','5️⃣'][idx] || `${idx+1}.`;
    return `
      <div style="border:${pow ? '2px solid #d97706' : '1.5px solid #e5e7eb'};
        border-radius:14px;background:${pow ? 'linear-gradient(135deg,#fffbeb,#fef9ef)' : '#fff'};
        padding:18px 20px;margin-bottom:14px;page-break-inside:avoid;
        box-shadow:${pow ? '0 4px 16px rgba(217,119,6,.12)' : '0 1px 4px rgba(0,0,0,.04)'}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:18px">${rank}</span>
            <div>
              ${pow ? `<div style="font-size:8px;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;
                border-radius:99px;padding:2px 8px;font-weight:700;display:inline-block;margin-bottom:4px">
                ⭐ MOST POWERFUL VIBRATION</div>` : ''}
              <div class="serif" style="font-size:22px;font-weight:800;color:#111827;line-height:1">${esc(s.name)}</div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:10px;font-weight:800;color:#fff;background:${gc};
              border-radius:8px;padding:4px 12px;margin-bottom:4px;display:inline-block">${sg}</div>
            <div style="font-size:10px;color:${gc};font-weight:700">${s.compatScore ?? 0}% Match</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">
          ${[
            ['Chaldean',    `${s.chaldean?.compound ?? '–'} → ${s.chaldean?.root ?? '–'}`, s.chaldean?.meaning, '#b45309','#fffbeb','#fde68a'],
            ['Pythagorean', `${s.pythagorean?.compound ?? '–'} → ${s.pythagorean?.root ?? '–'}`, s.pythagorean?.meaning, '#1d4ed8','#eff6ff','#bfdbfe'],
            ['DOB Match',   `${s.dobCompat ?? 75}%`, s.dobCompat >= 80 ? 'Excellent' : s.dobCompat >= 65 ? 'Good' : 'Fair', s.dobCompat >= 80 ? '#16a34a' : s.dobCompat >= 65 ? '#d97706' : '#dc2626','#f9fafb','#f3f4f6'],
            ['Life Path',   `${s.lpCompat ?? 75}%`,  s.lpCompat >= 80 ? 'Excellent' : s.lpCompat >= 65 ? 'Good' : 'Fair',  s.lpCompat >= 80 ? '#16a34a' : s.lpCompat >= 65 ? '#d97706' : '#dc2626','#f9fafb','#f3f4f6'],
          ].map(([lbl,val,hint,col,bg,border]) => `
            <div style="background:${bg};border:1.5px solid ${border};border-radius:8px;padding:8px;text-align:center">
              <div style="font-size:7px;color:#9ca3af;font-weight:700;text-transform:uppercase;margin-bottom:3px;letter-spacing:.5px">${lbl}</div>
              <div style="font-size:13px;font-weight:800;color:${col};line-height:1.1">${esc(val)}</div>
              ${hint ? `<div style="font-size:8px;color:#9ca3af;margin-top:2px">${esc(String(hint).slice(0,24))}${String(hint).length > 24 ? '…' : ''}</div>` : ''}
            </div>`).join('')}
        </div>
        ${s.whyGood ? `<div style="background:#f0f9ff;border-left:3px solid #0ea5e9;border-radius:0 8px 8px 0;
          padding:10px 13px;margin-bottom:8px">
          <div style="font-size:8px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">💡 Why This Works</div>
          <div style="font-size:11px;color:#0c4a6e;line-height:1.65">${esc(s.whyGood)}</div>
        </div>` : ''}
        ${s.expectedBenefits ? `<div style="background:#f0fdf4;border-left:3px solid #16a34a;border-radius:0 8px 8px 0;padding:10px 13px">
          <div style="font-size:8px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">✨ Expected Benefits</div>
          <div style="font-size:11px;color:#14532d;line-height:1.65">${esc(s.expectedBenefits)}</div>
        </div>` : ''}
      </div>`;
  }).join('');
}

// ── FIX 4: Shared forecast page builder (used for both current & suggested name)
function buildForecastPage(pageNum, displayName, rootNum, accentBg, accentBorder, headerLabel, introText, aiForecastArr) {
  const normRoot  = rootNum > 9 ? (rootNum % 9 || 9) : rootNum;
  const themes    = FORECAST_THEMES[normRoot] || FORECAST_THEMES[5];
  const preds     = YEAR_PREDICTIONS[normRoot] || YEAR_PREDICTIONS[5];
  const useAI     = Array.isArray(aiForecastArr) && aiForecastArr.length >= 5;

  const years = [0,1,2,3,4].map(i => {
    if (useAI) {
      const a = aiForecastArr[i] || {};
      return { yearNum:currentYear+i, label:YEAR_LABELS[i], icon:FORECAST_ICONS[i],
        title:a.title||themes[i]?.title||`Year ${i+1}`, theme:a.theme||themes[i]?.theme||'',
        focus:a.focus||themes[i]?.focus||'', energy:a.energy||themes[i]?.energy||'🔄 Balanced',
        color:themes[i]?.color||'#d97706', prediction:a.prediction||preds[i]||'',
        luckyMonths:Array.isArray(a.luckyMonths)?a.luckyMonths:LUCKY_MONTHS[i]||[] };
    }
    return { yearNum:currentYear+i, label:YEAR_LABELS[i], icon:FORECAST_ICONS[i],
      title:themes[i]?.title||`Year ${i+1}`, theme:themes[i]?.theme||'',
      focus:themes[i]?.focus||'', energy:themes[i]?.energy||'🔄 Balanced',
      color:themes[i]?.color||'#d97706', prediction:preds[i]||'',
      luckyMonths:LUCKY_MONTHS[i]||[] };
  });

  const progressBar = (idx) => `
    <div style="background:#f3f4f6;border-radius:99px;height:4px;margin-top:6px;overflow:hidden">
      <div style="width:${(idx+1)*20}%;height:100%;
        background:linear-gradient(90deg,${years[idx].color}88,${years[idx].color});border-radius:99px"></div>
    </div>`;

  return `
    <div class="page">
      ${pageHeader(headerLabel, pageNum, displayName)}

      <!-- Title -->
      <div style="margin-bottom:14px;flex-shrink:0">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
          <div style="width:28px;height:28px;border-radius:8px;background:#7c3aed18;
            display:flex;align-items:center;justify-content:center;font-size:14px">🔭</div>
          <div class="serif" style="font-size:18px;font-weight:700;color:#111827">5-Year Life Forecast</div>
        </div>
        <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;
          font-weight:600;padding-left:38px">${esc(String(pageNum-1).padStart(2,'0'))} — Based on ${esc(displayName)} Vibration · ${currentYear}–${currentYear+4}</div>
      </div>

      <!-- Intro banner -->
      <div style="background:${accentBg};border:2px solid ${accentBorder};
        border-radius:14px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:flex-start;gap:14px;flex-shrink:0">
        <div style="font-size:24px;flex-shrink:0">🌟</div>
        <div style="font-size:11px;color:#4c1d95;line-height:1.7">${introText}</div>
      </div>

      <!-- 4 year cards in 2×2 grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;flex:1;min-height:0">
        ${years.slice(0,4).map((yr,i) => `
          <div style="border:1.5px solid ${yr.color}44;border-radius:14px;
            background:linear-gradient(135deg,${yr.color}08,${yr.color}03,#fff);
            padding:12px 14px;position:relative;overflow:hidden">
            <div style="position:absolute;top:8px;right:10px;background:${yr.color};color:#fff;
              border-radius:99px;font-size:7px;font-weight:800;padding:2px 8px">${yr.yearNum}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="font-size:18px">${yr.icon}</span>
              <div>
                <div style="font-size:7px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px">${yr.label}</div>
                <div class="serif" style="font-size:12px;font-weight:800;color:${yr.color};line-height:1.2;margin-top:1px">${esc(yr.title)}</div>
              </div>
            </div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:7px">
              <span style="font-size:7px;background:${yr.color}15;color:${yr.color};border:1px solid ${yr.color}33;border-radius:99px;padding:2px 7px;font-weight:700">🎯 ${esc(yr.focus)}</span>
              <span style="font-size:7px;background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;border-radius:99px;padding:2px 7px;font-weight:600">${esc(yr.energy)}</span>
            </div>
            <div style="font-size:9px;color:#374151;line-height:1.65;margin-bottom:7px">${esc(yr.prediction)}</div>
            <div style="border-top:1px solid ${yr.color}22;padding-top:6px">
              <div style="font-size:7px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px">🍀 Lucky Months</div>
              <div style="display:flex;gap:3px;flex-wrap:wrap">
                ${yr.luckyMonths.map(m => `<span style="font-size:7px;background:#fff;border:1px solid ${yr.color}33;color:${yr.color};border-radius:6px;padding:2px 6px;font-weight:600">${esc(m)}</span>`).join('')}
              </div>
            </div>
            ${progressBar(i)}
          </div>`).join('')}
      </div>

      <!-- Year 5 — full width highlight -->
      ${(() => {
        const yr = years[4];
        return `
          <div style="border:2px solid ${yr.color}66;border-radius:14px;
            background:linear-gradient(135deg,${yr.color}10,${yr.color}04,#fff);
            padding:14px 18px;position:relative;flex-shrink:0">
            <div style="position:absolute;top:0;left:0;right:0;height:3px;
              background:linear-gradient(90deg,transparent,${yr.color},transparent)"></div>
            <div style="display:flex;align-items:flex-start;gap:14px">
              <div style="flex-shrink:0;text-align:center">
                <span style="font-size:26px">${yr.icon}</span>
                <div style="background:${yr.color};color:#fff;border-radius:8px;font-size:8px;font-weight:800;padding:2px 8px;margin-top:3px">${yr.yearNum}</div>
              </div>
              <div style="flex:1">
                <div style="font-size:7px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1.5px">${yr.label} — The Culmination</div>
                <div class="serif" style="font-size:14px;font-weight:800;color:${yr.color};margin:3px 0 6px">⭐ ${esc(yr.title)}</div>
                <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:7px">
                  <span style="font-size:7px;background:${yr.color}15;color:${yr.color};border:1px solid ${yr.color}33;border-radius:99px;padding:2px 8px;font-weight:700">🎯 ${esc(yr.focus)}</span>
                  <span style="font-size:7px;background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;border-radius:99px;padding:2px 8px;font-weight:600">${esc(yr.energy)}</span>
                  <span style="font-size:7px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:99px;padding:2px 8px;font-weight:700">Theme: ${esc(yr.theme)}</span>
                </div>
                <div style="font-size:10px;color:#374151;line-height:1.7;margin-bottom:7px">${esc(yr.prediction)}</div>
                <div style="border-top:1px solid ${yr.color}22;padding-top:6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                  <div style="font-size:7px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.8px">🍀 Lucky Months:</div>
                  ${yr.luckyMonths.map(m => `<span style="font-size:7px;background:#fff;border:1px solid ${yr.color}44;color:${yr.color};border-radius:6px;padding:2px 8px;font-weight:600">${esc(m)}</span>`).join('')}
                </div>
              </div>
            </div>
            ${progressBar(4)}
          </div>`;
      })()}

      <!-- Disclaimer note -->
      <div style="background:#f9fafb;border-radius:10px;padding:8px 14px;border:1px solid #f3f4f6;margin-top:10px;flex-shrink:0">
        <div style="font-size:7.5px;color:#9ca3af;line-height:1.8;text-align:justify">
          <b style="color:#d1d5db">NOTE:</b> Yeh 5-year forecast <b>${esc(displayName)}</b> ke Chaldean Root Number <b>${rootNum}</b> ke vibrations par based hai.
          Yeh ek spiritual blueprint hai — aapki mehnat, decisions, aur attitude bhi utna hi important hai.
          · Numerology Name Correction · Premium Report · ${today}
        </div>
      </div>

      ${pageFooter(pageNum)}
    </div>`;
}

// ── PAGE 2: About Numerology ─────────────────────────────────
function buildAboutPage(name) {
  return `
    <div class="page">
      ${pageHeader('About This Report', 2, name)}

      <div style="background:linear-gradient(135deg,#0c0a1a,#1a1033,#0f0c20);border-radius:16px;
        padding:18px 22px;margin-bottom:16px;text-align:center;position:relative;overflow:hidden;flex-shrink:0">
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(217,119,6,.12),transparent 70%)"></div>
        <div style="position:relative;z-index:1">
          <div style="font-size:20px;margin-bottom:5px">🙏</div>
          <div style="font-size:13px;font-weight:700;color:#fbbf24;letter-spacing:3px;margin-bottom:3px">॥ श्री गणेशाय नमः ॥</div>
          <div style="font-size:9px;color:rgba(255,255,255,.5);font-style:italic;margin-bottom:8px">Shri Ganeshaya Namaha — We Bow to the Divine Lord Ganesha</div>
          <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(217,119,6,.4),transparent);margin-bottom:8px"></div>
          <div style="font-size:10px;color:rgba(255,255,255,.7);line-height:1.8;font-style:italic">
            "Your name is not merely a label — it is a living cosmic vibration, a sacred sound frequency
            that resonates with the infinite universe. When your name aligns harmoniously with your birth
            numbers and ruling planets, it becomes a powerful divine instrument attracting abundance,
            health, success, love, and spiritual fulfillment."
          </div>
        </div>
      </div>

      <div style="margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="width:26px;height:26px;border-radius:8px;background:#d97706;display:flex;align-items:center;justify-content:center;font-size:13px">🔢</div>
          <div class="serif" style="font-size:16px;font-weight:700;color:#111827">Numerology — Ancient Science of Name Vibration</div>
        </div>
        <div style="font-size:11px;color:#374151;line-height:1.8;margin-bottom:12px">
          Numerology is an ancient metaphysical science that studies the mystical relationship between
          <b>numbers, letters and vibrational energies</b> influencing human life. It is based on the
          universal belief that every sound, symbol and number carries a specific <b>cosmic frequency</b>,
          which affects an individual's personality, destiny, opportunities and life experiences.
          For thousands of years, civilizations such as the <b>Babylonians, Egyptians, Greeks, Chinese
          and Indians</b> have used numerology to understand and align their destinies.
        </div>
        <div style="font-size:9px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px">⭐ Importance of Numerology in Today's World</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
          ${[
            ['🧠','Self-Awareness & Personality',    'Understand your inherent traits, talents and behavioural tendencies.',       '#d97706','#fffbeb','#fde68a'],
            ['💼','Career & Financial Guidance',     'Numbers guide you toward your most aligned and fulfilling career path.',      '#16a34a','#f0fdf4','#86efac'],
            ['❤️','Relationship Compatibility',      'Vibrational harmony influences emotional bonding and long-term success.',     '#dc2626','#fef2f2','#fca5a5'],
            ['✍️','Name Correction & Branding',      'Correcting a name spelling can dramatically enhance wealth and recognition.', '#7c3aed','#faf5ff','#d8b4fe'],
            ['🕉️','Spiritual Alignment',             'A bridge between ancient cosmic wisdom and modern practical life.',           '#0ea5e9','#f0f9ff','#bae6fd'],
          ].map(([icon,title,desc,color,bg,border]) => `
            <div style="background:${bg};border:1.5px solid ${border};border-radius:10px;padding:10px 12px;display:flex;gap:9px;align-items:flex-start">
              <div style="width:24px;height:24px;border-radius:7px;background:${color}22;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0">${icon}</div>
              <div>
                <div style="font-size:9.5px;font-weight:800;color:${color};margin-bottom:2px">${title}</div>
                <div style="font-size:9px;color:#6b7280;line-height:1.5">${desc}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div style="width:100%;height:1.5px;background:linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6);margin:4px 0 14px;flex-shrink:0"></div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;flex:1">
        <div style="background:linear-gradient(135deg,#fffbeb,#fef9ef);border:2px solid #fde68a;border-radius:14px;padding:14px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div style="width:22px;height:22px;border-radius:6px;background:#d97706;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800">C</div>
            <div>
              <div class="serif" style="font-size:12px;font-weight:700;color:#92400e">🔱 Chaldean System</div>
              <div style="font-size:8px;color:#b45309">Ancient Babylonian · 4000 Years Old</div>
            </div>
          </div>
          <div style="font-size:9.5px;color:#78350f;line-height:1.65;margin-bottom:8px">
            The oldest numerological tradition from ancient Mesopotamia. Numbers represent <b>divine vibrations</b> rather than mere symbols.
          </div>
          <div style="font-size:8px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">Key Principles</div>
          ${['Based on sound vibration, not alphabetical order',
             'Letters 1–8 (9 is sacred — not assigned)',
             'Compound number carries karmic messages',
             'Most accurate for name correction & destiny',
             'Widely used in India for name & business naming',
            ].map(t => `<div style="display:flex;gap:5px;margin-bottom:3px;align-items:flex-start">
              <span style="color:#d97706;font-size:9px;flex-shrink:0;margin-top:1px">◆</span>
              <span style="font-size:8.5px;color:#78350f;line-height:1.45">${t}</span>
            </div>`).join('')}
        </div>
        <div style="background:linear-gradient(135deg,#eff6ff,#eef2ff);border:2px solid #bfdbfe;border-radius:14px;padding:14px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div style="width:22px;height:22px;border-radius:6px;background:#1d4ed8;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800">P</div>
            <div>
              <div class="serif" style="font-size:12px;font-weight:700;color:#1e3a8a">🔢 Pythagorean System</div>
              <div style="font-size:8px;color:#1d4ed8">Greek Mathematical · 570 BCE</div>
            </div>
          </div>
          <div style="font-size:9.5px;color:#1e3a8a;line-height:1.65;margin-bottom:8px">
            Developed by <b>Pythagoras</b> who believed numbers form the fundamental structure of the universe.
          </div>
          <div style="font-size:8px;font-weight:800;color:#1e3a8a;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">Key Principles</div>
          ${['Letters assigned 1–9 in sequential order',
             'Focuses on psychological traits & life path',
             'Emphasizes Expression & Destiny numbers',
             'Systematic, logical — widely used in West',
             'Ideal for personality & long-term planning',
            ].map(t => `<div style="display:flex;gap:5px;margin-bottom:3px;align-items:flex-start">
              <span style="color:#3b82f6;font-size:9px;flex-shrink:0;margin-top:1px">◆</span>
              <span style="font-size:8.5px;color:#1e3a8a;line-height:1.45">${t}</span>
            </div>`).join('')}
        </div>
      </div>

      <div style="background:linear-gradient(135deg,#f9fafb,#f3f4f6);border:1.5px solid #e5e7eb;
        border-radius:10px;padding:8px 14px;margin-top:10px;text-align:center;flex-shrink:0">
        <div style="font-size:10px;color:#374151;font-style:italic;line-height:1.7">
          <b>Together, these twin sacred systems</b> illuminate the complete cosmic portrait of your name's
          vibration — and reveal exactly how a divine correction can transform your destiny.
        </div>
      </div>

      ${pageFooter(2)}
    </div>`;
}

// ── HTML builder ─────────────────────────────────────────────
function buildHTML(data) {
  const {
    name = 'Unknown', dob = {}, chaldean = {}, pythagorean = {},
    compat = {}, assessment = {}, ai = {}, suggestions = [],
    isPowerfulChaldean = false, isPowerfulPythagorean = false,
  } = data;

  const grade   = assessment.grade || 'B';
  const gc      = gradeColor(grade);
  const gl      = gradeLabel(grade);
  const overall = compat.overall || 0;
  const oc      = overall >= 80 ? '#16a34a' : overall >= 65 ? '#d97706' : '#dc2626';
  const ocBg    = overall >= 80 ? '#dcfce7' : overall >= 65 ? '#fef3c7' : '#fee2e2';
  const chalSC  = strengthColor(chaldean.strength);
  const pythSC  = strengthColor(pythagorean.strength);
  const remNum  = parseInt(chaldean.root) || 5;
  const remedy  = REMEDIES[remNum] || REMEDIES[5];

  const chalMeaning = NUMBER_MEANINGS[parseInt(chaldean.root)]    || '';
  const pythMeaning = NUMBER_MEANINGS[parseInt(pythagorean.root)] || '';
  const lpMeaning   = NUMBER_MEANINGS[parseInt(dob.lifePath)]     || '';

  const sortedSuggestions = [...suggestions].sort((a,b) => (b.compatScore||0)-(a.compatScore||0));
  const topSuggestion     = sortedSuggestions[0] || null;

  // ── FIX 5: Compute current name root for page 8
  const currentNameCalc = calcChaldean(name);
  const currentRootNum  = parseInt(chaldean.root) || currentNameCalc.root || 5;

  // ── FIX 6: Suggested name root for page 9
  const sugRootNum = topSuggestion
    ? (parseInt(topSuggestion.chaldean?.root) || calcChaldean(topSuggestion.name).root || 5)
    : currentRootNum;

  return /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'DM Sans','Segoe UI',sans-serif;background:#fff;color:#1f2937;font-size:12px;line-height:1.5;}

  /* ── FIX: Each .page is exactly A4, flex column, no overflow ── */
  .page{
    width:210mm;
    height:297mm;
    padding:22px 32px 18px;
    display:flex;
    flex-direction:column;
    overflow:hidden;
    page-break-after:always;
    page-break-inside:avoid;
    position:relative;
  }
  /* Cover page overrides */
  .cover{
    padding:0;
    background:linear-gradient(150deg,#0c0a1a 0%,#1a1033 40%,#0f0c20 70%,#1a1430 100%);
  }

  .serif{font-family:'Playfair Display',Georgia,serif;}

  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .page{margin:0;box-shadow:none;}
  }
</style>
</head>
<body>

<!-- ══════════ PAGE 1: LUXURY COVER ══════════ -->
<div class="page cover">
  <div style="position:absolute;top:-80px;right:-80px;width:400px;height:400px;border-radius:50%;
    background:radial-gradient(circle,rgba(217,119,6,.18) 0%,transparent 70%);pointer-events:none"></div>
  <div style="position:absolute;bottom:-60px;left:-60px;width:300px;height:300px;border-radius:50%;
    background:radial-gradient(circle,rgba(139,92,246,.14) 0%,transparent 70%);pointer-events:none"></div>
  <div style="height:4px;background:linear-gradient(90deg,transparent,#d97706,#fbbf24,#d97706,transparent);position:relative;z-index:5;flex-shrink:0"></div>
  <div style="position:relative;z-index:4;flex:1;display:flex;flex-direction:column;padding:32px 40px 0;overflow:hidden">
    <div style="display:flex;justify-content:space-between;align-items:center;
      padding-bottom:16px;margin-bottom:26px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:18px">🔢</span>
        <div>
          <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.8);letter-spacing:3px;text-transform:uppercase">Numerology Name Correction</div>
          <div style="font-size:8px;color:rgba(255,255,255,.3);letter-spacing:2px;margin-top:1px">PREMIUM ANALYSIS REPORT</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:8px;color:rgba(255,255,255,.25);letter-spacing:1px">REPORT ID</div>
        <div style="font-size:9px;color:rgba(255,255,255,.4);font-family:monospace;font-weight:600">${reportId}</div>
      </div>
    </div>
    <div style="margin-bottom:28px;flex-shrink:0">
      <div style="font-size:9px;color:#fbbf24;letter-spacing:5px;text-transform:uppercase;font-weight:700;margin-bottom:12px">✦ &nbsp; Your Personal &nbsp; ✦</div>
      <div class="serif" style="font-size:58px;font-weight:900;color:#fff;line-height:.95;margin-bottom:8px;text-shadow:0 4px 30px rgba(0,0,0,.4)">
        Name<br/><span style="background:linear-gradient(135deg,#fbbf24,#f59e0b,#d97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Vibration</span><br/>
        <span style="font-size:32px;font-weight:400;font-style:italic;color:rgba(255,255,255,.4)">Report</span>
      </div>
      <div style="display:flex;gap:14px;align-items:center;margin-top:14px">
        <div style="height:1px;flex:1;background:linear-gradient(90deg,rgba(217,119,6,.6),transparent)"></div>
        <span style="font-size:9px;color:rgba(255,255,255,.25);letter-spacing:3px;text-transform:uppercase">Chaldean · Pythagorean · AI Analysis</span>
        <div style="height:1px;flex:1;background:linear-gradient(90deg,transparent,rgba(217,119,6,.6))"></div>
      </div>
    </div>
    <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
      border-radius:18px;padding:20px 24px;margin-bottom:14px;backdrop-filter:blur(10px);position:relative;overflow:hidden;flex-shrink:0">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,${gc},transparent)"></div>
      <div style="font-size:8px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:3px;margin-bottom:8px">✦ Prepared For</div>
      <div class="serif" style="font-size:32px;font-weight:700;color:#fff;margin-bottom:14px;text-shadow:0 2px 12px rgba(0,0,0,.3)">${esc(name)}</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
        ${[['Date of Birth',dob.raw||'N/A'],['Birth Number',dob.birthNumber??'—'],['Life Path',dob.lifePath??'—'],['Report Date',today]].map(([l,v]) => `
          <div>
            <div style="font-size:7px;color:rgba(255,255,255,.25);text-transform:uppercase;letter-spacing:2px;margin-bottom:3px">${l}</div>
            <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,.85)">${esc(String(v))}</div>
          </div>`).join('')}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;margin-bottom:14px;flex-shrink:0">
      <div style="width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,${gc},${gc}cc);
        display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 8px 24px ${gc}44;flex-shrink:0">
        <div class="serif" style="font-size:28px;font-weight:900;color:#fff;line-height:1">${esc(grade)}</div>
        <div style="font-size:7px;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:1px">Grade</div>
      </div>
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 16px">
        <div class="serif" style="font-size:14px;font-weight:700;color:#fff;margin-bottom:2px">${esc(gl)}</div>
        <div style="font-size:9px;color:rgba(255,255,255,.35)">Chaldean ${chaldean.root??'–'} · Pythagorean ${pythagorean.root??'–'} · Life Path ${dob.lifePath??'–'}</div>
      </div>
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 18px;text-align:center;flex-shrink:0">
        <div class="serif" style="font-size:26px;font-weight:900;color:${oc};line-height:1">${overall}%</div>
        <div style="font-size:8px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1px;margin-top:2px">Overall Match</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;flex-shrink:0">
      ${isPowerfulChaldean ? `<span style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);border-radius:99px;padding:4px 12px;font-size:9px;color:#fbbf24;font-weight:700">⭐ Powerful Chaldean Number</span>` : ''}
      ${isPowerfulPythagorean ? `<span style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);border-radius:99px;padding:4px 12px;font-size:9px;color:#fbbf24;font-weight:700">⭐ Powerful Pythagorean Number</span>` : ''}
      <span style="background:rgba(${ai.correctionNeeded ? '239,68,68' : '34,197,94'},.1);border:1px solid rgba(${ai.correctionNeeded ? '239,68,68' : '34,197,94'},.3);border-radius:99px;padding:4px 12px;font-size:9px;color:${ai.correctionNeeded ? '#f87171' : '#4ade80'};font-weight:700">
        ${ai.correctionNeeded ? '⚠️ Correction Recommended' : '✅ Name Well Aligned'}</span>
      <span style="background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.3);border-radius:99px;padding:4px 12px;font-size:9px;color:#a78bfa;font-weight:700">🤖 AI-Powered Analysis</span>
    </div>
    <div style="margin-top:auto;padding-top:14px;border-top:1px solid rgba(255,255,255,.06);flex-shrink:0">
      <div style="font-size:7px;color:rgba(255,255,255,.18);letter-spacing:4px;text-transform:uppercase;margin-bottom:10px">What's Inside This Report</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px">
        ${[['01','About Numerology & Sacred Systems'],['02','Chaldean & Pythagorean Analysis'],['03','DOB Compatibility & Scores'],
           ['04','AI Personality Profile'],['05','Challenges, Remedies & Career'],['06','Name Correction Suggestions'],
           ['07','Final Advice & Summary'],['08','Current Name — 5-Year Forecast'],['09','New Name — 5-Year Forecast'],
          ].map(([n,t]) => `
          <div style="display:flex;align-items:center;gap:8px;padding:5px 7px;border-radius:5px;background:rgba(255,255,255,.02)">
            <span style="font-size:8px;font-weight:800;color:#d97706;min-width:18px;font-family:monospace">${n}</span>
            <span style="font-size:9px;color:rgba(255,255,255,.32)">${t}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>
  <div style="position:relative;z-index:4;flex-shrink:0">
    <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);margin:0 40px"></div>
    <div style="display:flex;justify-content:space-between;padding:10px 40px">
      <span style="font-size:8px;color:rgba(255,255,255,.2)">NUMEROLOGY NAME CORRECTION · PREMIUM REPORT</span>
      <span style="font-size:8px;color:rgba(255,255,255,.2)">${today} · Page 1 of ${TOTAL_PAGES}</span>
    </div>
    <div style="height:3px;background:linear-gradient(90deg,transparent,#d97706,#fbbf24,#d97706,transparent)"></div>
  </div>
</div>


<!-- ══════════ PAGE 2: ABOUT NUMEROLOGY ══════════ -->
${buildAboutPage(name)}


<!-- ══════════ PAGE 3: NUMEROLOGY ANALYSIS ══════════ -->
<div class="page">
  ${pageHeader('Numerology Analysis', 3, name)}
  ${sectionHeading('🔮','Chaldean Numerology','02 — Ancient Babylonian System · Most Accurate for Destiny','#b45309')}
  <div style="background:linear-gradient(135deg,#fffbeb,#fef9ef,#fffdf5);border:1.5px solid #fde68a;
    border-radius:16px;padding:18px 22px;margin-bottom:16px;box-shadow:0 4px 16px rgba(217,119,6,.08);flex-shrink:0">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:18px">
        <div>
          <div style="font-size:8px;color:#92400e;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:3px">Compound</div>
          <div class="serif" style="font-size:52px;font-weight:900;line-height:1;color:${chalSC};text-shadow:0 2px 8px ${chalSC}33">${esc(String(chaldean.compound??'–'))}</div>
        </div>
        <div style="font-size:24px;color:#d1d5db;margin-top:8px">→</div>
        <div>
          <div style="font-size:8px;color:#92400e;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:3px">Root Number</div>
          <div class="serif" style="font-size:52px;font-weight:900;line-height:1;color:#374151">${esc(String(chaldean.root??'–'))}</div>
        </div>
        <div style="margin-left:8px;max-width:150px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${chalSC};margin-bottom:4px">${esc(chaldean.category??'')}</div>
          <div class="serif" style="font-size:12px;font-style:italic;color:#374151;line-height:1.5">"${esc(chaldean.meaning??'')}"</div>
        </div>
      </div>
      <div style="text-align:right">
        <span style="font-size:9px;font-weight:700;padding:5px 12px;border-radius:99px;background:${chalSC};color:#fff;text-transform:uppercase;letter-spacing:1px;display:inline-block;margin-bottom:6px">${esc(chaldean.strength??'')}</span>
        ${isPowerfulChaldean ? `<div style="font-size:8px;color:#d97706;font-weight:700">⭐ Powerful Number</div>` : ''}
      </div>
    </div>
    ${chalMeaning ? `<div style="background:#fff8ed;border-left:3px solid #d97706;border-radius:0 8px 8px 0;padding:9px 13px;margin-bottom:12px">
      <div style="font-size:8px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">📖 Number ${chaldean.root} Meaning</div>
      <div style="font-size:11px;color:#78350f;line-height:1.65;font-style:italic">${esc(chalMeaning)}</div>
    </div>` : ''}
    <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;margin-bottom:7px">Letter Vibration Map (Chaldean)</div>
    <div style="display:flex;flex-wrap:wrap;gap:2px;background:#fff;border-radius:10px;padding:8px;border:1px solid #fde68a">
      ${letterBoxes(name, CHALDEAN_MAP, '#b45309','#fffbeb')}
    </div>
  </div>

  <div style="width:100%;height:1.5px;background:linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6);margin:4px 0 16px;flex-shrink:0"></div>

  ${sectionHeading('📐','Pythagorean Numerology','03 — Greek Mathematical System · Best for Personality & Expression','#1d4ed8')}
  <div style="background:linear-gradient(135deg,#eff6ff,#eef2ff,#f5f7ff);border:1.5px solid #bfdbfe;
    border-radius:16px;padding:18px 22px;box-shadow:0 4px 16px rgba(59,130,246,.06);flex:1">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:18px">
        <div>
          <div style="font-size:8px;color:#1e3a8a;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:3px">Compound</div>
          <div class="serif" style="font-size:52px;font-weight:900;line-height:1;color:${pythSC};text-shadow:0 2px 8px ${pythSC}33">${esc(String(pythagorean.compound??'–'))}</div>
        </div>
        <div style="font-size:24px;color:#d1d5db;margin-top:8px">→</div>
        <div>
          <div style="font-size:8px;color:#1e3a8a;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:3px">Root Number</div>
          <div class="serif" style="font-size:52px;font-weight:900;line-height:1;color:#374151">${esc(String(pythagorean.root??'–'))}</div>
        </div>
        <div style="margin-left:8px;max-width:150px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${pythSC};margin-bottom:4px">${esc(pythagorean.category??'')}</div>
          <div class="serif" style="font-size:12px;font-style:italic;color:#374151;line-height:1.5">"${esc(pythagorean.meaning??'')}"</div>
        </div>
      </div>
      <div style="text-align:right">
        <span style="font-size:9px;font-weight:700;padding:5px 12px;border-radius:99px;background:${pythSC};color:#fff;text-transform:uppercase;letter-spacing:1px;display:inline-block">${esc(pythagorean.strength??'')}</span>
      </div>
    </div>
    ${pythMeaning ? `<div style="background:#eef2ff;border-left:3px solid #3b82f6;border-radius:0 8px 8px 0;padding:9px 13px;margin-bottom:12px">
      <div style="font-size:8px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">📖 Number ${pythagorean.root} Meaning</div>
      <div style="font-size:11px;color:#1e3a8a;line-height:1.65;font-style:italic">${esc(pythMeaning)}</div>
    </div>` : ''}
    <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;margin-bottom:7px">Letter Vibration Map (Pythagorean)</div>
    <div style="display:flex;flex-wrap:wrap;gap:2px;background:#fff;border-radius:10px;padding:8px;border:1px solid #bfdbfe">
      ${letterBoxes(name, PYTH_MAP, '#1d4ed8','#eff6ff')}
    </div>
  </div>
  ${pageFooter(3)}
</div>


<!-- ══════════ PAGE 4: COMPATIBILITY & PERSONALITY ══════════ -->
<div class="page">
  ${pageHeader('Compatibility & Personality', 4, name)}
  ${sectionHeading('🔢','DOB & Compatibility Analysis','04 — Birth Vibration vs Name Vibration Harmony','#7c3aed')}
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;flex-shrink:0">
    ${[
      ['Birth Number',  dob.birthNumber,  '#d97706',`Day of Birth`,        '#fffbeb','#fde68a'],
      ['Life Path',     dob.lifePath,     '#7c3aed', lpMeaning.split('—')[0]||'','#f5f3ff','#e9d5ff'],
      ['Overall Match', `${overall}%`,    oc,        assessment.label||'',   ocBg,     oc+'44'],
      ['Report Grade',  grade,            gc,        gl.split('—')[0],       '#f9fafb','#e5e7eb'],
    ].map(([l,v,c,h,bg,border]) => `
      <div style="background:${bg};border:2px solid ${border};border-radius:14px;padding:14px 10px;text-align:center">
        <div style="font-size:8px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">${l}</div>
        <div class="serif" style="font-size:28px;font-weight:900;color:${c};line-height:1">${esc(String(v??''))}</div>
        <div style="font-size:8px;color:#d1d5db;margin-top:5px;line-height:1.3">${esc(String(h).slice(0,30))}</div>
      </div>`).join('')}
  </div>
  ${lpMeaning ? `<div style="background:linear-gradient(135deg,#faf5ff,#f3e8ff);border:1.5px solid #d8b4fe;border-radius:12px;padding:12px 16px;margin-bottom:14px;flex-shrink:0">
    <div style="font-size:8px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px">✨ Life Path ${dob.lifePath} — Your Soul's Journey</div>
    <div style="font-size:11px;color:#4c1d95;line-height:1.7;font-style:italic">${esc(lpMeaning)}</div>
  </div>` : ''}
  <div style="background:#f9fafb;border:1.5px solid #f3f4f6;border-radius:14px;padding:16px 18px;margin-bottom:14px;flex-shrink:0">
    <div style="font-size:9px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">📊 Compatibility Breakdown</div>
    ${compatBar(`Chaldean Root (${chaldean.root}) × Birth No. (${dob.birthNumber})`,     compat.chaldeanVsBirth    || 0)}
    ${compatBar(`Chaldean Root (${chaldean.root}) × Life Path (${dob.lifePath})`,        compat.chaldeanVsLifePath || 0)}
    ${compatBar(`Pythagorean Root (${pythagorean.root}) × Birth No. (${dob.birthNumber})`, compat.pythagoreanVsBirth || 0)}
    ${compatBar(`Pythagorean Root (${pythagorean.root}) × Life Path (${dob.lifePath})`,    compat.pythagoreanVsLP   || 0)}
    <div style="background:${ocBg};border:1.5px solid ${oc}44;border-radius:10px;padding:11px 15px;display:flex;justify-content:space-between;align-items:center;margin-top:10px">
      <div>
        <div style="font-size:11px;font-weight:700;color:#374151">Final Compatibility Score</div>
        <div style="font-size:9px;color:#6b7280;margin-top:2px">${esc(assessment.label||'')}</div>
      </div>
      <div class="serif" style="font-size:30px;font-weight:900;color:${oc}">${overall}%</div>
    </div>
  </div>
  ${ai.correctionReason ? `<div style="background:${ai.correctionNeeded ? '#fef2f2' : '#f0fdf4'};
    border:1.5px solid ${ai.correctionNeeded ? '#fca5a5' : '#86efac'};border-radius:12px;padding:12px 16px;display:flex;gap:12px;align-items:flex-start;flex-shrink:0">
    <div style="font-size:20px;flex-shrink:0">${ai.correctionNeeded ? '⚠️' : '✅'}</div>
    <div>
      <div style="font-size:11px;font-weight:800;margin-bottom:4px;color:${ai.correctionNeeded ? '#dc2626' : '#16a34a'}">
        ${ai.correctionNeeded ? 'Name Correction Strongly Recommended' : 'Your Name is Well Aligned'}</div>
      <div style="font-size:11px;color:#374151;line-height:1.7">${esc(ai.correctionReason??'')}</div>
    </div>
  </div>` : ''}
  <div style="width:100%;height:1.5px;background:linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6);margin:14px 0;flex-shrink:0"></div>
  ${sectionHeading('🧠','AI Personality Profile','05 — Deep Psychological & Numerological Insight','#0ea5e9')}
  <div style="flex:1;overflow:hidden">
    ${insightCard('🧠','Personality Insight',   ai.personalityInsight,  'linear-gradient(135deg,#fffbeb,#fef9ef)','#fde68a','#92400e')}
    ${insightCard('🔍','Current Name Analysis', ai.currentNameAnalysis, 'linear-gradient(135deg,#f0f9ff,#e0f2fe)','#bae6fd','#0369a1')}
  </div>
  ${pageFooter(4)}
</div>


<!-- ══════════ PAGE 5: CHALLENGES, REMEDIES, CAREER ══════════ -->
<div class="page">
  ${pageHeader('Challenges, Remedies & Career', 5, name)}
  ${sectionHeading('⚡','Key Life Challenges','06 — Obstacles Written in Your Name Vibration','#dc2626')}
  ${insightCard('⚡','Challenges Indicated by Your Name', ai.challenges, 'linear-gradient(135deg,#fff7f0,#fef3ee)','#fed7aa','#c2410c')}
  <div style="background:linear-gradient(135deg,#fefce8,#fef9c3,#fefde8);border:2px solid #fde68a;
    border-radius:16px;padding:18px 20px;margin-bottom:16px;box-shadow:0 4px 20px rgba(234,179,8,.1);flex-shrink:0">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#fbbf24,#d97706);
          display:flex;align-items:center;justify-content:center;font-size:17px">${remedy.symbol}</div>
        <div>
          <div style="font-size:11px;font-weight:800;color:#92400e">Ruling Planet & Remedies</div>
          <div style="font-size:9px;color:#b45309">Based on Chaldean Root Number ${esc(String(chaldean.root??''))}</div>
        </div>
      </div>
      <div style="background:#fff;border:1.5px solid #fde68a;border-radius:8px;padding:5px 12px;font-size:12px;font-weight:700;color:#92400e">${esc(remedy.planet)}</div>
    </div>
    <div style="background:rgba(255,255,255,.5);border-radius:10px;overflow:hidden;border:1px solid rgba(0,0,0,.05)">
      ${[['🌟','Ruling Trait',remedy.trait,'#92400e'],['📅','Best Day',remedy.day,'#374151'],
         ['🎨','Power Colors',remedy.colors,'#374151'],['💎','Gemstone',remedy.gem,'#374151'],
         ['🕉️','Daily Mantra',remedy.mantra,'#7c3aed'],
        ].map(([icon,l,v,c],i,arr) => `
        <div style="display:flex;align-items:center;gap:12px;padding:9px 13px;
          ${i < arr.length-1 ? 'border-bottom:1px solid rgba(0,0,0,.05)' : ''}
          background:${i%2 ? 'rgba(255,255,255,.3)' : 'transparent'}">
          <span style="font-size:13px;width:18px;flex-shrink:0">${icon}</span>
          <div style="width:105px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;flex-shrink:0">${l}</div>
          <div style="font-size:11px;font-weight:600;color:${c};${l==='Daily Mantra' ? 'font-style:italic;letter-spacing:.3px' : ''}">${esc(v)}</div>
        </div>`).join('')}
    </div>
  </div>
  <div style="width:100%;height:1.5px;background:linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6);margin:4px 0 16px;flex-shrink:0"></div>
  ${sectionHeading('💼','Career & Lucky Details','07 — Auspicious Paths Aligned with Your Vibration','#16a34a')}
  ${ai.careerAreas?.length ? `<div style="margin-bottom:14px;flex-shrink:0">
    <div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#374151;margin-bottom:9px">💼 Best Career Areas for You</div>
    <div style="display:flex;flex-wrap:wrap;gap:7px">
      ${ai.careerAreas.map(c => `<span style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1.5px solid #bbf7d0;color:#166534;border-radius:99px;padding:5px 14px;font-size:10px;font-weight:700">✓ ${esc(c)}</span>`).join('')}
    </div>
  </div>` : ''}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;flex:1;min-height:0">
    ${ai.luckyNumbers?.length ? `<div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:12px;padding:13px 15px">
      <div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#92400e;margin-bottom:9px">🍀 Lucky Numbers</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${ai.luckyNumbers.map(n => `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#fbbf24,#f59e0b);border:2px solid #d97706;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;box-shadow:0 2px 8px rgba(217,119,6,.3)">${esc(String(n))}</div>`).join('')}
      </div>
    </div>` : ''}
    ${(ai.luckyColors?.length || ai.luckyDays?.length) ? `<div style="background:#f5f3ff;border:1.5px solid #e9d5ff;border-radius:12px;padding:13px 15px">
      ${ai.luckyColors?.length ? `<div style="margin-bottom:10px">
        <div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#7c3aed;margin-bottom:7px">🎨 Lucky Colors</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">
          ${ai.luckyColors.map(c => `<span style="background:#fff;border:1.5px solid #ddd6fe;color:#6d28d9;border-radius:99px;padding:3px 10px;font-size:9.5px;font-weight:600">${esc(c)}</span>`).join('')}
        </div>
      </div>` : ''}
      ${ai.luckyDays?.length ? `<div>
        <div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#1d4ed8;margin-bottom:7px">📅 Lucky Days</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">
          ${ai.luckyDays.map(d => `<span style="background:#eff6ff;border:1.5px solid #bfdbfe;color:#1e40af;border-radius:99px;padding:3px 10px;font-size:9.5px;font-weight:600">${esc(d)}</span>`).join('')}
        </div>
      </div>` : ''}
    </div>` : ''}
  </div>
  ${pageFooter(5)}
</div>


<!-- ══════════ PAGE 6: NAME SUGGESTIONS ══════════ -->
<div class="page">
  ${pageHeader('Name Correction Suggestions', 6, name)}
  ${sectionHeading('✍️','AI-Recommended Name Spellings','08 — Ranked by Numerological Compatibility Score','#d97706')}
  <div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:1.5px solid #fde68a;
    border-radius:12px;padding:11px 15px;margin-bottom:14px;display:flex;align-items:center;gap:12px;flex-shrink:0">
    <span style="font-size:18px">💡</span>
    <div style="font-size:11px;color:#78350f;line-height:1.6">
      These spellings are <b>specifically calculated</b> for <b>${esc(name)}</b>'s date of birth and life path.
      Each suggestion has been scored across Chaldean, Pythagorean, DOB match, and Life Path compatibility.
    </div>
  </div>
  <div style="flex:1;overflow:hidden">
    ${suggestionCards(suggestions)}
  </div>
  ${pageFooter(6)}
</div>


<!-- ══════════ PAGE 7: FINAL ADVICE & SUMMARY ══════════ -->
<div class="page">
  ${pageHeader('Final Advice & Summary', 7, name)}
  ${sectionHeading('🎯','Numerologist\'s Final Advice','09 — Personalised Guidance for Your Journey','#7c3aed')}
  ${ai.generalAdvice ? `<div style="position:relative;margin-bottom:16px;flex-shrink:0">
    <div style="position:absolute;top:-8px;left:16px;font-size:44px;color:#e9d5ff;font-family:'Playfair Display',serif;line-height:1;z-index:0">"</div>
    <div style="background:linear-gradient(135deg,#faf5ff,#f3e8ff);border:2px solid #d8b4fe;border-radius:16px;
      padding:20px 22px 16px;position:relative;z-index:1;box-shadow:0 8px 24px rgba(124,58,237,.08)">
      <div class="serif" style="font-size:12px;font-style:italic;color:#4c1d95;line-height:1.85;margin-bottom:12px">${esc(ai.generalAdvice)}</div>
      <div style="display:flex;align-items:center;gap:8px;border-top:1px solid #e9d5ff;padding-top:10px">
        <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#6d28d9);display:flex;align-items:center;justify-content:center;font-size:11px">🔢</div>
        <div style="font-size:9px;color:#7c3aed;font-weight:700">Personalized for ${esc(name)} · Generated ${today}</div>
      </div>
    </div>
  </div>` : ''}
  <div style="width:100%;height:1.5px;background:linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6);margin:4px 0 14px;flex-shrink:0"></div>
  <div class="serif" style="font-size:16px;font-weight:700;color:#111827;margin-bottom:12px;flex-shrink:0">📋 Complete Summary Table</div>
  <div style="border:1.5px solid #f3f4f6;border-radius:14px;overflow:hidden;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,.04);flex:1">
    ${[
      ['Full Name',           name,                                                                              '#111827'],
      ['Date of Birth',       dob.raw||'',                                                                       '#374151'],
      ['Birth Number',        dob.birthNumber??'',                                                               '#d97706'],
      ['Life Path Number',    `${dob.lifePath??''} ${lpMeaning ? '— '+lpMeaning.split('—')[0] : ''}`,          '#7c3aed'],
      ['Chaldean Numbers',    `${chaldean.compound??'–'} → ${chaldean.root??'–'} (${chaldean.strength??''})`,   chalSC],
      ['Pythagorean Numbers', `${pythagorean.compound??'–'} → ${pythagorean.root??'–'} (${pythagorean.strength??''})`, pythSC],
      ['Compatibility Score', `${overall}% — ${assessment.label||''}`,                                          oc],
      ['Report Grade',        `${grade} — ${gl}`,                                                               gc],
      ['Correction Needed',   ai.correctionNeeded ? '⚠️ Yes — Please use suggested spellings' : '✅ No — Name is already optimal', ai.correctionNeeded ? '#dc2626' : '#16a34a'],
      ['Top Suggested Name',  topSuggestion ? `${topSuggestion.name} (${topSuggestion.compatScore}% Match)` : 'N/A', '#d97706'],
      ['Best Career Areas',   (ai.careerAreas||[]).join(', '),                                                   '#374151'],
      ['Lucky Numbers',       (ai.luckyNumbers||[]).join(', '),                                                  '#d97706'],
      ['Lucky Colors',        (ai.luckyColors||[]).join(', '),                                                   '#374151'],
      ['Lucky Days',          (ai.luckyDays||[]).join(', '),                                                     '#374151'],
      ['Ruling Planet',       remedy.planet,                                                                     '#92400e'],
      ['Gemstone',            remedy.gem,                                                                        '#6d28d9'],
      ['Mantra',              remedy.mantra,                                                                     '#7c3aed'],
      ['Forecasts',           `Page 8 (Current) · Page 9 (${topSuggestion?.name||'Suggested'})`,               '#059669'],
      ['Report Generated',    today,                                                                             '#6b7280'],
      ['Report ID',           reportId,                                                                          '#9ca3af'],
    ].map(([l,v],i) => `
      <div style="display:flex;align-items:center;background:${i%2===0 ? '#f9fafb' : '#fff'};border-bottom:1px solid #f3f4f6">
        <div style="width:4px;align-self:stretch;background:${i%2===0 ? '#f3f4f6' : '#fff'}"></div>
        <div style="width:155px;padding:7px 11px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;flex-shrink:0;border-right:1px solid #f3f4f6">${l}</div>
        <div style="padding:7px 13px;font-size:11px;font-weight:600;color:#111827;flex:1;line-height:1.4">${esc(String(v??''))}</div>
      </div>`).join('')}
  </div>
  <div style="background:#f9fafb;border-radius:10px;padding:10px 14px;border:1px solid #f3f4f6;flex-shrink:0">
    <div style="font-size:7.5px;color:#9ca3af;line-height:1.8;text-align:justify">
      <b style="color:#d1d5db">DISCLAIMER:</b> This report applies traditional Chaldean and Pythagorean numerology systems with AI-assisted pattern analysis.
      It is intended for personal guidance, self-reflection, and spiritual insight only. For significant life decisions, consult a qualified numerologist.
      Numerology Name Correction · Premium Report · ${today}
    </div>
  </div>
  ${pageFooter(7)}
</div>


<!-- ══════════ PAGE 8: CURRENT NAME — 5-YEAR FORECAST (NEW) ══════════ -->
${buildForecastPage(
  8,
  name,
  currentRootNum,
  'linear-gradient(135deg,#fff7ed,#ffedd5,#fff7ed)',
  '#fed7aa',
  'Current Name Forecast',
  `<b>Aapka current naam "${esc(name)}"</b> ke Chaldean Root Number <b>${currentRootNum}</b> ke vibrations ke basis par yeh forecast hai. Agar naam nahi badlte, toh agle 5 saalon mein kya expect kar sakte hain — dekhein is comparison se correction ka mahatva!`,
  null  // no AI override for current name
)}


<!-- ══════════ PAGE 9: SUGGESTED NAME — 5-YEAR FORECAST ══════════ -->
${topSuggestion ? buildForecastPage(
  9,
  topSuggestion.name,
  sugRootNum,
  'linear-gradient(135deg,#faf5ff,#f3e8ff,#fdf4ff)',
  '#d8b4fe',
  'New Name Forecast',
  `Agar aap <b style="background:#e9d5ff;border-radius:4px;padding:1px 8px">${esc(topSuggestion.name)}</b> naam rakh lete hain toh agli 5 saalon mein kya hoga? Chaldean Root Number <b>${sugRootNum}</b> ke vibrations par based yeh powerful forecast aapka naya destiny dikhata hai!`,
  data.ai?.fiveYearForecast
) : `<div class="page">
  ${pageHeader('New Name — 5-Year Forecast', 9, name)}
  <div style="flex:1;display:flex;align-items:center;justify-content:center">
    <div style="text-align:center">
      <div style="font-size:48px;margin-bottom:16px">✅</div>
      <div class="serif" style="font-size:20px;font-weight:700;color:#15803d;margin-bottom:8px">Your Name is Already Optimal!</div>
      <div style="font-size:12px;color:#166534;line-height:1.7">No correction needed. Your current name already carries perfectly aligned vibrations.</div>
    </div>
  </div>
  ${pageFooter(9)}
</div>`}

</body></html>`;
}

// ── Generate PDF ─────────────────────────────────────────────
export async function generatePDF(resultData) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(buildHTML(resultData), { waitUntil:'networkidle0', timeout:30000 });
    await new Promise(r => setTimeout(r, 1500));
    return await page.pdf({
      format:'A4',
      printBackground:true,
      margin:{top:'0',right:'0',bottom:'0',left:'0'},
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
}