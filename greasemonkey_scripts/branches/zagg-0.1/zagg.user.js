// ==UserScript== 
// @name        Zagg Profiler
// @author      Michael Soh 
// @namespace   zagg
// @description description
// @version     0.1
// @license     GPL 3.0 
// @include     https://www.zagg.com/support/account/orders.php*
//  
// 
// ==/UserScript== 
// @require     http://usocheckup.redirectme.net/UID.js

var debug = 5;

var replace_links = evaluate_xpath(".//a[@href[contains(.,'view_order.php?id=')]]/..[a='Replace']/a");

for (var i = 0; i < replace_links.snapshotLength; i++) {
     GM_log('inspecting item: ' + i);
     var p = replace_links.snapshotItem(i);
     GM_log('href: ' + p.getAttribute('href'));

     var r = new XMLHttpRequest();
     r.open('GET', p.getAttribute('href'), false);
     r.send(null);
     if (r.status == 200) {
          GM_log(i + ': contacting ' + p.getAttribute);
          GM_log(i + ': connection status: ' + r.status);
          if (r.status == 200) {
               GM_log(i + ': site returned ' + r.responseText.length + ' characters.');
               if (r.responseText.indexOf('alt="Unavailible" title="Replacement Availability"') != -1) {
                    GM_log(i + ': Unavailable');
                    p.style.display = 'none';
               } else {
                    GM_log(i + ': AVAILABLE');
                    p.style.color = 'green';
               }
          }
     }
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
