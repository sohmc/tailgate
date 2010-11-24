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
}

function new_contributors() {
    var nodes = evaluate_xpath(".//*[@id='bodycontents']/div/div/ol/.//a[2][not(@class[starts-with(.,'new')])]/..");
    show_only_new_users(nodes);
}

function create_quick_edits() {
        
}

function show_only_new_users(nodes_to_remove) {
    var parent_node = nodes_to_remove.snapshotItem(0).parentNode;
    
    for (var i = 0; i < nodes_to_remove.snapshotLength; i++) {
        parent_node.removeChild(nodes_to_remove.snapshotItem(i));
    }
}


function parse_address(page) {
    if (page == "Special:RCPatrol") {
        RCpatrol();
    } else if (page == "Special:Newcontributors") {
        new_contributors();
    } else if (page == "Special:Log/newusers") {
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

function initQuickNote( qnArticle, qnUser, contrib, regdate ) {
        article = urldecode(qnArticle);

        var mesid = document.getElementById('comment_text');
        var message = qnMsgBody.replace(/\<nowiki\>|\<\/nowiki\>/ig, '');
        message = message.replace(/\[\[ARTICLE\]\]/, '[['+article+']]');
        mesid.value = message;
        maxChar2 = maxChar + message.length;

        users           = qnUser.split("|");
        regdates        = regdate.split("|");
        contribs        = contrib.split("|");

        html = "Leave a quick note for ";

        if (users.length > 1) {
                html += "<select id='userdropdown' onchange='switchUser();'>";
                for (i = 0; i < users.length; i++) {
                        html += "<OPTION value='" + i + "'>" + users[i] + "</OPTION>";
                }
                html += "</select>";
        } else {
                html += "<input type='hidden' name='userdropdown' id='userdropdown' value'" + users[0] +"'/><b>" + users[0] + "</b>."
        }
        html += "<br/><span id='contribsreg'>";

        $('#qnTarget').val("User_talk:"+users[0]);

        var editorid = $('#qnEditorInfo');
        editorid.html(html);

        document.getElementById('modalPage').style.display = 'block';
        return false;
}


// =-=-=-=-=- Standard Functions -=-=-=-=-= //

function evaluate_xpath(xpath_query) {
     if (debug >= 2) GM_log(xpath_query);
     var nodes = document.evaluate(xpath_query, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
     if (debug >= 1) GM_log('number of nodes returned: ' + nodes.snapshotLength);

     return nodes;
}

