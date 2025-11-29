/* ---------- CONFETTI ---------- */
const confettiCanvas = document.getElementById('confetti');
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;
const ctx = confettiCanvas.getContext('2d');

let confettiParticles = [];

function createConfetti(){
  const x = Math.random()*window.innerWidth;
  const y = Math.random()*window.innerHeight - window.innerHeight;
  const size = Math.random()*8 + 4;
  const speed = Math.random()*3 + 2;
  const color = `hsl(${Math.random()*360},100%,50%)`;
  confettiParticles.push({x,y,size,speed,color});
}

function drawConfetti(){
  ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
  confettiParticles.forEach(p=>{
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x,p.y,p.size,p.size);
    p.y += p.speed;
  });
  confettiParticles = confettiParticles.filter(p=>p.y<window.innerHeight);
  requestAnimationFrame(drawConfetti);
}
drawConfetti();

function launchConfetti(){
  for(let i=0;i<100;i++) createConfetti();
}

/* ---------- GAME DATA ---------- */
const players = [
  {id:1, label:"His Mood swings from work to chill", type:"audio", audios:["sounds/charan_work-chill.mp3"], emoji:"👨", name:"charan"},
  {id:2, label:"His Double Shades", type:"multi", audios:["sounds/umesh_strangers.mp3","sounds/umesh_known.mp3"], options:["For Strangers","For known persons"], emoji:"👨", name:"umesh"},
  {id:3, label:"Dad's girl", type:"multi", audios:["sounds/suma_default.mp3","sounds/suma_work.mp3"], options:["Default","At Work"], emoji:"👩", name:"suma"},
  {id:4, label:"Soft and Calm", type:"audio", audios:["sounds/vishnu.mp3"], emoji:"👨", name:"vishnu"},
  {id:5, label:"Play Audio", type:"multi", audios:["sounds/moushmi.mp3","sounds/moushmi_smile.mp3"],options:["Her core side","Her smile"], emoji:"👩", name:"moushmi"},
  {id:6, label:"good girl", type:"audio", audios:["sounds/akshaya.mp3"], emoji:"👩", name:"akshaya"},
  {id:7, label:"LEADER", type:"audio", audios:["sounds/surya_sir.mp3","sounds/surya.mp3"], emoji:"👨", name:"surya"},
  {id:8, label:"Her English be like", type:"audio", audios:["sounds/HR_English.mp3"], emoji:"👨", name:"HR"},
  {id:9, label:"Friends", type:"audio", audios:["sounds/keerthana.mp3"], emoji:"👨", name:"keerthana"},
  {id:10, label:"Friends", type:"audio", audios:["sounds/reshma.mp3"], emoji:"👨", name:"reshma"},
  {id:11, label:"Last but not the least", type:"audio", audios:["sounds/harsha_sir.mp3"], emoji:"👨", name:"harsha"},
  
];

let totalToPlay = players.length;
let completed = 0;
let score = 0;

/* ---------- UI Elements ---------- */
const grid = document.getElementById('grid');
const scoreBox = document.getElementById('scoreBox');
const resultPanel = document.getElementById('resultPanel');
const scoreText = document.getElementById('scoreText');
const finalAction = document.getElementById('finalAction');
const okFinal = document.getElementById('okFinal');

/* ---------- UPDATE SCORE ---------- */
function updateScore(){
  scoreBox.textContent = `Score: ${score} / ${totalToPlay}`;
}

/* ---------- CREATE CARDS ---------- */
players.forEach(p=>{
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = p.id;

  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <div class="person-role">${p.label}</div>
      </div>
      <div class="avatar">${p.emoji}</div>
    </div>
    <div class="panel">
      <div class="controls" style="display:flex;flex-direction:column;align-items:center;width:100%"></div>
    </div>
  `;

  grid.appendChild(card);
  const controls = card.querySelector('.controls');

  if(p.type==="audio"){
    const btn = document.createElement('button');
    btn.className='play-btn';
    btn.textContent='Play Audio';
    btn.onclick = ()=> playAudio(card,p,p.audios[0]);
    controls.appendChild(btn);
  } else if(p.type==="multi"){
    p.options.forEach((opt,i)=>{
      const btn = document.createElement('button');
      btn.className='opt-btn';
      btn.textContent=opt;
      btn.onclick = ()=> playAudio(card,p,p.audios[i]);
      controls.appendChild(btn);
    });
  }

  const guessWrap = document.createElement('div');
  guessWrap.style.display='none';
  guessWrap.innerHTML = `
    <div class="hint">Guess the person's name:</div>
    <div class="guess-area">
      <input class="guess-input" placeholder="Type name here..." />
      <button class="ok-btn submitGuess">Submit</button>
    </div>
    <div class="small-muted resultMessage" style="height:26px;margin-top:8px"></div>
  `;
  controls.appendChild(guessWrap);

  card.addEventListener('click', e=>{
    if(e.target.tagName.toLowerCase()==='button'||e.target.tagName.toLowerCase()==='input') return;
    document.querySelectorAll('.card.open').forEach(c=>{ if(c!==card)c.classList.remove('open'); });
    card.classList.toggle('open');
  });

  guessWrap.querySelector('.submitGuess').addEventListener('click', ()=>{
    const val = guessWrap.querySelector('.guess-input').value.trim().toLowerCase();
    handleGuess(p,val,guessWrap,card);
  });
});

/* ---------- PLAY AUDIO ---------- */
function playAudio(card,p,src){
  openCard(card);
  const controls = card.querySelector('.controls');
  const existing = controls.querySelector('audio');
  if(existing) existing.remove();

  const audio = document.createElement('audio');
  audio.src = src;
  audio.controls = true;
  audio.autoplay = true;
  controls.insertBefore(audio, controls.querySelector('div'));

  const guessWrap = controls.querySelector('div[style]');
  guessWrap.style.display='block';
  guessWrap.querySelector('.guess-input').value='';
  guessWrap.querySelector('.guess-input').focus();
}

function openCard(card){
  document.querySelectorAll('.card.open').forEach(c=>{ if(c!==card)c.classList.remove('open'); });
  card.classList.add('open');
}

/* ---------- GUESS HANDLER (FIXED) ---------- */
function handleGuess(p,value,guessWrap,card){
  if(!value) return;

  const msgEl = guessWrap.querySelector('.resultMessage');

  if(value === p.name.toLowerCase()){
    msgEl.textContent = 'Correct! 🎉';
    msgEl.style.color='green';

    if(!card.classList.contains('completed')){
      score++; completed++;
      card.classList.add('completed');
      updateScore();
      celebrate(card);
    }

    guessWrap.querySelector('.guess-input').disabled = true;
    guessWrap.querySelector('.submitGuess').disabled = true;

    checkFinish();
  } 
  else {
    msgEl.textContent = 'Wrong! Try again 😅';
    msgEl.style.color='red';
  }
}

/* ---------- FINISH CHECK ---------- */
function checkFinish(){
  if(completed>=totalToPlay){
    scoreText.textContent = `You got ${score} / ${totalToPlay} correct! 🎯`;
    finalAction.style.display='block';
    resultPanel.classList.add('show');
  }
}

/* ---------- FINAL VIDEO FLOW ---------- */
okFinal.addEventListener('click', ()=>{
  window.location.href = 'funpage.html';
});

/* ---------- SIMPLE CELEBRATION ---------- */
function celebrate(card){
  card.style.transform='scale(1.05)';
  setTimeout(()=>card.style.transform='scale(1)',500);
}

/* ---------- INITIAL SCORE ---------- */
updateScore();
