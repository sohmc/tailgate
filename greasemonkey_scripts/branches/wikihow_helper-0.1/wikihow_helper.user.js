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
    
    nodes = evaluate_xpath(".//*[@id='bodycontents']/div/div/ol/.//a[2][@class[starts-with(.,'new')]]");
    for (var i = 0; i < nodes.snapshotLength; i++) {
        var this_node = nodes.snapshotItem(i);
        var talk_link = this_node.getAttribute("title");
        var reg = /User_talk:(.+)/;
        reg.exec(talk_link);
        this_node.setAttribute("title", "Click to send a message to " + RegExp.$1);
        this_node.addEventListener("click", create_quick_edits, true);
        this_node.setAttribute("href", "#");
        this_node.setAttribute("user", talk_link);
    }

//    insert_comment_div();
}

function create_quick_edits() {
    alert(this.getAttribute("user"));
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

function initQuickNote( qnArticle, qnUser, contrib, regdate ) {
   //     article = urldecode(qnArticle);

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

function insert_comment_div() {
    var comment_div = document.createElement('div');
    var style_link = document.createElement('link');
    
    comment_div.setAttribute('id', 'modalContainer');
    comment_div.setAttribute('class', 'modalContainer');
    comment_div.innerHTML = " \
        <link rel=\"stylesheet\" type=\"text\/css\" href=\"http://pad3.whstatic.com/extensions/min/f/extensions/wikihow/quicknote.css?2471\"> \
        <img height=\"10\" width=\"679\" style=\"display: block;\" src=\"http://pad2.whstatic.com/skins/WikiHow/images/article_top.png\"> \
        <div class=\"modalContent\" id=\"quicknotecontent\"> \
        <div id=\"modalHeader\"> \
                <a id=\"modal_x\" onclick=\"document.getElementById('modalPage').style.display = 'none';\"><img height=\"21\" width=\"21\" alt=\"X\" src=\"http://pad3.whstatic.com/extensions/wikihow/winpop_x.gif\"></a> \
                <img alt=\"wikiHow\" id=\"modal_logo\" src=\"http://pad1.whstatic.com/skins/WikiHow/images/wikihow.gif\"> \
        </div><!--end editModalHeader--> \
        <div class=\"modalBody\"> \
        <div id=\"qnEditorInfo\">Leave a quick note for <input type=\"hidden\" Sohmc=\"\" value=\"\" id=\"userdropdown\" name=\"userdropdown\"><b>Sohmc</b>.<br><span id=\"contribsreg\"></span></div> \
        <form onsubmit=\"return qnSend('postcomment_newmsg_1683', document.postcommentForm_1683);\" target=\"_blank\" action=\"http://www.wikihow.com/Special:Postcomment\" method=\"POST\" name=\"postcommentForm_1683\"> \
                <input type=\"hidden\" value=\"User_talk:Sohmc\" name=\"target\" id=\"qnTarget\"> \
                <br>Or customize your own message.<br> \
                <textarea onkeyup=\"qnCountchars(this);\" rows=\"8\" cols=\"40\" name=\"comment_text\" id=\"comment_text\" tabindex=\"4\"></textarea> \
        </div> \
        <input type=\"submit\" style=\"font-size: 110%; margin-left: 0pt; float: right;\" id=\"postcommentbutton_1683\" onmouseover=\"button_swap(this);\" onmouseout=\"button_unswap(this);\" class=\"button button100 submit_button\" value=\"Post\" tabindex=\"5\"> \
         <a style=\"float: right; margin-right: 10px; line-height: 25px;\" onclick=\"return qnClose();\" tabindex=\"6\" href=\"#\">Cancel</a><br class=\"clearall\"> \
         </form> \
         </div> \
         </div><!--end modalContent--> \
         <img height=\"10\" width=\"679\" style=\"display: block;\" alt=\"\" src=\"http://pad2.whstatic.com/skins/WikiHow/images/article_bottom_wh.png\"> \
</div>";
    document.body.insertBefore(comment_div, document.body.firstChild);

}


// =-=-=-=-=- Standard Functions -=-=-=-=-= //

function evaluate_xpath(xpath_query) {
     if (debug >= 2) GM_log(xpath_query);
     var nodes = document.evaluate(xpath_query, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
     if (debug >= 1) GM_log('number of nodes returned: ' + nodes.snapshotLength);

     return nodes;
}
