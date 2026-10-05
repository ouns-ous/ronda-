const assert=require('node:assert/strict');
const R=require('./engine');
const c=rank=>({rank,suit:'dhab'});
assert.equal(R.deck().length,40);
assert.deepEqual(R.capture([c(6),c(7),c(10),c(12)],c(6)).map(c=>c.rank),[6,7,10]);
assert.equal(R.capture([c(4)],c(3)).length,0);
function fixture(table,hand,stock=[]) {return {table,hands:[hand,[c(12)]],stock,captured:[[],[]],scores:[0,0],phase:'playing',turn:0,dealer:1,lastDrop:null,lastCapture:null,events:[]};}
let s=fixture([c(6),c(7),c(10)],[c(6)]);s.lastDrop={player:1,card:s.table[0]};
assert.equal(R.play(s,1,0),false);assert.equal(R.play(s,0,-1),false);
R.play(s,0,0);assert.equal(s.captured[0].length,4);assert.equal(s.scores[0],2);
s=fixture([c(4)],[c(4)]);s.hands[1]=[];R.play(s,0,0);assert.equal(s.scores[0],0);assert.equal(s.phase,'roundEnd');
let seed=1742;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
for(let game=0;game<300;game++){
  s=R.create(rng);let turns=0;
  while(s.phase!=='finished'){
    if(s.phase==='roundEnd'){assert.equal(s.captured.flat().length,40);R.next(s,rng);}
    else {assert.equal(new Set(s.table.map(c=>c.rank)).size,s.table.length);assert.equal(R.play(s,s.turn,s.turn===1?R.ai(s):Math.floor(rng()*s.hands[0].length)),true);}
    const all=[...s.stock,...s.table,...s.hands.flat(),...s.captured.flat()];
    assert.equal(all.length,40);assert.equal(new Set(all.map(c=>c.suit+'-'+c.rank)).size,40);
    assert.ok(++turns<4000,'game must terminate');
  }
  assert.ok(s.scores[s.winner]>=41);
}
console.log('Ronda: capture, bonuses, last card, invalid moves and 300 full matches passed.');
