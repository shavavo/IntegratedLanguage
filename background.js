var apiKey = config.TRANSLATE_API_KEY;

//chrome.storage.sync.clear()
chrome.storage.sync.set({'listenerAdded': false});
// Save apiKey to storage
chrome.storage.sync.set({'apiKey': apiKey});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.greeting == "inject"){
          sendResponse({auto: auto, language: language, difficulty: difficulty, apiKey: apiKey});
      }
        if(request.id == "sendingCard") {
            chrome.storage.sync.get(null, function (data) { console.info(data); });
            chrome.storage.sync.get(['authToken', 'set'], function(items) {
                //console.log(items);
                //console.log("reached here");
                var token = items.authToken;
                //console.log(token);
                var currentSet = items.set;
                var url = "https://api.quizlet.com/2.0/sets/" + currentSet + "/terms";
                //console.log(url);
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
                    console.log("posted");
                    chrome.runtime.sendMessage({command: "loadCards"}, function(response) {
                        //console.log("sent message to background");
                    });
                    //console.log("post successful");
                })
                .fail(function(err) {
                    //console.log(err.error_description);
                });
            });
        }
      }
  );
