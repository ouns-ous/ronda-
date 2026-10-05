(function (root) {
  'use strict';
  const ranks = [1,2,3,4,5,6,7,10,11,12];
  const suits = ['dhab','kass','syouf','zrawet'];
  function deck() { return suits.flatMap(suit => ranks.map(rank => ({suit,rank}))); }
  function shuffle(cards, rng) { for(let i=cards.length-1;i>0;i--) { const j=Math.floor(rng()*(i+1)); [cards[i],cards[j]]=[cards[j],cards[i]]; } return cards; }
  function combo(hand) { for(const c of hand) { const count=hand.filter(x=>x.rank===c.rank).length; if(count>=2) return {rank:c.rank,points:count===3?5:1}; } return {rank:0,points:0}; }
  function check(s) { const winner=s.scores.findIndex(n=>n>=41); if(winner>=0) {s.winner=winner;s.phase='finished';} }
  function deal(s) {
    s.lastDrop=null;
    s.hands=[[],[]];
    for(let i=0;i<3;i++) for(const p of [1-s.dealer,s.dealer]) s.hands[p].push(s.stock.pop());
    const combos=s.hands.map(combo), total=combos[0].points+combos[1].points;
    if(total) {
      const strength=c=>c.points*100+c.rank;
      if(strength(combos[0])===strength(combos[1])) { s.scores[0]+=total/2;s.scores[1]+=total/2; }
      else s.scores[strength(combos[0])>strength(combos[1])?0:1]+=total;
      s.events.push(combos.map((c,p)=>c.points?`${p===0?'نتا':'الكمبيوتر'}: ${c.points===5?'ترينگا':'روندا'}`:'').filter(Boolean).join(' • '));
    }
    check(s);
  }
  function round(s, rng=Math.random) {
    s.stock=shuffle(deck(),rng);s.table=[];s.captured=[[],[]];s.lastCapture=null;s.lastDrop=null;s.phase='playing';s.events=[];s.round++;
    deal(s);
    // Four distinct ranks without a four-card run.
    while(s.table.length<4) {
      const c=s.stock.pop(), test=[...s.table,c].map(x=>ranks.indexOf(x.rank)).sort((a,b)=>a-b);
      if(s.table.some(x=>x.rank===c.rank)||(test.length===4&&test[3]-test[0]===3)) {s.stock.unshift(c);continue;}
      s.table.push(c);
    }
    s.turn=1-s.dealer;
    return s;
  }
  function create(rng) {return round({scores:[0,0],dealer:1,round:0,winner:null},rng);}
  function capture(table, card) {
    const first=table.find(x=>x.rank===card.rank);if(!first)return [];
    const out=[first];
    for(let i=ranks.indexOf(card.rank)+1;i<ranks.length;i++) {const next=table.find(x=>x.rank===ranks[i]);if(!next)break;out.push(next);}
    return out;
  }
  function play(s,p,index) {
    if(s.phase!=='playing'||s.turn!==p||!Number.isInteger(index)||!s.hands[p][index])return false;
    s.events=[];
    const card=s.hands[p].splice(index,1)[0], taken=capture(s.table,card);
    const final=s.stock.length===0&&s.hands.every(h=>h.length===0);
    if(taken.length) {
      if(s.lastDrop&&s.lastDrop.player!==p&&s.lastDrop.card.rank===card.rank&&taken.includes(s.lastDrop.card)) {s.scores[p]++;s.events.push('ضربة +1');}
      s.table=s.table.filter(c=>!taken.includes(c));s.captured[p].push(card,...taken);s.lastCapture=p;s.lastDrop=null;
      if(!s.table.length&&!final) {s.scores[p]++;s.events.push('ميسّا! +1');}
      if(!s.events.length)s.events.push(`جمع ${taken.length+1} ورقات`);
    } else {s.table.push(card);s.lastDrop={player:p,card};s.events.push('حط ورقة فالطابلة');}
    s.turn=1-p;check(s);
    if(s.phase==='finished')return true;
    if(s.hands.every(h=>h.length===0)) {
      if(s.stock.length)deal(s);
      else {
        if(s.table.length) {s.captured[s.lastCapture===null?s.dealer:s.lastCapture].push(...s.table);s.table=[];}
        s.captured.forEach((pile,i)=>s.scores[i]+=Math.max(0,pile.length-20));s.phase='roundEnd';check(s);
      }
    }
    return true;
  }
  function next(s,rng) {if(s.phase!=='roundEnd')return false;s.dealer=1-s.dealer;round(s,rng);return true;}
  function ai(s) {let best=0,value=-Infinity;s.hands[1].forEach((card,i)=>{const taken=capture(s.table,card);const score=taken.length*3+(taken.length&&taken.length===s.table.length?6:0)+(s.lastDrop&&s.lastDrop.card.rank===card.rank?4:0)-ranks.indexOf(card.rank)*0.05;if(score>value){best=i;value=score;}});return best;}
  const api={create,play,next,capture,ai,deck,ranks};root.Ronda=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
