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
     create_frame();
});



// =-=-=-=-=- FUNCTIONS -=-=-=-=-= //


function create_frame() {
     var frame = document.getElementById("sample-frame");
     if (!frame) {
           // create frame
           frame = document.createElement("div"); // iframe (or browser on older Firefox)
           frame.setAttribute("id", "sample-frame");
           frame.setAttribute("name", "sample-frame");
           frame.setAttribute("type", "content");
           frame.setAttribute("style", "display: block; position: absolute; right: 10px; bottom: 10px; border: 2px solid red; z-index: 1000");
           //document.getElementById("main-window").appendChild(frame);
           // or 
           document.documentElement.appendChild(frame);
     } 
}

function process_links() {
     GM_log('processing...');
     var cards = xpath('.//div[@class="card-content"]');

     for (var i = 0; i < 2; i++) {
          var c = cards.snapshotItem(i);
          var xml = string_to_xml(c.innerHTML);
          GM_log(xml_to_string(xml));

          var link = xpath('.//h2/a[@class="entry-title-link"]', xml);

          if (link.snapshotLength == 1) {
               var l = link.snapshotItem(0);

               GM_log("href: " + l.getAttribute('href'));
               get_remote_post(l.getAttribute('href'));
          }
     }
}


function get_remote_post(href) {
     GM_log('getting remote post...');
     var frame = document.getElementById("sample-frame");

     GM_xmlhttpRequest({
          method: 'GET',
          url: href,
          headers: {
               "Referer": document.location
          },
          onload: function (r) {
               if (r.status == 200) {
                    var xml = string_to_xml(r.responseText);
                    GM_log(xml_to_string(xml));
               } else {
                    GM_log("ERROR: Status code " + r.status);
               }
          }
     });


}


function get_xpath_for_post(href) {
     var v = './/a[(@class="photo") and (@href[starts-with(.,"#mutable")])]';

     return v;
}


// =-=-=-=-=- STANDARD FUNCTION LIBRARY -=-=-=-=-= //


function node_info(n) {
     return "node name: " + n.nodeName + " node type: " + n.nodeType + "\n" + n.textContent;
}

function string_to_xml(s) {
     var parser = new DOMParser();
     var dom = parser.parseFromString(s, 'text/xml');

     var error = xpath('/parsererror', dom);
     if (error.snapshotLength > 0) 
          GM_log('PARSER ERROR: ' + error.snapshotItem(0).textContent);

     return dom;
}

function xml_to_string(xml) {
     var serializer = new XMLSerializer();
     var prettyString = XML(serializer.serializeToString(xml)).toXMLString();

     return prettyString;
}

function xpath(xpath_query, xml) { 
     if (!xml) xml = document;

     if (debug >= 2) GM_log(xpath_query); 
     var nodes = xml.evaluate(xpath_query, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); 
     if (debug >= 2) GM_log('nodes returned: ' + nodes.snapshotLength); 
 
     return nodes; 
}

