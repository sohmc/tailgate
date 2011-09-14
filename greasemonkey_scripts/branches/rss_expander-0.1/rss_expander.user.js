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

debug = 3;

$(document).ready(function() {
     $('#entries').scroll(function() { process_links(); });
     $('div[class^="entry"]').click(function() { process_links(); });
});



// =-=-=-=-=- FUNCTIONS -=-=-=-=-= //

function process_links() {
     GM_log('processing...');
     var cards = xpath('.//div[@class="card-content"]');

     for (var i = 0; i < 2; i++) {
          var c = cards.snapshotItem(i);
          GM_log("xml: " + c.innerHTML);
          var xml = string_to_xml(c.innerHTML);

          var link = xpath('.//h2/a[@class="entry-title-link"]', xml);
          if (link) {
               var l = link.snapshotItem(0);
               GM_log("i=" + i + " --  node name: " + l.nodeName + " node type: " + l.nodeType + "\n" + l.textContent);
               GM_log("href: " + l.getAttribute('href'));
          }
     }


}


function string_to_xml(s) {
     var parser = new DOMParser();
     var dom = parser.parseFromString(s, 'text/xml');

     return dom;
}

function xpath(xpath_query, xml) { 
     if (!xml) xml = document;

     if (debug >= 2) GM_log(xpath_query); 
     var nodes = xml.evaluate(xpath_query, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); 
     if (debug >= 2) GM_log('nodes returned: ' + nodes.snapshotLength); 
 
     return nodes; 
}

