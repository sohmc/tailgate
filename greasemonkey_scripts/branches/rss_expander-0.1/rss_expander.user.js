// ==UserScript== 
// @name        RSS Expander
// @author      Michael Soh 
// @namespace   rss_expander_5200 
// @description description
// @version     0.1
// @license     GPL 3.0 
// @include     http://www.google.com/reader/* 
// @include     https://www.google.com/reader/* 
//  
// @require     http://tailgate.googlecode.com/hg/greasemonkey_scripts/tags/jquery/jquery-1.6.4.min.js
// ==/UserScript== 
// @require     http://usocheckup.redirectme.net/UID.js

$(document).ready(function() {
     $('#entries').scroll(function() {
          GM_log('Scrolling!');
     });

});



// =-=-=-=-=- FUNCTIONS -=-=-=-=-= //


