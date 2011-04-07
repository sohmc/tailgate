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
 
var debug = 1;
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
                    if (debug > 3) FB_log(r.responseText);

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

          update_frontpage(poke_uid, 1);
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

     var poke_uid_regexp = /\?uid=(\d+)&pokeback/;
     poke_uid_regexp.exec(poke_link);
     var poke_uid = RegExp.$1;

     var r = new XMLHttpRequest();
     r.open('GET', poke_link, true);

     r.onreadystatechange = function (aEvt) {
          if (r.readyState == 4) {
               if (r.status == 200) {
                    if (debug > 2) FB_log(r.responseText, 1);

                    // Retrieve the "body" of the poke dialog along with
                    // the buttons that are being sent.
                    var div_regex = /"body":{"__html":"(.*)"},"buttons":\[(.*)\],/;
                    div_regex.exec(r.responseText);

                    var poke_response = RegExp.$1;
                    var buttons = RegExp.$2;

                    // Convert the string to xml for parsing.
                    poke_response = decode_unicode(poke_response);
                    if (debug > 2) FB_log('poke_response: ' + poke_response, 1);
                    var xml = string_to_xml(poke_response);
                    
                    if (debug > 2) FB_log('buttons: ' + buttons, 1);
                   
                    // Process the buttons that Facebook returned.  If
                    // it contains a "name" and "label", usually means
                    // that the user is being given a choice to choose
                    // "Poke" or "Cancel".
                    var button_regex = /^{"name":"(.*)","label":"(.*)"},"cancel"$/;

                    if (button_regex.test(buttons)) {
                         update_frontpage(poke_uid, 3);
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
               } else { // if status is not 200
                    update_frontpage(poke_uid, 20);
               }
          } // if readystate is not 4
     }; // end onReadyStateChange function

     r.setRequestHeader('Referer', document.location);
     r.setRequestHeader('Cookie', document.cookie);

     update_frontpage(poke_uid, 2);
     r.send();
}



function execute_poke(xml) {
     var poke_uid = evaluate_xpath('.//input[@name="uid"]', xml).snapshotItem(0).getAttribute('value');;
     var fb_dtsg = evaluate_xpath('.//*[@name="fb_dtsg"]').snapshotItem(0).getAttribute('value');

     var postURI = evaluate_xpath('.//form[@id="postURI"]', xml).snapshotItem(0).getAttribute('action');
     postURI += "?__a=1";
     var input_nodes = evaluate_xpath('.//input', xml);
     var post_data = "__d=1&lsd=&post_form_id_source=AsyncRequest&fb_dtsg=" + fb_dtsg;

     for (var i = 0; i < input_nodes.snapshotLength; i++) {
          if (input_nodes.snapshotItem(i).hasAttribute('value'))
               post_data += "&" + input_nodes.snapshotItem(i).getAttribute('name') + "=" + input_nodes.snapshotItem(i).getAttribute('value');
          else 
               post_data += "&" + input_nodes.snapshotItem(i).getAttribute('name') + "=";
     }


     var r = new XMLHttpRequest();
     r.open('POST', postURI, true);

     r.onreadystatechange = function (aEvt) {
          if (r.readyState == 4) {
               var poke_status = 0;

               if (r.status == 200) {
                    if (debug > 2) FB_log("Response for UID " + poke_uid + ": " + r.responseText, 1);

                    // Successful pokes have an autohide "handler"
                    var poke_successful = /"handler":"","autohide"/;
                    var poke_error = /"title":{"__html":"Error"}/;
                    
                    if (poke_error.test(r.responseText))
                         poke_status = 110;
                    else if (poke_successful.test(r.responseText))
                         poke_status = 100;
                    else
                         poke_status = 30;
               } else {
                    poke_status = 40;
               }

               update_frontpage(poke_uid, poke_status);
               return poke_status;
          }
     }; // end onReadyStateChange function

     r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
     r.setRequestHeader('Referer', document.location);
     r.setRequestHeader('Cookie', document.cookie);

     if (debug > 1) FB_log("Post data for UID " + poke_uid + ": " + post_data);
     if (debug > 1) FB_log("PostURI: " + postURI);
     update_frontpage(poke_uid, 4);
     r.send(post_data);
}

/* Helper Functions */

function update_frontpage(uid, poke_step) {
     var user_div = evaluate_xpath('.//div[@id[contains(.,"' + uid + '")]]/div/a[@ajaxify[contains(.,"' + uid + '")]]');

     if (user_div.snapshotLength == 0)
          FB_log('User ' + uid + ' could not be found on the frontpage.  Continuing anyway.');
     else if (user_div.snapshotLength > 1)
          FB_log('User ' + uid + ' returned multiple nodes.  Continuing anyway.');
     else {
          var poke_anchor = user_div.snapshotItem(0);

          switch (poke_step) {
               case 1:
                    poke_anchor.textContent = "Initializing...";
                    break;
               case 2:
                    poke_anchor.textContent = "Obtaining poke lock...";
                    break;
               case 3:
                    poke_anchor.textContent = "Lock confirmed; preparing to poke...";
                    break;
               case 4:
                    poke_anchor.textContent = "Transmitting...";
                    break;
               case 10:
                    poke_anchor.textContent = "Error 10: could not initialize.";
                    break;
               case 20:
                    poke_anchor.textContent = "Error 20: Could not issolate poke lock.";
                    break;
               case 30:
                    poke_anchor.textContent = "Error 30: Facebook return an unexpected response.";
                    break;
               case 100:
                    poke_anchor.textContent = "Auto-poked!";
                    poke_anchor.removeAttribute('href');
                    break;
               case 110:
                    poke_anchor.textContent = "Already poked";
                    poke_anchor.removeAttribute('href');
                    break;
               default:
                    poke_anchor.textContent = "Error 100: Unknown error.";
                    break;
          }
     }

     return poke_step;
}

// Returns 1 if the user can be poked.
function parse_poke_response(xml) {
     var return_value = 0;
     var pokable = evaluate_xpath('.//input[@name="pokeback"]', xml);

     if (pokable.snapshotLength == 1) return_value = 1;

     return return_value;
}

function FB_log(log_string, full) {
     if (debug >= 3) full = 1;

     if (debug > 2) {
	  var logspace = document.getElementById('fb_log');
          if ((!full) && (debug <= 5) && (log_string.length > log_limit)) logspace.value += log_string.substr(0, log_limit) + "... (" + (log_string.length - log_limit) + " characters)\n";
          else logspace.value += log_string + "\n";

	  logspace.scrollTop = logspace.scrollHeight;
     }

     GM_log(log_string);
}

function toggle_fb_log() {
     var fb_log = document.getElementById('my_div');
     if (fb_log.style.display != "none") {
	  fb_log.style.display = "none";
     } else {
	  fb_log.style.display = "block";
     }
}

//=-=-=-=-=- STANDARD FUNCTIONS -=-=-=-=-=//
 
function evaluate_xpath(xpath_query, xml) { 
     if (!xml) xml = document;

     if (debug >= 2) FB_log(xpath_query); 
     var nodes = xml.evaluate(xpath_query, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); 
     if (debug >= 2) FB_log('nodes returned: ' + nodes.snapshotLength); 
 
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
               if (debug > 2) FB_log("(" + current + ") == (" + String.fromCharCode(current) + ")");
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
