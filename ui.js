'use strict';
const $=id=>document.getElementById(id);
let state=Ronda.create(), timer=null, sound=false, audio;
const suitNames={dhab:'الفلوس',kass:'الكيسان',syouf:'السيوف',zrawet:'الزراوط'};
function cardNode(card,button=false) {
  const el=document.createElement(button?'button':'div');el.className='card';
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
  $('hand').replaceChildren(...state.hands[0].map((c,i)=>{const el=cardNode(c,true);el.disabled=state.turn!==0||state.phase!=='playing';if(Ronda.capture(state.table,c).length)el.classList.add('hint');el.onclick=()=>move(0,i);return el;}));
  $('message').textContent=[state.events.join(' • '),state.phase==='playing'?(state.turn===0?'دورك — اختار ورقة':'الكمبيوتر كيفكر…'):''].filter(Boolean).join(' | ');
  $('end').hidden=state.phase==='playing';
  if(state.phase!=='playing'){$('result').textContent=state.phase==='finished'?(state.winner===0?'ربحتي! 🏆':'الكمبيوتر ربح هاد المرة'):'سالات الدورة';$('summary').textContent=`نتا: ${state.scores[0]} نقطة (${state.captured[0].length} ورقة) • الكمبيوتر: ${state.scores[1]} نقطة (${state.captured[1].length} ورقة)`;$('continue').textContent=state.phase==='finished'?'نعاودو نلعبو':'الدورة الجاية';}
  clearTimeout(timer);if(state.phase==='playing'&&state.turn===1)timer=setTimeout(()=>move(1,Ronda.ai(state)),950);
}
function move(p,i){if(Ronda.play(state,p,i)){beep();render();}}
$('new').onclick=()=>{clearTimeout(timer);state=Ronda.create();render();};
$('continue').onclick=()=>{if(state.phase==='finished')state=Ronda.create();else Ronda.next(state);render();};
$('rules').onclick=()=>$('help').showModal();$('close-help').onclick=()=>$('help').close();
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=`الصوت: ${sound?'شاعل':'مطفي'}`;$('sound').setAttribute('aria-pressed',String(sound));beep();};
render();

