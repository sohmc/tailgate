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
     var f = new interfaceliftdownloader(doc);
     f.isWorking();
     
     var doc = aEvent.originalTarget;

     if (doc.nodeName == "#document") {
          var at_interfaces = /http:\/\/.*interfacelift\.com\/.*/.test(doc.location.href);

          if (at_interfaces) {
               f.at_interfacelift();
          }
     }

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
  }
};

window.addEventListener("load", function () { interfacesdownloader.onLoad(); }, false);
