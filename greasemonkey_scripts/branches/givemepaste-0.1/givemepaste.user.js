// ==UserScript== 
// @name        Give Me Paste Back
// @author      Michael Soh 
// @namespace   8DDyj2fcDcsAEM29wn3pPzYS2XLwcBp1RQ3o8HAH_givemepaste
// @description Will allow you to paste into input areas that have paste removed
// @version     0.1
// @license     GPL 3.0 
// @include     * 
//  
// @require     http://tailgate.googlecode.com/hg/greasemonkey_scripts/jquery/jquery-1.7.1.min.js
// ==/UserScript== 
// @require     http://usocheckup.redirectme.net/UID.js

$(document).ready(function() {
     $('input[onpaste]').removeAttr('onpaste');
});
