const MESSAGE="O ARTUR VAI TER UM IRMÃO";
const NORMALIZED=MESSAGE.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const MAX_ATTEMPTS=12;
const LETTERS="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const board=document.getElementById("board");
const keyboard=document.getElementById("keyboard");
const wrongEl=document.getElementById("wrong");
const mascot=document.getElementById("mascot");
const speech=document.getElementById("speech");
const hintText=document.getElementById("hint-text");
const challengeStatus=document.getElementById("challenge-status");
const gameScreen=document.getElementById("game-screen");
const revealScreen=document.getElementById("reveal-screen");
const wordReveal=document.getElementById("word-reveal");
const bigWord=document.getElementById("big-word");
const finalMessage=document.getElementById("final-message");
const revealIntro=document.getElementById("reveal-intro");
const dialog=document.getElementById("guess-dialog");
const guessForm=document.getElementById("guess-form");
const phraseInput=document.getElementById("phrase-input");
const guessError=document.getElementById("guess-error");

let guessed=new Set();
let wrong=new Set();
let attempts=MAX_ATTEMPTS;
let revealTimer;

function normalize(s){
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().trim();
}

function renderBoard(){
  board.innerHTML="";
  MESSAGE.split(" ").forEach((word,wi)=>{
    const row=document.createElement("div");
    row.className="word-row";
    [...word].forEach(char=>{
      const cell=document.createElement("div");
      const n=normalize(char);
      cell.className="cell";
      if(guessed.has(n)){
        cell.textContent=char;
        cell.classList.add("revealed");
      }
      row.appendChild(cell);
    });
    board.appendChild(row);
    if(wi<MESSAGE.split(" ").length-1){
      const spacer=document.createElement("div");
      spacer.className="word-spacer";
      board.appendChild(spacer);
    }
  });
}

function renderKeyboard(){
  keyboard.innerHTML="";
  LETTERS.forEach(letter=>{
    const key=document.createElement("button");
    key.className="key";
    key.textContent=letter;
    key.disabled=guessed.has(letter)||wrong.has(letter);
    if(guessed.has(letter))key.classList.add("correct");
    if(wrong.has(letter))key.classList.add("wrong");
    key.addEventListener("click",()=>choose(letter));
    keyboard.appendChild(key);
  });
}

function setMood(){
  const misses=wrong.size;
  const moods=[
    [0,"Tenho uma coisa para vos dizer...","Há alguém que já conhece o segredo."],
    [1,"Hmm... estão quentes. 🐶","O Artur está a tentar não se descair."],
    [3,"Não vou dizer nada! 👀","O segredo continua bem guardado."],
    [5,"Estou a ficar nervoso...","Pensem como uma equipa de engenharia."],
    [7,"Isto está a ficar perigoso. 😳","Ainda há tempo para um bom palpite."],
    [9,"OK, isto está quase a dar deploy... 🚨","O Artur já não consegue disfarçar."],
    [11,"ÚLTIMA oportunidade de dignidade. 😂","Se isto fosse produção, já havia rollback."]
  ];
  const current=[...moods].reverse().find(([threshold])=>misses>=threshold) || moods[0];
  speech.textContent=current[1];
  hintText.textContent=current[2];
  challengeStatus.textContent=misses===0?"Segredo em progresso":misses>=9?"Artur está nervoso":"Ainda há esperança";
}

function choose(letter){
  if(guessed.has(letter)||wrong.has(letter)||attempts<=0)return;
  if(NORMALIZED.includes(letter)){
    guessed.add(letter);
    mascot.animate(
      [{transform:"rotate(0deg) scale(1)"},{transform:"rotate(-7deg) scale(1.04)"},{transform:"rotate(7deg) scale(1.04)"},{transform:"rotate(0deg) scale(1)"}],
      {duration:350}
    );
  }else{
    wrong.add(letter);
    attempts--;
    mascot.animate(
      [{transform:"translateX(0)"},{transform:"translateX(-7px)"},{transform:"translateX(7px)"},{transform:"translateX(0)"}],
      {duration:260}
    );
  }
  renderBoard();
  renderKeyboard();
  wrongEl.textContent=wrong.size?[...wrong].join(" · "):"—";
  setMood();

  if(isSolved()){
    setTimeout(reveal,500);
  }else if(attempts===0){
    setTimeout(()=>{
      speech.textContent="Ok... esta sprint merece um retry. 🐶";
      challengeStatus.textContent="Retry recomendado";
      alert("O Artur recusou-se a aceitar este resultado. 😈\n\nCarreguem em Recomeçar e tentem outra vez.");
    },150);
  }
}

function isSolved(){
  return [...new Set(NORMALIZED.match(/[A-Z]/g))].every(c=>guessed.has(c));
}

function reveal(){
  gameScreen.classList.add("hidden");
  revealScreen.classList.remove("hidden");
  wordReveal.classList.remove("complete");
  finalMessage.classList.add("hidden");
  revealIntro.textContent="O Artur tem uma novidade...";
  bigWord.textContent="ARTUR";
  wordReveal.classList.remove("show-first","show-second");
  void wordReveal.offsetWidth;
  wordReveal.classList.add("show-first");
  makeConfetti(22);

  clearTimeout(revealTimer);
  revealTimer=setTimeout(()=>{
    bigWord.textContent="IRMÃO!";
    wordReveal.classList.remove("show-first");
    void wordReveal.offsetWidth;
    wordReveal.classList.add("show-second");
    makeConfetti(80);
  },1500);

  revealTimer=setTimeout(()=>{
    wordReveal.classList.add("complete");
    revealIntro.textContent="Artur acaba de ser promovido.";
    finalMessage.classList.remove("hidden");
    finalMessage.classList.add("final-arrive");
    window.scrollTo({top:0,behavior:"smooth"});
  },3000);
}

function makeConfetti(count=75){
  const c=document.getElementById("confetti");
  c.innerHTML="";
  for(let i=0;i<count;i++){
    const el=document.createElement("i");
    el.style.left=`${Math.random()*100}%`;
    el.style.animationDelay=`${Math.random()*1.1}s`;
    el.style.transform=`rotate(${Math.random()*180}deg)`;
    c.appendChild(el);
  }
}

function reset(){
  clearTimeout(revealTimer);
  guessed=new Set();
  wrong=new Set();
  attempts=MAX_ATTEMPTS;
  revealScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  wordReveal.classList.remove("complete","show-first","show-second");
  finalMessage.classList.add("hidden");
  wrongEl.textContent="—";
  setMood();
  renderBoard();
  renderKeyboard();
}

document.getElementById("reset-btn").addEventListener("click",reset);
document.getElementById("again-btn").addEventListener("click",reset);
document.getElementById("guess-btn").addEventListener("click",()=>{
  guessError.textContent="";
  phraseInput.value="";
  dialog.showModal();
  setTimeout(()=>phraseInput.focus(),50);
});

guessForm.addEventListener("submit",e=>{
  e.preventDefault();
  if(normalize(phraseInput.value)===normalize(MESSAGE)){
    dialog.close();
    reveal();
  }else{
    guessError.textContent="Nop. O Artur sabe que conseguem melhor. 🐶";
    phraseInput.select();
  }
});

setMood();
renderBoard();
renderKeyboard();
