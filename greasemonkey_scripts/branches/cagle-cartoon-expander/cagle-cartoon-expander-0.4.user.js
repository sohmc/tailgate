// ==UserScript==
// @name           Cagle Cartoon Expander
// @version        0.4
// @author         Michael Soh
// @namespace      cagle_83304
// @description    Expands Cagle editorial cartoons
// @license        GPL 3.0
// @include        http://www.google.com/reader/*
// @include        https://www.google.com/reader/*
//
// ==/UserScript==
// @require        http://usocheckup.redirectme.net/83304.js

var debug = 3;

setTimeout(initialize, 3000);

// =-=-=-=-=- END OF MAIN -=-=-=-=-= //

function initialize() {
     var cagle_links = evaluate_xpath(".//a[@href[contains(.,'rss.cagle.com')]]");

     GM_log("Found links: " + cagle_links.snapshotLength);
     
     var cagle_thumbs = evaluate_xpath(".//img[@src[contains(.,'cagle.com/thumbs')]]");
     if (cagle_thumbs.snapshotLength > 0) {
	  //expand_thumbs();
     }

     if (cagle_links.snapshotLength > 0) {
	  for (var i = 0; i < cagle_links.snapshotLength; i++) {
	       GM_log("adding attributes: " + i);
	       cagle_links.snapshotItem(i).addEventListener("click", start_expanding, true);
	       cagle_links.snapshotItem(i).setAttribute("style", "color: #008080");
	  }
     }
     
/*
     var my_span = document.createElement('span');
     my_span.innerHTML = '<a href="#" id="cagle_tb">Embiggen Cagle Thumbnails</a>';

     var top_controls_div = document.getElementById('viewer-top-controls');
     top_controls_div.appendChild(my_span);

     document.getElementById('cagle_tb').addEventListener("click", expand_thumbs, true); */
}

function start_expanding() {
     setTimeout(expand_thumbs, 3000);
}

function expand_thumbs() {
     var cagle_thumbs = evaluate_xpath(".//img[@src[contains(.,'www.cagle.com/thumbs')]]");
     var images_changed = 0;
     
     GM_log("Found images: " + cagle_thumbs.snapshotLength);

     for (var i = 0; i < cagle_thumbs.snapshotLength; i++) {
	  var current_img = cagle_thumbs.snapshotItem(i);

	  if (current_img.src.search(/www.cagle.com\/thumbs/) != -1) {
	       if (debug >= 2) GM_log("Found thumbnail image #: " + i);
	       var pattern = /(\d+)\/([a-z]+)_\w+.(jpg|gif)/i;
	       var match = pattern.exec(current_img.src);

	       var date_pattern = /^\d+/i;
	       var date_folder = match[1];

	       var author_pattern = /[a-z]+/i;
	       var author = match[2];

	       // http://www.cagle.com/working/100202/cole.jpg
	       if ((date_folder == null) || (author == null)) {
		    GM_log("ERROR detecting pattern: " + match);
	       } else {
		    var new_src = 'http://www.cagle.com/working/' + date_folder + '/' + author + '.' + match[3];
		    if (debug >= 2) GM_log("new src: " + new_src);
		    current_img.src = new_src;

		    current_img.width = 600;
		    images_changed++;
	       }
	  } else if (current_img.src.search(/www.cagle.com\/working/) != -1) {
	       if (debug >= 2) GM_log("Found miniaturized image #: " + i);
	       current_img.width = 600;
	       images_changed++;
	  }
     }
}

function evaluate_xpath(xpath_query) {
     if (debug > 0) GM_log('evaluating: ' + xpath_query);
     var nodes = document.evaluate(xpath_query, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

     return nodes;
}
