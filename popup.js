// Initialize connection with background.js
var port = chrome.extension.connect({
     name: "Connect"
});

var language;
var difficulty;
var auto;
var currTab;

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  currTab = tabs[0];
});

var TOGGLE = document.getElementById("toggle")
var e = document.getElementById("languageSelect");
var DIFF =  document.getElementById("difficulty");

if(DIFF){
  DIFF.addEventListener('change', selectDiff, false);
}
if(e){
  e.addEventListener('change', selectLanguage, false);
}
if(TOGGLE){
  TOGGLE.addEventListener('click', toggled, false)
}

// Request difficulty, language from background.js, set corresponding fields
port.postMessage([0]);
port.onMessage.addListener(function(msg) {
      console.log(msg);
     language = msg[0];
     difficulty = msg[1];
     auto = msg[2];
     e.value = msg[0];
     DIFF.value = msg[1];
     if(auto == false) {
         TOGGLE.active = false;
         TOGGLE.innerHTML = "Off";
         TOGGLE.style.backgroundColor = "#455560";
     } else {
         TOGGLE.active = true;
         TOGGLE.innerHTML = "On";
         TOGGLE.style.backgroundColor = "#0A54D3"
     }
});




function toggled() {
    if (auto == true) {
        auto = false
        TOGGLE.active = false
        TOGGLE.innerHTML = "Off"
        TOGGLE.style.backgroundColor = "#455560"
        port.postMessage([1,language, difficulty, auto]);

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
        });
    } else {
      auto = true
      TOGGLE.active = true
      TOGGLE.innerHTML = "On"
      TOGGLE.style.backgroundColor = "#0A54D3"
      port.postMessage([1,language, difficulty, auto]);

      console.log(currTab.id);
      chrome.tabs.executeScript(currTab.id, {file: "inject.js"})


    }
    window.close()

}

function selectLanguage(){
  language = e.options[e.selectedIndex].value;
  port.postMessage([1,language, difficulty, auto]);
  chrome.tabs.executeScript(currTab.id, {file: "inject.js"})
}

function selectDiff(){
  difficulty = DIFF.value;
  port.postMessage([1,language, difficulty, auto]);
  chrome.tabs.executeScript(currTab.id, {file: "inject.js"})
}





// also add a feature so the last one you select is saved in storage
// then you have to change this every time they select a new set
// also make sure that you change it in the click word function as well

$("#translateWord").hover(function() {
    $(this).text("Philly");
}, function() {
    $(this).text("Billy");
});

// handles user authorization for the Quizlet API
$("#quizlet").click(function() {
    var url = "https://quizlet.com/authorize";
    var clientID = "Vyrcd9rkrQ";

    chrome.identity.launchWebAuthFlow (
        {
            "url": url + "?response_type=code&client_id=" + clientID +
            "&scope=read%20write_set&state=gimmeit",
            "interactive": true,
        }, function(redirect_url) {
            if(typeof redirect_url !== "undefined") {
                var code = redirect_url.substring(
                    redirect_url.search("code=") + 5,
                    redirect_url.length
                );
                console.log("url", redirect_url);
                console.log("code", code);
                getAccessToken(code, redirect_url);
            }
        }
    );
});

// updates card set when
$("#setSelect").change(function() {
    loadCards();
});

// change card when you press right arrow
// fix this so only right arrow changes the card
$(document).keydown(function(e) {
    switch(e.which) {
        case 39: // right
        break;
    }
    e.preventDefault(); // prevent the default action
    updateCard();
});

//for the actual version --> set all terms to the same class
$("#translateWord").click(function() {
    var currentSet = $("#setSelect option:selected").val();

    chrome.storage.sync.get('authToken', function(items) {
        var token = items.authToken;
        var url = "https://api.quizlet.com/2.0/sets/" + currentSet + "/terms";
        var word = $("#translateWord").text();

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
                "definition": "testing"
            }
        })
        .done(function(res) {
            loadCards();
            console.log("post successful");
        })
        .fail(function(err) {
            console.log(err.error_description);
        });
    });
});


// runs the app, starting the chain of dominoes
main();

function main() {

    loadSets();

}

// retrieves access token based on code from user authorization
function getAccessToken(code, redirect_url) {
    var secondURL = "https://api.quizlet.com/oauth/token?grant_type=authorization_code&code=" + code + "&redirect_uri=redirect_url";
    var secret = "67g6hDJYBhthpFTGpBNf4m";
    var clientID = "Vyrcd9rkrQ";

    $.ajax({
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(clientID + ":" + secret));
        },
        method: "POST",
        url: "https://api.quizlet.com/oauth/token",
        data: {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_url
        }
    })
    .done(function(res) {
        console.log(res);
        console.log("token", res.access_token);
        saveToken(res.access_token);
        saveUser(res.user_id);
        loadSets();
    })
    .fail(function(err) {
        console.log(err.error_description);
    });
}

// saves access token for API calls
function saveToken(token) {
    chrome.storage.sync.set({'authToken': token}, function() {
          // Notify that we saved.
          console.log("saved to local storage", token);
    });
}

// saves user ID of user
function saveUser(username) {
    chrome.storage.sync.set({'username': username}, function() {
          // Notify that we saved.
          console.log("saved to local storage", username);
    });
}

// loads the select field with user's available sets
function loadSets() {
    chrome.storage.sync.get(['username', 'authToken'], function(items) {
        var username = items.username;
        var token = items.authToken;
        var url = "https://api.quizlet.com/2.0/users/" + username + "/sets";

        $.ajax({
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            method: "GET",
            url: url,
            dataType: "json"
        })
        .done(function(res) {
            console.log(res);
            res.forEach(function(set) {
                $("#setSelect").append("<option value='" + set.id + "'>" + set.title + "</option>");
            });
            loadCards();
        })
        .fail(function(err) {
            console.log(err.error_description);
        });
    });
}

// saves the card set for the current selected set
function loadCards() {
    var currentSet = $("#setSelect option:selected").val();

    chrome.storage.sync.get('authToken', function(items) {
        var token = items.authToken;
        var url = "https://api.quizlet.com/2.0/sets/" + currentSet + "/terms";

        $.ajax({
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            method: "GET",
            url: url,
            dataType: "json"
        })
        .done(function(res) {
            console.log(res);
            var cards = [];
            res.forEach(function(term) {
                cards.push([term.term, term.definition]);
            });

            chrome.storage.sync.set({'currentCards': cards}, function() {
                  // Notify that we saved.
                  console.log(cards);
                  updateCard();
            });

        })
        .fail(function(err) {
            console.log(err.error_description);
        });
    });
}

// changes the UI of the flashcard
function updateCard() {
    chrome.storage.sync.get('currentCards', function(items) {
        var randomIndex = Math.floor(Math.random() * items.currentCards.length);
        $("#term").text(items.currentCards[randomIndex][0]);
        $("#termTranslation").text(items.currentCards[randomIndex][1]);
    });
}
