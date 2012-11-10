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
          if (ifdl_functions.debug_value >= 3) this.dump("Attempting to store images into JSON...");
          var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService)
                                .getBranch("extensions.interfacesdownloader.");

          var temp_file = Components.classes["@mozilla.org/file/directory_service;1"]
                                    .getService(Components.interfaces.nsIProperties)
                                    .get("ProfD", Components.interfaces.nsIFile);

          temp_file.append("ifdl_cache.json");
          if (temp_file.exists()) temp_file.remove(false);
          temp_file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);

          var selects_xml = window.content.document.getElementById('images').childNodes;
          var images_json = new Array();

          for (var i = 0; i < selects_xml.length; i++) {
               images_json[i] = { "id": selects_xml[i].id, "value": selects_xml[i].value, "preview": selects_xml[i].getAttribute('preview') };
          }
          this.dump("Debug set to: " + ifdl_wrapper.debug);
          this.dump(JSON.stringify(images_json));

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
          var istream = converter.convertToInputStream(JSON.stringify(images_json));

          // The last argument (the callback) is optional.
          NetUtil.asyncCopy(istream, ostream, function(status) {
               if (!Components.isSuccessCode(status)) {
                    this.dump("Unable to save to " + temp_file.path);
                    return;
               }

               if (ifdl_wrapper.debug >= 3) this.dump("Stored " + temp_file.fileSize + " bytes.");
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
          if (ifdl_wrapper.debug >= 3) this.dump("Attempting to restore images...")
          var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService)
                                .getBranch("extensions.interfacesdownloader.");

          var temp_file = Components.classes["@mozilla.org/file/directory_service;1"]
                                    .getService(Components.interfaces.nsIProperties)
                                    .get("ProfD", Components.interfaces.nsIFile);

          temp_file.append("ifdl_cache.xml");

          // =-=-=-=-=- LOAD -=-=-=-=-= //
          if (temp_file.exists()) {
               if (ifdl_wrapper.debug >= 3) this.dump(temp_file.path + " exists.");
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
                         window.content.document.getElementById('images').innerHTML = data;
                         if (ifdl_wrapper.debug >= 3) this.dump("Restored " + temp_file.fileSize + " bytes.");
                         this.add_events();
                    }
               });
          }
     },

     process_images: function () {
          var images = this.xpath('.//option[@id[starts-with(.,"op_")]]');

          if (images.snapshotLength > 0) {
               var p = images.snapshotItem(0);
               this.download_image(p);
          }
     },

     clear_images: function () {
          var image_select = this.xpath('.//select[@id="images"]');

          if (image_select.snapshotLength = 1) {
               var p = image_select.snapshotItem(0);

               while (p.hasChildNodes()) {
                    p.removeChild(p.lastChild);
               }

               this.remove_temp_file();
          }

          var checked_boxes = this.xpath('.//input[@type="checkbox"]')
     },


     download_image: function (node) {
          if (ifdl_wrapper.debug >= 1) this.dump("downloading image...");
          var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService)
                                .getBranch("extensions.interfacesdownloader.");

          if (prefs.prefHasUserValue("image_location")) {
               var local_path = prefs.getComplexValue("image_location", Components.interfaces.nsILocalFile);
               var destination = local_path;
               if (ifdl_wrapper.debug >= 3) this.dump("image_location: " + local_path.path);
               
               var src = node.value;
               if (ifdl_wrapper.debug >= 3) this.dump("source: " + src);

               var re = /\/([\w\-]+.jpg)$/.exec(src);
               if (ifdl_wrapper.debug >= 1) this.dump("image name: " + re[1]);

               destination.append(re[1]);
               
               if (ifdl_wrapper.debug >= 3) this.dump("destination: " + destination.path)

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
                              if (ifdl_wrapper.debug >= 1) this.dump("Finished downloading.");
                         }
                    },

                    onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus) {
                         var hex = aStateFlags.toString(16);
                         if (ifdl_wrapper.debug >= 3) this.dump(aStateFlags + " (hex: " + hex + ") " + aStatus);

                         if (hex = '50001') {
                              node.style.fontStyle = 'italic';
                              node.style.color = '#BBBBBB';
                         }

                         if ((hex = '50010') && (destination.exists())) {
                              if (ifdl_wrapper.debug >= 1) this.dump("File size: " + destination.fileSize);
                              node.parentNode.removeChild(node);
                              this.process_images();
                         }

                    }
               }

               // do the save
               try {
                    persist.saveURI(uri, null, null, null, null, destination);
               } catch (e) {
                    this.dump("There was a problem saving this file:\n\n" + e);
               }
          } else {
               alert("You have not yet set a download directory!  Please visit the extention's options to set it.");
          }
     },


     remove_ads: function () {
          var w = window.content.document;
          var ads = this.xpath('.//div[@id="sidebar"]/div[@class="ad"]');

          for (var i = 0; i < ads.snapshotLength; i++) {
               ads.snapshotItem(i).parentNode.removeChild(ads.snapshotItem(i));
          }
     },

     add_events: function () {
          var w = window.content.document;
          if (ifdl_wrapper.debug >= 1) this.dump("adding events...");
          var select_parent = w.getElementById('images');
          var option_nodes = this.xpath('.//option[@id[starts-with(.,"op_")]]');

          for (var i = 0; i < option_nodes.snapshotLength; i++) {
               var n = option_nodes.snapshotItem(i);

               if (ifdl_wrapper.debug >= 3) this.dump("adding events to item " + i + "...");
               n.addEventListener('dblclick', this.remove_on_dblclick, false);
               n.addEventListener('mouseover', this.show_preview, false);
               n.addEventListener('mouseout', this.clear_preview, false);
               if (ifdl_wrapper.debug >= 3) this.dump("done.");
          }
     },

     remove_on_dblclick: function () {
          var w = window.content.document;
          var preview_box = w.getElementById('preview_box');
          preview_box.textContent = '';
          
          this.parentNode.removeChild(this);
          
          this.save_images();
     },

     show_preview: function () {
          var w = window.content.document;
          var preview_box = w.getElementById('preview_box');

          var img_node = w.createElement('img');
          img_node.setAttribute('width', '180');
          img_node.setAttribute('height', '112');
          img_node.setAttribute('border', '0');
          img_node.setAttribute('src', this.getAttribute('preview'));

          preview_box.appendChild(img_node);
     },

     clear_preview: function() {
          var w = window.content.document;
          var preview_box = w.getElementById('preview_box');
          preview_box.textContent = '';
     },

     xpath: function (q) {
          if (ifdl_wrapper.debug >= 1) this.dump("xpath query: " + q);
          var nodes = window.content.document.evaluate(q, window.content.document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          if (ifdl_wrapper.debug >= 3) this.dump('number of nodes returned: ' + nodes.snapshotLength);

          return nodes;
     },

     dump: function (s) {
          var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                          .getService(Components.interfaces.nsIConsoleService);

          aConsoleService.logStringMessage("ifdl log:: " + s);
     }

};
