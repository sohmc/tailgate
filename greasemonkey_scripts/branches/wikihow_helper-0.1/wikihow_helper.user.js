// ==UserScript== 
// @name        wikiHow Helper
// @author      Michael Soh 
// @namespace   wikihow_helper
// @description Helps you do the more tedious tasks in wikiHow.
// @version     0.1
// @license     GPL 3.0 
// @include     http://*.wikihow.com/* 
//  
// 
// ==/UserScript== 

// @require     http://usocheckup.redirectme.net/UID.js

var addressRegExp = /http:\/\/.*wikihow.com\/(.*)$/;
var current_page = '';
var debug = 5;

addressRegExp.exec(document.location);
parse_address(RegExp.$1);


// =-=-=-=-=- FUNCTIONS -=-=-=-=-= //

function RCpatrol() {
    
}

function new_users() {
    var nodes = evaluate_xpath(".//*[@id='bodycontents']/div/ul/.//a[2][not(@class[starts-with(.,'new')])]/..");
    show_only_new_users(nodes);

    var nodes = evaluate_xpath(".//*[@id='bodycontents']/div/ul/.//a[2][@class[starts-with(.,'new')]]");

    for (var i = 0; i < nodes.snapshotLength; i++) {
        var current_node = nodes.snapshotItem(i);

        current_node.addEventListener('click', leave_message, true);
        current_node.setAttribute('href', '#');
    }
}

function leave_message() {
    GM_log(this.getAttribute('title'));
}

function new_contributors() {
    var nodes = evaluate_xpath(".//*[@id='bodycontents']/div/div/ol/.//a[2][not(@class[starts-with(.,'new')])]/..");
    show_only_new_users(nodes);
    insert_comment_div();
    
    nodes = evaluate_xpath(".//*[@id='bodycontents']/div/div/ol/.//a[2][@class[starts-with(.,'new')]]");
    for (var i = 0; i < nodes.snapshotLength; i++) {
        var this_node = nodes.snapshotItem(i);
        var talk_link = this_node.getAttribute("title");
        var reg = /User_talk:(.+)/;
        reg.exec(talk_link);
        this_node.setAttribute("title", "Click to send a message to " + RegExp.$1);
        this_node.addEventListener("click", quickNote, true);
        this_node.setAttribute("href", "#");
        this_node.setAttribute("user", talk_link);
    }

}

function show_only_new_users(nodes_to_remove) {
    var parent_node = nodes_to_remove.snapshotItem(0).parentNode;
    
    for (var i = 0; i < nodes_to_remove.snapshotLength; i++) {
        parent_node.removeChild(nodes_to_remove.snapshotItem(i));
    }
}

function parse_address(page) {
    if (page.match(/Special:RCPatrol/)) {
        RCpatrol();
    } else if (page.match(/Special:Newcontributors/)) {
        new_contributors();
    } else if (page.match(/Special:Log\/newusers/) || (page.match(/Special:Log.*type=newusers/))) {
        new_users();
    } else {
        GM_log("Unknown Page: " + page);
    }

}

// =-=-=-=-=- wikiHow-specific functions -=-=-=-=-= //
// Functions within this section was copied from wikiHow's version of
// MediaWiki, available http://src.wikihow.com/
//
// Functions licensed under GPL 2.0

//function initQuickNote( qnArticle, qnUser, contrib, regdate ) {
//   //     article = urldecode(qnArticle);
//
//    var mesid = document.getElementById('comment_text');
//    var message = qnMsgBody.replace(/\<nowiki\>|\<\/nowiki\>/ig, '');
//    message = message.replace(/\[\[ARTICLE\]\]/, '[['+article+']]');
//    mesid.value = message;
//    maxChar2 = maxChar + message.length;
//
//    users           = qnUser.split("|");
//    regdates        = regdate.split("|");
//    contribs        = contrib.split("|");
//
//    html = "Leave a quick note for ";
//
//    if (users.length > 1) {
//         html += "<select id='userdropdown' onchange='switchUser();'>";
//    for (i = 0; i < users.length; i++) {
//         html += "<OPTION value='" + i + "'>" + users[i] + "</OPTION>";
//    }
//         html += "</select>";
//    } else {
//         html += "<input type='hidden' name='userdropdown' id='userdropdown' value'" + users[0] +"'/><b>" + users[0] + "</b>."
//    }
//    html += "<br/><span id='contribsreg'>";
//
//    $('#qnTarget').val("User_talk:"+users[0]);
//
//    var editorid = $('#qnEditorInfo');
//    editorid.html(html);
//
////    document.getElementById('modalPage').style.display = 'block';
//    return false;
//}

function insert_comment_div() {
    var background_div = document.createElement('div');
    background_div.setAttribute('id', 'modalBackground');
    background_div.setAttribute('class', 'modalBackground');
    background_div.setAttribute('style', 'display: none;');

    var comment_div = document.createElement('div');
    comment_div.setAttribute('id', 'modalContainer');
    comment_div.setAttribute('class', 'modalContainer');
    comment_div.setAttribute('style', 'display: none;');

    comment_div.innerHTML = " \
        <link rel=\"stylesheet\" type=\"text\/css\" href=\"http://pad3.whstatic.com/extensions/min/f/extensions/wikihow/quicknote.css?2471\"> \
        <link rel=\"stylesheet\" type=\"text\/css\" href=\"http://pad3.whstatic.com/extensions/min/f/extensions/wikihow/popupEdit.css,skins/WikiHow/articledialog.css&rev=3052\"> \
        <img height=\"10\" width=\"679\" style=\"display: block;\" src=\"http://pad2.whstatic.com/skins/WikiHow/images/article_top.png\"> \
        <div class=\"modalContent\" id=\"quicknotecontent\"> \
               <div id=\"modalHeader\"> \
                    <a id=\"modal_x\"><img height=\"21\" width=\"21\" alt=\"X\" src=\"http://pad3.whstatic.com/extensions/wikihow/winpop_x.gif\"></a> \
                    <img alt=\"wikiHow\" id=\"modal_logo\" src=\"http://pad1.whstatic.com/skins/WikiHow/images/wikihow.gif\"> \
               </div><!--end editModalHeader--> \
               <div class=\"modalBody\"> \
                    <div id=\"qnEditorInfo\">Leave a quick note for <span id=\"comment_target\" style=\"font-weight: bold;\">wHUser</span>.</div> \
                    <form name=\"postcommentForm\" id=\"postcommentForm\"> \
                         <input type=\"hidden\" value=\"User_talk:wHUser\" name=\"target\" id=\"qnTarget\"> \
                         <textarea rows=\"8\" cols=\"40\" name=\"comment_text\" id=\"comment_text\" tabindex=\"4\"></textarea> \
                         <input type=\"button\" style=\"font-size: 110%; margin-left: 0pt; float: right;\" id=\"postcommentbutton\" class=\"button button100 submit_button\" value=\"Post\" tabindex=\"5\"> \
                         <a style=\"float: right; margin-right: 10px; line-height: 25px;\" id=\"modal_cancel\" tabindex=\"6\" href=\"#\">Cancel</a><br class=\"clearall\"> \
                    </form> \
               </div> \
        </div><!--end modalContent--> \
        <img height=\"10\" width=\"679\" style=\"display: block;\" alt=\"\" src=\"http://pad2.whstatic.com/skins/WikiHow/images/article_bottom_wh.png\">";

     document.getElementById('bodycontents').appendChild(comment_div);
     document.getElementById('bodycontents').appendChild(background_div);

     document.getElementById('modal_x').addEventListener('click', closeQuickNote, true);
     document.getElementById('modal_cancel').addEventListener('click', closeQuickNote, true);
     document.getElementById('postcommentbutton').addEventListener('click', submitNote, true);
}

// =-=-=-=-=- END OF WIKIHOW FUNCTIONS -=-=-=-=-= //

// =-=-=- Functions to help wikiHow -=-=-= //
// The following functions are NOT a part of wikiHow and are used to
// interact with the wikiHow functions contained above.

function closeQuickNote() {
     document.getElementById('qnTarget').value = '';
     document.getElementById('comment_text').value = '';
     document.getElementById('modalBackground').style.display = 'none';
     document.getElementById('modalContainer').style.display = 'none';
}

function quickNote() {
     document.getElementById('comment_target').innerHTML = this.getAttribute('user');
     document.getElementById('qnTarget').value = "User_talk:" + this.getAttribute('user');
     
     if (debug > 2) {
          document.getElementById('comment_target').innerHTML = 'Sohmc-sock';
          document.getElementById('qnTarget').value = "User_talk:Sohmc-sock";
     }

     document.getElementById('modalBackground').style.display = 'block';
     document.getElementById('modalContainer').style.display = 'block';
     document.getElementById('modalContainer').style.position = 'fixed';
}

function submitNote() {
     var comment = document.getElementById('comment_text').value;
     var comment_target = document.getElementById('qnTarget').value;

     var post_data = 'comment_text=' + encodeURIComponent(comment) + "&target=" + encodeURIComponent(comment_target);
     alert('submitting note.');

     GM_xmlhttpRequest({
          method:'POST',
          url:'/Special:Postcomment?fromajax=true',
          headers:{
               'Content-Type':'application/x-www-form-urlencoded',
          },
          data:post_data,
          onload: function (response) {
               if (response.status == 200) {
                    if (response.responseText.indexOf(comment) != -1) {
                         alert('Comment successfully posted');
                    } else {
                         alert('Comment could not be posted.  Please check the console.');
                         GM_log(response.responseText);
                    }
               } else {
                    alert('wikiHow returned error code ' + response.status);
               }
          },
          onerror: function (response) {
               alert('An unexpected error has occured.');
               GM_log(response.responseText);
         }
     });
     closeQuickNote();
     return false;
}


// =-=-=-=-=- Standard Functions -=-=-=-=-= //
// The following functions are ones that I've created and use in pretty
// much every script I write.

function evaluate_xpath(xpath_query) {
    if (debug >= 2) GM_log(xpath_query);
    var nodes = document.evaluate(xpath_query, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    if (debug >= 1) GM_log('number of nodes returned: ' + nodes.snapshotLength);

    return nodes;
}
