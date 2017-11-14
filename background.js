// background.js retains previous user settings from popup.js

// Initialize language and difficulty
var language = "hy";
var difficulty = 5;

chrome.extension.onConnect.addListener(function(port) {
      port.onMessage.addListener(function(msg) {
          // Send language and difficulty
          if(msg[0]==0){
            port.postMessage([language, difficulty]);
          }
          // Store language and difficulty
          else if(msg[0]==1){
            language = msg[1]
            difficulty = msg[2]
          }
      });
 })
