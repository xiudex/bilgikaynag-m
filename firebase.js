// ═══════════════════════════════════════
//  BİLGİ KAYNAĞIM — firebase.js v1.0
//  Firebase Auth + Firestore + Storage
// ═══════════════════════════════════════
'use strict';

// ── CONFIG ──────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAj-dihoPgHfgJBE3kDW5JW4KJpqaV8MBo",
  authDomain: "bilgi-kaynagim.firebaseapp.com",
  projectId: "bilgi-kaynagim",
  storageBucket: "bilgi-kaynagim.firebasestorage.app",
  messagingSenderId: "301691097100",
  appId: "1:301691097100:web:397703781de727a6d11e29"
};

// ── INIT ──────────────────────────────
firebase.initializeApp(firebaseConfig);
const auth    = firebase.auth();
const db      = firebase.firestore();
// Storage devre dışı (ücretsiz plan — PDF metin olarak kaydediliyor)

// Google provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ── AUTH STATE LISTENER ───────────────
auth.onAuthStateChanged(async (fbUser) => {
  if (fbUser) {
    // Kullanıcı giriş yapmış — Firestore'dan profilini yükle
    await loadUserProfile(fbUser);
  } else {
    // Çıkış yapıldı — landing page'e dön
    if (typeof handleSignOut === 'function') handleSignOut();
  }
});

// ── LOAD / CREATE USER PROFILE ────────
async function loadUserProfile(fbUser) {
  const ref = db.collection('users').doc(fbUser.uid);
  const snap = await ref.get();

  if (!snap.exists) {
    // Yeni kullanıcı — profil oluştur
    const now = Date.now();
    const newProfile = {
      uid: fbUser.uid,
      name: fbUser.displayName || 'Kullanıcı',
      email: fbUser.email || '',
      photoURL: fbUser.photoURL || '',
      provider: fbUser.providerData[0]?.providerId || 'email',
      xp: 0,
      level: 1,
      comments: 0,
      favorites: [],
      myNotes: [],
      countdowns: [],
      calendarEntries: [],
      recentViews: [],
      activities: [],
      todayAnswers: {},
      isAdmin: false,
      lastNameChange: null,
      createdAt: now,
      updatedAt: now,
      // Benzersiz müşteri kimliği
      customerId: 'BK-' + fbUser.uid.slice(0, 8).toUpperCase()
    };
    await ref.set(newProfile);
    if (typeof onUserReady === 'function') onUserReady(newProfile);
  } else {
    const profile = snap.data();
    if (typeof onUserReady === 'function') onUserReady(profile);
  }
}

// ── AUTH FUNCTIONS ────────────────────
async function loginWithGoogle() {
  try {
    showAuthLoading(true);
    await auth.signInWithPopup(googleProvider);
    // onAuthStateChanged tetiklenecek
  } catch (err) {
    showAuthLoading(false);
    showAuthError(getAuthErrorMsg(err.code));
  }
}

function loginWithEmailModal() {
  closeModal('loginModal');
  openModal('emailLoginModal');
  setTimeout(() => {
    const ei = document.getElementById('emailInp');
    if (ei) ei.focus();
  }, 150);
}

async function submitEmailLogin() {
  const email = (document.getElementById('emailInp')?.value || '').trim();
  const pass  = document.getElementById('passInp')?.value || '';
  if (!email || !pass) { showEmailErr('E-posta ve şifre zorunludur.'); return; }
  setEmailBtnsLoading(true);
  try {
    await auth.signInWithEmailAndPassword(email, pass);
    closeModal('emailLoginModal');
  } catch (err) {
    setEmailBtnsLoading(false);
    showEmailErr(getAuthErrorMsg(err.code));
  }
}

async function submitEmailRegister() {
  const email = (document.getElementById('emailInp')?.value || '').trim();
  const pass  = document.getElementById('passInp')?.value || '';
  if (!email || !pass) { showEmailErr('E-posta ve şifre zorunludur.'); return; }
  if (pass.length < 6) { showEmailErr('Şifre en az 6 karakter olmalıdır.'); return; }
  setEmailBtnsLoading(true);
  try {
    await auth.createUserWithEmailAndPassword(email, pass);
    closeModal('emailLoginModal');
    // İsim modalını aç
    openModal('nameModal');
  } catch (err) {
    setEmailBtnsLoading(false);
    showEmailErr(getAuthErrorMsg(err.code));
  }
}

async function firebaseLogout() {
  await auth.signOut();
}

// ── FIRESTORE — USER ──────────────────
async function saveUserToFirestore(userData) {
  if (!auth.currentUser) return;
  try {
    await db.collection('users').doc(auth.currentUser.uid).set({
      ...userData,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore save error:', e);
  }
}

// Belirli alanları güncelle (delta update)
async function updateUserField(fields) {
  if (!auth.currentUser) return;
  try {
    await db.collection('users').doc(auth.currentUser.uid).update({
      ...fields,
      updatedAt: Date.now()
    });
  } catch (e) {
    // İlk kez yazıyorsa set ile dene
    try {
      await db.collection('users').doc(auth.currentUser.uid).set({
        ...fields,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e2) {
      console.warn('Firestore update error:', e2);
    }
  }
}

// ── FIRESTORE — NOTES ─────────────────
// Notu yükle (upload)
async function uploadNoteToFirestore(noteData) {
  if (!auth.currentUser) return null;
  try {
    const ref = await db.collection('notes').add({
      ...noteData,
      authorId: auth.currentUser.uid,
      authorName: auth.currentUser.displayName || 'Anonim',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      likes: 0,
      recommends: 0,
      reads: 0,
      downloads: 0,
      comments: []
    });
    return ref.id;
  } catch (e) {
    console.warn('Note upload error:', e);
    return null;
  }
}

// Kategoriye göre notları getir (gerçek notlar)
async function fetchNotesByCategory(category, limitN = 40) {
  try {
    const snap = await db.collection('notes')
      .where('category', '==', category)
      .orderBy('createdAt', 'desc')
      .limit(limitN)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data(), _cat: category, _fromFirestore: true }));
  } catch (e) {
    return []; // Firestore'da henüz not yoksa boş dön
  }
}

// Not beğen / öner
async function likeNoteInFirestore(noteId, type) {
  if (!auth.currentUser) return;
  try {
    const field = type === 'like' ? 'likes' : 'recommends';
    await db.collection('notes').doc(noteId).update({
      [field]: firebase.firestore.FieldValue.increment(1)
    });
  } catch (e) { /* sessizce geç */ }
}

// ── FIRESTORE — GROUPS ────────────────
async function createGroupInFirestore(groupData) {
  if (!auth.currentUser) return null;
  try {
    const ref = await db.collection('groups').add({
      ...groupData,
      founderId: auth.currentUser.uid,
      founderName: auth.currentUser.displayName || 'Anonim',
      members: [{
        id: auth.currentUser.uid,
        name: auth.currentUser.displayName || 'Anonim',
        role: 'founder'
      }],
      msgs: [],
      notes: [],
      invites: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return ref.id;
  } catch (e) {
    console.warn('Group create error:', e);
    return null;
  }
}

async function fetchGroups() {
  try {
    const snap = await db.collection('groups')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
}

// ── PDF — Storage yerine metadata kaydı ──────────────
// Firebase Storage ücretsiz planda mevcut değil.
// PDF'ler şimdilik Firestore'a metadata olarak kaydediliyor.
// İleride Blaze planına geçilirse storage aktif edilebilir.
async function uploadPdfToStorage(file, noteTitle) {
  if (!file) return null;
  // Dosya adı ve boyutunu metadata olarak döndür (URL yok)
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: Date.now(),
    note: 'PDF storage devre dışı — metin içerik kullanılıyor'
  };
}

// ── ERROR MESSAGES ────────────────────
function getAuthErrorMsg(code) {
  const msgs = {
    'auth/user-not-found':         'Bu e-posta ile kayıtlı hesap bulunamadı.',
    'auth/wrong-password':         'Şifre hatalı. Lütfen tekrar deneyin.',
    'auth/email-already-in-use':   'Bu e-posta zaten kullanımda.',
    'auth/invalid-email':          'Geçersiz e-posta adresi.',
    'auth/weak-password':          'Şifre çok zayıf. En az 6 karakter girin.',
    'auth/popup-closed-by-user':   'Giriş penceresi kapatıldı.',
    'auth/network-request-failed': 'Ağ hatası. İnternet bağlantınızı kontrol edin.',
    'auth/too-many-requests':      'Çok fazla deneme. Lütfen bekleyin.',
    'auth/invalid-credential':     'E-posta veya şifre hatalı.',
  };
  return msgs[code] || 'Bir hata oluştu. Lütfen tekrar deneyin.';
}

// ── UI HELPERS ────────────────────────
function showAuthLoading(show) {
  const btn = document.querySelector('.social-btn.google');
  if (btn) btn.textContent = show ? '⏳ Giriş yapılıyor...' : 'Google ile Devam Et';
}
function showAuthError(msg) {
  if (typeof toast === 'function') toast('⚠️ ' + msg);
}
function showEmailErr(msg) {
  const el = document.getElementById('emailLoginErr');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function setEmailBtnsLoading(loading) {
  const b1 = document.getElementById('emailLoginBtn');
  const b2 = document.getElementById('emailRegisterBtn');
  if (b1) { b1.disabled = loading; b1.textContent = loading ? '⏳...' : 'Giriş Yap'; }
  if (b2) { b2.disabled = loading; b2.textContent = loading ? '⏳...' : 'Kayıt Ol'; }
  const errEl = document.getElementById('emailLoginErr');
  if (errEl && !loading) errEl.style.display = 'none';
}
