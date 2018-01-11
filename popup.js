// Initialize connection with background.js
var port = chrome.extension.connect({
     name: "Connect"
});



var language;
var difficulty;
var auto;

// Request difficulty, language from background.js, set corresponding fields
port.postMessage([0]);
port.onMessage.addListener(function(msg) {
     language = msg[0]
     difficulty = msg[1]
     auto = msg[2]
     e.value=language;
     DIFF.value=difficulty;
     if (auto == false) {
       TOGGLE.active = false
       TOGGLE.innerHTML = "Manual"
       TOGGLE.style.backgroundColor = "#455560"
     } else {
       TOGGLE.active = true
       TOGGLE.innerHTML = "Auto"
       TOGGLE.style.backgroundColor = "#0A54D3"
     }
});

const TOGGLE = document.getElementById("toggle")
const e = document.getElementById("languageSelect");
const NOUNS = document.getElementById("nouns");
const VERBS = document.getElementById("verbs");
const ADJS = document.getElementById("adjectives");
const DIFF =  document.getElementById("difficulty");

function toggled() {
  if (auto == true) {
    auto = false
    TOGGLE.active = false
    TOGGLE.innerHTML = "Manual"
    TOGGLE.style.backgroundColor = "#455560"
    port.postMessage([1,language, difficulty, auto]);
    console.log(auto);
  } else {
    auto = true
    TOGGLE.active = true
    TOGGLE.innerHTML = "Auto"
    TOGGLE.style.backgroundColor = "#0A54D3"
    port.postMessage([1,language, difficulty, auto]);
    console.log(auto);
  }
}

function selectLanguage(){
  language = e.options[e.selectedIndex].value;
  port.postMessage([1,language, difficulty, auto]);
}

function selectDiff(){
  difficulty = DIFF.value;
  port.postMessage([1,language, difficulty, auto]);
  console.log(difficulty);
}

//ADJS.addEventListener('click', checkAdjs, false)
//VERBS.addEventListener('click', checkVerbs, false)
//NOUNS.addEventListener('click', checkNouns, false)
DIFF.addEventListener('click', selectDiff, false)
DIFF.addEventListener('change', selectDiff, false)
e.addEventListener('click', selectLanguage, false)
e.addEventListener('change', selectLanguage, false)
TOGGLE.addEventListener('click', toggled, false)
