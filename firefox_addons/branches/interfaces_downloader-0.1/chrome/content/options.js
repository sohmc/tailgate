dump("sourcing options.js...");
let ifdl_options = {
     choose_directory: function(e) {
          const nsIFilePicker = Components.interfaces.nsIFilePicker;

          var fp = Components.classes["@mozilla.org/filepicker;1"]
                             .createInstance(nsIFilePicker);
          fp.init(window, "Dialog Title", nsIFilePicker.modeGetFolder);

          var rv = fp.show();
          if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
            var file = fp.file;
            // Get the path as string. Note that you usually won't 
            // need to work with the string paths.
            var path = fp.file.path;
            dump(path + "\n");
            // work with returned nsILocalFile...
          }

     }
};

dump("done.\n");
