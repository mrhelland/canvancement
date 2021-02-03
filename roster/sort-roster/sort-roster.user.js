// ==UserScript==
// @name        Sort the Roster (with Highlighting)
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Allows sorting and highlighting of Canvas roster.
// @include     https://*.instructure.com/courses/*/users
// @require     https://cdn.jsdelivr.net/combine/npm/jquery@3.4.1/dist/jquery.slim.min.js,npm/tablesorter@2.31.1
// @version     0.5
// @grant       none
// ==/UserScript==

/*
TODO: injectCSS() and its references should be removed if the CSS styles can be added to an external stylesheet.
*/
function injectCSS(jq) {
  let css = "<style type='text/css'>" + 
      "#lcsd-highlight-container{display:block;}" +
      "#lcsd-highlight-container label{font-size:0.95em;margin-right:16px;}" +
      "#lcsd-highlight-container input[type='checkbox']{vertical-align:0px; transform:scale(1.2,1.2); margin-right:4px;}" + 
      "#lcsd-highlight-container input[type='text']{vertical-align:1px;padding:2px 8px 2px 8px;width:7em;}" + 
      "</style>";
  jq('head').append(css);
}

(function() {
  'use strict';

  var pageRegex = new RegExp('^/courses/\\d+/users/?$');
  if (!pageRegex.test(window.location.pathname)) {
    return;
  }

  const lcsdRosterCheckboxID = "lcsd-roster-checkbox";
  const lcsdRosterTextboxID = "lcsd-roster-textbox";
  const lcsdRosterDefaultState = "checked";
  const lcsdRosterDefaultColor = "#FFFF99";
  const lcsdRosterCutoffDays = 1; // cutoff on prior day
  const lcsdRosterCutoffHour = 15; // 3pm
  let savedState = lcsdRosterDefaultState;
  let savedColor = lcsdRosterDefaultColor;

  let insertCheckBox = function(jq) {
    let $mountPoint = jq("#content .ic-Action-header");
    let html = "<div id='lcsd-highlight-container'><label for='"+     
        lcsdRosterCheckboxID + "'><input type='checkbox' id='" +
        lcsdRosterCheckboxID + "'> Highlight Absences</label></div>";
    $mountPoint.prepend(html);
  }

  let insertTextBox = function(jq) {
    let $mountPoint = jq("#lcsd-highlight-container");
    if(savedState === "checked") {
      let html = "<label for='" + lcsdRosterTextboxID + 
              "'> <input type='text' id='"+lcsdRosterTextboxID + 
              "'> (e.g. #FFFF99, orange)</label>";
      $mountPoint.append(html);
      jq("#"+lcsdRosterTextboxID).val(savedColor);
      jq("#"+lcsdRosterTextboxID).css({"background-color": savedColor});
    }
  }

  let updateCheckboxState = function(jq) {
    //read currently saved checkbox state
    savedState = localStorage.getItem(lcsdRosterCheckboxID) || lcsdRosterDefaultState;
    savedColor = localStorage.getItem(lcsdRosterTextboxID) || lcsdRosterDefaultColor;
    if(savedState === "checked") {
      jq("#"+lcsdRosterCheckboxID).prop("checked", true);
    } else {
      jq("#"+lcsdRosterCheckboxID).prop("checked", false);
    }

    //update saved checkbox state on change
    jq("#lcsd-highlight-container").on("change", "input[type='checkbox']", function() {
      if(!jq(this).is(":checked")) {
        localStorage.setItem(lcsdRosterCheckboxID, "unchecked");
      } else {
        localStorage.setItem(lcsdRosterCheckboxID, "checked");
      }
      location.reload();
    });

    //update saved checkbox state on change
    jq("#lcsd-highlight-container").on("change", "input[type='text']", function() {
      savedColor = jq("#"+lcsdRosterTextboxID).val();
      localStorage.setItem(lcsdRosterTextboxID, savedColor);
      location.reload();
    });
  }

  let getCutoffTime = function(today, hour) {
    let year, month, day, date, min;
    let delta = lcsdRosterCutoffDays * 86400000;
    day = today.getDay();
    //if Saturday or Sunday, then back up to Thursday.
    //if Monday, then back up to Friday.
    if(day==6) {
      delta = delta + 86400000;
    } else if(day==1 || day==0) {
      delta = delta + 2*86400000;
    }
    let cutdate = new Date(today - delta);
    year = cutdate.getFullYear();
    month = cutdate.getMonth();
    date = cutdate.getDate();
    return new Date(year, month, date, hour, 0, 0);
  }

  let colorRowsBeforeCutoff = function(jq, date, cell, cellIndex) {
    if(savedState === "unchecked") {
      return;
    }
    let currentTime = new Date();
    // highlight only if the cell's date is before the cutoff
    if(date < getCutoffTime(currentTime, lcsdRosterCutoffHour)) {
      let prevCell = jq(cell).prev();
      let prevText = jq(cell).prev().text();
      if(!prevText.includes("Observing")) {
        cell.style.backgroundColor = savedColor;
        jq(cell).next().css("backgroundColor",savedColor);
        jq(cell).next().next().css("backgroundColor", savedColor);
        for(let i = cellIndex; i > 0; i--) {
          prevCell.css("backgroundColor",savedColor);
          prevCell = prevCell.prev();
        }
      }
    }
  }



  var rosterColumns = {
    'avatar' : {
      'col' : 0,
      'text' : 'Profile Picture'
    },
    'name' : {
      'text' : 'Name',
      'wrapper' : 'a',
      'heading' : 'Name'
    },
    'login' : {
      'text' : 'Login / SIS ID',
      'heading' : 'Login/SIS'
    },
    'loginid' : {
      'text' : 'Login ID',
      'heading' : 'Login'
    },
    'sisid' : {
      'text' : 'SIS ID'
    },
    'section' : {
      'text' : 'Section',
      'heading' : 'Section',
      'wrapper' : 'div',
      'shrink' : true
    },
    'role' : {
      'text' : 'Role',
      'wrapper' : 'div'
    },
    'last' : {
      'text' : 'Last Activity',
      'heading' : 'Last',
      'wrapper' : 'div',
      'tablesorter' : {
        'sorter' : 'shortDateTime',
        'empty' : 'bottom',
        'sortInitialOrder' : 'desc'
      }
    },
    'total' : {
      'text' : 'Total Activity',
      'heading' : 'Total',
      'align' : 'right',
      'tablesorter' : {
        'sorter' : 'extendedTime',
        'empty' : 'bottom',
        'sortInitialOrder' : 'desc'
      }
    }
  };

  let jq = jQuery().jquery === '1.7.2' ? jQuery : jQuery.noConflict();

  injectCSS(jq);
  insertCheckBox(jq);
  updateCheckboxState(jq);
  insertTextBox(jq);

  if (typeof jq.fn.tablesorter === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tablesorter@2.31.1/dist/js/jquery.tablesorter.combined.min.js';
    script.onload = function() {
      if (jQuery !== jq) {
        jq = jQuery;
      }
      rosterSort();
    };
    document.head.appendChild(script);
  }
  else {
    rosterSort();
  }

  function rosterSort(mutations, tableObserver) {
    var roster = document.querySelector('table.roster tbody');
    if (!roster) {
      if (typeof tableObserver === 'undefined') {
        var sel = document.getElementById('content');
        var obs = new MutationObserver(rosterSort);
        obs.observe(sel, {
          'childList' : true,
          'subtree' : true
        });
      }
      return;
    }
    if (typeof tableObserver !== 'undefined') {
      tableObserver.disconnect();
    }
    try {
      var tableColumns = document.querySelectorAll('table.roster thead tr th');
      var sortHeaders = {};
      var needParser = false;
      var styles = {};
      for (var c = 0; c < tableColumns.length; c++) {
        var columnText = tableColumns[c].textContent.trim();
        var match = false;
        for ( var field in rosterColumns) {
          if (rosterColumns.hasOwnProperty(field)) {
            var info = rosterColumns[field];
            if (typeof info.col !== 'undefined' && info.col == c) {
              if (typeof info.heading === 'undefined') {
                sortHeaders[c] = {
                  'sorter' : false,
                  'parser' : false
                };
                match = true;
                break;
              }
            }
            if (info.text == columnText) {
              rosterColumns[field].col = c;
              if (typeof info.align !== 'undefined') {
                var nthchildSelector = ':nth-child(' + (1 + c) + ')';
                styles['table.roster tr th' + nthchildSelector] = 'text-align:' + info.align + ';';
                styles['table.roster tr td' + nthchildSelector] = 'text-align:' + info.align + ';';
              }
              if (typeof info.tablesorter !== 'undefined') {
                sortHeaders[c] = info.tablesorter;
                if (typeof info.tablesorter.sorter !== 'undefined') {
                  needParser = true;
                }
              }
              match = true;
              break;
            }
          }
        }
        if (!match) {
          sortHeaders[c] = {
            'sorter' : false,
            'parser' : false
          };
        }
      }
      addCSS(styles);
      if (needParser) {
        jq.tablesorter.addParser({
          'id' : 'shortDateTime',
          'format' : function(s, table, cell, cellIndex) {
            var months = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
            var now = new Date();
            var dateRegex = new RegExp('^(?:(' + months + ') (\\d+)|(\\d+) (' + months + '))(?:,? (\\d{4}))?');
            var timeRegex = new RegExp('(\\d+):(\\d{2})(am|pm)?$');
            var tm = '';
            var monthStr, dayStr, month, day, hour, min;
            var year = now.getFullYear();
            if (dateRegex.test(s)) {
              var dateMatch = dateRegex.exec(s);
              if (typeof dateMatch[1] === 'undefined') {
                dayStr = dateMatch[3];
                monthStr = dateMatch[4];
              } else {
                monthStr = dateMatch[1];
                dayStr = dateMatch[2];
              }
              month = months.indexOf(monthStr) / 4;
              day = parseInt(dayStr);
              if (typeof dateMatch[5] !== 'undefined') {
                year = parseInt(dateMatch[5]);
              }
            } else {
              month = now.getMonth();
              day = now.getDay();
              //BUGFIX: Force highlighting when the last access date isn't recognized.
              year = 2000;
            }
            if (timeRegex.test(s)) {
              var timeMatch = timeRegex.exec(s);
              hour = parseInt(timeMatch[1]);
              if (typeof timeMatch[3] !== 'undefined') {
                if (hour == 12) {
                  hour = 0;
                }
                if (timeMatch[3] == 'pm') {
                  hour += 12;
                }
              }
              min = parseInt(timeMatch[2]);
            } else {
              //ADDED (12/31/2020): Time is not in hh:mm format near top of hour
              timeRegex = new RegExp('(\\d+)(am|pm)?$');
              if(timeRegex.test(s)) {
                timeMatch = timeRegex.exec(s);
                hour = parseInt(timeMatch[1]);
                min = 0;
                if (typeof timeMatch[2] !== 'undefined') {
                  if (hour == 12) {
                    hour = 0;
                  }
                  if (timeMatch[2] == 'pm') {
                    hour += 12;
                  }
                } else {
                  hour = 0;
                }
              } else {
                // something bad happened...minimize the damage
                hour = 0;
                min = 0;
              }
            }

            /**
             * Color the rows of students who didn't attend today
             */
            let attendDate = new Date(year, month, day, hour, min, 0);
            colorRowsBeforeCutoff(jq, attendDate, cell, cellIndex);

            tm = attendDate.toISOString();
            return tm;
          },
          'parsed' : false,
          'type' : 'text'
        });
        jq.tablesorter.addParser({
          'id' : 'extendedTime',
          'format' : function(s, table, cell, cellIndex) {
            var extendedTimeRegex = new RegExp('^(?:([0-9]+):)?([0-9]{2}):([0-9]{2})$', 'im');
            var tm = '';
            var matches = extendedTimeRegex.exec(s);
            if (matches) {
              var hrs = parseInt(matches[1]) || 0;
              var mins = parseInt(matches[2]);
              var secs = parseInt(matches[3]);
              tm = 3600 * hrs + 60 * mins + secs;
            }
            return tm;
          },
          'parsed' : false,
          'type' : 'numeric'
        });
      }
      var observerTarget = document.querySelector('table.roster tbody');
      var rowsInRosterTable = observerTarget.rows.length;
      if (rowsInRosterTable >= 50) {
        var observer = new MutationObserver(function() {
          if (observerTarget.rows.length != rowsInRosterTable) {
            rowsInRosterTable = observerTarget.rows.length;
            jq('table.roster.tablesorter').trigger('update', [ true ]);
          }
        });
        observer.observe(observerTarget, {
          'childList' : true
        });
      }
      jq('table.roster').tablesorter({
        'sortReset' : true,
        'headers' : sortHeaders
      });
    } catch (e) {
      console.log(e);
    }
  }

  function addCSS(styles) {
    if (typeof styles !== 'undefined' && Object.keys(styles).length > 0) {
      var key, rule;
      var style = document.createElement('style');
      document.head.appendChild(style);
      var sheet = style.sheet;
      var keys = Object.keys(styles);
      for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        rule = ' {' + styles[key] + '}';
        sheet.insertRule(key + rule, sheet.cssRules.length);
      }
    }
  }
})();
