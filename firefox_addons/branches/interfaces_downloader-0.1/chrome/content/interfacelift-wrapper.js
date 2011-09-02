dump("sourcing interfacelift wrapper...");
var ifdl_wrapper = function(doc) {
     this.debug = 3;
     this.document = doc;
          
     // FUNCTIONS

     this.at_interfacelift = function () {
          var download_a = ifdl_functions.xpath(".//div[@id[starts-with(.,'download')]]/a");

          if (download_a.snapshotLength > 0) {
               this.build_gui();
               this.initialize_interface();
               ifdl_functions.restore_images();
               loaded++;
          }
     };

     this.download_images = function () {
          dump("downloading image...\n");
          var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService)
                                .getBranch("extensions.interfacesdownloader.");

          var src = 'http://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Corinthian_oinochoe_animal_frieze_630_BC_Staatliche_Antikensammlungen.jpg/535px-Corinthian_oinochoe_animal_frieze_630_BC_Staatliche_Antikensammlungen.jpg';

          if (prefs.prefHasUserValue("image_location")) {
               var local_path = prefs.getComplexValue("image_location", Components.interfaces.nsILocalFile);
               dump("image_location: " + local_path.path + "\n");

               var re = /\/(\w+.jpg)$/.exec(src);
               dump("image name: " + re[1] + "\n");

               local_path.append(re[1]);
               
               dump("image destination set to: " + local_path.path + "\n")

               var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
                             .createInstance(Components.interfaces.nsIWebBrowserPersist);

               var ios = Components.classes['@mozilla.org/network/io-service;1']
                         .getService(Components.interfaces.nsIIOService);

               var uri = ios.newURI(src, null, null);

               // with persist flags if desired See nsIWebBrowserPersist page for more PERSIST_FLAGS.
               const nsIWBP = Components.interfaces.nsIWebBrowserPersist;
               const flags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
               persist.persistFlags = flags | nsIWBP.PERSIST_FLAGS_FROM_CACHE;

               // do the save
               try {
                    persist.saveURI(uri, null, null, null, null, local_path);
               } catch (e) {
                    dump(e + "\n");
               }
          } else {
               alert("You have not yet set a download directory!  Please visit the extention's options to set it.");
          }
     };

     this.initialize_interface = function() {
          var w_document = window._content.document;

          var download_a = ifdl_functions.xpath(".//div[@id[starts-with(.,'download')]]/a");
          var download_div = ifdl_functions.xpath(".//div[@id[starts-with(.,'download')]]/a/..");
          var download_preview = ifdl_functions.xpath(".//div[@id[starts-with(.,'download')]]/a/../../../a/img");

          for (var i = 0; i < download_div.snapshotLength; i++) {
               if (this.debug >= 3) dump("modify " + i + "\n");
               var href = "http://" + this.hostname + download_a.snapshotItem(i).getAttribute('href');
               var re = /^download_(\d+)/.exec(download_div.snapshotItem(i).getAttribute('id'));
               var id = re[1];

               var preview = download_preview.snapshotItem(i).getAttribute('src');

               if (w_document.getElementById('op_ifdl_' + id)) {
                    download_div.snapshotItem(i).innerHTML = '<input type="checkbox" name="dl" preview="' + preview + '" value="' + href + '" id="ifdl_' + id + '"checked="true" />';
               } else {
                    download_div.snapshotItem(i).innerHTML = '<input type="checkbox" name="dl" preview="' + preview + '" value="' + href + '" id="ifdl_' + id + '"/>';
               }

               w_document.getElementById('ifdl_' + id).addEventListener('click', function() { 
                    var w_document = window._content.document;
                    dump('id: ' + this.id + ' = value: ' + this.value + "\n");

                    var child = w_document.getElementById('op_' + this.id);
                    var select_parent = w_document.getElementById('images');

                    if (child) {
                         select_parent.removeChild(child);
                    } else {
                         dump('item not in select list.  adding...');
                         var re = /(\d+)$/.exec(this.id);
                         var img_id = re[1];

                         var title_node = ifdl_functions.xpath('.//div[@id="list_' + img_id + '"]/.//h1/a[@href[contains(.,"' + img_id + '")]]');
                         var title = title_node.snapshotItem(0).innerHTML;
                         
                         child = w_document.createElement('option');
                         child.setAttribute('value', this.value);
                         child.setAttribute('id', 'op_' + this.id);
                         child.setAttribute('preview', this.getAttribute('preview'));
                         child.innerHTML = title;

                         select_parent.appendChild(child);
                         select_parent.scrollTop = select_parent.scrollHeight;

                         w_document.getElementById('op_' + this.id).addEventListener('dblclick', function() {
                              var w_document = window._content.document;
                              var select_parent = w_document.getElementById('images');

                              select_parent.removeChild(this);
                         }, false);

                         w_document.getElementById('op_' + this.id).addEventListener('mouseover', function() {
                              var w_document = window._content.document;
                              var preview_box = w_document.getElementById('preview_box');
                              preview_box.innerHTML = '<img width="180" height="112" border="0" src="' + this.getAttribute('preview') + '" />';
                         }, false);
                         w_document.getElementById('op_' + this.id).addEventListener('mouseout', function() {
                              var w_document = window._content.document;
                              var preview_box = w_document.getElementById('preview_box');
                              preview_box.innerHTML = '';
                         }, false);

                         dump("done.\n")
                    }

                    ifdl_functions.store_images();
               }, false);
          }

          this.add_events();
     };

     this.add_events = function() {
          var w_document = window._content.document;
          var select_parent = w_document.getElementById('images');
          var option_nodes = ifdl_functions.xpath('.//option[@id[starts-with(.,"op_")]]');

          for (var i = 0; i < option_nodes.snapshotLength; i++) {
               var n = option_nodes.snapshotItem(i);
               var remove_function = function () {
                    select_parent.removeChild(n);
                    ifdl_functions.store_images();
               };

               n.removeEventListener('dblclick', remove_function, false);

               n.addEventListener('dblclick', remove_function, false);
          }
     };

     this.build_gui = function () {
          var w_document = window._content.document;

          var ads = ifdl_functions.xpath('.//div[@id="sidebar"]/div[@class="ad"]');
          var sidebar_parent = ifdl_functions.xpath('.//div[@id="sidebar"]');
          
          for (var i = 0; i < ads.snapshotLength; i++) {
               sidebar_parent.snapshotItem(0).removeChild(ads.snapshotItem(i));
               if (this.debug >= 3) dump("removed " + i + "\n");
          }

          var ifdl_gui = w_document.createElement('div');
          ifdl_gui.setAttribute('id', 'interface_dl_div');
          ifdl_gui.setAttribute('style', 'width: 180px; height: 400px; position: fixed; z-index: 100; text-align: center; top: 10px;');
          ifdl_gui.innerHTML = "<div id='preview_box' class='preview' style='width: 180px; height: 112px;'></div><select name='images' id='images' size='10' multiple='true' style='width: 175px;'></select><br><input type='button' value='Download Wallpaper' id='download_wallpaper'>";
          sidebar_parent.snapshotItem(0).appendChild(ifdl_gui);
          
          w_document.getElementById('download_wallpaper').addEventListener('click', function () {
               ifdl_functions.restore_images();
          }, false);

     };

}
dump("Done.\n");
