// Node-only interaction and asset checks. Does not claim browser layout testing.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {parseHTML} = require('../output/ui-test-runtime/node_modules/linkedom');
const cssTree = require('../output/ui-test-runtime/node_modules/css-tree');
const {document, window} = parseHTML(fs.readFileSync(path.join(__dirname,'index.html'),'utf8'));
const intervals = [], observers = [];
const viewport = {scrollX:0,scrollY:0,scrollTo({left,top}){this.scrollX=left;this.scrollY=top;}};
let now = 0, focused = null, clipboard = '';
Object.defineProperty(document, 'hidden', {value:false,writable:true});
Object.defineProperty(document, 'activeElement', {get:()=>focused});
const preference = {matches:false,listeners:[],addEventListener(type,fn){this.listeners.push(fn);},onchange(event){this.listeners.forEach(fn=>fn(event));}};
const event = (node,type,props={}) => {
  const e = new window.Event(type,{bubbles:true,cancelable:true});
  Object.assign(e,props);
  node.dispatchEvent(e);
};
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.showModal=()=>{
    assert.equal(document.body.classList.contains('modal-open'),true,'lock before native focus');
    assert.equal(document.body.style.getPropertyValue('--page-scroll-y'),`${-viewport.scrollY}px`);
    dialog.setAttribute('open','');
    viewport.scrollY=0; // Simulate the native focus/overflow jump reported by the user.
  };
  dialog.close=()=>{dialog.removeAttribute('open');event(dialog,'close');};
});
document.querySelectorAll('button').forEach(button=>button.focus=()=>{focused=button;});
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'app.js'),'utf8'),{
  document,window:viewport,matchMedia:()=>preference,performance:{now:()=>now},
  IntersectionObserver:class{constructor(cb){this.cb=cb;observers.push(this);}observe(root){this.root=root;}},
  setInterval:fn=>intervals.push(fn),
  navigator:{clipboard:{writeText:async text=>{clipboard=text;}}}
});
const tick=()=>{now+=6000;intervals.forEach(fn=>fn());};
const root=name=>document.querySelector(`[data-gallery="${name}"]`);
const index=name=>Number(root(name).dataset.index);
const click=selector=>event(document.querySelector(selector),'click');
const report=[];
assert.equal(document.querySelector('[data-play]'),null);
assert.equal(document.querySelector('#photo-dialog'),null);
for(const name of ['field','life']){
  const gallery=root(name), count=gallery.querySelectorAll('.gallery-slide').length;
  assert.equal(count,name==='field'?4:6);
  assert.equal(gallery.querySelectorAll('button.gallery-slide').length,0);
  for(let i=0;i<count;i++) event(gallery.querySelector('[data-next]'),'click');
  assert.equal(index(name),0);
  event(gallery.querySelector('[data-prev]'),'click');
  assert.equal(index(name),count-1);
  event(gallery.querySelector('[data-next]'),'click');
  assert.equal(gallery.querySelectorAll('.is-current').length,1);
  assert.equal(gallery.querySelector('.is-current').getAttribute('aria-hidden'),'false');
  const stage=gallery.querySelector('.gallery-stage');
  event(stage,'pointerdown',{isPrimary:true,button:0,pointerId:1,clientX:200,clientY:100});
  event(stage,'pointerup',{pointerId:1,clientX:90,clientY:105});
  assert.equal(index(name),1);
  event(gallery.querySelector('.is-current'),'click');
  assert.equal(document.querySelector('dialog[open]'),null,'photo clicks never open dialogs');
  report.push(name+': wrap both directions, swipe, no photo enlargement, no pause control');
}
const before=index('field');tick();assert.equal(index('field'),before);
observers.forEach(observer=>observer.cb([{isIntersecting:true}]));
tick();assert.equal(index('field'),(before+1)%4);
event(root('field'),'pointerenter',{pointerType:'mouse'});
let expected=(index('field')+1)%4;tick();assert.equal(index('field'),expected,'hover must not stop autoplay');
focused=root('field').querySelector('[data-next]');
expected=(index('field')+1)%4;tick();assert.equal(index('field'),expected,'arrow focus must not stop autoplay');
focused=null;document.hidden=true;
expected=index('field');tick();assert.equal(index('field'),expected);document.hidden=false;
const completePhoto=root('field').querySelectorAll('.gallery-slide')[2];
assert.ok(completePhoto.classList.contains('preserve-frame'));
const motionCSS=fs.readFileSync(path.join(__dirname,'interactions.css'),'utf8');
assert.ok(motionCSS.includes('.field-stage .preserve-frame img{object-fit:cover;object-position:50% 35%'));
assert.ok(motionCSS.includes('top:50%;bottom:auto'));
assert.ok(motionCSS.includes('.field-stage{inset:0}'));
assert.ok(motionCSS.includes('flex-direction:column;justify-content:center;gap:5px;text-align:center'));
report.push('automatic cycling; third field photo fills the frame with subject-focused crop; centered caption over gradient; side arrows at mid-height');
for(const name of ['writing','video','writing']){
  event(document.querySelector(`.workspace-shot[data-workspace="${name}"]`),'pointerenter',{pointerType:'mouse'});
  assert.equal(document.querySelector('.workspace-stage').dataset.active,name);
}
click('.workspace-switch [data-workspace="video"]');
assert.equal(document.querySelector('.workspace-stage').dataset.active,'video');
report.push('workspace hover both ways and touch/button switch');
for(const name of ['x','binance']){
  viewport.scrollY=3200;
  click(`[data-dialog="${name}-dialog"]`);
  const dialog=document.querySelector(`#${name}-dialog`);
  assert.ok(dialog.hasAttribute('open'));
  const expected=name==='x'?'https://x.com/shanhai_y':'https://app.binance.com/uni-qr/cpro/Shanhai_yuyy?l=zh-CN&r=TGE2R26S&uc=web_square_share_link&us=copylink';
  assert.equal(dialog.querySelector('.account-link').getAttribute('href'),expected);
  assert.equal(dialog.querySelector('.account-actions a').getAttribute('href'),expected);
  click(`#${name}-dialog .dialog-close`);
  assert.equal(viewport.scrollY,3200,'closing an account dialog restores the original page position');
  assert.equal(document.body.classList.contains('modal-open'),false);
  assert.equal(focused,document.querySelector(`[data-dialog="${name}-dialog"]`));
}
for(const name of ['writing','fitai']){
  viewport.scrollY=1800;
  click(`[data-dialog="${name}-dialog"]`);
  assert.equal(document.body.style.getPropertyValue('--page-scroll-y'),'-1800px');
  // The same close event is used by the close button, native Escape and backdrop.
  document.querySelector(`#${name}-dialog`).close();
  assert.equal(viewport.scrollY,1800);
}
report.push('all four dialogs lock the reading position before showModal and restore scroll/focus on close');
assert.equal(document.querySelector('.phone-image img').getAttribute('loading'),'eager','FitAI main screenshot must load eagerly');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
assert.ok(!/[↗↘](?!︎)/u.test(html),'diagonal arrows must force text presentation on iOS');
assert.ok(html.includes('&#65038;'),'diagonal arrows should include the VS15 text selector');
report.push('mobile Safari arrows use text presentation, FitAI visual loads eagerly, and dialogs receive neutral programmatic focus');
assert.equal(document.querySelector('.phone-link').getAttribute('href'),'tel:15861999754');
assert.ok(document.querySelector('#contact').textContent.includes('To B 销售'));
const ids=[...document.querySelectorAll('[id]')].map(node=>node.id);
assert.equal(ids.length,new Set(ids).size,'duplicate IDs');
const assets=new Set();
for(const node of document.querySelectorAll('[src],link[href],a[href]')){
  const ref=node.getAttribute('src')||node.getAttribute('href');
  if(/^(https?:|mailto:|tel:|#)/.test(ref))continue;
  const cleanRef=ref.split(/[?#]/,1)[0];
  assert.ok(fs.existsSync(path.join(__dirname,cleanRef)),`Missing asset: ${cleanRef}`);assets.add(cleanRef);
}
for(const file of ['styles.css','refinements.css','interactions.css','polish.css']) cssTree.parse(fs.readFileSync(path.join(__dirname,file),'utf8'));
report.push('social screenshot dialogs, external URLs, telephone, copy, IDs, local assets, CSS parse');
click('[data-copy]');
setImmediate(()=>{
  assert.equal(clipboard,'15861999754');
  assert.equal(document.querySelector('#copy-status').textContent,'微信号已复制');
  console.log(JSON.stringify({passed:true,assets:assets.size,checks:report,browserLayoutChecked:false},null,2));
});
