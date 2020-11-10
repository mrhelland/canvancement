// ==UserScript==
// @name        Jump Menu
// @namespace   https://github.com/mrhelland/canvancement
// @description Alphabetically sort the items in the content selector
// @include     https://*.instructure.com/courses/*/modules
// @require     https://cdn.jsdelivr.net/combine/npm/jquery@3.4.1/dist/jquery.slim.min.js
// @version     0.3
// @grant       none
// ==/UserScript==

function getJumpTile(jq, module) {
  let opacity = ["0.5", "0.25", "0.1"];
  let moduleTitle = jq(module).children('.header').children('.ig-header-title').children('span').text();
  let moduleHeaderHTML = "<div class='lcsd-jump-header'>" 
                        + "<div class='lcsd-jump-moduletitle'>"
                        + moduleTitle
                        + "</div></div>";
  let moduleItems = jq(module).find(".context_module_item");
  let moduleItemsHTML = "";
  for(let i=0; i < Math.min(3,moduleItems.length); i++) {
    let itemTitle = jq(moduleItems[i]).find('.item_name').children('.title').first().text();
    console.log("Item name: " + itemTitle);
    moduleItemsHTML += "<div class='lcsd-jump-moduleitem' style='opacity:" + opacity[i] + ";'>" + itemTitle + "</div>"; 
  }

  let html = "<div class='lcsd-jump-tile'><a href='#"
              + jq(module).attr("id") + "'>" + moduleHeaderHTML 
              + moduleItemsHTML + "<div class='lcsd-jump-fadeout'></div></a></div>"; 
  //console.log(html);
  return html;
}

function buildJumpContainer(jq, mountPoint) {
  let modules = jq(".context_module");
  let innerHTML = "";
  for (let i = 0; i < Math.max(0, modules.length - 1); i++) {
    innerHTML += getJumpTile(jq, modules[i]);
    //console.log(jq(modules[i]));
  }
  mountPoint.append("<div id='lcsd-jump-container'>" + innerHTML + "</div>");
}

function injectCSS(jq) {
  let css = "<style type='text/css'>#lcsd-jump-container{display:flex;flex-flow:row wrap;justify-content:space-evenly;font-family:Lato,sans-serif;flex-wrap:wrap;width:100%;box-sizing:border-box;min-height:160px;}.lcsd-jump-tile{flex-wrap:wrap;width:250px;margin:10px}.lcsd-jump-header{background-color:#FFDBCB;color:#6F2000;font-weight:700;text-align:left}.lcsd-jump-body{height:calc(100% - 2em);color:#9ab;background-color:#fff}.lcsd-jump-body,.lcsd-jump-header{width:100%;border:1px solid #c7cdd1;margin:0;padding:4px;position:relative;box-sizing:border-box}.lcsd-jump-moduletitle{color:#333639;width:calc(100% - 16px);text-overflow:ellipsis;overflow:hidden;white-space:nowrap;padding:4px 8px 4px 8px}.lcsd-jump-tile a{color:#333639;text-decoration:none}.lcsd-jump-moduletitle::before{content:'📘 ';padding-right:4px}.lcsd-jump-moduleitem{margin:2px 8px 4px 8px;text-overflow:ellipsis;font-style:italic;overflow:hidden;width:85%;white-space:nowrap;color:#333333;opacity:0.5;font-size:0.8em;line-height:1.0em;}</style>";
  jq('head').append(css);
}

(function() {
  'use strict';

  var pageRegex = new RegExp('^/courses/[0-9]+/modules$');
  if (!pageRegex.test(window.location.pathname)) {
    return;
  }

  let jq = jQuery().jquery === '1.7.2' ? jQuery : jQuery.noConflict();
  injectCSS(jq);

  let mountPoint = jq("#external-tool-mount-point");
  //setTimeout(buildJumpContainer(jq, mountPoint), 50);
  buildJumpContainer(jq, mountPoint);
 
})();
