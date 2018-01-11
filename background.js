// background.js retains previous user settings from popup.js

// Initialize language and difficulty
var language = "hy";
var difficulty = 5;
var auto = true;
var apiKey = config.TRANSLATE_API_KEY;

chrome.extension.onConnect.addListener(function(port) {
      port.onMessage.addListener(function(msg) {
          // Send language and difficulty
          if(msg[0]==0){
            port.postMessage([language, difficulty, auto]);
          }
          // Store language and difficulty
          else if(msg[0]==1){
            language = msg[1]
            difficulty = msg[2]
            auto = msg[3]
          }
      });
})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "inject"){
      sendResponse({auto: auto, language: language, difficulty: difficulty, apiKey: apiKey});
      console.log(auto);
    }

  });
