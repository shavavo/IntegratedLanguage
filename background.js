// background.js retains previous user settings from popup.js

// Initialize language and difficulty
var language = "hy";
var difficulty = 5;
var auto = false;
var apiKey = config.TRANSLATE_API_KEY

chrome.extension.onConnect.addListener(function(port) {
      port.onMessage.addListener(function(msg) {
          // Send language and difficulty
          if(msg[0]==0){
            port.postMessage([language, difficulty, auto]);
          }
          // Store language and difficulty
          else if(msg[0]==1){
            language = msg[1];
            difficulty = msg[2];
            auto = msg[3];
          }
      });
 });

// posts word to Quizlet API when a foreign word is clicked
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.greeting == "inject"){
          sendResponse({auto: auto, language: language, difficulty: difficulty, apiKey: apiKey});
      }
        if(request.id == "sendingCard") {
            chrome.storage.sync.get(null, function (data) { console.info(data) });
            chrome.storage.sync.get(['authToken', 'set'], function(items) {
                console.log(items);
                console.log("reached here");
                var token = items.authToken;
                console.log(token);
                var currentSet = items.set;
                var url = "https://api.quizlet.com/2.0/sets/" + currentSet + "/terms";
                console.log(url);
                var word = request.word;
                var definition = request.def;

                $.ajax({
                    xhrFields: {
                        withCredentials: true
                    },
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                    },
                    method: "POST",
                    url: url,
                    dataType: "json",
                    data: {
                        "term": word,
                        "definition": definition
                    }
                })
                .done(function(res) {
                    chrome.runtime.sendMessage({command: "loadCards"}, function(response) {
                        console.log("sent message to background");
                    });
                    console.log("post successful");
                })
                .fail(function(err) {
                    console.log(err.error_description);
                });
            });
        }
      }
  );
