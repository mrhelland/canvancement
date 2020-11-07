// ==UserScript==
// @name        Jump Menu
// @namespace   https://github.com/mrhelland/canvancement
// @description Alphabetically sort the items in the content selector
// @include     https://*.instructure.com/courses/*/modules
// @require     https://cdn.jsdelivr.net/combine/npm/jquery@3.4.1/dist/jquery.slim.min.js
// @version     1
// @grant       none
// ==/UserScript==

function getJumpTile(jq, module) {
  console.log(module);
  let jumpID = module.attr("id");
  let tileTemplate = "<div class='lcsd-jump-tile'><a href='[[JUMP_LINK]]'>[[MODULE_HEADER]]<div class='lcsd-jump-body'>[[MODULE_ITEMS]]<div class='lcsd-jump-fadeout'></div></div></a>"
  let moduleHeaderHTML = "<div class='lcsd-jump-header'>" 
                        + "<div class='lcsd-jump-moduletitle'>"
                        + module.find("div.name").text() 
                        + "</div></div>";
  let moduleItems = module.find(".context_module_item");
  let moduleItemsHTML = "";
  for(let i=0; i < moduleItems.length; i++) {
    moduleItemsHTML += "<div class='lcsd-jump-moduleitem'>" 
                    + moduleItem[i].find(".module-item-title").text() 
                    + "</div>"; 
  }

  let html = "<div class='lcsd-jump-tile'><a href='"
              + module.attr("id") + moduleHeaderHTML 
              + moduleItemsHTML + "<div class='lcsd-jump-fadeout'></div></div></a></div>"; 
  return html;
}

function buildJumpContainer(jq, mountPoint) {
  let modules = jq(".context_module");
  let innerHTML = "";
  for (let i = 0; i < modules.length; i++) {
    innerHTML += getJumpTile(jq, modules[i]);
  }
  mountPoint.html(innerHTML);
}

function injectCSS(jq) {

}

(function() {
  'use strict';

  var pageRegex = new RegExp('^/courses/[0-9]+/modules$');
  if (!pageRegex.test(window.location.pathname)) {
    return;
  }

  let jq = jQuery().jquery === '1.7.2' ? jQuery : jQuery.noConflict();
  jq('head').append('<link rel="stylesheet" type="text/css" href="https://raw.githubusercontent.com/mrhelland/canvancement/alpha/modules/jump-menu.css">');


  jq.ready ( function() {
    let mountPoint = jq("#external-tool-mount-point");
    buildJumpContainer(jq, mountPoint);
  });


 
})();
