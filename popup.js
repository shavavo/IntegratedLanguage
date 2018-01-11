// Initialize connection with background.js
var port = chrome.extension.connect({
     name: "Connect"
});

var language;
var difficulty;

// Request difficulty, language from background.js, set corresponding fields
port.postMessage([0]);
port.onMessage.addListener(function(msg) {
     language = msg[0]
     difficulty = msg[1]
     document.getElementById('languageSelect').value=language;
     document.getElementById('difficulty').value=difficulty;
});


const e = document.getElementById("languageSelect");
const NOUNS = document.getElementById("nouns");
const VERBS = document.getElementById("verbs");
const ADJS = document.getElementById("adjectives");
const DIFF =  document.getElementById("difficulty");
const START = document.getElementById("start");


function selectLanguage(){
  language = e.options[e.selectedIndex].value;
}

function selectDiff(){
  difficulty = DIFF.value;
  console.log(difficulty);
}

function translate(){
  // Get tab ID and call inject.js on tab
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, function(tabs) {
      //console.log(tabs[0].id);
      var tab = tabs[0];
      chrome.tabs.executeScript(tab.id,{file:"inject.js"},function(){
        // Save language and difficulty
        port.postMessage([1,language, difficulty, config.TRANSLATE_API_KEY]);
        chrome.tabs.sendMessage(tab.id, {language:language, difficulty: difficulty, apiKey: config.TRANSLATE_API_KEY});
        window.close();
      });
    });
}

//ADJS.addEventListener('click', checkAdjs, false)
//VERBS.addEventListener('click', checkVerbs, false)
//NOUNS.addEventListener('click', checkNouns, false)
DIFF.addEventListener('click', selectDiff, false)
DIFF.addEventListener('change', selectDiff, false)
e.addEventListener('click', selectLanguage, false)
e.addEventListener('change', selectLanguage, false)
START.addEventListener('click',translate,false)
