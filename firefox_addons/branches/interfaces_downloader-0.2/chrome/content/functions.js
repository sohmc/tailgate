dump("sourcing functions.js...");
var ifdl_functions = {
     debug_value: function() {
          var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService)
                                .getBranch("extensions.interfacesdownloader.");

          if (prefs.prefHasUserValue("debug")) {
               return prefs.getIntPref("debug");
          } else {
               return 0;
          }
     },

     save_images: function () {
          if (ifdl_wrapper.debug >= 3) ifdl_functions.dump("Attempting to store images xml...");
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

               if (ifdl_wrapper.debug >= 3) ifdl_functions.dump("Stored " + temp_file.fileSize + " bytes.");
          });
     },

     remove_temp_file: function () {
          var temp_file = Components.classes["@mozilla.org/file/directory_service;1"]
                                    .getService(Components.interfaces.nsIProperties)
                                    .get("ProfD", Components.interfaces.nsIFile);

          temp_file.append("ifdl_cache.xml");
          if (temp_file.exists()) temp_file.remove(false);
     },

     load_images: function () {
          if (ifdl_wrapper.debug >= 3) ifdl_functions.dump("Attempting to restore images...")
          var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService)
                                .getBranch("extensions.interfacesdownloader.");

          var temp_file = Components.classes["@mozilla.org/file/directory_service;1"]
                                    .getService(Components.interfaces.nsIProperties)
                                    .get("ProfD", Components.interfaces.nsIFile);

          temp_file.append("ifdl_cache.xml");

          // =-=-=-=-=- LOAD -=-=-=-=-= //
          if (temp_file.exists()) {
               if (ifdl_wrapper.debug >= 3) ifdl_functions.dump(temp_file.path + " exists.");
               Components.utils.import("resource://gre/modules/NetUtil.jsm");

               NetUtil.asyncFetch(temp_file, function(inputStream, status) {
                    if (!Components.isSuccessCode(status)) {
                         // Handle error!
                         return;
                    }

                    // The file data is contained within inputStream.
                    // You can read it into a string with
                    var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());

                    if (data.length > 0) {
                         window._content.document.getElementById('images').innerHTML = data;
                         if (ifdl_wrapper.debug >= 3) ifdl_functions.dump("Restored " + temp_file.fileSize + " bytes.");
                         ifdl_functions.add_events();
                    }
               });
          }
     },

     process_images: function () {
          var images = ifdl_functions.xpath('.//option[@id[starts-with(.,"op_")]]');

          if (images.snapshotLength > 0) {
               var p = images.snapshotItem(0);
               ifdl_functions.download_image(p);
          }
     },


     download_image: function (node) {
          if (ifdl_wrapper.debug >= 1) ifdl_functions.dump("downloading image...");
          var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService)
                                .getBranch("extensions.interfacesdownloader.");

          if (prefs.prefHasUserValue("image_location")) {
               var local_path = prefs.getComplexValue("image_location", Components.interfaces.nsILocalFile);
               var destination = local_path;
               if (ifdl_wrapper.debug >= 3) ifdl_functions.dump("image_location: " + local_path.path);
               
               var src = node.value;
               if (ifdl_wrapper.debug >= 3) ifdl_functions.dump("source: " + src);

               var re = /\/([\w\-]+.jpg)$/.exec(src);
               if (ifdl_wrapper.debug >= 1) ifdl_functions.dump("image name: " + re[1]);

               destination.append(re[1]);
               
               if (ifdl_wrapper.debug >= 3) ifdl_functions.dump("destination: " + destination.path)

               var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
                             .createInstance(Components.interfaces.nsIWebBrowserPersist);

               var ios = Components.classes['@mozilla.org/network/io-service;1']
                         .getService(Components.interfaces.nsIIOService);

               var uri = ios.newURI(src, null, null);

               // with persist flags if desired See nsIWebBrowserPersist page for more PERSIST_FLAGS.
               const nsIWBP = Components.interfaces.nsIWebBrowserPersist;
               const flags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
               persist.persistFlags = flags | nsIWBP.PERSIST_FLAGS_FROM_CACHE;

               persist.progressListener = {
                    onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
                         if (aCurTotalProgress == aMaxTotalProgress) {
                              if (ifdl_wrapper.debug >= 1) ifdl_functions.dump("Finished downloading.");
                         }
                    },

                    onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus) {
                         var hex = aStateFlags.toString(16);
                         if (ifdl_wrapper.debug >= 3) ifdl_functions.dump(aStateFlags + " (hex: " + hex + ") " + aStatus);

                         if (hex = '50001') {
                              node.style.fontStyle = 'italic';
                              node.style.color = '#BBBBBB';
                         }

                         if ((hex = '50010') && (destination.exists())) {
                              if (ifdl_wrapper.debug >= 1) ifdl_functions.dump("File size: " + destination.fileSize);
                              node.parentNode.removeChild(node);
                              ifdl_functions.process_images();
                         }

                    }
               }

               // do the save
               try {
                    persist.saveURI(uri, null, null, null, null, destination);
               } catch (e) {
                    ifdl_functions.dump("There was a problem saving this file:\n\n" + e);
               }
          } else {
               alert("You have not yet set a download directory!  Please visit the extention's options to set it.");
          }
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
          if (ifdl_wrapper.debug >= 1) ifdl_functions.dump("adding events...");
          var select_parent = w.getElementById('images');
          var option_nodes = this.xpath('.//option[@id[starts-with(.,"op_")]]');

          for (var i = 0; i < option_nodes.snapshotLength; i++) {
               var n = option_nodes.snapshotItem(i);

               if (ifdl_wrapper.debug >= 3) ifdl_functions.dump("adding events to item " + i + "...");
               n.addEventListener('dblclick', this.remove_on_dblclick, false);
               n.addEventListener('mouseover', this.show_preview, false);
               n.addEventListener('mouseout', this.clear_preview, false);
               if (ifdl_wrapper.debug >= 3) ifdl_functions.dump("done.");
          }
     },

     remove_on_dblclick: function () {
          var w = window._content.document;
          var preview_box = w.getElementById('preview_box');
          preview_box.textContent = '';
          
          this.parentNode.removeChild(this);
          
          ifdl_functions.save_images();
     },

     show_preview: function () {
          var w = window._content.document;
          var preview_box = w.getElementById('preview_box');

          var img_node = w.createElement('img');
          img_node.setAttribute('width', '180');
          img_node.setAttribute('height', '112');
          img_node.setAttribute('border', '0');
          img_node.setAttribute('src', this.getAttribute('preview'));

          preview_box.appendChild(img_node);
     },

     clear_preview: function() {
          var w = window._content.document;
          var preview_box = w.getElementById('preview_box');
          preview_box.textContent = '';
     },

     xpath: function (q) {
          if (ifdl_wrapper.debug >= 1) ifdl_functions.dump("xpath query: " + q);
          var nodes = window._content.document.evaluate(q, window._content.document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          if (ifdl_wrapper.debug >= 3) ifdl_functions.dump('number of nodes returned: ' + nodes.snapshotLength);

          return nodes;
     },

     dump: function (s) {
          var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                          .getService(Components.interfaces.nsIConsoleService);

          aConsoleService.logStringMessage("ifdl log:: " + s);
     }

};

dump("done.\n");
