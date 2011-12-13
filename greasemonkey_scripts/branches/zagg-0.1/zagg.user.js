// ==UserScript== 
// @name        Zagg Replacement Availability
// @author      Michael Soh 
// @namespace   zagg-98173
// @description Shows you which products you have are available for replacement
// @version     0.1.1
// @license     GPL 3.0 
// @include     https://www.zagg.com/support/account/orders.php*
// 
// @require     http://tailgate.googlecode.com/hg/greasemonkey_scripts/jquery/jquery-1.7.1.min.js
// 
// ==/UserScript== 
// @require     http://usocheckup.redirectme.net/98173.js


var debug = 0;

// remove all warranty replacements
var replace_links = evaluate_xpath(".//h3[contains(.,'Warranty Replacement Order History')]/..//table[1]");
replace_links.snapshotItem(0).style.display = 'none';

replace_links = evaluate_xpath(".//h3[contains(.,'Warranty Replacement Order History')]/..//table[1]/.//a[contains(.,'Replace')]");

for (var i = 0; i < replace_links.snapshotLength; i++) {
     if (debug) GM_log('inspecting item: ' + i);
     var p = replace_links.snapshotItem(i);
     if (debug) GM_log('href: ' + p.getAttribute('href'));

     var r = new XMLHttpRequest();
     r.open('GET', p.getAttribute('href'));
     r.onreadystatechange = function () {
          if (r.readyState == 4) {
               if (r.status == 200) {
                    var q = r.getAllResponseHeaders();

                    
                    if (debug) GM_log(i + ': site returned ' + r.responseText.length + ' characters.');
                    if (r.responseText.indexOf('alt="Unavailible" title="Replacement Availability"') != -1) {
                         if (debug) GM_log(i + ': Unavailable');
                         p.style.display = 'none';
                    } else {
                         if (debug) GM_log(i + ': AVAILABLE');
                         p.style.color = 'green';
                    }
               }
          }
     };
     r.send(null);
}

// =-=-=-=-=- FUNCTIONS -=-=-=-=-= //


// =-=-=-=-=- Standard Functions -=-=-=-=-= //
// The following functions are ones that I've created and use in pretty
// much every script I write.

function evaluate_xpath(xpath_query) {
    if (debug >= 2) GM_log(xpath_query);
    var nodes = document.evaluate(xpath_query, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    if (debug >= 1) GM_log('number of nodes returned: ' + nodes.snapshotLength);

    return nodes;
}
