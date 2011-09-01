var loaded = 0;

var interfacesdownloader = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("interfacesdownloader-strings");
    var appcontent = document.getElementById("appcontent");

    if (appcontent) 
         appcontent.addEventListener("DOMContentLoaded", this.onPageLoad, false);
  },

  onPageLoad: function(aEvent) {
     var doc = aEvent.originalTarget;
     var f = new ifdl_wrapper(doc);

     if (doc.nodeName == "#document") {
          var at_interfaces = /http:\/\/.*interfacelift\.com\/.*/.test(doc.location.href);

          if (at_interfaces) {
               f.at_interfacelift(aEvent.target);
          }
     }
  },

  unLoad: function() {
          loaded = 0;
  }

};

window.addEventListener("load", function () { interfacesdownloader.onLoad(); }, false);
window.addEventListener("unload", function () { interfacesdownloader.unLoad(); }, false);
