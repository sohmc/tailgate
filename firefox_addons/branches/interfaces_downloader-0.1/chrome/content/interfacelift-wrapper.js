dump("sourced interfacelift wrapper.\n");
var interfaceliftdownloader = function(doc) {
     this.hostname = location.hostname;
     this.debug = 3;
     this.document = doc;

     this.at_interfacelift = function(doc) {

     };

     this.xpath = function (q) {
         if (this.debug >= 2) dump(q + "\n");
         var nodes = this.document.evaluate(q, this.document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
         if (this.debug >= 1) dump('number of nodes returned: ' + nodes.snapshotLength + "\n");

         return nodes
     };

}
