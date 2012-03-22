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


var debug = 5;

// remove all warranty replacements
var tables = xpath_snapshot(".//table");

for (var t = 0; t < tables.snapshotLength; t++) {
     var table_rows = xpath_snapshot(".//table[" + (t+1) + "]/.//tr[not(contains(.,'Invoice Number'))]");

     for (var i = 0; i < table_rows.snapshotLength; i++) {
          row = table_rows.snapshotItem(i);

          var r = xpath_snapshot(".//table[" + (t+1) + "]/.//tr[not(contains(.,'Invoice Number'))][" + (i+1) + "]/td");

          row_object = {
               invoice: r.snapshotItem(0),
               status:  r.snapshotItem(1),
               replace: r.snapshotItem(4)
          }

          var a = xpath_snapshot(".//a", row_object.replace);

          /*
                         if (debug) GM_log(i + ': Unavailable');
                         p.style.display = 'none';
                    } else {
                         if (debug) GM_log(i + ': AVAILABLE');
                         p.style.color = 'green';
                    } */

     }

}


// replace_links.snapshotItem(0).style.display = 'none';

replace_links = xpath_snapshot(".//h3[contains(.,'Warranty Replacement Order History')]/..//table[1]/.//a[contains(.,'Replace')]");

for (var i = 0; i < replace_links.snapshotLength; i++) {
     if (debug) GM_log('inspecting item: ' + i);
     var p = replace_links.snapshotItem(i);
     if (debug) GM_log('href: ' + p.getAttribute('href'));

}

// =-=-=-=-=- FUNCTIONS -=-=-=-=-= //

function get_replacement_availability(url) {
     var replacement_available = 0;

     var r = new XMLHttpRequest();
     r.open('GET', url);
     r.onreadystatechange = function () {
          if (r.readyState == 4) {
               if (r.status == 200) {
                    var q = r.getAllResponseHeaders();
                    
                    if (debug) GM_log(i + ': site returned ' + r.responseText.length + ' characters.');
                    if (r.responseText.indexOf('alt="Unavailible" title="Replacement Availability"') >= 0) {
                         replacement_available = 1;
                    }
               }
          }
     };
     r.send(null);
     
     return replacement_available;
}



// =-=-=-=-=- Standard Functions -=-=-=-=-= //
// The following functions are ones that I've created and use in pretty
// much every script I write.

function xpath_snapshot(xpath_query, xml) {
    if (!xml) xml = document;

    if (debug >= 2) GM_log("xpath_snapshot: " + xpath_query);
    var nodes = document.evaluate(xpath_query, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    if (debug >= 1) GM_log('number of nodes returned: ' + nodes.snapshotLength);

    return nodes;
}

function xpath_iterate(xpath_query, node) {
    if (!node) node = document;

    if (debug >= 2) GM_log("xpath_iterate: " + xpath_query);
    var iterators = document.evaluate(xpath_query, node, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    if (debug >= 1) GM_log('number of nodes returned: ' + nodes.snapshotLength);

    return iterators;
}

function string_to_xml(s) {
     var parser = new DOMParser();
     var dom = parser.parseFromString(s, 'text/xml');

     return dom;
}

function xml_to_string(xml) {
     var serializer = new XMLSerializer();
     var prettyString = XML(serializer.serializeToString(xml)).toXMLString();

     return prettyString;
}
