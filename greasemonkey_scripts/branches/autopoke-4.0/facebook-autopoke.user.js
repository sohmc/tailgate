// ==UserScript== 
// @name        Facebook Autopoke 
// @author      Michael Soh 
// @namespace   autopoke_5200 
// @description Automatically pokes back people listed on your home page. This script was inspired by Lukas Fragodt's Auto-Poke and EZ-Poke. 
// @version     4.0
// @license     GPL 3.0 
// @include     http*://facebook.com/home.php* 
// @include     http*://*.facebook.com/home.php* 
// @include     http*://*.facebook.com/ 
// @include     http*://*.facebook.com/?* 
// @include     http*://*.facebook.com/#* 
//  
// 
// ==/UserScript== 
// @require     http://usocheckup.redirectme.net/5200.js
 
var debug = 5;
var log_limit = 500; // The max number of characters in each log entry.
var retries = 3; 
var wait = 1500; // 1.5 seconds 
 
if (debug > 2) { 
     my_div = document.createElement('div'); 
     my_div.innerHTML = '<div style="height: 300px; width: 600px; ' + 
	     'background-color: #99FFCC; z-index: 100; position: fixed;' + 
	     'padding: 5px; ' +  
	     'right: 10px; bottom: 10px;" id="my_div">' +  
	     '<p><a id="close_fb_log">Close</a></p>' +
	     '<textarea style="width: 590px; height: 225px;" id="fb_log" nowrap readonly>' +  
	     '</textarea>' +
	     '</div>'; 

     document.body.insertBefore(my_div, document.body.firstChild);
     document.getElementById('close_fb_log').addEventListener("click", toggle_fb_log, true);
} 

if (debug > 0) FB_log('Current Location: ' + document.location); 

new_init();

 
// =-=-=-=-=- FUNCTIONS -=-=-=-=-= //

function new_init() {
     var r = new XMLHttpRequest();
     r.open('GET', document.location, true);

     r.onreadystatechange = function (aEvt) {
          if (r.readyState == 4) {
               if (r.status == 200) {
                    if (debug > 2) FB_log(r.responseText);

                    var poke_divs = evaluate_xpath(".//script[contains(.,'pokes')]");
                    if (poke_divs.snapshotLength == 1) {
                         var div_regex = /"pagelet_pokes":"(.*)"/;
                         div_regex.exec(poke_divs.snapshotItem(0).innerHTML);
                         var poke_pagelet = new String(RegExp.$1);

                         poke_pagelet = decode_unicode(poke_pagelet);
                         if (debug > 3) FB_log('poke_pagelet: ' + poke_pagelet);
                         find_pokes(string_to_xml(poke_pagelet));
                    }
               } else {
                    FB_log("Error loading page");
               }
          }
     };
     
     r.send(null);
}

/* Depricated 
function init() { 
     var html_tag = evaluate_xpath('.//html'); 
     var fb_lang = html_tag.snapshotItem(0).getAttribute('lang'); 
 
     if (debug > 0) { 
          var poke_div = evaluate_xpath('.//h4[contains(.,"Pokes")]'); 
 
          if (poke_div.snapshotLength == 1) { 
               poke_div.snapshotItem(0).innerHTML += ' <a href="#" id="auto_poke">Auto-poke</a>'; 
               evaluate_xpath('.//a[@id="auto_poke"]').snapshotItem(0).addEventListener('click', find_pokes, true); 
          } 
 
     } 
 
     find_pokes(); 
} */

function toggle_fb_log() {
     var fb_log = document.getElementById('my_div');
     if (fb_log.style.display != "none") {
	  fb_log.style.display = "none";
     } else {
	  fb_log.style.display = "block";
     }
}

function find_pokes(xml) {
     // Retrieve poke links via XPath
     var poke_divs = evaluate_xpath('.//div[@id[starts-with(.,"poke")]]', xml);
     var names     = evaluate_xpath('.//div[@id[starts-with(.,"poke")]]/div/a[1]', xml);
     var anchors   = evaluate_xpath('.//div[@id[starts-with(.,"poke")]]/div/a[2]', xml);
     if (debug > 0) FB_log('Poke back links found: ' + anchors.snapshotLength);
     
     for (var i=0; i < anchors.snapshotLength; i++) {
	  var ajax_ref = anchors.snapshotItem(i).getAttribute('ajaxify');
	  FB_log(i + " " + names.snapshotItem(i).textContent + ": " + ajax_ref);

	  var poke_uid_regexp = /poke_(\d+)/;
	  poke_uid_regexp.exec(poke_divs.snapshotItem(i).getAttribute('id'));
	  var poke_uid = RegExp.$1;

	  ajax_ref = ajax_ref.replace(/\?.*/, '');
	  ajax_ref = ajax_ref + "?uid=" + poke_uid + "&pokeback=1&__a=1&__d=1";

	  poke_function(ajax_ref)
     } 
     
     if (anchors.snapshotLength == 0) { 
          retries--; 
          FB_log('No pokes found. Retries left: ' + retries); 
          if (retries > 0)           
               setTimeout(find_pokes, wait); 
     } 
} 
 
 
function poke_function(poke_link) { 
     if (debug > 0) FB_log("Retrieving confirmation page(" + poke_link + ")"); 

     var r = new XMLHttpRequest();
     r.open('GET', poke_link, true);

     r.onreadystatechange = function (aEvt) {
          if (r.readyState == 4) {
               if (r.status == 200) {
                    if(debug > 2) FB_log(r.responseText, 1);

                    // Retrieve the "body" of the poke dialog along with
                    // the buttons that are being sent.
                    var div_regex = /"body":{"__html":"(.*)"},"buttons":\[(.*)\],/;
                    div_regex.exec(r.responseText);

                    var poke_response = RegExp.$1;
                    var buttons = RegExp.$2;

                    // Convert the string to xml for parsing.
                    poke_response = decode_unicode(poke_response);
                    FB_log('poke_response: ' + poke_response, 1);
                    var xml = string_to_xml(poke_response);
                    
                    if (debug > 2) FB_log('buttons: ' + buttons, 1);
                   
                    // Process the buttons that Facebook returned.  If
                    // it contains a "name" and "label", usually means
                    // that the user is being given a choice to choose
                    // "Poke" or "Cancel".
                    var button_regex = /^{"name":"(.*)","label":"(.*)"},"cancel"$/;

                    if (button_regex.test(buttons)) {
                         button_regex.exec(buttons);
                         
                         var new_input_node = xml.createElement('input');
                         new_input_node.setAttribute('type', 'hidden');
                         new_input_node.setAttribute('name', RegExp.$1);
                         new_input_node.setAttribute('value', RegExp.$2);
                         
                         // Add the button to the xml.
                         xml.getElementsByTagName('div')[1].appendChild(new_input_node);
                         if (debug > 2) FB_log(xml_to_string(xml), 1);
                    }


                    // Retrieve the postURI.
                    var postURI_regex = /"postURI":\["(.*)",(.*)\]}}$/;
                    if (postURI_regex.test(r.responseText)) {
                         postURI_regex.exec(poke_response);

                         var new_input_node = xml.createElement('form');
                         new_input_node.setAttribute('id', 'postURI');
                         new_input_node.setAttribute('status', RegExp.$2);  // The autopoke script does not use this, but it is stored in case it needs it.
                         new_input_node.setAttribute('action', RegExp.$1.replace("\\\/", "\/", "g"));
                         
                         // Add the button to the xml.
                         xml.getElementsByTagName('div')[1].appendChild(new_input_node);
                         if (debug > 2) FB_log(xml_to_string(xml), 1);
                    }

                    if (parse_poke_response(xml)) execute_poke(xml);
               } else {
                    FB_log("Error loading page");
               }
          }
     };

     r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
     r.setRequestHeader('Referer', document.location);
     r.setRequestHeader('Cookie', document.cookie);
     r.send();
}



function execute_poke(xml) {
     var poke_uid = evaluate_xpath('.//input[@name="uid"]', xml).snapshotItem(0).getAttribute('value');;
     var fb_dtsg = evaluate_xpath('.//*[@name="fb_dtsg"]').snapshotItem(0).getAttribute('value');
     var post_data = "lsd=&post_form_id_source=AsyncRequest";

     var postURI = evaluate_xpath('.//form[@id="postURI"]', xml).snapshotItem(0).getAttribute('action');
     if (debug > 2) FB_log("PostURI: " + postURI);

     var input_nodes = evaluate_xpath('.//input', xml);

     for (var i = 0; i < input_nodes.snapshotLength; i++) {
          if (input_nodes.snapshotItem(i).hasAttribute('value'))
               post_data += "&" + input_nodes.snapshotItem(i).getAttribute('name') + "=" + input_nodes.snapshotItem(i).getAttribute('value');
          else 
               post_data += "&" + input_nodes.snapshotItem(i).getAttribute('name') + "=";
     }

     if (debug > 2) FB_log(post_data);

     update_frontpage(poke_uid);

/* 
     poke_node.innerHTML = 'Executing autopoke (' + poke_uid + ')...'; 
     if (debug > 0) FB_log('post_data: ' + post_data); 
 
     //Submit the poke. 
     GM_xmlhttpRequest({ 
          method:'POST', 
          url:'/ajax/poke.php?__a=1', 
          headers:{ 
               'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8', 
               'Referer':document.location, 
               'Cookie':document.cookie, 
          }, 
          data:post_data, 
          onload: function (response) { 
               if (response.status == 200) { 
                    //Poke either already happened, was successful, or failed. 
                    if (response.responseText.indexOf('has not received your last poke yet') != -1) { 
                         poke_node.removeAttribute('href'); 
                         poke_node.innerHTML = 'Already poked!'; 
                    } else if (response.responseText.indexOf('You have poked') != -1) { 
                         poke_node.removeAttribute('href'); 
                         poke_node.innerHTML = 'Auto-Poked!'; 
                    } else { 
                         poke_node.innerHTML = 'Poke failed! [2.1]'; 
                         FB_log("Auto-Poke failed -- Error Code 2.1: Facebook gave an unexpected response to the poke."); 
                         FB_log(response.responseText); 
                    } 
               } else { 
                    poke_node.innerHTML = 'Poke failed! [2.2]'; 
                    FB_log("Auto-Poke failed -- Error Code 2.2: Facebook.com gave a non-200 OK response.\n\nfacebook.com returned: " + response.status + response.statusText); 
                    FB_log(response.responseText); 
               } 
          }, 
          onerror: function (responseDetails) { 
               poke_node.removeAttribute('href'); 
               poke_node.innerHTML = 'Poke failed! [2.3]'; 
               FB_log("Auto-Poke failed -- Error Code 2.3: The script experienced unknown errors while attempting to confirm the poke."); 
               FB_log(response.responseText); 
          } 
     }); */
}

/* Helper Functions */

function update_frontpage(uid) {
     var user_div = evaluate_xpath('.//div[@id[contains(.,"' + uid + '")]]');

     if (user_div.snapshotLength == 0)
          FB_log('User ' + uid + ' could not be found on the frontpage.  Continuing anyway.');
     else if (user_div.snapshotLength > 1)
          FB_log('User ' + uid + ' returned multiple nodes.  Continuing anyway.');
     else {
          var innerXML = user_div.snapshotItem(0);

          FB_log(xml_to_string(innerXML.childNodes));


     }


}

// Returns 1 if the user can be poked.
function parse_poke_response(xml) {
     var return_value = 0;
     var pokable = evaluate_xpath('.//input[@name="pokeback"]', xml);

     if (pokable.snapshotLength == 1) return_value = 1;

     return return_value;
}

function FB_log(log_string, full) {
     if (debug > 2) {
	  var logspace = document.getElementById('fb_log');
          if ((!full) && (debug <= 5) && (log_string.length > log_limit)) logspace.value += log_string.substr(0, log_limit) + "... (" + (log_string.length - log_limit) + " characters)\n";
          else logspace.value += log_string + "\n";

	  logspace.scrollTop = logspace.scrollHeight;
     }

     GM_log(log_string);
}

//=-=-=-=-=- STANDARD FUNCTIONS -=-=-=-=-=//
 
function evaluate_xpath(xpath_query, xml) { 
     if (!xml) xml = document;

     if (debug >= 2) FB_log(xpath_query); 
     var nodes = xml.evaluate(xpath_query, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); 
     if (debug >= 1) FB_log('nodes returned: ' + nodes.snapshotLength); 
 
     return nodes; 
}

function decode_unicode(s) {
     var new_s = "";

     if (s.length > 0) {
          if (debug > 2) FB_log('Decoding the following string (length: ' + s.length + '): ' + s);

          unicode_regex = /\\u[a-z0-9]{4}/gi;
          new_s = s.match(unicode_regex);
     
          for (var i = 0; i < new_s.length; i++) {
               var hex_regex = /\\u([a-z0-9]{4})/;
               var hex = hex_regex.exec(new_s[i]);
               
               var current = "0x" + hex[1];
               FB_log("(" + current + ") == (" + String.fromCharCode(current) + ")");
               s = s.replace(new_s[i], String.fromCharCode(current), "g");
          }

          s = s.replace("\\", "", "g");
          s = s.replace("\\\/", "\/", "g");
     }

     return s;
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
