interfacesdownloader.onFirefoxLoad = function(event) {
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ interfacesdownloader.showFirefoxContextMenu(e); }, false);
};

interfacesdownloader.showFirefoxContextMenu = function(event) {
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-interfacesdownloader").hidden = gContextMenu.onImage;
};

window.addEventListener("load", function () { interfacesdownloader.onFirefoxLoad(); }, false);
