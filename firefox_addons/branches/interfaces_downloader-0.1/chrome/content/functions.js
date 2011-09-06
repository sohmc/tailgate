dump("sourcing functions.js...");
var ifdl_functions = {
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
/*
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
          }); */

          // file is nsIFile, data is a string
          var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                         .createInstance(Components.interfaces.nsIFileOutputStream);

          // use 0x02 | 0x10 to open file for appending.
          foStream.init(temp_file, 0x02)
          // In a c file operation, we have no need to set file mode with or operation,
          // directly using "r" or "w" usually.

          // if you are sure there will never ever be any non-ascii text in data you can 
          // also call foStream.writeData directly
          var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                          .createInstance(Components.interfaces.nsIConverterOutputStream);
          converter.init(foStream, "UTF-8", 0, 0);
          converter.writeString(selects_xml);
          converter.close(); // this closes foStream

          dump("done.\n");
     },

     restore_images: function () {
          dump("Attempting to restore images...\n")
          var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService)
                                .getBranch("extensions.interfacesdownloader.");

          var temp_file = Components.classes["@mozilla.org/file/directory_service;1"]
                                    .getService(Components.interfaces.nsIProperties)
                                    .get("ProfD", Components.interfaces.nsIFile);

          temp_file.append("ifdl_cache.xml");

          // =-=-=-=-=- LOAD -=-=-=-=-= //
          /*
          if (temp_file.exists()) {
               dump(temp_file.path + " exists.\n");
               Components.utils.import("resource://gre/modules/NetUtil.jsm");

               NetUtil.asyncFetch(temp_file, function(inputStream, status) {
                    if (!Components.isSuccessCode(status)) {
                         // Handle error!
                         return;
                    }

                    // The file data is contained within inputStream.
                    // You can read it into a string with
                    var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());

                    window._content.document.getElementById('images').innerHTML = data;
               });
          }*/

          // open an input stream from file
          var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].
                        createInstance(Components.interfaces.nsIFileInputStream);
          istream.init(temp_file, 0x01, 0444, 0);
          istream.QueryInterface(Components.interfaces.nsILineInputStream);

          // read lines into array
          var line = {}, hasmore;
          var data = "";
          do {
               hasmore = istream.readLine(line);
               data += line.value;
          } while(hasmore);

          istream.close();

          window._content.document.getElementById('images').innerHTML = data;

          dump("Done\n");
     },

     remove_ads: function () {
          var w = window._content.document;
          var ads = this.xpath('.//div[@id="sidebar"]/div[@class="ad"]');

          for (var i = 0; i < ads.snapshotLength; i++) {
               ads.snapshotItem(i).parentNode.removeChild(ads.snapshotItem(i));
          }
     },

     add_events: function () {
          var w = window._content.document;
          dump("adding events...\n");
          var select_parent = w.getElementById('images');
          var option_nodes = this.xpath('.//option[@id[starts-with(.,"op_")]]');

          for (var i = 0; i < option_nodes.snapshotLength; i++) {
               var n = option_nodes.snapshotItem(i);

               dump("adding events to item " + i + "...");
               n.addEventListener('dblclick', this.remove_on_dblclick, false);
               n.addEventListener('mouseover', this.show_preview, false);
               n.addEventListener('mouseout', this.clear_preview, false);
               dump("done.\n");
               dump(n.getAttribute('id') + "\n");
          }
     },


     remove_on_dblclick: function () {
          var w = window._content.document;
          var preview_box = w.getElementById('preview_box');
          preview_box.innerHTML = '';
          
          this.parentNode.removeChild(this);
          
          this.store_images();
          dump("removed.\n");
     },

     show_preview: function () {
          dump("showing preview\n");

          var w = window._content.document;
          var preview_box = w.getElementById('preview_box');
          preview_box.innerHTML = '<img width="180" height="112" border="0" src="' + this.getAttribute('preview') + '" />';
     },

     clear_preview: function() {
          dump("clearing preview\n");

          var w = window._content.document;
          var preview_box = w.getElementById('preview_box');
          preview_box.innerHTML = '';
     },
     
     
     xpath: function (q) {
          dump(q + "\n");
          var nodes = window._content.document.evaluate(q, window._content.document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          dump('number of nodes returned: ' + nodes.snapshotLength + "\n");

          return nodes;
     },

};

dump("done.\n");
