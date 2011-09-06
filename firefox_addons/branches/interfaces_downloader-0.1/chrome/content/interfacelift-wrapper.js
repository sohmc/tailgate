dump("sourcing interfacelift wrapper...");
var ifdl_wrapper = function(doc) {
     this.debug = 3;
     this.document = doc;
          
     // FUNCTIONS

     this.at_interfacelift = function () {
          var w_document = window._content.document;
          
          // Remove any existing adds in the sidebar.
          var ads = ifdl_functions.xpath('.//div[@id="sidebar"]/div[@class="ad"]');
          if (ads.snapshotLength > 0) ifdl_functions.remove_ads();


          // If the sidebar is loaded and the images select isn't
          // present, go ahead and build the gui.
          var sidebar_parent = ifdl_functions.xpath('.//div[@id="sidebar"]');
          var select_parent = w_document.getElementById('images');

          if ((sidebar_parent.snapshotLength == 1) && (!select_parent)) this.build_gui();

          // If the number of available downloads does not equal the
          // number of checkboxes, redraw the interface.
          var download_a = ifdl_functions.xpath(".//div[@id[starts-with(.,'download')]]/a");
          var checkboxes = ifdl_functions.xpath(".//input[@id[starts-with(.,'ifdl_')]]");

          if (download_a.snapshotLength != checkboxes.snapshotLength) {
               this.initialize_interface();
               ifdl_functions.load_images();
          }
          
          // If there are any images carried over from the last load,
          // make sure to attach events to them.
          var restored_images = ifdl_functions.xpath('.//option[@id[starts-with(.,"op_")]]');
          if (restored_images.snapshotLength > 0) ifdl_functions.add_events();
     };


     this.initialize_interface = function() {
          var w_document = window._content.document;

          var download_a = ifdl_functions.xpath(".//div[@id[starts-with(.,'download')]]/a");
          var download_div = ifdl_functions.xpath(".//div[@id[starts-with(.,'download')]]/a/..");
          var download_preview = ifdl_functions.xpath(".//div[@id[starts-with(.,'download')]]/a/../../../a/img");

          for (var i = 0; i < download_div.snapshotLength; i++) {
               if (this.debug >= 3) dump("modify " + i + "\n");
               var href = "http://" + w_document.location.hostname + download_a.snapshotItem(i).getAttribute('href');
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
                         dump("item not in select list.  adding...\n");
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

                         dump("done.\n")
                    }

                    ifdl_functions.save_images();
                    ifdl_functions.add_events();
               }, false);
          }

     };

     this.build_gui = function () {
          ifdl_functions.remove_ads();
          
          var w_document = window._content.document;
          var sidebar_parent = ifdl_functions.xpath('.//div[@id="sidebar"]');
          
          var ifdl_gui = w_document.createElement('div');
          ifdl_gui.setAttribute('id', 'interface_dl_div');
          ifdl_gui.setAttribute('style', 'width: 180px; height: 400px; position: fixed; z-index: 100; text-align: center; top: 10px;');
          ifdl_gui.innerHTML = "<div id='preview_box' class='preview' style='width: 180px; height: 112px;'></div><select name='images' id='images' size='10' multiple='true' style='width: 175px;'></select><br><input type='button' value='Download Wallpaper' id='download_wallpaper'>";
          sidebar_parent.snapshotItem(0).appendChild(ifdl_gui);
          
          w_document.getElementById('download_wallpaper').addEventListener('click', function () {
               ifdl_functions.download_images();
          }, false);
     };

}
dump("Done.\n");
