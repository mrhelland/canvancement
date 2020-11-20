// ==UserScript==
// @name        Simple Block Jump Menu
// @namespace   https://github.com/mrhelland/canvancement
// @description Alphabetically sort the items in the content selector
// @include     https://*.instructure.com/courses/*/modules
// @require     https://cdn.jsdelivr.net/combine/npm/jquery@3.4.1/dist/jquery.slim.min.js
// @version     0.1
// @grant       none
// ==/UserScript==

/*
NOTE: injectCSS() and its references should be removed if the CSS styles can be added
to an external stylesheet.
*/

var lcsdJumpCheckboxID = "lcsd-jump-checkbox";
var lcsdJumpDefaultState = "checked";

function getJumpTileHTML(jq, module) {
  let moduleTitle = jq(module).children('.header').children('.ig-header-title').children('span').first().text();
  let moduleHeaderHTML = "<div class='lcsd-jump-header'>" 
                        + "<div class='lcsd-jump-moduletitle'>"
                        + moduleTitle
                        + "</div></div>";
  let html = "<div class='lcsd-jump-tile'><a href='#"
              + jq(module).attr("id") + "'>" 
              + moduleHeaderHTML 
              + "</a></div>"; 
  return html;
}

// TODO: Remove this function and its references if styles are added to an external stylesheet.
function injectCSS(jq) {
  let css = "<style type='text/css'>#lcsd-jump-toc{display:block;margin-top:0.5em;margin-bottom:0;}#lcsd-jump-container{display:flex;flex-flow:row wrap;justify-content:flex-start; font-family:Lato,sans-serif;flex-wrap:wrap;width:100%;box-sizing:border-box;min-height:64px;padding:0px 9px 0px 9px;}.lcsd-jump-tile{flex-wrap:wrap;width:250px;margin:8px 6px 4px 0px;}.lcsd-jump-header{background-color:#f5f5f5;font-weight:700;text-align:left}.lcsd-jump-header{width:100%;border:1px solid #C7CDD1;margin:0;padding:0px;position:relative;box-sizing:border-box}.lcsd-jump-moduletitle{color:#3d454c;width:calc(100% - 16px);text-overflow:ellipsis;overflow:hidden;white-space:nowrap;padding:2px 4px 2px 4px;font-weight:400;}.lcsd-jump-tile a{color:#3d454c;text-decoration:none}.lcsd-jump-moduletitle::before{content:'▌ ';padding-right:4px;color:gray;}.lcsd-jump-moduleitem{margin:2px 8px 4px 8px;text-overflow:ellipsis;font-style:italic;overflow:hidden;width:85%;white-space:nowrap;color:#3d454c;opacity:0.5;font-size:0.8em;line-height:1.0em;} .lcsd-jump-top{width:100%;text-align:right;} .lcsd-jump-top a{color:#3d454c;} #lcsd-jump-toc input[type='checkbox'] {vertical-align:1px; transform:scale(1.2,1.2);}#lcsd-jump-toc label{font-size: 1.1em; color: #999999;}</style>";
  jq('head').append(css);
}
 
(function() {
  'use strict';
  // TODO: In Firefox, the regex fails after # is added to page location using To Top link. Why?
  var pageRegex = new RegExp('^/courses/[0-9]+/modules$');
  if (!pageRegex.test(window.location.pathname)) {
    return;
  }
  let jq = jQuery().jquery === '1.7.2' ? jQuery : jQuery.noConflict();

  // TODO: remove this reference when external CSS stylesheet exists
  injectCSS(jq);

  let savedState = localStorage.getItem(lcsdJumpCheckboxID) || lcsdJumpDefaultState;
  let $mountPoint = jq("#external-tool-mount-point");
  let $modules = jq(".context_module");

  //build jump menu container and contents
  let innerHTML = "";
  for (let i = 0; i < Math.max(0, $modules.length - 1); i++) {
    innerHTML += getJumpTileHTML(jq, $modules[i]);
  }
  $mountPoint.append("<div id='lcsd-jump-toc'><label for='"+lcsdJumpCheckboxID+"'><input type='checkbox' id='"+lcsdJumpCheckboxID+"'> Table of Contents</label></div><div id='lcsd-jump-container'>" + innerHTML + "</div>");
  
  //inject ToTop links
  for (let i = 0; i < Math.max(0, $modules.length - 1); i++) {
    jq($modules[i]).append("<div class='lcsd-jump-top'><a href='#'>▲ To Top ▲</a></div>");
  }

  //read currently saved checkbox state
  if(savedState === "checked") {
    jq("#"+lcsdJumpCheckboxID).prop("checked", true);
    jq("#lcsd-jump-container").show();
  } else {
    jq("#"+lcsdJumpCheckboxID).prop("checked", false);
    jq("#lcsd-jump-container").hide();
  }

  //update saved checkbox state on change
  jq("#lcsd-jump-toc").on("change", "input", function() {
    if(!jq(this).is(":checked")) {
      localStorage.setItem(lcsdJumpCheckboxID, "unchecked");
      jq("#lcsd-jump-container").hide();
    } else {
      localStorage.setItem(lcsdJumpCheckboxID, "checked");
      jq("#lcsd-jump-container").show();
    }
  });
 
})();
