var interfacesdownloader = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    var appcontent = document.getElementById("appcontent");

    if (appcontent) 
         appcontent.addEventListener("DOMContentLoaded", this.onPageLoad, false);
  },

  onPageLoad: function(aEvent) {
     var doc = aEvent.originalTarget;
     var f = new ifdl_wrapper(doc);

     if (doc.nodeName == "#document") {
          var at_interfaces = /^http:\/\/.*interfacelift\.com\/.*/.test(doc.location.href);

          if (at_interfaces) {
               f.at_interfacelift(aEvent.target);
          }
     }
  },

     unLoad: function(aEvent) {
          var doc = aEvent.originalTarget;
          if (aEvent.originalTarget instanceof HTMLDocument) {
               var at_interfaces = /^http:\/\/.*interfacelift\.com\/.*/.test(doc.location.href);

               if (at_interfaces) {
               }
          }
     }
};

window.addEventListener("load", function () { interfacesdownloader.onLoad(); }, false);
window.addEventListener("pagehide", interfacesdownloader.unLoad, false);

ifdl_functions.remove_temp_file();
