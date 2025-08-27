async function loadIndex(){
  const res = await fetch('/index.json');
  return await res.json();
}
function renderBox(){
  const box = document.getElementById('searchbox');
  box.innerHTML = '<input id="q" type="search" placeholder="e.g., heart failure, ECG, beta blockers" style="width:100%;padding:.8rem;border-radius:10px;border:1px solid #22323a;background:#0b1114;color:#e9f1f1">';
  const q = document.getElementById('q');
  q.addEventListener('input', doSearch);
}
let INDEX = [];
function score(item, query){
  const t = item.title.toLowerCase();
  const d = (item.description||'').toLowerCase();
  const q = query.toLowerCase();
  let s = 0;
  if(t.includes(q)) s += 3;
  if(d.includes(q)) s += 1;
  return s;
}
function doSearch(){
  const q = document.getElementById('q').value.trim();
  const resDiv = document.getElementById('results');
  if(!q){ resDiv.innerHTML = ''; return; }
  const matches = INDEX
    .map(it => ({...it, _s: score(it, q)}))
    .filter(it => it._s>0)
    .sort((a,b)=>b._s-a._s)
    .slice(0, 30);
  resDiv.innerHTML = '<ul class="cards">' + matches.map(m => `
    <li class="card">
      <h3><a href="${m.url}">${m.title}</a></h3>
      <p class="muted">${m.description||''}</p>
    </li>`).join('') + '</ul>';
}
document.addEventListener('DOMContentLoaded', async () => {
  INDEX = await loadIndex();
  renderBox();
});
