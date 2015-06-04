/*
 * @(#)util.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/27
 */

var MarkCare;

/**
 * Returns the current logged in username.
 */
function getUsername() {
  return 'jianmin';
}

(function(MarkCare) {
  (function(Util) {
    function showPageLoader() {
      $('#loader').css('display', 'block');
    }
    Util.showPageLoader = showPageLoader;

    function hidePageLoader() {
      $('#loader').css('display', 'none');
    }
    Util.hidePageLoader = hidePageLoader;

    function gotoErrorPage() {
      window.location.href = 'error.html';
    }
    Util.gotoErrorPage = gotoErrorPage;

    function assignToScope($scope, obj) {
      for(var key in obj) {
        $scope[key] = obj[key];
      }
    }
    Util.assignToScope = assignToScope;

    function formatDatetime(s, fmt) {
      if (s) {
        // Use ISO-8601 as the datetime format.
        // An ISO 8601 string requires a date part.
        // A time part can also be included, separated 
        // from the date part by a space or a uppercase T.
        // If a time part is included, an offset from 
        // UTC can also be included as +-HH:mm, +-HHmm, or Z.
        // 2013-02-08 24:00:00.000
        // 2013-02-08 09:30:26.123+07:00
        var m = moment(s, moment.ISO_8601);

        // Format the string to the local time zone.
        return m.format(fmt);
      } else {
        return '';
      }
    }
    Util.formatDatetime = formatDatetime;

  })(MarkCare.Util || (MarkCare.Util = {}));
  var Util = MarkCare.Util;
})(MarkCare || (MarkCare = {}));

//////////////////////////////////////////////////////////////////////////////
// MessageCenter
//////////////////////////////////////////////////////////////////////////////

var MessageCenter = function() {
  return {
    showMessage : function(message) {
      var messageCenter = jQuery("#message-center");
      if (messageCenter.length > 0 ) {
        jQuery("#message-content").html(message);
         messageCenter.show();
      } else {
        messageCenter = jQuery("<div id='message-center' class='message-box'><span class='fa fa-close close-message' onclick='MessageCenter.clearMessage()'></span><span id='message-content'>" + message + "</span></div>");
        messageCenter.appendTo(document.body).show();
      }
      var left = (jQuery(window).width()-messageCenter.width())/2;
      messageCenter.css({
        left: left
      });
    },

    clearMessage : function() {
      jQuery("#message-center").remove();
    },

    showFormMessage : function(message, container) {
      if (container === undefined)
        jQuery(".form-message").html(message);
      else
        jQuery(container).find(".form-message").html(message);
    },

    clearFormMessage : function(container) {
      MessageCenter.showMessage('', container);
    }
  };
}();

$(window).resize(function() {
  resizeSidebar();

  // when .modal-wide opened, set content-body height 
  // based on browser height; 200 is appx height of modal 
  // padding, modal title and button bar.
  var height = $(window).height() - 200;
  $('.modal-wide').each(function(index) {
    $(this).find('.modal-body').css('max-height', height);
  });
});

function resizeSidebar() {
  var topOffset = 50;
  var height = ((window.innerHeight > 0) ? window.innerHeight : screen.height) - 1;

  height = height - topOffset;
  if (height < 1) height = 1;

  if (height > topOffset) {
    $('#main-view').css('height', (height) + 'px');
  }
}

function toggleAccordion(nodeId) {
  var abody = jQuery("#accordion_body_" + nodeId);
  var ahandle = jQuery("#accordion_handle_" + nodeId);
  var aheading = jQuery("#accordion_heading_" + nodeId);

  if (abody.is(":visible")) {
    abody.hide();
    //abody.slideToggle();
    ahandle.removeClass("fa-minus-square").addClass("fa-plus-square");
    aheading.removeClass("accordion-border-top").addClass("accordion-border");
  } else {
    abody.show();
    //abody.slideToggle();
    ahandle.removeClass("fa-plus-square").addClass("fa-minus-square");
    aheading.removeClass("accordion-border").addClass("accordion-border-top");
  }
}

/**
 * Defines a parent controller.
 *
 * @param {Object} $scope
 */
function MyParentController($scope, $http) {
  $scope.showModal = function(dialogId) {
    // backdrop: This can be either true or static. This defines 
    // whether or not you want the user to be able to close the 
    // modal by clicking the background.
    jQuery(dialogId).modal({'backdrop' : 'static'});
  };

  $scope.hideModal = function(dialogId) {
    jQuery(dialogId).modal('hide');
  };
}

function getSearchString() {
  var searchString = window.location.search.substring(1);
  return searchString;
}

function getUrlParameter(paramName) {
  var searchString = getSearchString(), i, val, params = searchString.split('&');

  for (i = 0; i < params.length; i++) {
    val = params[i].split('=');
    if (val[0] == paramName && val.length == 2) {
      return unescape(val[1]);
    }
  }

  return null;
}

// Get the filename from a file selection.
function getInputFilename(pathname) {
  var pos = pathname.lastIndexOf("/");
  if (pos == -1)
    pos = pathname.lastIndexOf("\\");
  if (pos != -1)
    return pathname.substring(pos+1);
  else
    return pathname;
}

function bytesToSize(bytes) {
  if (bytes == 0) return '0 Byte';
  var k = 1000;
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

function getSessionProperty(name) {
  return window.sessionStorage.getItem(name);
}

function setSessionProperty(name, value) {
  window.sessionStorage.setItem(name, value);
}

/* end of util.js */
