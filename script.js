'use strict';
// ═══════════════════════════════════════
//  BİLGİ KAYNAĞIM — script.js v4.2
// ═══════════════════════════════════════

// ── STATE ──────────────────────────────
const S = {
  user: null, hasGroup: false, grpData: null,
  currentNote: null, prevView: 'vHome',
  activeFilters: {}, filterOpen: false,
  theme: 'theme-dark', grpTab: 'chat',
  sbOpen: false, ddOpen: false, updOpen: false,
  wzStep: 0, wzSel: {}, wzSearchTerm: '',
  curExamGrp: null, cdTab: 'custom',
  grpCatFilter: 'all', grpSearch: '',
  grpAdminCounter: 1,
  twStep: 0, twSel: {}
};

const DEFAULT_USER = () => ({
  id:'USR-'+Math.floor(Math.random()*9e4+1e4),
  name:'Ziyaretçi', xp:0, level:1, comments:0,
  isLoggedIn:false, provider:null, lastNameChange:null,
  favorites:[], history:[], myNotes:[], countdowns:[],
  calendarEntries:[], recentViews:[], isAdmin:false,
  activities:[], todayAnswers:{}
});

const UPD_KEY = 'bk_upd_v42';
const UPD_ITEMS = [
  {t:'new',d:'Giriş ve uygulama sayfaları tamamen ayrıldı.'},
  {t:'new',d:'Çalışma takvimi — günlük kayıt, saat, soru ve verim takibi.'},
  {t:'new',d:'Sol menüde lise/ortaokul sınıf bazlı açılır alt menüler.'},
  {t:'new',d:'Üniversite Notları bölümü çok yakında geliyor.'},
  {t:'new',d:'"Bugün Ne Çalışayım?" artık Profilim içinde ve arama destekliyor.'},
  {t:'new',d:'Ad değiştirme için site uyumlu modal açılıyor (tarayıcı pop-up\'ı yok).'},
  {t:'new',d:'Grup oluşturma ve gruba katılma akışı düzeltildi.'},
  {t:'new',d:'Mesaj kısıtlaması için kullanıcı bilgilendirmesi eklendi.'},
  {t:'imp',d:'Filtreleme tamamen yeniden yazıldı; çoklu seçim aktif.'},
  {t:'imp',d:'Profil modalı hizalaması ve çakışma hataları giderildi.'},
  {t:'imp',d:'Floating kartlar mouse hareketine göre paralaks yapıyor.'},
  {t:'imp',d:'Takvim boşken büyük ekle butonu ortada, dolunca sağ üste geçiyor.'},
  {t:'fix',d:'Üye at butonu düzeltildi.'},
  {t:'fix',d:'Beyaz temada kontrast hataları giderildi.'},
];

const MOTIVES = [
  'Bugün attığın her adım yarın seni öne taşır.',
  'Sınav takvimi beklemiyor — sen de bekleme.',
  'Başarının sırrı: Her gün, biraz daha.',
  'Hedefin büyük mü? Adımların küçük ama düzenli olsun.',
  'Şu an çalışmak, gelecekteki seni mutlu edecek.',
  'Zor sorular seni dener; doğru sorular seni yetiştirir.',
  'Her doğru çözdüğün soru seni biraz daha güçlendirir.',
  'Rekabeti değil, gelişimini takip et.',
  'Motivasyon başlatır, alışkanlık devam ettirir.',
  'Bugün yorgunsan bile 15 dakika başlamak yeterli.',
];
let motiveIdx = 0, motiveTimer = null;

const CATS = [
  'YKS Matematik','YKS Türkçe','YKS Fizik','YKS Kimya','YKS Biyoloji',
  'YKS Tarih','YKS Coğrafya','YKS Felsefe','YKS YDT',
  'KPSS Genel Yetenek','KPSS Genel Kültür','KPSS Eğitim Bilimleri','KPSS ÖABT',
  'ALES Sayısal','ALES Sözel','DGS Matematik','YDS İngilizce','YDS Almanca',
  'YÖKDİL Sağlık','YÖKDİL Sosyal','TUS Temel Bilimler','TUS Klinik Bilimler',
  'DUS Diş Hekimliği','Hakimlik Adli Yargı','MSÜ Sayısal','EKPSS','YÖS',
  '12. Sınıf Matematik','12. Sınıf Fizik','12. Sınıf Kimya','12. Sınıf Biyoloji',
  '12. Sınıf Edebiyat','12. Sınıf İnkılap','12. Sınıf İngilizce','12. Sınıf Din Kültürü',
  '11. Sınıf Matematik','11. Sınıf Fizik','11. Sınıf Kimya','11. Sınıf Biyoloji',
  '11. Sınıf Edebiyat','11. Sınıf Tarih','11. Sınıf Coğrafya','11. Sınıf İngilizce',
  '10. Sınıf Matematik','10. Sınıf Fizik','10. Sınıf Kimya','10. Sınıf Biyoloji',
  '10. Sınıf Edebiyat','10. Sınıf Tarih','10. Sınıf Coğrafya',
  '9. Sınıf Matematik','9. Sınıf Fizik','9. Sınıf Kimya','9. Sınıf Biyoloji',
  '9. Sınıf Edebiyat','9. Sınıf Tarih',
  '8. Sınıf Türkçe','8. Sınıf Matematik','8. Sınıf Fen Bilimleri','8. Sınıf İnkılap','8. Sınıf İngilizce',
  '7. Sınıf Matematik','7. Sınıf Türkçe','6. Sınıf Matematik','5. Sınıf Türkçe','5. Sınıf Matematik'
];

const EXAM_GROUPS = {
  'YKS':['YKS Matematik','YKS Türkçe','YKS Fizik','YKS Kimya','YKS Biyoloji','YKS Tarih','YKS Coğrafya','YKS Felsefe','YKS YDT'],
  'KPSS':['KPSS Genel Yetenek','KPSS Genel Kültür','KPSS Eğitim Bilimleri','KPSS ÖABT'],
  'DİĞER':['ALES Sayısal','ALES Sözel','DGS Matematik','YDS İngilizce','YDS Almanca','YÖKDİL Sağlık','TUS Temel Bilimler','TUS Klinik Bilimler','DUS Diş Hekimliği','Hakimlik Adli Yargı','MSÜ Sayısal','EKPSS','YÖS'],
  'LİSE':['12. Sınıf Matematik','12. Sınıf Fizik','12. Sınıf Kimya','12. Sınıf Biyoloji','12. Sınıf Edebiyat','11. Sınıf Matematik','10. Sınıf Matematik','9. Sınıf Matematik'],
  'ORTAOKUL':['8. Sınıf Türkçe','8. Sınıf Matematik','8. Sınıf Fen Bilimleri','7. Sınıf Matematik','6. Sınıf Matematik','5. Sınıf Türkçe']
};

const PRESET_EXAMS = [
  {n:'YKS (TYT-AYT)',d:86,icon:'🎓'},{n:'KPSS Lisans',d:124,icon:'🏛️'},
  {n:'ALES',d:52,icon:'🧠'},{n:'DGS',d:97,icon:'🔄'},{n:'LGS',d:63,icon:'🏫'},
  {n:'YDS',d:38,icon:'🌍'},{n:'YÖKDİL',d:44,icon:'📖'},{n:'TUS',d:41,icon:'⚕️'},
  {n:'DUS',d:55,icon:'🦷'},{n:'Hakimlik',d:110,icon:'⚖️'},{n:'MSÜ',d:79,icon:'🛡️'},{n:'EKPSS',d:67,icon:'♿'},
];

const NOTE_DESC = [
  'Bu konunun en önemli formülleri ve kavramları:\n\n• Temel tanımlar kapsamlı şekilde açıklanmıştır.\n• Örnek sorular adım adım çözülmüştür.\n• Sınav odaklı pratik ipuçları eklenmiştir.\n\nBu konu her yıl yaklaşık 3–5 soru çıkarmaktadır.',
  'Çalışma notu:\n\nKapsamlı bir özet hazırlanmıştır. Konuyu anlamak için önce teorik kısmı okuyun, ardından pratik soruları çözün.\n\nİpucu: Zor bulduğunuz yerleri işaretleyin ve bir gün sonra tekrar edin.',
  'Özet notlar:\n\nBu ders için en önemli konular listelenmiştir. Her başlık ayrı ayrı çalışılmalı ve kombine sorularla test edilmelidir.\n\nBaşarılar! 🎯',
];

// ── DB ───────────────────────────────
const DB = {};
CATS.forEach(c=>{DB[c]=[];});
DB['__featured']=[]; DB['__suggestions']=[];

function makeNote(i,cat){
  const likes=Math.floor(Math.random()*180);
  return{id:(cat+i).replace(/[\s\.\/]/g,'_'),t:cat+' — Özet Not '+i,
    desc:NOTE_DESC[i%NOTE_DESC.length],u:'Kullanıcı'+String(i).padStart(3,'0'),
    lvl:Math.max(1,Math.floor(likes/12)+1),likes,recommends:Math.floor(likes*.78),
    unRec:Math.floor(likes*.09),reads:Math.floor(Math.random()*400),
    downloads:Math.floor(Math.random()*250),createdAt:Date.now()-Math.floor(Math.random()*2e10),
    comments:[],hasPdf:Math.random()>.45,trending:Math.random()>.6,_cat:cat};
}
function getNotes(cat){if(!DB[cat]||!DB[cat].length)DB[cat]=Array.from({length:40},(_,i)=>makeNote(i+1,cat));return DB[cat];}
function getFeatured(){if(!DB['__featured'].length){CATS.slice(0,12).forEach(c=>DB['__featured'].push(...getNotes(c).slice(0,8)));DB['__featured'].sort((a,b)=>b.likes-a.likes);}return DB['__featured'];}
for(let i=1;i<=16;i++) DB['__suggestions'].push({id:'sug'+i,u:'Rehber'+i,t:['Her gün düzenli 45 dakika çalışmak uzun seanslardan daha etkilidir.','Notlarınızı yazdıktan sonra sesli tekrar yapın.','Zor konuları sabah çalışın.','Çözdüğün soruları işaretle, yalnızca hataları tekrar çalış.','Pomodoro: 25 dakika çalış, 5 dakika mola.','Grup çalışması motivasyonu artırır.','Uyku düzeni performansı doğrudan etkiler.','Her konudan en az bir deneme çöz.'][i%8],likes:Math.floor(Math.random()*120),dislikes:Math.floor(Math.random()*8)});

// ── FILTER CONFIG ────────────────────
const FILTER_GROUPS = [
  {id:'sort',lbl:'SIRALAMA',multi:false,opts:[{id:'likes',lbl:'❤️ En Çok Beğenilen'},{id:'rec',lbl:'👍 En Çok Önerilen'},{id:'reads',lbl:'📖 En Çok Okunan'},{id:'dl',lbl:'📥 En Çok İndirilen'},{id:'new',lbl:'🆕 En Yeni'},{id:'old',lbl:'🕰️ En Eski'},{id:'az',lbl:'🔤 A → Z'},{id:'za',lbl:'🔤 Z → A'}]},
  {id:'level',lbl:'YAZAR SEVİYESİ',multi:false,opts:[{id:'any',lbl:'🌟 Tümü'},{id:'5',lbl:'🔥 Seviye 5+'},{id:'10',lbl:'💎 Seviye 10+'},{id:'15',lbl:'👑 Seviye 15+'}]},
  {id:'content',lbl:'İÇERİK',multi:true,opts:[{id:'trending',lbl:'📈 Trend'},{id:'pdf',lbl:'📄 PDF Mevcut'},{id:'commented',lbl:'💬 Yorumlu'}]},
];
const REC_OPTS={up:['Konuyu çok iyi özetlemiş','Formüller net açıklanmış','Sınav odaklı içerik','Özgün ve faydalı'],down:['Eksik konu anlatımı','Yanlış bilgi içeriyor','Okunması zor','Konu dışı içerik']};

// grup kategorisine göre hızlı mesajlar
const QUICK_MSGS_MAP = {
  'default':['Herkese iyi çalışmalar! 📚','Bu konuyu anlayan var mı?','Bugün çalışma planım hazır.','Deneme sonuçlarınız nasıl?','Birlikte çalışma seansı düzenleyelim mi?','Kaynak paylaşabilir misiniz?'],
  'YKS':['YKS Matematik için yardım?','TYT Türkçe notları var mı?','AYT Fizik formülleri?','YKS tarih özetleri?','Deneme sınavı çözelim mi?','Net ortalamanız kaç?'],
  'KPSS':['KPSS GY GK notu var mı?','Eğitim bilimleri zor mu?','ÖABT için kaynak?','Çıkmış sorular var mı?','Genel kültür notları?','Hangi kaynaktan çalışıyorsunuz?'],
  'LGS':['8. sınıf matematik yardım?','LGS Fen Bilimleri notu var mı?','İnkılap özeti var mı?','Türkçe paragraf çözümleri?','Deneme puanlarınız kaç?','8. sınıf İngilizce?'],
  'Diğer':['ALES notları var mı?','YDS İngilizce kaynak?','TUS için önerilen kaynaklar?','Çalışma programı paylaşır mısınız?','Herkese başarılar! 🎯','Sınav tarihleri hakkında bilgi?'],
};

const DUMMY_GROUPS=[
  {id:1,n:'YKS Çalışma Grubu',desc:'TYT ve AYT için ortak çalışma platformu, günlük soru çözümü.',m:34,cat:'YKS'},
  {id:2,n:'KPSS Hazırlık',desc:'Genel Kültür, Eğitim Bilimleri ve ÖABT hazırlık grubu.',m:22,cat:'KPSS'},
  {id:3,n:'LGS 8. Sınıf',desc:'8. Sınıf öğrencileri için LGS odaklı çalışma grubu.',m:41,cat:'LGS'},
  {id:4,n:'ALES Sayısal',desc:'ALES sayısal bölümü günlük soru çözüm ve tartışma grubu.',m:18,cat:'Diğer'},
  {id:5,n:'YDS İngilizce',desc:'YDS ve YÖKDİL sınavlarına kapsamlı hazırlık grubu.',m:27,cat:'Diğer'},
  {id:6,n:'TUS Hazırlık',desc:'Temel ve klinik bilimler çalışma ve paylaşım grubu.',m:15,cat:'Diğer'},
];
const DUMMY_MSGS=[
  {u:'Kullanıcı042',txt:'Herkese günaydın! Bugün çalışma planım hazır.'},
  {u:'Kullanıcı017',txt:'Dün 3 deneme çözdüm, oldukça verimli geçti.'},
  {u:'Kullanıcı098',txt:'Matematik formülleri notunu paylaşabilir misiniz?'},
  {u:'Kullanıcı031',txt:'Türkçe paragraf konusunda çok iyi bir kaynak buldum.'},
  {u:'Kullanıcı055',txt:'Bu haftaki denemeye hazır mısınız?'},
  {u:'Kullanıcı072',txt:'Herkes iyi çalışmalar! 💪'},
  {u:'Kullanıcı019',txt:'Eğitim bilimleri özeti çok işime yaradı.'},
  {u:'Kullanıcı083',txt:'Pomodoro tekniği gerçekten işe yarıyor.'},
  {u:'Kullanıcı044',txt:'Hangi konudan en çok zorlandınız?'},
  {u:'Kullanıcı061',txt:'Bugün 120 soru çözdüm, verimli geçti.'},
];

// ── CANVAS ───────────────────────────
let particles=[],rafId=null;
function startCanvas(){
  const c=g('themeCanvas');if(!c)return;
  c.width=innerWidth;c.height=innerHeight;
  const ctx=c.getContext('2d');
  particles=Array.from({length:140},()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:.4+Math.random()*1.5,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,a:.03+Math.random()*.09,p:Math.random()*Math.PI*2}));
  const draw=()=>{ctx.clearRect(0,0,c.width,c.height);particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.p+=.011;if(p.x<0)p.x=c.width;if(p.x>c.width)p.x=0;if(p.y<0)p.y=c.height;if(p.y>c.height)p.y=0;const a=p.a*(.7+.3*Math.sin(p.p));ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(124,168,248,'+a+')';ctx.fill();});rafId=requestAnimationFrame(draw);};
  draw();
}
function stopCanvas(){if(rafId){cancelAnimationFrame(rafId);rafId=null;}const c=g('themeCanvas');if(c)c.getContext('2d').clearRect(0,0,c.width,c.height);}
function resizeCanvas(){const c=g('themeCanvas');if(c){c.width=innerWidth;c.height=innerHeight;}}

// ── THEME ────────────────────────────
function setTheme(t,skipSave){
  const body=document.body;
  body.className=body.className.split(' ').filter(c=>!c.startsWith('theme-')).join(' ');
  body.classList.add(t);S.theme=t;
  if(!skipSave)try{localStorage.setItem('bk_theme',t);}catch(e){}
  stopCanvas();
  if(t==='theme-dark'){body.setAttribute('data-canvas','1');startCanvas();}
  else body.removeAttribute('data-canvas');
}

// ── PARALLAX / MOUSE on landing cards ──
let lastSY=0,scrollVel=0,pRaf=null;
function initParallax(){
  const lb=g('landBody');if(!lb)return;
  lb.addEventListener('scroll',()=>{scrollVel=lb.scrollTop-lastSY;lastSY=lb.scrollTop;if(!pRaf)pRaf=requestAnimationFrame(applyScrollParallax);},{passive:true});
}
function applyScrollParallax(){
  pRaf=null;
  const cards=document.querySelectorAll('.fc');
  const off=Math.max(-45,Math.min(45,-scrollVel*3));
  cards.forEach((c,i)=>{const dir=i%2===0?1:-1;c.style.transform='translateY('+(off*dir*.8)+'px)';});
  setTimeout(()=>cards.forEach(c=>{c.style.transform='';}),700);
}

// Mouse parallax on float scene
function initMouseParallax(){
  const scene=g('floatScene');if(!scene)return;
  const lp=g('landingPage');if(!lp)return;
  lp.addEventListener('mousemove',e=>{
    const rect=scene.getBoundingClientRect();
    const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    const dx=(e.clientX-cx)/cx,dy=(e.clientY-cy)/cy;
    document.querySelectorAll('.fc').forEach((c,i)=>{
      const depth=.6+(i%3)*.2;
      c.style.transform='translate('+(dx*18*depth)+'px,'+(dy*12*depth)+'px)';
    });
  },{passive:true});
  lp.addEventListener('mouseleave',()=>{document.querySelectorAll('.fc').forEach(c=>{c.style.transform='';});});
}

function buildFloatingScene(){
  const sc=g('floatScene');if(!sc)return;
  const data=[
    {top:'4%',left:'8%',du:'9s',de:'0s',html:'📐 Türev ve İntegral<br><small style="opacity:.6">YKS Matematik</small>'},
    {top:'28%',left:'52%',du:'7s',de:'1.2s',html:'📖 Osmanlı Tarihi<br><small style="opacity:.6">YKS Tarih</small>'},
    {top:'58%',left:'4%',du:'11s',de:'.5s',html:'⚗️ Organik Kimya<br><small style="opacity:.6">YKS Kimya</small>'},
    {top:'68%',left:'48%',du:'8s',de:'2s',html:'🧬 Hücre Bölünmesi<br><small style="opacity:.6">YKS Biyoloji</small>'},
    {top:'13%',left:'58%',du:'10s',de:'.8s',html:'🔢 KPSS Matematik<br><small style="opacity:.6">KPSS Genel Yetenek</small>'},
    {top:'42%',left:'18%',du:'12s',de:'1.8s',html:'✍️ Yazılı Anlatım<br><small style="opacity:.6">YKS Türkçe</small>'},
  ];
  data.forEach(d=>{const el=document.createElement('div');el.className='fc';el.style.cssText='top:'+d.top+';left:'+d.left+';--du:'+d.du+';--de:'+d.de;el.innerHTML=d.html;sc.appendChild(el);});
}

function initScrollReveal(){
  const lb=g('landBody');if(!lb)return;
  const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in');}),{threshold:.1,rootMargin:'0px 0px -30px 0px',root:lb});
  document.querySelectorAll('.rv').forEach(el=>obs.observe(el));
}
function scrollFeatures(){const fs=g('featuresSection'),lb=g('landBody');if(fs&&lb)lb.scrollTo({top:fs.offsetTop-20,behavior:'smooth'});}

// ── UPDATE ──────────────────────────
function checkUpdateBadge(){
  try{
    const seen=localStorage.getItem(UPD_KEY);
    // Show update badge for 1 full day since last update
    const oneDayAgo=Date.now()-86400000;
    const UPDATE_TS=1741270000000; // platform update timestamp
    if(!seen){localStorage.setItem(UPD_KEY,String(UPDATE_TS));}
    const ts=parseInt(localStorage.getItem(UPD_KEY)||'0');
    if(ts>oneDayAgo){buildUpdatePanel();const btn=g('updBtn');if(btn)btn.style.display='flex';}
  }catch(e){}
}
function buildUpdatePanel(){
  const p=g('updatePanel');if(!p)return;
  p.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><h3 style="font-size:15px;font-weight:800;color:var(--acc)">🛠️ Güncelleme Notları — v4.2</h3><button onclick="closeUpdatePanel()" style="background:none;border:none;cursor:pointer;font-size:16px;opacity:.4;color:var(--txt)">✕</button></div>'
    +UPD_ITEMS.map(i=>'<div class="upd-item"><span class="upd-tag upd-'+i.t+'">'+(i.t==='new'?'YENİ':i.t==='fix'?'DÜZELTİLDİ':'İYİLEŞTİRİLDİ')+'</span><span class="upd-desc">'+i.d+'</span></div>').join('');
}
function toggleUpdatePanel(){S.updOpen=!S.updOpen;const p=g('updatePanel');if(p)p.style.display=S.updOpen?'block':'none';}
function closeUpdatePanel(){S.updOpen=false;const p=g('updatePanel');if(p)p.style.display='none';const b=g('updBtn');if(b)b.style.display='none';}

// ── SIDEBAR ─────────────────────────
function toggleSidebar(){innerWidth<=768?S.sbOpen?closeSidebar():openSidebar():document.body.classList.toggle('sb-collapsed');}
function openSidebar(){S.sbOpen=true;const sb=g('sidebar'),ov=g('sbOverlay');if(sb)sb.classList.add('open');if(ov)ov.classList.add('show');document.body.classList.add('sb-open');}
function closeSidebar(){S.sbOpen=false;const sb=g('sidebar'),ov=g('sbOverlay');if(sb)sb.classList.remove('open');if(ov)ov.classList.remove('show');document.body.classList.remove('sb-open');}
function closeSbMobile(){if(innerWidth<=768)closeSidebar();}
function closeUniOverlay(){const ov=g('uniOverlay');if(ov)ov.style.display='none';}
function showUniversityInfo(){const ov=g('uniOverlay');if(ov)ov.style.display='flex';}

// ── PROFILE DD ──────────────────────
function toggleProfileDd(){S.ddOpen?closeDd():openDd();}
function openDd(){S.ddOpen=true;const d=g('profileDd');if(d){d.style.display='block';updateDd();}}
function closeDd(){S.ddOpen=false;const d=g('profileDd');if(d)d.style.display='none';}

function globalClick(e){
  const dd=g('profileDd'),btn=g('avatarBtn');
  if(S.ddOpen&&dd&&btn&&!dd.contains(e.target)&&!btn.contains(e.target))closeDd();
  const mc=g('memberCard');
  if(mc&&mc.style.display!=='none'&&!mc.contains(e.target)&&!e.target.closest('.member-item'))mc.style.display='none';
  const up=g('updatePanel'),ub=g('updBtn');
  if(S.updOpen&&up&&ub&&!up.contains(e.target)&&!ub.contains(e.target))closeUpdatePanel();
}

// ── MODALS ──────────────────────────
function openModal(id){
  const m=g(id);if(!m)return;
  m.classList.add('open');
  if(id==='classModal')renderGroupState();
  if(id==='cdModal')setTimeout(initCdTabs,50);
  if(id==='profileModal')renderProfile();
}
function closeModal(id){const m=g(id);if(m)m.classList.remove('open');}

function toast(msg,dur){const t=g('toastEl');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),dur||3000);}

function confirm2(opts){
  g('confirmIcon').textContent=opts.icon||'⚠️';
  g('confirmTitle').textContent=opts.title||'';
  g('confirmMsg').textContent=opts.msg||'';
  const btns=g('confirmBtns');btns.innerHTML='';
  const mk=(txt,cls,cb)=>{const b=document.createElement('button');b.className=cls;b.textContent=txt;b.style='min-width:100px;padding:10px 18px;margin-bottom:0';b.onclick=()=>{g('confirmOverlay').classList.remove('show');if(cb)cb();};return b;};
  if(opts.two){btns.appendChild(mk(opts.ok||'Evet','btn-primary',opts.onOk));btns.appendChild(mk(opts.cancel||'İptal','btn-ghost',opts.onCancel));}
  else{btns.appendChild(mk(opts.ok||'Anladım','btn-primary',opts.onOk));}
  g('confirmOverlay').classList.add('show');
}

// ── LOGIN ────────────────────────────
function promptName(prov){g('loginProv').value=prov;closeModal('loginModal');openModal('nameModal');}
function finalizeLogin(){
  const nm=g('nameInput').value.trim();if(!nm){g('nameInput').focus();return;}
  const prov=g('loginProv').value;
  S.user.name=nm;S.user.isLoggedIn=true;S.user.provider=prov;
  ['favorites','myNotes','countdowns','calendarEntries','recentViews','history'].forEach(k=>{if(!S.user[k])S.user[k]=[];});
  if(S.user.xp===undefined)S.user.xp=0;
  g('nameInput').value='';closeModal('nameModal');save();enterApp();
}

// ── SESSION ─────────────────────────
function loadSession(){
  try{const raw=localStorage.getItem('bk_user_v4');if(raw){const u=JSON.parse(raw);if(u&&u.isLoggedIn){S.user={...DEFAULT_USER(),...u};const two=Date.now()-2*86400000;S.user.recentViews=(S.user.recentViews||[]).filter(v=>v.ts>two);enterApp();}}}catch(e){}
}
function save(){try{localStorage.setItem('bk_user_v4',JSON.stringify(S.user));}catch(e){}}

function enterApp(){
  g('landingPage').style.display='none';
  const ap=g('appPage');ap.style.display='flex';
  updateAvatar();updateDd();goHome();
  const sel=g('upCat');if(sel&&sel.options.length===0)CATS.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o);});
  const gsel=g('gCat');if(gsel&&gsel.options.length<=1)['YKS','KPSS','LGS','ALES','YDS/YÖKDİL','TUS/DUS','Lise','Ortaokul','Diğer'].forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;gsel.appendChild(o);});
}

function logout(){
  S.user=DEFAULT_USER();S.hasGroup=false;S.grpData=null;
  try{localStorage.removeItem('bk_user_v4');}catch(e){}
  g('appPage').style.display='none';g('landingPage').style.display='flex';
  stopCanvas();setTheme(S.theme,true);
  if(motiveTimer){clearInterval(motiveTimer);motiveTimer=null;}
}

function updateAvatar(){const av=g('hdrAvatar'),dav=g('ddAvatar'),l=S.user.name.charAt(0).toUpperCase();if(av)av.textContent=l;if(dav)dav.textContent=l;}
function updateDd(){const li=lvlInfo(S.user.xp);g('ddName').textContent=S.user.name;g('ddId').textContent='ID: '+S.user.id;g('ddLvl').textContent='Seviye '+li.lvl+' · '+S.user.xp+' XP';}
function g(id){return document.getElementById(id);}

// ── LEVEL ────────────────────────────
function lvlInfo(xp){const lvl=Math.max(1,Math.floor((xp||0)/10)+1);const needed=lvl*10;const cur=(xp||0)%(needed);return{lvl,needed,cur,pct:Math.min(100,Math.round(cur/needed*100))};}
function addXP(n){S.user.xp=(S.user.xp||0)+n;S.user.level=lvlInfo(S.user.xp).lvl;save();updateDd();}

// ── VIEWS ────────────────────────────
function showView(id){document.querySelectorAll('#content .view').forEach(v=>v.classList.remove('active'));const el=g(id);if(el){el.classList.add('active');g('content').scrollTop=0;}}
function goHome(){showView('vHome');updateWelcome();buildBento();startMotiveTimer();}

function updateWelcome(){
  if(!S.user.isLoggedIn)return;
  const h=new Date().getHours();
  const gr=h<6?'İyi geceler 🌙':h<12?'Günaydın 🌅':h<18?'İyi günler ☀️':'İyi akşamlar 🌙';
  g('wbGreet').textContent=gr;g('wbName').textContent=S.user.name;
  setMotive();
}
function setMotive(){const el=g('wbMotive');if(!el)return;el.style.opacity='0';setTimeout(()=>{el.textContent=MOTIVES[motiveIdx%MOTIVES.length];el.style.opacity='';motiveIdx++;},300);}
function startMotiveTimer(){if(motiveTimer)clearInterval(motiveTimer);motiveTimer=setInterval(()=>{if(g('vHome').classList.contains('active'))setMotive();},300000);}

// ── BENTO ────────────────────────────
function buildBento(){
  const grid=g('bento');if(!grid)return;grid.innerHTML='';
  const rv=(S.user.recentViews||[]).slice(0,5);
  const li=lvlInfo(S.user.xp);
  const items=[
    {title:'📝 Kendi Notlarım',sub:'Kişisel not defterim',val:(S.user.myNotes||[]).length+' not',big:true,fn:openMyNotes},
    {title:'⭐ Favorilerim',sub:'Kaydettiklerim',val:(S.user.favorites||[]).length+' favori',fn:openFavoritesView},
    {title:'⏳ Sınav Sayaçları',sub:'Gün sayıyor',val:(S.user.countdowns||[]).length+' sınav',fn:openCd},
    {title:'📅 Takvim',sub:'Çalışma kayıtlarım',val:(S.user.calendarEntries||[]).length+' kayıt',fn:openCalendar},
    {title:'🏆 Liderlik',sub:'Sıralama',val:'',fn:openLb},
    {title:'💡 Öneriler',sub:'Çalışma taktikleri',val:'',fn:openSugg},
    {title:'👥 Grup / Sınıf',sub:S.hasGroup?'Aktif grup':'Gruba katıl',val:'',fn:()=>openModal('classModal')},
    {title:'Seviye '+li.lvl,sub:S.user.xp+' XP · '+li.pct+'% doldu',val:'',fn:()=>openModal('profileModal')},
    ...(rv.length?[{title:'🕐 Son Baktıklarım',sub:'Son ziyaret',val:rv.length+' not',fn:openRecent}]:[]),
  ];
  items.forEach((item,i)=>{const c=document.createElement('div');c.className='bc'+(item.big?' bc-big':'');c.style.animationDelay=i*.042+'s';c.innerHTML='<div><div class="bc-title">'+item.title+'</div><div class="bc-sub">'+item.sub+'</div></div>'+(item.val?'<div class="bc-val">'+item.val+'</div>':'');c.onclick=item.fn;grid.appendChild(c);});
}

// ── RECENT ───────────────────────────
function addRecent(note){if(!S.user.recentViews)S.user.recentViews=[];const rv=S.user.recentViews;const ex=rv.findIndex(v=>v.id===note.id);if(ex>-1)rv.splice(ex,1);rv.unshift({id:note.id,t:note.t,cat:note._cat,ts:Date.now()});if(rv.length>5)rv.pop();save();}
function openRecent(){showView('vRecent');const rv=(S.user.recentViews||[]).filter(v=>v.ts>Date.now()-2*86400000);const grid=g('recentGrid');grid.innerHTML='';if(!rv.length){grid.innerHTML='<div style="opacity:.38;padding:32px;text-align:center">Son bakılan not bulunamadı.</div>';return;}rv.forEach((v,i)=>{let note=null;for(const c in DB){const f=(DB[c]||[]).find(n=>n.id===v.id);if(f){note=f;break;}}if(note)grid.appendChild(mkCard(note,i));else{const c=document.createElement('div');c.className='note-card glass-card';c.innerHTML='<div class="card-title">'+v.t+'</div><div class="card-cat">'+(v.cat||'')+'</div>';grid.appendChild(c);}});}

// ── NOTES ────────────────────────────
function goTo(cat){S.prevView=S.curExamGrp?'vExamGrp':'vHome';g('notesCatTitle').textContent=cat;renderNotes(applyFilters(getNotes(cat)));showView('vNotes');buildFilterPanel();closeSbMobile();}
function closeNotesView(){S.curExamGrp?showView('vExamGrp'):goHome();}
function goBackDetail(){showView(S.prevView==='vExamGrp'?'vExamGrp':S.prevView==='vNotes'?'vNotes':'vHome');}

function renderNotes(notes){
  const grid=g('notesGrid');grid.innerHTML='';
  if(!notes.length){grid.innerHTML='<div style="opacity:.38;grid-column:1/-1;padding:32px;text-align:center">Bu kategoride not bulunamadı.</div>';return;}
  // Tarih bazlı gruplama (siteye ekleme tarihine göre)
  const now=Date.now();
  const groups=[
    {lbl:'Bugün',check:n=>now-n.createdAt<86400000},
    {lbl:'1 Gün Önce',check:n=>now-n.createdAt>=86400000&&now-n.createdAt<2*86400000},
    {lbl:'2 Gün Önce',check:n=>now-n.createdAt>=2*86400000&&now-n.createdAt<3*86400000},
    {lbl:'Bu Hafta',check:n=>now-n.createdAt>=3*86400000&&now-n.createdAt<7*86400000},
    {lbl:'Bu Ay',check:n=>now-n.createdAt>=7*86400000&&now-n.createdAt<30*86400000},
    {lbl:'Daha Eski',check:n=>now-n.createdAt>=30*86400000},
  ];
  // Aktif sıralama varsa grupsuz listele
  const hasSort=S.activeFilters&&S.activeFilters['sort'];
  if(hasSort){
    let idx=0;
    notes.slice(0,24).forEach(n=>{ const c=mkCard(n,idx++); grid.appendChild(c); });
    if(notes.length>24)requestAnimationFrame(()=>notes.slice(24).forEach(n=>{ const c=mkCard(n,idx++); grid.appendChild(c); }));
    return;
  }
  let totalAdded=0;
  groups.forEach(grp=>{
    const grpNotes=notes.filter(grp.check);
    if(!grpNotes.length)return;
    const lbl=document.createElement('div');
    lbl.className='date-group-lbl';lbl.textContent=grp.lbl+' ('+grpNotes.length+')';
    grid.appendChild(lbl);
    grpNotes.forEach(n=>{ const c=mkCard(n,totalAdded++); grid.appendChild(c); });
  });
}

function mkCard(item,idx){
  const c=document.createElement('div');c.className='note-card glass-card';c.style.animationDelay=Math.min(idx*.03,.5)+'s';
  c.innerHTML='<div class="card-cat">'+(item._cat||'Genel')+'</div><div class="card-title">'+item.t+'</div><div class="card-user">@'+item.u+' · Seviye '+item.lvl+'</div><div class="card-footer"><span>❤️'+item.likes+'</span><span>👍'+item.recommends+'</span><span>📖'+(item.reads||0)+'</span>'+(item.hasPdf?'<span style="color:var(--acc)">📄PDF</span>':'')+(item.trending?'<span style="color:#f59e0b">📈</span>':'')+'</div>';
  c.onclick=()=>openDoc(item);return c;
}

// ── FILTER ──────────────────────────
function buildFilterPanel(){
  const panel=g('filterPanel');if(!panel)return;panel.innerHTML='';
  FILTER_GROUPS.forEach(grp=>{
    const sec=document.createElement('div');sec.className='fsec';sec.innerHTML='<div class="fsec-lbl">'+grp.lbl+'</div>';
    const chips=document.createElement('div');chips.className='fchips';
    grp.opts.forEach(opt=>{const ch=document.createElement('div');ch.className='chip';ch.dataset.grp=grp.id;ch.dataset.opt=opt.id;ch.textContent=opt.lbl;ch.onclick=()=>toggleChip(grp,opt.id,ch);chips.appendChild(ch);});
    sec.appendChild(chips);panel.appendChild(sec);
  });
  panel.innerHTML+='<div style="text-align:right;padding-top:5px"><button onclick="clearFilters()" style="font-size:11px;opacity:.45;cursor:pointer;background:none;border:none;color:var(--txt);font-family:var(--font)">Temizle ✕</button></div>';
}
function toggleFilter(){S.filterOpen=!S.filterOpen;g('filterPanel').classList.toggle('open',S.filterOpen);g('filterToggleBtn').classList.toggle('on',S.filterOpen);}
function toggleChip(grp,optId,chip){
  if(grp.multi){if(!S.activeFilters[grp.id])S.activeFilters[grp.id]=new Set();const s=S.activeFilters[grp.id];if(s.has(optId)){s.delete(optId);chip.classList.remove('sel');}else{s.add(optId);chip.classList.add('sel');}if(!s.size)delete S.activeFilters[grp.id];}
  else{document.querySelectorAll('.chip[data-grp="'+grp.id+'"]').forEach(c=>c.classList.remove('sel'));if(S.activeFilters[grp.id]===optId)delete S.activeFilters[grp.id];else{S.activeFilters[grp.id]=optId;chip.classList.add('sel');}}
  updateFilterBadge();reRenderNotes();
}
function updateFilterBadge(){const n=Object.keys(S.activeFilters).length;const b=g('filterBadge');if(b){b.textContent=n||'';b.classList.toggle('show',n>0);}}
function clearFilters(){S.activeFilters={};document.querySelectorAll('.chip.sel').forEach(c=>c.classList.remove('sel'));updateFilterBadge();reRenderNotes();}
function reRenderNotes(){
  // notes view active
  const ct=g('notesCatTitle');
  const vn=g('vNotes');
  if(vn&&vn.classList.contains('active')&&ct&&ct.textContent){
    renderNotes(applyFilters(getNotes(ct.textContent)));
  }
  // exam group view active
  const veg=g('vExamGrp');
  if(veg&&veg.classList.contains('active')&&S.curExamGrp){
    const allN=[];(EXAM_GROUPS[S.curExamGrp]||[]).forEach(sub=>allN.push(...getNotes(sub).slice(0,10)));
    allN.sort((a,b)=>b.likes-a.likes);
    const grid=g('egGrid');if(grid){grid.innerHTML='';applyFilters(allN.slice(0,40)).forEach((n,i)=>grid.appendChild(mkCard(n,i)));}
  }
}
function applyFilters(notes){
  let r=[...notes];
  const sb=S.activeFilters['sort'];
  if(sb==='likes')r.sort((a,b)=>b.likes-a.likes);else if(sb==='rec')r.sort((a,b)=>b.recommends-a.recommends);else if(sb==='reads')r.sort((a,b)=>(b.reads||0)-(a.reads||0));else if(sb==='dl')r.sort((a,b)=>(b.downloads||0)-(a.downloads||0));else if(sb==='new')r.sort((a,b)=>b.createdAt-a.createdAt);else if(sb==='old')r.sort((a,b)=>a.createdAt-b.createdAt);else if(sb==='az')r.sort((a,b)=>a.t.localeCompare(b.t,'tr'));else if(sb==='za')r.sort((a,b)=>b.t.localeCompare(a.t,'tr'));
  const lv=S.activeFilters['level'];if(lv&&lv!=='any')r=r.filter(n=>n.lvl>=parseInt(lv));
  const ct=S.activeFilters['content'];if(ct&&ct.size){if(ct.has('trending'))r=r.filter(n=>n.trending);if(ct.has('pdf'))r=r.filter(n=>n.hasPdf);if(ct.has('commented'))r=r.filter(n=>n.comments&&n.comments.length>0);}
  return r;
}

// ── EXAM GROUP ───────────────────────
function openExamGrp(name,icon){
  S.curExamGrp=name;S.prevView='vExamGrp';
  g('egTitle').textContent=icon+' '+name;
  g('egBar').innerHTML='<div><div style="font-size:11px;opacity:.5;margin-bottom:2px">'+name+' Kategorisi</div><div style="font-size:13px;font-weight:700;color:var(--acc)">'+icon+' '+name+'</div></div><div style="display:flex;gap:8px"><button class="btn-secondary" onclick="toggleFilter()">⚡ Filtrele</button><button class="btn-secondary" onclick="openModal(\'uploadModal\')">+ Not Yükle</button></div>';
  const pins=g('egPins');pins.innerHTML='';
  (EXAM_GROUPS[name]||[]).forEach(sub=>{const el=document.createElement('div');el.className='eg-pin';el.textContent=sub;el.onclick=()=>goTo(sub);pins.appendChild(el);});
  g('egNotesLbl').textContent=name+' — Öne Çıkan Notlar';
  const allN=[];(EXAM_GROUPS[name]||[]).forEach(sub=>allN.push(...getNotes(sub).slice(0,10)));allN.sort((a,b)=>b.likes-a.likes);
  const grid=g('egGrid');grid.innerHTML='';applyFilters(allN.slice(0,40)).forEach((n,i)=>grid.appendChild(mkCard(n,i)));
  showView('vExamGrp');closeSbMobile();
}
function closeExamGrp(){S.curExamGrp=null;goHome();}

function toggleAcc(id,el){
  const body=g(id);if(!body)return;
  const open=body.classList.contains('open');body.classList.toggle('open',!open);
  const hdr=el.closest('.sg-hdr')||el.closest('.sg-nested-hdr')||el;
  hdr.setAttribute('data-open',open?'0':'1');
  const arrow=el.classList.contains('sg-arrow')?el:el.querySelector('.sg-arrow');
  if(arrow)arrow.style.transform=open?'':'rotate(90deg)';
}

// ── DETAIL ──────────────────────────
function openDoc(item){
  S.currentNote=item;addRecent(item);if(S.prevView!=='vExamGrp')S.prevView='vNotes';showView('vDetail');item.reads=(item.reads||0)+1;
  g('dTitle').textContent=item.t;
  g('dUser').innerHTML='<span>@'+item.u+'</span><span style="opacity:.4;margin-left:6px">· Seviye '+item.lvl+'</span>';
  g('dStats').textContent=item.recommends+' önerdi · '+item.reads+' okudu · '+(item.downloads||0)+' indirdi';
  g('dContent').textContent=item.desc;
  const fb=g('favBtn');const isFav=(S.user.favorites||[]).includes(item.id);fb.classList.toggle('on',isFav);fb.textContent=isFav?'❤️ Favori':'🤍 Favori';
  renderComments();
}
function renderComments(){
  const list=g('commentsList');list.innerHTML='';
  if(!S.currentNote.comments||!S.currentNote.comments.length){list.innerHTML='<div style="opacity:.38;font-size:12px">Henüz değerlendirme yok.</div>';return;}
  S.currentNote.comments.forEach(c=>{const el=document.createElement('div');el.className='cmt';el.innerHTML='<strong>'+c.u+'</strong> <span style="opacity:.5;font-size:11px">'+(c.type==='up'?'👍 Önerdi':'👎 Önermedi')+'</span><br><span style="font-size:13px;opacity:.8">'+c.text+'</span>';list.appendChild(el);});
}
function readInSite(){
  if(!S.currentNote)return;
  g('readTitle').textContent=S.currentNote.t;g('readBody').textContent=S.currentNote.desc;
  openModal('readModal');addXP(1);
}
function openReadNewTab(){
  if(!S.currentNote)return;
  const w=window.open('','_blank');
  if(w)w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+S.currentNote.t+'</title><style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;background:#0d1117;color:#dde3ec}h1{color:#7ca8f8;font-size:22px;margin-bottom:8px}pre{white-space:pre-wrap;font-family:inherit;font-size:14px;opacity:.88}</style></head><body><h1>'+S.currentNote.t+'</h1><hr style="opacity:.12;margin:12px 0"><pre>'+S.currentNote.desc+'</pre></body></html>');
}
function openReadFullPage(){
  if(!S.currentNote)return;
  const fp=g('fullReadPage');
  if(fp){
    g('fullReadTitle').textContent=S.currentNote.t;
    g('fullReadBody').textContent=S.currentNote.desc;
    fp.style.display='block';
  }
}
function closeFullRead(){const fp=g('fullReadPage');if(fp)fp.style.display='none';}
function openGroupDrawer(){openModal('classModal');}
function openGroupTab(){openModal('classModal');}
function openGroupNewTab(){closeModal('classModal');toast('ℹ️ Geniş grup görünümü için Grup / Sınıf kısmını kullanın.');}
function downloadNote(){
  if(!S.currentNote)return;
  const blob=new Blob([S.currentNote.t+'\n'+'─'.repeat(40)+'\n\n'+S.currentNote.desc+'\n\n─── bilgi kaynağım'],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=S.currentNote.t.replace(/[\/\\:*?"<>|]/g,'_')+'.txt';a.click();URL.revokeObjectURL(a.href);
  S.currentNote.downloads=(S.currentNote.downloads||0)+1;g('dStats').textContent=S.currentNote.recommends+' önerdi · '+(S.currentNote.reads||0)+' okudu · '+S.currentNote.downloads+' indirdi';
  addXP(1);toast('✅ Not indirildi!');
}
function shareGroup(){
  if(!S.hasGroup){toast('ℹ️ Paylaşmak için önce bir gruba üye olun.');return;}
  confirm2({icon:'👥',title:'Gruba Paylaş',msg:'Bu not grubunuzda paylaşılsın mı?',two:true,ok:'Paylaş',cancel:'Vazgeç',onOk:()=>{addXP(1);toast('✅ Not gruba paylaşıldı!');}});
}
function toggleFav(){
  if(!S.currentNote)return;const fb=g('favBtn');if(!S.user.favorites)S.user.favorites=[];
  const idx=S.user.favorites.indexOf(S.currentNote.id);
  if(idx>-1){S.user.favorites.splice(idx,1);fb.classList.remove('on');fb.textContent='🤍 Favori';toast('Favorilerden kaldırıldı.');}
  else{S.user.favorites.push(S.currentNote.id);fb.classList.add('on');fb.textContent='❤️ Favori';addXP(1);toast('⭐ Favorilere eklendi!');}
  save();
}
function openRecModal(type){
  g('recType').value=type;g('recSel').value='';
  const grid=g('recGrid');grid.innerHTML='';
  (type==='up'?REC_OPTS.up:REC_OPTS.down).forEach(opt=>{const el=document.createElement('div');el.className='csel';el.textContent=opt;el.onclick=()=>{grid.querySelectorAll('.csel').forEach(c=>c.classList.remove('sel'));el.classList.add('sel');g('recSel').value=opt;};grid.appendChild(el);});
  const rt=g('recTitle');if(type==='up'){rt.textContent='👍 Notu Öneriyorsunuz';rt.style.color='#22c55e';}else{rt.textContent='👎 Notu Önermiyorsunuz';rt.style.color='#ef4444';}
  openModal('recModal');
}
function submitRec(){
  const txt=g('recSel').value;const type=g('recType').value;if(!txt){toast('⚠️ Lütfen bir sebep seçin.');return;}
  if(S.currentNote){if(type==='up')S.currentNote.recommends++;else S.currentNote.unRec++;S.currentNote.comments.push({u:S.user.name,type,text:txt});S.user.history.push({noteTitle:S.currentNote.t,type,text:txt});S.user.comments++;addXP(1);g('dStats').textContent=S.currentNote.recommends+' önerdi · '+(S.currentNote.reads||0)+' okudu · '+(S.currentNote.downloads||0)+' indirdi';renderComments();}
  closeModal('recModal');toast('✅ Değerlendirmeniz iletildi!');
}

// ── FAVORITES ────────────────────────
function openFavorites(){openModal('profileModal');}
function openFavoritesView(){
  // Favori notları kendi view'larında listele (MyNotes view'unu kullan)
  showView('vMyNotes');
  const grid=g('myNotesGrid');grid.innerHTML='';
  const favIds=S.user.favorites||[];
  if(!favIds.length){grid.innerHTML='<div style="opacity:.38;grid-column:1/-1;padding:32px;text-align:center">Henüz favori eklenmedi.</div>';return;}
  let found=[];
  for(const cat in DB){(DB[cat]||[]).forEach(item=>{if(favIds.includes(item.id))found.push(item);});}
  if(!found.length){grid.innerHTML='<div style="opacity:.38;grid-column:1/-1;padding:32px;text-align:center">Favori notlar yüklenemedi.</div>';return;}
  found.forEach((n,i)=>grid.appendChild(mkCard(n,i)));
  // Override header title
  const hdr=g('myNotesTitle');if(hdr)hdr.textContent='⭐ Favorilerim';
}

// ── MY NOTES ────────────────────────
function openMyNotes(){const hdr=g('myNotesTitle');if(hdr)hdr.textContent='📝 Kendi Notlarım';showView('vMyNotes');renderMyNotes();}
function openAddNote(){g('mnTitle').value='';g('mnContent').value='';g('mnColor').value='default';document.querySelectorAll('#mnColorGrid .col-opt').forEach(c=>c.classList.remove('sel'));openModal('addNoteModal');}
function selColor(el,val){el.closest('.color-grid').querySelectorAll('.col-opt').forEach(c=>c.classList.remove('sel'));el.classList.add('sel');g('mnColor').value=val;}
function saveMyNote(){
  const title=g('mnTitle').value.trim(),content=g('mnContent').value.trim(),color=g('mnColor').value||'default';
  if(!title){toast('⚠️ Lütfen bir başlık girin.');return;}
  if(!S.user.myNotes)S.user.myNotes=[];
  S.user.myNotes.unshift({id:'mn_'+Date.now(),title,content,color,createdAt:Date.now()});
  save();closeModal('addNoteModal');renderMyNotes();toast('📝 Not kaydedildi!');
}
function renderMyNotes(){
  const grid=g('myNotesGrid');if(!grid)return;grid.innerHTML='';const notes=S.user.myNotes||[];
  if(!notes.length){grid.innerHTML='<div style="opacity:.38;grid-column:1/-1;padding:32px;text-align:center">Henüz not eklenmedi. "+ Not Ekle" butonunu kullanın.</div>';return;}
  notes.forEach((note,i)=>{
    const c=document.createElement('div');c.className='note-card glass-card'+(note.color!=='default'?' mn-'+note.color:'');c.style.animationDelay=i*.04+'s';
    const d=new Date(note.createdAt).toLocaleDateString('tr-TR');
    // note içeriği olduğu gibi, düzen bozulmaz
    c.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:7px"><div class="card-title">'+note.title+'</div><button onclick="event.stopPropagation();delMyNote(\''+note.id+'\')" style="background:none;border:none;cursor:pointer;font-size:14px;opacity:.3;flex-shrink:0;transition:.2s;color:var(--txt)" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.3">🗑️</button></div><div style="font-size:12.5px;opacity:.7;line-height:1.6;margin:4px 0;white-space:pre-wrap;max-height:80px;overflow:hidden;text-overflow:ellipsis">'+escHtml(note.content||'(içerik yok)')+'</div><div class="card-footer"><span>📅 '+d+'</span></div>';
    c.onclick=e=>{if(e.target.tagName!=='BUTTON'){g('readTitle').textContent=note.title;g('readBody').textContent=note.content||'(içerik yok)';openModal('readModal');}};
    grid.appendChild(c);
  });
}
function editMyNote(id){
  const note=(S.user.myNotes||[]).find(n=>n.id===id);if(!note)return;
  // editNoteId gizli alanına kaydet
  const eid=g('editNoteId');if(eid)eid.value=id;
  const et=g('editNoteTitle');if(et)et.value=note.title;
  const ec=g('editNoteContent');if(ec)ec.value=note.content||'';
  const eg=g('editNoteColorVal');if(eg)eg.value=note.color||'default';
  // renk seçimini güncelle
  document.querySelectorAll('#editColorGrid .col-opt').forEach(el=>{
    el.classList.toggle('sel',el.dataset.color===(note.color||'default'));
  });
  openModal('editNoteModal');
}
function saveEditNote(){
  const id=g('editNoteId').value;
  const title=g('editNoteTitle').value.trim();
  const content=g('editNoteContent').value.trim();
  const color=g('editNoteColorVal').value||'default';
  if(!title){toast('⚠️ Lütfen bir başlık girin.');return;}
  const idx=(S.user.myNotes||[]).findIndex(n=>n.id===id);
  if(idx===-1){toast('⚠️ Not bulunamadı.');return;}
  S.user.myNotes[idx]={...S.user.myNotes[idx],title,content,color,updatedAt:Date.now()};
  save();closeModal('editNoteModal');renderMyNotes();toast('✅ Not güncellendi!');
}
function selEditColor(el,val){
  el.closest('.color-grid').querySelectorAll('.col-opt').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel');
  const v=g('editNoteColorVal');if(v)v.value=val;
}
function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function delMyNote(id){confirm2({icon:'🗑️',title:'Notu Sil',msg:'Bu not kalıcı olarak silinecek. Emin misiniz?',two:true,ok:'Sil',cancel:'İptal',onOk:()=>{S.user.myNotes=(S.user.myNotes||[]).filter(n=>n.id!==id);save();renderMyNotes();toast('🗑️ Not silindi.');}});}

// ── CALENDAR ────────────────────────
function openCalendar(){showView('vCalendar');renderCalendar();}
function openAddCal(){
  g('calDate').value=new Date().toISOString().split('T')[0];
  g('calSubj').value='';g('calHours').value='';g('calQ').value='';g('calNote').value='';g('calPerf').value='';
  document.querySelectorAll('#calPerfGrid .csel').forEach(c=>c.classList.remove('sel'));
  openModal('calModal');
}
function saveCalEntry(){
  const date=g('calDate').value,subj=g('calSubj').value.trim();if(!date||!subj){toast('⚠️ Tarih ve konu zorunludur.');return;}
  if(!S.user.calendarEntries)S.user.calendarEntries=[];
  S.user.calendarEntries.unshift({id:'cal_'+Date.now(),date,subj,hours:g('calHours').value||null,questions:g('calQ').value||null,perf:g('calPerf').value||null,note:g('calNote').value.trim()||null,createdAt:Date.now()});
  save();closeModal('calModal');renderCalendar();toast('📅 Çalışma kaydı eklendi!');
}
function renderCalendar(){
  const empty=g('calEmpty'),grid=g('calGrid'),addBtn=g('calAddTopBtn');
  const entries=(S.user.calendarEntries||[]).sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(!entries.length){empty.style.display='flex';grid.style.display='none';if(addBtn)addBtn.style.display='none';return;}
  empty.style.display='none';grid.style.display='grid';if(addBtn)addBtn.style.display='';grid.innerHTML='';
  const pm={low:'p-low',mid:'p-mid',high:'p-high',peak:'p-peak'},pl={low:'😐 Düşük',mid:'😊 Orta',high:'🔥 Yüksek',peak:'⚡ Zirve'};
  entries.forEach((e,i)=>{
    const el=document.createElement('div');el.className='cal-entry glass-card';el.style.animationDelay=i*.04+'s';
    el.innerHTML='<div class="perf-dot '+(pm[e.perf]||'p-low')+'"></div><div style="flex:1;min-width:0"><div class="cal-date">'+new Date(e.date).toLocaleDateString('tr-TR',{weekday:'short',year:'numeric',month:'long',day:'numeric'})+'</div><div class="cal-subj">'+escHtml(e.subj)+'</div><div class="cal-detail">'+[e.hours?'⏱️ '+e.hours+' saat':'',e.questions?'📝 '+e.questions+' soru':'',e.perf?pl[e.perf]:'',e.note?escHtml(e.note):''].filter(Boolean).join(' · ')+'</div></div><button onclick="delCal(\''+e.id+'\')" style="background:none;border:none;cursor:pointer;font-size:14px;opacity:.3;flex-shrink:0;transition:.2s;color:var(--txt)" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.3">🗑️</button>';
    grid.appendChild(el);
  });
}
function delCal(id){S.user.calendarEntries=(S.user.calendarEntries||[]).filter(e=>e.id!==id);save();renderCalendar();toast('🗑️ Kayıt silindi.');}

// ── COUNTDOWN ────────────────────────
function openCd(){showView('vCd');renderCd();}
function renderCd(){
  const grid=g('cdGrid'),empty=g('cdEmpty'),addBtn=g('cdAddTopBtn');const cds=S.user.countdowns||[];
  if(!cds.length){grid.style.display='none';empty.style.display='flex';if(addBtn)addBtn.style.display='none';return;}
  empty.style.display='none';grid.style.display='grid';if(addBtn)addBtn.style.display='';grid.innerHTML='';
  cds.forEach((item,i)=>{const c=document.createElement('div');c.className='note-card glass-card';c.style.animationDelay=i*.045+'s';c.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start"><div style="font-size:28px">'+(item.icon||'📅')+'</div><button onclick="event.stopPropagation();delCd('+i+')" style="background:none;border:none;cursor:pointer;font-size:14px;opacity:.3;transition:.2s;color:var(--txt)" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.3">✕</button></div><h3 style="color:var(--acc);font-size:16px;font-weight:800;margin:4px 0">'+item.n+'</h3><div style="font-size:22px;font-weight:800">'+item.d+'<span style="font-size:13px;opacity:.5;font-weight:500"> gün kaldı</span></div>';grid.appendChild(c);});
}
function delCd(idx){const cds=S.user.countdowns||[];cds.splice(idx,1);save();renderCd();}
function initCdTabs(){
  switchCdTab('custom');
  const grid=g('cdPresetGrid');if(grid&&!grid.children.length)PRESET_EXAMS.forEach(ex=>{const el=document.createElement('div');el.className='csel';el.innerHTML=ex.icon+' '+ex.n+'<br><small style="opacity:.5">'+ex.d+' gün</small>';el.dataset.val=JSON.stringify(ex);el.onclick=()=>{grid.querySelectorAll('.csel').forEach(c=>c.classList.remove('sel'));el.classList.add('sel');g('cdPresetVal').value=el.dataset.val;};grid.appendChild(el);});
}
function switchCdTab(tab){
  S.cdTab=tab;const cp=g('cdCustom'),pp=g('cdPreset'),t1=g('cdTab1'),t2=g('cdTab2'),line=g('cdTabLine');
  cp.style.display=tab==='custom'?'block':'none';pp.style.display=tab==='preset'?'block':'none';
  t1.classList.toggle('active',tab==='custom');t2.classList.toggle('active',tab==='preset');
  if(line){const active=tab==='custom'?t1:t2;setTimeout(()=>{line.style.left=active.offsetLeft+'px';line.style.width=active.offsetWidth+'px';},10);}
}
function saveCd(type){
  if(!S.user.countdowns)S.user.countdowns=[];
  if(type==='custom'){const n=g('cdName').value.trim(),icon=g('cdEmoji').value.trim()||'📅',d=parseInt(g('cdDays').value);if(!n||isNaN(d)||d<0){toast('⚠️ Geçerli bilgiler giriniz.');return;}S.user.countdowns.unshift({n,icon,d});}
  else{const sel=g('cdPresetVal').value;if(!sel){toast('⚠️ Lütfen bir sınav seçin.');return;}const ex=JSON.parse(sel);if(S.user.countdowns.find(c=>c.n===ex.n)){toast('ℹ️ Bu sınav zaten ekli.');return;}S.user.countdowns.unshift({n:ex.n,icon:ex.icon,d:ex.d});}
  save();closeModal('cdModal');renderCd();toast('✅ Sayaç eklendi!');
}

// ── SUGGESTIONS ──────────────────────
function openSugg(){
  showView('vSugg');const grid=g('suggGrid');grid.innerHTML='';
  DB['__suggestions'].forEach((item,i)=>{const c=document.createElement('div');c.className='note-card glass-card';c.style.animationDelay=i*.04+'s';c.innerHTML='<div style="font-size:11px;opacity:.43">@'+item.u+'</div><p style="font-size:13.5px;line-height:1.58;margin:6px 0">'+item.t+'</p><div style="display:flex;gap:12px;font-size:13px;opacity:.62"><span style="cursor:pointer" onclick="likeSugg(this,\''+item.id+'\',\'up\')">👍 '+item.likes+'</span><span style="cursor:pointer" onclick="likeSugg(this,\''+item.id+'\',\'down\')">👎 '+item.dislikes+'</span></div>';grid.appendChild(c);});
}
function likeSugg(el,id,type){const item=DB['__suggestions'].find(s=>s.id===id);if(item){if(type==='up'){item.likes++;el.textContent='👍 '+item.likes;}else{item.dislikes++;el.textContent='👎 '+item.dislikes;}addXP(1);}}
function submitSugg(){const t=g('suggTxt').value.trim();if(!t){toast('⚠️ Lütfen bir öneri yazın.');return;}DB['__suggestions'].unshift({id:'sug_'+Date.now(),u:S.user.name,t,likes:0,dislikes:0});g('suggTxt').value='';closeModal('suggModal');toast('✅ Öneri eklendi!');if(g('vSugg').classList.contains('active'))openSugg();}

// ── LEADERBOARD ──────────────────────
function openLb(){
  showView('vLb');const ct=g('lbContainer');ct.innerHTML='';const all=getFeatured();
  const secs=[
    {t:'⭐ En Çok Önerilen',rows:[...all].sort((a,b)=>b.recommends-a.recommends).slice(0,5).map((n,i)=>({r:i+1,n:n.t,s:'@'+n.u,v:n.recommends+' öneri'}))},
    {t:'📥 En Çok İndirilen',rows:[...all].sort((a,b)=>(b.downloads||0)-(a.downloads||0)).slice(0,5).map((n,i)=>({r:i+1,n:n.t,s:'@'+n.u,v:(n.downloads||0)+' indirme'}))},
    {t:'📖 En Çok Okunan',rows:[...all].sort((a,b)=>(b.reads||0)-(a.reads||0)).slice(0,5).map((n,i)=>({r:i+1,n:n.t,s:'@'+n.u,v:(n.reads||0)+' okuma'}))},
  ];
  secs.forEach(sec=>{const w=document.createElement('div');w.className='lb-sec';w.innerHTML='<h2>'+sec.t+'</h2>';sec.rows.forEach((row,i)=>{const rk=i===0?'🥇':i===1?'🥈':i===2?'🥉':row.r+'.';const el=document.createElement('div');el.className='lb-row';el.style.animationDelay=i*.06+'s';el.innerHTML='<div class="lb-rank">'+rk+'</div><div style="flex:1;min-width:0"><div class="lb-nm">'+row.n+'</div><div class="lb-sub">'+row.s+'</div></div><div class="lb-val">'+row.v+'</div>';w.appendChild(el);});ct.appendChild(w);});
}

// ── TODAY WIZARD (Profil kartı - "Bugün Ne Yapayım?") ────────────────
const TW_STEPS=[
  {q:'Bugün ne yapmak istiyorsun?',opts:['📖 Not Okumak','✍️ Not Eklemek','👥 Grup Çalışması','🎯 Sınav Hazırlığı','📊 İlerlememi Görmek']},
  {q:'Hangi konuya odaklanacaksın?',opts:['🔢 Matematik','📝 Türkçe / Edebiyat','⚗️ Fen Bilimleri','📜 Sosyal Bilimler','🌍 Yabancı Dil','📚 Tüm Dersler']},
  {q:'Ne kadar zamanın var?',opts:['⚡ 15 dk (hızlı)','📖 30 dk','🔥 1 saat','💪 2+ saat']},
  {q:'Hangi seviyedesin?',opts:['🏫 Ortaokul','📚 Lise','🎓 YKS Hazırlık','🏛️ Üniversite Sınavı (KPSS/ALES)','🧪 Mesleki Sınav (TUS/DUS)']},
  {q:'Son bir şey — önce nereye bakmak istersin?',opts:['🔍 En Popüler Notlar','🆕 En Yeni Notlar','📈 Trend İçerikler','👥 Grubuma Sor','🎲 Sürpriz Yönlendir']},
];
function openTodayWizard(){S.twStep=0;S.twSel={};renderTodayWizard();}
function renderTodayWizard(){
  const box=g('twBox');if(!box)return;
  const step=TW_STEPS[S.twStep];
  if(!step){
    const act={ts:Date.now(),sels:Object.values(S.twSel),date:new Date().toLocaleDateString('tr-TR')};
    if(!S.user.activities)S.user.activities=[];
    S.user.activities.unshift(act);save();
    box.innerHTML='<div class="tw-result"><div style="font-size:32px;margin-bottom:10px">🎯</div><div style="font-weight:700;color:var(--acc);margin-bottom:6px">Harika! Seni yönlendiriyoruz.</div><div style="font-size:12px;opacity:.6;margin-bottom:14px">Bugünkü planın kaydedildi.</div><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button class="btn-primary" style="padding:9px 18px;font-size:13px" onclick="twGoNow()">Başla →</button><button class="btn-ghost" style="padding:9px 16px;font-size:13px" onclick="openTodayWizard()">Tekrar</button></div></div>';
    renderActivities();
    return;
  }
  const prog=TW_STEPS.map((_,i)=>'<div class="tw-dot '+(i<S.twStep?'done':i===S.twStep?'active':'')+'"></div>').join('');
  const optsHtml=step.opts.map((o,oi)=>{
    const isSel=S.twSel[S.twStep]===o;
    return '<button class="tw-opt'+(isSel?' sel':'')+'" data-idx="'+S.twStep+'" data-oi="'+oi+'" onclick="twPickIdx(this,'+S.twStep+','+oi+')">'+o+'</button>';
  }).join('');
  box.innerHTML='<div class="tw-prog">'+prog+'<span class="tw-step-lbl">'+(S.twStep+1)+' / '+TW_STEPS.length+'</span></div>'+
    '<div class="tw-q">'+step.q+'</div>'+
    '<div class="tw-opts">'+optsHtml+'</div>'+
    '<div class="tw-nav">'+(S.twStep>0?'<button class="btn-ghost" style="padding:8px 16px;font-size:12px" onclick="S.twStep--;renderTodayWizard();">← Geri</button>':'')+
    '<button class="btn-primary" style="padding:8px 18px;font-size:13px" onclick="twNext()">'+(S.twStep===TW_STEPS.length-1?'Tamamla ✓':'Devam →')+'</button></div>';
}
function twPickIdx(el,stepIdx,optIdx){
  const val=TW_STEPS[stepIdx].opts[optIdx];
  el.closest('.tw-opts').querySelectorAll('.tw-opt').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel');S.twSel[stepIdx]=val;
}
function twPick(el,val){
  el.closest('.tw-opts').querySelectorAll('.tw-opt').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel');S.twSel[S.twStep]=val;
}
function twNext(){
  if(!S.twSel[S.twStep]){toast('⚠️ Lütfen bir seçenek seçin.');return;}
  S.twStep++;renderTodayWizard();
}
function twGoNow(){
  const sel1=S.twSel[1]||'';
  closeModal('profileModal');
  // Konuya göre yönlendir
  if(sel1.includes('Matematik'))goTo('YKS Matematik');
  else if(sel1.includes('Türkçe'))goTo('YKS Türkçe');
  else if(sel1.includes('Fen'))goTo('YKS Fizik');
  else if(sel1.includes('Sosyal'))goTo('YKS Tarih');
  else if(sel1.includes('Yabancı'))goTo('YDS İngilizce');
  else openExamGrp('YKS','🎓');
}
function renderActivities(){
  const box=g('activitiesBox');if(!box)return;
  const acts=S.user.activities||[];
  if(!acts.length){box.innerHTML='<div style="opacity:.38;font-size:12px;padding:8px 0">Henüz aktivite kaydedilmedi.</div>';return;}
  const now=Date.now();
  const groups=[
    {lbl:'Bugün',fn:a=>now-a.ts<86400000},
    {lbl:'Dün',fn:a=>now-a.ts>=86400000&&now-a.ts<2*86400000},
    {lbl:'Bu Hafta',fn:a=>now-a.ts>=2*86400000&&now-a.ts<7*86400000},
    {lbl:'Geçen Ay',fn:a=>now-a.ts>=7*86400000&&now-a.ts<30*86400000},
  ];
  let html='';
  groups.forEach(g=>{
    const ga=acts.filter(g.fn);if(!ga.length)return;
    html+='<div class="act-group-lbl">'+g.lbl+'</div>';
    ga.forEach(a=>{
      html+='<div class="act-item"><span class="act-icon">'+(a.sels[0]||'📌').split(' ')[0]+'</span><div><div style="font-size:12px;font-weight:600">'+escHtml(a.sels[0]||'Çalışma')+'</div><div style="font-size:10px;opacity:.45">'+a.date+' · '+(a.sels[1]||'')+'</div></div></div>';
    });
  });
  box.innerHTML=html||'<div style="opacity:.38;font-size:12px;padding:8px 0">Henüz aktivite kaydedilmedi.</div>';
}

// ── PROFILE ─────────────────────────
function renderProfile(){
  const u=S.user;const li=lvlInfo(u.xp);
  const pc=g('profCircle');if(pc)pc.style.background='conic-gradient(var(--acc) '+li.pct+'%,rgba(128,128,128,.1) 0deg)';
  g('profLvlNum').textContent=li.lvl;g('profName').textContent=u.name;
  g('profIdTxt').textContent='ID: '+u.id;
  g('profProvTxt').textContent=u.provider==='google'?'🔵 Google ile giriş yapıldı':'🍎 Apple ile giriş yapıldı';
  g('xpLbl').textContent='Seviye '+li.lvl;g('xpCnt').textContent=u.xp+' XP / '+li.needed+' XP';
  g('xpFill').style.width=li.pct+'%';
  g('ps_xp').textContent=u.xp;g('ps_com').textContent=u.comments;g('ps_fav').textContent=(u.favorites||[]).length;
  // bottom xp card
  if(g('profLvlLabel'))g('profLvlLabel').textContent='Seviye '+li.lvl;
  openTodayWizard();renderActivities();
  if(g('profXpDetail'))g('profXpDetail').textContent=u.xp+' / '+li.needed+' XP';
  if(g('xpFill2'))g('xpFill2').style.width=li.pct+'%';
  if(g('profNextLvl'))g('profNextLvl').textContent='Sonraki seviye için '+(li.needed-li.cur)+' XP daha gerekiyor';
  const br=g('badgesRow');if(br){br.innerHTML='';if(u.xp>=10)br.innerHTML+='<span class="badge acc">⭐ Aktif Üye</span>';if(u.comments>=5)br.innerHTML+='<span class="badge gold">💬 Yorumcu</span>';if((u.favorites||[]).length>=3)br.innerHTML+='<span class="badge">❤️ Koleksiyoncu</span>';if(u.xp>=50)br.innerHTML+='<span class="badge gold">🔥 Uzman</span>';}
  const fl=g('profFavList');if(fl){fl.innerHTML='';let found=false;for(const cat in DB){(DB[cat]||[]).forEach(item=>{if((u.favorites||[]).includes(item.id)){found=true;const el=document.createElement('div');el.className='mini-fav';el.textContent=item.t;el.onclick=()=>{closeModal('profileModal');openDoc(item);};fl.appendChild(el);}});}if(!found)fl.innerHTML='<div style="opacity:.38;font-size:12px;grid-column:1/-1">Henüz favori eklenmedi.</div>';}
  const cl=g('profComList');if(cl){if(u.history&&u.history.length){cl.innerHTML=u.history.slice(-8).reverse().map(h=>'<div style="padding:6px;border-bottom:1px solid rgba(128,128,128,.08);font-size:12px">'+(h.type==='up'?'👍':'👎')+' <strong>'+h.noteTitle+'</strong> — <em style="opacity:.55">'+h.text+'</em></div>').join('');}else{cl.textContent='Henüz değerlendirme yapılmadı.';}}
}

// Ad değiştirme — artık site uyumlu modal
function changeUsername(){
  if(S.user.lastNameChange){const days=(Date.now()-S.user.lastNameChange)/86400000;if(days<90){toast('ℹ️ Kullanıcı adınızı 3 ayda bir değiştirebilirsiniz.');return;}}
  g('changeNameInput').value='';openModal('changeNameModal');
}
function confirmChangeName(){
  const n=g('changeNameInput').value.trim();
  if(!n){toast('⚠️ Lütfen bir kullanıcı adı girin.');return;}
  // 3 aylık kısıtlama (90 gün)
  if(S.user.lastNameChange){
    const days=(Date.now()-S.user.lastNameChange)/86400000;
    if(days<90){
      const left=Math.ceil(90-days);
      toast('ℹ️ Kullanıcı adınızı 3 ayda bir değiştirebilirsiniz. '+left+' gün kaldı.');
      return;
    }
  }
  S.user.name=n;S.user.lastNameChange=Date.now();save();updateAvatar();updateDd();closeModal('changeNameModal');
  if(g('profileModal').classList.contains('open'))renderProfile();
  toast('✅ Kullanıcı adınız başarıyla güncellendi!');
}

// ── UPLOAD ─────────────────────────
function onFileSelect(e){const f=e.target.files[0];if(f)g('fileText').textContent='📄 '+f.name+' ('+(f.size/1024).toFixed(0)+' KB)';}
function submitUpload(){const t=g('upTitle').value.trim();if(!t){toast('⚠️ Başlık zorunludur.');return;}g('upTitle').value='';g('upDesc').value='';g('fileText').textContent='📄 PDF Dosyası Seç (veya buraya sürükleyin)';closeModal('uploadModal');addXP(2);toast('✅ Notunuz sisteme yüklendi!');}

// ── REPORT / MISC ──────────────────
function cselPick(el,hidId,val){el.closest('.csel-grid').querySelectorAll('.csel').forEach(c=>c.classList.remove('sel'));el.classList.add('sel');g(hidId).value=val;}
function submitReport(){const r=g('repReason').value;if(!r){toast('⚠️ Rapor türü seçin.');return;}closeModal('reportModal');toast('🚩 Rapor iletildi. Teşekkürler!');}
function submitBug(){const cat=g('bugCat').value;if(!cat){toast('⚠️ Hata kategorisi seçin.');return;}g('bugCat').value='';g('bugTxt').value='';document.querySelectorAll('#bugGrid .csel').forEach(c=>c.classList.remove('sel'));closeModal('bugModal');toast('🐛 Hata raporunuz iletildi. Teşekkürler!');}
function submitFikir(){const t=g('fikirTxt').value.trim();if(!t)return;g('fikirTxt').value='';closeModal('fikirModal');toast('💡 Fikriniz iletildi. Teşekkürler!');}

// ── WIZARD — genişletildi, arama eklendi ──
const WZ_STEPS = [
  {q:'Ne tür bir şey yapmak istiyorsun?',opts:['📖 Not Okumak','📥 Not İndirmek','📤 Not Paylaşmak','👥 Grup Çalışması','🎯 Sınav Hazırlığı','📝 Kendi Notum Eklemek','🏆 Liderlik Tablosuna Bakma','⏳ Sınav Sayacı Eklemek']},
  {q:'Hangi seviye için çalışıyorsun?',opts:['🎓 YKS (TYT/AYT)','🏛️ KPSS','🧠 ALES / DGS','🌍 YDS / YÖKDİL','⚕️ TUS / DUS','⚖️ Hakimlik / MSÜ','📚 Lise (9-12. Sınıf)','🏫 Ortaokul (LGS)','📌 Diğer / Serbest']},
  {q:'Hangi alan seni daha çok ilgilendiriyor?',opts:['🔢 Matematik / Sayısal','📝 Türkçe / Dil / Edebiyat','⚗️ Fen / Biyoloji / Kimya','📜 Tarih / Sosyal / Vatandaşlık','🔭 Fizik','🌍 Yabancı Dil','🧠 Felsefe / Mantık / Psikoloji','📐 Geometri / Analitik','✏️ Tüm Dersler / Karışık']},
  {q:'Ne kadar zamanın var?',opts:['⚡ 15 dakika (hızlı tekrar)','📖 30 dakika (konu özeti)','🔥 1 saat (derinlemesine)','💪 2+ saat (yoğun çalışma)']},
  {q:'Hangi konuya odaklanmak istiyorsun?',opts:['Yeni konu başlamak','Eksik konuları kapatmak','Zor konuları tekrar etmek','Deneme çözmek','Soru bankası çalışmak','Özet/formül ezberlemek']},
];

function openWizard(){S.wzStep=0;S.wzSel={};S.wzSearchTerm='';showView('vWizard');const si=g('wzSearch');if(si)si.value='';renderWizard();}
function wzSearchFilter(val){S.wzSearchTerm=val;renderWizard();}
function renderWizard(){
  const box=g('wizardBox');if(!box)return;
  const prog=g('wzProgress');if(prog){prog.innerHTML=WZ_STEPS.map((_,i)=>'<div class="wz-prog-dot '+(i<S.wzStep?'done':i===S.wzStep?'active':'')+'"></div>').join('')+'<span style="font-size:11px;opacity:.45;margin-left:4px">'+(S.wzStep+1)+'/'+WZ_STEPS.length+'</span>';}
  if(S.wzStep>=WZ_STEPS.length){
    const sel1=S.wzSel[1]||'';
    const grpKey=Object.keys(EXAM_GROUPS).find(k=>sel1.toUpperCase().includes(k.replace('İ','I')))||'YKS';
    const icon=sel1.split(' ')[0]||'🎓';
    box.innerHTML='<div class="wz-step"><h3>✅ Harika! Seni yönlendiriyoruz...</h3><p style="font-size:14px;opacity:.7;margin-bottom:16px">Seçimlerine göre <strong style="color:var(--acc)">'+sel1+'</strong> kategorisine yönlendiriliyorsunuz.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn-primary" onclick="openExamGrp(\''+grpKey+'\',\''+icon+'\')">Notlara Git →</button><button class="btn-ghost" style="padding:9px 18px" onclick="S.wzStep=0;S.wzSel={};renderWizard()">Baştan Başla</button></div></div>';
    return;
  }
  const step=WZ_STEPS[S.wzStep];
  let opts=step.opts;
  if(S.wzSearchTerm)opts=opts.filter(o=>o.toLowerCase().includes(S.wzSearchTerm.toLowerCase()));
  box.innerHTML='<div class="wz-step"><h3>'+step.q+'</h3>'+(S.wzSearchTerm&&!opts.length?'<div style="opacity:.38;padding:12px">Arama sonucu bulunamadı.</div>':'<div class="wz-opts">'+opts.map(o=>'<div class="wz-opt'+(S.wzSel[S.wzStep]===o?' sel':'')+'" onclick="wzSelOpt(this,\''+o.replace(/'/g,"\\'")+'\')">'+(S.wzSearchTerm?o.replace(new RegExp('('+S.wzSearchTerm+')','gi'),'<mark style="background:rgba(124,168,248,.25);border-radius:2px;padding:0 1px">$1</mark>'):o)+'</div>').join('')+'</div>')+
    '<div style="display:flex;gap:8px;margin-top:8px">'+(S.wzStep>0?'<button class="btn-ghost" style="padding:9px 18px" onclick="S.wzStep--;renderWizard()">← Geri</button>':'')+
    '<button class="btn-primary" style="padding:9px 22px" onclick="wzNext()">Devam →</button>'+(S.wzStep<WZ_STEPS.length-1?'<button class="btn-ghost" style="padding:9px 15px;opacity:.5" onclick="S.wzStep=WZ_STEPS.length;renderWizard()">Atla ⟫</button>':'')+'</div></div>';
}
function wzSelOpt(el,val){el.closest('.wz-opts').querySelectorAll('.wz-opt').forEach(o=>o.classList.remove('sel'));el.classList.add('sel');S.wzSel[S.wzStep]=val;}
function wzNext(){S.wzStep++;renderWizard();}

// ── GROUP ───────────────────────────
function renderGroupState(){
  const ng=g('noGroup'),hg=g('hasGroup');
  if(S.hasGroup){ng.style.display='none';hg.style.display='flex';hg.style.flexDirection='column';initGroupData();buildChatQuick();initGTabs();}
  else{
    ng.style.display='flex';ng.style.flexDirection='column';hg.style.display='none';
    hideCreateGroup(); // formu gizle, listeyi göster
    renderGroupList();
  }
}
function showCreateGroup(){
  const b=g('createGroupBox');if(!b)return;
  b.style.display='block';
  // katılma bölümünü tamamen gizle
  const js2=g('groupJoinSection');if(js2)js2.style.display='none';
  // başlık ve altbilgi gizle
  const hdrEl=document.querySelector('#noGroup .modal-title');if(hdrEl)hdrEl.style.opacity='.4';
  const subEl=document.querySelector('#noGroup .modal-sub');if(subEl)subEl.style.display='none';
}
function hideCreateGroup(){
  const b=g('createGroupBox');if(b)b.style.display='none';
  // katılma bölümünü tekrar göster
  const js2=g('groupJoinSection');if(js2)js2.style.display='';
  const hdrEl=document.querySelector('#noGroup .modal-title');if(hdrEl)hdrEl.style.opacity='';
  const subEl=document.querySelector('#noGroup .modal-sub');if(subEl)subEl.style.display='';
}
function createGroup(){
  const name=g('gName').value.trim(),desc=g('gDesc').value.trim(),cat=g('gCat').value;
  if(!name){toast('⚠️ Grup adı zorunludur.');return;}
  if(desc.length<20){toast('⚠️ Açıklama en az 20 karakter olmalıdır.');return;}
  if(!cat){toast('⚠️ Kategori seçiniz.');return;}
  hideCreateGroup();
  S.hasGroup=true;S.grpData={name,desc,cat,members:[{name:S.user.name,id:S.user.id,role:'founder',adminNum:0}],invites:[],msgs:[...DUMMY_MSGS],notes:[]};
  save();renderGroupState();toast('✅ Grup başarıyla oluşturuldu!');
}
function renderGroupList(){
  const list=g('groupList');if(!list)return;list.innerHTML='';
  const filtered=DUMMY_GROUPS.filter(gr=>{
    const catOk=S.grpCatFilter==='all'||(S.grpCatFilter==='Diğer'?gr.cat==='Diğer':gr.cat===S.grpCatFilter);
    const searchOk=!S.grpSearch||gr.n.toLowerCase().includes(S.grpSearch.toLowerCase())||gr.desc.toLowerCase().includes(S.grpSearch.toLowerCase());
    return catOk&&searchOk;
  });
  if(!filtered.length){list.innerHTML='<div style="opacity:.38;font-size:13px;grid-column:1/-1;padding:16px">Uygun grup bulunamadı.</div>';return;}
  filtered.forEach(gr=>{
    const c=document.createElement('div');c.className='note-card glass-card';c.style.cssText='cursor:default;animation:none;opacity:1';
    c.innerHTML='<h4 style="font-size:13px;margin-bottom:3px;color:var(--acc)">'+gr.n+'</h4><div style="font-size:11px;opacity:.5;margin-bottom:6px;line-height:1.4">'+gr.desc+'</div><div style="font-size:11px;opacity:.44;margin-bottom:9px">👥 '+gr.m+' üye · 🏷️ '+gr.cat+'</div>';
    const btn=document.createElement('button');btn.className='btn-primary';btn.style='width:100%;padding:8px;font-size:12px;margin:0';btn.textContent='Gruba Katıl';btn.onclick=()=>showJoinPanel(gr.id,gr.n,gr.desc,gr.m,gr.cat);c.appendChild(btn);
    list.appendChild(c);
  });
}
function filterGroups(q){S.grpSearch=q;renderGroupList();}
function filterGroupCat(cat,btn){S.grpCatFilter=cat;document.querySelectorAll('#gCatFilters .chip').forEach(c=>c.classList.remove('active'));if(btn)btn.classList.add('active');renderGroupList();}
function showJoinPanel(id,name,desc,members,cat){
  const jp=g('joinPanel');jp.style.display='flex';
  g('joinTitle').textContent=name;g('joinSubtitle').textContent='Kategori: '+cat+' · '+members+' aktif üye';
  g('joinDetails').innerHTML='<p style="font-size:13px;opacity:.75;line-height:1.6">'+desc+'</p><p style="font-size:12px;opacity:.5;margin-top:8px">Bu gruba katılarak üyelerle not paylaşabilir ve sohbet edebilirsiniz.</p>';
  g('joinOkBtn').onclick=()=>{
    confirm2({icon:'👥',title:'Gruba Katıl',msg:'"'+name+'" grubuna katılmak istiyor musunuz?',two:true,ok:'Evet',cancel:'Hayır',onOk:()=>{
      S.hasGroup=true;S.grpData={name,desc,cat,members:[{name:S.user.name,id:S.user.id,role:'member',adminNum:null},...DUMMY_MSGS.slice(0,5).map((m,i)=>({name:m.u,id:'uid'+i,role:'member',adminNum:null}))],invites:[],msgs:[...DUMMY_MSGS],notes:[]};
      closeJoin();save();renderGroupState();toast('✅ Gruba katıldınız!');
    }});
  };
}
function closeJoin(){const jp=g('joinPanel');if(jp)jp.style.display='none';}
function initGroupData(){
  if(!S.grpData)return;
  g('grpTitle').textContent=S.grpData.name;g('grpCatLbl').textContent=S.grpData.cat||'';
  renderMembers();renderInvites();renderGroupNotes();renderChatBox();g('memCount').textContent=(S.grpData.members||[]).length;
}
function renderMembers(){
  const ml=g('memList');if(!ml||!S.grpData)return;ml.innerHTML='';
  const me=S.grpData.members.find(x=>x.id===S.user.id);
  const isMeAdmin=me&&(me.role==='founder'||me.role==='admin');
  (S.grpData.members||[]).forEach(m=>{
    const isMe=m.id===S.user.id,isFounder=m.role==='founder';
    const adminLbl=m.role==='founder'?'Kurucu':m.role==='admin'?'Yönetici '+m.adminNum:'';
    const el=document.createElement('div');el.className='member-item';
    const nameSpan='<span style="font-size:12px;font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+m.name+(adminLbl?' <span class="tag adm">'+adminLbl+'</span>':'')+'</span>';
    const lvlInfo2=lvlInfo(Math.floor(Math.random()*80));
    const actionsHtml=(!isMe&&isMeAdmin&&!isFounder)?
      '<button class="promote-btn" onclick="event.stopPropagation();toggleAdmin(\''+m.id+'\')">'+(m.role==='admin'?'↓':'↑')+'</button><button class="kick-btn" onclick="event.stopPropagation();kickMember(\''+m.id+'\')">At</button>':'';
    el.innerHTML=nameSpan+'<div class="mem-actions">'+actionsHtml+'</div>';
    el.onclick=e=>{if(!e.target.closest('button'))showMemberCard(m,el);};
    ml.appendChild(el);
  });
}
function toggleAdmin(memberId){
  const m=S.grpData.members.find(x=>x.id===memberId);if(!m)return;
  const me=S.grpData.members.find(x=>x.id===S.user.id);
  if(!me||me.role==='member'){toast('⚠️ Bu işlem için yetkiniz yok.');return;}
  if(m.role==='admin'){m.role='member';m.adminNum=null;toast(m.name+' üye olarak güncellendi.');}
  else{m.role='admin';m.adminNum=S.grpAdminCounter++;toast(m.name+' yönetici yapıldı.');}
  renderMembers();
}
function kickMember(memberId){
  const m=S.grpData.members.find(x=>x.id===memberId);if(!m)return;
  confirm2({icon:'🚪',title:'Üyeyi At',msg:'"'+m.name+'" adlı üye gruptan çıkarılsın mı?',two:true,ok:'At',cancel:'İptal',onOk:()=>{S.grpData.members=S.grpData.members.filter(x=>x.id!==memberId);renderMembers();g('memCount').textContent=S.grpData.members.length;toast(m.name+' gruptan çıkarıldı.');}});
}
function showMemberCard(m,anchor){
  const mc=g('memberCard');if(!mc)return;
  const me=S.grpData.members.find(x=>x.id===S.user.id);
  const isMeAdmin=me&&(me.role==='founder'||me.role==='admin');
  const isFounder=m.role==='founder';const isMe=m.id===S.user.id;
  const fakeXP=Math.floor(Math.random()*120);const fakeL=lvlInfo(fakeXP);
  mc.innerHTML='<div style="font-weight:700;font-size:14px;margin-bottom:2px;color:var(--acc)">'+m.name+'</div>'+
    '<div style="font-size:10px;opacity:.4;margin-bottom:4px">'+m.id+'</div>'+
    '<div style="font-size:11px;margin-bottom:5px">Rol: <strong>'+(isFounder?'Kurucu':m.role==='admin'?'Yönetici '+m.adminNum:'Üye')+'</strong></div>'+
    '<div style="font-size:11px;opacity:.6;margin-bottom:8px">⭐ Seviye '+fakeL.lvl+' · '+fakeXP+' XP</div>'+
    '<div class="xp-track" style="height:4px;margin-bottom:9px"><div class="xp-fill" style="width:'+fakeL.pct+'%"></div></div>'+
    (!isMe&&isMeAdmin&&!isFounder?'<button class="promote-btn" style="width:100%;margin-bottom:5px;padding:6px;display:block" onclick="toggleAdmin(\''+m.id+'\');g(\'memberCard\').style.display=\'none\'">'+(m.role==='admin'?'Üye Yap':'Yönetici Yap')+'</button>':'  ')+
    (!isMe?'<button class="kick-btn" style="width:100%;padding:6px;display:block;margin-bottom:5px" onclick="reportMember(\''+m.name+'\')">🚩 Raporla</button>':'');
  const rect=anchor.getBoundingClientRect();
  mc.style.top=Math.min(rect.top,innerHeight-230)+'px';mc.style.left=Math.min(rect.right+8,innerWidth-210)+'px';mc.style.display='block';
}
function reportMember(name){g('memberCard').style.display='none';confirm2({icon:'🚩',title:'Kullanıcıyı Raporla',msg:'"'+name+'" adlı kullanıcı uygunsuz davranışı nedeniyle raporlansın mı?',two:true,ok:'Raporla',cancel:'İptal',onOk:()=>toast('🚩 '+name+' raporlandı. Teşekkürler!')});}
function renderInvites(){
  const il=g('invList');if(!il||!S.grpData)return;il.innerHTML='';const invites=S.grpData.invites||[];g('invCount').textContent=invites.length;
  if(!invites.length){il.innerHTML='<div style="opacity:.38;font-size:11px">Bekleyen davet yok.</div>';return;}
  invites.forEach((inv,i)=>{const el=document.createElement('div');el.style='font-size:12px;padding:5px 0;display:flex;justify-content:space-between;align-items:center';el.innerHTML='<span>'+inv+'</span><div><span style="color:#22c55e;cursor:pointer" onclick="acceptInvite('+i+')">✓</span><span style="color:#ef4444;cursor:pointer;margin-left:5px" onclick="rejectInvite('+i+')">✗</span></div>';il.appendChild(el);});
}
function openInviteModal(){openModal('inviteModal');const inp=g('inviteNameInput');if(inp)inp.value='';}
function submitInvite(){
  const name=(g('inviteNameInput').value||''). trim();
  if(!name){toast('⚠️ Kullanıcı adı giriniz.');return;}
  if(!S.grpData.invites)S.grpData.invites=[];
  S.grpData.invites.push(name);renderInvites();closeModal('inviteModal');
  toast('📨 '+name+' adlı kullanıcıya davet gönderildi.',3000);
}
function sendInvite(){openInviteModal();}
function acceptInvite(i){S.grpData.invites.splice(i,1);renderInvites();toast('✅ Davet kabul edildi.');}
function rejectInvite(i){S.grpData.invites.splice(i,1);renderInvites();toast('Davet reddedildi.');}
function renderGroupNotes(){
  const container=g('groupNotes');if(!container||!S.grpData)return;container.innerHTML='';const notes=S.grpData.notes||[];
  if(!notes.length){container.innerHTML='<div style="opacity:.38;padding:20px;text-align:center;font-size:13px">Henüz paylaşılan not yok.</div>';return;}
  notes.forEach(n=>{const el=document.createElement('div');el.className='shared-note';el.innerHTML='<span>📄 '+n.name+' <small style="opacity:.5">('+n.size+')</small></span><button onclick="downloadSharedNote(\''+n.name+'\')" style="background:none;border:none;cursor:pointer;font-size:13px;color:var(--acc);font-family:var(--font)">📥 İndir</button>';container.appendChild(el);});
}
function onGroupFile(e){
  const file=e.target.files[0];if(!file)return;
  confirm2({icon:'📄',title:'PDF Paylaş',msg:'"'+file.name+'" grupta paylaşılsın mı?',two:true,ok:'Paylaş',cancel:'Vazgeç',onOk:()=>{if(!S.grpData.notes)S.grpData.notes=[];S.grpData.notes.unshift({name:file.name,size:(file.size/1024).toFixed(0)+' KB'});renderGroupNotes();addXP(1);toast('✅ Not paylaşıldı!');}});
  e.target.value='';
}
function downloadSharedNote(name){const blob=new Blob([name+'\n\nBilgi kaynağım grup notu.\n\n─── bilgi kaynağım'],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href);toast('✅ Not indirildi!');}
function leaveGroup(){confirm2({icon:'🚪',title:'Gruptan Çık',msg:'Gruptan ayrılmak istediğinize emin misiniz?',two:true,ok:'Çık',cancel:'İptal',onOk:()=>{S.hasGroup=false;S.grpData=null;save();renderGroupState();toast('Gruptan ayrıldınız.');}});}
function reportGroup(){confirm2({icon:'🚩',title:'Grubu Raporla',msg:'Bu grup uygunsuz içerik barındırdığı için raporlansın mı?',two:true,ok:'Raporla',cancel:'İptal',onOk:()=>toast('🚩 Grup raporu iletildi.')});}

function renderChatBox(){
  const cb=g('chatBox');if(!cb||!S.grpData)return;cb.innerHTML='';
  (S.grpData.msgs||[]).slice(-20).forEach(m=>{const el=document.createElement('div');el.className='chat-msg'+(m.u===S.user.name?' own':'');el.innerHTML='<strong style="font-size:10px;opacity:.6;display:block;margin-bottom:3px">'+m.u+'</strong>'+(m.txt||m.text||'');cb.appendChild(el);});
  cb.scrollTop=cb.scrollHeight;
}
function buildChatQuick(){
  const qb=g('chatQuick');if(!qb||!S.grpData)return;qb.innerHTML='';
  const cat=S.grpData.cat||'default';
  const msgs=QUICK_MSGS_MAP[cat]||QUICK_MSGS_MAP['Diğer']||QUICK_MSGS_MAP['default'];
  msgs.forEach(qm=>{const b=document.createElement('button');b.className='qmsg';b.textContent=qm;b.onclick=()=>{const inp=g('chatInp');if(inp){inp.value=qm;}};qb.appendChild(b);});
}
function sendMsg(){
  const inp=g('chatInp');const txt=inp.value.trim();if(!txt)return;
  if(!S.grpData.msgs)S.grpData.msgs=[];S.grpData.msgs.push({u:S.user.name,txt});inp.value='';renderChatBox();addXP(1);
}
function showWhyMsg(){const ov=g('whyMsgOverlay');if(ov)ov.style.display='flex';}
function closeWhyMsg(){const ov=g('whyMsgOverlay');if(ov)ov.style.display='none';}
function showChatInfo(){g('chatInfoPopup').classList.add('show');}
function showChatInfoIfRestricted(){/* input is readonly, focus triggers info */showChatInfo();}
function initGTabs(){const line=g('gTabLine');const t1=g('gtab1');if(line&&t1)setTimeout(()=>{line.style.left=t1.offsetLeft+'px';line.style.width=t1.offsetWidth+'px';},50);}
function switchGTab(tab){
  S.grpTab=tab;const cp=g('gChatPanel'),np=g('gNotesPanel'),t1=g('gtab1'),t2=g('gtab2'),line=g('gTabLine');
  cp.classList.toggle('active',tab==='chat');np.classList.toggle('active',tab==='notes');
  t1.classList.toggle('active',tab==='chat');t2.classList.toggle('active',tab==='notes');
  if(line){const active=tab==='chat'?t1:t2;line.style.left=active.offsetLeft+'px';line.style.width=active.offsetWidth+'px';}
}
function openGroupNewTab(){toast('ℹ️ Geniş görünüm için pencereyi büyütebilirsiniz.');}

// ── INIT ────────────────────────────
window.onload=()=>{
  S.user=DEFAULT_USER();loadSession();
  try{const t=localStorage.getItem('bk_theme');if(t&&t.startsWith('theme-'))S.theme=t;}catch(e){}
  setTheme(S.theme,true);
  buildFilterPanel();
  buildFloatingScene();
  initParallax();
  initMouseParallax();
  initScrollReveal();
  checkUpdateBadge();
  document.addEventListener('click',globalClick);
  window.addEventListener('resize',()=>{if(innerWidth>768&&S.sbOpen)closeSidebar();resizeCanvas();});
};
