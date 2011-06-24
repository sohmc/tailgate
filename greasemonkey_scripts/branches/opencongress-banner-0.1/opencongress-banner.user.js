// ==UserScript== 
// @name        Remove OpenCongress Donation Banner
// @author      Michael Soh 
// @namespace   opencongress-banner 
// @description Removes the annoying donation banner.
// @version     0.1
// @license     GPL 3.0 
// @include     http://*.opencongress.org/*
//  
// 
// ==/UserScript== 
// @require     http://usocheckup.redirectme.net/UID.js

document.getElementsByClassName('banner')[0].style.display = "none";


