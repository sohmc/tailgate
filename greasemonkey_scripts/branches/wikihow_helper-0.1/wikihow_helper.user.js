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

addressRegExp.exec(document.location);
parse_address(RegExp.$1);





// =-=-=-=-=- FUNCTIONS -=-=-=-=-= //

function RCpatrol() {
    
}

function parse_address(page) {
    if (page == "Special:RCPatrol") {
        RCpatrol();
    } else {
        alert("Unknown Page");
    }

}
