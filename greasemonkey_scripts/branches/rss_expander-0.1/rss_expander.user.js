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
          var xml = string_to_xml(c.innerHTML);

          var link = xpath('.//h2/a[@class="entry-title-link"]', xml);
          var div = xpath('.//div[@class="item-body"]', xml);

          if ((link) && (div)) {
               var l = link.snapshotItem(0);
               var d = div.snapshotItem(0);

               GM_log("href: " + l.getAttribute('href'));
               get_remote_post(l.getAttribute('href'), d);
          }
     }
}


function get_remote_post(href) {
     GM_log('getting remote post...');
     GM_xmlhttpRequest({
          method: 'GET',
          url: href,
          headers: {
               'Referer':document.location,
          },
          onload: function(response) {
               if (response.status == 200) {
                    GM_log('Got response: ' + response.responseText);
                    var xpath_for_remote_post = get_xpath_for_post(href);
                    var xml = string_to_xml(response.responseText);

                    var entry_node = xpath(".//*", xml);
                    for (var p = 0; p < entry_node.snapshotLength; p++) {
                         var e = entry_node.snapshotItem(p);
                         GM_log("p=" + p + " --  node name: " + e.nodeName + " node type: " + e.nodeType + "\n" + e.textContent);
                    }
               } else {
                    GM_log('ERROR: ' + response.status);
               }
          }
     });
}


function get_xpath_for_post(href) {
     var v = './/div[@id="centercolumn-full"]';

     return v;
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

