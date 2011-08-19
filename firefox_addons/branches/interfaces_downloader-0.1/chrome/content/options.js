dump("sourcing options.js...");
var ifdl_options = {
     onLoad: function() {
          var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService)
                                .getBranch("extensions.myext.");
          var file = prefs.getComplexValue("image_location", Components.interfaces.nsILocalFile);
          document.getElementById('image_location_path').value = file.path;
     },

     choose_directory: function(e) {
          const nsIFilePicker = Components.interfaces.nsIFilePicker;

          var fp = Components.classes["@mozilla.org/filepicker;1"]
                             .createInstance(nsIFilePicker);
          fp.init(window, "Dialog Title", nsIFilePicker.modeGetFolder);

          var rv = fp.show();
          if (rv == nsIFilePicker.returnOK) {
               var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                     .getService(Components.interfaces.nsIPrefService)
                                     .getBranch("extensions.myext.");
               prefs.setComplexValue("image_location", Components.interfaces.nsILocalFile, fp.file);
               dump(fp.file.path + "\n");
          }
     },
};

window.addEventListener("load", function() { ifdl_options.onLoad(); }, false)
dump("done.\n");
