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
current_page = RegExp.$1;

GM_log('current page: ' + current_page);




// =-=-=-=-=- FUNCTIONS -=-=-=-=-= //


