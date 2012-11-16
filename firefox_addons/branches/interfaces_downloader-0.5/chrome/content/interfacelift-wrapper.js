var ifdl_wrapper = function(doc) {
     this.debug = ifdl_functions.debug_value();
     
     // FUNCTIONS

     this.at_interfacelift = function () {
          var w_document = window.content.document;
          var download_a = ifdl_functions.xpath(".//div[@id[starts-with(.,'download')]]/a");

          if ((w_document.getElementById('interface_dl_div') == null) && (download_a.snapshotLength > 0)) {
               ifdl_functions.dump(w_document.location);
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
                    ifdl_functions.dump("Initializing interface.  Images found: " + download_a.snapshotLength);
                    this.initialize_interface();
                    ifdl_functions.load_images();
               } else {
                    ifdl_functions.dump("InterfaceLift Add-on did not execute because it did not find any valid images.");
                    ifdl_functions.dump(w_document.getElementsByTagName('body')[0].innerHTML);
               }
               
               // If there are any images carried over from the last load,
               // make sure to attach events to them.
               var restored_images = ifdl_functions.xpath('.//option[@id[starts-with(.,"op_")]]');
               if (restored_images.snapshotLength > 0) ifdl_functions.add_events();
          }
     };


     this.initialize_interface = function() {
          var w_document = doc;

          var download_a = ifdl_functions.xpath(".//div[@id[starts-with(.,'download')]]/a");
          var download_div = ifdl_functions.xpath(".//div[@id[starts-with(.,'download')]]/a/..");
          var download_preview = ifdl_functions.xpath(".//div[@id[starts-with(.,'download')]]/a/../../../a/img");

          for (var i = 0; i < download_div.snapshotLength; i++) {
               if (this.debug >= 3) ifdl_functions.dump("modify " + i);
               var href = "http://" + w_document.location.hostname + download_a.snapshotItem(i).getAttribute('href');
               var re = /^download_(\d+)/.exec(download_div.snapshotItem(i).getAttribute('id'));
               var id = re[1];

               var preview = download_preview.snapshotItem(i).getAttribute('src');

               var input_dom = w_document.createElement('input');
               input_dom.setAttribute('type', 'checkbox');
               input_dom.setAttribute('preview', preview);
               input_dom.setAttribute('value', href);
               input_dom.setAttribute('id', 'ifdl_' + id);
               input_dom.setAttribute('name', 'dl');

               if (w_document.getElementById('op_ifdl_' + id)) {
                    input_dom.setAttribute('checked', 'true');
               }


               input_dom.addEventListener('click', function() {
                    var w_document = window.content.document;

                    var child = w_document.getElementById('op_' + this.id);
                    var select_parent = w_document.getElementById('images');

                    if (child) {
                         select_parent.removeChild(child);
                    } else if (this.checked) {
                         var re = /(\d+)$/.exec(this.id);
                         var img_id = re[1];

                         var title_node = ifdl_functions.xpath('.//div[@id="list_' + img_id + '"]/.//h1/a[@href[contains(.,"' + img_id + '")]]');
                         var title = title_node.snapshotItem(0).textContent;
                         
                         child = w_document.createElement('option');
                         child.setAttribute('value', this.value);
                         child.setAttribute('id', 'op_' + this.id);
                         child.setAttribute('preview', this.getAttribute('preview'));
                         child.setAttribute('title', title);
                         child.textContent = title;

                         select_parent.appendChild(child);
                         select_parent.scrollTop = select_parent.scrollHeight;
                    }

                    ifdl_functions.save_images();
                    ifdl_functions.add_events();
               });
               
               download_div.snapshotItem(i).textContent = "";
               download_div.snapshotItem(i).appendChild(input_dom);
          }

     };

     this.build_gui = function () {
          ifdl_functions.remove_ads();
          
          var w_document = doc;
          var sidebar_parent = ifdl_functions.xpath('.//div[@id="sidebar"]');
          
          var ifdl_gui = w_document.createElement('div');
          ifdl_gui.setAttribute('id', 'interface_dl_div');
          ifdl_gui.setAttribute('style', 'width: 180px; height: 400px; position: fixed; z-index: 100; text-align: center; top: 135px;');

          var preview_div = w_document.createElement('div');
          preview_div.setAttribute('id', 'preview_box');
          preview_div.setAttribute('class', 'preview');
          preview_div.setAttribute('style', 'width: 180px; height: 112px;');

          var select_node = w_document.createElement('select');
          select_node.setAttribute('name', 'images');
          select_node.setAttribute('id', 'images');
          select_node.setAttribute('size', '10');
          select_node.setAttribute('style', 'width: 175px');
          select_node.addEventListener('', function() {
               ifdl_functions.save_images();
          }, false);
         
          var download_button = w_document.createElement('input');
          download_button.setAttribute('type', 'button');
          download_button.setAttribute('value', 'Download Wallpaper');
          download_button.setAttribute('id', 'download_wallpaper');
          download_button.addEventListener('click', function() {
               ifdl_functions.process_images();
          }, false);

          var clear_button = w_document.createElement('input');
          clear_button.setAttribute('type', 'button');
          clear_button.setAttribute('value', 'Clear List');
          clear_button.setAttribute('id', 'clear_list');
          clear_button.addEventListener('click', function () {
               ifdl_functions.clear_images();
          }, false);


          ifdl_gui.appendChild(preview_div);
          ifdl_gui.appendChild(select_node);
          ifdl_gui.appendChild(w_document.createElement('br'));
          ifdl_gui.appendChild(download_button);
          ifdl_gui.appendChild(w_document.createElement('br'));
          ifdl_gui.appendChild(clear_button);
          
          sidebar_parent.snapshotItem(0).appendChild(ifdl_gui);
     };

     this.get_document = function() {
          var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].
          getService(Components.interfaces.nsIWindowMediator );
          return wm.getMostRecentWindow("navigator:browser").content.document;
     };

}
