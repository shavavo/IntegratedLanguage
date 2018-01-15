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

 // also add a feature so the last one you select is saved in storage
 // then you have to change this every time they select a new set
 // also make sure that you change it in the click word function as well

 // handles user authorization for the Quizlet API
 // $("#quizlet").click(function() {
 //     var url = "https://quizlet.com/authorize";
 //     var clientID = "Vyrcd9rkrQ";
 //
 //     chrome.identity.launchWebAuthFlow (
 //         {
 //             "url": url + "?response_type=code&client_id=" + clientID +
 //             "&scope=read%20write_set&state=gimmeit",
 //             "interactive": true,
 //         }, function(redirect_url) {
 //             if(typeof redirect_url !== "undefined") {
 //                 var code = redirect_url.substring(
 //                     redirect_url.search("code=") + 5,
 //                     redirect_url.length
 //                 );
 //                 console.log("url", redirect_url);
 //                 console.log("code", code);
 //                 getAccessToken(code, redirect_url);
 //             }
 //         }
 //     );
 // });

 // updates card set when
 // $("#setSelect").change(function() {
 //     console.log('select changed');
 //     loadCards();
 //     saveSet($("#setSelect option:selected").val());
 //     console.log("saved", $("#setSelect option:selected").val());
 // });

 // change card when you press right arrow
 // fix this so only right arrow changes the card
 // $(document).keydown(function(e) {
 //     switch(e.which) {
 //         case 39: // right
 //         break;
 //     }
 //     e.preventDefault(); // prevent the default action
 //     updateCard();
 // });

 //for the actual version --> set all terms to the same class
 // $("#translateWord").click(function() {
 //     chrome.storage.sync.get(['authToken', 'set'], function(items) {
 //         var token = items.authToken;
 //         var currentSet = items.set;
 //         console.log("get post token", token);
 //         var url = "https://api.quizlet.com/2.0/sets/" + currentSet + "/terms";
 //         var word = $("#translateWord").text();
 //
 //         $.ajax({
 //             xhrFields: {
 //                 withCredentials: true
 //             },
 //             beforeSend: function (xhr) {
 //                 xhr.setRequestHeader('Authorization', 'Bearer ' + token);
 //             },
 //             method: "POST",
 //             url: url,
 //             dataType: "json",
 //             data: {
 //                 "term": word,
 //                 "definition": "testing"
 //             }
 //         })
 //         .done(function(res) {
 //             loadCards();
 //             console.log("post successful");
 //         })
 //         .fail(function(err) {
 //             console.log(err.error_description);
 //         });
 //     });
 // });


 // runs the app, starting the chain of dominoes
 // main();
 //
 // function main() {
 //     console.log("showing what's in chrome storage");
 //     chrome.storage.sync.get(null, function (data) { console.info(data) });
 //     loadSets();
 //     getSet();
 //
 // }

 // retrieves access token based on code from user authorization
 // function getAccessToken(code, redirect_url) {
 //     var secondURL = "https://api.quizlet.com/oauth/token?grant_type=authorization_code&code=" + code + "&redirect_uri=redirect_url";
 //     var secret = "67g6hDJYBhthpFTGpBNf4m";
 //     var clientID = "Vyrcd9rkrQ";
 //
 //     $.ajax({
 //         xhrFields: {
 //             withCredentials: true
 //         },
 //         beforeSend: function (xhr) {
 //             xhr.setRequestHeader('Authorization', 'Basic ' + btoa(clientID + ":" + secret));
 //         },
 //         method: "POST",
 //         url: "https://api.quizlet.com/oauth/token",
 //         data: {
 //             "grant_type": "authorization_code",
 //             "code": code,
 //             "redirect_uri": redirect_url
 //         }
 //     })
 //     .done(function(res) {
 //         console.log(res);
 //         console.log("token", res.access_token);
 //         saveToken(res.access_token);
 //         saveUser(res.user_id);
 //         $("#setSelect").html('');
 //         loadSets();
 //     })
 //     .fail(function(err) {
 //         console.log(err.error_description);
 //     });
 // }

 // saves access token for API calls
 // function saveToken(token) {
 //     chrome.storage.sync.set({'authToken': token}, function() {
 //           // Notify that we saved.
 //           console.log("saved to local storage", token);
 //     });
 // }

 // saves user ID of user
 // function saveUser(username) {
 //     chrome.storage.sync.set({'username': username}, function() {
 //           // Notify that we saved.
 //           console.log("saved to local storage", username);
 //     });
 // }

 // function saveSet(set) {
 //     chrome.storage.sync.set({'set': set}, function() {
 //         console.log("saved set", set);
 //     });
 // }
 //
 // function getSet() {
 //     console.log("getting ready to get set");
 //     chrome.storage.sync.get('set', function(items) {
 //         var set = items.set;
 //         console.log("the set:", set);
 //         $("#setSelect option").each(function() {
 //             if($(this).attr("value") == set) {
 //                 console.log("found the set");
 //                  $(this).attr("selected", "selected");
 //             }
 //         });
 //     });
 // }

 // loads the select field with user's available sets
 // function loadSets() {
 //     chrome.storage.sync.get(['username', 'authToken'], function(items) {
 //         var username = items.username;
 //         var token = items.authToken;
 //         var url = "https://api.quizlet.com/2.0/users/" + username + "/sets";
 //
 //         $.ajax({
 //             xhrFields: {
 //                 withCredentials: true
 //             },
 //             beforeSend: function (xhr) {
 //                 xhr.setRequestHeader('Authorization', 'Bearer ' + token);
 //             },
 //             method: "GET",
 //             url: url,
 //             dataType: "json"
 //         })
 //         .done(function(res) {
 //             console.log(res);
 //             res.forEach(function(set) {
 //                 $("#setSelect").append("<option value='" + set.id + "'>" + set.title + "</option>");
 //             });
 //             loadCards();
 //         })
 //         .fail(function(err) {
 //             console.log(err.error_description);
 //         });
 //     });
 // }

 // saves the card set for the current selected set
 // function loadCards() {
 //     var currentSet = $("#setSelect option:selected").val();
 //
 //     chrome.storage.sync.get('authToken', function(items) {
 //         var token = items.authToken;
 //         var url = "https://api.quizlet.com/2.0/sets/" + currentSet + "/terms";
 //
 //         $.ajax({
 //             xhrFields: {
 //                 withCredentials: true
 //             },
 //             beforeSend: function (xhr) {
 //                 xhr.setRequestHeader('Authorization', 'Bearer ' + token);
 //             },
 //             method: "GET",
 //             url: url,
 //             dataType: "json"
 //         })
 //         .done(function(res) {
 //             console.log(res);
 //             var cards = [];
 //             res.forEach(function(term) {
 //                 cards.push([term.term, term.definition]);
 //             });
 //
 //             chrome.storage.sync.set({'currentCards': cards}, function() {
 //                   // Notify that we saved.
 //                   console.log(cards);
 //                   updateCard();
 //             });
 //
 //         })
 //         .fail(function(err) {
 //             console.log(err.error_description);
 //         });
 //     });
 // }

 // changes the UI of the flashcard
 // function updateCard() {
 //     chrome.storage.sync.get('currentCards', function(items) {
 //         var randomIndex = Math.floor(Math.random() * items.currentCards.length);
 //         $("#term").text(items.currentCards[randomIndex][0]);
 //         $("#termTranslation").text(items.currentCards[randomIndex][1]);
 //     });
 // }



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
