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
} 

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

 
     for (var i=0; i < anchors.snapshotLength; i++) {
	  var ajax_ref = anchors.snapshotItem(i).getAttribute('ajaxify');
	  FB_log(i + ":" + ajax_ref);

	  var post_form_id = evaluate_xpath('.//*[@id="post_form_id"]').snapshotItem(0).value;
	  var fb_dtsg = evaluate_xpath('.//*[@name="fb_dtsg"]').snapshotItem(0).value;
          var p_regexp = /p=(.*)/;
	  p_regexp.exec(ajax_ref);
	  var post_data = "p=" + RegExp.$1;

	  var poke_uid_regexp = /poke_(\d+)/;
	  poke_uid_regexp.exec(poke_divs.snapshotItem(i).getAttribute('id'));
	  var poke_uid = RegExp.$1;

	  ajax_ref = ajax_ref.replace(/\?.*/, '');
	  ajax_ref = ajax_ref + "?__a=1";

	  post_data = post_data + "&nctr[_mod]=pagelet_netego_pokes&post_form_id=" + post_form_id + '&fb_dtsg=' + fb_dtsg + '&lsd&post_form_id_source=AsyncRequest';

	  poke_function(ajax_ref, anchors.snapshotItem(i), post_data, poke_uid);
     } 
     
     if (anchors.snapshotLength == 0) { 
          retries--; 
          FB_log('No pokes found. Retries left: ' + retries); 
          if (retries > 0)           
               setTimeout(find_pokes, wait); 
     } 
} 
 
 
function poke_function(poke_link, poke_node, poke_post_data, poke_uid) { 
     if (debug > 0) FB_log("Retrieving confirmation page(" + poke_link + ")"); 
     if (debug > 1) FB_log("POST data: " + poke_post_data);

     var r = new XMLHttpRequest();
     r.open('POST', poke_link, true);

     r.onreadystatechange = function (aEvt) {
          if (r.readyState == 4) {
               if (r.status == 200) {
                    FB_log(r.responseText);
                    var div_regex = /\\"body\\":{\\"__html\\":\\"(.*)\\"},\\"buttons\\"/;
                    div_regex.exec(r.responseText);

                    var poke_response = RegExp.$1;
                    poke_response = decode_unicode(poke_response);
                    FB_log('poke_response: ' + poke_response);

                    parse_poke_response(string_to_xml(poke_response));

               } else {
                    FB_log("Error loading page");
               }
          }
     };
     r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
     r.setRequestHeader('Referer', document.location);
     r.setRequestHeader('Cookie', document.cookie);
     r.send(poke_post_data);

}

function parse_poke_response(xml) {
     var poke_node = evaluate_xpath('.//input[name="uid"]', xml);

     if (poke_node.snapshotLength == 1) {
          var poke_uid = poke_node.snapshotItem(0).value;
          var poke_link = evaluate_xpath('.//div[@id="poke_' + poke_uid + ']]/div/a[2]');

          if (poke_link.snapshotLength == 1) {
               var node = poke_link.snapshotItem(0);
               poke_node.removeAttribute('href');
               node.innerHTML = "Processing...";
          } else {
               FB_log('Poke back link could not be found on the document page.  Continuing anyway.');
          }

          var r = new XMLHttpRequest();


     }

 
/*
     GM_xmlhttpRequest({ 
          method:'POST', 
          url:poke_link, 
	  headers:{
	       'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
	       'Referer':document.location,
	       'Cookie':document.cookie,
	  },
	  data:poke_post_data,
          onload: function(response) { 
               if (response.status == 200) { 
                    if (response.responseText.indexOf('You are about to poke') != -1) { 
                         poke_node.innerHTML = 'Reading confirmation page...'; 
                         if (debug >= 2) FB_log("Text:" + response.responseText); 
                         execute_poke(poke_uid, poke_node); 
                    } else if (response.responseText.indexOf('has not received your last poke yet') != -1) { 
                         poke_node.removeAttribute('href'); 
                         poke_node.innerHTML = 'Already poked!'; 
                    } else { 
                         poke_node.removeAttribute('href');  
                         poke_node.innerHTML = 'Auto-Poke failed! [1.1]';  
                         FB_log("Auto-Poke failed -- Error Code 1.1: While retreiving the poke confirmation page, the script was unable to determine whether the user had already been poked or is about to be poked.  This is likely the result of Facebook changing their code again.");  
                         FB_log(response.responseText); 
                     } 
              } else { 
                    poke_node.innerHTML = 'Auto-Poke failed! [1.2]'; 
                    FB_log("Auto-Poke failed -- Error Code 1.2: The poke confirmation page returned a non-200 OK response\n\nfacebook returned:" + response.status + response.statusText); 
              } 
          } 
     }); // end of GM_xmlhttpRequest */
} 
 
function execute_poke(poke_uid, poke_node) { 
     FB_log('cookie: ' + document.cookie); 
     var post_form_id = evaluate_xpath('.//*[@id="post_form_id"]').snapshotItem(0).value; 
     var fb_dtsg = evaluate_xpath('.//*[@name="fb_dtsg"]').snapshotItem(0).value; 
     var post_data = 'uid=' + poke_uid + '&pokeback=1&post_form_id=' + post_form_id + '&fb_dtsg=' + fb_dtsg + '&lsd=&opp=&pk01=Poke&post_form_id_source=AsyncRequest'; 
 
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
     }); 
} 

function FB_log(log_string) {
     if (debug > 2) {
	  var logspace = document.getElementById('fb_log'); 
	  logspace.value += log_string + "\n";
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

     return s;
}

function string_to_xml(s) {
     var parser = new DOMParser();
     var dom = parser.parseFromString(s, 'text/xml');

     return dom;
}
