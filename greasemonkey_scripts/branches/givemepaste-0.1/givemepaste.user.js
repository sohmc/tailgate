// ==UserScript== 
// @name        Give Me Paste Back
// @author      Michael Soh 
// @namespace   8DDyj2fcDcsAEM29wn3pPzYS2XLwcBp1RQ3o8HAH_givemepaste
// @description Will allow you to paste into input areas that have paste removed
// @version     0.3
// @license     GPL 3.0 
// @include     * 
//  
// @require     http://tailgate.googlecode.com/hg/greasemonkey_scripts/jquery/jquery-1.7.1.min.js
// ==/UserScript== 
// @require     http://usocheckup.redirectme.net/131063.js

var events = new Array('onpaste', 'oncopy', 'oncut', 'oncontextmenu');


$(document).ready(function() {
     $('input').each(function() {
/*          if ('onpaste' in this) {
               this.removeAttribute('onpaste');

               if ('onpaste' in this) {
                    GM_log("Could not remove onpaste attribute from " + this.id);
                    GM_log("onpaste still exists! Trying to set the function...");
                    this.onpaste = function() { return true; }
                    if ('onpaste' in this) GM_log("onpaste still exists! (3) No solution found.");
               }
          }
          
          if ('oncopy' in this) {
               this.removeAttribute('oncopy');

               if ('oncopy' in this) {
                    GM_log("Could not remove oncopy attribute from " + this.id);
                    GM_log("oncopy still exists! Trying to set the function...");
                    this.oncopy = function() { return true; }
                    if ('oncopy' in this) GM_log("oncopy still exists! (3) No solution found.");
               }
          } */

          $(this).click(function() {
               GM_log("click event activated!");
               /*for (var i = 0; i < events.length; i++) {
                    remove_event(this, events[i]);
               }*/
          });
     });

     var button_div = document.createElement('div');
     button_div.setAttribute('style', 'height: 30px; width: 150px; ' +
               'background-color: #99FFCC; z-index: 100; position: fixed; ' +
	       'padding: 5px; margin: 0 auto; ' +  
	       'right: 10px; bottom: 10px;');
     button_div.setAttribute('id', 'button_div');

     button_div.innerHTML = '<input type="button" value="remove paste" id="init_button">';
     
     document.body.insertBefore(button_div, document.body.firstChild);
     document.getElementById('init_button').addEventListener('click', init, true);

});

function init() {
     $('input').each(function() {
          $(this).click(function() {
               GM_log("click event activated!");
               for (var i = 0; i < events.length; i++) {
                    remove_event(this, events[i]);
               }
          });
          
          if (this.id == "BankAccountNumberTextBox") 
               GM_log("Activated click event for BankAccountNumberTextBox");

          if (this.id == "BankAccountNumberTextBoxAsPassword")
               GM_log("Activated click event for BankAccountNumberTextBoxAsPassword");
     });
}



function remove_event(node, event_name) {
     if (event_name in node) {
          node.removeAttribute(event_name);

          if (event_name in node) {
               GM_log("Could not remove " + event_name + " attribute from " + node.id);
               GM_log(event_name + " still exists! Trying to set the function...");
               node.setAttribute(event_name, function() { return true; });
          }
     }
}
