dump("sourcing functions.js...");
var ifdl_functions = {
     foobar: function (e) {
          alert(e)
     },

     store_images: function () {
          dump("Attempting to store images xml...");
          var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService)
                                .getBranch("extensions.interfacesdownloader.");

          var temp_file = Components.classes["@mozilla.org/file/directory_service;1"]
                                    .getService(Components.interfaces.nsIProperties)
                                    .get("ProfD", Components.interfaces.nsIFile);

          temp_file.append("ifdl_cache.xml");
          if (temp_file.exists()) temp_file.remove(false);
          temp_file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);

          var selects_xml = window._content.document.getElementById('images').innerHTML;

          //=-=-=-=-=- SAVE -=-=-=-=-=//

          Components.utils.import("resource://gre/modules/NetUtil.jsm");
          Components.utils.import("resource://gre/modules/FileUtils.jsm");

          // file is nsIFile, data is a string

          // You can also optionally pass a flags parameter here. It defaults to
          // FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_TRUNCATE;
          var ostream = FileUtils.openSafeFileOutputStream(temp_file)

          var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
                          createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
          converter.charset = "UTF-8";
          var istream = converter.convertToInputStream(selects_xml);

          // The last argument (the callback) is optional.
          NetUtil.asyncCopy(istream, ostream, function(status) {
            if (!Components.isSuccessCode(status)) {
                 alert('Unable to save to ' + temp_file.path);
                 return;
            }
          });

          dump("done.\n");
     },

     restore_images: function () {
          var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService)
                                .getBranch("extensions.interfacesdownloader.");

          var temp_file = Components.classes["@mozilla.org/file/directory_service;1"]
                                    .getService(Components.interfaces.nsIProperties)
                                    .get("ProfD", Components.interfaces.nsIFile);

          temp_file.append("ifdl_cache.xml");

          // =-=-=-=-=- LOAD -=-=-=-=-= //
          Components.utils.import("resource://gre/modules/NetUtil.jsm");

          NetUtil.asyncFetch(temp_file, function(inputStream, status) {
               if (!Components.isSuccessCode(status)) {
                    // Handle error!
                    return;
               }

               // The file data is contained within inputStream.
               // You can read it into a string with
               var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());

               return data;
          });
     },

     xpath: function (q) {
          dump(q + "\n");
          var nodes = window._content.document.evaluate(q, window._content.document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          dump('number of nodes returned: ' + nodes.snapshotLength + "\n");

          return nodes;

     },

};

dump("done.\n");
