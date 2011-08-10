dump("sourcing interfacelift wrapper...");
var interfaceliftdownloader = function(doc) {
     this.hostname = doc.location.hostname;
     this.debug = 3;
     this.document = doc;
          
     // FUNCTIONS

     this.at_interfacelift = function () {
          // Activate jQuery
          this.jQuery = interfacesdownloader.jQuery;
          this.$ = function(selector, context) {
               return new this.jQuery.fn.init(selector, context || window._content.document);
          };
          this.$.fn = this.$.prototype = this.jQuery.fn;
          interfacesdownloader.env = window._content.document;

          this.build_gui();
          this.initialize_interface();
     };

     this.initialize_interface = function() {
          var download_a = this.xpath(".//div[@id[starts-with(.,'download')]]/a");
          var download_div = this.xpath(".//div[@id[starts-with(.,'download')]]/a/..");
          var download_preview = this.xpath(".//div[@id[starts-with(.,'download')]]/a/../../../a/img");

          for (var i = 0; i < download_div.snapshotLength; i++) {
               if (this.debug >= 3) dump("modify " + i + "\n");
               var href = "http://" + this.hostname + download_a.snapshotItem(i).getAttribute('href');
               var re = /^download_(\d+)/.exec(download_div.snapshotItem(i).getAttribute('id'));
               var id = re[1];

               var preview = download_preview.snapshotItem(i).getAttribute('src');

               if (doc.getElementById('op_ifdl_' + id)) {
                    download_div.snapshotItem(i).innerHTML = '<input type="checkbox" name="dl" preview="' + preview + '" value="' + href + '" id="ifdl_' + id + '"checked="true" />';
               } else {
                    download_div.snapshotItem(i).innerHTML = '<input type="checkbox" name="dl" preview="' + preview + '" value="' + href + '" id="ifdl_' + id + '"/>';
               }

               doc.getElementById('ifdl_' + id).addEventListener('click', function() { 
                    dump('id: ' + this.id + ' = value: ' + this.value + "\n");

                    var child = doc.getElementById('op_' + this.id);
                    var select_parent = doc.getElementById('images');

                    if (child) select_parent.removeChild(child);
                    else {
                         var re = /(\d+)$/.exec(this.id);
                         var img_id = re[1];

                         var title_node = doc.evaluate('.//div[@id="list_' + img_id + '"]/.//h1/a[@href[contains(.,"' + img_id + '")]]', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                         var title = title_node.snapshotItem(0).innerHTML;
                         
                         child = doc.createElement('option');
                         child.setAttribute('value', this.value);
                         child.setAttribute('id', 'op_' + this.id);
                         child.setAttribute('preview', this.getAttribute('preview'));
                         child.innerHTML = title;

                         select_parent.appendChild(child);
                         select_parent.scrollTop = select_parent.scrollHeight;

                         doc.getElementById('op_' + this.id).addEventListener('dblclick', function() {
                              doc.getElementById('images').removeChild(doc.getElementById('op_' + this.id));
                         }, false);
                    }
               }, false);
          }

          this.add_events();
     };

     this.add_events = function() {
          var select_parent = doc.getElementById('images');
          var option_nodes = this.xpath('.//option[@id[starts-with(.,"op_")]]');

          for (var i = 0; i < option_nodes.snapshotLength; i++) {
               var n = option_nodes.snapshotItem(i);
               n.removeEventListener('dblclick');

               n.addEventListener('dblclick', function() {
                    select_parent.removeChild(n);
               });
          }
     };

     this.build_gui = function () {
          var ads = this.xpath('.//div[@id="sidebar"]/div[@class="ad"]');
          var sidebar_parent = this.xpath('.//div[@id="sidebar"]');
          
          for (var i = 0; i < ads.snapshotLength; i++) {
               sidebar_parent.snapshotItem(0).removeChild(ads.snapshotItem(i));
               if (this.debug >= 3) dump("removed " + i + "\n");
          }

          var ifdl_gui = doc.createElement('div');
          ifdl_gui.setAttribute('id', 'interface_dl_div');
          ifdl_gui.setAttribute('style', 'width: 180px; height: 400px; position: fixed; z-index: 100; text-align: center; top: 10px;');
          ifdl_gui.innerHTML = "<div id='preview_box' class='preview' style='width: 180px; height: 112px;'></div><select name='images' id='images' size='10' multiple='true' style='width: 175px;'></select><br><input type='button' value='Download Wallpaper' id='download_wallpaper'><span id='img_count' style='padding-left: 10px;'>0</span>";
          sidebar_parent.snapshotItem(0).appendChild(ifdl_gui);

     };

     this.xpath = function (q) {
         if (this.debug >= 2) dump(q + "\n");
         var nodes = this.document.evaluate(q, this.document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
         if (this.debug >= 1) dump('number of nodes returned: ' + nodes.snapshotLength + "\n");

         return nodes
     };
}
dump("Done.\n");
