// app.js - front-end prototype (no backend required)
// Data sample - remplace par ton API plus tard
const sampleVideos = [
  {
    id: 'v1',
    title: 'Crimson Desire',
    type: 'Romance / Érotique / School Life',
    thumb: 'crimson_desire.jpg',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    synopsis: 'Dans un lycée prestigieux, deux élèves brillants cachent une passion secrète. Entre rivalité académique et attirance irrésistible, leur relation évolue dans l’ombre des règles strictes de l’établissement..',
    likes: 120, dislikes: 3
  },
  {
    id: 'v2',
    title: 'Lab Secrets',
    type: 'Sci-fi / Tentacle / Experimental',
    thumb: 'lab_secrets.jpg',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    synopsis: 'Une jeune chercheuse découvre une créature extraterrestre dans un laboratoire isolé. Ce qu’elle croyait être une avancée scientifique devient une expérience sensorielle hors du commun, mêlant curiosité et danger.',
    likes: 80, dislikes: 2
  },
  {
    id: 'v3',
    title: 'Silken Shadows',
    type: 'Historique / BDSM / Drama',
    thumb: 'silken_shadow.jpg',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    synopsis: 'Dans le Japon féodal, une geisha est entraînée dans un jeu de pouvoir entre seigneurs. Entre soumission et stratégie, elle utilise son charme pour survivre et manipuler les intrigues de la cour.',
    likes: 200, dislikes: 12
  }
];
// ========== DOM refs ==========
const results = document.getElementById('results');
const cardTpl = document.getElementById('cardTpl');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const hamburger = document.getElementById('hamburger');
const sidePanel = document.getElementById('sidePanel');
const closePanel = document.getElementById('closePanel');
const favoritesList = document.getElementById('favoritesList');
const videoModal = document.getElementById('videoModal');
const modalClose = document.getElementById('modalClose');
const playerVideo = document.getElementById('playerVideo');
const playerTitle = document.getElementById('playerTitle');
const modalFavBtn = document.getElementById('modalFavBtn');
const modalDownloadBtn = document.getElementById('modalDownloadBtn');
const speedSelector = document.getElementById('speedSelector');
const volumeRange = document.getElementById('volumeRange');
const brightnessRange = document.getElementById('brightnessRange');
const brightnessOverlay = document.getElementById('brightnessOverlay');
const relatedList = document.getElementById('relatedList');

let videos = sampleVideos.slice();
let favorites = JSON.parse(localStorage.getItem('vf_favs') || '[]');
let siteRating = Number(localStorage.getItem('vf_rate') || 0);

// ========== utility: render list ==========
function renderResults(list){
  results.innerHTML = '';
  list.forEach(v => {
    const node = cardTpl.content.cloneNode(true);
    node.querySelector('.thumb').src = v.thumb;
    node.querySelector('.thumb').alt = v.title;
    node.querySelector('.title').textContent = v.title;
    node.querySelector('.subtitle').textContent = v.type;
    const article = node.querySelector('.video-card');
    article.dataset.id = v.id;

    const favBtn = node.querySelector('.fav-btn');
    favBtn.textContent = favorites.includes(v.id) ? '★' : '☆';
    favBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      toggleFav(v.id);
      favBtn.textContent = favorites.includes(v.id) ? '★' : '☆';
      renderFavoritesPanel();
    });

    const dlBtn = node.querySelector('.download-btn');
    dlBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      triggerDownload(v);
    });

    article.addEventListener('click', ()=>{
      openModal(v.id);
    });

    results.appendChild(node);
  });
}

// search relevance: startsWith > includes
function searchVideos(q){
  if(!q) return videos;
  q = q.trim().toLowerCase();
  const starts = [];
  const includes = [];
  videos.forEach(v=>{
    const t = v.title.toLowerCase();
    const match = t.startsWith(q) ? 'start' : (t.includes(q) ? 'incl' : null);
    if(match === 'start') starts.push(v);
    else if(match === 'incl') includes.push(v);
  });
  return [...starts, ...includes];
}

// toggle favs
function toggleFav(id){
  const i = favorites.indexOf(id);
  if(i>=0) favorites.splice(i,1);
  else favorites.push(id);
  localStorage.setItem('vf_favs', JSON.stringify(favorites));
  renderResults(searchVideos(searchInput.value));
}

// render favorites panel
function renderFavoritesPanel(){
  favoritesList.innerHTML = '';
  if(favorites.length === 0){
    favoritesList.innerHTML = '<p style="color:var(--muted)">Aucun favori</p>';
    return;
  }
  favorites.forEach(id=>{
    const v = videos.find(x=>x.id===id);
    if(!v) return;
    const div = document.createElement('div');
    div.className = 'fav-card';
    div.innerHTML = `<img src="${v.thumb}" style="width:64px;height:44px;object-fit:cover;border-radius:6px"/><div style="flex:1"><strong style="display:block">${v.title}</strong><span style="color:var(--muted);font-size:12px">${v.type}</span></div><button data-id="${v.id}" class="fav-remove">✕</button>`;
    favoritesList.appendChild(div);
    div.querySelector('.fav-remove').addEventListener('click', ()=>{
      toggleFav(v.id);
      renderFavoritesPanel();
    });
    div.addEventListener('click', ()=>{
      openModal(v.id);
    });
  });
}

// download handler (simple)
function triggerDownload(v){
  // si backend, on doit pointer vers url véritable. Ici on crée un lien
  const a = document.createElement('a');
  a.href = v.src;
  a.download = v.title.replace(/\s+/g,'_') + '.mp4';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ========== modal (player) ==========
let currentVideoId = null;
function openModal(id){
  const v = videos.find(x=>x.id===id);
  if(!v) return;
  currentVideoId = id;
  playerTitle.textContent = v.title;
  playerVideo.src = v.src;
  playerVideo.currentTime = 0;
  playerVideo.play().catch(()=>{});
  modalFavBtn.textContent = favorites.includes(id) ? '★' : '☆';
  modalDownloadBtn.onclick = ()=> triggerDownload(v);
  // synopsis
  document.getElementById('videoSynopsis').textContent = v.synopsis || '';
  // likes/dislikes
  document.getElementById('likeCount').textContent = v.likes||0;
  document.getElementById('dislikeCount').textContent = v.dislikes||0;
  videoModal.classList.remove('hidden');
  videoModal.setAttribute('aria-hidden','false');
  renderRelated(id);
}

function closeModal(){
  playerVideo.pause();
  playerVideo.src = '';
  videoModal.classList.add('hidden');
  videoModal.setAttribute('aria-hidden','true');
  currentVideoId = null;
}

modalClose.addEventListener('click', closeModal);
document.getElementById('modalClose').addEventListener('click', closeModal);

// modal fav toggle
modalFavBtn.addEventListener('click', ()=>{
  if(!currentVideoId) return;
  toggleFav(currentVideoId);
  modalFavBtn.textContent = favorites.includes(currentVideoId) ? '★' : '☆';
  renderFavoritesPanel();
});

// speed, volume, brightness
speedSelector.addEventListener('change', ()=> playerVideo.playbackRate = Number(speedSelector.value));
volumeRange.addEventListener('input', ()=> playerVideo.volume = Number(volumeRange.value));
brightnessRange.addEventListener('input', ()=> {
  const val = Number(brightnessRange.value);
  // apply CSS filter for brightness to video wrapper
  playerVideo.style.filter = `brightness(${val})`;
  // fallback overlay opacity (fine-tuning)
  brightnessOverlay.style.opacity = val < 1 ? String(1 - val) : '0';
});

// comments (simple in-memory list per video)
const commentsStore = {}; // {videoId: [{text,ts}]}
const commentToggleBtn = document.getElementById('commentToggleBtn');
const commentsSection = document.getElementById('commentsSection');
const commentList = document.getElementById('commentList');
const commentInput = document.getElementById('commentInput');
const commentSend = document.getElementById('commentSend');

commentToggleBtn.addEventListener('click', ()=> commentsSection.classList.toggle('hidden'));
commentSend.addEventListener('click', ()=>{
  if(!currentVideoId) return;
  const txt = commentInput.value.trim();
  if(!txt) return;
  commentsStore[currentVideoId] = commentsStore[currentVideoId] || [];
  commentsStore[currentVideoId].push({text:txt,ts:Date.now()});
  commentInput.value = '';
  renderComments();
});

function renderComments(){
  commentList.innerHTML = '';
  const list = commentsStore[currentVideoId] || [];
  if(list.length === 0){ commentList.innerHTML = '<p style="color:var(--muted)">Aucun commentaire</p>'; return; }
  list.forEach(c=>{
    const d = document.createElement('div');
    d.style.padding='8px';
    d.style.borderBottom='1px solid rgba(255,255,255,0.02)';
    d.innerHTML = `<div style="font-size:14px">${escapeHtml(c.text)}</div><div style="font-size:12px;color:var(--muted);margin-top:6px">${new Date(c.ts).toLocaleString()}</div>`;
    commentList.appendChild(d);
  });
}

// render related videos (simple: other videos sorted by title)
function renderRelated(currentId){
  relatedList.innerHTML = '';
  const rel = videos.filter(v=>v.id !== currentId).slice(0,6);
  rel.forEach(v=>{
    const el = document.createElement('div');
    el.className = 'video-card';
    el.style.marginBottom='8px';
    el.innerHTML = `<img class="thumb" src="${v.thumb}" /><div class="meta"><h4 class="title">${v.title}</h4><div class="subtitle">${v.type}</div></div><div class="card-actions"><button class="download-btn">⬇︎</button><button class="fav-btn">${favorites.includes(v.id)?'★':'☆'}</button></div>`;
    el.querySelector('.fav-btn').addEventListener('click',(e)=>{ e.stopPropagation(); toggleFav(v.id); renderRelated(currentId); renderFavoritesPanel(); });
    el.querySelector('.download-btn').addEventListener('click',(e)=>{ e.stopPropagation(); triggerDownload(v); });
    el.addEventListener('click', ()=> openModal(v.id));
    relatedList.appendChild(el);
  });
}

// escape helper
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

// ========== rating stars UI ==========
const siteRatingEl = document.getElementById('siteRating');
function renderRating(){
  siteRatingEl.innerHTML = '';
  for(let i=1;i<=5;i++){
    const b = document.createElement('button');
    b.textContent = i <= siteRating ? '★' : '☆';
    b.addEventListener('click', ()=> {
      siteRating = i;
      localStorage.setItem('vf_rate', String(siteRating));
      renderRating();
    });
    siteRatingEl.appendChild(b);
  }
}
renderRating();

// ========== events ==========
searchBtn.addEventListener('click', ()=> {
  const q = searchInput.value || '';
  const res = searchVideos(q);
  renderResults(res);
});
searchInput.addEventListener('keyup', (e)=>{
  if(e.key === 'Enter'){ searchBtn.click(); return; }
  // live search
  const q = searchInput.value || '';
  renderResults(searchVideos(q));
});

hamburger.addEventListener('click', ()=> {
  sidePanel.classList.toggle('hidden');
  renderFavoritesPanel();
});
closePanel.addEventListener('click', ()=> sidePanel.classList.add('hidden'));

// initial render
renderResults(videos);
renderFavoritesPanel();
// Like
const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const followBtn2 = document.getElementById("followBtn");

likeBtn.addEventListener("click", () => {
  if (!currentVideoId) return;
  const v = videos.find(x => x.id === currentVideoId);
  if (!v) return;
  v.likes = (v.likes || 0) + 1;
  document.getElementById("likeCount").textContent = v.likes;
});

// Dislike
dislikeBtn.addEventListener("click", () => {
  if (!currentVideoId) return;
  const v = videos.find(x => x.id === currentVideoId);
  if (!v) return;
  v.dislikes = (v.dislikes || 0) + 1;
  document.getElementById("dislikeCount").textContent = v.dislikes;
});

// Follow
followBtn2.addEventListener("click", () => {
  if (followBtn2.textContent === "Follow") {
    followBtn2.textContent = "Suivi✓";
    followBtn2.style.color = "var(--accent)";
  } else {
    followBtn2.textContent = "Follow♥️";
    followBtn2.style.color = "var(--muted)";
  }
});