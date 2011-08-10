var interfacesdownloader = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("interfacesdownloader-strings");
    var appcontent = document.getElementById("appcontent");

    if (appcontent) 
         appcontent.addEventListener("DOMContentLoaded", interfacesdownloader.onPageLoad, true);
  },

  onPageLoad: function(aEvent) {
     var doc = aEvent.originalTarget;
     var f = new interfaceliftdownloader(doc);

     if (doc.nodeName == "#document") {
          var at_interfaces = /http:\/\/.*interfacelift\.com\/.*/.test(doc.location.href);

          if (at_interfaces) {
               interfacesdownloader.loadjQuery(interfacesdownloader);
               f.at_interfacelift(aEvent.target);
          }
     }

  },

  loadjQuery: function(context){
     dump("Loading jQuery...");
     var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                 .getService(Components.interfaces.mozIJSSubScriptLoader);
     loader.loadSubScript("chrome://interfacesdownloader/content/jquery-1.6.2.js",context);

     var jQuery = window.jQuery.noConflict(true);
     if( typeof(jQuery.fn._init) == 'undefined') { jQuery.fn._init = jQuery.fn.init; }
     interfacesdownloader.jQuery = jQuery;

     dump("Done.\n");
  },

  onMenuItemCommand: function(e) {
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  .getService(Components.interfaces.nsIPromptService);
    promptService.alert(window, this.strings.getString("helloMessageTitle"),
                                this.strings.getString("helloMessage"));
  },

  onToolbarButtonCommand: function(e) {
    // just reuse the function above.  you can change this, obviously!
    interfacesdownloader.onMenuItemCommand(e);
  },

};

window.addEventListener("load", function () { interfacesdownloader.onLoad(); }, false);
