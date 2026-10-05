'use strict';
const $=id=>document.getElementById(id);
let state=Ronda.create(), timer=null, sound=false, audio, busy=false, started=false, history=[];
const suitNames={dhab:'الفلوس',kass:'الكيسان',syouf:'السيوف',zrawet:'الزراوط'};
function cardNode(card,button=false) {
  const el=document.createElement(button?'button':'div');el.className='card has-img';el.dataset.key=card.suit+'-'+card.rank;
  const label=`${card.rank} ${suitNames[card.suit]}`;if(button){el.type='button';el.setAttribute('aria-label',label);el.title=label;}
  const img=document.createElement('img');img.src=`assets/cards/${card.suit}-${card.rank}.svg`;img.alt=label;
  img.onerror=()=>{img.remove();el.textContent=label;};el.append(img);return el;
}
function beep(){if(!sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=state.events.some(e=>e.includes('ميسّا'))?660:330;g.gain.setValueAtTime(.04,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.15);o.start();o.stop(audio.currentTime+.15);}catch{}}
function render(){
  $('my-score').textContent=state.scores[0];$('bot-score').textContent=state.scores[1];
  $('my-count').textContent=`جمعتي ${state.captured[0].length} ورقة`;$('bot-count').textContent=`جمع ${state.captured[1].length} ورقة`;
  $('stock').textContent=`${state.stock.length} ورقة`;$('round').textContent=`الدورة ${state.round}`;
  $('table').replaceChildren(...state.table.map(c=>cardNode(c)));
  if(!state.table.length){const empty=document.createElement('small');empty.textContent='الطابلة خاوية';$('table').append(empty);}
  $('opponent-hand').replaceChildren(...state.hands[1].map(()=>{const el=document.createElement('div');el.className='card';const img=document.createElement('img');img.src='assets/cards/back.png';img.alt='ورقة مخبية';el.append(img);return el;}));
  $('hand').replaceChildren(...state.hands[0].map((c,i)=>{const el=cardNode(c,true);el.disabled=busy||state.turn!==0||state.phase!=='playing';if(Ronda.capture(state.table,c).length)el.classList.add('hint');el.style.setProperty('--fan-r','90px');el.style.setProperty('--fan-rot',((state.hands[0].length-1)/2-i)*19+'deg');el.style.setProperty('--fan-y',el.classList.contains('hint')?'-10px':'0px');el.onclick=()=>move(0,i);const preview=()=>{const keys=Ronda.capture(state.table,c).map(x=>x.suit+'-'+x.rank);$('table').querySelectorAll('.card').forEach(x=>x.classList.toggle('preview',keys.includes(x.dataset.key)));};el.onmouseenter=preview;el.onfocus=preview;el.onmouseleave=el.onblur=()=>{$('table').querySelectorAll('.preview').forEach(x=>x.classList.remove('preview'));};return el;}));
  document.querySelector('.self').classList.toggle('is-turn',state.turn===0&&state.phase==='playing');document.querySelector('.opponent').classList.toggle('is-turn',state.turn===1&&state.phase==='playing');
  $('message').textContent=[state.events.join(' • '),state.phase==='playing'?(state.turn===0?'دورك — اختار ورقة':'الكمبيوتر كيفكر…'):''].filter(Boolean).join(' | ');
  $('end').hidden=state.phase==='playing';
  if(state.phase!=='playing'){$('result').textContent=state.phase==='finished'?(state.winner===0?'ربحتي! 🏆':'الكمبيوتر ربح هاد المرة'):'سالات الدورة';$('summary').textContent=`نتا: ${state.scores[0]} نقطة (${state.captured[0].length} ورقة) • الكمبيوتر: ${state.scores[1]} نقطة (${state.captured[1].length} ورقة)`;$('continue').textContent=state.phase==='finished'?'نعاودو نلعبو':'الدورة الجاية';}
  clearTimeout(timer);if(started&&!busy&&state.phase==='playing'&&state.turn===1)timer=setTimeout(()=>move(1,Ronda.ai(state)),950);
}
async function fly(el,target){if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=el.getBoundingClientRect(),t=target.getBoundingClientRect(),clone=el.cloneNode(true);clone.className='card has-img flight';Object.assign(clone.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',visibility:'visible'});document.body.append(clone);try{await clone.animate([{transform:'translate(0,0) rotate(-8deg)',opacity:1},{transform:`translate(${t.left+t.width/2-r.left-r.width/2}px,${t.top+t.height/2-r.top-r.height/2}px) rotate(0deg) scale(.75)`,opacity:.5}],{duration:330,easing:'ease-in-out'}).finished;}finally{clone.remove();}}
async function move(p,i){
  if(busy||state.phase!=='playing'||state.turn!==p)return;
  busy=true;clearTimeout(timer);const played=state.hands[p][i],taken=Ronda.capture(state.table,played);const source=p===0?$('hand').children[i]:$('opponent-hand').children[i];
  $('hand').querySelectorAll('button').forEach(b=>b.disabled=true);
  if(source){const clone=cardNode(played);const r=source.getBoundingClientRect();Object.assign(clone.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',visibility:'hidden'});document.body.append(clone);await fly(clone,$('table'));clone.remove();}
  if(taken.length){const keys=taken.map(c=>c.suit+'-'+c.rank);await Promise.all([...$('table').children].filter(el=>keys.includes(el.dataset.key)).map(el=>fly(el,document.querySelector(p===0?'.self':'.opponent'))));}
  if(Ronda.play(state,p,i)){beep();history.push(`${p===0?'نتا':'Kim'}: ${played.rank} ${suitNames[played.suit]} — ${state.events.join(' • ')}`);const bonus=state.events.filter(e=>!e.includes('جمع')&&!e.includes('حط'));if(bonus.length){$('bubble').className=p===0?'bubble-bl':'bubble-tr';$('bubble').textContent=bonus.join(' • ');}else $('bubble').className='hidden';}
  busy=false;render();
}
$('new').onclick=()=>{if(busy)return;clearTimeout(timer);state=Ronda.create();history=[];started=true;$('homeScreen').hidden=true;$('bubble').className='hidden';render();};
$('continue').onclick=()=>{if(state.phase==='finished')state=Ronda.create();else Ronda.next(state);render();};
$('rules').onclick=()=>$('help').showModal();$('close-help').onclick=()=>$('help').close();
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=`الصوت: ${sound?'شاعل':'مطفي'}`;$('sound').setAttribute('aria-pressed',String(sound));beep();};
$('home').onclick=()=>{if(busy)return;started=false;clearTimeout(timer);$('homeScreen').hidden=false;$('play').querySelector('.btn-play-title').textContent='كمّل اللعب';};
$('play').onclick=()=>{started=true;$('homeScreen').hidden=true;render();};
$('homeRules').onclick=()=>$('help').showModal();
$('history').onclick=()=>{$('log').replaceChildren(...history.slice(-40).reverse().map(line=>{const li=document.createElement('li');li.textContent=line;return li;}));if(!history.length)$('log').textContent='مازال ما تلعب حتى دور';$('logDialog').showModal();};
$('close-log').onclick=()=>$('logDialog').close();
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);}else if(started&&!busy)render();});
render();


