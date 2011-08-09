dump("sourced interfacelift wrapper.\n");
var interfaceliftdownloader = function(document) {
     this.document = document;
     this.hostname = location.hostname;

     this.at_interfacelift = function() {
          var hostname = this.hostname;
          var i = /interfacelift\.com/.test(hostname);

          alert(i);
          return i;
     }

     this.isWorking = function() {
          dump("YES!");

     }

}
