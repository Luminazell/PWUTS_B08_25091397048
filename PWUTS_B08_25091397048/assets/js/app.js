/* RuangKos — UTS Muhammad Dava Desvilano.
 * Frontend: HTML + CSS murni + JavaScript, tanpa Bootstrap, PHP, ataupun API.
 * Navigasi AJAX: fetch() untuk memuat fragmen HTML dari folder pages/.
 * Simulasi transaksi: localStorage browser (BUKAN pengiriman HTTP POST ke server).
 */
'use strict';
const routeFiles = {
  'beranda': 'pages/beranda.html',
  'daftar-kos': 'pages/daftar-kos.html',
  'tambah-kos': 'pages/tambah-kos.html'
};
const routeLabels = {'beranda': 'Beranda', 'daftar-kos': 'Daftar Kos', 'tambah-kos': 'Tambah Kos'};
const state = {items: [], currentRoute: '', editId: null, loadCounter: 0};
const app = document.getElementById('app');
const nav = document.getElementById('main-nav');
const menuBtn = document.getElementById('menu-button');
const fmt = new Intl.NumberFormat('id-ID');
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function toast(text){
  const box=document.getElementById('toast'); box.textContent=text; box.classList.add('visible');
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>box.classList.remove('visible'),3600);
}
function hashToRoute(){
  const matched=location.hash.match(/^#\/(beranda|daftar-kos|tambah-kos)(?:\/([0-9]+))?$/);
  if(!matched)return {page:'beranda',editId:null};
  return {page:matched[1],editId:matched[1]==='tambah-kos'&&matched[2]?Number(matched[2]):null};
}
function navigate(page, editId=null, push=true){
  if(!routeFiles[page]) page='beranda';
  const newHash='#/'+page+(page==='tambah-kos'&&editId?'/'+editId:'');
  if(push && location.hash!==newHash)history.pushState({page,editId},'',newHash);
  return loadPage(page,editId);
}
async function loadPage(page,editId=null){
  const loadId=++state.loadCounter;
  state.currentRoute=page; state.editId=editId;
  nav.querySelectorAll('[data-page]').forEach(a=>{
    const active=a.dataset.page===page; a.classList.toggle('active',active);
    if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
  });
  nav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');
  document.title=(editId?'Edit Kos':routeLabels[page])+' | RuangKos — Dava';
  app.innerHTML='<div class="page-loading">Memuat halaman...</div>';
  try{
    const response=await fetch(routeFiles[page],{cache:'no-store'});
    if(!response.ok)throw Error('Halaman tidak ditemukan (HTTP '+response.status+').');
    const html=await response.text();
    if(loadId!==state.loadCounter)return;
    app.innerHTML=html;
    if(page==='beranda')await initBeranda(loadId);
    if(page==='daftar-kos')await initDaftar(loadId);
    if(page==='tambah-kos')await initForm(editId,loadId);
  }catch(err){
    if(loadId===state.loadCounter)app.innerHTML='<div class="page"><div class="error-panel">'+esc(err.message)+'. Pastikan project dibuka lewat http://localhost, bukan file:///.</div></div>';
  }
}
// Data contoh fiktif. Total kamar dipertahankan sebagai ringkasan saja;
// pengelolaan kamar adalah bagian UTS anggota lain (Farhan).
const STORAGE_KEY = 'PWUTS_B08_25091397048_kos_v1';
const SAMPLE_KOS = [
  {id_kos:1,id_pemilik:1,nama_kos:'Kos Arunika',alamat:'Jalan Arunika No. 10, Kota Contoh',deskripsi:'Kos contoh dekat kawasan kampus, dilengkapi area bersama.',total_kamar:3,kamar_tersedia:2},
  {id_kos:2,id_pemilik:1,nama_kos:'Kos Nusa',alamat:'Jalan Nusa Indah No. 5, Kota Contoh',deskripsi:'Hunian kos fiktif yang tenang dan mudah diakses.',total_kamar:2,kamar_tersedia:1},
  {id_kos:3,id_pemilik:1,nama_kos:'Kos Asri',alamat:'Jalan Taman Asri No. 22, Kota Contoh',deskripsi:'Kos contoh dengan suasana asri dan area parkir.',total_kamar:2,kamar_tersedia:1}
];
function clone(value){ return JSON.parse(JSON.stringify(value)); }
function readKos(){
  let raw;
  try { raw=localStorage.getItem(STORAGE_KEY); }
  catch { throw Error('Penyimpanan browser tidak tersedia. Aktifkan localStorage pada browser.'); }
  if(raw===null){
    const initial=clone(SAMPLE_KOS);
    saveKos(initial);
    return initial;
  }
  try{
    const value=JSON.parse(raw);
    if(!Array.isArray(value) || !value.every(k => k && Number.isInteger(Number(k.id_kos)) && typeof k.nama_kos==='string')) throw Error();
    return value;
  }catch{
    throw Error('Data lokal tidak dapat dibaca. Periksa penyimpanan browser.');
  }
}
function saveKos(data){
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(data)); }
  catch { throw Error('Data gagal disimpan. Periksa kapasitas dan izin penyimpanan browser.'); }
}
async function fetchKos(){
  state.items=readKos();
  return state.items;
}
function simpanFormKos(payload, editId){
  const items=readKos();
  const sameName=items.some(row => row.nama_kos.trim().toLocaleLowerCase('id-ID')===payload.nama_kos.toLocaleLowerCase('id-ID') && Number(row.id_kos)!==Number(editId));
  if(sameName) throw Error('Nama kos sudah digunakan. Pilih nama yang berbeda.');
  let message;
  if(editId){
    const row=items.find(item=>Number(item.id_kos)===Number(editId));
    if(!row)throw Error('Kos yang ingin diperbarui tidak ditemukan.');
    Object.assign(row,payload);
    message='Informasi kos berhasil diperbarui di browser.';
  }else{
    const nextId=items.reduce((max,row)=>Math.max(max,Number(row.id_kos)||0),0)+1;
    items.push({id_kos:nextId,id_pemilik:1,...payload,total_kamar:0,kamar_tersedia:0});
    message='Kos berhasil ditambahkan dan tersimpan di browser.';
  }
  saveKos(items);
  state.items=items;
  return message;
}
function getTotal(items,field){return items.reduce((acc,row)=>acc+Number(row[field]||0),0)}
async function initBeranda(loadId){
  const today=document.getElementById('today-label');
  today.textContent=new Intl.DateTimeFormat('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
  try{
    const items=await fetchKos();
    if(loadId!==state.loadCounter)return;
    const totalRooms=getTotal(items,'total_kamar');
    const available=getTotal(items,'kamar_tersedia');
    document.getElementById('metrics').innerHTML=`
      <div class="metric"><div><small>Total Properti Kos</small><strong>${fmt.format(items.length)}</strong><em>Terdaftar pada akun demo</em></div><span class="metric-icon peach" aria-hidden="true">⌂</span></div>
      <div class="metric"><div><small>Total Kamar</small><strong>${fmt.format(totalRooms)}</strong><em>Akumulasi dari seluruh kos</em></div><span class="metric-icon" aria-hidden="true">▦</span></div>
      <div class="metric"><div><small>Kamar Tersedia</small><strong>${fmt.format(available)}</strong><em>Status tersedia pada tabel kamar</em></div><span class="metric-icon sand" aria-hidden="true">✓</span></div>`;
    document.getElementById('recent-list').innerHTML=items.length?items.slice(0,4).map(row=>`<div class="recent-row"><div class="recent-main"><span class="property-thumb" aria-hidden="true">⌂</span><div><strong>${esc(row.nama_kos)}</strong><small>${esc(row.alamat)}</small></div></div><span class="recent-number">${fmt.format(row.total_kamar)} kamar</span></div>`).join(''):'<div class="padded subdued">Belum ada properti. Tambahkan kos pertamamu!</div>';
  }catch(err){if(loadId!==state.loadCounter)return;document.getElementById('metrics').innerHTML='<div class="error-panel" style="grid-column:1/-1">'+esc(err.message)+'</div>';document.getElementById('recent-list').innerHTML='<div class="padded subdued">Data belum tersedia.</div>'}
}
async function initDaftar(loadId){
  const grid=document.getElementById('kos-grid');
  try{await fetchKos();if(loadId!==state.loadCounter)return;renderKos();}
  catch(err){if(loadId===state.loadCounter)grid.innerHTML='<div class="error-panel">'+esc(err.message)+'</div>'}
  document.getElementById('search-kos').addEventListener('input',renderKos);
  document.getElementById('sort-kos').addEventListener('change',renderKos);
  grid.addEventListener('click',event=>{
    const id=Number(event.target.closest('[data-detail]')?.dataset.detail);
    if(id)showDetail(id);
  });
}
function renderKos(){
  const filter=document.getElementById('search-kos'); if(!filter)return;
  const term=filter.value.trim().toLocaleLowerCase('id-ID');
  const sort=document.getElementById('sort-kos').value;
  const items=state.items.filter(item=>[item.nama_kos,item.alamat,item.deskripsi].some(v=>String(v??'').toLocaleLowerCase('id-ID').includes(term))).slice();
  if(sort==='name-asc')items.sort((a,b)=>a.nama_kos.localeCompare(b.nama_kos,'id'));
  else if(sort==='name-desc')items.sort((a,b)=>b.nama_kos.localeCompare(a.nama_kos,'id'));
  else if(sort==='rooms-desc')items.sort((a,b)=>Number(b.total_kamar)-Number(a.total_kamar));
  else items.sort((a,b)=>Number(b.id_kos)-Number(a.id_kos));
  document.getElementById('kos-count').textContent=items.length;
  document.getElementById('list-description').textContent=`Menampilkan ${items.length} dari ${state.items.length} properti`;
  document.getElementById('kos-grid').innerHTML=items.length?items.map((row,index)=>`<article class="property-card"><div class="property-cover alt-${index%3}"><span class="cover-icon" aria-hidden="true">⌂</span><span class="cover-pattern"></span><span class="cover-num">KOS #${String(row.id_kos).padStart(3,'0')}</span></div><div class="property-card-body"><h3>${esc(row.nama_kos)}</h3><div class="location"><span aria-hidden="true">⌖</span><span title="${esc(row.alamat)}">${esc(row.alamat)}</span></div><p class="desc">${esc(row.deskripsi||'Belum ada deskripsi kos.')}</p><div class="property-card-foot"><span class="room-tag">▦ ${fmt.format(row.total_kamar)} kamar · ${fmt.format(row.kamar_tersedia)} tersedia</span><button type="button" class="detail-btn" data-detail="${Number(row.id_kos)}">Lihat detail →</button></div></div></article>`).join(''):'<div class="empty-state"><span>⌕</span><strong>Tidak ada kos ditemukan</strong>Coba kata kunci lainnya, atau tambahkan kos baru.</div>';
}
function showDetail(id){
  const row=state.items.find(item=>Number(item.id_kos)===id);if(!row)return;
  const layer=document.getElementById('dialog-layer');
  layer.innerHTML=`<div class="dialog-backdrop" id="dialog-backdrop"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title"><div class="dialog-top"><div><p class="eyebrow">INFORMASI PROPERTI</p><h2 id="detail-title">${esc(row.nama_kos)}</h2></div><button type="button" class="dialog-close" id="dialog-close" aria-label="Tutup detail">×</button></div><dl><div class="dialog-row"><dt>ID Kos</dt><dd>${Number(row.id_kos)}</dd></div><div class="dialog-row"><dt>Alamat</dt><dd>${esc(row.alamat)}</dd></div><div class="dialog-row"><dt>Deskripsi</dt><dd>${esc(row.deskripsi||'Tidak ada deskripsi.')}</dd></div><div class="dialog-row"><dt>Total Kamar</dt><dd>${fmt.format(row.total_kamar)}</dd></div><div class="dialog-row"><dt>Kamar Tersedia</dt><dd>${fmt.format(row.kamar_tersedia)}</dd></div></dl><div class="dialog-actions"><button type="button" class="btn btn-ghost" id="close-detail">Tutup</button><button type="button" class="btn btn-accent" id="edit-detail">Edit data kos →</button></div></div></div>`;
  const close=()=>{layer.innerHTML='';document.removeEventListener('keydown',onEsc)};
  const onEsc=event=>{if(event.key==='Escape')close()};
  document.addEventListener('keydown',onEsc);
  layer.querySelector('#dialog-backdrop').addEventListener('click',e=>{if(e.target.id==='dialog-backdrop')close()});
  layer.querySelector('#dialog-close').addEventListener('click',close);
  layer.querySelector('#close-detail').addEventListener('click',close);
  layer.querySelector('#edit-detail').addEventListener('click',()=>{close();navigate('tambah-kos',id)});
  layer.querySelector('#dialog-close').focus();
}
function clearValidation(){
  ['nama_kos','alamat','deskripsi'].forEach(field=>{const el=document.getElementById(field);el?.classList.remove('invalid');const msg=document.getElementById('error-'+field);if(msg)msg.textContent=''})
}
function validateKos(payload){
  const errors={};
  if(payload.nama_kos.length<3||payload.nama_kos.length>120)errors.nama_kos='Nama kos harus 3–120 karakter.';
  if(payload.alamat.length<10||payload.alamat.length>1000)errors.alamat='Alamat harus 10–1.000 karakter.';
  if(payload.deskripsi.length>1000)errors.deskripsi='Deskripsi maksimal 1.000 karakter.';
  return errors;
}
async function initForm(editId,loadId){
  const form=document.getElementById('form-kos');
  const info=document.getElementById('form-message');
  const save=document.getElementById('submit-btn');
  if(editId){
    document.getElementById('form-title').innerHTML='Edit <em>Informasi Kos</em>';
    document.getElementById('form-subtitle').textContent='Perbarui informasi kos yang telah terdaftar.';
    save.innerHTML='Simpan Perubahan <span aria-hidden="true">↗</span>';
    try{
      const items=await fetchKos();if(loadId!==state.loadCounter)return;
      const row=items.find(k=>Number(k.id_kos)===editId);
      if(!row)throw Error('Kos yang akan diedit tidak ditemukan.');
      form.elements.nama_kos.value=row.nama_kos;
      form.elements.alamat.value=row.alamat;
      form.elements.deskripsi.value=row.deskripsi||'';
    }catch(err){info.textContent=err.message;info.className='form-message error';save.disabled=true}
  }
  form.addEventListener('reset',()=>{setTimeout(()=>{clearValidation();info.textContent='';info.className='form-message'},0)});
  form.addEventListener('submit',async event=>{
    event.preventDefault(); clearValidation(); info.textContent=''; info.className='form-message';
    const payload={nama_kos:form.elements.nama_kos.value.trim(),alamat:form.elements.alamat.value.trim(),deskripsi:form.elements.deskripsi.value.trim()};
    const errors=validateKos(payload);
    if(Object.keys(errors).length){
      Object.entries(errors).forEach(([key,value])=>{document.getElementById('error-'+key).textContent=value;document.getElementById(key).classList.add('invalid')});
      document.getElementById(Object.keys(errors)[0]).focus();info.textContent='Periksa kembali data yang belum valid.';info.className='form-message error';return;
    }
    save.disabled=true;save.textContent='Menyimpan...';
    try{
      const message=simpanFormKos(payload,editId);
      toast(message);
      await navigate('daftar-kos');
    }catch(err){info.textContent=err.message;info.className='form-message error'}
    finally{save.disabled=false;save.innerHTML=editId?'Simpan Perubahan <span aria-hidden="true">↗</span>':'Simpan Data Kos <span aria-hidden="true">↗</span>'}
  });
}
nav.addEventListener('click',e=>{const link=e.target.closest('[data-page]');if(!link)return;e.preventDefault();navigate(link.dataset.page)});
document.getElementById('brand-link').addEventListener('click',e=>{e.preventDefault();navigate('beranda')});
menuBtn.addEventListener('click',()=>{const isOpen=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(isOpen))});
app.addEventListener('click',e=>{const go=e.target.closest('[data-go]');if(go){e.preventDefault();navigate(go.dataset.go)}});
window.addEventListener('popstate',()=>{const r=hashToRoute();navigate(r.page,r.editId,false)});
window.addEventListener('hashchange',()=>{const r=hashToRoute();if(state.currentRoute!==r.page||state.editId!==r.editId)navigate(r.page,r.editId,false)});
const initial=hashToRoute();navigate(initial.page,initial.editId,false);
