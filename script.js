// ======================== USER STATE ========================
let currentUser = {
    id: "USR-" + Math.floor(Math.random() * 90000 + 10000),
    name: "Ziyaretçi", level: 1, likes: 0, comments: 0,
    isLoggedIn: false, provider: null,
    lastNameChange: null, favorites: [], history: []
};

let hasGroup = false;
let isAnimPaused = false;
let currentGroupData = null;
let afkTimer = null;
let currentNote = null;
let currentCategoryKey = 'Öne Çıkanlar';
let activeFilters = {};          // { sortBy: 'likes', level: '5+', category: 'all' }
let filterPanelOpen = false;
let canvasAnimFrame = null;
let currentTheme = 'theme-ocean';
let currentTab = 'chat';

// ======================== FILTER OPTIONS ========================
const filterGroups = [
    {
        id: 'sortBy', label: 'SIRALAMA', multi: false,
        options: [
            { id: 'likes',       label: '❤️ En Çok Beğenilen' },
            { id: 'recommends',  label: '👍 En Çok Önerilen'  },
            { id: 'reads',       label: '📖 En Çok Okunan'    },
            { id: 'downloads',   label: '📥 En Çok İndirilen' },
            { id: 'newest',      label: '🆕 En Yeni'          },
            { id: 'oldest',      label: '🕰️ En Eski'         },
            { id: 'az',          label: '🔤 A → Z'            },
            { id: 'za',          label: '🔤 Z → A'            },
        ]
    },
    {
        id: 'level', label: 'YAZAR SEVİYESİ', multi: false,
        options: [
            { id: 'any',  label: '🌟 Tümü'       },
            { id: '1+',   label: '⭐ Seviye 1+'  },
            { id: '5+',   label: '🔥 Seviye 5+'  },
            { id: '10+',  label: '💎 Seviye 10+' },
        ]
    },
    {
        id: 'activity', label: 'AKTİVİTE', multi: true,
        options: [
            { id: 'commented',  label: '💬 Yorumlanan'     },
            { id: 'favorited',  label: '⭐ Favorilenen'    },
            { id: 'trending',   label: '📈 Trend'          },
            { id: 'pdf',        label: '📄 PDF Mevcut'     },
        ]
    }
];

// ======================== QUICK MESSAGES ========================
const quickMessages = [
    "YKS Matematik için not atabilir misiniz?","YKS Türkçe / Edebiyat için not paylaşabilir misiniz?",
    "YKS Fizik konularında not var mı?","YKS Kimya için özet not atabilir misiniz?",
    "YKS Biyoloji için not paylaşabilir misiniz?","YKS Tarih için not atabilir misiniz?",
    "YKS Coğrafya için not paylaşabilir misiniz?","YKS Felsefe için kaynak var mı?",
    "YKS YDT için not atabilir misiniz?","KPSS Genel Yetenek için not var mı?",
    "KPSS Genel Kültür notları atabilir misiniz?","KPSS Eğitim Bilimleri için not paylaşabilir misiniz?",
    "ALES Sayısal için çözümlü sorular paylaşabilir misiniz?","ALES Sözel için not atabilir misiniz?",
    "LGS 8. Sınıf Matematik için not var mı?","LGS Fen Bilimleri için özet paylaşabilir misiniz?",
    "LGS Türkçe için not atabilir misiniz?","YDS İngilizce için kaynak paylaşır mısınız?",
    "TUS Temel Bilimler için not var mı?","TUS Klinik Bilimler notları atabilir misiniz?",
    "DGS Matematik için soru bankası var mı?","Hakimlik için not paylaşabilir misiniz?",
    "MSÜ sınavı için not atabilir misiniz?","12. Sınıf Edebiyat için özet not var mı?",
    "12. Sınıf Matematik için not paylaşabilir misiniz?","11. Sınıf Fizik için formüller paylaşabilir misiniz?",
    "11. Sınıf Kimya için not atabilir misiniz?","10. Sınıf Tarih notlarını paylaşabilir misiniz?",
    "9. Sınıf Biyoloji için kaynak var mı?","8. Sınıf İnkılap Tarihi için not atabilir misiniz?",
    "7. Sınıf Fen Bilimleri için not paylaşabilir misiniz?","6. Sınıf Matematik için not atabilir misiniz?",
    "5. Sınıf Türkçe için not paylaşabilir misiniz?","5. Sınıf Sosyal Bilgiler için kaynak var mı?",
    "Sınavda başarılar dilerim! 🎯","Bu hafta çalışma planı yapıyor musunuz?",
    "Soru bankası paylaşabilir misiniz?","Konu özetleri paylaşabilir misiniz?",
    "Deneme sınavı sonuçlarınız nasıl?","Birlikte çalışma seansı düzenleyelim mi?"
];

const recOptions = {
    up:   ["Anlaşılır ve net.","Sınav müfredatına tam uyumlu.","Özet ve pratik bilgiler içeriyor.","Görsel hafızaya hitap ediyor."],
    down: ["Konu anlatımı yetersiz.","Müfredat dışı bilgiler var.","Çok karmaşık ve uzun.","Hatalı bilgi içeriyor."]
};

// ======================== DATABASE ========================
const categories = [
    'YKS Matematik','YKS Türkçe','YKS Fizik','YKS Kimya','YKS Biyoloji','YKS Tarih','YKS Coğrafya','YKS Felsefe','YKS YDT',
    'KPSS Genel Yetenek','KPSS Genel Kültür','KPSS Eğitim Bilimleri','KPSS ÖABT',
    'LGS Matematik','LGS Fen Bilimleri','LGS Türkçe','LGS İnkılap','LGS İngilizce',
    'ALES Sayısal','ALES Sözel','ALES Eşit Ağırlık','DGS Matematik','DGS Türkçe',
    'YDS İngilizce','YDS Almanca','YÖKDİL Sağlık','YÖKDİL Sosyal','YÖKDİL Fen',
    'TUS Temel Bilimler','TUS Klinik Bilimler','DUS Diş Hekimliği',
    'Hakimlik Adli Yargı','Hakimlik İdari Yargı',
    'MSÜ Sayısal','MSÜ Eşit Ağırlık','MSÜ Sözel',
    'EKPSS','YÖS','İSG','GYS',
    '12. Sınıf Edebiyat','12. Sınıf Matematik','12. Sınıf Fizik','12. Sınıf Kimya','12. Sınıf Biyoloji','12. Sınıf İnkılap','12. Sınıf İngilizce','12. Sınıf Din Kültürü',
    '11. Sınıf Edebiyat','11. Sınıf Matematik','11. Sınıf Fizik','11. Sınıf Kimya','11. Sınıf Biyoloji','11. Sınıf Tarih','11. Sınıf Coğrafya','11. Sınıf Felsefe','11. Sınıf İngilizce',
    '10. Sınıf Edebiyat','10. Sınıf Matematik','10. Sınıf Fizik','10. Sınıf Kimya','10. Sınıf Biyoloji','10. Sınıf Tarih','10. Sınıf Coğrafya','10. Sınıf Felsefe',
    '9. Sınıf Edebiyat','9. Sınıf Matematik','9. Sınıf Fizik','9. Sınıf Kimya','9. Sınıf Biyoloji','9. Sınıf Tarih','9. Sınıf Coğrafya',
    '8. Sınıf Türkçe','8. Sınıf Matematik','8. Sınıf Fen Bilimleri','8. Sınıf İnkılap','8. Sınıf İngilizce','8. Sınıf Din Kültürü',
    '7. Sınıf Türkçe','7. Sınıf Matematik','7. Sınıf Fen Bilimleri','7. Sınıf Sosyal Bilgiler','7. Sınıf İngilizce',
    '6. Sınıf Türkçe','6. Sınıf Matematik','6. Sınıf Fen Bilimleri','6. Sınıf Sosyal Bilgiler',
    '5. Sınıf Türkçe','5. Sınıf Matematik','5. Sınıf Fen Bilimleri','5. Sınıf Sosyal Bilgiler'
];

const db = { 'Öne Çıkanlar': [], 'Sınav Önerileri': [] };
categories.forEach(cat => db[cat] = []);

function createDummyNote(id, cat) {
    const likes = Math.floor(Math.random()*150);
    const lvl = Math.floor(likes/10)+1;
    return {
        id: cat.replace(/\s/g,'')+id,
        t: `${cat} İçeriği ${id}`,
        desc: 'Bu not kullanıcı tarafından paylaşılmıştır. İçeriğin tamamına PDF veya TXT olarak indirerek ulaşabilirsiniz.',
        u: `Yazar${id}`, lvl, likes,
        recommends: Math.floor(likes*0.8),
        unRecommends: Math.floor(likes*0.1),
        reads: Math.floor(Math.random()*300),
        downloads: Math.floor(Math.random()*200),
        createdAt: Date.now() - Math.floor(Math.random()*1e10),
        comments: [],
        hasPdf: Math.random()>0.5,
        trending: Math.random()>0.65
    };
}

for(let i=1;i<=50;i++) db['Öne Çıkanlar'].push(createDummyNote(i,'Öne Çıkanlar'));
for(const cat of categories) for(let i=1;i<=20;i++) db[cat].push(createDummyNote(i,cat));
for(let i=1;i<=10;i++) db['Sınav Önerileri'].push({
    id:'s'+i, u:`Rehber${i}`,
    t:`${categories[Math.floor(Math.random()*categories.length)]} taktiği: Düzenli soru çözümü hızlandırır.`,
    likes:Math.floor(Math.random()*100), dislikes:Math.floor(Math.random()*10)
});
db['Öne Çıkanlar'].sort((a,b)=>b.likes-a.likes);

let allNotes = [];
function buildAllNotes() {
    allNotes = [];
    for(const cat in db) {
        if(cat==='Sınav Önerileri') continue;
        db[cat].forEach(n => allNotes.push({...n, _cat: cat}));
    }
}

const countdowns = [
    {n:'YKS',d:110,icon:'🎓'},{n:'KPSS',d:145,icon:'🏛️'},{n:'LGS',d:80,icon:'📚'},
    {n:'ALES',d:40,icon:'🧠'},{n:'DGS',d:95,icon:'🔄'},{n:'YDS/YÖKDİL',d:60,icon:'🌍'},
    {n:'TUS/DUS',d:55,icon:'⚕️'},{n:'HAKİMLİK',d:120,icon:'⚖️'},{n:'MSÜ',d:25,icon:'🛡️'},
    {n:'EKPSS',d:45,icon:'♿'},{n:'YÖS',d:70,icon:'🌐'},{n:'İSG',d:50,icon:'🦺'},{n:'GYS',d:160,icon:'📋'}
];

// ======================== CANVAS THEMES ========================
const canvasThemes = ['theme-ice','theme-sage','theme-lavender','theme-mint','theme-sand','theme-slate','theme-peach','theme-glass'];
const canvasStyles = {
    // Çizgi temaları: çok yavaş, yatay ağırlıklı hareket
    'theme-ice':      { type:'lines',     color:'rgba(119,141,169,', count:14, speed:0.12, horizontal:true  },
    'theme-sage':     { type:'waves',     color:'rgba(139,158,144,', count:8,  speed:0.28                   },
    'theme-lavender': { type:'particles', color:'rgba(154,139,186,', count:28, speed:0.20                   },
    'theme-mint':     { type:'waves',     color:'rgba(95,184,174,',  count:9,  speed:0.26                   },
    'theme-sand':     { type:'lines',     color:'rgba(181,169,142,', count:10, speed:0.10, horizontal:true  },
    'theme-slate':    { type:'dots',      color:'rgba(130,143,166,', count:42, speed:0.14                   },
    'theme-peach':    { type:'particles', color:'rgba(186,140,145,', count:26, speed:0.18                   },
    // Cam teması: sadece yumuşak yüzen orb'lar (çizgi yok)
    'theme-glass':    { type:'orbs',      color:null,                count:6,  speed:0.18                   },
};

function startThemeCanvas(themeName) {
    if(canvasAnimFrame) { cancelAnimationFrame(canvasAnimFrame); canvasAnimFrame=null; }

    const canvas = document.getElementById('themeCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const style = canvasStyles[themeName];
    if(!style) { stopThemeCanvas(); return; }

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.setAttribute('data-canvas','1');

    let particles = [], lines = [], t = 0;

    if(style.type === 'lines') {
        // Yatay ağırlıklı, çok yavaş çizgiler
        for(let i=0; i<style.count; i++) {
            // vx dominant, vy minor → yatay kayma
            const hSpeed = style.speed * (0.6 + Math.random()*0.5);
            const vSpeed = style.speed * 0.12 * (Math.random()-0.5);
            lines.push({
                x: Math.random()*canvas.width, y: Math.random()*canvas.height,
                vx: (Math.random()>0.5?1:-1) * hSpeed,
                vy: vSpeed,
                len: 80 + Math.random()*140,
                // açı yatay yakın: -15° to +15°
                angle: (Math.random()-0.5) * 0.26,
                va: (Math.random()-0.5)*0.0008,   // çok az döner
                alpha: 0.04 + Math.random()*0.09
            });
        }
        const drawLines = () => {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            lines.forEach(l => {
                l.x += l.vx; l.y += l.vy; l.angle += l.va;
                // wrap
                if(l.x < -250) l.x = canvas.width+250;
                if(l.x > canvas.width+250) l.x = -250;
                if(l.y < -100) l.y = canvas.height+100;
                if(l.y > canvas.height+100) l.y = -100;
                const x2 = l.x + Math.cos(l.angle)*l.len;
                const y2 = l.y + Math.sin(l.angle)*l.len;
                const grad = ctx.createLinearGradient(l.x,l.y,x2,y2);
                grad.addColorStop(0,   style.color+'0)');
                grad.addColorStop(0.5, style.color+l.alpha+')');
                grad.addColorStop(1,   style.color+'0)');
                ctx.beginPath(); ctx.strokeStyle=grad; ctx.lineWidth=1.0;
                ctx.moveTo(l.x,l.y); ctx.lineTo(x2,y2); ctx.stroke();
            });
            if(!isAnimPaused) canvasAnimFrame = requestAnimationFrame(drawLines);
        };
        drawLines();

    } else if(style.type === 'waves') {
        const drawWaves = () => {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            for(let w=0; w<style.count; w++) {
                const freq  = 0.0022 + w*0.0005;
                const amp   = 16 + w*12;
                const spd   = style.speed * 0.005 + w*0.0015;
                const yBase = (canvas.height/(style.count+1))*(w+1);
                const alpha = 0.032 + w*0.010;
                ctx.beginPath();
                ctx.strokeStyle = style.color+alpha+')';
                ctx.lineWidth = 1.3;
                for(let x=0; x<=canvas.width; x+=5) {
                    const y = yBase + Math.sin(x*freq + t*spd + w*0.7)*amp
                                    + Math.sin(x*freq*1.8 + t*spd*0.4)*amp*0.25;
                    x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
                }
                ctx.stroke();
            }
            t++;
            if(!isAnimPaused) canvasAnimFrame = requestAnimationFrame(drawWaves);
        };
        drawWaves();

    } else if(style.type === 'particles') {
        for(let i=0; i<style.count; i++) {
            particles.push({
                x:Math.random()*canvas.width, y:Math.random()*canvas.height,
                r:1.3+Math.random()*2.5,
                vx:(Math.random()-0.5)*style.speed, vy:(Math.random()-0.5)*style.speed,
                alpha:0.04+Math.random()*0.11, pulse:Math.random()*Math.PI*2
            });
        }
        const drawParticles = () => {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            particles.forEach(p => {
                p.x+=p.vx; p.y+=p.vy; p.pulse+=0.015;
                if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0;
                if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0;
                const a=p.alpha*(0.7+0.3*Math.sin(p.pulse));
                ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
                ctx.fillStyle=style.color+a+')'; ctx.fill();
            });
            for(let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++){
                const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
                const dist=Math.sqrt(dx*dx+dy*dy);
                if(dist<100){
                    ctx.beginPath();
                    ctx.strokeStyle=style.color+(0.030*(1-dist/100))+')';
                    ctx.lineWidth=0.6;
                    ctx.moveTo(particles[i].x,particles[i].y);
                    ctx.lineTo(particles[j].x,particles[j].y);
                    ctx.stroke();
                }
            }
            if(!isAnimPaused) canvasAnimFrame=requestAnimationFrame(drawParticles);
        };
        drawParticles();

    } else if(style.type === 'dots') {
        for(let i=0;i<style.count;i++) {
            particles.push({
                x:Math.random()*canvas.width, y:Math.random()*canvas.height,
                r:0.7+Math.random()*1.6,
                vx:(Math.random()-0.5)*style.speed, vy:(Math.random()-0.5)*style.speed,
                alpha:0.04+Math.random()*0.08
            });
        }
        const drawDots = () => {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            particles.forEach(p => {
                p.x+=p.vx; p.y+=p.vy;
                if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0;
                if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0;
                ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
                ctx.fillStyle=style.color+p.alpha+')'; ctx.fill();
            });
            if(!isAnimPaused) canvasAnimFrame=requestAnimationFrame(drawDots);
        };
        drawDots();

    } else if(style.type === 'orbs') {
        // Cam teması: blob'lardan bağımsız yumuşak renkli orb'lar
        const orbColors = [
            [124,58,237],   // violet
            [147,51,234],   // purple
            [219,39,119],   // pink
            [59,130,246],   // blue
            [168,85,247],   // purple-light
            [236,72,153],   // rose
        ];
        for(let i=0;i<style.count;i++){
            const col = orbColors[i % orbColors.length];
            particles.push({
                x:Math.random()*canvas.width,
                y:Math.random()*canvas.height,
                r: 70+Math.random()*130,
                vx:(Math.random()-0.5)*style.speed*0.6,
                vy:(Math.random()-0.5)*style.speed*0.6,
                alpha:0.04+Math.random()*0.06,
                pulse:Math.random()*Math.PI*2,
                col
            });
        }
        const drawOrbs = () => {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            particles.forEach(p => {
                p.x+=p.vx; p.y+=p.vy; p.pulse+=0.008;
                if(p.x < -p.r) p.x=canvas.width+p.r; if(p.x > canvas.width+p.r) p.x=-p.r;
                if(p.y < -p.r) p.y=canvas.height+p.r; if(p.y > canvas.height+p.r) p.y=-p.r;
                const a = p.alpha*(0.8+0.2*Math.sin(p.pulse));
                const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
                grad.addColorStop(0,   `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${a})`);
                grad.addColorStop(0.6, `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${a*0.4})`);
                grad.addColorStop(1,   `rgba(${p.col[0]},${p.col[1]},${p.col[2]},0)`);
                ctx.beginPath();
                ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
                ctx.fillStyle=grad; ctx.fill();
            });
            if(!isAnimPaused) canvasAnimFrame=requestAnimationFrame(drawOrbs);
        };
        drawOrbs();
    }
}

function stopThemeCanvas() {
    if(canvasAnimFrame){ cancelAnimationFrame(canvasAnimFrame); canvasAnimFrame=null; }
    document.body.removeAttribute('data-canvas');
    const canvas=document.getElementById('themeCanvas');
    if(canvas){ const ctx=canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height); }
}

// ======================== INIT ========================
window.onload = () => {
    resetAfkTimer();
    document.addEventListener('mousemove', resetAfkTimer);
    document.addEventListener('keydown', resetAfkTimer);
    document.getElementById('profIdDisplay').innerText = `ID: ${currentUser.id}`;
    buildAllNotes();
    populateUploadCategories();
    buildFilterChips();
    renderGroupState();
    renderCards();
    setTheme('theme-ocean');
    window.addEventListener('resize', () => {
        const canvas=document.getElementById('themeCanvas');
        if(canvas){ canvas.width=window.innerWidth; canvas.height=window.innerHeight; }
    });
};

// ======================== THEME ========================
function setTheme(t) {
    currentTheme = t;
    document.getElementById('masterBody').className = t || '';
    if(canvasThemes.includes(t)) startThemeCanvas(t);
    else stopThemeCanvas();
}

// ======================== PAUSE / PLAY BUTTON (fixed) ========================
function toggleBackgroundAnimation() {
    isAnimPaused = !isAnimPaused;
    const btn = document.getElementById('playPauseBtn');

    // Blobs
    document.querySelectorAll('.blob').forEach(b => {
        b.style.animationPlayState = isAnimPaused ? 'paused' : 'running';
    });

    if(isAnimPaused) {
        // Stop canvas loop
        if(canvasAnimFrame){ cancelAnimationFrame(canvasAnimFrame); canvasAnimFrame=null; }
        btn.innerText = '▶️';
    } else {
        btn.innerText = '⏸️';
        // Restart canvas loop if canvas theme is active
        if(canvasThemes.includes(currentTheme)) {
            startThemeCanvas(currentTheme);
        }
    }
}

// ======================== LOGIN GUARD ========================
function checkLoginRequired(action) {
    if(!currentUser.isLoggedIn){ showLoginToast(); return false; }
    if(typeof action==='function') action();
    return true;
}
function showLoginToast() {
    const toast=document.getElementById('loginToast');
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'), 4000);
}
function hideLoginToast(){ document.getElementById('loginToast').classList.remove('show'); }

// ======================== CUSTOM CONFIRM ========================
function showConfirm(opts) {
    const overlay = document.getElementById('customConfirm');
    document.getElementById('confirmIcon').innerText  = opts.icon  || '⚠️';
    document.getElementById('confirmTitle').innerText = opts.title || 'Bilgi';
    document.getElementById('confirmMsg').innerText   = opts.msg   || '';

    const btns = document.getElementById('confirmBtns');
    btns.innerHTML = '';

    if(opts.twoBtn) {
        // Geri dönüşsüz işlemler: iki buton
        const okBtn = document.createElement('button');
        okBtn.className = 'btn-main';
        okBtn.style.cssText = opts.okStyle || 'flex:1;background:rgba(239,68,68,0.2);border:1px solid #ef4444;color:#ef4444;border-radius:9px;font-weight:bold;cursor:pointer;padding:10px 18px;';
        okBtn.innerText = opts.okText || 'Evet, Devam Et';
        okBtn.onclick = () => { overlay.classList.remove('show'); if(opts.onOk) opts.onOk(); };

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-main';
        cancelBtn.style.cssText = 'flex:1;background:rgba(255,255,255,0.06);border:1px solid var(--glass-border);color:var(--text);border-radius:9px;font-weight:bold;cursor:pointer;padding:10px 18px;';
        cancelBtn.innerText = opts.cancelText || 'İptal';
        cancelBtn.onclick = () => { overlay.classList.remove('show'); if(opts.onCancel) opts.onCancel(); };

        btns.appendChild(okBtn);
        btns.appendChild(cancelBtn);
    } else {
        // Bilgi / onay mesajları: tek "Anladım" butonu ortada
        const okBtn = document.createElement('button');
        okBtn.className = 'btn-main';
        okBtn.style.cssText = (opts.okStyle || 'background:rgba(96,165,250,0.18);border:1px solid var(--accent);color:var(--accent);') + ';min-width:160px;margin:0 auto;border-radius:9px;font-weight:bold;cursor:pointer;padding:11px 32px;display:block;';
        okBtn.innerText = opts.okText || 'Anladım';
        okBtn.onclick = () => { overlay.classList.remove('show'); if(opts.onOk) opts.onOk(); };
        btns.style.justifyContent = 'center';
        btns.appendChild(okBtn);
    }

    overlay.classList.add('show');
}

// ======================== MODALS ========================
function toggleModal(id, show) {
    const modal=document.getElementById(id);
    if(!modal) return;
    if(show){
        modal.classList.add('active');
        if(id==='profileModal') updateProfileUI();
        if(id==='favModal')     renderFavorites();
        if(id==='classModal')   renderGroupState();
    } else {
        modal.classList.remove('active');
    }
}

// ======================== HERO ========================
function closeHero(){ const h=document.getElementById('welcomeHero'); if(h) h.style.display='none'; }

// ======================== BUG REPORT ========================
function submitBugReport(){
    const cat=document.getElementById('bugCategory').value;
    const text=document.getElementById('bugText').value.trim();
    if(!cat){showConfirm({icon:'⚠️',title:'Kategori Seçin',msg:'Lütfen bir hata kategorisi seçiniz.'});return;}
    document.getElementById('bugCategory').value='';
    document.getElementById('bugText').value='';
    toggleModal('bugModal',false);
    showConfirm({icon:'🐛',title:'Hata Bildirimi Alındı',msg:'Hata raporunuz ekibimize iletildi. Katkınız için teşekkürler!'});
}

// ======================== SIDEBAR TOGGLE ========================
function toggleSub(id, header) {
    const menu = document.getElementById(id);
    if(!menu) return;
    const isOpen = menu.classList.contains('open');
    if(!isOpen) {
        // Açılış: 0.7s
        menu.style.transition = 'max-height 0.7s cubic-bezier(0.16,1,0.3,1)';
    } else {
        // Kapanış: 0.8s
        menu.style.transition = 'max-height 0.8s cubic-bezier(0.16,1,0.3,1)';
    }
    menu.classList.toggle('open', !isOpen);
    header.setAttribute('data-open', isOpen ? '0' : '1');
}

// ======================== CATEGORY ========================
function loadCategory(cat) {
    currentCategoryKey = cat;
    document.getElementById('catTitle').innerText = cat;
    clearSearch();
    switchView('vitrin');
    renderCards();
}

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = document.getElementById(viewId);
    if(el) el.classList.add('active');

    // Arama/filtre sadece not viewlarında görünsün
    const hideSearchOn = ['countdownsView','suggestionsView','leaderboardView','notDetay'];
    const sfBar = document.getElementById('searchFilterBar');
    const fpanel = document.getElementById('filterPanel');
    if(sfBar){
        if(hideSearchOn.includes(viewId)){
            sfBar.style.display='none';
            if(fpanel){ fpanel.classList.remove('open'); filterPanelOpen=false; }
        } else {
            sfBar.style.display='flex';
        }
    }
}

// ======================== SEARCH ========================
let searchTimeout = null;
function onSearchInput(val) {
    const clear = document.getElementById('searchClear');
    clear.classList.toggle('visible', val.length > 0);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(()=>performSearch(val), 90);
}
function clearSearch() {
    const inp = document.getElementById('globalSearchInput');
    if(inp) inp.value = '';
    const clear = document.getElementById('searchClear');
    if(clear) clear.classList.remove('visible');
    document.getElementById('catTitle').innerText = currentCategoryKey;
    renderCards();
}
function performSearch(query) {
    if(!query.trim()){ renderCards(); return; }
    const q = query.toLowerCase().trim();
    const results = allNotes.filter(n =>
        n.t.toLowerCase().includes(q) ||
        n.u.toLowerCase().includes(q) ||
        n._cat.toLowerCase().includes(q)
    );
    document.getElementById('catTitle').innerText = `"${query}" — ${results.length} sonuç`;
    renderCardList(applyFilters(results), true);
}

// ======================== FILTERS ========================
function buildFilterChips() {
    const container = document.getElementById('filterChips');
    if(!container) return;
    container.innerHTML = '';

    filterGroups.forEach(group => {
        const section = document.createElement('div');
        section.className = 'filter-section';
        section.innerHTML = `<div class="filter-section-title">${group.label}</div>`;
        const chips = document.createElement('div');
        chips.className = 'filter-chips';
        group.options.forEach(opt => {
            const chip = document.createElement('div');
            chip.className = 'filter-chip';
            chip.id = `chip-${group.id}-${opt.id}`;
            chip.innerText = opt.label;
            chip.onclick = ()=>toggleFilter(group, opt.id, chip);
            chips.appendChild(chip);
        });
        section.appendChild(chips);
        container.appendChild(section);
    });
}

function toggleFilter(group, optId, chip) {
    if(group.multi) {
        // Toggle this option in an array
        if(!activeFilters[group.id]) activeFilters[group.id] = new Set();
        if(activeFilters[group.id].has(optId)){
            activeFilters[group.id].delete(optId);
            chip.classList.remove('selected');
        } else {
            activeFilters[group.id].add(optId);
            chip.classList.add('selected');
        }
    } else {
        // Single-select: deselect all others in group
        group.options.forEach(o => {
            const c = document.getElementById(`chip-${group.id}-${o.id}`);
            if(c) c.classList.remove('selected');
        });
        if(activeFilters[group.id] === optId) {
            delete activeFilters[group.id];   // toggle off
        } else {
            activeFilters[group.id] = optId;
            chip.classList.add('selected');
        }
    }
    updateFilterBadge();
    renderCards();
}

function updateFilterBadge() {
    const badge = document.getElementById('filterBadge');
    if(!badge) return;
    let count = 0;
    for(const k in activeFilters) {
        const v = activeFilters[k];
        if(v instanceof Set) count += v.size;
        else if(v) count++;
    }
    if(count > 0){ badge.innerText=count; badge.classList.add('show'); }
    else badge.classList.remove('show');
}

function applyFilters(items) {
    let arr = [...items];

    // Activity filters (multi)
    const activity = activeFilters['activity'];
    if(activity instanceof Set && activity.size > 0) {
        arr = arr.filter(n => {
            if(activity.has('commented') && (!n.comments||n.comments.length===0)) return false;
            if(activity.has('pdf') && !n.hasPdf) return false;
            if(activity.has('trending') && !n.trending) return false;
            return true;
        });
    }

    // Level filter
    const lvlFilter = activeFilters['level'];
    if(lvlFilter && lvlFilter !== 'any') {
        const minLvl = parseInt(lvlFilter);
        arr = arr.filter(n => (n.lvl||1) >= minLvl);
    }

    // Sort
    const sort = activeFilters['sortBy'];
    if(sort==='likes')      arr.sort((a,b)=>b.likes-a.likes);
    else if(sort==='recommends') arr.sort((a,b)=>b.recommends-a.recommends);
    else if(sort==='reads') arr.sort((a,b)=>(b.reads||0)-(a.reads||0));
    else if(sort==='downloads') arr.sort((a,b)=>(b.downloads||0)-(a.downloads||0));
    else if(sort==='newest') arr.sort((a,b)=>b.createdAt-a.createdAt);
    else if(sort==='oldest') arr.sort((a,b)=>a.createdAt-b.createdAt);
    else if(sort==='az')    arr.sort((a,b)=>a.t.localeCompare(b.t,'tr'));
    else if(sort==='za')    arr.sort((a,b)=>b.t.localeCompare(a.t,'tr'));

    return arr;
}

function toggleFilterPanel() {
    filterPanelOpen = !filterPanelOpen;
    const panel = document.getElementById('filterPanel');
    const btn   = document.getElementById('filterToggleBtn');
    panel.classList.toggle('open', filterPanelOpen);
    btn.classList.toggle('active', filterPanelOpen);
}

// ======================== POPULATE UPLOAD CATEGORIES ========================
function populateUploadCategories() {
    const select = document.getElementById('upCategory');
    if(!select) return;
    select.innerHTML = '<option value="">Kategori Seçiniz</option>';
    categories.forEach(c => { select.innerHTML += `<option value="${c}">${c}</option>`; });
}

// ======================== LEVEL / XP ========================
function getLevelInfo(likes) {
    let lvl = 1, max = 10;
    if(likes>=200){ lvl=Math.floor(likes/20); max=(lvl+1)*20; }
    else if(likes>=50){ lvl=Math.floor(likes/10); max=(lvl+1)*10; }
    else if(likes>=20){ lvl=3; max=50; }
    else if(likes>=10){ lvl=2; max=20; }
    return { lvl: Math.max(1,lvl), percent: Math.min((likes/(max||10))*100,100), max };
}
function calculateLevel(){ currentUser.level = getLevelInfo(currentUser.likes).lvl; }

function getBadges() {
    const b=[];
    if(currentUser.likes>=10)   b.push({icon:'⭐',label:'Aktif Üye',cls:'accent'});
    if(currentUser.likes>=50)   b.push({icon:'🔥',label:'Haftanın En İyi Not Yükleyeni',cls:'gold'});
    if(currentUser.comments>=5) b.push({icon:'💬',label:'Değerlendirici',cls:'accent'});
    if(currentUser.level>=5)    b.push({icon:'🎓',label:'Doğrulanmış Eğitmen Rozeti',cls:'gold'});
    return b;
}

// ======================== RENDER CARDS ========================
function renderCards() {
    const raw = db[currentCategoryKey] || [];
    renderCardList(applyFilters(raw), false);
}

function renderCardList(items, isSearch) {
    const grid = document.getElementById('mainGrid');
    if(!grid) return;
    grid.innerHTML = '';
    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${Math.min(index*0.03, 0.45)}s`;
        const lInfo = getLevelInfo(item.likes);
        const glowCls = lInfo.lvl>=50?'lvl-glow-50':(lInfo.lvl>=20?'lvl-glow-20':(lInfo.lvl>=10?'lvl-glow-10':''));
        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:11px;opacity:0.52;font-style:italic;">@${item.u}</span>
            <div class="lvl-circular ${glowCls}"
                 style="width:30px;height:30px;background:conic-gradient(var(--gold) ${lInfo.percent}%,rgba(255,255,255,0.08) 0deg);"
                 title="Seviye ${lInfo.lvl}">
              <div class="lvl-inner" style="width:22px;height:22px;font-size:9px;">${lInfo.lvl}</div>
            </div>
          </div>
          <h3 style="font-size:14px;line-height:1.4;margin-top:3px;">${item.t}</h3>
          ${isSearch?`<div style="font-size:10px;opacity:0.38;margin-top:2px;">${item._cat||''}</div>`:''}
          <div style="font-size:11px;opacity:0.5;margin-top:4px;">${item.recommends} önerdi · ${item.reads||0} okudu · ${item.downloads||0} indirdi</div>
          ${item.hasPdf?'<span style="font-size:10px;opacity:0.55;">📄 PDF</span>':''}
          ${item.trending?'<span style="font-size:10px;opacity:0.55;">📈 Trend</span>':''}
        `;
        card.onclick = ()=>openDoc(item);
        attachTiltEffect(card);
        grid.appendChild(card);
    });
}

// ======================== TILT EFFECT ========================
function attachTiltEffect(card) {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX-rect.left, y = e.clientY-rect.top;
        const rx = ((y-rect.height/2)/rect.height)*-8;
        const ry = ((x-rect.width/2)/rect.width)*8;
        card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.035) translateY(-3px)`;
        card.style.transition = 'transform 0.08s ease';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s var(--ease-soft)';
    });
}

// ======================== COUNTDOWNS (no search bar) ========================
function openCountdownsView() {
    switchView('countdownsView');
    const grid = document.getElementById('countdownsGrid');
    grid.innerHTML = '';
    countdowns.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card glass-card';
        card.style.animationDelay = `${index*0.04}s`;
        card.innerHTML = `
          <div style="font-size:28px;margin-bottom:4px;">${item.icon}</div>
          <h3 style="color:var(--accent);font-size:20px;margin:4px 0;">${item.n}</h3>
          <div style="font-weight:700;font-size:16px;">${item.d} Gün Kaldı</div>
          <div style="font-size:11px;opacity:0.45;margin-top:4px;">Tahmini süre</div>
        `;
        grid.appendChild(card);
    });
}

// ======================== SUGGESTIONS ========================
function openSuggestionsView() {
    switchView('suggestionsView');
    const grid = document.getElementById('suggestionsGrid');
    grid.innerHTML = '';
    db['Sınav Önerileri'].forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card glass-card';
        card.style.animationDelay = `${index*0.04}s`;
        card.innerHTML = `
          <div style="font-size:11px;opacity:0.5;font-style:italic;">@${item.u}</div>
          <p style="font-size:14px;margin:8px 0;line-height:1.55;">${item.t}</p>
          <div style="display:flex;gap:12px;font-size:13px;opacity:0.75;">
            <span style="cursor:pointer;" onclick="event.stopPropagation();likeSugg(this,'${item.id}','up')">👍 ${item.likes}</span>
            <span style="cursor:pointer;" onclick="event.stopPropagation();likeSugg(this,'${item.id}','down')">👎 ${item.dislikes}</span>
          </div>
        `;
        grid.appendChild(card);
    });
}
function likeSugg(el,id,type){
    if(!checkLoginRequired()) return;
    const item=db['Sınav Önerileri'].find(s=>s.id==id);
    if(item){ if(type==='up'){item.likes++;el.innerText=`👍 ${item.likes}`;}else{item.dislikes++;el.innerText=`👎 ${item.dislikes}`;} }
}

// ======================== LEADERBOARD (no search/filter) ========================
function openLeaderboardView() {
    switchView('leaderboardView');
    const container = document.getElementById('leaderboardContainer');
    container.innerHTML = '';

    const uploaderMap={};
    allNotes.forEach(n=>{ uploaderMap[n.u]=(uploaderMap[n.u]||0)+n.likes; });
    const topUploaders=Object.entries(uploaderMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const topNotes=[...allNotes].sort((a,b)=>b.recommends-a.recommends).slice(0,5);
    const topDownloads=[...allNotes].sort((a,b)=>(b.downloads||0)-(a.downloads||0)).slice(0,5);

    const sections=[
        { title:'🏆 Haftanın En İyi Not Yükleyenleri', rows: topUploaders.map(([u,likes],i)=>({rank:i+1,name:'@'+u,sub:likes+' toplam beğeni',val:likes})) },
        { title:'⭐ En Çok Önerilen Notlar',           rows: topNotes.map((n,i)=>({rank:i+1,name:n.t,sub:'@'+n.u+' · '+n._cat,val:n.recommends+' öneri'})) },
        { title:'📥 En Çok İndirilen Notlar',          rows: topDownloads.map((n,i)=>({rank:i+1,name:n.t,sub:'@'+n.u,val:(n.downloads||0)+' indirme'})) },
    ];

    sections.forEach(sec=>{
        const wrap=document.createElement('div');
        wrap.className='leaderboard-section';
        wrap.innerHTML=`<h2>${sec.title}</h2>`;
        sec.rows.forEach((row,i)=>{
            const rankTxt=i===0?'🥇':i===1?'🥈':i===2?'🥉':(row.rank+'.');
            const rankCls=i===0?'first':i===1?'second':i===2?'third':'';
            const el=document.createElement('div');
            el.className='lb-row';
            el.style.animationDelay=`${i*0.06}s`;
            el.innerHTML=`<div class="lb-rank ${rankCls}">${rankTxt}</div><div class="lb-info"><div class="lb-name">${row.name}</div><div class="lb-sub">${row.sub}</div></div><div class="lb-value">${row.val}</div>`;
            wrap.appendChild(el);
        });
        container.appendChild(wrap);
    });
}

// ======================== OPEN DOC ========================
function openDoc(item) {
    currentNote=item;
    switchView('notDetay');
    document.getElementById('readTitle').innerText=item.t;
    const lInfo=getLevelInfo(item.likes);
    const glowCls=lInfo.lvl>=50?'lvl-glow-50':(lInfo.lvl>=20?'lvl-glow-20':(lInfo.lvl>=10?'lvl-glow-10':''));
    document.getElementById('readUser').innerHTML=`
      <span style="font-size:12px;opacity:0.6;">@${item.u}</span>
      <div class="lvl-circular ${glowCls}" style="width:28px;height:28px;background:conic-gradient(var(--gold) ${lInfo.percent}%,rgba(255,255,255,0.08) 0deg);">
        <div class="lvl-inner" style="width:20px;height:20px;font-size:8px;">${lInfo.lvl}</div>
      </div>
    `;
    document.getElementById('readStats').innerText=`${item.recommends} kişi önerdi · ${item.reads||0} okudu · ${item.downloads||0} indirdi`;
    document.getElementById('readContent').innerText=item.desc;
    const favBtn=document.getElementById('favBtn');
    if(currentUser.favorites.includes(item.id)){favBtn.classList.add('active');favBtn.innerHTML='❤️ Favorilerde';}
    else{favBtn.classList.remove('active');favBtn.innerHTML='🤍 Favoriye Ekle';}
    renderComments();
}
function renderComments(){
    const list=document.getElementById('commentsList');
    list.innerHTML='';
    if(!currentNote.comments||!currentNote.comments.length){list.innerHTML='<div style="opacity:0.5;font-size:12px;">Henüz değerlendirme yapılmamış.</div>';return;}
    currentNote.comments.forEach(c=>{const el=document.createElement('div');el.className='comment-item';el.innerHTML=`<strong>${c.u}</strong> (${c.type==='up'?'👍 Önerdi':'👎 Önermedi'}): ${c.text}`;list.appendChild(el);});
}
function goHome(){currentNote=null;switchView('vitrin');}

// ======================== FAVORITES ========================
function toggleFavorite(){
    if(!currentNote) return;
    const favBtn=document.getElementById('favBtn');
    const idx=currentUser.favorites.indexOf(currentNote.id);
    if(idx>-1){currentUser.favorites.splice(idx,1);favBtn.classList.remove('active');favBtn.innerHTML='🤍 Favoriye Ekle';}
    else{currentUser.favorites.push(currentNote.id);favBtn.classList.add('active');favBtn.innerHTML='❤️ Favorilerde';}
}
function renderFavorites(){
    const favList=document.getElementById('favList');
    favList.innerHTML='';
    let found=false;
    for(const cat in db){
        if(cat==='Sınav Önerileri') continue;
        db[cat].forEach(item=>{
            if(currentUser.favorites.includes(item.id)){
                found=true;
                const card=document.createElement('div');card.className='fav-card';
                card.innerHTML=`<button class="fav-heart-btn" onclick="event.stopPropagation();removeFavorite('${item.id}',this)">❤️</button><h4>${item.t}</h4><div class="fav-cat">${cat}</div>`;
                card.onclick=()=>{toggleModal('favModal',false);openDoc(item);};
                favList.appendChild(card);
            }
        });
    }
    if(!found) favList.innerHTML='<p style="opacity:0.5;grid-column:1/-1;">Favori notunuz bulunmamaktadır.</p>';
}
function removeFavorite(id,btn){
    const idx=currentUser.favorites.indexOf(id);
    if(idx>-1){currentUser.favorites.splice(idx,1);btn.closest('.fav-card').remove();}
    if(!document.querySelector('.fav-card')) document.getElementById('favList').innerHTML='<p style="opacity:0.5;grid-column:1/-1;">Favori notunuz bulunmamaktadır.</p>';
}

// ======================== NOTE ACTIONS ========================
function readInSite(){showConfirm({icon:'📖',title:'Okuma Modu',msg:'Not okuma modunda açılıyor.'});}
function downloadNote(){showConfirm({icon:'📥',title:'Dosyayı İndir',msg:'Not PDF veya TXT formatında indirilebilir. İçerik kullanıcı tarafından yüklenmiştir; platform sorumluluk üstlenmez.',twoBtn:true,okText:'PDF İndir',cancelText:'TXT İndir',okStyle:'flex:1;background:rgba(96,165,250,0.18);border:1px solid var(--accent);color:var(--accent);border-radius:9px;padding:10px;font-weight:bold;cursor:pointer;'});}
function shareToClass(){showConfirm({icon:'👥',title:'Grupta Paylaş',msg:'Bu not grubunuzda paylaşılsın mı?',twoBtn:true,okText:'Paylaş',okStyle:'flex:1;background:rgba(96,165,250,0.18);border:1px solid var(--accent);color:var(--accent);border-radius:9px;padding:10px;font-weight:bold;cursor:pointer;',cancelText:'Paylaşma'});}

// ======================== PROFILE ========================
function handleProfileClick(){if(!currentUser.isLoggedIn) toggleModal('loginModal',true); else toggleModal('profileModal',true);}
function updateProfileUI(){
    calculateLevel();
    const lInfo=getLevelInfo(currentUser.likes);
    document.getElementById('profLvlText').innerText=lInfo.lvl;
    const glowCls=lInfo.lvl>=50?'lvl-glow-50':(lInfo.lvl>=20?'lvl-glow-20':(lInfo.lvl>=10?'lvl-glow-10':''));
    const circle=document.getElementById('profLvlCircle');
    circle.className=`lvl-circular ${glowCls}`;
    circle.style.background=`conic-gradient(var(--gold) ${lInfo.percent}%,rgba(255,255,255,0.08) 0deg)`;
    document.getElementById('profLikes').innerText=currentUser.likes;
    document.getElementById('profComments').innerText=currentUser.comments;
    document.getElementById('profFavs').innerText=currentUser.favorites.length;
    document.getElementById('xpCount').innerText=`${currentUser.likes} / ${lInfo.max} XP`;
    document.getElementById('xpLabel').innerText=`Seviye ${lInfo.lvl} XP Barı`;
    setTimeout(()=>{ const fill=document.getElementById('xpBarFill'); if(fill) fill.style.width=lInfo.percent+'%'; },120);
    const badgesRow=document.getElementById('badgesRow');
    badgesRow.innerHTML='';
    getBadges().forEach(b=>{const el=document.createElement('div');el.className=`badge-chip ${b.cls}`;el.innerHTML=`${b.icon} ${b.label}`;badgesRow.appendChild(el);});
    const list=document.getElementById('profCommentsList');
    list.innerHTML='';
    if(!currentUser.history.length){list.innerHTML='Henüz bir değerlendirme yapmadınız.';return;}
    currentUser.history.forEach(h=>{const el=document.createElement('div');el.className='comment-item';el.innerHTML=`<strong>${h.noteTitle}</strong> (${h.type==='up'?'👍':'👎'}): ${h.text}`;list.appendChild(el);});
}

// ======================== LOGIN ========================
function promptName(provider){document.getElementById('loginProvider').value=provider;toggleModal('loginModal',false);toggleModal('nameModal',true);}
function finalizeLogin(){
    const name=document.getElementById('userNameInput').value.trim()||'Kullanıcı';
    const provider=document.getElementById('loginProvider').value;
    currentUser.name=name;currentUser.isLoggedIn=true;currentUser.provider=provider;
    document.getElementById('loginBtn').style.display='none';
    document.getElementById('profNameBig').innerText=name;
    document.getElementById('profProviderDisplay').innerText=`${provider==='google'?'🔵 Google':'🍎 Apple'} ile giriş yapıldı`;
    toggleModal('nameModal',false);closeHero();
}
function changeUsername(){
    if(currentUser.lastNameChange){const d=(Date.now()-currentUser.lastNameChange)/(86400000);if(d<90){showConfirm({icon:'🚫',title:'İsim Değiştirme Kısıtı',msg:'3 aylık bekleme süresi dolmamıştır.'});return;}}
    const newName=prompt('Yeni kullanıcı adınızı giriniz:');
    if(newName&&newName.trim()){currentUser.name=newName.trim();currentUser.lastNameChange=Date.now();document.getElementById('profNameBig').innerText=currentUser.name;showConfirm({icon:'✅',title:'Başarılı',msg:'Kullanıcı adınız güncellendi.'});}
}

// ======================== REPORT / SUGGEST ========================
function submitReport(){showConfirm({icon:'🚩',title:'Rapor Gönderildi',msg:'Raporunuz merkeze iletildi.',onOk:()=>toggleModal('reportModal',false)});}
function submitNewSuggestion(){
    const text=document.getElementById('suggText').value.trim();
    if(!text){showConfirm({icon:'⚠️',title:'Uyarı',msg:'Lütfen bir öneri yazınız.'});return;}
    db['Sınav Önerileri'].unshift({id:'s_new_'+Date.now(),u:currentUser.name,t:text,likes:0,dislikes:0});
    toggleModal('addSuggestionModal',false);
    document.getElementById('suggText').value='';
    showConfirm({icon:'✅',title:'Öneri Eklendi',msg:'Öneriniz sisteme başarıyla eklendi.',onOk:()=>{if(document.getElementById('suggestionsView').classList.contains('active')) openSuggestionsView();}});
}

// ======================== RECOMMEND ========================
function openRecommendModal(type){
    document.getElementById('recType').value=type;
    const select=document.getElementById('recSelect');select.innerHTML='';
    (type==='up'?recOptions.up:recOptions.down).forEach(opt=>{const o=document.createElement('option');o.value=opt;o.innerText=opt;select.appendChild(o);});
    const title=document.getElementById('recModalTitle');
    if(type==='up'){title.innerText='👍 Notu Öneriyorsunuz';title.style.color='#22c55e';}
    else{title.innerText='👎 Notu Önermiyorsunuz';title.style.color='#ef4444';}
    toggleModal('recommendModal',true);
}
function submitRecommend(){
    const text=document.getElementById('recSelect').value;
    const type=document.getElementById('recType').value;
    if(currentNote){
        if(type==='up')currentNote.recommends++;else currentNote.unRecommends++;
        currentNote.comments.push({u:currentUser.name,type,text});
        currentUser.history.push({noteTitle:currentNote.t,type,text});
        currentUser.likes+=type==='up'?2:1;
        document.getElementById('readStats').innerText=`${currentNote.recommends} kişi önerdi · ${currentNote.reads||0} okudu · ${currentNote.downloads||0} indirdi`;
        renderComments();currentUser.comments++;
    }
    toggleModal('recommendModal',false);
}

// ======================== FİKİR / UPLOAD ========================
function submitFikir(){showConfirm({icon:'💡',title:'Fikir İletildi',msg:'Fikriniz merkeze başarıyla iletildi.',onOk:()=>toggleModal('fikirModal',false)});}
function submitNote(){showConfirm({icon:'📤',title:'Not Yüklendi',msg:'Notunuz sisteme başarıyla eklendi.',onOk:()=>toggleModal('uploadModal',false)});}

// ======================== CLASS SYSTEM ========================
function renderGroupState(){
    const noGroup=document.getElementById('classContainerNoGroup');
    const hasGroupEl=document.getElementById('classContainerHasGroup');
    if(hasGroup){
        noGroup.style.display='none';
        hasGroupEl.style.display='flex';
        initClassSystemData();
        renderQuickMessages();
        initTabSlider();
    } else {
        noGroup.style.display='flex';
        hasGroupEl.style.display='none';
        renderDummyGroups();
    }
}
function renderDummyGroups(){
    const list=document.getElementById('dummyGroupsList');list.innerHTML='';
    const infos=[
        {name:'YKS Çalışma Grubu',desc:'TYT ve AYT için ortak çalışma grubu.',members:34},
        {name:'KPSS Hazırlık',desc:'KPSS Genel Kültür ve Eğitim Bilimleri odaklı.',members:22},
        {name:'LGS 8. Sınıf',desc:'8. Sınıf öğrencileri için LGS hazırlık.',members:41},
        {name:'ALES Sayısal',desc:'ALES sayısal çalışma grubu. Günlük soru paylaşımı.',members:18},
        {name:'YDS İngilizce',desc:'YDS ve YÖKDİL için İngilizce grubu.',members:27},
        {name:'TUS Hazırlık',desc:'TUS adayları için temel ve klinik bilimler.',members:15},
        {name:'Hakimlik Grubu',desc:'Hakimlik sınavı hukuk notları grubu.',members:20},
        {name:'Genel Çalışma',desc:'Tüm sınavlara açık, motivasyon grubu.',members:56},
    ];
    infos.forEach((g,i)=>{
        list.innerHTML+=`<div class="card glass-card" style="padding:14px;animation:none;opacity:1;cursor:default;"><h4 style="margin-bottom:5px;font-size:13px;">${g.name}</h4><div style="font-size:11px;opacity:0.48;margin-bottom:8px;line-height:1.4;">${g.desc}</div><div style="font-size:11px;opacity:0.5;margin-bottom:9px;">👥 ${g.members} üye</div><button class="btn-main btn-glass-upload" style="padding:7px 10px;font-size:11px;width:100%;" onclick="showJoinGroupPanel(${i},'${g.name}','${g.desc}',${g.members})">Gruba Katıl</button></div>`;
    });
}
function showCreateGroupPanel(){const p=document.getElementById('createGroupPanel');p.style.display='block';p.classList.add('open');}
function hideCreateGroupPanel(){const p=document.getElementById('createGroupPanel');p.style.display='none';p.classList.remove('open');document.getElementById('newGroupName').value='';document.getElementById('newGroupDesc').value='';}
function confirmCreateGroup(){
    const name=document.getElementById('newGroupName').value.trim();
    const desc=document.getElementById('newGroupDesc').value.trim();
    if(!name){showConfirm({icon:'⚠️',title:'Uyarı',msg:'Lütfen grup adı giriniz.'});return;}
    currentGroupData={name,desc:desc||'Açıklama girilmedi.',members:1};
    hasGroup=true;
    document.getElementById('groupNameTitle').innerText=name;
    hideCreateGroupPanel();
    renderGroupState();
}
function showJoinGroupPanel(id,name,desc,members){
    const panel=document.getElementById('joinGroupPanel');
    document.getElementById('joinGroupTitle').innerText=name;
    document.getElementById('joinGroupInfo').innerText=desc;
    document.getElementById('joinGroupDetails').innerHTML=`<div style="font-size:12px;opacity:0.6;margin-bottom:5px;">👥 Mevcut üye: <strong>${members}</strong></div><div style="font-size:12px;opacity:0.6;">📌 Katılarak not paylaşabilir ve sohbet edebilirsiniz.</div>`;
    document.getElementById('joinGroupConfirmBtn').onclick=()=>joinGroup(id,name,desc);
    panel.style.display='flex';
}
function hideJoinGroupPanel(){document.getElementById('joinGroupPanel').style.display='none';}
function joinGroup(id,name,desc){currentGroupData={name:name||`Çalışma Grubu ${id}`,desc:desc||'Grup açıklaması.',members:10};hasGroup=true;hideJoinGroupPanel();document.getElementById('groupNameTitle').innerText=currentGroupData.name;renderGroupState();}
function leaveGroup(){
    showConfirm({
        icon:'🚪',title:'Gruptan Çık',
        msg:`"${currentGroupData?currentGroupData.name:'Grup'}" adlı gruptan ayrılmak istediğinize emin misiniz?`,
        twoBtn:true,
        okText:'Evet, Çık',
        okStyle:'flex:1;background:rgba(239,68,68,0.18);border:1px solid #ef4444;color:#ef4444;border-radius:9px;padding:10px;font-weight:bold;cursor:pointer;',
        onOk:()=>{hasGroup=false;currentGroupData=null;renderGroupState();}
    });
}

// ======================== TAB SLIDER ========================
function initTabSlider(){
    setTimeout(()=>{
        const slider=document.getElementById('tabSlider');
        const tab=document.getElementById('tabChat');
        if(slider&&tab){slider.style.left=tab.offsetLeft+'px';slider.style.width=tab.offsetWidth+'px';}
        // ensure chat panel visible
        const cp=document.getElementById('chatPanel');
        const np=document.getElementById('notesPanel');
        if(cp){cp.style.display='flex';cp.classList.add('is-active');}
        if(np){np.style.display='none';np.classList.remove('is-active');}
        currentTab='chat';
    },60);
}
function switchTab(tab){
    const chatPanel=document.getElementById('chatPanel');
    const notesPanel=document.getElementById('notesPanel');
    const tabChat=document.getElementById('tabChat');
    const tabNotes=document.getElementById('tabNotes');
    const slider=document.getElementById('tabSlider');
    if(tab===currentTab) return;
    currentTab=tab;
    if(tab==='chat'){
        notesPanel.classList.remove('is-active');
        setTimeout(()=>{
            notesPanel.style.display='none';
            chatPanel.style.display='flex';
            requestAnimationFrame(()=>chatPanel.classList.add('is-active'));
        },380);
        tabChat.classList.add('active');tabNotes.classList.remove('active');
        if(slider){slider.style.left=tabChat.offsetLeft+'px';slider.style.width=tabChat.offsetWidth+'px';}
    } else {
        chatPanel.classList.remove('is-active');
        setTimeout(()=>{
            chatPanel.style.display='none';
            notesPanel.style.display='flex';
            requestAnimationFrame(()=>notesPanel.classList.add('is-active'));
        },380);
        tabNotes.classList.add('active');tabChat.classList.remove('active');
        if(slider){slider.style.left=tabNotes.offsetLeft+'px';slider.style.width=tabNotes.offsetWidth+'px';}
    }
}

// ======================== QUICK MESSAGES ========================
function renderQuickMessages(){
    const container=document.getElementById('chatQuickBtns');container.innerHTML='';
    quickMessages.forEach(msg=>{const btn=document.createElement('button');btn.className='quick-msg-btn';btn.innerText=msg;btn.onclick=()=>selectQuickMsg(btn,msg);container.appendChild(btn);});
}
let selectedQuickMsg='';
function selectQuickMsg(btn,msg){
    document.querySelectorAll('.quick-msg-btn').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');selectedQuickMsg=msg;
    document.getElementById('chatInput').value=msg;
}
function sendChatMessage(){
    const input=document.getElementById('chatInput');
    const msg=input.value.trim();if(!msg) return;
    const box=document.getElementById('chatBox');
    const el=document.createElement('div');el.className='chat-msg own';
    el.innerHTML=`<strong style="color:var(--accent);font-size:10px;">${currentUser.name}:</strong><br>${msg}`;
    box.appendChild(el);input.value='';selectedQuickMsg='';
    document.querySelectorAll('.quick-msg-btn').forEach(b=>b.classList.remove('selected'));
    box.scrollTop=box.scrollHeight;
}
function initClassSystemData(){
    const memberList=document.getElementById('memberList');
    if(memberList.children.length>0) return;
    for(let i=1;i<=10;i++){const div=document.createElement('div');div.className='member-item';div.innerHTML=`USR-${10000+i} <span class="tag">Üye</span>`;memberList.appendChild(div);}
    document.getElementById('memberCount').innerText='10';
    const inviteList=document.getElementById('inviteList');inviteList.innerHTML='';
    for(let i=1;i<=2;i++){const div=document.createElement('div');div.className='member-item';div.id=`invite-${i}`;div.innerHTML=`Davet (USR-${20000+i}) <div style="display:flex;"><span class="invite-action" onclick="handleInvite(${i},true)">✔️</span><span class="invite-action" onclick="handleInvite(${i},false)">✖️</span></div>`;inviteList.appendChild(div);}
    document.getElementById('inviteCount').innerText='2';
    const notesList=document.getElementById('classNotesList');notesList.innerHTML='';
    for(let i=1;i<=20;i++){const div=document.createElement('div');div.className='shared-note';div.innerHTML=`<span>Grup Notu ${i}</span><span style="font-size:10px;opacity:0.5;">İncele / İndir</span>`;div.onclick=()=>showConfirm({icon:'📥',title:'Not İndiriliyor',msg:`Grup Notu ${i} indiriliyor...`});notesList.appendChild(div);}
}
function handleInvite(id,accepted){
    const el=document.getElementById(`invite-${id}`);if(el)el.remove();
    const count=document.getElementById('inviteCount');count.innerText=Math.max(0,parseInt(count.innerText)-1);
    showConfirm({icon:accepted?'✅':'❌',title:accepted?'Davet Kabul Edildi':'Davet Reddedildi',msg:accepted?'Kişi gruba eklendi.':'Davet reddedildi.'});
}
function promptSendInvite(){const target=prompt("Davet göndermek istediğiniz kişinin ID veya adını giriniz:");if(target&&target.trim()) showConfirm({icon:'📨',title:'Davet Gönderildi',msg:`${target.trim()} kullanıcısına davet gönderildi.`});}
function triggerGroupUpload(){document.getElementById('groupFileInput').click();}
function handleGroupFileUpload(event){
    const file=event.target.files[0];if(!file) return;
    showConfirm({icon:'📎',title:'Not Paylaşıldı',msg:`"${file.name}" gruba başarıyla eklendi.`});
    const notesList=document.getElementById('classNotesList');
    const div=document.createElement('div');div.className='shared-note';
    div.innerHTML=`<span>${file.name}</span><span style="font-size:10px;opacity:0.5;">İncele / İndir</span>`;
    div.onclick=()=>showConfirm({icon:'📥',title:'İndiriliyor',msg:file.name+' indiriliyor...'});
    notesList.prepend(div);
}

// ======================== AFK ========================
function resetAfkTimer(){
    clearTimeout(afkTimer);
    afkTimer=setTimeout(()=>{
        const msgs=["Orada mısın?","Uyuya kaldın galiba?","Nereye kayboldun?","Sanırım biraz sıkıldın?"];
        document.getElementById('afkText').innerText=msgs[Math.floor(Math.random()*msgs.length)];
        toggleModal('afkModal',true);
    },1800000);
}