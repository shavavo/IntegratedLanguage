console.log("hello boy");

//for the actual version --> set all terms to the same class
$(".translateWord").click(function() {
    // var currentSet = $("#setSelect option:selected").val();
    //
    // chrome.storage.sync.get('authToken', function(items) {
    //     var token = items.authToken;
    //     var url = "https://api.quizlet.com/2.0/sets/" + currentSet + "/terms";
    //     var word = $("#translateWord").text();
    //
    //     $.ajax({
    //         xhrFields: {
    //             withCredentials: true
    //         },
    //         beforeSend: function (xhr) {
    //             xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    //         },
    //         method: "POST",
    //         url: url,
    //         dataType: "json",
    //         data: {
    //             "term": word,
    //             "definition": "testing"
    //         }
    //     })
    //     .done(function(res) {
    //         chrome.runtime.sendMessage({command: "loadCards"}, function(response) {
    //             console.log("sent message to background");
    //         });
    //         console.log("post successful");
    //     })
    //     .fail(function(err) {
    //         console.log(err.error_description);
    //     });
    // });

    // $(this).css("color", "red");
    alert("hey boys")
});
