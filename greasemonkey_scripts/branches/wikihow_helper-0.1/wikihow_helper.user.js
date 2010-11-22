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

function new_contributors() {
    var nodes = evaluate_xpath(".//*[@id='bodycontents']/div/div/ol/.//a[2][not(@class[starts-with(.,'new')])]/..");
    var parent_node = nodes.snapshotItem(0).parentNode;
    
    for (var i = 0; i < nodes.snapshotLength; i++) {
        parent_node.removeChild(nodes.snapshotItem(i));
    }
    
}


function parse_address(page) {
    if (page == "Special:RCPatrol") {
        RCpatrol();
    } else if (page == "Special:Newcontributors") {
        new_contributors();
    } else {
        alert("Unknown Page");
    }

}

// =-=-=-=-=- Standard Functions -=-=-=-=-= //

function evaluate_xpath(xpath_query) {
     if (debug >= 2) GM_log(xpath_query);
     var nodes = document.evaluate(xpath_query, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
     if (debug >= 1) GM_log('number of nodes returned: ' + nodes.snapshotLength);

     return nodes;
}

