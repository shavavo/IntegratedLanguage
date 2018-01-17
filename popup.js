// Updates quizlet elements based off if user has logged in before
chrome.storage.sync.get('authToken', function(items) {
  var connect = document.getElementById("quizlet")
  var flashcard = document.getElementById("toggleQuizlet")
  if (items.authToken != null) {
    connect.style.display = "none"
    flashcard.style.display = "block"
  } else {
    connect.style.display = "block"
    flashcard.style.display = "none"
  }
});

// Checks if array has duplicates
function hasDuplicates(array) {
  return (new Set(array)).size !== array.length;
}

// Takes full URL and returns hostname only
function extractHostname(url) {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("://") > -1) {
    hostname = url.split('/')[2];
  }
  else {
    hostname = url.split('/')[0];
  }

  //find & remove port number
  hostname = hostname.split(':')[0];
  //find & remove "?"
  hostname = hostname.split('?')[0];

  return hostname;
}

var language;
var difficulty;
var currTab;

// Get selectors by ID
var TOGGLE = document.getElementById("toggle");
var e = document.getElementById("languageSelect");
var DIFF =  document.getElementById("difficulty");

// Create event listeners when settings are changed, calls corresponding function
if(DIFF){
  DIFF.addEventListener('change', selectDiff, false);
}
if(e){
  e.addEventListener('change', selectLanguage, false);
}
if(TOGGLE){
  TOGGLE.addEventListener('click', toggled, false);
}

// Get tabID for future use in refreshing
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  currTab = tabs[0];
});

// Retrieve settings from chrome storage
chrome.storage.sync.get({language: 'hy', difficulty: 60, whitelist: []}, function(items) {
  // Flag to check if current hostname is on whitelist
  onList = items.whitelist.indexOf( extractHostname(currTab.url) ) != -1
  language = items.language
  difficulty = items.difficulty
  e.value = language;
  DIFF.value = difficulty;

  if( !onList ) {
    TOGGLE.active = false;
    TOGGLE.innerHTML = "Off for this domain";
    TOGGLE.style.backgroundColor = "#455560";
  } else {
    TOGGLE.active = true;
    TOGGLE.innerHTML = "On for this domain";
    TOGGLE.style.backgroundColor = "#0A54D3";
  }
});


function toggled() {
  // Translation is on, need to turn off
  if (onList == true) {
    // Change UI to react
    TOGGLE.active = false;
    TOGGLE.innerHTML = "Off for this domain";
    TOGGLE.style.backgroundColor = "#455560";

    // Remove domain to whitelist
    chrome.storage.sync.get({whitelist: []}, function(items) {
      // Get index of hostname to remove later
      var index = items.whitelist.indexOf(extractHostname(currTab.url))
      // Remove hostname from whitelist
      if (index > -1) {
        items.whitelist.splice(index, 1);
      }
      // Save changes
      chrome.storage.sync.set({'whitelist': items.whitelist});

    });

    // Refresh tab
    chrome.tabs.update(currTab.id, {url: currTab.url});

    // Translation is off, need to turn on
  } else {
    // Change UI to reflect change
    TOGGLE.active = true;
    TOGGLE.innerHTML = "On for this domain";
    TOGGLE.style.backgroundColor = "#0A54D3";

    // Add domain to whitelist
    chrome.storage.sync.get({whitelist: []}, function(items) {
      // Append current hostname to whitelist
      items.whitelist.push(extractHostname(currTab.url))

      // If hostname is already in whitelist, remove
      if(hasDuplicates(items.whitelist)) {
        items.whitelist.pop()
        //console.log("Duplicate: Not Added");
        // If hostname is unique save changes, and translate page
      } else {
        chrome.storage.sync.set({'whitelist': items.whitelist}, function() {
          chrome.tabs.executeScript(currTab.id, {file: "inject.js"});
        });
      }
    });
  }

  // Close popup when done
  window.close()

}

// Change language
function selectLanguage(){
  language = e.options[e.selectedIndex].value;
  chrome.storage.sync.set({'language': language});
  chrome.tabs.executeScript(currTab.id, {file: "inject.js"});
}

// Change difficulty
function selectDiff(){
  difficulty = DIFF.value;
  chrome.storage.sync.set({'difficulty': difficulty});
  chrome.tabs.executeScript(currTab.id, {file: "inject.js"});

}







/// methods for event-handling

$('#toggleQuizlet').click(function() {
  $('#quizletIcon').toggleClass("fa fa-plus fa fa-minus");
  updateCard();
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
        getAccessToken(code, redirect_url);
      }
    }
  );
});

// updates card set when
$("#setSelect").change(function() {
  saveSet($("#setSelect option:selected").val());
  loadCards();
});

// change card when you press right arrow
$(document).keydown(function(e) {
  switch(e.which) {
    case 39: // right
    break;
  }
  e.preventDefault(); // prevent the default action
  updateCard();
});



/// methods for core functionality minus events


loadSets();


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
    saveToken(res.access_token);
    saveUser(res.user_id);
    loadSets();
  })
  .fail(function(err) {
    console.log(err.error_description);
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
      $('#setSelect option').remove();
      res.forEach(function(set) {
        $("#setSelect").append("<option value='" + set.id + "'>" + set.title + "</option>");
      });
      loadCards();
      previousSet();
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
      var cards = [];
      res.forEach(function(term) {
        cards.push([term.term, term.definition]);
      });

      chrome.storage.sync.set({'currentCards': cards}, function() {
        // Notify that we saved.
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

function previousSet() {
  chrome.storage.sync.get('set', function(items) {
    var currentSet = items.set;
    //console.log("previous set", currentSet);
    $('#setSelect').val(currentSet);
  });
}



/// methods for persisting Quizlet options

// saves access token for API calls
function saveToken(token) {
  chrome.storage.sync.set({'authToken': token}, function() {
    // Notify that we saved.
  });
}

// saves user ID of user
function saveUser(username) {
  chrome.storage.sync.set({'username': username}, function() {
    // Notify that we saved.
  });
}

//saves the set
function saveSet(set) {
  chrome.storage.sync.set({'set': set}, function() {
    // Notify that we saved.
  });
}
