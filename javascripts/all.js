require=(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({"components/printing":[function(require,module,exports){
module.exports=require('nZr0zp');
},{}],"nZr0zp":[function(require,module,exports){
var EventEmitter = require('events').EventEmitter
  , styler = require('components/styler')
  ;

var LANDSCAPE = 'landscape'
  , PORTRAIT = 'portrait'
  , PAGE_HEIGHT = 681
  , PAGE_WIDTH = 908
  ;

function PrintComponent () {}

// Add eventing
PrintComponent.prototype = new EventEmitter();

// Sets up listener for printing
PrintComponent.prototype.init = function () {
  var self = this;

  this.setPageOrientation(LANDSCAPE);

  if (!window.matchMedia) {
    return false;
  }

  window.matchMedia('print').addListener(function (e) {
    self.onPrint(e);
  });
};

// Handles printing event
PrintComponent.prototype.onPrint = function (e) {
  var slideHeight;

  if (!e.matches) {
    return;
  }

  this.emit('print', {
    isPortrait: this._orientation === 'portrait'
  , pageHeight: this._pageHeight
  , pageWidth: this._pageWidth
  });
};

PrintComponent.prototype.setPageOrientation = function (orientation) {
  if (orientation === PORTRAIT) {
    // Flip dimensions for portrait orientation
    this._pageHeight = PAGE_WIDTH;
    this._pageWidth = PAGE_HEIGHT;
  }
  else if (orientation === LANDSCAPE) {
    this._pageHeight = PAGE_HEIGHT;
    this._pageWidth = PAGE_WIDTH;
  }
  else {
    throw new Error('Unknown print orientation: ' + orientation);
  }

  this._orientation = orientation;

  styler.setPageSize(this._pageWidth + 'px ' + this._pageHeight + 'px');
};

// Export singleton instance
module.exports = new PrintComponent();

},{"events":1,"components/styler":"t5Lx4S"}],"components/slide-number":[function(require,module,exports){
module.exports=require('aIW4aw');
},{}],"aIW4aw":[function(require,module,exports){
module.exports = SlideNumberViewModel;

function SlideNumberViewModel (slide, slideshow) {
  var self = this;

  self.slide = slide;
  self.slideshow = slideshow;

  self.element = document.createElement('div');
  self.element.className = 'remark-slide-number';
  self.element.innerHTML = formatSlideNumber(self.slide, self.slideshow);
}

function formatSlideNumber (slide, slideshow) {
  var format = slideshow.getSlideNumberFormat()
    , slides = slideshow.getSlides()
    , current = getSlideNo(slide, slideshow)
    , total = getSlideNo(slides[slides.length - 1], slideshow)
    ;

  if (typeof format === 'function') {
    return format.call(slideshow, current, total);
  }

  return format
      .replace('%current%', current)
      .replace('%total%', total);
}

function getSlideNo (slide, slideshow) {
  var slides = slideshow.getSlides(), i, slideNo = 0;

  for (i = 0; i <= slide.getSlideIndex() && i < slides.length; ++i) {
    if (slides[i].properties.count !== 'false') {
      slideNo += 1;
    }
  }

  return Math.max(1, slideNo);
}

},{}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],1:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":2}],3:[function(require,module,exports){
var Api = require('./remark/api')
  , polyfills = require('./polyfills')
  , styler = require('components/styler')
  ;

// Expose API as `remark`
window.remark = new Api();

// Apply polyfills as needed
polyfills.apply();

// Apply embedded styles to document
styler.styleDocument();

},{"components/styler":"t5Lx4S","./remark/api":4,"./polyfills":5}],"components/styler":[function(require,module,exports){
module.exports=require('t5Lx4S');
},{}],"t5Lx4S":[function(require,module,exports){
var resources = require('../../resources')
  , highlighter = require('../../highlighter')
  ;

module.exports = {
  styleDocument: styleDocument
, setPageSize: setPageSize
};

// Applies bundled styles to document
function styleDocument () {
  var headElement, styleElement, style;

  // Bail out if document has already been styled
  if (getRemarkStylesheet()) {
    return;
  }

  headElement = document.getElementsByTagName('head')[0];
  styleElement = document.createElement('style');
  styleElement.type = 'text/css';

  // Set title in order to enable lookup
  styleElement.title = 'remark';

  // Set document styles
  styleElement.innerHTML = resources.documentStyles;

  // Append highlighting styles
  for (style in highlighter.styles) {
    if (highlighter.styles.hasOwnProperty(style)) {
      styleElement.innerHTML = styleElement.innerHTML +
        highlighter.styles[style];
    }
  }

  // Put element first to prevent overriding user styles
  headElement.insertBefore(styleElement, headElement.firstChild);
}

function setPageSize (size) {
  var stylesheet = getRemarkStylesheet()
    , pageRule = getPageRule(stylesheet)
    ;

  pageRule.style.size = size;
}

// Locates the embedded remark stylesheet
function getRemarkStylesheet () {
  var i, l = document.styleSheets.length;

  for (i = 0; i < l; ++i) {
    if (document.styleSheets[i].title === 'remark') {
      return document.styleSheets[i];
    }
  }
}

// Locates the CSS @page rule
function getPageRule (stylesheet) {
  var i, l = stylesheet.cssRules.length;

  for (i = 0; i < l; ++i) {
    if (stylesheet.cssRules[i] instanceof window.CSSPageRule) {
      return stylesheet.cssRules[i];
    }
  }
}

},{"../../resources":6,"../../highlighter":7}],5:[function(require,module,exports){
exports.apply = function () {
  forEach([Array, window.NodeList, window.HTMLCollection], extend);
};

function forEach (list, f) {
  var i;

  for (i = 0; i < list.length; ++i) {
    f(list[i], i);
  }
}

function extend (object) {
  var prototype = object && object.prototype;

  if (!prototype) {
    return;
  }

  prototype.forEach = prototype.forEach || function (f) {
    forEach(this, f);
  };

  prototype.filter = prototype.filter || function (f) {
    var result = [];

    this.forEach(function (element) {
      if (f(element, result.length)) {
        result.push(element);
      }
    });

    return result;
  };

  prototype.map = prototype.map || function (f) {
    var result = [];

    this.forEach(function (element) {
      result.push(f(element, result.length));
    });

    return result;
  };
}
},{}],"components/timer":[function(require,module,exports){
module.exports=require('yAcg0L');
},{}],"yAcg0L":[function(require,module,exports){
var utils = require('../../utils');

module.exports = TimerViewModel;

function TimerViewModel (events, element) {
  var self = this;

  self.events = events;
  self.element = element;

  self.startTime = null;
  self.pauseStart = null;
  self.pauseLength = 0;

  element.innerHTML = '0:00:00';

  setInterval(function() {
      self.updateTimer();
    }, 100);

  events.on('start', function () {
    // When we do the first slide change, start the clock.
    self.startTime = new Date();
  });

  events.on('resetTimer', function () {
    // If we reset the timer, clear everything.
    self.startTime = null;
    self.pauseStart = null;
    self.pauseLength = 0;
    self.element.innerHTML = '0:00:00';
  });

  events.on('pause', function () {
    self.pauseStart = new Date();
  });

  events.on('resume', function () {
    self.pauseLength += new Date() - self.pauseStart;
    self.pauseStart = null;
  });
}

TimerViewModel.prototype.updateTimer = function () {
  var self = this;

  if (self.startTime) {
    var millis;
    // If we're currently paused, measure elapsed time from the pauseStart.
    // Otherwise, use "now".
    if (self.pauseStart) {
      millis = self.pauseStart - self.startTime - self.pauseLength;
    } else {
      millis = new Date() - self.startTime - self.pauseLength;
    }

    var seconds = Math.floor(millis / 1000) % 60;
    var minutes = Math.floor(millis / 60000) % 60;
    var hours = Math.floor(millis / 3600000);

    self.element.innerHTML = hours + (minutes > 9 ? ':' : ':0') + minutes + (seconds > 9 ? ':' : ':0') + seconds;
  }
};

},{"../../utils":8}],6:[function(require,module,exports){
/* Automatically generated */

module.exports = {
  documentStyles: "html.remark-container,body.remark-container{height:100%;width:100%;-webkit-print-color-adjust:exact;}.remark-container{background:#d7d8d2;margin:0;overflow:hidden;}.remark-container:focus{outline-style:solid;outline-width:1px;}:-webkit-full-screen .remark-container{width:100%;height:100%;}.remark-slides-area{position:relative;height:100%;width:100%;}.remark-slide-container{display:none;position:absolute;height:100%;width:100%;page-break-after:always;}.remark-slide-scaler{background-color:transparent;overflow:hidden;position:absolute;-webkit-transform-origin:top left;-moz-transform-origin:top left;transform-origin:top-left;-moz-box-shadow:0 0 30px #888;-webkit-box-shadow:0 0 30px #888;box-shadow:0 0 30px #888;}.remark-slide{height:100%;width:100%;display:table;table-layout:fixed;}.remark-slide>.left{text-align:left;}.remark-slide>.center{text-align:center;}.remark-slide>.right{text-align:right;}.remark-slide>.top{vertical-align:top;}.remark-slide>.middle{vertical-align:middle;}.remark-slide>.bottom{vertical-align:bottom;}.remark-slide-content{background-color:#fff;background-position:center;background-repeat:no-repeat;display:table-cell;font-size:20px;padding:1em 4em 1em 4em;}.remark-slide-content h1{font-size:55px;}.remark-slide-content h2{font-size:45px;}.remark-slide-content h3{font-size:35px;}.remark-slide-content .left{display:block;text-align:left;}.remark-slide-content .center{display:block;text-align:center;}.remark-slide-content .right{display:block;text-align:right;}.remark-slide-number{bottom:12px;opacity:0.5;position:absolute;right:20px;}.remark-slide-notes{border-top:3px solid black;position:absolute;display:none;}.remark-code{font-size:18px;}.remark-code-line{min-height:1em;}.remark-code-line-highlighted{background-color:rgba(255, 255, 0, 0.5);}.remark-code-span-highlighted{background-color:rgba(255, 255, 0, 0.5);padding:1px 2px 2px 2px;}.remark-visible{display:block;z-index:2;}.remark-fading{display:block;z-index:1;}.remark-fading .remark-slide-scaler{-moz-box-shadow:none;-webkit-box-shadow:none;box-shadow:none;}.remark-backdrop{position:absolute;top:0;bottom:0;left:0;right:0;display:none;background:#000;z-index:2;}.remark-pause{bottom:0;top:0;right:0;left:0;display:none;position:absolute;z-index:1000;}.remark-pause .remark-pause-lozenge{margin-top:30%;text-align:center;}.remark-pause .remark-pause-lozenge span{color:white;background:black;border:2px solid black;border-radius:20px;padding:20px 30px;font-family:Helvetica,arial,freesans,clean,sans-serif;font-size:42pt;font-weight:bold;}.remark-container.remark-presenter-mode.remark-pause-mode .remark-pause{display:block;}.remark-container.remark-presenter-mode.remark-pause-mode .remark-backdrop{display:block;opacity:0.5;}.remark-help{bottom:0;top:0;right:0;left:0;display:none;position:absolute;z-index:1000;-webkit-transform-origin:top left;-moz-transform-origin:top left;transform-origin:top-left;}.remark-help .remark-help-content{color:white;font-family:Helvetica,arial,freesans,clean,sans-serif;font-size:12pt;position:absolute;top:5%;bottom:10%;height:10%;left:5%;width:90%;}.remark-help .remark-help-content h1{font-size:36px;}.remark-help .remark-help-content td{color:white;font-size:12pt;padding:10px;}.remark-help .remark-help-content td:first-child{padding-left:0;}.remark-help .remark-help-content .key{background:white;color:black;min-width:1em;display:inline-block;padding:3px 6px;text-align:center;border-radius:4px;font-size:14px;}.remark-help .dismiss{top:85%;}.remark-container.remark-help-mode .remark-help{display:block;}.remark-container.remark-help-mode .remark-backdrop{display:block;opacity:0.95;}.remark-preview-area{bottom:2%;left:2%;display:none;opacity:0.5;position:absolute;height:47.25%;width:48%;}.remark-preview-area .remark-slide-container{display:block;}.remark-notes-area{background:#e7e8e2;bottom:0;display:none;left:52%;overflow:hidden;position:absolute;right:0;top:0;}.remark-notes-area .remark-top-area{height:50px;left:20px;position:absolute;right:10px;top:10px;}.remark-notes-area .remark-bottom-area{position:absolute;top:75px;bottom:10px;left:20px;right:10px;}.remark-notes-area .remark-bottom-area .remark-toggle{display:block;text-decoration:none;font-family:Helvetica,arial,freesans,clean,sans-serif;border-bottom:1px solid #ccc;height:21px;font-size:0.75em;font-weight:bold;text-transform:uppercase;color:#666;text-shadow:#f5f5f5 1px 1px 1px;}.remark-notes-area .remark-bottom-area .remark-notes-current-area{height:70%;position:relative;}.remark-notes-area .remark-bottom-area .remark-notes-current-area .remark-notes{clear:both;border-top:1px solid #f5f5f5;position:absolute;top:22px;bottom:0px;left:0px;right:0px;overflow-y:auto;margin-bottom:20px;}.remark-notes-area .remark-bottom-area .remark-notes-preview-area{height:30%;position:relative;}.remark-notes-area .remark-bottom-area .remark-notes-preview-area .remark-notes-preview{border-top:1px solid #f5f5f5;position:absolute;top:22px;bottom:0px;left:0px;right:0px;overflow-y:auto;}.remark-notes-area .remark-bottom-area .remark-notes>*:first-child,.remark-notes-area .remark-bottom-area .remark-notes-preview>*:first-child{margin-top:5px;}.remark-notes-area .remark-bottom-area .remark-notes>*:last-child,.remark-notes-area .remark-bottom-area .remark-notes-preview>*:last-child{margin-bottom:0;}.remark-toolbar{color:#979892;vertical-align:middle;}.remark-toolbar .remark-toolbar-link{border:2px solid #d7d8d2;color:#979892;display:inline-block;padding:2px 2px;text-decoration:none;text-align:center;min-width:20px;}.remark-toolbar .remark-toolbar-link:hover{border-color:#979892;color:#676862;}.remark-toolbar .remark-toolbar-timer{border:2px solid black;border-radius:10px;background:black;color:white;display:inline-block;float:right;padding:5px 10px;font-family:sans-serif;font-weight:bold;font-size:175%;text-decoration:none;text-align:center;}.remark-container.remark-presenter-mode .remark-slides-area{top:2%;left:2%;height:47.25%;width:48%;}.remark-container.remark-presenter-mode .remark-preview-area{display:block;}.remark-container.remark-presenter-mode .remark-notes-area{display:block;}.remark-container.remark-blackout-mode:not(.remark-presenter-mode) .remark-backdrop{display:block;opacity:0.99;}.remark-container.remark-mirrored-mode:not(.remark-presenter-mode) .remark-slides-area{-webkit-transform:scaleX(-1);-moz-transform:scaleX(-1);-ms-transform:scaleX(-1);-o-transform:scaleX(-1);}@media print{.remark-container{overflow:visible;background-color:#fff;} .remark-container.remark-presenter-mode .remark-slides-area{top:0px;left:0px;height:100%;width:681px;} .remark-container.remark-presenter-mode .remark-preview-area,.remark-container.remark-presenter-mode .remark-notes-area{display:none;} .remark-container.remark-presenter-mode .remark-slide-notes{display:block;margin-left:30px;width:621px;} .remark-slide-container{display:block;position:relative;} .remark-slide-scaler{-moz-box-shadow:none;-webkit-box-shadow:none;box-shadow:none;}}@page {margin:0;}",
  containerLayout: "<div class=\"remark-notes-area\">\n  <div class=\"remark-top-area\">\n    <div class=\"remark-toolbar\">\n      <a class=\"remark-toolbar-link\" href=\"#increase\">+</a>\n      <a class=\"remark-toolbar-link\" href=\"#decrease\">-</a>\n      <span class=\"remark-toolbar-timer\"></span>\n    </div>\n  </div>\n  <div class=\"remark-bottom-area\">\n    <div class=\"remark-notes-current-area\">\n      <div class=\"remark-toggle\">Notes for current slide</div>\n      <div class=\"remark-notes\"></div>\n    </div>\n    <div class=\"remark-notes-preview-area\">\n      <div class=\"remark-toggle\">Notes for next slide</div>\n      <div class=\"remark-notes-preview\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"remark-slides-area\"></div>\n<div class=\"remark-preview-area\"></div>\n<div class=\"remark-backdrop\"></div>\n<div class=\"remark-pause\">\n  <div class=\"remark-pause-lozenge\">\n    <span>Paused</span>\n  </div>\n</div>\n<div class=\"remark-help\">\n  <div class=\"remark-help-content\">\n    <h1>Help</h1>\n    <p><b>Keyboard shortcuts</b></p>\n    <table class=\"light-keys\">\n      <tr>\n        <td>\n          <span class=\"key\"><b>&uarr;</b></span>,\n          <span class=\"key\"><b>&larr;</b></span>,\n          <span class=\"key\">Pg Up</span>,\n          <span class=\"key\">k</span>\n        </td>\n        <td>Go to previous slide</td>\n      </tr>\n      <tr>\n        <td>\n          <span class=\"key\"><b>&darr;</b></span>,\n          <span class=\"key\"><b>&rarr;</b></span>,\n          <span class=\"key\">Pg Dn</span>,\n          <span class=\"key\">Space</span>,\n          <span class=\"key\">j</span>\n        </td>\n        <td>Go to next slide</td>\n      </tr>\n      <tr>\n        <td>\n          <span class=\"key\">Home</span>\n        </td>\n        <td>Go to first slide</td>\n      </tr>\n      <tr>\n        <td>\n          <span class=\"key\">End</span>\n        </td>\n        <td>Go to last slide</td>\n      </tr>\n      <tr>\n        <td>\n          <span class=\"key\">b</span>&nbsp;/\n          <span class=\"key\">m</span>&nbsp;/\n          <span class=\"key\">f</span>\n        </td>\n        <td>Toggle blackout / mirrored / fullscreen mode</td>\n      </tr>\n      <tr>\n        <td>\n          <span class=\"key\">c</span>\n        </td>\n        <td>Clone slideshow</td>\n      </tr>\n      <tr>\n        <td>\n          <span class=\"key\">p</span>\n        </td>\n        <td>Toggle presenter mode</td>\n      </tr>\n      <tr>\n        <td>\n          <span class=\"key\">t</span>\n        </td>\n        <td>Restart the presentation timer</td>\n      </tr>\n      <tr>\n        <td>\n          <span class=\"key\">?</span>,\n          <span class=\"key\">h</span>\n        </td>\n        <td>Toggle this help</td>\n      </tr>\n    </table>\n  </div>\n  <div class=\"content dismiss\">\n    <table class=\"light-keys\">\n      <tr>\n        <td>\n          <span class=\"key\">Esc</span>\n        </td>\n        <td>Back to slideshow</td>\n      </tr>\n    </table>\n  </div>\n</div>\n"
};

},{}],7:[function(require,module,exports){
(function(){/* Automatically generated */

var hljs = new (/*
Syntax highlighting with language autodetection.
http://highlightjs.org/
*/

function() {

  /* Utility functions */

  function escape(value) {
    return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
  }

  function tag(node) {
    return node.nodeName.toLowerCase();
  }

  function testRe(re, lexeme) {
    var match = re && re.exec(lexeme);
    return match && match.index == 0;
  }

  function blockLanguage(block) {
    var classes = (block.className + ' ' + (block.parentNode ? block.parentNode.className : '')).split(/\s+/);
    classes = classes.map(function(c) {return c.replace(/^lang(uage)?-/, '');});
    return classes.filter(function(c) {return getLanguage(c) || c == 'no-highlight';})[0];
  }

  function inherit(parent, obj) {
    var result = {};
    for (var key in parent)
      result[key] = parent[key];
    if (obj)
      for (var key in obj)
        result[key] = obj[key];
    return result;
  };

  /* Stream merging */

  function nodeStream(node) {
    var result = [];
    (function _nodeStream(node, offset) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType == 3)
          offset += child.nodeValue.length;
        else if (tag(child) == 'br')
          offset += 1;
        else if (child.nodeType == 1) {
          result.push({
            event: 'start',
            offset: offset,
            node: child
          });
          offset = _nodeStream(child, offset);
          result.push({
            event: 'stop',
            offset: offset,
            node: child
          });
        }
      }
      return offset;
    })(node, 0);
    return result;
  }

  function mergeStreams(original, highlighted, value) {
    var processed = 0;
    var result = '';
    var nodeStack = [];

    function selectStream() {
      if (!original.length || !highlighted.length) {
        return original.length ? original : highlighted;
      }
      if (original[0].offset != highlighted[0].offset) {
        return (original[0].offset < highlighted[0].offset) ? original : highlighted;
      }

      /*
      To avoid starting the stream just before it should stop the order is
      ensured that original always starts first and closes last:

      if (event1 == 'start' && event2 == 'start')
        return original;
      if (event1 == 'start' && event2 == 'stop')
        return highlighted;
      if (event1 == 'stop' && event2 == 'start')
        return original;
      if (event1 == 'stop' && event2 == 'stop')
        return highlighted;

      ... which is collapsed to:
      */
      return highlighted[0].event == 'start' ? original : highlighted;
    }

    function open(node) {
      function attr_str(a) {return ' ' + a.nodeName + '="' + escape(a.value) + '"';}
      result += '<' + tag(node) + Array.prototype.map.call(node.attributes, attr_str).join('') + '>';
    }

    function close(node) {
      result += '</' + tag(node) + '>';
    }

    function render(event) {
      (event.event == 'start' ? open : close)(event.node);
    }

    while (original.length || highlighted.length) {
      var stream = selectStream();
      result += escape(value.substr(processed, stream[0].offset - processed));
      processed = stream[0].offset;
      if (stream == original) {
        /*
        On any opening or closing tag of the original markup we first close
        the entire highlighted node stack, then render the original tag along
        with all the following original tags at the same offset and then
        reopen all the tags on the highlighted stack.
        */
        nodeStack.reverse().forEach(close);
        do {
          render(stream.splice(0, 1)[0]);
          stream = selectStream();
        } while (stream == original && stream.length && stream[0].offset == processed);
        nodeStack.reverse().forEach(open);
      } else {
        if (stream[0].event == 'start') {
          nodeStack.push(stream[0].node);
        } else {
          nodeStack.pop();
        }
        render(stream.splice(0, 1)[0]);
      }
    }
    return result + escape(value.substr(processed));
  }

  /* Initialization */

  function compileLanguage(language) {

    function reStr(re) {
        return (re && re.source) || re;
    }

    function langRe(value, global) {
      return RegExp(
        reStr(value),
        'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '')
      );
    }

    function compileMode(mode, parent) {
      if (mode.compiled)
        return;
      mode.compiled = true;

      mode.keywords = mode.keywords || mode.beginKeywords;
      if (mode.keywords) {
        var compiled_keywords = {};

        function flatten(className, str) {
          if (language.case_insensitive) {
            str = str.toLowerCase();
          }
          str.split(' ').forEach(function(kw) {
            var pair = kw.split('|');
            compiled_keywords[pair[0]] = [className, pair[1] ? Number(pair[1]) : 1];
          });
        }

        if (typeof mode.keywords == 'string') { // string
          flatten('keyword', mode.keywords);
        } else {
          Object.keys(mode.keywords).forEach(function (className) {
            flatten(className, mode.keywords[className]);
          });
        }
        mode.keywords = compiled_keywords;
      }
      mode.lexemesRe = langRe(mode.lexemes || /\b[A-Za-z0-9_]+\b/, true);

      if (parent) {
        if (mode.beginKeywords) {
          mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')\\b';
        }
        if (!mode.begin)
          mode.begin = /\B|\b/;
        mode.beginRe = langRe(mode.begin);
        if (!mode.end && !mode.endsWithParent)
          mode.end = /\B|\b/;
        if (mode.end)
          mode.endRe = langRe(mode.end);
        mode.terminator_end = reStr(mode.end) || '';
        if (mode.endsWithParent && parent.terminator_end)
          mode.terminator_end += (mode.end ? '|' : '') + parent.terminator_end;
      }
      if (mode.illegal)
        mode.illegalRe = langRe(mode.illegal);
      if (mode.relevance === undefined)
        mode.relevance = 1;
      if (!mode.contains) {
        mode.contains = [];
      }
      var expanded_contains = [];
      mode.contains.forEach(function(c) {
        if (c.variants) {
          c.variants.forEach(function(v) {expanded_contains.push(inherit(c, v));});
        } else {
          expanded_contains.push(c == 'self' ? mode : c);
        }
      });
      mode.contains = expanded_contains;
      mode.contains.forEach(function(c) {compileMode(c, mode);});

      if (mode.starts) {
        compileMode(mode.starts, parent);
      }

      var terminators =
        mode.contains.map(function(c) {
          return c.beginKeywords ? '\\.?(' + c.begin + ')\\.?' : c.begin;
        })
        .concat([mode.terminator_end, mode.illegal])
        .map(reStr)
        .filter(Boolean);
      mode.terminators = terminators.length ? langRe(terminators.join('|'), true) : {exec: function(s) {return null;}};

      mode.continuation = {};
    }

    compileMode(language);
  }

  /*
  Core highlighting function. Accepts a language name, or an alias, and a
  string with the code to highlight. Returns an object with the following
  properties:

  - relevance (int)
  - value (an HTML string with highlighting markup)

  */
  function highlight(name, value, ignore_illegals, continuation) {

    function subMode(lexeme, mode) {
      for (var i = 0; i < mode.contains.length; i++) {
        if (testRe(mode.contains[i].beginRe, lexeme)) {
          return mode.contains[i];
        }
      }
    }

    function endOfMode(mode, lexeme) {
      if (testRe(mode.endRe, lexeme)) {
        return mode;
      }
      if (mode.endsWithParent) {
        return endOfMode(mode.parent, lexeme);
      }
    }

    function isIllegal(lexeme, mode) {
      return !ignore_illegals && testRe(mode.illegalRe, lexeme);
    }

    function keywordMatch(mode, match) {
      var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0];
      return mode.keywords.hasOwnProperty(match_str) && mode.keywords[match_str];
    }

    function buildSpan(classname, insideSpan, leaveOpen, noPrefix) {
      var classPrefix = noPrefix ? '' : options.classPrefix,
          openSpan    = '<span class="' + classPrefix,
          closeSpan   = leaveOpen ? '' : '</span>';

      openSpan += classname + '">';

      return openSpan + insideSpan + closeSpan;
    }

    function processKeywords() {
      if (!top.keywords)
        return escape(mode_buffer);
      var result = '';
      var last_index = 0;
      top.lexemesRe.lastIndex = 0;
      var match = top.lexemesRe.exec(mode_buffer);
      while (match) {
        result += escape(mode_buffer.substr(last_index, match.index - last_index));
        var keyword_match = keywordMatch(top, match);
        if (keyword_match) {
          relevance += keyword_match[1];
          result += buildSpan(keyword_match[0], escape(match[0]));
        } else {
          result += escape(match[0]);
        }
        last_index = top.lexemesRe.lastIndex;
        match = top.lexemesRe.exec(mode_buffer);
      }
      return result + escape(mode_buffer.substr(last_index));
    }

    function processSubLanguage() {
      if (top.subLanguage && !languages[top.subLanguage]) {
        return escape(mode_buffer);
      }
      var result = top.subLanguage ? highlight(top.subLanguage, mode_buffer, true, top.continuation.top) : highlightAuto(mode_buffer);
      // Counting embedded language score towards the host language may be disabled
      // with zeroing the containing mode relevance. Usecase in point is Markdown that
      // allows XML everywhere and makes every XML snippet to have a much larger Markdown
      // score.
      if (top.relevance > 0) {
        relevance += result.relevance;
      }
      if (top.subLanguageMode == 'continuous') {
        top.continuation.top = result.top;
      }
      return buildSpan(result.language, result.value, false, true);
    }

    function processBuffer() {
      return top.subLanguage !== undefined ? processSubLanguage() : processKeywords();
    }

    function startNewMode(mode, lexeme) {
      var markup = mode.className? buildSpan(mode.className, '', true): '';
      if (mode.returnBegin) {
        result += markup;
        mode_buffer = '';
      } else if (mode.excludeBegin) {
        result += escape(lexeme) + markup;
        mode_buffer = '';
      } else {
        result += markup;
        mode_buffer = lexeme;
      }
      top = Object.create(mode, {parent: {value: top}});
    }

    function processLexeme(buffer, lexeme) {

      mode_buffer += buffer;
      if (lexeme === undefined) {
        result += processBuffer();
        return 0;
      }

      var new_mode = subMode(lexeme, top);
      if (new_mode) {
        result += processBuffer();
        startNewMode(new_mode, lexeme);
        return new_mode.returnBegin ? 0 : lexeme.length;
      }

      var end_mode = endOfMode(top, lexeme);
      if (end_mode) {
        var origin = top;
        if (!(origin.returnEnd || origin.excludeEnd)) {
          mode_buffer += lexeme;
        }
        result += processBuffer();
        do {
          if (top.className) {
            result += '</span>';
          }
          relevance += top.relevance;
          top = top.parent;
        } while (top != end_mode.parent);
        if (origin.excludeEnd) {
          result += escape(lexeme);
        }
        mode_buffer = '';
        if (end_mode.starts) {
          startNewMode(end_mode.starts, '');
        }
        return origin.returnEnd ? 0 : lexeme.length;
      }

      if (isIllegal(lexeme, top))
        throw new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.className || '<unnamed>') + '"');

      /*
      Parser should not reach this point as all types of lexemes should be caught
      earlier, but if it does due to some bug make sure it advances at least one
      character forward to prevent infinite looping.
      */
      mode_buffer += lexeme;
      return lexeme.length || 1;
    }

    var language = getLanguage(name);
    if (!language) {
      throw new Error('Unknown language: "' + name + '"');
    }

    compileLanguage(language);
    var top = continuation || language;
    var result = '';
    for(var current = top; current != language; current = current.parent) {
      if (current.className) {
        result += buildSpan(current.className, result, true);
      }
    }
    var mode_buffer = '';
    var relevance = 0;
    try {
      var match, count, index = 0;
      while (true) {
        top.terminators.lastIndex = index;
        match = top.terminators.exec(value);
        if (!match)
          break;
        count = processLexeme(value.substr(index, match.index - index), match[0]);
        index = match.index + count;
      }
      processLexeme(value.substr(index));
      for(var current = top; current.parent; current = current.parent) { // close dangling modes
        if (current.className) {
          result += '</span>';
        }
      };
      return {
        relevance: relevance,
        value: result,
        language: name,
        top: top
      };
    } catch (e) {
      if (e.message.indexOf('Illegal') != -1) {
        return {
          relevance: 0,
          value: escape(value)
        };
      } else {
        throw e;
      }
    }
  }

  /*
  Highlighting with language detection. Accepts a string with the code to
  highlight. Returns an object with the following properties:

  - language (detected language)
  - relevance (int)
  - value (an HTML string with highlighting markup)
  - second_best (object with the same structure for second-best heuristically
    detected language, may be absent)

  */
  function highlightAuto(text, languageSubset) {
    languageSubset = languageSubset || options.languages || Object.keys(languages);
    var result = {
      relevance: 0,
      value: escape(text)
    };
    var second_best = result;
    languageSubset.forEach(function(name) {
      if (!getLanguage(name)) {
        return;
      }
      var current = highlight(name, text, false);
      current.language = name;
      if (current.relevance > second_best.relevance) {
        second_best = current;
      }
      if (current.relevance > result.relevance) {
        second_best = result;
        result = current;
      }
    });
    if (second_best.language) {
      result.second_best = second_best;
    }
    return result;
  }

  /*
  Post-processing of the highlighted markup:

  - replace TABs with something more useful
  - replace real line-breaks with '<br>' for non-pre containers

  */
  function fixMarkup(value) {
    if (options.tabReplace) {
      value = value.replace(/^((<[^>]+>|\t)+)/gm, function(match, p1, offset, s) {
        return p1.replace(/\t/g, options.tabReplace);
      });
    }
    if (options.useBR) {
      value = value.replace(/\n/g, '<br>');
    }
    return value;
  }

  /*
  Applies highlighting to a DOM node containing code. Accepts a DOM node and
  two optional parameters for fixMarkup.
  */
  function highlightBlock(block) {
    var text = options.useBR ? block.innerHTML
      .replace(/\n/g,'').replace(/<br>|<br [^>]*>/g, '\n').replace(/<[^>]*>/g,'')
      : block.textContent;
    var language = blockLanguage(block);
    if (language == 'no-highlight')
        return;
    var result = language ? highlight(language, text, true) : highlightAuto(text);
    var original = nodeStream(block);
    if (original.length) {
      var pre = document.createElementNS('http://www.w3.org/1999/xhtml', 'pre');
      pre.innerHTML = result.value;
      result.value = mergeStreams(original, nodeStream(pre), text);
    }
    result.value = fixMarkup(result.value);

    block.innerHTML = result.value;
    block.className += ' hljs ' + (!language && result.language || '');
    block.result = {
      language: result.language,
      re: result.relevance
    };
    if (result.second_best) {
      block.second_best = {
        language: result.second_best.language,
        re: result.second_best.relevance
      };
    }
  }

  var options = {
    classPrefix: 'hljs-',
    tabReplace: null,
    useBR: false,
    languages: undefined
  };

  /*
  Updates highlight.js global options with values passed in the form of an object
  */
  function configure(user_options) {
    options = inherit(options, user_options);
  }

  /*
  Applies highlighting to all <pre><code>..</code></pre> blocks on a page.
  */
  function initHighlighting() {
    if (initHighlighting.called)
      return;
    initHighlighting.called = true;

    var blocks = document.querySelectorAll('pre code');
    Array.prototype.forEach.call(blocks, highlightBlock);
  }

  /*
  Attaches highlighting to the page load event.
  */
  function initHighlightingOnLoad() {
    addEventListener('DOMContentLoaded', initHighlighting, false);
    addEventListener('load', initHighlighting, false);
  }

  var languages = {};
  var aliases = {};

  function registerLanguage(name, language) {
    var lang = languages[name] = language(this);
    if (lang.aliases) {
      lang.aliases.forEach(function(alias) {aliases[alias] = name;});
    }
  }

  function listLanguages() {
    return Object.keys(languages);
  }

  function getLanguage(name) {
    return languages[name] || languages[aliases[name]];
  }

  /* Interface definition */

  this.highlight = highlight;
  this.highlightAuto = highlightAuto;
  this.fixMarkup = fixMarkup;
  this.highlightBlock = highlightBlock;
  this.configure = configure;
  this.initHighlighting = initHighlighting;
  this.initHighlightingOnLoad = initHighlightingOnLoad;
  this.registerLanguage = registerLanguage;
  this.listLanguages = listLanguages;
  this.getLanguage = getLanguage;
  this.inherit = inherit;

  // Common regexps
  this.IDENT_RE = '[a-zA-Z][a-zA-Z0-9_]*';
  this.UNDERSCORE_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9_]*';
  this.NUMBER_RE = '\\b\\d+(\\.\\d+)?';
  this.C_NUMBER_RE = '(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
  this.BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
  this.RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

  // Common modes
  this.BACKSLASH_ESCAPE = {
    begin: '\\\\[\\s\\S]', relevance: 0
  };
  this.APOS_STRING_MODE = {
    className: 'string',
    begin: '\'', end: '\'',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE]
  };
  this.QUOTE_STRING_MODE = {
    className: 'string',
    begin: '"', end: '"',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE]
  };
  this.PHRASAL_WORDS_MODE = {
    begin: /\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/
  };
  this.C_LINE_COMMENT_MODE = {
    className: 'comment',
    begin: '//', end: '$',
    contains: [this.PHRASAL_WORDS_MODE]
  };
  this.C_BLOCK_COMMENT_MODE = {
    className: 'comment',
    begin: '/\\*', end: '\\*/',
    contains: [this.PHRASAL_WORDS_MODE]
  };
  this.HASH_COMMENT_MODE = {
    className: 'comment',
    begin: '#', end: '$',
    contains: [this.PHRASAL_WORDS_MODE]
  };
  this.NUMBER_MODE = {
    className: 'number',
    begin: this.NUMBER_RE,
    relevance: 0
  };
  this.C_NUMBER_MODE = {
    className: 'number',
    begin: this.C_NUMBER_RE,
    relevance: 0
  };
  this.BINARY_NUMBER_MODE = {
    className: 'number',
    begin: this.BINARY_NUMBER_RE,
    relevance: 0
  };
  this.CSS_NUMBER_MODE = {
    className: 'number',
    begin: this.NUMBER_RE + '(' +
      '%|em|ex|ch|rem'  +
      '|vw|vh|vmin|vmax' +
      '|cm|mm|in|pt|pc|px' +
      '|deg|grad|rad|turn' +
      '|s|ms' +
      '|Hz|kHz' +
      '|dpi|dpcm|dppx' +
      ')?',
    relevance: 0
  };
  this.REGEXP_MODE = {
    className: 'regexp',
    begin: /\//, end: /\/[gim]*/,
    illegal: /\n/,
    contains: [
      this.BACKSLASH_ESCAPE,
      {
        begin: /\[/, end: /\]/,
        relevance: 0,
        contains: [this.BACKSLASH_ESCAPE]
      }
    ]
  };
  this.TITLE_MODE = {
    className: 'title',
    begin: this.IDENT_RE,
    relevance: 0
  };
  this.UNDERSCORE_TITLE_MODE = {
    className: 'title',
    begin: this.UNDERSCORE_IDENT_RE,
    relevance: 0
  };
}
)()
  , languages = [{name:"javascript",create:/*
Language: JavaScript
*/

function(hljs) {
  return {
    aliases: ['js'],
    keywords: {
      keyword:
        'in if for while finally var new function do return void else break catch ' +
        'instanceof with throw case default try this switch continue typeof delete ' +
        'let yield const class',
      literal:
        'true false null undefined NaN Infinity',
      built_in:
        'eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent ' +
        'encodeURI encodeURIComponent escape unescape Object Function Boolean Error ' +
        'EvalError InternalError RangeError ReferenceError StopIteration SyntaxError ' +
        'TypeError URIError Number Math Date String RegExp Array Float32Array ' +
        'Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array ' +
        'Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require ' +
        'module console window document'
    },
    contains: [
      {
        className: 'pi',
        begin: /^\s*('|")use strict('|")/,
        relevance: 10
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      { // "value" container
        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: 'return throw case',
        contains: [
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          hljs.REGEXP_MODE,
          { // E4X
            begin: /</, end: />;/,
            relevance: 0,
            subLanguage: 'xml'
          }
        ],
        relevance: 0
      },
      {
        className: 'function',
        beginKeywords: 'function', end: /\{/, excludeEnd: true,
        contains: [
          hljs.inherit(hljs.TITLE_MODE, {begin: /[A-Za-z$_][0-9A-Za-z$_]*/}),
          {
            className: 'params',
            begin: /\(/, end: /\)/,
            contains: [
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE
            ],
            illegal: /["'\(]/
          }
        ],
        illegal: /\[|%/
      },
      {
        begin: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      },
      {
        begin: '\\.' + hljs.IDENT_RE, relevance: 0 // hack: prevents detection of keywords after dots
      }
    ]
  };
}
},{name:"ruby",create:/*
Language: Ruby
Author: Anton Kovalyov <anton@kovalyov.net>
Contributors: Peter Leonov <gojpeg@yandex.ru>, Vasily Polovnyov <vast@whiteants.net>, Loren Segal <lsegal@soen.ca>
*/

function(hljs) {
  var RUBY_METHOD_RE = '[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?';
  var RUBY_KEYWORDS =
    'and false then defined module in return redo if BEGIN retry end for true self when ' +
    'next until do begin unless END rescue nil else break undef not super class case ' +
    'require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor';
  var YARDOCTAG = {
    className: 'yardoctag',
    begin: '@[A-Za-z]+'
  };
  var COMMENT = {
    className: 'comment',
    variants: [
      {
        begin: '#', end: '$',
        contains: [YARDOCTAG]
      },
      {
        begin: '^\\=begin', end: '^\\=end',
        contains: [YARDOCTAG],
        relevance: 10
      },
      {
        begin: '^__END__', end: '\\n$'
      }
    ]
  };
  var SUBST = {
    className: 'subst',
    begin: '#\\{', end: '}',
    keywords: RUBY_KEYWORDS
  };
  var STRING = {
    className: 'string',
    contains: [hljs.BACKSLASH_ESCAPE, SUBST],
    variants: [
      {begin: /'/, end: /'/},
      {begin: /"/, end: /"/},
      {begin: '%[qw]?\\(', end: '\\)'},
      {begin: '%[qw]?\\[', end: '\\]'},
      {begin: '%[qw]?{', end: '}'},
      {
        begin: '%[qw]?<', end: '>',
        relevance: 10
      },
      {
        begin: '%[qw]?/', end: '/',
        relevance: 10
      },
      {
        begin: '%[qw]?%', end: '%',
        relevance: 10
      },
      {
        begin: '%[qw]?-', end: '-',
        relevance: 10
      },
      {
        begin: '%[qw]?\\|', end: '\\|',
        relevance: 10
      },
      {
        // \B in the beginning suppresses recognition of ?-sequences where ?
        // is the last character of a preceding identifier, as in: `func?4`
        begin: /\B\?(\\\d{1,3}|\\x[A-Fa-f0-9]{1,2}|\\u[A-Fa-f0-9]{4}|\\?\S)\b/
      }
    ]
  };
  var PARAMS = {
    className: 'params',
    begin: '\\(', end: '\\)',
    keywords: RUBY_KEYWORDS
  };

  var RUBY_DEFAULT_CONTAINS = [
    STRING,
    COMMENT,
    {
      className: 'class',
      beginKeywords: 'class module', end: '$|;',
      illegal: /=/,
      contains: [
        hljs.inherit(hljs.TITLE_MODE, {begin: '[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?'}),
        {
          className: 'inheritance',
          begin: '<\\s*',
          contains: [{
            className: 'parent',
            begin: '(' + hljs.IDENT_RE + '::)?' + hljs.IDENT_RE
          }]
        },
        COMMENT
      ]
    },
    {
      className: 'function',
      beginKeywords: 'def', end: ' |$|;',
      relevance: 0,
      contains: [
        hljs.inherit(hljs.TITLE_MODE, {begin: RUBY_METHOD_RE}),
        PARAMS,
        COMMENT
      ]
    },
    {
      className: 'constant',
      begin: '(::)?(\\b[A-Z]\\w*(::)?)+',
      relevance: 0
    },
    {
      className: 'symbol',
      begin: ':',
      contains: [STRING, {begin: RUBY_METHOD_RE}],
      relevance: 0
    },
    {
      className: 'symbol',
      begin: hljs.UNDERSCORE_IDENT_RE + '(\\!|\\?)?:',
      relevance: 0
    },
    {
      className: 'number',
      begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
      relevance: 0
    },
    {
      className: 'variable',
      begin: '(\\$\\W)|((\\$|\\@\\@?)(\\w+))'
    },
    { // regexp container
      begin: '(' + hljs.RE_STARTERS_RE + ')\\s*',
      contains: [
        COMMENT,
        {
          className: 'regexp',
          contains: [hljs.BACKSLASH_ESCAPE, SUBST],
          illegal: /\n/,
          variants: [
            {begin: '/', end: '/[a-z]*'},
            {begin: '%r{', end: '}[a-z]*'},
            {begin: '%r\\(', end: '\\)[a-z]*'},
            {begin: '%r!', end: '![a-z]*'},
            {begin: '%r\\[', end: '\\][a-z]*'}
          ]
        }
      ],
      relevance: 0
    }
  ];
  SUBST.contains = RUBY_DEFAULT_CONTAINS;
  PARAMS.contains = RUBY_DEFAULT_CONTAINS;

  return {
    aliases: ['rb', 'gemspec', 'podspec', 'thor'],
    keywords: RUBY_KEYWORDS,
    contains: RUBY_DEFAULT_CONTAINS
  };
}
},{name:"python",create:/*
Language: Python
*/

function(hljs) {
  var PROMPT = {
    className: 'prompt',  begin: /^(>>>|\.\.\.) /
  };
  var STRING = {
    className: 'string',
    contains: [hljs.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: /(u|b)?r?'''/, end: /'''/,
        contains: [PROMPT],
        relevance: 10
      },
      {
        begin: /(u|b)?r?"""/, end: /"""/,
        contains: [PROMPT],
        relevance: 10
      },
      {
        begin: /(u|r|ur)'/, end: /'/,
        relevance: 10
      },
      {
        begin: /(u|r|ur)"/, end: /"/,
        relevance: 10
      },
      {
        begin: /(b|br)'/, end: /'/
      },
      {
        begin: /(b|br)"/, end: /"/
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE
    ]
  };
  var NUMBER = {
    className: 'number', relevance: 0,
    variants: [
      {begin: hljs.BINARY_NUMBER_RE + '[lLjJ]?'},
      {begin: '\\b(0o[0-7]+)[lLjJ]?'},
      {begin: hljs.C_NUMBER_RE + '[lLjJ]?'}
    ]
  };
  var PARAMS = {
    className: 'params',
    begin: /\(/, end: /\)/,
    contains: ['self', PROMPT, NUMBER, STRING]
  };
  var FUNC_CLASS_PROTO = {
    end: /:/,
    illegal: /[${=;\n]/,
    contains: [hljs.UNDERSCORE_TITLE_MODE, PARAMS]
  };

  return {
    aliases: ['py', 'gyp'],
    keywords: {
      keyword:
        'and elif is global as in if from raise for except finally print import pass return ' +
        'exec else break not with class assert yield try while continue del or def lambda ' +
        'nonlocal|10 None True False',
      built_in:
        'Ellipsis NotImplemented'
    },
    illegal: /(<\/|->|\?)/,
    contains: [
      PROMPT,
      NUMBER,
      STRING,
      hljs.HASH_COMMENT_MODE,
      hljs.inherit(FUNC_CLASS_PROTO, {className: 'function', beginKeywords: 'def', relevance: 10}),
      hljs.inherit(FUNC_CLASS_PROTO, {className: 'class', beginKeywords: 'class'}),
      {
        className: 'decorator',
        begin: /@/, end: /$/
      },
      {
        begin: /\b(print|exec)\(/ // don’t highlight keywords-turned-functions in Python 3
      }
    ]
  };
}
},{name:"bash",create:/*
Language: Bash
Author: vah <vahtenberg@gmail.com>
Contributrors: Benjamin Pannell <contact@sierrasoftworks.com>
*/

function(hljs) {
  var VAR = {
    className: 'variable',
    variants: [
      {begin: /\$[\w\d#@][\w\d_]*/},
      {begin: /\$\{(.*?)\}/}
    ]
  };
  var QUOTE_STRING = {
    className: 'string',
    begin: /"/, end: /"/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      VAR,
      {
        className: 'variable',
        begin: /\$\(/, end: /\)/,
        contains: [hljs.BACKSLASH_ESCAPE]
      }
    ]
  };
  var APOS_STRING = {
    className: 'string',
    begin: /'/, end: /'/
  };

  return {
    aliases: ['sh', 'zsh'],
    lexemes: /-?[a-z\.]+/,
    keywords: {
      keyword:
        'if then else elif fi for break continue while in do done exit return set '+
        'declare case esac export exec',
      literal:
        'true false',
      built_in:
        'printf echo read cd pwd pushd popd dirs let eval unset typeset readonly '+
        'getopts source shopt caller type hash bind help sudo',
      operator:
        '-ne -eq -lt -gt -f -d -e -s -l -a' // relevance booster
    },
    contains: [
      {
        className: 'shebang',
        begin: /^#![^\n]+sh\s*$/,
        relevance: 10
      },
      {
        className: 'function',
        begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
        returnBegin: true,
        contains: [hljs.inherit(hljs.TITLE_MODE, {begin: /\w[\w\d_]*/})],
        relevance: 0
      },
      hljs.HASH_COMMENT_MODE,
      hljs.NUMBER_MODE,
      QUOTE_STRING,
      APOS_STRING,
      VAR
    ]
  };
}
},{name:"java",create:/*
Language: Java
Author: Vsevolod Solovyov <vsevolod.solovyov@gmail.com>
*/

function(hljs) {
  var KEYWORDS =
    'false synchronized int abstract float private char boolean static null if const ' +
    'for true while long throw strictfp finally protected import native final return void ' +
    'enum else break transient new catch instanceof byte super volatile case assert short ' +
    'package default double public try this switch continue throws';
  return {
    aliases: ['jsp'],
    keywords: KEYWORDS,
    illegal: /<\//,
    contains: [
      {
        className: 'javadoc',
        begin: '/\\*\\*', end: '\\*/',
        contains: [{
          className: 'javadoctag', begin: '(^|\\s)@[A-Za-z]+'
        }],
        relevance: 10
      },
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        beginKeywords: 'protected public private', end: /[{;=]/,
        keywords: KEYWORDS,
        contains: [
          {
            className: 'class',
            beginKeywords: 'class interface', endsWithParent: true, excludeEnd: true,
            illegal: /[:"<>]/,
            contains: [
              {
                beginKeywords: 'extends implements',
                relevance: 10
              },
              hljs.UNDERSCORE_TITLE_MODE
            ]
          },
          {
            begin: hljs.UNDERSCORE_IDENT_RE + '\\s*\\(', returnBegin: true,
            contains: [
              hljs.UNDERSCORE_TITLE_MODE
            ]
          }
        ]
      },
      hljs.C_NUMBER_MODE,
      {
        className: 'annotation', begin: '@[A-Za-z]+'
      }
    ]
  };
}
},{name:"php",create:/*
Language: PHP
Author: Victor Karamzin <Victor.Karamzin@enterra-inc.com>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>, Ivan Sagalaev <maniac@softwaremaniacs.org>
*/

function(hljs) {
  var VARIABLE = {
    className: 'variable', begin: '\\$+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*'
  };
  var PREPROCESSOR = {
    className: 'preprocessor', begin: /<\?(php)?|\?>/
  };
  var STRING = {
    className: 'string',
    contains: [hljs.BACKSLASH_ESCAPE, PREPROCESSOR],
    variants: [
      {
        begin: 'b"', end: '"'
      },
      {
        begin: 'b\'', end: '\''
      },
      hljs.inherit(hljs.APOS_STRING_MODE, {illegal: null}),
      hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null})
    ]
  };
  var NUMBER = {variants: [hljs.BINARY_NUMBER_MODE, hljs.C_NUMBER_MODE]};
  return {
    aliases: ['php3', 'php4', 'php5', 'php6'],
    case_insensitive: true,
    keywords:
      'and include_once list abstract global private echo interface as static endswitch ' +
      'array null if endwhile or const for endforeach self var while isset public ' +
      'protected exit foreach throw elseif include __FILE__ empty require_once do xor ' +
      'return parent clone use __CLASS__ __LINE__ else break print eval new ' +
      'catch __METHOD__ case exception default die require __FUNCTION__ ' +
      'enddeclare final try switch continue endfor endif declare unset true false ' +
      'trait goto instanceof insteadof __DIR__ __NAMESPACE__ ' +
      'yield finally',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.HASH_COMMENT_MODE,
      {
        className: 'comment',
        begin: '/\\*', end: '\\*/',
        contains: [
          {
            className: 'phpdoc',
            begin: '\\s@[A-Za-z]+'
          },
          PREPROCESSOR
        ]
      },
      {
          className: 'comment',
          begin: '__halt_compiler.+?;', endsWithParent: true,
          keywords: '__halt_compiler', lexemes: hljs.UNDERSCORE_IDENT_RE
      },
      {
        className: 'string',
        begin: '<<<[\'"]?\\w+[\'"]?$', end: '^\\w+;',
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      PREPROCESSOR,
      VARIABLE,
      {
        className: 'function',
        beginKeywords: 'function', end: /[;{]/, excludeEnd: true,
        illegal: '\\$|\\[|%',
        contains: [
          hljs.UNDERSCORE_TITLE_MODE,
          {
            className: 'params',
            begin: '\\(', end: '\\)',
            contains: [
              'self',
              VARIABLE,
              hljs.C_BLOCK_COMMENT_MODE,
              STRING,
              NUMBER
            ]
          }
        ]
      },
      {
        className: 'class',
        beginKeywords: 'class interface', end: '{', excludeEnd: true,
        illegal: /[:\(\$"]/,
        contains: [
          {
            beginKeywords: 'extends implements',
            relevance: 10
          },
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      {
        beginKeywords: 'namespace', end: ';',
        illegal: /[\.']/,
        contains: [hljs.UNDERSCORE_TITLE_MODE]
      },
      {
        beginKeywords: 'use', end: ';',
        contains: [hljs.UNDERSCORE_TITLE_MODE]
      },
      {
        begin: '=>' // No markup, just a relevance booster
      },
      STRING,
      NUMBER
    ]
  };
}
},{name:"perl",create:/*
Language: Perl
Author: Peter Leonov <gojpeg@yandex.ru>
*/

function(hljs) {
  var PERL_KEYWORDS = 'getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ' +
    'ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime ' +
    'readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qq' +
    'fileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent ' +
    'shutdown dump chomp connect getsockname die socketpair close flock exists index shmget' +
    'sub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr ' +
    'unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 ' +
    'getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline ' +
    'endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand ' +
    'mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink ' +
    'getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr ' +
    'untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link ' +
    'getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller ' +
    'lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and ' +
    'sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 ' +
    'chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach ' +
    'tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedir' +
    'ioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe ' +
    'atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when';
  var SUBST = {
    className: 'subst',
    begin: '[$@]\\{', end: '\\}',
    keywords: PERL_KEYWORDS
  };
  var METHOD = {
    begin: '->{', end: '}'
    // contains defined later
  };
  var VAR = {
    className: 'variable',
    variants: [
      {begin: /\$\d/},
      {begin: /[\$\%\@\*](\^\w\b|#\w+(\:\:\w+)*|{\w+}|\w+(\:\:\w*)*)/},
      {begin: /[\$\%\@\*][^\s\w{]/, relevance: 0}
    ]
  };
  var COMMENT = {
    className: 'comment',
    begin: '^(__END__|__DATA__)', end: '\\n$',
    relevance: 5
  };
  var STRING_CONTAINS = [hljs.BACKSLASH_ESCAPE, SUBST, VAR];
  var PERL_DEFAULT_CONTAINS = [
    VAR,
    hljs.HASH_COMMENT_MODE,
    COMMENT,
    {
      className: 'comment',
      begin: '^\\=\\w', end: '\\=cut', endsWithParent: true
    },
    METHOD,
    {
      className: 'string',
      contains: STRING_CONTAINS,
      variants: [
        {
          begin: 'q[qwxr]?\\s*\\(', end: '\\)',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*\\[', end: '\\]',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*\\{', end: '\\}',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*\\|', end: '\\|',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*\\<', end: '\\>',
          relevance: 5
        },
        {
          begin: 'qw\\s+q', end: 'q',
          relevance: 5
        },
        {
          begin: '\'', end: '\'',
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: '"', end: '"'
        },
        {
          begin: '`', end: '`',
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: '{\\w+}',
          contains: [],
          relevance: 0
        },
        {
          begin: '\-?\\w+\\s*\\=\\>',
          contains: [],
          relevance: 0
        }
      ]
    },
    {
      className: 'number',
      begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
      relevance: 0
    },
    { // regexp container
      begin: '(\\/\\/|' + hljs.RE_STARTERS_RE + '|\\b(split|return|print|reverse|grep)\\b)\\s*',
      keywords: 'split return print reverse grep',
      relevance: 0,
      contains: [
        hljs.HASH_COMMENT_MODE,
        COMMENT,
        {
          className: 'regexp',
          begin: '(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*',
          relevance: 10
        },
        {
          className: 'regexp',
          begin: '(m|qr)?/', end: '/[a-z]*',
          contains: [hljs.BACKSLASH_ESCAPE],
          relevance: 0 // allows empty "//" which is a common comment delimiter in other languages
        }
      ]
    },
    {
      className: 'sub',
      beginKeywords: 'sub', end: '(\\s*\\(.*?\\))?[;{]',
      relevance: 5
    },
    {
      className: 'operator',
      begin: '-\\w\\b',
      relevance: 0
    }
  ];
  SUBST.contains = PERL_DEFAULT_CONTAINS;
  METHOD.contains = PERL_DEFAULT_CONTAINS;

  return {
    aliases: ['pl'],
    keywords: PERL_KEYWORDS,
    contains: PERL_DEFAULT_CONTAINS
  };
}
},{name:"cpp",create:/*
Language: C++
Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>, Zaven Muradyan <megalivoithos@gmail.com>
*/

function(hljs) {
  var CPP_KEYWORDS = {
    keyword: 'false int float while private char catch export virtual operator sizeof ' +
      'dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace ' +
      'unsigned long throw volatile static protected bool template mutable if public friend ' +
      'do return goto auto void enum else break new extern using true class asm case typeid ' +
      'short reinterpret_cast|10 default double register explicit signed typename try this ' +
      'switch continue wchar_t inline delete alignof char16_t char32_t constexpr decltype ' +
      'noexcept nullptr static_assert thread_local restrict _Bool complex _Complex _Imaginary',
    built_in: 'std string cin cout cerr clog stringstream istringstream ostringstream ' +
      'auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set ' +
      'unordered_map unordered_multiset unordered_multimap array shared_ptr abort abs acos ' +
      'asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp ' +
      'fscanf isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper ' +
      'isxdigit tolower toupper labs ldexp log10 log malloc memchr memcmp memcpy memset modf pow ' +
      'printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp ' +
      'strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan ' +
      'vfprintf vprintf vsprintf'
  };
  return {
    aliases: ['c', 'h', 'c++', 'h++'],
    keywords: CPP_KEYWORDS,
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: 'string',
        begin: '\'\\\\?.', end: '\'',
        illegal: '.'
      },
      {
        className: 'number',
        begin: '\\b(\\d+(\\.\\d*)?|\\.\\d+)(u|U|l|L|ul|UL|f|F)'
      },
      hljs.C_NUMBER_MODE,
      {
        className: 'preprocessor',
        begin: '#', end: '$',
        keywords: 'if else elif endif define undef warning error line pragma',
        contains: [
          {
            begin: 'include\\s*[<"]', end: '[>"]',
            keywords: 'include',
            illegal: '\\n'
          },
          hljs.C_LINE_COMMENT_MODE
        ]
      },
      {
        className: 'stl_container',
        begin: '\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<', end: '>',
        keywords: CPP_KEYWORDS,
        relevance: 10,
        contains: ['self']
      },
      {
        begin: hljs.IDENT_RE + '::'
      }
    ]
  };
}
},{name:"objectivec",create:/*
Language: Objective C
Author: Valerii Hiora <valerii.hiora@gmail.com>
Contributors: Angel G. Olloqui <angelgarcia.mail@gmail.com>
*/

function(hljs) {
  var OBJC_KEYWORDS = {
    keyword:
      'int float while char export sizeof typedef const struct for union ' +
      'unsigned long volatile static bool mutable if do return goto void ' +
      'enum else break extern asm case short default double register explicit ' +
      'signed typename this switch continue wchar_t inline readonly assign ' +
      'self synchronized id ' +
      'nonatomic super unichar IBOutlet IBAction strong weak ' +
      '@private @protected @public @try @property @end @throw @catch @finally ' +
      '@synthesize @dynamic @selector @optional @required',
    literal:
    	'false true FALSE TRUE nil YES NO NULL',
    built_in:
      'NSString NSDictionary CGRect CGPoint UIButton UILabel UITextView UIWebView MKMapView ' +
      'UISegmentedControl NSObject UITableViewDelegate UITableViewDataSource NSThread ' +
      'UIActivityIndicator UITabbar UIToolBar UIBarButtonItem UIImageView NSAutoreleasePool ' +
      'UITableView BOOL NSInteger CGFloat NSException NSLog NSMutableString NSMutableArray ' +
      'NSMutableDictionary NSURL NSIndexPath CGSize UITableViewCell UIView UIViewController ' +
      'UINavigationBar UINavigationController UITabBarController UIPopoverController ' +
      'UIPopoverControllerDelegate UIImage NSNumber UISearchBar NSFetchedResultsController ' +
      'NSFetchedResultsChangeType UIScrollView UIScrollViewDelegate UIEdgeInsets UIColor ' +
      'UIFont UIApplication NSNotFound NSNotificationCenter NSNotification ' +
      'UILocalNotification NSBundle NSFileManager NSTimeInterval NSDate NSCalendar ' +
      'NSUserDefaults UIWindow NSRange NSArray NSError NSURLRequest NSURLConnection ' +
      'UIInterfaceOrientation MPMoviePlayerController dispatch_once_t ' +
      'dispatch_queue_t dispatch_sync dispatch_async dispatch_once'
  };
  var LEXEMES = /[a-zA-Z@][a-zA-Z0-9_]*/;
  var CLASS_KEYWORDS = '@interface @class @protocol @implementation';
  return {
    aliases: ['m', 'mm', 'objc', 'obj-c'],
    keywords: OBJC_KEYWORDS, lexemes: LEXEMES,
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: 'string',
        begin: '\'',
        end: '[^\\\\]\'',
        illegal: '[^\\\\][^\']'
      },

      {
        className: 'preprocessor',
        begin: '#import',
        end: '$',
        contains: [
        {
          className: 'title',
          begin: '\"',
          end: '\"'
        },
        {
          className: 'title',
          begin: '<',
          end: '>'
        }
        ]
      },
      {
        className: 'preprocessor',
        begin: '#',
        end: '$'
      },
      {
        className: 'class',
        begin: '(' + CLASS_KEYWORDS.split(' ').join('|') + ')\\b', end: '({|$)', excludeEnd: true,
        keywords: CLASS_KEYWORDS, lexemes: LEXEMES,
        contains: [
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      {
        className: 'variable',
        begin: '\\.'+hljs.UNDERSCORE_IDENT_RE,
        relevance: 0
      }
    ]
  };
}
},{name:"cs",create:/*
Language: C#
Author: Jason Diamond <jason@diamond.name>
*/

function(hljs) {
  var KEYWORDS =
    // Normal keywords.
    'abstract as base bool break byte case catch char checked const continue decimal ' +
    'default delegate do double else enum event explicit extern false finally fixed float ' +
    'for foreach goto if implicit in int interface internal is lock long new null ' +
    'object operator out override params private protected public readonly ref return sbyte ' +
    'sealed short sizeof stackalloc static string struct switch this throw true try typeof ' +
    'uint ulong unchecked unsafe ushort using virtual volatile void while async await ' +
    // Contextual keywords.
    'ascending descending from get group into join let orderby partial select set value var ' +
    'where yield';
  return {
    keywords: KEYWORDS,
    illegal: /::/,
    contains: [
      {
        className: 'comment',
        begin: '///', end: '$', returnBegin: true,
        contains: [
          {
            className: 'xmlDocTag',
            variants: [
              {
                begin: '///', relevance: 0
              },
              {
                begin: '<!--|-->'
              },
              {
                begin: '</?', end: '>'
              }
            ]
          }
        ]
      },
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'preprocessor',
        begin: '#', end: '$',
        keywords: 'if else elif endif define undef warning error line region endregion pragma checksum'
      },
      {
        className: 'string',
        begin: '@"', end: '"',
        contains: [{begin: '""'}]
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.C_NUMBER_MODE,
      {
        beginKeywords: 'protected public private internal', end: /[{;=]/,
        keywords: KEYWORDS,
        contains: [
          {
            beginKeywords: 'class namespace interface',
            starts: {
              contains: [hljs.TITLE_MODE]
            }
          },
          {
            begin: hljs.IDENT_RE + '\\s*\\(', returnBegin: true,
            contains: [
              hljs.TITLE_MODE
            ]
          }
        ]
      }
    ]
  };
}
},{name:"sql",create:/*
 Language: SQL
 Contributors: Nikolay Lisienko <info@neor.ru>, Heiko August <post@auge8472.de>, Travis Odom <travis.a.odom@gmail.com>
 */

function(hljs) {
  var COMMENT_MODE = {
    className: 'comment',
    begin: '--', end: '$'
  };
  return {
    case_insensitive: true,
    illegal: /[<>]/,
    contains: [
      {
        className: 'operator',
        beginKeywords:
          'begin end start commit rollback savepoint lock alter create drop rename call '+
          'delete do handler insert load replace select truncate update set show pragma grant '+
          'merge describe use explain help declare prepare execute deallocate savepoint release '+
          'unlock purge reset change stop analyze cache flush optimize repair kill '+
          'install uninstall checksum restore check backup',
        end: /;/, endsWithParent: true,
        keywords: {
          keyword:
            'abs absolute acos action add adddate addtime aes_decrypt aes_encrypt after aggregate all allocate alter ' +
            'analyze and any are as asc ascii asin assertion at atan atan2 atn2 authorization authors avg backup ' +
            'before begin benchmark between bin binlog bit_and bit_count bit_length bit_or bit_xor both by ' +
            'cache call cascade cascaded case cast catalog ceil ceiling chain change changed char_length ' +
            'character_length charindex charset check checksum checksum_agg choose close coalesce ' +
            'coercibility collate collation collationproperty column columns columns_updated commit compress concat ' +
            'concat_ws concurrent connect connection connection_id consistent constraint constraints continue ' +
            'contributors conv convert convert_tz corresponding cos cot count count_big crc32 create cross cume_dist ' +
            'curdate current current_date current_time current_timestamp current_user cursor curtime data database ' +
            'databases datalength date_add date_format date_sub dateadd datediff datefromparts datename ' +
            'datepart datetime2fromparts datetimeoffsetfromparts day dayname dayofmonth dayofweek dayofyear ' +
            'deallocate declare decode default deferrable deferred degrees delayed delete des_decrypt ' +
            'des_encrypt des_key_file desc describe descriptor diagnostics difference disconnect distinct ' +
            'distinctrow div do domain double drop dumpfile each else elt enclosed encode encrypt end end-exec ' +
            'engine engines eomonth errors escape escaped event eventdata events except exception exec execute ' +
            'exists exp explain export_set extended external extract fast fetch field fields find_in_set ' +
            'first first_value floor flush for force foreign format found found_rows from from_base64 ' +
            'from_days from_unixtime full function get get_format get_lock getdate getutcdate global go goto grant ' +
            'grants greatest group group_concat grouping grouping_id gtid_subset gtid_subtract handler having help ' +
            'hex high_priority hosts hour ident_current ident_incr ident_seed identified identity if ifnull ignore ' +
            'iif ilike immediate in index indicator inet6_aton inet6_ntoa inet_aton inet_ntoa infile initially inner ' +
            'innodb input insert install instr intersect into is is_free_lock is_ipv4 ' +
            'is_ipv4_compat is_ipv4_mapped is_not is_not_null is_used_lock isdate isnull isolation join key kill ' +
            'language last last_day last_insert_id last_value lcase lead leading least leaves left len lenght level ' +
            'like limit lines ln load load_file local localtime localtimestamp locate lock log log10 log2 logfile ' +
            'logs low_priority lower lpad ltrim make_set makedate maketime master master_pos_wait match matched max ' +
            'md5 medium merge microsecond mid min minute mod mode module month monthname mutex name_const names ' +
            'national natural nchar next no no_write_to_binlog not now nullif nvarchar oct ' +
            'octet_length of old_password on only open optimize option optionally or ord order outer outfile output ' +
            'pad parse partial partition password patindex percent_rank percentile_cont percentile_disc period_add ' +
            'period_diff pi plugin position pow power pragma precision prepare preserve primary prior privileges ' +
            'procedure procedure_analyze processlist profile profiles public publishingservername purge quarter ' +
            'query quick quote quotename radians rand read references regexp relative relaylog release ' +
            'release_lock rename repair repeat replace replicate reset restore restrict return returns reverse ' +
            'revoke right rlike rollback rollup round row row_count rows rpad rtrim savepoint schema scroll ' +
            'sec_to_time second section select serializable server session session_user set sha sha1 sha2 share ' +
            'show sign sin size slave sleep smalldatetimefromparts snapshot some soname soundex ' +
            'sounds_like space sql sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_no_cache ' +
            'sql_small_result sql_variant_property sqlstate sqrt square start starting status std ' +
            'stddev stddev_pop stddev_samp stdev stdevp stop str str_to_date straight_join strcmp string stuff ' +
            'subdate substr substring subtime subtring_index sum switchoffset sysdate sysdatetime sysdatetimeoffset ' +
            'system_user sysutcdatetime table tables tablespace tan temporary terminated tertiary_weights then time ' +
            'time_format time_to_sec timediff timefromparts timestamp timestampadd timestampdiff timezone_hour ' +
            'timezone_minute to to_base64 to_days to_seconds todatetimeoffset trailing transaction translation ' +
            'trigger trigger_nestlevel triggers trim truncate try_cast try_convert try_parse ucase uncompress ' +
            'uncompressed_length unhex unicode uninstall union unique unix_timestamp unknown unlock update upgrade ' +
            'upped upper usage use user user_resources using utc_date utc_time utc_timestamp uuid uuid_short ' +
            'validate_password_strength value values var var_pop var_samp variables variance varp ' +
            'version view warnings week weekday weekofyear weight_string when whenever where with work write xml ' +
            'xor year yearweek zon',
          literal:
            'true false null',
          built_in:
            'array bigint binary bit blob boolean char character date dec decimal float int integer interval number ' +
            'numeric real serial smallint varchar varying int8 serial8 text'
        },
        contains: [
          {
            className: 'string',
            begin: '\'', end: '\'',
            contains: [hljs.BACKSLASH_ESCAPE, {begin: '\'\''}]
          },
          {
            className: 'string',
            begin: '"', end: '"',
            contains: [hljs.BACKSLASH_ESCAPE, {begin: '""'}]
          },
          {
            className: 'string',
            begin: '`', end: '`',
            contains: [hljs.BACKSLASH_ESCAPE]
          },
          hljs.C_NUMBER_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          COMMENT_MODE
        ]
      },
      hljs.C_BLOCK_COMMENT_MODE,
      COMMENT_MODE
    ]
  };
}
},{name:"xml",create:/*
Language: HTML, XML
*/

function(hljs) {
  var XML_IDENT_RE = '[A-Za-z0-9\\._:-]+';
  var PHP = {
    begin: /<\?(php)?(?!\w)/, end: /\?>/,
    subLanguage: 'php', subLanguageMode: 'continuous'
  };
  var TAG_INTERNALS = {
    endsWithParent: true,
    illegal: /</,
    relevance: 0,
    contains: [
      PHP,
      {
        className: 'attribute',
        begin: XML_IDENT_RE,
        relevance: 0
      },
      {
        begin: '=',
        relevance: 0,
        contains: [
          {
            className: 'value',
            variants: [
              {begin: /"/, end: /"/},
              {begin: /'/, end: /'/},
              {begin: /[^\s\/>]+/}
            ]
          }
        ]
      }
    ]
  };
  return {
    aliases: ['html', 'xhtml', 'rss', 'atom', 'xsl', 'plist'],
    case_insensitive: true,
    contains: [
      {
        className: 'doctype',
        begin: '<!DOCTYPE', end: '>',
        relevance: 10,
        contains: [{begin: '\\[', end: '\\]'}]
      },
      {
        className: 'comment',
        begin: '<!--', end: '-->',
        relevance: 10
      },
      {
        className: 'cdata',
        begin: '<\\!\\[CDATA\\[', end: '\\]\\]>',
        relevance: 10
      },
      {
        className: 'tag',
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending braket. The '$' is needed for the lexeme to be recognized
        by hljs.subMode() that tests lexemes outside the stream.
        */
        begin: '<style(?=\\s|>|$)', end: '>',
        keywords: {title: 'style'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '</style>', returnEnd: true,
          subLanguage: 'css'
        }
      },
      {
        className: 'tag',
        // See the comment in the <style tag about the lookahead pattern
        begin: '<script(?=\\s|>|$)', end: '>',
        keywords: {title: 'script'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '</script>', returnEnd: true,
          subLanguage: 'javascript'
        }
      },
      {
        begin: '<%', end: '%>',
        subLanguage: 'vbscript'
      },
      PHP,
      {
        className: 'pi',
        begin: /<\?\w+/, end: /\?>/,
        relevance: 10
      },
      {
        className: 'tag',
        begin: '</?', end: '/?>',
        contains: [
          {
            className: 'title', begin: '[^ /><]+', relevance: 0
          },
          TAG_INTERNALS
        ]
      }
    ]
  };
}
},{name:"css",create:/*
Language: CSS
*/

function(hljs) {
  var IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
  var FUNCTION = {
    className: 'function',
    begin: IDENT_RE + '\\(', 
    returnBegin: true,
    excludeEnd: true,
    end: '\\('
  };
  return {
    case_insensitive: true,
    illegal: '[=/|\']',
    contains: [
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'id', begin: '\\#[A-Za-z0-9_-]+'
      },
      {
        className: 'class', begin: '\\.[A-Za-z0-9_-]+',
        relevance: 0
      },
      {
        className: 'attr_selector',
        begin: '\\[', end: '\\]',
        illegal: '$'
      },
      {
        className: 'pseudo',
        begin: ':(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\"\\\']+'
      },
      {
        className: 'at_rule',
        begin: '@(font-face|page)',
        lexemes: '[a-z-]+',
        keywords: 'font-face page'
      },
      {
        className: 'at_rule',
        begin: '@', end: '[{;]', // at_rule eating first "{" is a good thing
                                 // because it doesn’t let it to be parsed as
                                 // a rule set but instead drops parser into
                                 // the default mode which is how it should be.
        contains: [
          {
            className: 'keyword',
            begin: /\S+/
          },
          {
            begin: /\s/, endsWithParent: true, excludeEnd: true,
            relevance: 0,
            contains: [
              FUNCTION,
              hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE,
              hljs.CSS_NUMBER_MODE
            ]
          }
        ]
      },
      {
        className: 'tag', begin: IDENT_RE,
        relevance: 0
      },
      {
        className: 'rules',
        begin: '{', end: '}',
        illegal: '[^\\s]',
        relevance: 0,
        contains: [
          hljs.C_BLOCK_COMMENT_MODE,
          {
            className: 'rule',
            begin: '[^\\s]', returnBegin: true, end: ';', endsWithParent: true,
            contains: [
              {
                className: 'attribute',
                begin: '[A-Z\\_\\.\\-]+', end: ':',
                excludeEnd: true,
                illegal: '[^\\s]',
                starts: {
                  className: 'value',
                  endsWithParent: true, excludeEnd: true,
                  contains: [
                    FUNCTION,
                    hljs.CSS_NUMBER_MODE,
                    hljs.QUOTE_STRING_MODE,
                    hljs.APOS_STRING_MODE,
                    hljs.C_BLOCK_COMMENT_MODE,
                    {
                      className: 'hexcolor', begin: '#[0-9A-Fa-f]+'
                    },
                    {
                      className: 'important', begin: '!important'
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  };
}
},{name:"scala",create:/*
Language: Scala
Author: Jan Berkel <jan.berkel@gmail.com>
*/

function(hljs) {
  var ANNOTATION = {
    className: 'annotation', begin: '@[A-Za-z]+'
  };
  var STRING = {
    className: 'string',
    begin: 'u?r?"""', end: '"""',
    relevance: 10
  };
  var SYMBOL = {
    className: 'symbol',
    begin: '\'\\w[\\w\\d_]*(?!\')'
  };
  return {
    keywords:
      'type yield lazy override def with val var false true sealed abstract private trait ' +
      'object null if for while throw finally protected extends import final return else ' +
      'break new catch super class case package default try this match continue throws',
    contains: [
      {
        className: 'javadoc',
        begin: '/\\*\\*', end: '\\*/',
        contains: [{
          className: 'javadoctag',
          begin: '@[A-Za-z]+'
        }],
        relevance: 10
      },
      hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE,
      STRING, hljs.QUOTE_STRING_MODE,
      SYMBOL,
      {
        className: 'class',
        begin: '((case )?class |object |trait )', // beginKeywords won't work because a single "case" shouldn't start this mode
        end: '({|$)', excludeEnd: true,
        illegal: ':',
        keywords: 'case class trait object',
        contains: [
          {
            beginKeywords: 'extends with',
            relevance: 10
          },
          hljs.UNDERSCORE_TITLE_MODE,
          {
            className: 'params',
            begin: '\\(', end: '\\)',
            contains: [
              hljs.QUOTE_STRING_MODE, STRING,
              ANNOTATION
            ]
          }
        ]
      },
      hljs.C_NUMBER_MODE,
      ANNOTATION
    ]
  };
}
},{name:"coffeescript",create:/*
Language: CoffeeScript
Author: Dmytrii Nagirniak <dnagir@gmail.com>
Contributors: Oleg Efimov <efimovov@gmail.com>, Cédric Néhémie <cedric.nehemie@gmail.com>
Description: CoffeeScript is a programming language that transcompiles to JavaScript. For info about language see http://coffeescript.org/
*/

function(hljs) {
  var KEYWORDS = {
    keyword:
      // JS keywords
      'in if for while finally new do return else break catch instanceof throw try this ' +
      'switch continue typeof delete debugger super ' +
      // Coffee keywords
      'then unless until loop of by when and or is isnt not',
    literal:
      // JS literals
      'true false null undefined ' +
      // Coffee literals
      'yes no on off',
    reserved:
      'case default function var void with const let enum export import native ' +
      '__hasProp __extends __slice __bind __indexOf',
    built_in:
      'npm require console print module global window document'
  };
  var JS_IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';
  var TITLE = hljs.inherit(hljs.TITLE_MODE, {begin: JS_IDENT_RE});
  var SUBST = {
    className: 'subst',
    begin: /#\{/, end: /}/,
    keywords: KEYWORDS
  };
  var EXPRESSIONS = [
    hljs.BINARY_NUMBER_MODE,
    hljs.inherit(hljs.C_NUMBER_MODE, {starts: {end: '(\\s*/)?', relevance: 0}}), // a number tries to eat the following slash to prevent treating it as a regexp
    {
      className: 'string',
      variants: [
        {
          begin: /'''/, end: /'''/,
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: /'/, end: /'/,
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: /"""/, end: /"""/,
          contains: [hljs.BACKSLASH_ESCAPE, SUBST]
        },
        {
          begin: /"/, end: /"/,
          contains: [hljs.BACKSLASH_ESCAPE, SUBST]
        }
      ]
    },
    {
      className: 'regexp',
      variants: [
        {
          begin: '///', end: '///',
          contains: [SUBST, hljs.HASH_COMMENT_MODE]
        },
        {
          begin: '//[gim]*',
          relevance: 0
        },
        {
          begin: '/\\S(\\\\.|[^\\n])*?/[gim]*(?=\\s|\\W|$)' // \S is required to parse x / 2 / 3 as two divisions
        }
      ]
    },
    {
      className: 'property',
      begin: '@' + JS_IDENT_RE
    },
    {
      begin: '`', end: '`',
      excludeBegin: true, excludeEnd: true,
      subLanguage: 'javascript'
    }
  ];
  SUBST.contains = EXPRESSIONS;

  return {
    aliases: ['coffee', 'cson', 'iced'],
    keywords: KEYWORDS,
    contains: EXPRESSIONS.concat([
      {
        className: 'comment',
        begin: '###', end: '###'
      },
      hljs.HASH_COMMENT_MODE,
      {
        className: 'function',
        begin: '(' + JS_IDENT_RE + '\\s*=\\s*)?(\\(.*\\))?\\s*\\B[-=]>', end: '[-=]>',
        returnBegin: true,
        contains: [
          TITLE,
          {
            className: 'params',
            begin: '\\(', returnBegin: true,
            /* We need another contained nameless mode to not have every nested
            pair of parens to be called "params" */
            contains: [{
              begin: /\(/, end: /\)/,
              keywords: KEYWORDS,
              contains: ['self'].concat(EXPRESSIONS)
            }]
          }
        ]
      },
      {
        className: 'class',
        beginKeywords: 'class',
        end: '$',
        illegal: /[:="\[\]]/,
        contains: [
          {
            beginKeywords: 'extends',
            endsWithParent: true,
            illegal: /[:="\[\]]/,
            contains: [TITLE]
          },
          TITLE
        ]
      },
      {
        className: 'attribute',
        begin: JS_IDENT_RE + ':', end: ':',
        returnBegin: true, excludeEnd: true,
        relevance: 0
      }
    ])
  };
}
},{name:"lisp",create:/*
Language: Lisp
Description: Generic lisp syntax
Author: Vasily Polovnyov <vast@whiteants.net>
*/

function(hljs) {
  var LISP_IDENT_RE = '[a-zA-Z_\\-\\+\\*\\/\\<\\=\\>\\&\\#][a-zA-Z0-9_\\-\\+\\*\\/\\<\\=\\>\\&\\#!]*';
  var LISP_SIMPLE_NUMBER_RE = '(\\-|\\+)?\\d+(\\.\\d+|\\/\\d+)?((d|e|f|l|s)(\\+|\\-)?\\d+)?';
  var SHEBANG = {
    className: 'shebang',
    begin: '^#!', end: '$'
  };
  var LITERAL = {
    className: 'literal',
    begin: '\\b(t{1}|nil)\\b'
  };
  var NUMBER = {
    className: 'number',
    variants: [
      {begin: LISP_SIMPLE_NUMBER_RE, relevance: 0},
      {begin: '#b[0-1]+(/[0-1]+)?'},
      {begin: '#o[0-7]+(/[0-7]+)?'},
      {begin: '#x[0-9a-f]+(/[0-9a-f]+)?'},
      {begin: '#c\\(' + LISP_SIMPLE_NUMBER_RE + ' +' + LISP_SIMPLE_NUMBER_RE, end: '\\)'}
    ]
  };
  var STRING = hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null});
  var COMMENT = {
    className: 'comment',
    begin: ';', end: '$'
  };
  var VARIABLE = {
    className: 'variable',
    begin: '\\*', end: '\\*'
  };
  var KEYWORD = {
    className: 'keyword',
    begin: '[:&]' + LISP_IDENT_RE
  };
  var QUOTED_LIST = {
    begin: '\\(', end: '\\)',
    contains: ['self', LITERAL, STRING, NUMBER]
  };
  var QUOTED = {
    className: 'quoted',
    contains: [NUMBER, STRING, VARIABLE, KEYWORD, QUOTED_LIST],
    variants: [
      {
        begin: '[\'`]\\(', end: '\\)'
      },
      {
        begin: '\\(quote ', end: '\\)',
        keywords: {title: 'quote'}
      }
    ]
  };
  var LIST = {
    className: 'list',
    begin: '\\(', end: '\\)'
  };
  var BODY = {
    endsWithParent: true,
    relevance: 0
  };
  LIST.contains = [{className: 'title', begin: LISP_IDENT_RE}, BODY];
  BODY.contains = [QUOTED, LIST, LITERAL, NUMBER, STRING, COMMENT, VARIABLE, KEYWORD];

  return {
    illegal: /\S/,
    contains: [
      NUMBER,
      SHEBANG,
      LITERAL,
      STRING,
      COMMENT,
      QUOTED,
      LIST
    ]
  };
}
},{name:"clojure",create:/*
Language: Clojure
Description: Clojure syntax (based on lisp.js)
Author: mfornos
*/

function(hljs) {
  var keywords = {
    built_in:
      // Clojure keywords
      'def cond apply if-not if-let if not not= = &lt; < > &lt;= <= >= == + / * - rem '+
      'quot neg? pos? delay? symbol? keyword? true? false? integer? empty? coll? list? '+
      'set? ifn? fn? associative? sequential? sorted? counted? reversible? number? decimal? '+
      'class? distinct? isa? float? rational? reduced? ratio? odd? even? char? seq? vector? '+
      'string? map? nil? contains? zero? instance? not-every? not-any? libspec? -> ->> .. . '+
      'inc compare do dotimes mapcat take remove take-while drop letfn drop-last take-last '+
      'drop-while while intern condp case reduced cycle split-at split-with repeat replicate '+
      'iterate range merge zipmap declare line-seq sort comparator sort-by dorun doall nthnext '+
      'nthrest partition eval doseq await await-for let agent atom send send-off release-pending-sends '+
      'add-watch mapv filterv remove-watch agent-error restart-agent set-error-handler error-handler '+
      'set-error-mode! error-mode shutdown-agents quote var fn loop recur throw try monitor-enter '+
      'monitor-exit defmacro defn defn- macroexpand macroexpand-1 for dosync and or '+
      'when when-not when-let comp juxt partial sequence memoize constantly complement identity assert '+
      'peek pop doto proxy defstruct first rest cons defprotocol cast coll deftype defrecord last butlast '+
      'sigs reify second ffirst fnext nfirst nnext defmulti defmethod meta with-meta ns in-ns create-ns import '+
      'refer keys select-keys vals key val rseq name namespace promise into transient persistent! conj! '+
      'assoc! dissoc! pop! disj! use class type num float double short byte boolean bigint biginteger '+
      'bigdec print-method print-dup throw-if printf format load compile get-in update-in pr pr-on newline '+
      'flush read slurp read-line subvec with-open memfn time re-find re-groups rand-int rand mod locking '+
      'assert-valid-fdecl alias resolve ref deref refset swap! reset! set-validator! compare-and-set! alter-meta! '+
      'reset-meta! commute get-validator alter ref-set ref-history-count ref-min-history ref-max-history ensure sync io! '+
      'new next conj set! to-array future future-call into-array aset gen-class reduce map filter find empty '+
      'hash-map hash-set sorted-map sorted-map-by sorted-set sorted-set-by vec vector seq flatten reverse assoc dissoc list '+
      'disj get union difference intersection extend extend-type extend-protocol int nth delay count concat chunk chunk-buffer '+
      'chunk-append chunk-first chunk-rest max min dec unchecked-inc-int unchecked-inc unchecked-dec-inc unchecked-dec unchecked-negate '+
      'unchecked-add-int unchecked-add unchecked-subtract-int unchecked-subtract chunk-next chunk-cons chunked-seq? prn vary-meta '+
      'lazy-seq spread list* str find-keyword keyword symbol gensym force rationalize'
   };

  var CLJ_IDENT_RE = '[a-zA-Z_0-9\\!\\.\\?\\-\\+\\*\\/\\<\\=\\>\\&\\#\\$\';]+';
  var SIMPLE_NUMBER_RE = '[\\s:\\(\\{]+\\d+(\\.\\d+)?';

  var NUMBER = {
    className: 'number', begin: SIMPLE_NUMBER_RE,
    relevance: 0
  };
  var STRING = hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null});
  var COMMENT = {
    className: 'comment',
    begin: ';', end: '$',
    relevance: 0
  };
  var COLLECTION = {
    className: 'collection',
    begin: '[\\[\\{]', end: '[\\]\\}]'
  };
  var HINT = {
    className: 'comment',
    begin: '\\^' + CLJ_IDENT_RE
  };
  var HINT_COL = {
    className: 'comment',
    begin: '\\^\\{', end: '\\}'

  };
  var KEY = {
    className: 'attribute',
    begin: '[:]' + CLJ_IDENT_RE
  };
  var LIST = {
    className: 'list',
    begin: '\\(', end: '\\)'
  };
  var BODY = {
    endsWithParent: true,
    keywords: {literal: 'true false nil'},
    relevance: 0
  };
  var TITLE = {
    keywords: keywords,
    lexemes: CLJ_IDENT_RE,
    className: 'title', begin: CLJ_IDENT_RE,
    starts: BODY
  };

  LIST.contains = [{className: 'comment', begin: 'comment'}, TITLE, BODY];
  BODY.contains = [LIST, STRING, HINT, HINT_COL, COMMENT, KEY, COLLECTION, NUMBER];
  COLLECTION.contains = [LIST, STRING, HINT, COMMENT, KEY, COLLECTION, NUMBER];

  return {
    aliases: ['clj'],
    illegal: /\S/,
    contains: [
      COMMENT,
      LIST,
      {
        className: 'prompt',
        begin: /^=> /,
        starts: {end: /\n\n|\Z/} // eat up prompt output to not interfere with the illegal
      }
    ]
  }
}
},{name:"http",create:/*
  Language: HTTP
  Description: HTTP request and response headers with automatic body highlighting
  Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
*/

function(hljs) {
  return {
    illegal: '\\S',
    contains: [
      {
        className: 'status',
        begin: '^HTTP/[0-9\\.]+', end: '$',
        contains: [{className: 'number', begin: '\\b\\d{3}\\b'}]
      },
      {
        className: 'request',
        begin: '^[A-Z]+ (.*?) HTTP/[0-9\\.]+$', returnBegin: true, end: '$',
        contains: [
          {
            className: 'string',
            begin: ' ', end: ' ',
            excludeBegin: true, excludeEnd: true
          }
        ]
      },
      {
        className: 'attribute',
        begin: '^\\w', end: ': ', excludeEnd: true,
        illegal: '\\n|\\s|=',
        starts: {className: 'string', end: '$'}
      },
      {
        begin: '\\n\\n',
        starts: {subLanguage: '', endsWithParent: true}
      }
    ]
  };
}
},{name:"haskell",create:/*
Language: Haskell
Author: Jeremy Hull <sourdrums@gmail.com>
Contributors: Zena Treep <zena.treep@gmail.com>
*/

function(hljs) {

  var COMMENT = {
    className: 'comment',
    variants: [
      { begin: '--', end: '$' },
      { begin: '{-', end: '-}'
      , contains: ['self']
      }
    ]
  };

  var PRAGMA = {
    className: 'pragma',
    begin: '{-#', end: '#-}'
  };

  var PREPROCESSOR = {
    className: 'preprocessor',
    begin: '^#', end: '$'
  };

  var CONSTRUCTOR = {
    className: 'type',
    begin: '\\b[A-Z][\\w\']*', // TODO: other constructors (build-in, infix).
    relevance: 0
  };

  var LIST = {
    className: 'container',
    begin: '\\(', end: '\\)',
    illegal: '"',
    contains: [
      PRAGMA,
      COMMENT,
      PREPROCESSOR,
      {className: 'type', begin: '\\b[A-Z][\\w]*(\\((\\.\\.|,|\\w+)\\))?'},
      hljs.inherit(hljs.TITLE_MODE, {begin: '[_a-z][\\w\']*'})
    ]
  };

  var RECORD = {
    className: 'container',
    begin: '{', end: '}',
    contains: LIST.contains
  };

  return {
    aliases: ['hs'],
    keywords:
      'let in if then else case of where do module import hiding ' +
      'qualified type data newtype deriving class instance as default ' +
      'infix infixl infixr foreign export ccall stdcall cplusplus ' +
      'jvm dotnet safe unsafe family forall mdo proc rec',
    contains: [

      // Top-level constructions.

      {
        className: 'module',
        begin: '\\bmodule\\b', end: 'where',
        keywords: 'module where',
        contains: [LIST, COMMENT],
        illegal: '\\W\\.|;'
      },
      {
        className: 'import',
        begin: '\\bimport\\b', end: '$',
        keywords: 'import|0 qualified as hiding',
        contains: [LIST, COMMENT],
        illegal: '\\W\\.|;'
      },

      {
        className: 'class',
        begin: '^(\\s*)?(class|instance)\\b', end: 'where',
        keywords: 'class family instance where',
        contains: [CONSTRUCTOR, LIST, COMMENT]
      },
      {
        className: 'typedef',
        begin: '\\b(data|(new)?type)\\b', end: '$',
        keywords: 'data family type newtype deriving',
        contains: [PRAGMA, COMMENT, CONSTRUCTOR, LIST, RECORD]
      },
      {
        className: 'default',
        beginKeywords: 'default', end: '$',
        contains: [CONSTRUCTOR, LIST, COMMENT]
      },
      {
        className: 'infix',
        beginKeywords: 'infix infixl infixr', end: '$',
        contains: [hljs.C_NUMBER_MODE, COMMENT]
      },
      {
        className: 'foreign',
        begin: '\\bforeign\\b', end: '$',
        keywords: 'foreign import export ccall stdcall cplusplus jvm ' +
                  'dotnet safe unsafe',
        contains: [CONSTRUCTOR, hljs.QUOTE_STRING_MODE, COMMENT]
      },
      {
        className: 'shebang',
        begin: '#!\\/usr\\/bin\\/env\ runhaskell', end: '$'
      },

      // "Whitespaces".

      PRAGMA,
      COMMENT,
      PREPROCESSOR,

      // Literals and names.

      // TODO: characters.
      hljs.QUOTE_STRING_MODE,
      hljs.C_NUMBER_MODE,
      CONSTRUCTOR,
      hljs.inherit(hljs.TITLE_MODE, {begin: '^[_a-z][\\w\']*'}),

      {begin: '->|<-'} // No markup, relevance booster
    ]
  };
}
}]
  ;

for (var i = 0; i < languages.length; ++i) {
  hljs.registerLanguage(languages[i].name, languages[i].create);
}

module.exports = {
  styles: {"arta":".hljs-arta{}.hljs-arta .hljs{display:block;padding:0.5em;background:#222;}.hljs-arta .profile .hljs-header *,.hljs-arta .ini .hljs-title,.hljs-arta .nginx .hljs-title{color:#fff;}.hljs-arta .hljs-comment,.hljs-arta .hljs-javadoc,.hljs-arta .hljs-preprocessor,.hljs-arta .hljs-preprocessor .hljs-title,.hljs-arta .hljs-pragma,.hljs-arta .hljs-shebang,.hljs-arta .profile .hljs-summary,.hljs-arta .diff,.hljs-arta .hljs-pi,.hljs-arta .hljs-doctype,.hljs-arta .hljs-tag,.hljs-arta .hljs-template_comment,.hljs-arta .css .hljs-rules,.hljs-arta .tex .hljs-special{color:#444;}.hljs-arta .hljs-string,.hljs-arta .hljs-symbol,.hljs-arta .diff .hljs-change,.hljs-arta .hljs-regexp,.hljs-arta .xml .hljs-attribute,.hljs-arta .smalltalk .hljs-char,.hljs-arta .xml .hljs-value,.hljs-arta .ini .hljs-value,.hljs-arta .clojure .hljs-attribute,.hljs-arta .coffeescript .hljs-attribute{color:#ffcc33;}.hljs-arta .hljs-number,.hljs-arta .hljs-addition{color:#00cc66;}.hljs-arta .hljs-built_in,.hljs-arta .hljs-literal,.hljs-arta .vhdl .hljs-typename,.hljs-arta .go .hljs-constant,.hljs-arta .go .hljs-typename,.hljs-arta .ini .hljs-keyword,.hljs-arta .lua .hljs-title,.hljs-arta .perl .hljs-variable,.hljs-arta .php .hljs-variable,.hljs-arta .mel .hljs-variable,.hljs-arta .django .hljs-variable,.hljs-arta .css .funtion,.hljs-arta .smalltalk .method,.hljs-arta .hljs-hexcolor,.hljs-arta .hljs-important,.hljs-arta .hljs-flow,.hljs-arta .hljs-inheritance,.hljs-arta .parser3 .hljs-variable{color:#32aaee;}.hljs-arta .hljs-keyword,.hljs-arta .hljs-tag .hljs-title,.hljs-arta .css .hljs-tag,.hljs-arta .css .hljs-class,.hljs-arta .css .hljs-id,.hljs-arta .css .hljs-pseudo,.hljs-arta .css .hljs-attr_selector,.hljs-arta .lisp .hljs-title,.hljs-arta .clojure .hljs-built_in,.hljs-arta .hljs-winutils,.hljs-arta .tex .hljs-command,.hljs-arta .hljs-request,.hljs-arta .hljs-status{color:#6644aa;}.hljs-arta .hljs-title,.hljs-arta .ruby .hljs-constant,.hljs-arta .vala .hljs-constant,.hljs-arta .hljs-parent,.hljs-arta .hljs-deletion,.hljs-arta .hljs-template_tag,.hljs-arta .css .hljs-keyword,.hljs-arta .objectivec .hljs-class .hljs-id,.hljs-arta .smalltalk .hljs-class,.hljs-arta .lisp .hljs-keyword,.hljs-arta .apache .hljs-tag,.hljs-arta .nginx .hljs-variable,.hljs-arta .hljs-envvar,.hljs-arta .bash .hljs-variable,.hljs-arta .go .hljs-built_in,.hljs-arta .vbscript .hljs-built_in,.hljs-arta .lua .hljs-built_in,.hljs-arta .rsl .hljs-built_in,.hljs-arta .tail,.hljs-arta .avrasm .hljs-label,.hljs-arta .tex .hljs-formula,.hljs-arta .tex .hljs-formula *{color:#bb1166;}.hljs-arta .hljs-yardoctag,.hljs-arta .hljs-phpdoc,.hljs-arta .profile .hljs-header,.hljs-arta .ini .hljs-title,.hljs-arta .apache .hljs-tag,.hljs-arta .parser3 .hljs-title{font-weight:bold;}.hljs-arta .coffeescript .javascript,.hljs-arta .javascript .xml,.hljs-arta .tex .hljs-formula,.hljs-arta .xml .javascript,.hljs-arta .xml .vbscript,.hljs-arta .xml .css,.hljs-arta .xml .hljs-cdata{opacity:0.6;}.hljs-arta .hljs,.hljs-arta .hljs-subst,.hljs-arta .diff .hljs-chunk,.hljs-arta .css .hljs-value,.hljs-arta .css .hljs-attribute{color:#aaa;}","ascetic":".hljs-ascetic{}.hljs-ascetic .hljs{display:block;padding:0.5em;background:white;color:black;}.hljs-ascetic .hljs-string,.hljs-ascetic .hljs-tag .hljs-value,.hljs-ascetic .hljs-filter .hljs-argument,.hljs-ascetic .hljs-addition,.hljs-ascetic .hljs-change,.hljs-ascetic .apache .hljs-tag,.hljs-ascetic .apache .hljs-cbracket,.hljs-ascetic .nginx .hljs-built_in,.hljs-ascetic .tex .hljs-formula{color:#888;}.hljs-ascetic .hljs-comment,.hljs-ascetic .hljs-template_comment,.hljs-ascetic .hljs-shebang,.hljs-ascetic .hljs-doctype,.hljs-ascetic .hljs-pi,.hljs-ascetic .hljs-javadoc,.hljs-ascetic .hljs-deletion,.hljs-ascetic .apache .hljs-sqbracket{color:#ccc;}.hljs-ascetic .hljs-keyword,.hljs-ascetic .hljs-tag .hljs-title,.hljs-ascetic .ini .hljs-title,.hljs-ascetic .lisp .hljs-title,.hljs-ascetic .clojure .hljs-title,.hljs-ascetic .http .hljs-title,.hljs-ascetic .nginx .hljs-title,.hljs-ascetic .css .hljs-tag,.hljs-ascetic .hljs-winutils,.hljs-ascetic .hljs-flow,.hljs-ascetic .apache .hljs-tag,.hljs-ascetic .tex .hljs-command,.hljs-ascetic .hljs-request,.hljs-ascetic .hljs-status{font-weight:bold;}","atelier-dune.dark":".hljs-atelier-dune.dark{}.hljs-atelier-dune.dark .hljs-comment,.hljs-atelier-dune.dark .hljs-title{color:#999580;}.hljs-atelier-dune.dark .hljs-variable,.hljs-atelier-dune.dark .hljs-attribute,.hljs-atelier-dune.dark .hljs-tag,.hljs-atelier-dune.dark .hljs-regexp,.hljs-atelier-dune.dark .ruby .hljs-constant,.hljs-atelier-dune.dark .xml .hljs-tag .hljs-title,.hljs-atelier-dune.dark .xml .hljs-pi,.hljs-atelier-dune.dark .xml .hljs-doctype,.hljs-atelier-dune.dark .html .hljs-doctype,.hljs-atelier-dune.dark .css .hljs-id,.hljs-atelier-dune.dark .css .hljs-class,.hljs-atelier-dune.dark .css .hljs-pseudo{color:#d73737;}.hljs-atelier-dune.dark .hljs-number,.hljs-atelier-dune.dark .hljs-preprocessor,.hljs-atelier-dune.dark .hljs-pragma,.hljs-atelier-dune.dark .hljs-built_in,.hljs-atelier-dune.dark .hljs-literal,.hljs-atelier-dune.dark .hljs-params,.hljs-atelier-dune.dark .hljs-constant{color:#b65611;}.hljs-atelier-dune.dark .ruby .hljs-class .hljs-title,.hljs-atelier-dune.dark .css .hljs-rules .hljs-attribute{color:#cfb017;}.hljs-atelier-dune.dark .hljs-string,.hljs-atelier-dune.dark .hljs-value,.hljs-atelier-dune.dark .hljs-inheritance,.hljs-atelier-dune.dark .hljs-header,.hljs-atelier-dune.dark .ruby .hljs-symbol,.hljs-atelier-dune.dark .xml .hljs-cdata{color:#60ac39;}.hljs-atelier-dune.dark .css .hljs-hexcolor{color:#1fad83;}.hljs-atelier-dune.dark .hljs-function,.hljs-atelier-dune.dark .python .hljs-decorator,.hljs-atelier-dune.dark .python .hljs-title,.hljs-atelier-dune.dark .ruby .hljs-function .hljs-title,.hljs-atelier-dune.dark .ruby .hljs-title .hljs-keyword,.hljs-atelier-dune.dark .perl .hljs-sub,.hljs-atelier-dune.dark .javascript .hljs-title,.hljs-atelier-dune.dark .coffeescript .hljs-title{color:#6684e1;}.hljs-atelier-dune.dark .hljs-keyword,.hljs-atelier-dune.dark .javascript .hljs-function{color:#b854d4;}.hljs-atelier-dune.dark .hljs{display:block;background:#292824;color:#a6a28c;padding:0.5em;}.hljs-atelier-dune.dark .coffeescript .javascript,.hljs-atelier-dune.dark .javascript .xml,.hljs-atelier-dune.dark .tex .hljs-formula,.hljs-atelier-dune.dark .xml .javascript,.hljs-atelier-dune.dark .xml .vbscript,.hljs-atelier-dune.dark .xml .css,.hljs-atelier-dune.dark .xml .hljs-cdata{opacity:0.5;}","atelier-dune.light":".hljs-atelier-dune.light{}.hljs-atelier-dune.light .hljs-comment,.hljs-atelier-dune.light .hljs-title{color:#7d7a68;}.hljs-atelier-dune.light .hljs-variable,.hljs-atelier-dune.light .hljs-attribute,.hljs-atelier-dune.light .hljs-tag,.hljs-atelier-dune.light .hljs-regexp,.hljs-atelier-dune.light .ruby .hljs-constant,.hljs-atelier-dune.light .xml .hljs-tag .hljs-title,.hljs-atelier-dune.light .xml .hljs-pi,.hljs-atelier-dune.light .xml .hljs-doctype,.hljs-atelier-dune.light .html .hljs-doctype,.hljs-atelier-dune.light .css .hljs-id,.hljs-atelier-dune.light .css .hljs-class,.hljs-atelier-dune.light .css .hljs-pseudo{color:#d73737;}.hljs-atelier-dune.light .hljs-number,.hljs-atelier-dune.light .hljs-preprocessor,.hljs-atelier-dune.light .hljs-pragma,.hljs-atelier-dune.light .hljs-built_in,.hljs-atelier-dune.light .hljs-literal,.hljs-atelier-dune.light .hljs-params,.hljs-atelier-dune.light .hljs-constant{color:#b65611;}.hljs-atelier-dune.light .hljs-ruby .hljs-class .hljs-title,.hljs-atelier-dune.light .css .hljs-rules .hljs-attribute{color:#cfb017;}.hljs-atelier-dune.light .hljs-string,.hljs-atelier-dune.light .hljs-value,.hljs-atelier-dune.light .hljs-inheritance,.hljs-atelier-dune.light .hljs-header,.hljs-atelier-dune.light .ruby .hljs-symbol,.hljs-atelier-dune.light .xml .hljs-cdata{color:#60ac39;}.hljs-atelier-dune.light .css .hljs-hexcolor{color:#1fad83;}.hljs-atelier-dune.light .hljs-function,.hljs-atelier-dune.light .python .hljs-decorator,.hljs-atelier-dune.light .python .hljs-title,.hljs-atelier-dune.light .ruby .hljs-function .hljs-title,.hljs-atelier-dune.light .ruby .hljs-title .hljs-keyword,.hljs-atelier-dune.light .perl .hljs-sub,.hljs-atelier-dune.light .javascript .hljs-title,.hljs-atelier-dune.light .coffeescript .hljs-title{color:#6684e1;}.hljs-atelier-dune.light .hljs-keyword,.hljs-atelier-dune.light .javascript .hljs-function{color:#b854d4;}.hljs-atelier-dune.light .hljs{display:block;background:#fefbec;color:#6e6b5e;padding:0.5em;}.hljs-atelier-dune.light .coffeescript .javascript,.hljs-atelier-dune.light .javascript .xml,.hljs-atelier-dune.light .tex .hljs-formula,.hljs-atelier-dune.light .xml .javascript,.hljs-atelier-dune.light .xml .vbscript,.hljs-atelier-dune.light .xml .css,.hljs-atelier-dune.light .xml .hljs-cdata{opacity:0.5;}","atelier-forest.dark":".hljs-atelier-forest.dark{}.hljs-atelier-forest.dark .hljs-comment,.hljs-atelier-forest.dark .hljs-title{color:#9c9491;}.hljs-atelier-forest.dark .hljs-variable,.hljs-atelier-forest.dark .hljs-attribute,.hljs-atelier-forest.dark .hljs-tag,.hljs-atelier-forest.dark .hljs-regexp,.hljs-atelier-forest.dark .ruby .hljs-constant,.hljs-atelier-forest.dark .xml .hljs-tag .hljs-title,.hljs-atelier-forest.dark .xml .hljs-pi,.hljs-atelier-forest.dark .xml .hljs-doctype,.hljs-atelier-forest.dark .html .hljs-doctype,.hljs-atelier-forest.dark .css .hljs-id,.hljs-atelier-forest.dark .css .hljs-class,.hljs-atelier-forest.dark .css .hljs-pseudo{color:#f22c40;}.hljs-atelier-forest.dark .hljs-number,.hljs-atelier-forest.dark .hljs-preprocessor,.hljs-atelier-forest.dark .hljs-pragma,.hljs-atelier-forest.dark .hljs-built_in,.hljs-atelier-forest.dark .hljs-literal,.hljs-atelier-forest.dark .hljs-params,.hljs-atelier-forest.dark .hljs-constant{color:#df5320;}.hljs-atelier-forest.dark .hljs-ruby .hljs-class .hljs-title,.hljs-atelier-forest.dark .css .hljs-rules .hljs-attribute{color:#d5911a;}.hljs-atelier-forest.dark .hljs-string,.hljs-atelier-forest.dark .hljs-value,.hljs-atelier-forest.dark .hljs-inheritance,.hljs-atelier-forest.dark .hljs-header,.hljs-atelier-forest.dark .ruby .hljs-symbol,.hljs-atelier-forest.dark .xml .hljs-cdata{color:#5ab738;}.hljs-atelier-forest.dark .css .hljs-hexcolor{color:#00ad9c;}.hljs-atelier-forest.dark .hljs-function,.hljs-atelier-forest.dark .python .hljs-decorator,.hljs-atelier-forest.dark .python .hljs-title,.hljs-atelier-forest.dark .ruby .hljs-function .hljs-title,.hljs-atelier-forest.dark .ruby .hljs-title .hljs-keyword,.hljs-atelier-forest.dark .perl .hljs-sub,.hljs-atelier-forest.dark .javascript .hljs-title,.hljs-atelier-forest.dark .coffeescript .hljs-title{color:#407ee7;}.hljs-atelier-forest.dark .hljs-keyword,.hljs-atelier-forest.dark .javascript .hljs-function{color:#6666ea;}.hljs-atelier-forest.dark .hljs{display:block;background:#2c2421;color:#a8a19f;padding:0.5em;}.hljs-atelier-forest.dark .coffeescript .javascript,.hljs-atelier-forest.dark .javascript .xml,.hljs-atelier-forest.dark .tex .hljs-formula,.hljs-atelier-forest.dark .xml .javascript,.hljs-atelier-forest.dark .xml .vbscript,.hljs-atelier-forest.dark .xml .css,.hljs-atelier-forest.dark .xml .hljs-cdata{opacity:0.5;}","atelier-forest.light":".hljs-atelier-forest.light{}.hljs-atelier-forest.light .hljs-comment,.hljs-atelier-forest.light .hljs-title{color:#766e6b;}.hljs-atelier-forest.light .hljs-variable,.hljs-atelier-forest.light .hljs-attribute,.hljs-atelier-forest.light .hljs-tag,.hljs-atelier-forest.light .hljs-regexp,.hljs-atelier-forest.light .ruby .hljs-constant,.hljs-atelier-forest.light .xml .hljs-tag .hljs-title,.hljs-atelier-forest.light .xml .hljs-pi,.hljs-atelier-forest.light .xml .hljs-doctype,.hljs-atelier-forest.light .html .hljs-doctype,.hljs-atelier-forest.light .css .hljs-id,.hljs-atelier-forest.light .css .hljs-class,.hljs-atelier-forest.light .css .hljs-pseudo{color:#f22c40;}.hljs-atelier-forest.light .hljs-number,.hljs-atelier-forest.light .hljs-preprocessor,.hljs-atelier-forest.light .hljs-pragma,.hljs-atelier-forest.light .hljs-built_in,.hljs-atelier-forest.light .hljs-literal,.hljs-atelier-forest.light .hljs-params,.hljs-atelier-forest.light .hljs-constant{color:#df5320;}.hljs-atelier-forest.light .hljs-ruby .hljs-class .hljs-title,.hljs-atelier-forest.light .css .hljs-rules .hljs-attribute{color:#d5911a;}.hljs-atelier-forest.light .hljs-string,.hljs-atelier-forest.light .hljs-value,.hljs-atelier-forest.light .hljs-inheritance,.hljs-atelier-forest.light .hljs-header,.hljs-atelier-forest.light .ruby .hljs-symbol,.hljs-atelier-forest.light .xml .hljs-cdata{color:#5ab738;}.hljs-atelier-forest.light .css .hljs-hexcolor{color:#00ad9c;}.hljs-atelier-forest.light .hljs-function,.hljs-atelier-forest.light .python .hljs-decorator,.hljs-atelier-forest.light .python .hljs-title,.hljs-atelier-forest.light .ruby .hljs-function .hljs-title,.hljs-atelier-forest.light .ruby .hljs-title .hljs-keyword,.hljs-atelier-forest.light .perl .hljs-sub,.hljs-atelier-forest.light .javascript .hljs-title,.hljs-atelier-forest.light .coffeescript .hljs-title{color:#407ee7;}.hljs-atelier-forest.light .hljs-keyword,.hljs-atelier-forest.light .javascript .hljs-function{color:#6666ea;}.hljs-atelier-forest.light .hljs{display:block;background:#f1efee;color:#68615e;padding:0.5em;}.hljs-atelier-forest.light .coffeescript .javascript,.hljs-atelier-forest.light .javascript .xml,.hljs-atelier-forest.light .tex .hljs-formula,.hljs-atelier-forest.light .xml .javascript,.hljs-atelier-forest.light .xml .vbscript,.hljs-atelier-forest.light .xml .css,.hljs-atelier-forest.light .xml .hljs-cdata{opacity:0.5;}","atelier-heath.dark":".hljs-atelier-heath.dark{}.hljs-atelier-heath.dark .hljs-comment,.hljs-atelier-heath.dark .hljs-title{color:#9e8f9e;}.hljs-atelier-heath.dark .hljs-variable,.hljs-atelier-heath.dark .hljs-attribute,.hljs-atelier-heath.dark .hljs-tag,.hljs-atelier-heath.dark .hljs-regexp,.hljs-atelier-heath.dark .ruby .hljs-constant,.hljs-atelier-heath.dark .xml .hljs-tag .hljs-title,.hljs-atelier-heath.dark .xml .hljs-pi,.hljs-atelier-heath.dark .xml .hljs-doctype,.hljs-atelier-heath.dark .html .hljs-doctype,.hljs-atelier-heath.dark .css .hljs-id,.hljs-atelier-heath.dark .css .hljs-class,.hljs-atelier-heath.dark .css .hljs-pseudo{color:#ca402b;}.hljs-atelier-heath.dark .hljs-number,.hljs-atelier-heath.dark .hljs-preprocessor,.hljs-atelier-heath.dark .hljs-pragma,.hljs-atelier-heath.dark .hljs-built_in,.hljs-atelier-heath.dark .hljs-literal,.hljs-atelier-heath.dark .hljs-params,.hljs-atelier-heath.dark .hljs-constant{color:#a65926;}.hljs-atelier-heath.dark .hljs-ruby .hljs-class .hljs-title,.hljs-atelier-heath.dark .css .hljs-rules .hljs-attribute{color:#bb8a35;}.hljs-atelier-heath.dark .hljs-string,.hljs-atelier-heath.dark .hljs-value,.hljs-atelier-heath.dark .hljs-inheritance,.hljs-atelier-heath.dark .hljs-header,.hljs-atelier-heath.dark .ruby .hljs-symbol,.hljs-atelier-heath.dark .xml .hljs-cdata{color:#379a37;}.hljs-atelier-heath.dark .css .hljs-hexcolor{color:#159393;}.hljs-atelier-heath.dark .hljs-function,.hljs-atelier-heath.dark .python .hljs-decorator,.hljs-atelier-heath.dark .python .hljs-title,.hljs-atelier-heath.dark .ruby .hljs-function .hljs-title,.hljs-atelier-heath.dark .ruby .hljs-title .hljs-keyword,.hljs-atelier-heath.dark .perl .hljs-sub,.hljs-atelier-heath.dark .javascript .hljs-title,.hljs-atelier-heath.dark .coffeescript .hljs-title{color:#516aec;}.hljs-atelier-heath.dark .hljs-keyword,.hljs-atelier-heath.dark .javascript .hljs-function{color:#7b59c0;}.hljs-atelier-heath.dark .hljs{display:block;background:#292329;color:#ab9bab;padding:0.5em;}.hljs-atelier-heath.dark .coffeescript .javascript,.hljs-atelier-heath.dark .javascript .xml,.hljs-atelier-heath.dark .tex .hljs-formula,.hljs-atelier-heath.dark .xml .javascript,.hljs-atelier-heath.dark .xml .vbscript,.hljs-atelier-heath.dark .xml .css,.hljs-atelier-heath.dark .xml .hljs-cdata{opacity:0.5;}","atelier-heath.light":".hljs-atelier-heath.light{}.hljs-atelier-heath.light .hljs-comment,.hljs-atelier-heath.light .hljs-title{color:#776977;}.hljs-atelier-heath.light .hljs-variable,.hljs-atelier-heath.light .hljs-attribute,.hljs-atelier-heath.light .hljs-tag,.hljs-atelier-heath.light .hljs-regexp,.hljs-atelier-heath.light .ruby .hljs-constant,.hljs-atelier-heath.light .xml .hljs-tag .hljs-title,.hljs-atelier-heath.light .xml .hljs-pi,.hljs-atelier-heath.light .xml .hljs-doctype,.hljs-atelier-heath.light .html .hljs-doctype,.hljs-atelier-heath.light .css .hljs-id,.hljs-atelier-heath.light .css .hljs-class,.hljs-atelier-heath.light .css .hljs-pseudo{color:#ca402b;}.hljs-atelier-heath.light .hljs-number,.hljs-atelier-heath.light .hljs-preprocessor,.hljs-atelier-heath.light .hljs-pragma,.hljs-atelier-heath.light .hljs-built_in,.hljs-atelier-heath.light .hljs-literal,.hljs-atelier-heath.light .hljs-params,.hljs-atelier-heath.light .hljs-constant{color:#a65926;}.hljs-atelier-heath.light .hljs-ruby .hljs-class .hljs-title,.hljs-atelier-heath.light .css .hljs-rules .hljs-attribute{color:#bb8a35;}.hljs-atelier-heath.light .hljs-string,.hljs-atelier-heath.light .hljs-value,.hljs-atelier-heath.light .hljs-inheritance,.hljs-atelier-heath.light .hljs-header,.hljs-atelier-heath.light .ruby .hljs-symbol,.hljs-atelier-heath.light .xml .hljs-cdata{color:#379a37;}.hljs-atelier-heath.light .css .hljs-hexcolor{color:#159393;}.hljs-atelier-heath.light .hljs-function,.hljs-atelier-heath.light .python .hljs-decorator,.hljs-atelier-heath.light .python .hljs-title,.hljs-atelier-heath.light .ruby .hljs-function .hljs-title,.hljs-atelier-heath.light .ruby .hljs-title .hljs-keyword,.hljs-atelier-heath.light .perl .hljs-sub,.hljs-atelier-heath.light .javascript .hljs-title,.hljs-atelier-heath.light .coffeescript .hljs-title{color:#516aec;}.hljs-atelier-heath.light .hljs-keyword,.hljs-atelier-heath.light .javascript .hljs-function{color:#7b59c0;}.hljs-atelier-heath.light .hljs{display:block;background:#f7f3f7;color:#695d69;padding:0.5em;}.hljs-atelier-heath.light .coffeescript .javascript,.hljs-atelier-heath.light .javascript .xml,.hljs-atelier-heath.light .tex .hljs-formula,.hljs-atelier-heath.light .xml .javascript,.hljs-atelier-heath.light .xml .vbscript,.hljs-atelier-heath.light .xml .css,.hljs-atelier-heath.light .xml .hljs-cdata{opacity:0.5;}","atelier-lakeside.dark":".hljs-atelier-lakeside.dark{}.hljs-atelier-lakeside.dark .hljs-comment,.hljs-atelier-lakeside.dark .hljs-title{color:#7195a8;}.hljs-atelier-lakeside.dark .hljs-variable,.hljs-atelier-lakeside.dark .hljs-attribute,.hljs-atelier-lakeside.dark .hljs-tag,.hljs-atelier-lakeside.dark .hljs-regexp,.hljs-atelier-lakeside.dark .ruby .hljs-constant,.hljs-atelier-lakeside.dark .xml .hljs-tag .hljs-title,.hljs-atelier-lakeside.dark .xml .hljs-pi,.hljs-atelier-lakeside.dark .xml .hljs-doctype,.hljs-atelier-lakeside.dark .html .hljs-doctype,.hljs-atelier-lakeside.dark .css .hljs-id,.hljs-atelier-lakeside.dark .css .hljs-class,.hljs-atelier-lakeside.dark .css .hljs-pseudo{color:#d22d72;}.hljs-atelier-lakeside.dark .hljs-number,.hljs-atelier-lakeside.dark .hljs-preprocessor,.hljs-atelier-lakeside.dark .hljs-pragma,.hljs-atelier-lakeside.dark .hljs-built_in,.hljs-atelier-lakeside.dark .hljs-literal,.hljs-atelier-lakeside.dark .hljs-params,.hljs-atelier-lakeside.dark .hljs-constant{color:#935c25;}.hljs-atelier-lakeside.dark .hljs-ruby .hljs-class .hljs-title,.hljs-atelier-lakeside.dark .css .hljs-rules .hljs-attribute{color:#8a8a0f;}.hljs-atelier-lakeside.dark .hljs-string,.hljs-atelier-lakeside.dark .hljs-value,.hljs-atelier-lakeside.dark .hljs-inheritance,.hljs-atelier-lakeside.dark .hljs-header,.hljs-atelier-lakeside.dark .ruby .hljs-symbol,.hljs-atelier-lakeside.dark .xml .hljs-cdata{color:#568c3b;}.hljs-atelier-lakeside.dark .css .hljs-hexcolor{color:#2d8f6f;}.hljs-atelier-lakeside.dark .hljs-function,.hljs-atelier-lakeside.dark .python .hljs-decorator,.hljs-atelier-lakeside.dark .python .hljs-title,.hljs-atelier-lakeside.dark .ruby .hljs-function .hljs-title,.hljs-atelier-lakeside.dark .ruby .hljs-title .hljs-keyword,.hljs-atelier-lakeside.dark .perl .hljs-sub,.hljs-atelier-lakeside.dark .javascript .hljs-title,.hljs-atelier-lakeside.dark .coffeescript .hljs-title{color:#257fad;}.hljs-atelier-lakeside.dark .hljs-keyword,.hljs-atelier-lakeside.dark .javascript .hljs-function{color:#5d5db1;}.hljs-atelier-lakeside.dark .hljs{display:block;background:#1f292e;color:#7ea2b4;padding:0.5em;}.hljs-atelier-lakeside.dark .coffeescript .javascript,.hljs-atelier-lakeside.dark .javascript .xml,.hljs-atelier-lakeside.dark .tex .hljs-formula,.hljs-atelier-lakeside.dark .xml .javascript,.hljs-atelier-lakeside.dark .xml .vbscript,.hljs-atelier-lakeside.dark .xml .css,.hljs-atelier-lakeside.dark .xml .hljs-cdata{opacity:0.5;}","atelier-lakeside.light":".hljs-atelier-lakeside.light{}.hljs-atelier-lakeside.light .hljs-comment,.hljs-atelier-lakeside.light .hljs-title{color:#5a7b8c;}.hljs-atelier-lakeside.light .hljs-variable,.hljs-atelier-lakeside.light .hljs-attribute,.hljs-atelier-lakeside.light .hljs-tag,.hljs-atelier-lakeside.light .hljs-regexp,.hljs-atelier-lakeside.light .ruby .hljs-constant,.hljs-atelier-lakeside.light .xml .hljs-tag .hljs-title,.hljs-atelier-lakeside.light .xml .hljs-pi,.hljs-atelier-lakeside.light .xml .hljs-doctype,.hljs-atelier-lakeside.light .html .hljs-doctype,.hljs-atelier-lakeside.light .css .hljs-id,.hljs-atelier-lakeside.light .css .hljs-class,.hljs-atelier-lakeside.light .css .hljs-pseudo{color:#d22d72;}.hljs-atelier-lakeside.light .hljs-number,.hljs-atelier-lakeside.light .hljs-preprocessor,.hljs-atelier-lakeside.light .hljs-pragma,.hljs-atelier-lakeside.light .hljs-built_in,.hljs-atelier-lakeside.light .hljs-literal,.hljs-atelier-lakeside.light .hljs-params,.hljs-atelier-lakeside.light .hljs-constant{color:#935c25;}.hljs-atelier-lakeside.light .hljs-ruby .hljs-class .hljs-title,.hljs-atelier-lakeside.light .css .hljs-rules .hljs-attribute{color:#8a8a0f;}.hljs-atelier-lakeside.light .hljs-string,.hljs-atelier-lakeside.light .hljs-value,.hljs-atelier-lakeside.light .hljs-inheritance,.hljs-atelier-lakeside.light .hljs-header,.hljs-atelier-lakeside.light .ruby .hljs-symbol,.hljs-atelier-lakeside.light .xml .hljs-cdata{color:#568c3b;}.hljs-atelier-lakeside.light .css .hljs-hexcolor{color:#2d8f6f;}.hljs-atelier-lakeside.light .hljs-function,.hljs-atelier-lakeside.light .python .hljs-decorator,.hljs-atelier-lakeside.light .python .hljs-title,.hljs-atelier-lakeside.light .ruby .hljs-function .hljs-title,.hljs-atelier-lakeside.light .ruby .hljs-title .hljs-keyword,.hljs-atelier-lakeside.light .perl .hljs-sub,.hljs-atelier-lakeside.light .javascript .hljs-title,.hljs-atelier-lakeside.light .coffeescript .hljs-title{color:#257fad;}.hljs-atelier-lakeside.light .hljs-keyword,.hljs-atelier-lakeside.light .javascript .hljs-function{color:#5d5db1;}.hljs-atelier-lakeside.light .hljs{display:block;background:#ebf8ff;color:#516d7b;padding:0.5em;}.hljs-atelier-lakeside.light .coffeescript .javascript,.hljs-atelier-lakeside.light .javascript .xml,.hljs-atelier-lakeside.light .tex .hljs-formula,.hljs-atelier-lakeside.light .xml .javascript,.hljs-atelier-lakeside.light .xml .vbscript,.hljs-atelier-lakeside.light .xml .css,.hljs-atelier-lakeside.light .xml .hljs-cdata{opacity:0.5;}","atelier-seaside.dark":".hljs-atelier-seaside.dark{}.hljs-atelier-seaside.dark .hljs-comment,.hljs-atelier-seaside.dark .hljs-title{color:#809980;}.hljs-atelier-seaside.dark .hljs-variable,.hljs-atelier-seaside.dark .hljs-attribute,.hljs-atelier-seaside.dark .hljs-tag,.hljs-atelier-seaside.dark .hljs-regexp,.hljs-atelier-seaside.dark .ruby .hljs-constant,.hljs-atelier-seaside.dark .xml .hljs-tag .hljs-title,.hljs-atelier-seaside.dark .xml .hljs-pi,.hljs-atelier-seaside.dark .xml .hljs-doctype,.hljs-atelier-seaside.dark .html .hljs-doctype,.hljs-atelier-seaside.dark .css .hljs-id,.hljs-atelier-seaside.dark .css .hljs-class,.hljs-atelier-seaside.dark .css .hljs-pseudo{color:#e6193c;}.hljs-atelier-seaside.dark .hljs-number,.hljs-atelier-seaside.dark .hljs-preprocessor,.hljs-atelier-seaside.dark .hljs-pragma,.hljs-atelier-seaside.dark .hljs-built_in,.hljs-atelier-seaside.dark .hljs-literal,.hljs-atelier-seaside.dark .hljs-params,.hljs-atelier-seaside.dark .hljs-constant{color:#87711d;}.hljs-atelier-seaside.dark .hljs-ruby .hljs-class .hljs-title,.hljs-atelier-seaside.dark .css .hljs-rules .hljs-attribute{color:#c3c322;}.hljs-atelier-seaside.dark .hljs-string,.hljs-atelier-seaside.dark .hljs-value,.hljs-atelier-seaside.dark .hljs-inheritance,.hljs-atelier-seaside.dark .hljs-header,.hljs-atelier-seaside.dark .ruby .hljs-symbol,.hljs-atelier-seaside.dark .xml .hljs-cdata{color:#29a329;}.hljs-atelier-seaside.dark .css .hljs-hexcolor{color:#1999b3;}.hljs-atelier-seaside.dark .hljs-function,.hljs-atelier-seaside.dark .python .hljs-decorator,.hljs-atelier-seaside.dark .python .hljs-title,.hljs-atelier-seaside.dark .ruby .hljs-function .hljs-title,.hljs-atelier-seaside.dark .ruby .hljs-title .hljs-keyword,.hljs-atelier-seaside.dark .perl .hljs-sub,.hljs-atelier-seaside.dark .javascript .hljs-title,.hljs-atelier-seaside.dark .coffeescript .hljs-title{color:#3d62f5;}.hljs-atelier-seaside.dark .hljs-keyword,.hljs-atelier-seaside.dark .javascript .hljs-function{color:#ad2bee;}.hljs-atelier-seaside.dark .hljs{display:block;background:#242924;color:#8ca68c;padding:0.5em;}.hljs-atelier-seaside.dark .coffeescript .javascript,.hljs-atelier-seaside.dark .javascript .xml,.hljs-atelier-seaside.dark .tex .hljs-formula,.hljs-atelier-seaside.dark .xml .javascript,.hljs-atelier-seaside.dark .xml .vbscript,.hljs-atelier-seaside.dark .xml .css,.hljs-atelier-seaside.dark .xml .hljs-cdata{opacity:0.5;}","atelier-seaside.light":".hljs-atelier-seaside.light{}.hljs-atelier-seaside.light .hljs-comment,.hljs-atelier-seaside.light .hljs-title{color:#687d68;}.hljs-atelier-seaside.light .hljs-variable,.hljs-atelier-seaside.light .hljs-attribute,.hljs-atelier-seaside.light .hljs-tag,.hljs-atelier-seaside.light .hljs-regexp,.hljs-atelier-seaside.light .ruby .hljs-constant,.hljs-atelier-seaside.light .xml .hljs-tag .hljs-title,.hljs-atelier-seaside.light .xml .hljs-pi,.hljs-atelier-seaside.light .xml .hljs-doctype,.hljs-atelier-seaside.light .html .hljs-doctype,.hljs-atelier-seaside.light .css .hljs-id,.hljs-atelier-seaside.light .css .hljs-class,.hljs-atelier-seaside.light .css .hljs-pseudo{color:#e6193c;}.hljs-atelier-seaside.light .hljs-number,.hljs-atelier-seaside.light .hljs-preprocessor,.hljs-atelier-seaside.light .hljs-pragma,.hljs-atelier-seaside.light .hljs-built_in,.hljs-atelier-seaside.light .hljs-literal,.hljs-atelier-seaside.light .hljs-params,.hljs-atelier-seaside.light .hljs-constant{color:#87711d;}.hljs-atelier-seaside.light .hljs-ruby .hljs-class .hljs-title,.hljs-atelier-seaside.light .css .hljs-rules .hljs-attribute{color:#c3c322;}.hljs-atelier-seaside.light .hljs-string,.hljs-atelier-seaside.light .hljs-value,.hljs-atelier-seaside.light .hljs-inheritance,.hljs-atelier-seaside.light .hljs-header,.hljs-atelier-seaside.light .ruby .hljs-symbol,.hljs-atelier-seaside.light .xml .hljs-cdata{color:#29a329;}.hljs-atelier-seaside.light .css .hljs-hexcolor{color:#1999b3;}.hljs-atelier-seaside.light .hljs-function,.hljs-atelier-seaside.light .python .hljs-decorator,.hljs-atelier-seaside.light .python .hljs-title,.hljs-atelier-seaside.light .ruby .hljs-function .hljs-title,.hljs-atelier-seaside.light .ruby .hljs-title .hljs-keyword,.hljs-atelier-seaside.light .perl .hljs-sub,.hljs-atelier-seaside.light .javascript .hljs-title,.hljs-atelier-seaside.light .coffeescript .hljs-title{color:#3d62f5;}.hljs-atelier-seaside.light .hljs-keyword,.hljs-atelier-seaside.light .javascript .hljs-function{color:#ad2bee;}.hljs-atelier-seaside.light .hljs{display:block;background:#f0fff0;color:#5e6e5e;padding:0.5em;}.hljs-atelier-seaside.light .coffeescript .javascript,.hljs-atelier-seaside.light .javascript .xml,.hljs-atelier-seaside.light .tex .hljs-formula,.hljs-atelier-seaside.light .xml .javascript,.hljs-atelier-seaside.light .xml .vbscript,.hljs-atelier-seaside.light .xml .css,.hljs-atelier-seaside.light .xml .hljs-cdata{opacity:0.5;}","dark":".hljs-dark{}.hljs-dark .hljs{display:block;padding:0.5em;background:#444;}.hljs-dark .hljs-keyword,.hljs-dark .hljs-literal,.hljs-dark .hljs-change,.hljs-dark .hljs-winutils,.hljs-dark .hljs-flow,.hljs-dark .lisp .hljs-title,.hljs-dark .clojure .hljs-built_in,.hljs-dark .nginx .hljs-title,.hljs-dark .tex .hljs-special{color:white;}.hljs-dark .hljs,.hljs-dark .hljs-subst{color:#ddd;}.hljs-dark .hljs-string,.hljs-dark .hljs-title,.hljs-dark .haskell .hljs-type,.hljs-dark .ini .hljs-title,.hljs-dark .hljs-tag .hljs-value,.hljs-dark .css .hljs-rules .hljs-value,.hljs-dark .hljs-preprocessor,.hljs-dark .hljs-pragma,.hljs-dark .ruby .hljs-symbol,.hljs-dark .ruby .hljs-symbol .hljs-string,.hljs-dark .ruby .hljs-class .hljs-parent,.hljs-dark .hljs-built_in,.hljs-dark .django .hljs-template_tag,.hljs-dark .django .hljs-variable,.hljs-dark .smalltalk .hljs-class,.hljs-dark .hljs-javadoc,.hljs-dark .ruby .hljs-string,.hljs-dark .django .hljs-filter .hljs-argument,.hljs-dark .smalltalk .hljs-localvars,.hljs-dark .smalltalk .hljs-array,.hljs-dark .hljs-attr_selector,.hljs-dark .hljs-pseudo,.hljs-dark .hljs-addition,.hljs-dark .hljs-stream,.hljs-dark .hljs-envvar,.hljs-dark .apache .hljs-tag,.hljs-dark .apache .hljs-cbracket,.hljs-dark .tex .hljs-command,.hljs-dark .hljs-prompt,.hljs-dark .coffeescript .hljs-attribute{color:#d88;}.hljs-dark .hljs-comment,.hljs-dark .java .hljs-annotation,.hljs-dark .python .hljs-decorator,.hljs-dark .hljs-template_comment,.hljs-dark .hljs-pi,.hljs-dark .hljs-doctype,.hljs-dark .hljs-deletion,.hljs-dark .hljs-shebang,.hljs-dark .apache .hljs-sqbracket,.hljs-dark .tex .hljs-formula{color:#777;}.hljs-dark .hljs-keyword,.hljs-dark .hljs-literal,.hljs-dark .hljs-title,.hljs-dark .css .hljs-id,.hljs-dark .hljs-phpdoc,.hljs-dark .haskell .hljs-type,.hljs-dark .vbscript .hljs-built_in,.hljs-dark .rsl .hljs-built_in,.hljs-dark .smalltalk .hljs-class,.hljs-dark .diff .hljs-header,.hljs-dark .hljs-chunk,.hljs-dark .hljs-winutils,.hljs-dark .bash .hljs-variable,.hljs-dark .apache .hljs-tag,.hljs-dark .tex .hljs-special,.hljs-dark .hljs-request,.hljs-dark .hljs-status{font-weight:bold;}.hljs-dark .coffeescript .javascript,.hljs-dark .javascript .xml,.hljs-dark .tex .hljs-formula,.hljs-dark .xml .javascript,.hljs-dark .xml .vbscript,.hljs-dark .xml .css,.hljs-dark .xml .hljs-cdata{opacity:0.5;}","default":".hljs-default{}.hljs-default .hljs{display:block;padding:0.5em;background:#f0f0f0;}.hljs-default .hljs,.hljs-default .hljs-subst,.hljs-default .hljs-tag .hljs-title,.hljs-default .lisp .hljs-title,.hljs-default .clojure .hljs-built_in,.hljs-default .nginx .hljs-title{color:black;}.hljs-default .hljs-string,.hljs-default .hljs-title,.hljs-default .hljs-constant,.hljs-default .hljs-parent,.hljs-default .hljs-tag .hljs-value,.hljs-default .hljs-rules .hljs-value,.hljs-default .hljs-preprocessor,.hljs-default .hljs-pragma,.hljs-default .haml .hljs-symbol,.hljs-default .ruby .hljs-symbol,.hljs-default .ruby .hljs-symbol .hljs-string,.hljs-default .hljs-template_tag,.hljs-default .django .hljs-variable,.hljs-default .smalltalk .hljs-class,.hljs-default .hljs-addition,.hljs-default .hljs-flow,.hljs-default .hljs-stream,.hljs-default .bash .hljs-variable,.hljs-default .apache .hljs-tag,.hljs-default .apache .hljs-cbracket,.hljs-default .tex .hljs-command,.hljs-default .tex .hljs-special,.hljs-default .erlang_repl .hljs-function_or_atom,.hljs-default .asciidoc .hljs-header,.hljs-default .markdown .hljs-header,.hljs-default .coffeescript .hljs-attribute{color:#800;}.hljs-default .smartquote,.hljs-default .hljs-comment,.hljs-default .hljs-annotation,.hljs-default .hljs-template_comment,.hljs-default .diff .hljs-header,.hljs-default .hljs-chunk,.hljs-default .asciidoc .hljs-blockquote,.hljs-default .markdown .hljs-blockquote{color:#888;}.hljs-default .hljs-number,.hljs-default .hljs-date,.hljs-default .hljs-regexp,.hljs-default .hljs-literal,.hljs-default .hljs-hexcolor,.hljs-default .smalltalk .hljs-symbol,.hljs-default .smalltalk .hljs-char,.hljs-default .go .hljs-constant,.hljs-default .hljs-change,.hljs-default .lasso .hljs-variable,.hljs-default .makefile .hljs-variable,.hljs-default .asciidoc .hljs-bullet,.hljs-default .markdown .hljs-bullet,.hljs-default .asciidoc .hljs-link_url,.hljs-default .markdown .hljs-link_url{color:#080;}.hljs-default .hljs-label,.hljs-default .hljs-javadoc,.hljs-default .ruby .hljs-string,.hljs-default .hljs-decorator,.hljs-default .hljs-filter .hljs-argument,.hljs-default .hljs-localvars,.hljs-default .hljs-array,.hljs-default .hljs-attr_selector,.hljs-default .hljs-important,.hljs-default .hljs-pseudo,.hljs-default .hljs-pi,.hljs-default .haml .hljs-bullet,.hljs-default .hljs-doctype,.hljs-default .hljs-deletion,.hljs-default .hljs-envvar,.hljs-default .hljs-shebang,.hljs-default .apache .hljs-sqbracket,.hljs-default .nginx .hljs-built_in,.hljs-default .tex .hljs-formula,.hljs-default .erlang_repl .hljs-reserved,.hljs-default .hljs-prompt,.hljs-default .asciidoc .hljs-link_label,.hljs-default .markdown .hljs-link_label,.hljs-default .vhdl .hljs-attribute,.hljs-default .clojure .hljs-attribute,.hljs-default .asciidoc .hljs-attribute,.hljs-default .lasso .hljs-attribute,.hljs-default .coffeescript .hljs-property,.hljs-default .hljs-phony{color:#88f;}.hljs-default .hljs-keyword,.hljs-default .hljs-id,.hljs-default .hljs-title,.hljs-default .hljs-built_in,.hljs-default .css .hljs-tag,.hljs-default .hljs-javadoctag,.hljs-default .hljs-phpdoc,.hljs-default .hljs-yardoctag,.hljs-default .smalltalk .hljs-class,.hljs-default .hljs-winutils,.hljs-default .bash .hljs-variable,.hljs-default .apache .hljs-tag,.hljs-default .go .hljs-typename,.hljs-default .tex .hljs-command,.hljs-default .asciidoc .hljs-strong,.hljs-default .markdown .hljs-strong,.hljs-default .hljs-request,.hljs-default .hljs-status{font-weight:bold;}.hljs-default .asciidoc .hljs-emphasis,.hljs-default .markdown .hljs-emphasis{font-style:italic;}.hljs-default .nginx .hljs-built_in{font-weight:normal;}.hljs-default .coffeescript .javascript,.hljs-default .javascript .xml,.hljs-default .lasso .markup,.hljs-default .tex .hljs-formula,.hljs-default .xml .javascript,.hljs-default .xml .vbscript,.hljs-default .xml .css,.hljs-default .xml .hljs-cdata{opacity:0.5;}","docco":".hljs-docco{}.hljs-docco .hljs{display:block;padding:0.5em;color:#000;background:#f8f8ff;}.hljs-docco .hljs-comment,.hljs-docco .hljs-template_comment,.hljs-docco .diff .hljs-header,.hljs-docco .hljs-javadoc{color:#408080;font-style:italic;}.hljs-docco .hljs-keyword,.hljs-docco .assignment,.hljs-docco .hljs-literal,.hljs-docco .css .rule .hljs-keyword,.hljs-docco .hljs-winutils,.hljs-docco .javascript .hljs-title,.hljs-docco .lisp .hljs-title,.hljs-docco .hljs-subst{color:#954121;}.hljs-docco .hljs-number,.hljs-docco .hljs-hexcolor{color:#40a070;}.hljs-docco .hljs-string,.hljs-docco .hljs-tag .hljs-value,.hljs-docco .hljs-phpdoc,.hljs-docco .tex .hljs-formula{color:#219161;}.hljs-docco .hljs-title,.hljs-docco .hljs-id{color:#19469d;}.hljs-docco .hljs-params{color:#00f;}.hljs-docco .javascript .hljs-title,.hljs-docco .lisp .hljs-title,.hljs-docco .hljs-subst{font-weight:normal;}.hljs-docco .hljs-class .hljs-title,.hljs-docco .haskell .hljs-label,.hljs-docco .tex .hljs-command{color:#458;font-weight:bold;}.hljs-docco .hljs-tag,.hljs-docco .hljs-tag .hljs-title,.hljs-docco .hljs-rules .hljs-property,.hljs-docco .django .hljs-tag .hljs-keyword{color:#000080;font-weight:normal;}.hljs-docco .hljs-attribute,.hljs-docco .hljs-variable,.hljs-docco .instancevar,.hljs-docco .lisp .hljs-body{color:#008080;}.hljs-docco .hljs-regexp{color:#b68;}.hljs-docco .hljs-class{color:#458;font-weight:bold;}.hljs-docco .hljs-symbol,.hljs-docco .ruby .hljs-symbol .hljs-string,.hljs-docco .ruby .hljs-symbol .hljs-keyword,.hljs-docco .ruby .hljs-symbol .keymethods,.hljs-docco .lisp .hljs-keyword,.hljs-docco .tex .hljs-special,.hljs-docco .input_number{color:#990073;}.hljs-docco .builtin,.hljs-docco .constructor,.hljs-docco .hljs-built_in,.hljs-docco .lisp .hljs-title{color:#0086b3;}.hljs-docco .hljs-preprocessor,.hljs-docco .hljs-pragma,.hljs-docco .hljs-pi,.hljs-docco .hljs-doctype,.hljs-docco .hljs-shebang,.hljs-docco .hljs-cdata{color:#999;font-weight:bold;}.hljs-docco .hljs-deletion{background:#fdd;}.hljs-docco .hljs-addition{background:#dfd;}.hljs-docco .diff .hljs-change{background:#0086b3;}.hljs-docco .hljs-chunk{color:#aaa;}.hljs-docco .tex .hljs-formula{opacity:0.5;}","far":".hljs-far{}.hljs-far .hljs{display:block;padding:0.5em;background:#000080;}.hljs-far .hljs,.hljs-far .hljs-subst{color:#0ff;}.hljs-far .hljs-string,.hljs-far .ruby .hljs-string,.hljs-far .haskell .hljs-type,.hljs-far .hljs-tag .hljs-value,.hljs-far .hljs-rules .hljs-value,.hljs-far .hljs-rules .hljs-value .hljs-number,.hljs-far .hljs-preprocessor,.hljs-far .hljs-pragma,.hljs-far .ruby .hljs-symbol,.hljs-far .ruby .hljs-symbol .hljs-string,.hljs-far .hljs-built_in,.hljs-far .django .hljs-template_tag,.hljs-far .django .hljs-variable,.hljs-far .smalltalk .hljs-class,.hljs-far .hljs-addition,.hljs-far .apache .hljs-tag,.hljs-far .apache .hljs-cbracket,.hljs-far .tex .hljs-command,.hljs-far .clojure .hljs-title,.hljs-far .coffeescript .hljs-attribute{color:#ff0;}.hljs-far .hljs-keyword,.hljs-far .css .hljs-id,.hljs-far .hljs-title,.hljs-far .haskell .hljs-type,.hljs-far .vbscript .hljs-built_in,.hljs-far .rsl .hljs-built_in,.hljs-far .smalltalk .hljs-class,.hljs-far .xml .hljs-tag .hljs-title,.hljs-far .hljs-winutils,.hljs-far .hljs-flow,.hljs-far .hljs-change,.hljs-far .hljs-envvar,.hljs-far .bash .hljs-variable,.hljs-far .tex .hljs-special,.hljs-far .clojure .hljs-built_in{color:#fff;}.hljs-far .hljs-comment,.hljs-far .hljs-phpdoc,.hljs-far .hljs-javadoc,.hljs-far .java .hljs-annotation,.hljs-far .hljs-template_comment,.hljs-far .hljs-deletion,.hljs-far .apache .hljs-sqbracket,.hljs-far .tex .hljs-formula{color:#888;}.hljs-far .hljs-number,.hljs-far .hljs-date,.hljs-far .hljs-regexp,.hljs-far .hljs-literal,.hljs-far .smalltalk .hljs-symbol,.hljs-far .smalltalk .hljs-char,.hljs-far .clojure .hljs-attribute{color:#0f0;}.hljs-far .python .hljs-decorator,.hljs-far .django .hljs-filter .hljs-argument,.hljs-far .smalltalk .hljs-localvars,.hljs-far .smalltalk .hljs-array,.hljs-far .hljs-attr_selector,.hljs-far .hljs-pseudo,.hljs-far .xml .hljs-pi,.hljs-far .diff .hljs-header,.hljs-far .hljs-chunk,.hljs-far .hljs-shebang,.hljs-far .nginx .hljs-built_in,.hljs-far .hljs-prompt{color:#008080;}.hljs-far .hljs-keyword,.hljs-far .css .hljs-id,.hljs-far .hljs-title,.hljs-far .haskell .hljs-type,.hljs-far .vbscript .hljs-built_in,.hljs-far .rsl .hljs-built_in,.hljs-far .smalltalk .hljs-class,.hljs-far .hljs-winutils,.hljs-far .hljs-flow,.hljs-far .apache .hljs-tag,.hljs-far .nginx .hljs-built_in,.hljs-far .tex .hljs-command,.hljs-far .tex .hljs-special,.hljs-far .hljs-request,.hljs-far .hljs-status{font-weight:bold;}","foundation":".hljs-foundation{}.hljs-foundation .hljs{display:block;padding:0.5em;background:#eee;}.hljs-foundation .hljs-header,.hljs-foundation .hljs-decorator,.hljs-foundation .hljs-annotation{color:#000077;}.hljs-foundation .hljs-horizontal_rule,.hljs-foundation .hljs-link_url,.hljs-foundation .hljs-emphasis,.hljs-foundation .hljs-attribute{color:#070;}.hljs-foundation .hljs-emphasis{font-style:italic;}.hljs-foundation .hljs-link_label,.hljs-foundation .hljs-strong,.hljs-foundation .hljs-value,.hljs-foundation .hljs-string,.hljs-foundation .scss .hljs-value .hljs-string{color:#d14;}.hljs-foundation .hljs-strong{font-weight:bold;}.hljs-foundation .hljs-blockquote,.hljs-foundation .hljs-comment{color:#998;font-style:italic;}.hljs-foundation .asciidoc .hljs-title,.hljs-foundation .hljs-function .hljs-title{color:#900;}.hljs-foundation .hljs-class{color:#458;}.hljs-foundation .hljs-id,.hljs-foundation .hljs-pseudo,.hljs-foundation .hljs-constant,.hljs-foundation .hljs-hexcolor{color:teal;}.hljs-foundation .hljs-variable{color:#336699;}.hljs-foundation .hljs-bullet,.hljs-foundation .hljs-javadoc{color:#997700;}.hljs-foundation .hljs-pi,.hljs-foundation .hljs-doctype{color:#3344bb;}.hljs-foundation .hljs-code,.hljs-foundation .hljs-number{color:#099;}.hljs-foundation .hljs-important{color:#f00;}.hljs-foundation .smartquote,.hljs-foundation .hljs-label{color:#970;}.hljs-foundation .hljs-preprocessor,.hljs-foundation .hljs-pragma{color:#579;}.hljs-foundation .hljs-reserved,.hljs-foundation .hljs-keyword,.hljs-foundation .scss .hljs-value{color:#000;}.hljs-foundation .hljs-regexp{background-color:#fff0ff;color:#880088;}.hljs-foundation .hljs-symbol{color:#990073;}.hljs-foundation .hljs-symbol .hljs-string{color:#a60;}.hljs-foundation .hljs-tag{color:#007700;}.hljs-foundation .hljs-at_rule,.hljs-foundation .hljs-at_rule .hljs-keyword{color:#088;}.hljs-foundation .hljs-at_rule .hljs-preprocessor{color:#808;}.hljs-foundation .scss .hljs-tag,.hljs-foundation .scss .hljs-attribute{color:#339;}","github":".hljs-github{}.hljs-github .hljs{display:block;padding:0.5em;color:#333;background:#f8f8f8;}.hljs-github .hljs-comment,.hljs-github .hljs-template_comment,.hljs-github .diff .hljs-header,.hljs-github .hljs-javadoc{color:#998;font-style:italic;}.hljs-github .hljs-keyword,.hljs-github .css .rule .hljs-keyword,.hljs-github .hljs-winutils,.hljs-github .javascript .hljs-title,.hljs-github .nginx .hljs-title,.hljs-github .hljs-subst,.hljs-github .hljs-request,.hljs-github .hljs-status{color:#333;font-weight:bold;}.hljs-github .hljs-number,.hljs-github .hljs-hexcolor,.hljs-github .ruby .hljs-constant{color:#099;}.hljs-github .hljs-string,.hljs-github .hljs-tag .hljs-value,.hljs-github .hljs-phpdoc,.hljs-github .tex .hljs-formula{color:#d14;}.hljs-github .hljs-title,.hljs-github .hljs-id,.hljs-github .coffeescript .hljs-params,.hljs-github .scss .hljs-preprocessor{color:#900;font-weight:bold;}.hljs-github .javascript .hljs-title,.hljs-github .lisp .hljs-title,.hljs-github .clojure .hljs-title,.hljs-github .hljs-subst{font-weight:normal;}.hljs-github .hljs-class .hljs-title,.hljs-github .haskell .hljs-type,.hljs-github .vhdl .hljs-literal,.hljs-github .tex .hljs-command{color:#458;font-weight:bold;}.hljs-github .hljs-tag,.hljs-github .hljs-tag .hljs-title,.hljs-github .hljs-rules .hljs-property,.hljs-github .django .hljs-tag .hljs-keyword{color:#000080;font-weight:normal;}.hljs-github .hljs-attribute,.hljs-github .hljs-variable,.hljs-github .lisp .hljs-body{color:#008080;}.hljs-github .hljs-regexp{color:#009926;}.hljs-github .hljs-symbol,.hljs-github .ruby .hljs-symbol .hljs-string,.hljs-github .lisp .hljs-keyword,.hljs-github .tex .hljs-special,.hljs-github .hljs-prompt{color:#990073;}.hljs-github .hljs-built_in,.hljs-github .lisp .hljs-title,.hljs-github .clojure .hljs-built_in{color:#0086b3;}.hljs-github .hljs-preprocessor,.hljs-github .hljs-pragma,.hljs-github .hljs-pi,.hljs-github .hljs-doctype,.hljs-github .hljs-shebang,.hljs-github .hljs-cdata{color:#999;font-weight:bold;}.hljs-github .hljs-deletion{background:#fdd;}.hljs-github .hljs-addition{background:#dfd;}.hljs-github .diff .hljs-change{background:#0086b3;}.hljs-github .hljs-chunk{color:#aaa;}","googlecode":".hljs-googlecode{}.hljs-googlecode .hljs{display:block;padding:0.5em;background:white;color:black;}.hljs-googlecode .hljs-comment,.hljs-googlecode .hljs-template_comment,.hljs-googlecode .hljs-javadoc{color:#800;}.hljs-googlecode .hljs-keyword,.hljs-googlecode .method,.hljs-googlecode .hljs-list .hljs-title,.hljs-googlecode .clojure .hljs-built_in,.hljs-googlecode .nginx .hljs-title,.hljs-googlecode .hljs-tag .hljs-title,.hljs-googlecode .setting .hljs-value,.hljs-googlecode .hljs-winutils,.hljs-googlecode .tex .hljs-command,.hljs-googlecode .http .hljs-title,.hljs-googlecode .hljs-request,.hljs-googlecode .hljs-status{color:#008;}.hljs-googlecode .hljs-envvar,.hljs-googlecode .tex .hljs-special{color:#660;}.hljs-googlecode .hljs-string,.hljs-googlecode .hljs-tag .hljs-value,.hljs-googlecode .hljs-cdata,.hljs-googlecode .hljs-filter .hljs-argument,.hljs-googlecode .hljs-attr_selector,.hljs-googlecode .apache .hljs-cbracket,.hljs-googlecode .hljs-date,.hljs-googlecode .hljs-regexp,.hljs-googlecode .coffeescript .hljs-attribute{color:#080;}.hljs-googlecode .hljs-sub .hljs-identifier,.hljs-googlecode .hljs-pi,.hljs-googlecode .hljs-tag,.hljs-googlecode .hljs-tag .hljs-keyword,.hljs-googlecode .hljs-decorator,.hljs-googlecode .ini .hljs-title,.hljs-googlecode .hljs-shebang,.hljs-googlecode .hljs-prompt,.hljs-googlecode .hljs-hexcolor,.hljs-googlecode .hljs-rules .hljs-value,.hljs-googlecode .hljs-literal,.hljs-googlecode .hljs-symbol,.hljs-googlecode .ruby .hljs-symbol .hljs-string,.hljs-googlecode .hljs-number,.hljs-googlecode .css .hljs-function,.hljs-googlecode .clojure .hljs-attribute{color:#066;}.hljs-googlecode .hljs-class .hljs-title,.hljs-googlecode .haskell .hljs-type,.hljs-googlecode .smalltalk .hljs-class,.hljs-googlecode .hljs-javadoctag,.hljs-googlecode .hljs-yardoctag,.hljs-googlecode .hljs-phpdoc,.hljs-googlecode .hljs-typename,.hljs-googlecode .hljs-tag .hljs-attribute,.hljs-googlecode .hljs-doctype,.hljs-googlecode .hljs-class .hljs-id,.hljs-googlecode .hljs-built_in,.hljs-googlecode .setting,.hljs-googlecode .hljs-params,.hljs-googlecode .hljs-variable,.hljs-googlecode .clojure .hljs-title{color:#606;}.hljs-googlecode .css .hljs-tag,.hljs-googlecode .hljs-rules .hljs-property,.hljs-googlecode .hljs-pseudo,.hljs-googlecode .hljs-subst{color:#000;}.hljs-googlecode .css .hljs-class,.hljs-googlecode .css .hljs-id{color:#9b703f;}.hljs-googlecode .hljs-value .hljs-important{color:#ff7700;font-weight:bold;}.hljs-googlecode .hljs-rules .hljs-keyword{color:#c5af75;}.hljs-googlecode .hljs-annotation,.hljs-googlecode .apache .hljs-sqbracket,.hljs-googlecode .nginx .hljs-built_in{color:#9b859d;}.hljs-googlecode .hljs-preprocessor,.hljs-googlecode .hljs-preprocessor *,.hljs-googlecode .hljs-pragma{color:#444;}.hljs-googlecode .tex .hljs-formula{background-color:#eee;font-style:italic;}.hljs-googlecode .diff .hljs-header,.hljs-googlecode .hljs-chunk{color:#808080;font-weight:bold;}.hljs-googlecode .diff .hljs-change{background-color:#bccff9;}.hljs-googlecode .hljs-addition{background-color:#baeeba;}.hljs-googlecode .hljs-deletion{background-color:#ffc8bd;}.hljs-googlecode .hljs-comment .hljs-yardoctag{font-weight:bold;}","idea":".hljs-idea{}.hljs-idea .hljs{display:block;padding:0.5em;color:#000;background:#fff;}.hljs-idea .hljs-subst,.hljs-idea .hljs-title,.hljs-idea .json .hljs-value{font-weight:normal;color:#000;}.hljs-idea .hljs-comment,.hljs-idea .hljs-template_comment,.hljs-idea .hljs-javadoc,.hljs-idea .diff .hljs-header{color:#808080;font-style:italic;}.hljs-idea .hljs-annotation,.hljs-idea .hljs-decorator,.hljs-idea .hljs-preprocessor,.hljs-idea .hljs-pragma,.hljs-idea .hljs-doctype,.hljs-idea .hljs-pi,.hljs-idea .hljs-chunk,.hljs-idea .hljs-shebang,.hljs-idea .apache .hljs-cbracket,.hljs-idea .hljs-prompt,.hljs-idea .http .hljs-title{color:#808000;}.hljs-idea .hljs-tag,.hljs-idea .hljs-pi{background:#efefef;}.hljs-idea .hljs-tag .hljs-title,.hljs-idea .hljs-id,.hljs-idea .hljs-attr_selector,.hljs-idea .hljs-pseudo,.hljs-idea .hljs-literal,.hljs-idea .hljs-keyword,.hljs-idea .hljs-hexcolor,.hljs-idea .css .hljs-function,.hljs-idea .ini .hljs-title,.hljs-idea .css .hljs-class,.hljs-idea .hljs-list .hljs-title,.hljs-idea .clojure .hljs-title,.hljs-idea .nginx .hljs-title,.hljs-idea .tex .hljs-command,.hljs-idea .hljs-request,.hljs-idea .hljs-status{font-weight:bold;color:#000080;}.hljs-idea .hljs-attribute,.hljs-idea .hljs-rules .hljs-keyword,.hljs-idea .hljs-number,.hljs-idea .hljs-date,.hljs-idea .hljs-regexp,.hljs-idea .tex .hljs-special{font-weight:bold;color:#0000ff;}.hljs-idea .hljs-number,.hljs-idea .hljs-regexp{font-weight:normal;}.hljs-idea .hljs-string,.hljs-idea .hljs-value,.hljs-idea .hljs-filter .hljs-argument,.hljs-idea .css .hljs-function .hljs-params,.hljs-idea .apache .hljs-tag{color:#008000;font-weight:bold;}.hljs-idea .hljs-symbol,.hljs-idea .ruby .hljs-symbol .hljs-string,.hljs-idea .hljs-char,.hljs-idea .tex .hljs-formula{color:#000;background:#d0eded;font-style:italic;}.hljs-idea .hljs-phpdoc,.hljs-idea .hljs-yardoctag,.hljs-idea .hljs-javadoctag{text-decoration:underline;}.hljs-idea .hljs-variable,.hljs-idea .hljs-envvar,.hljs-idea .apache .hljs-sqbracket,.hljs-idea .nginx .hljs-built_in{color:#660e7a;}.hljs-idea .hljs-addition{background:#baeeba;}.hljs-idea .hljs-deletion{background:#ffc8bd;}.hljs-idea .diff .hljs-change{background:#bccff9;}","ir_black":".hljs-ir_black{}.hljs-ir_black .hljs{display:block;padding:0.5em;background:#000;color:#f8f8f8;}.hljs-ir_black .hljs-shebang,.hljs-ir_black .hljs-comment,.hljs-ir_black .hljs-template_comment,.hljs-ir_black .hljs-javadoc{color:#7c7c7c;}.hljs-ir_black .hljs-keyword,.hljs-ir_black .hljs-tag,.hljs-ir_black .tex .hljs-command,.hljs-ir_black .hljs-request,.hljs-ir_black .hljs-status,.hljs-ir_black .clojure .hljs-attribute{color:#96cbfe;}.hljs-ir_black .hljs-sub .hljs-keyword,.hljs-ir_black .method,.hljs-ir_black .hljs-list .hljs-title,.hljs-ir_black .nginx .hljs-title{color:#ffffb6;}.hljs-ir_black .hljs-string,.hljs-ir_black .hljs-tag .hljs-value,.hljs-ir_black .hljs-cdata,.hljs-ir_black .hljs-filter .hljs-argument,.hljs-ir_black .hljs-attr_selector,.hljs-ir_black .apache .hljs-cbracket,.hljs-ir_black .hljs-date,.hljs-ir_black .coffeescript .hljs-attribute{color:#a8ff60;}.hljs-ir_black .hljs-subst{color:#daefa3;}.hljs-ir_black .hljs-regexp{color:#e9c062;}.hljs-ir_black .hljs-title,.hljs-ir_black .hljs-sub .hljs-identifier,.hljs-ir_black .hljs-pi,.hljs-ir_black .hljs-decorator,.hljs-ir_black .tex .hljs-special,.hljs-ir_black .haskell .hljs-type,.hljs-ir_black .hljs-constant,.hljs-ir_black .smalltalk .hljs-class,.hljs-ir_black .hljs-javadoctag,.hljs-ir_black .hljs-yardoctag,.hljs-ir_black .hljs-phpdoc,.hljs-ir_black .nginx .hljs-built_in{color:#ffffb6;}.hljs-ir_black .hljs-symbol,.hljs-ir_black .ruby .hljs-symbol .hljs-string,.hljs-ir_black .hljs-number,.hljs-ir_black .hljs-variable,.hljs-ir_black .vbscript,.hljs-ir_black .hljs-literal{color:#c6c5fe;}.hljs-ir_black .css .hljs-tag{color:#96cbfe;}.hljs-ir_black .css .hljs-rules .hljs-property,.hljs-ir_black .css .hljs-id{color:#ffffb6;}.hljs-ir_black .css .hljs-class{color:#fff;}.hljs-ir_black .hljs-hexcolor{color:#c6c5fe;}.hljs-ir_black .hljs-number{color:#ff73fd;}.hljs-ir_black .coffeescript .javascript,.hljs-ir_black .javascript .xml,.hljs-ir_black .tex .hljs-formula,.hljs-ir_black .xml .javascript,.hljs-ir_black .xml .vbscript,.hljs-ir_black .xml .css,.hljs-ir_black .xml .hljs-cdata{opacity:0.7;}","magula":".hljs-magula{}.hljs-magula .hljs{display:block;padding:0.5em;background-color:#f4f4f4;}.hljs-magula .hljs,.hljs-magula .hljs-subst,.hljs-magula .lisp .hljs-title,.hljs-magula .clojure .hljs-built_in{color:black;}.hljs-magula .hljs-string,.hljs-magula .hljs-title,.hljs-magula .hljs-parent,.hljs-magula .hljs-tag .hljs-value,.hljs-magula .hljs-rules .hljs-value,.hljs-magula .hljs-preprocessor,.hljs-magula .hljs-pragma,.hljs-magula .ruby .hljs-symbol,.hljs-magula .ruby .hljs-symbol .hljs-string,.hljs-magula .hljs-template_tag,.hljs-magula .django .hljs-variable,.hljs-magula .smalltalk .hljs-class,.hljs-magula .hljs-addition,.hljs-magula .hljs-flow,.hljs-magula .hljs-stream,.hljs-magula .bash .hljs-variable,.hljs-magula .apache .hljs-cbracket,.hljs-magula .coffeescript .hljs-attribute{color:#050;}.hljs-magula .hljs-comment,.hljs-magula .hljs-annotation,.hljs-magula .hljs-template_comment,.hljs-magula .diff .hljs-header,.hljs-magula .hljs-chunk{color:#777;}.hljs-magula .hljs-number,.hljs-magula .hljs-date,.hljs-magula .hljs-regexp,.hljs-magula .hljs-literal,.hljs-magula .smalltalk .hljs-symbol,.hljs-magula .smalltalk .hljs-char,.hljs-magula .hljs-change,.hljs-magula .tex .hljs-special{color:#800;}.hljs-magula .hljs-label,.hljs-magula .hljs-javadoc,.hljs-magula .ruby .hljs-string,.hljs-magula .hljs-decorator,.hljs-magula .hljs-filter .hljs-argument,.hljs-magula .hljs-localvars,.hljs-magula .hljs-array,.hljs-magula .hljs-attr_selector,.hljs-magula .hljs-pseudo,.hljs-magula .hljs-pi,.hljs-magula .hljs-doctype,.hljs-magula .hljs-deletion,.hljs-magula .hljs-envvar,.hljs-magula .hljs-shebang,.hljs-magula .apache .hljs-sqbracket,.hljs-magula .nginx .hljs-built_in,.hljs-magula .tex .hljs-formula,.hljs-magula .hljs-prompt,.hljs-magula .clojure .hljs-attribute{color:#00e;}.hljs-magula .hljs-keyword,.hljs-magula .hljs-id,.hljs-magula .hljs-phpdoc,.hljs-magula .hljs-title,.hljs-magula .hljs-built_in,.hljs-magula .smalltalk .hljs-class,.hljs-magula .hljs-winutils,.hljs-magula .bash .hljs-variable,.hljs-magula .apache .hljs-tag,.hljs-magula .xml .hljs-tag,.hljs-magula .tex .hljs-command,.hljs-magula .hljs-request,.hljs-magula .hljs-status{font-weight:bold;color:navy;}.hljs-magula .nginx .hljs-built_in{font-weight:normal;}.hljs-magula .coffeescript .javascript,.hljs-magula .javascript .xml,.hljs-magula .tex .hljs-formula,.hljs-magula .xml .javascript,.hljs-magula .xml .vbscript,.hljs-magula .xml .css,.hljs-magula .xml .hljs-cdata{opacity:0.5;}.hljs-magula .apache .hljs-tag{font-weight:bold;color:blue;}","mono-blue":".hljs-mono-blue{}.hljs-mono-blue .hljs{display:block;padding:0.5em;background:#eaeef3;color:#00193a;}.hljs-mono-blue .hljs-keyword,.hljs-mono-blue .hljs-title,.hljs-mono-blue .hljs-important,.hljs-mono-blue .hljs-request,.hljs-mono-blue .hljs-header,.hljs-mono-blue .hljs-javadoctag{font-weight:bold;}.hljs-mono-blue .hljs-comment,.hljs-mono-blue .hljs-chunk,.hljs-mono-blue .hljs-template_comment{color:#738191;}.hljs-mono-blue .hljs-string,.hljs-mono-blue .hljs-title,.hljs-mono-blue .hljs-parent,.hljs-mono-blue .hljs-built_in,.hljs-mono-blue .hljs-literal,.hljs-mono-blue .hljs-filename,.hljs-mono-blue .hljs-value,.hljs-mono-blue .hljs-addition,.hljs-mono-blue .hljs-tag,.hljs-mono-blue .hljs-argument,.hljs-mono-blue .hljs-link_label,.hljs-mono-blue .hljs-blockquote,.hljs-mono-blue .hljs-header{color:#0048ab;}.hljs-mono-blue .hljs-decorator,.hljs-mono-blue .hljs-prompt,.hljs-mono-blue .hljs-yardoctag,.hljs-mono-blue .hljs-subst,.hljs-mono-blue .hljs-symbol,.hljs-mono-blue .hljs-doctype,.hljs-mono-blue .hljs-regexp,.hljs-mono-blue .hljs-preprocessor,.hljs-mono-blue .hljs-pragma,.hljs-mono-blue .hljs-pi,.hljs-mono-blue .hljs-attribute,.hljs-mono-blue .hljs-attr_selector,.hljs-mono-blue .hljs-javadoc,.hljs-mono-blue .hljs-xmlDocTag,.hljs-mono-blue .hljs-deletion,.hljs-mono-blue .hljs-shebang,.hljs-mono-blue .hljs-string .hljs-variable,.hljs-mono-blue .hljs-link_url,.hljs-mono-blue .hljs-bullet,.hljs-mono-blue .hljs-sqbracket,.hljs-mono-blue .hljs-phony{color:#4c81c9;}","monokai":".hljs-monokai{}.hljs-monokai .hljs{display:block;padding:0.5em;background:#272822;}.hljs-monokai .hljs-tag,.hljs-monokai .hljs-tag .hljs-title,.hljs-monokai .hljs-keyword,.hljs-monokai .hljs-literal,.hljs-monokai .hljs-strong,.hljs-monokai .hljs-change,.hljs-monokai .hljs-winutils,.hljs-monokai .hljs-flow,.hljs-monokai .lisp .hljs-title,.hljs-monokai .clojure .hljs-built_in,.hljs-monokai .nginx .hljs-title,.hljs-monokai .tex .hljs-special{color:#f92672;}.hljs-monokai .hljs{color:#ddd;}.hljs-monokai .hljs .hljs-constant,.hljs-monokai .asciidoc .hljs-code{color:#66d9ef;}.hljs-monokai .hljs-code,.hljs-monokai .hljs-class .hljs-title,.hljs-monokai .hljs-header{color:white;}.hljs-monokai .hljs-link_label,.hljs-monokai .hljs-attribute,.hljs-monokai .hljs-symbol,.hljs-monokai .hljs-symbol .hljs-string,.hljs-monokai .hljs-value,.hljs-monokai .hljs-regexp{color:#bf79db;}.hljs-monokai .hljs-link_url,.hljs-monokai .hljs-tag .hljs-value,.hljs-monokai .hljs-string,.hljs-monokai .hljs-bullet,.hljs-monokai .hljs-subst,.hljs-monokai .hljs-title,.hljs-monokai .hljs-emphasis,.hljs-monokai .haskell .hljs-type,.hljs-monokai .hljs-preprocessor,.hljs-monokai .hljs-pragma,.hljs-monokai .ruby .hljs-class .hljs-parent,.hljs-monokai .hljs-built_in,.hljs-monokai .django .hljs-template_tag,.hljs-monokai .django .hljs-variable,.hljs-monokai .smalltalk .hljs-class,.hljs-monokai .hljs-javadoc,.hljs-monokai .django .hljs-filter .hljs-argument,.hljs-monokai .smalltalk .hljs-localvars,.hljs-monokai .smalltalk .hljs-array,.hljs-monokai .hljs-attr_selector,.hljs-monokai .hljs-pseudo,.hljs-monokai .hljs-addition,.hljs-monokai .hljs-stream,.hljs-monokai .hljs-envvar,.hljs-monokai .apache .hljs-tag,.hljs-monokai .apache .hljs-cbracket,.hljs-monokai .tex .hljs-command,.hljs-monokai .hljs-prompt{color:#a6e22e;}.hljs-monokai .hljs-comment,.hljs-monokai .java .hljs-annotation,.hljs-monokai .smartquote,.hljs-monokai .hljs-blockquote,.hljs-monokai .hljs-horizontal_rule,.hljs-monokai .python .hljs-decorator,.hljs-monokai .hljs-template_comment,.hljs-monokai .hljs-pi,.hljs-monokai .hljs-doctype,.hljs-monokai .hljs-deletion,.hljs-monokai .hljs-shebang,.hljs-monokai .apache .hljs-sqbracket,.hljs-monokai .tex .hljs-formula{color:#75715e;}.hljs-monokai .hljs-keyword,.hljs-monokai .hljs-literal,.hljs-monokai .css .hljs-id,.hljs-monokai .hljs-phpdoc,.hljs-monokai .hljs-title,.hljs-monokai .hljs-header,.hljs-monokai .haskell .hljs-type,.hljs-monokai .vbscript .hljs-built_in,.hljs-monokai .rsl .hljs-built_in,.hljs-monokai .smalltalk .hljs-class,.hljs-monokai .diff .hljs-header,.hljs-monokai .hljs-chunk,.hljs-monokai .hljs-winutils,.hljs-monokai .bash .hljs-variable,.hljs-monokai .apache .hljs-tag,.hljs-monokai .tex .hljs-special,.hljs-monokai .hljs-request,.hljs-monokai .hljs-status{font-weight:bold;}.hljs-monokai .coffeescript .javascript,.hljs-monokai .javascript .xml,.hljs-monokai .tex .hljs-formula,.hljs-monokai .xml .javascript,.hljs-monokai .xml .vbscript,.hljs-monokai .xml .css,.hljs-monokai .xml .hljs-cdata{opacity:0.5;}","monokai_sublime":".hljs-monokai_sublime{}.hljs-monokai_sublime .hljs{display:block;padding:0.5em;background:#23241f;}.hljs-monokai_sublime .hljs,.hljs-monokai_sublime .hljs-tag,.hljs-monokai_sublime .css .hljs-rules,.hljs-monokai_sublime .css .hljs-value,.hljs-monokai_sublime .css .hljs-function .hljs-preprocessor,.hljs-monokai_sublime .hljs-pragma{color:#f8f8f2;}.hljs-monokai_sublime .hljs-strongemphasis,.hljs-monokai_sublime .hljs-strong,.hljs-monokai_sublime .hljs-emphasis{color:#a8a8a2;}.hljs-monokai_sublime .hljs-bullet,.hljs-monokai_sublime .hljs-blockquote,.hljs-monokai_sublime .hljs-horizontal_rule,.hljs-monokai_sublime .hljs-number,.hljs-monokai_sublime .hljs-regexp,.hljs-monokai_sublime .alias .hljs-keyword,.hljs-monokai_sublime .hljs-literal,.hljs-monokai_sublime .hljs-hexcolor{color:#ae81ff;}.hljs-monokai_sublime .hljs-tag .hljs-value,.hljs-monokai_sublime .hljs-code,.hljs-monokai_sublime .hljs-title,.hljs-monokai_sublime .css .hljs-class,.hljs-monokai_sublime .hljs-class .hljs-title:last-child{color:#a6e22e;}.hljs-monokai_sublime .hljs-link_url{font-size:80%;}.hljs-monokai_sublime .hljs-strong,.hljs-monokai_sublime .hljs-strongemphasis{font-weight:bold;}.hljs-monokai_sublime .hljs-emphasis,.hljs-monokai_sublime .hljs-strongemphasis,.hljs-monokai_sublime .hljs-class .hljs-title:last-child{font-style:italic;}.hljs-monokai_sublime .hljs-keyword,.hljs-monokai_sublime .hljs-function,.hljs-monokai_sublime .hljs-change,.hljs-monokai_sublime .hljs-winutils,.hljs-monokai_sublime .hljs-flow,.hljs-monokai_sublime .lisp .hljs-title,.hljs-monokai_sublime .clojure .hljs-built_in,.hljs-monokai_sublime .nginx .hljs-title,.hljs-monokai_sublime .tex .hljs-special,.hljs-monokai_sublime .hljs-header,.hljs-monokai_sublime .hljs-attribute,.hljs-monokai_sublime .hljs-symbol,.hljs-monokai_sublime .hljs-symbol .hljs-string,.hljs-monokai_sublime .hljs-tag .hljs-title,.hljs-monokai_sublime .hljs-value,.hljs-monokai_sublime .alias .hljs-keyword:first-child,.hljs-monokai_sublime .css .hljs-tag,.hljs-monokai_sublime .css .unit,.hljs-monokai_sublime .css .hljs-important{color:#f92672;}.hljs-monokai_sublime .hljs-function .hljs-keyword,.hljs-monokai_sublime .hljs-class .hljs-keyword:first-child,.hljs-monokai_sublime .hljs-constant,.hljs-monokai_sublime .css .hljs-attribute{color:#66d9ef;}.hljs-monokai_sublime .hljs-variable,.hljs-monokai_sublime .hljs-params,.hljs-monokai_sublime .hljs-class .hljs-title{color:#f8f8f2;}.hljs-monokai_sublime .hljs-string,.hljs-monokai_sublime .css .hljs-id,.hljs-monokai_sublime .hljs-subst,.hljs-monokai_sublime .haskell .hljs-type,.hljs-monokai_sublime .ruby .hljs-class .hljs-parent,.hljs-monokai_sublime .hljs-built_in,.hljs-monokai_sublime .django .hljs-template_tag,.hljs-monokai_sublime .django .hljs-variable,.hljs-monokai_sublime .smalltalk .hljs-class,.hljs-monokai_sublime .django .hljs-filter .hljs-argument,.hljs-monokai_sublime .smalltalk .hljs-localvars,.hljs-monokai_sublime .smalltalk .hljs-array,.hljs-monokai_sublime .hljs-attr_selector,.hljs-monokai_sublime .hljs-pseudo,.hljs-monokai_sublime .hljs-addition,.hljs-monokai_sublime .hljs-stream,.hljs-monokai_sublime .hljs-envvar,.hljs-monokai_sublime .apache .hljs-tag,.hljs-monokai_sublime .apache .hljs-cbracket,.hljs-monokai_sublime .tex .hljs-command,.hljs-monokai_sublime .hljs-prompt,.hljs-monokai_sublime .hljs-link_label,.hljs-monokai_sublime .hljs-link_url{color:#e6db74;}.hljs-monokai_sublime .hljs-comment,.hljs-monokai_sublime .hljs-javadoc,.hljs-monokai_sublime .java .hljs-annotation,.hljs-monokai_sublime .python .hljs-decorator,.hljs-monokai_sublime .hljs-template_comment,.hljs-monokai_sublime .hljs-pi,.hljs-monokai_sublime .hljs-doctype,.hljs-monokai_sublime .hljs-deletion,.hljs-monokai_sublime .hljs-shebang,.hljs-monokai_sublime .apache .hljs-sqbracket,.hljs-monokai_sublime .tex .hljs-formula{color:#75715e;}.hljs-monokai_sublime .coffeescript .javascript,.hljs-monokai_sublime .javascript .xml,.hljs-monokai_sublime .tex .hljs-formula,.hljs-monokai_sublime .xml .javascript,.hljs-monokai_sublime .xml .vbscript,.hljs-monokai_sublime .xml .css,.hljs-monokai_sublime .xml .hljs-cdata,.hljs-monokai_sublime .xml .php,.hljs-monokai_sublime .php .xml{opacity:0.5;}","obsidian":".hljs-obsidian{}.hljs-obsidian .hljs{display:block;padding:0.5em;background:#282b2e;}.hljs-obsidian .hljs-keyword,.hljs-obsidian .hljs-literal,.hljs-obsidian .hljs-change,.hljs-obsidian .hljs-winutils,.hljs-obsidian .hljs-flow,.hljs-obsidian .lisp .hljs-title,.hljs-obsidian .clojure .hljs-built_in,.hljs-obsidian .nginx .hljs-title,.hljs-obsidian .css .hljs-id,.hljs-obsidian .tex .hljs-special{color:#93c763;}.hljs-obsidian .hljs-number{color:#ffcd22;}.hljs-obsidian .hljs{color:#e0e2e4;}.hljs-obsidian .css .hljs-tag,.hljs-obsidian .css .hljs-pseudo{color:#d0d2b5;}.hljs-obsidian .hljs-attribute,.hljs-obsidian .hljs .hljs-constant{color:#668bb0;}.hljs-obsidian .xml .hljs-attribute{color:#b3b689;}.hljs-obsidian .xml .hljs-tag .hljs-value{color:#e8e2b7;}.hljs-obsidian .hljs-code,.hljs-obsidian .hljs-class .hljs-title,.hljs-obsidian .hljs-header{color:white;}.hljs-obsidian .hljs-class,.hljs-obsidian .hljs-hexcolor{color:#93c763;}.hljs-obsidian .hljs-regexp{color:#d39745;}.hljs-obsidian .hljs-at_rule,.hljs-obsidian .hljs-at_rule .hljs-keyword{color:#a082bd;}.hljs-obsidian .hljs-doctype{color:#557182;}.hljs-obsidian .hljs-link_url,.hljs-obsidian .hljs-tag,.hljs-obsidian .hljs-tag .hljs-title,.hljs-obsidian .hljs-bullet,.hljs-obsidian .hljs-subst,.hljs-obsidian .hljs-emphasis,.hljs-obsidian .haskell .hljs-type,.hljs-obsidian .hljs-preprocessor,.hljs-obsidian .hljs-pragma,.hljs-obsidian .ruby .hljs-class .hljs-parent,.hljs-obsidian .hljs-built_in,.hljs-obsidian .django .hljs-template_tag,.hljs-obsidian .django .hljs-variable,.hljs-obsidian .smalltalk .hljs-class,.hljs-obsidian .hljs-javadoc,.hljs-obsidian .django .hljs-filter .hljs-argument,.hljs-obsidian .smalltalk .hljs-localvars,.hljs-obsidian .smalltalk .hljs-array,.hljs-obsidian .hljs-attr_selector,.hljs-obsidian .hljs-pseudo,.hljs-obsidian .hljs-addition,.hljs-obsidian .hljs-stream,.hljs-obsidian .hljs-envvar,.hljs-obsidian .apache .hljs-tag,.hljs-obsidian .apache .hljs-cbracket,.hljs-obsidian .tex .hljs-command,.hljs-obsidian .hljs-prompt{color:#8cbbad;}.hljs-obsidian .hljs-string{color:#ec7600;}.hljs-obsidian .hljs-comment,.hljs-obsidian .java .hljs-annotation,.hljs-obsidian .hljs-blockquote,.hljs-obsidian .hljs-horizontal_rule,.hljs-obsidian .python .hljs-decorator,.hljs-obsidian .hljs-template_comment,.hljs-obsidian .hljs-pi,.hljs-obsidian .hljs-deletion,.hljs-obsidian .hljs-shebang,.hljs-obsidian .apache .hljs-sqbracket,.hljs-obsidian .tex .hljs-formula{color:#818e96;}.hljs-obsidian .hljs-keyword,.hljs-obsidian .hljs-literal,.hljs-obsidian .css .hljs-id,.hljs-obsidian .hljs-phpdoc,.hljs-obsidian .hljs-title,.hljs-obsidian .hljs-header,.hljs-obsidian .haskell .hljs-type,.hljs-obsidian .vbscript .hljs-built_in,.hljs-obsidian .rsl .hljs-built_in,.hljs-obsidian .smalltalk .hljs-class,.hljs-obsidian .diff .hljs-header,.hljs-obsidian .hljs-chunk,.hljs-obsidian .hljs-winutils,.hljs-obsidian .bash .hljs-variable,.hljs-obsidian .apache .hljs-tag,.hljs-obsidian .tex .hljs-special,.hljs-obsidian .hljs-request,.hljs-obsidian .hljs-at_rule .hljs-keyword,.hljs-obsidian .hljs-status{font-weight:bold;}.hljs-obsidian .coffeescript .javascript,.hljs-obsidian .javascript .xml,.hljs-obsidian .tex .hljs-formula,.hljs-obsidian .xml .javascript,.hljs-obsidian .xml .vbscript,.hljs-obsidian .xml .css,.hljs-obsidian .xml .hljs-cdata{opacity:0.5;}","paraiso.dark":".hljs-paraiso.dark{}.hljs-paraiso.dark .hljs-comment,.hljs-paraiso.dark .hljs-title{color:#8d8687;}.hljs-paraiso.dark .hljs-variable,.hljs-paraiso.dark .hljs-attribute,.hljs-paraiso.dark .hljs-tag,.hljs-paraiso.dark .hljs-regexp,.hljs-paraiso.dark .ruby .hljs-constant,.hljs-paraiso.dark .xml .hljs-tag .hljs-title,.hljs-paraiso.dark .xml .hljs-pi,.hljs-paraiso.dark .xml .hljs-doctype,.hljs-paraiso.dark .html .hljs-doctype,.hljs-paraiso.dark .css .hljs-id,.hljs-paraiso.dark .css .hljs-class,.hljs-paraiso.dark .css .hljs-pseudo{color:#ef6155;}.hljs-paraiso.dark .hljs-number,.hljs-paraiso.dark .hljs-preprocessor,.hljs-paraiso.dark .hljs-built_in,.hljs-paraiso.dark .hljs-literal,.hljs-paraiso.dark .hljs-params,.hljs-paraiso.dark .hljs-constant{color:#f99b15;}.hljs-paraiso.dark .ruby .hljs-class .hljs-title,.hljs-paraiso.dark .css .hljs-rules .hljs-attribute{color:#fec418;}.hljs-paraiso.dark .hljs-string,.hljs-paraiso.dark .hljs-value,.hljs-paraiso.dark .hljs-inheritance,.hljs-paraiso.dark .hljs-header,.hljs-paraiso.dark .ruby .hljs-symbol,.hljs-paraiso.dark .xml .hljs-cdata{color:#48b685;}.hljs-paraiso.dark .css .hljs-hexcolor{color:#5bc4bf;}.hljs-paraiso.dark .hljs-function,.hljs-paraiso.dark .python .hljs-decorator,.hljs-paraiso.dark .python .hljs-title,.hljs-paraiso.dark .ruby .hljs-function .hljs-title,.hljs-paraiso.dark .ruby .hljs-title .hljs-keyword,.hljs-paraiso.dark .perl .hljs-sub,.hljs-paraiso.dark .javascript .hljs-title,.hljs-paraiso.dark .coffeescript .hljs-title{color:#06b6ef;}.hljs-paraiso.dark .hljs-keyword,.hljs-paraiso.dark .javascript .hljs-function{color:#815ba4;}.hljs-paraiso.dark .hljs{display:block;background:#2f1e2e;color:#a39e9b;padding:0.5em;}.hljs-paraiso.dark .coffeescript .javascript,.hljs-paraiso.dark .javascript .xml,.hljs-paraiso.dark .tex .hljs-formula,.hljs-paraiso.dark .xml .javascript,.hljs-paraiso.dark .xml .vbscript,.hljs-paraiso.dark .xml .css,.hljs-paraiso.dark .xml .hljs-cdata{opacity:0.5;}","paraiso.light":".hljs-paraiso.light{}.hljs-paraiso.light .hljs-comment,.hljs-paraiso.light .hljs-title{color:#776e71;}.hljs-paraiso.light .hljs-variable,.hljs-paraiso.light .hljs-attribute,.hljs-paraiso.light .hljs-tag,.hljs-paraiso.light .hljs-regexp,.hljs-paraiso.light .ruby .hljs-constant,.hljs-paraiso.light .xml .hljs-tag .hljs-title,.hljs-paraiso.light .xml .hljs-pi,.hljs-paraiso.light .xml .hljs-doctype,.hljs-paraiso.light .html .hljs-doctype,.hljs-paraiso.light .css .hljs-id,.hljs-paraiso.light .css .hljs-class,.hljs-paraiso.light .css .hljs-pseudo{color:#ef6155;}.hljs-paraiso.light .hljs-number,.hljs-paraiso.light .hljs-preprocessor,.hljs-paraiso.light .hljs-built_in,.hljs-paraiso.light .hljs-literal,.hljs-paraiso.light .hljs-params,.hljs-paraiso.light .hljs-constant{color:#f99b15;}.hljs-paraiso.light .ruby .hljs-class .hljs-title,.hljs-paraiso.light .css .hljs-rules .hljs-attribute{color:#fec418;}.hljs-paraiso.light .hljs-string,.hljs-paraiso.light .hljs-value,.hljs-paraiso.light .hljs-inheritance,.hljs-paraiso.light .hljs-header,.hljs-paraiso.light .ruby .hljs-symbol,.hljs-paraiso.light .xml .hljs-cdata{color:#48b685;}.hljs-paraiso.light .css .hljs-hexcolor{color:#5bc4bf;}.hljs-paraiso.light .hljs-function,.hljs-paraiso.light .python .hljs-decorator,.hljs-paraiso.light .python .hljs-title,.hljs-paraiso.light .ruby .hljs-function .hljs-title,.hljs-paraiso.light .ruby .hljs-title .hljs-keyword,.hljs-paraiso.light .perl .hljs-sub,.hljs-paraiso.light .javascript .hljs-title,.hljs-paraiso.light .coffeescript .hljs-title{color:#06b6ef;}.hljs-paraiso.light .hljs-keyword,.hljs-paraiso.light .javascript .hljs-function{color:#815ba4;}.hljs-paraiso.light .hljs{display:block;background:#e7e9db;color:#4f424c;padding:0.5em;}.hljs-paraiso.light .coffeescript .javascript,.hljs-paraiso.light .javascript .xml,.hljs-paraiso.light .tex .hljs-formula,.hljs-paraiso.light .xml .javascript,.hljs-paraiso.light .xml .vbscript,.hljs-paraiso.light .xml .css,.hljs-paraiso.light .xml .hljs-cdata{opacity:0.5;}","railscasts":".hljs-railscasts{}.hljs-railscasts .hljs{display:block;padding:0.5em;background:#232323;color:#e6e1dc;}.hljs-railscasts .hljs-comment,.hljs-railscasts .hljs-template_comment,.hljs-railscasts .hljs-javadoc,.hljs-railscasts .hljs-shebang{color:#bc9458;font-style:italic;}.hljs-railscasts .hljs-keyword,.hljs-railscasts .ruby .hljs-function .hljs-keyword,.hljs-railscasts .hljs-request,.hljs-railscasts .hljs-status,.hljs-railscasts .nginx .hljs-title,.hljs-railscasts .method,.hljs-railscasts .hljs-list .hljs-title{color:#c26230;}.hljs-railscasts .hljs-string,.hljs-railscasts .hljs-number,.hljs-railscasts .hljs-regexp,.hljs-railscasts .hljs-tag .hljs-value,.hljs-railscasts .hljs-cdata,.hljs-railscasts .hljs-filter .hljs-argument,.hljs-railscasts .hljs-attr_selector,.hljs-railscasts .apache .hljs-cbracket,.hljs-railscasts .hljs-date,.hljs-railscasts .tex .hljs-command,.hljs-railscasts .markdown .hljs-link_label{color:#a5c261;}.hljs-railscasts .hljs-subst{color:#519f50;}.hljs-railscasts .hljs-tag,.hljs-railscasts .hljs-tag .hljs-keyword,.hljs-railscasts .hljs-tag .hljs-title,.hljs-railscasts .hljs-doctype,.hljs-railscasts .hljs-sub .hljs-identifier,.hljs-railscasts .hljs-pi,.hljs-railscasts .input_number{color:#e8bf6a;}.hljs-railscasts .hljs-identifier{color:#d0d0ff;}.hljs-railscasts .hljs-class .hljs-title,.hljs-railscasts .haskell .hljs-type,.hljs-railscasts .smalltalk .hljs-class,.hljs-railscasts .hljs-javadoctag,.hljs-railscasts .hljs-yardoctag,.hljs-railscasts .hljs-phpdoc{text-decoration:none;}.hljs-railscasts .hljs-constant{color:#da4939;}.hljs-railscasts .hljs-symbol,.hljs-railscasts .hljs-built_in,.hljs-railscasts .ruby .hljs-symbol .hljs-string,.hljs-railscasts .ruby .hljs-symbol .hljs-identifier,.hljs-railscasts .markdown .hljs-link_url,.hljs-railscasts .hljs-attribute{color:#6d9cbe;}.hljs-railscasts .markdown .hljs-link_url{text-decoration:underline;}.hljs-railscasts .hljs-params,.hljs-railscasts .hljs-variable,.hljs-railscasts .clojure .hljs-attribute{color:#d0d0ff;}.hljs-railscasts .css .hljs-tag,.hljs-railscasts .hljs-rules .hljs-property,.hljs-railscasts .hljs-pseudo,.hljs-railscasts .tex .hljs-special{color:#cda869;}.hljs-railscasts .css .hljs-class{color:#9b703f;}.hljs-railscasts .hljs-rules .hljs-keyword{color:#c5af75;}.hljs-railscasts .hljs-rules .hljs-value{color:#cf6a4c;}.hljs-railscasts .css .hljs-id{color:#8b98ab;}.hljs-railscasts .hljs-annotation,.hljs-railscasts .apache .hljs-sqbracket,.hljs-railscasts .nginx .hljs-built_in{color:#9b859d;}.hljs-railscasts .hljs-preprocessor,.hljs-railscasts .hljs-preprocessor *,.hljs-railscasts .hljs-pragma{color:#8996a8 !important;}.hljs-railscasts .hljs-hexcolor,.hljs-railscasts .css .hljs-value .hljs-number{color:#a5c261;}.hljs-railscasts .hljs-title,.hljs-railscasts .hljs-decorator,.hljs-railscasts .css .hljs-function{color:#ffc66d;}.hljs-railscasts .diff .hljs-header,.hljs-railscasts .hljs-chunk{background-color:#2f33ab;color:#e6e1dc;display:inline-block;width:100%;}.hljs-railscasts .diff .hljs-change{background-color:#4a410d;color:#f8f8f8;display:inline-block;width:100%;}.hljs-railscasts .hljs-addition{background-color:#144212;color:#e6e1dc;display:inline-block;width:100%;}.hljs-railscasts .hljs-deletion{background-color:#600;color:#e6e1dc;display:inline-block;width:100%;}.hljs-railscasts .coffeescript .javascript,.hljs-railscasts .javascript .xml,.hljs-railscasts .tex .hljs-formula,.hljs-railscasts .xml .javascript,.hljs-railscasts .xml .vbscript,.hljs-railscasts .xml .css,.hljs-railscasts .xml .hljs-cdata{opacity:0.7;}","rainbow":".hljs-rainbow{}.hljs-rainbow .hljs{display:block;padding:0.5em;background:#474949;color:#d1d9e1;}.hljs-rainbow .hljs-body,.hljs-rainbow .hljs-collection{color:#d1d9e1;}.hljs-rainbow .hljs-comment,.hljs-rainbow .hljs-template_comment,.hljs-rainbow .diff .hljs-header,.hljs-rainbow .hljs-doctype,.hljs-rainbow .lisp .hljs-string,.hljs-rainbow .hljs-javadoc{color:#969896;font-style:italic;}.hljs-rainbow .hljs-keyword,.hljs-rainbow .clojure .hljs-attribute,.hljs-rainbow .hljs-winutils,.hljs-rainbow .javascript .hljs-title,.hljs-rainbow .hljs-addition,.hljs-rainbow .css .hljs-tag{color:#cc99cc;}.hljs-rainbow .hljs-number{color:#f99157;}.hljs-rainbow .hljs-command,.hljs-rainbow .hljs-string,.hljs-rainbow .hljs-tag .hljs-value,.hljs-rainbow .hljs-phpdoc,.hljs-rainbow .tex .hljs-formula,.hljs-rainbow .hljs-regexp,.hljs-rainbow .hljs-hexcolor{color:#8abeb7;}.hljs-rainbow .hljs-title,.hljs-rainbow .hljs-localvars,.hljs-rainbow .hljs-function .hljs-title,.hljs-rainbow .hljs-chunk,.hljs-rainbow .hljs-decorator,.hljs-rainbow .hljs-built_in,.hljs-rainbow .lisp .hljs-title,.hljs-rainbow .hljs-identifier{color:#b5bd68;}.hljs-rainbow .hljs-class .hljs-keyword{color:#f2777a;}.hljs-rainbow .hljs-variable,.hljs-rainbow .lisp .hljs-body,.hljs-rainbow .smalltalk .hljs-number,.hljs-rainbow .hljs-constant,.hljs-rainbow .hljs-class .hljs-title,.hljs-rainbow .hljs-parent,.hljs-rainbow .haskell .hljs-label,.hljs-rainbow .hljs-id,.hljs-rainbow .lisp .hljs-title,.hljs-rainbow .clojure .hljs-title .hljs-built_in{color:#ffcc66;}.hljs-rainbow .hljs-tag .hljs-title,.hljs-rainbow .hljs-rules .hljs-property,.hljs-rainbow .django .hljs-tag .hljs-keyword,.hljs-rainbow .clojure .hljs-title .hljs-built_in{font-weight:bold;}.hljs-rainbow .hljs-attribute,.hljs-rainbow .clojure .hljs-title{color:#81a2be;}.hljs-rainbow .hljs-preprocessor,.hljs-rainbow .hljs-pragma,.hljs-rainbow .hljs-pi,.hljs-rainbow .hljs-shebang,.hljs-rainbow .hljs-symbol,.hljs-rainbow .hljs-symbol .hljs-string,.hljs-rainbow .diff .hljs-change,.hljs-rainbow .hljs-special,.hljs-rainbow .hljs-attr_selector,.hljs-rainbow .hljs-important,.hljs-rainbow .hljs-subst,.hljs-rainbow .hljs-cdata{color:#f99157;}.hljs-rainbow .hljs-deletion{color:#dc322f;}.hljs-rainbow .tex .hljs-formula{background:#eee8d5;}","solarized_dark":".hljs-solarized_dark{}.hljs-solarized_dark .hljs{display:block;padding:0.5em;background:#002b36;color:#839496;}.hljs-solarized_dark .hljs-comment,.hljs-solarized_dark .hljs-template_comment,.hljs-solarized_dark .diff .hljs-header,.hljs-solarized_dark .hljs-doctype,.hljs-solarized_dark .hljs-pi,.hljs-solarized_dark .lisp .hljs-string,.hljs-solarized_dark .hljs-javadoc{color:#586e75;}.hljs-solarized_dark .hljs-keyword,.hljs-solarized_dark .hljs-winutils,.hljs-solarized_dark .method,.hljs-solarized_dark .hljs-addition,.hljs-solarized_dark .css .hljs-tag,.hljs-solarized_dark .hljs-request,.hljs-solarized_dark .hljs-status,.hljs-solarized_dark .nginx .hljs-title{color:#859900;}.hljs-solarized_dark .hljs-number,.hljs-solarized_dark .hljs-command,.hljs-solarized_dark .hljs-string,.hljs-solarized_dark .hljs-tag .hljs-value,.hljs-solarized_dark .hljs-rules .hljs-value,.hljs-solarized_dark .hljs-phpdoc,.hljs-solarized_dark .tex .hljs-formula,.hljs-solarized_dark .hljs-regexp,.hljs-solarized_dark .hljs-hexcolor,.hljs-solarized_dark .hljs-link_url{color:#2aa198;}.hljs-solarized_dark .hljs-title,.hljs-solarized_dark .hljs-localvars,.hljs-solarized_dark .hljs-chunk,.hljs-solarized_dark .hljs-decorator,.hljs-solarized_dark .hljs-built_in,.hljs-solarized_dark .hljs-identifier,.hljs-solarized_dark .vhdl .hljs-literal,.hljs-solarized_dark .hljs-id,.hljs-solarized_dark .css .hljs-function{color:#268bd2;}.hljs-solarized_dark .hljs-attribute,.hljs-solarized_dark .hljs-variable,.hljs-solarized_dark .lisp .hljs-body,.hljs-solarized_dark .smalltalk .hljs-number,.hljs-solarized_dark .hljs-constant,.hljs-solarized_dark .hljs-class .hljs-title,.hljs-solarized_dark .hljs-parent,.hljs-solarized_dark .haskell .hljs-type,.hljs-solarized_dark .hljs-link_reference{color:#b58900;}.hljs-solarized_dark .hljs-preprocessor,.hljs-solarized_dark .hljs-preprocessor .hljs-keyword,.hljs-solarized_dark .hljs-pragma,.hljs-solarized_dark .hljs-shebang,.hljs-solarized_dark .hljs-symbol,.hljs-solarized_dark .hljs-symbol .hljs-string,.hljs-solarized_dark .diff .hljs-change,.hljs-solarized_dark .hljs-special,.hljs-solarized_dark .hljs-attr_selector,.hljs-solarized_dark .hljs-subst,.hljs-solarized_dark .hljs-cdata,.hljs-solarized_dark .clojure .hljs-title,.hljs-solarized_dark .css .hljs-pseudo,.hljs-solarized_dark .hljs-header{color:#cb4b16;}.hljs-solarized_dark .hljs-deletion,.hljs-solarized_dark .hljs-important{color:#dc322f;}.hljs-solarized_dark .hljs-link_label{color:#6c71c4;}.hljs-solarized_dark .tex .hljs-formula{background:#073642;}","solarized_light":".hljs-solarized_light{}.hljs-solarized_light .hljs{display:block;padding:0.5em;background:#fdf6e3;color:#657b83;}.hljs-solarized_light .hljs-comment,.hljs-solarized_light .hljs-template_comment,.hljs-solarized_light .diff .hljs-header,.hljs-solarized_light .hljs-doctype,.hljs-solarized_light .hljs-pi,.hljs-solarized_light .lisp .hljs-string,.hljs-solarized_light .hljs-javadoc{color:#93a1a1;}.hljs-solarized_light .hljs-keyword,.hljs-solarized_light .hljs-winutils,.hljs-solarized_light .method,.hljs-solarized_light .hljs-addition,.hljs-solarized_light .css .hljs-tag,.hljs-solarized_light .hljs-request,.hljs-solarized_light .hljs-status,.hljs-solarized_light .nginx .hljs-title{color:#859900;}.hljs-solarized_light .hljs-number,.hljs-solarized_light .hljs-command,.hljs-solarized_light .hljs-string,.hljs-solarized_light .hljs-tag .hljs-value,.hljs-solarized_light .hljs-rules .hljs-value,.hljs-solarized_light .hljs-phpdoc,.hljs-solarized_light .tex .hljs-formula,.hljs-solarized_light .hljs-regexp,.hljs-solarized_light .hljs-hexcolor,.hljs-solarized_light .hljs-link_url{color:#2aa198;}.hljs-solarized_light .hljs-title,.hljs-solarized_light .hljs-localvars,.hljs-solarized_light .hljs-chunk,.hljs-solarized_light .hljs-decorator,.hljs-solarized_light .hljs-built_in,.hljs-solarized_light .hljs-identifier,.hljs-solarized_light .vhdl .hljs-literal,.hljs-solarized_light .hljs-id,.hljs-solarized_light .css .hljs-function{color:#268bd2;}.hljs-solarized_light .hljs-attribute,.hljs-solarized_light .hljs-variable,.hljs-solarized_light .lisp .hljs-body,.hljs-solarized_light .smalltalk .hljs-number,.hljs-solarized_light .hljs-constant,.hljs-solarized_light .hljs-class .hljs-title,.hljs-solarized_light .hljs-parent,.hljs-solarized_light .haskell .hljs-type,.hljs-solarized_light .hljs-link_reference{color:#b58900;}.hljs-solarized_light .hljs-preprocessor,.hljs-solarized_light .hljs-preprocessor .hljs-keyword,.hljs-solarized_light .hljs-pragma,.hljs-solarized_light .hljs-shebang,.hljs-solarized_light .hljs-symbol,.hljs-solarized_light .hljs-symbol .hljs-string,.hljs-solarized_light .diff .hljs-change,.hljs-solarized_light .hljs-special,.hljs-solarized_light .hljs-attr_selector,.hljs-solarized_light .hljs-subst,.hljs-solarized_light .hljs-cdata,.hljs-solarized_light .clojure .hljs-title,.hljs-solarized_light .css .hljs-pseudo,.hljs-solarized_light .hljs-header{color:#cb4b16;}.hljs-solarized_light .hljs-deletion,.hljs-solarized_light .hljs-important{color:#dc322f;}.hljs-solarized_light .hljs-link_label{color:#6c71c4;}.hljs-solarized_light .tex .hljs-formula{background:#eee8d5;}","sunburst":".hljs-sunburst{}.hljs-sunburst .hljs{display:block;padding:0.5em;background:#000;color:#f8f8f8;}.hljs-sunburst .hljs-comment,.hljs-sunburst .hljs-template_comment,.hljs-sunburst .hljs-javadoc{color:#aeaeae;font-style:italic;}.hljs-sunburst .hljs-keyword,.hljs-sunburst .ruby .hljs-function .hljs-keyword,.hljs-sunburst .hljs-request,.hljs-sunburst .hljs-status,.hljs-sunburst .nginx .hljs-title{color:#e28964;}.hljs-sunburst .hljs-function .hljs-keyword,.hljs-sunburst .hljs-sub .hljs-keyword,.hljs-sunburst .method,.hljs-sunburst .hljs-list .hljs-title{color:#99cf50;}.hljs-sunburst .hljs-string,.hljs-sunburst .hljs-tag .hljs-value,.hljs-sunburst .hljs-cdata,.hljs-sunburst .hljs-filter .hljs-argument,.hljs-sunburst .hljs-attr_selector,.hljs-sunburst .apache .hljs-cbracket,.hljs-sunburst .hljs-date,.hljs-sunburst .tex .hljs-command,.hljs-sunburst .coffeescript .hljs-attribute{color:#65b042;}.hljs-sunburst .hljs-subst{color:#daefa3;}.hljs-sunburst .hljs-regexp{color:#e9c062;}.hljs-sunburst .hljs-title,.hljs-sunburst .hljs-sub .hljs-identifier,.hljs-sunburst .hljs-pi,.hljs-sunburst .hljs-tag,.hljs-sunburst .hljs-tag .hljs-keyword,.hljs-sunburst .hljs-decorator,.hljs-sunburst .hljs-shebang,.hljs-sunburst .hljs-prompt{color:#89bdff;}.hljs-sunburst .hljs-class .hljs-title,.hljs-sunburst .haskell .hljs-type,.hljs-sunburst .smalltalk .hljs-class,.hljs-sunburst .hljs-javadoctag,.hljs-sunburst .hljs-yardoctag,.hljs-sunburst .hljs-phpdoc{text-decoration:underline;}.hljs-sunburst .hljs-symbol,.hljs-sunburst .ruby .hljs-symbol .hljs-string,.hljs-sunburst .hljs-number{color:#3387cc;}.hljs-sunburst .hljs-params,.hljs-sunburst .hljs-variable,.hljs-sunburst .clojure .hljs-attribute{color:#3e87e3;}.hljs-sunburst .css .hljs-tag,.hljs-sunburst .hljs-rules .hljs-property,.hljs-sunburst .hljs-pseudo,.hljs-sunburst .tex .hljs-special{color:#cda869;}.hljs-sunburst .css .hljs-class{color:#9b703f;}.hljs-sunburst .hljs-rules .hljs-keyword{color:#c5af75;}.hljs-sunburst .hljs-rules .hljs-value{color:#cf6a4c;}.hljs-sunburst .css .hljs-id{color:#8b98ab;}.hljs-sunburst .hljs-annotation,.hljs-sunburst .apache .hljs-sqbracket,.hljs-sunburst .nginx .hljs-built_in{color:#9b859d;}.hljs-sunburst .hljs-preprocessor,.hljs-sunburst .hljs-pragma{color:#8996a8;}.hljs-sunburst .hljs-hexcolor,.hljs-sunburst .css .hljs-value .hljs-number{color:#dd7b3b;}.hljs-sunburst .css .hljs-function{color:#dad085;}.hljs-sunburst .diff .hljs-header,.hljs-sunburst .hljs-chunk,.hljs-sunburst .tex .hljs-formula{background-color:#0e2231;color:#f8f8f8;font-style:italic;}.hljs-sunburst .diff .hljs-change{background-color:#4a410d;color:#f8f8f8;}.hljs-sunburst .hljs-addition{background-color:#253b22;color:#f8f8f8;}.hljs-sunburst .hljs-deletion{background-color:#420e09;color:#f8f8f8;}.hljs-sunburst .coffeescript .javascript,.hljs-sunburst .javascript .xml,.hljs-sunburst .tex .hljs-formula,.hljs-sunburst .xml .javascript,.hljs-sunburst .xml .vbscript,.hljs-sunburst .xml .css,.hljs-sunburst .xml .hljs-cdata{opacity:0.5;}","tomorrow-night-blue":".hljs-tomorrow-night-blue{}.hljs-tomorrow-night-blue .hljs-comment,.hljs-tomorrow-night-blue .hljs-title{color:#7285b7;}.hljs-tomorrow-night-blue .hljs-variable,.hljs-tomorrow-night-blue .hljs-attribute,.hljs-tomorrow-night-blue .hljs-tag,.hljs-tomorrow-night-blue .hljs-regexp,.hljs-tomorrow-night-blue .ruby .hljs-constant,.hljs-tomorrow-night-blue .xml .hljs-tag .hljs-title,.hljs-tomorrow-night-blue .xml .hljs-pi,.hljs-tomorrow-night-blue .xml .hljs-doctype,.hljs-tomorrow-night-blue .html .hljs-doctype,.hljs-tomorrow-night-blue .css .hljs-id,.hljs-tomorrow-night-blue .css .hljs-class,.hljs-tomorrow-night-blue .css .hljs-pseudo{color:#ff9da4;}.hljs-tomorrow-night-blue .hljs-number,.hljs-tomorrow-night-blue .hljs-preprocessor,.hljs-tomorrow-night-blue .hljs-pragma,.hljs-tomorrow-night-blue .hljs-built_in,.hljs-tomorrow-night-blue .hljs-literal,.hljs-tomorrow-night-blue .hljs-params,.hljs-tomorrow-night-blue .hljs-constant{color:#ffc58f;}.hljs-tomorrow-night-blue .ruby .hljs-class .hljs-title,.hljs-tomorrow-night-blue .css .hljs-rules .hljs-attribute{color:#ffeead;}.hljs-tomorrow-night-blue .hljs-string,.hljs-tomorrow-night-blue .hljs-value,.hljs-tomorrow-night-blue .hljs-inheritance,.hljs-tomorrow-night-blue .hljs-header,.hljs-tomorrow-night-blue .ruby .hljs-symbol,.hljs-tomorrow-night-blue .xml .hljs-cdata{color:#d1f1a9;}.hljs-tomorrow-night-blue .css .hljs-hexcolor{color:#99ffff;}.hljs-tomorrow-night-blue .hljs-function,.hljs-tomorrow-night-blue .python .hljs-decorator,.hljs-tomorrow-night-blue .python .hljs-title,.hljs-tomorrow-night-blue .ruby .hljs-function .hljs-title,.hljs-tomorrow-night-blue .ruby .hljs-title .hljs-keyword,.hljs-tomorrow-night-blue .perl .hljs-sub,.hljs-tomorrow-night-blue .javascript .hljs-title,.hljs-tomorrow-night-blue .coffeescript .hljs-title{color:#bbdaff;}.hljs-tomorrow-night-blue .hljs-keyword,.hljs-tomorrow-night-blue .javascript .hljs-function{color:#ebbbff;}.hljs-tomorrow-night-blue .hljs{display:block;background:#002451;color:white;padding:0.5em;}.hljs-tomorrow-night-blue .coffeescript .javascript,.hljs-tomorrow-night-blue .javascript .xml,.hljs-tomorrow-night-blue .tex .hljs-formula,.hljs-tomorrow-night-blue .xml .javascript,.hljs-tomorrow-night-blue .xml .vbscript,.hljs-tomorrow-night-blue .xml .css,.hljs-tomorrow-night-blue .xml .hljs-cdata{opacity:0.5;}","tomorrow-night-bright":".hljs-tomorrow-night-bright{}.hljs-tomorrow-night-bright .hljs-comment,.hljs-tomorrow-night-bright .hljs-title{color:#969896;}.hljs-tomorrow-night-bright .hljs-variable,.hljs-tomorrow-night-bright .hljs-attribute,.hljs-tomorrow-night-bright .hljs-tag,.hljs-tomorrow-night-bright .hljs-regexp,.hljs-tomorrow-night-bright .ruby .hljs-constant,.hljs-tomorrow-night-bright .xml .hljs-tag .hljs-title,.hljs-tomorrow-night-bright .xml .hljs-pi,.hljs-tomorrow-night-bright .xml .hljs-doctype,.hljs-tomorrow-night-bright .html .hljs-doctype,.hljs-tomorrow-night-bright .css .hljs-id,.hljs-tomorrow-night-bright .css .hljs-class,.hljs-tomorrow-night-bright .css .hljs-pseudo{color:#d54e53;}.hljs-tomorrow-night-bright .hljs-number,.hljs-tomorrow-night-bright .hljs-preprocessor,.hljs-tomorrow-night-bright .hljs-pragma,.hljs-tomorrow-night-bright .hljs-built_in,.hljs-tomorrow-night-bright .hljs-literal,.hljs-tomorrow-night-bright .hljs-params,.hljs-tomorrow-night-bright .hljs-constant{color:#e78c45;}.hljs-tomorrow-night-bright .ruby .hljs-class .hljs-title,.hljs-tomorrow-night-bright .css .hljs-rules .hljs-attribute{color:#e7c547;}.hljs-tomorrow-night-bright .hljs-string,.hljs-tomorrow-night-bright .hljs-value,.hljs-tomorrow-night-bright .hljs-inheritance,.hljs-tomorrow-night-bright .hljs-header,.hljs-tomorrow-night-bright .ruby .hljs-symbol,.hljs-tomorrow-night-bright .xml .hljs-cdata{color:#b9ca4a;}.hljs-tomorrow-night-bright .css .hljs-hexcolor{color:#70c0b1;}.hljs-tomorrow-night-bright .hljs-function,.hljs-tomorrow-night-bright .python .hljs-decorator,.hljs-tomorrow-night-bright .python .hljs-title,.hljs-tomorrow-night-bright .ruby .hljs-function .hljs-title,.hljs-tomorrow-night-bright .ruby .hljs-title .hljs-keyword,.hljs-tomorrow-night-bright .perl .hljs-sub,.hljs-tomorrow-night-bright .javascript .hljs-title,.hljs-tomorrow-night-bright .coffeescript .hljs-title{color:#7aa6da;}.hljs-tomorrow-night-bright .hljs-keyword,.hljs-tomorrow-night-bright .javascript .hljs-function{color:#c397d8;}.hljs-tomorrow-night-bright .hljs{display:block;background:black;color:#eaeaea;padding:0.5em;}.hljs-tomorrow-night-bright .coffeescript .javascript,.hljs-tomorrow-night-bright .javascript .xml,.hljs-tomorrow-night-bright .tex .hljs-formula,.hljs-tomorrow-night-bright .xml .javascript,.hljs-tomorrow-night-bright .xml .vbscript,.hljs-tomorrow-night-bright .xml .css,.hljs-tomorrow-night-bright .xml .hljs-cdata{opacity:0.5;}","tomorrow-night-eighties":".hljs-tomorrow-night-eighties{}.hljs-tomorrow-night-eighties .hljs-comment,.hljs-tomorrow-night-eighties .hljs-title{color:#999999;}.hljs-tomorrow-night-eighties .hljs-variable,.hljs-tomorrow-night-eighties .hljs-attribute,.hljs-tomorrow-night-eighties .hljs-tag,.hljs-tomorrow-night-eighties .hljs-regexp,.hljs-tomorrow-night-eighties .ruby .hljs-constant,.hljs-tomorrow-night-eighties .xml .hljs-tag .hljs-title,.hljs-tomorrow-night-eighties .xml .hljs-pi,.hljs-tomorrow-night-eighties .xml .hljs-doctype,.hljs-tomorrow-night-eighties .html .hljs-doctype,.hljs-tomorrow-night-eighties .css .hljs-id,.hljs-tomorrow-night-eighties .css .hljs-class,.hljs-tomorrow-night-eighties .css .hljs-pseudo{color:#f2777a;}.hljs-tomorrow-night-eighties .hljs-number,.hljs-tomorrow-night-eighties .hljs-preprocessor,.hljs-tomorrow-night-eighties .hljs-pragma,.hljs-tomorrow-night-eighties .hljs-built_in,.hljs-tomorrow-night-eighties .hljs-literal,.hljs-tomorrow-night-eighties .hljs-params,.hljs-tomorrow-night-eighties .hljs-constant{color:#f99157;}.hljs-tomorrow-night-eighties .ruby .hljs-class .hljs-title,.hljs-tomorrow-night-eighties .css .hljs-rules .hljs-attribute{color:#ffcc66;}.hljs-tomorrow-night-eighties .hljs-string,.hljs-tomorrow-night-eighties .hljs-value,.hljs-tomorrow-night-eighties .hljs-inheritance,.hljs-tomorrow-night-eighties .hljs-header,.hljs-tomorrow-night-eighties .ruby .hljs-symbol,.hljs-tomorrow-night-eighties .xml .hljs-cdata{color:#99cc99;}.hljs-tomorrow-night-eighties .css .hljs-hexcolor{color:#66cccc;}.hljs-tomorrow-night-eighties .hljs-function,.hljs-tomorrow-night-eighties .python .hljs-decorator,.hljs-tomorrow-night-eighties .python .hljs-title,.hljs-tomorrow-night-eighties .ruby .hljs-function .hljs-title,.hljs-tomorrow-night-eighties .ruby .hljs-title .hljs-keyword,.hljs-tomorrow-night-eighties .perl .hljs-sub,.hljs-tomorrow-night-eighties .javascript .hljs-title,.hljs-tomorrow-night-eighties .coffeescript .hljs-title{color:#6699cc;}.hljs-tomorrow-night-eighties .hljs-keyword,.hljs-tomorrow-night-eighties .javascript .hljs-function{color:#cc99cc;}.hljs-tomorrow-night-eighties .hljs{display:block;background:#2d2d2d;color:#cccccc;padding:0.5em;}.hljs-tomorrow-night-eighties .coffeescript .javascript,.hljs-tomorrow-night-eighties .javascript .xml,.hljs-tomorrow-night-eighties .tex .hljs-formula,.hljs-tomorrow-night-eighties .xml .javascript,.hljs-tomorrow-night-eighties .xml .vbscript,.hljs-tomorrow-night-eighties .xml .css,.hljs-tomorrow-night-eighties .xml .hljs-cdata{opacity:0.5;}","tomorrow-night":".hljs-tomorrow-night{}.hljs-tomorrow-night .hljs-comment,.hljs-tomorrow-night .hljs-title{color:#969896;}.hljs-tomorrow-night .hljs-variable,.hljs-tomorrow-night .hljs-attribute,.hljs-tomorrow-night .hljs-tag,.hljs-tomorrow-night .hljs-regexp,.hljs-tomorrow-night .ruby .hljs-constant,.hljs-tomorrow-night .xml .hljs-tag .hljs-title,.hljs-tomorrow-night .xml .hljs-pi,.hljs-tomorrow-night .xml .hljs-doctype,.hljs-tomorrow-night .html .hljs-doctype,.hljs-tomorrow-night .css .hljs-id,.hljs-tomorrow-night .css .hljs-class,.hljs-tomorrow-night .css .hljs-pseudo{color:#cc6666;}.hljs-tomorrow-night .hljs-number,.hljs-tomorrow-night .hljs-preprocessor,.hljs-tomorrow-night .hljs-pragma,.hljs-tomorrow-night .hljs-built_in,.hljs-tomorrow-night .hljs-literal,.hljs-tomorrow-night .hljs-params,.hljs-tomorrow-night .hljs-constant{color:#de935f;}.hljs-tomorrow-night .ruby .hljs-class .hljs-title,.hljs-tomorrow-night .css .hljs-rules .hljs-attribute{color:#f0c674;}.hljs-tomorrow-night .hljs-string,.hljs-tomorrow-night .hljs-value,.hljs-tomorrow-night .hljs-inheritance,.hljs-tomorrow-night .hljs-header,.hljs-tomorrow-night .ruby .hljs-symbol,.hljs-tomorrow-night .xml .hljs-cdata{color:#b5bd68;}.hljs-tomorrow-night .css .hljs-hexcolor{color:#8abeb7;}.hljs-tomorrow-night .hljs-function,.hljs-tomorrow-night .python .hljs-decorator,.hljs-tomorrow-night .python .hljs-title,.hljs-tomorrow-night .ruby .hljs-function .hljs-title,.hljs-tomorrow-night .ruby .hljs-title .hljs-keyword,.hljs-tomorrow-night .perl .hljs-sub,.hljs-tomorrow-night .javascript .hljs-title,.hljs-tomorrow-night .coffeescript .hljs-title{color:#81a2be;}.hljs-tomorrow-night .hljs-keyword,.hljs-tomorrow-night .javascript .hljs-function{color:#b294bb;}.hljs-tomorrow-night .hljs{display:block;background:#1d1f21;color:#c5c8c6;padding:0.5em;}.hljs-tomorrow-night .coffeescript .javascript,.hljs-tomorrow-night .javascript .xml,.hljs-tomorrow-night .tex .hljs-formula,.hljs-tomorrow-night .xml .javascript,.hljs-tomorrow-night .xml .vbscript,.hljs-tomorrow-night .xml .css,.hljs-tomorrow-night .xml .hljs-cdata{opacity:0.5;}","tomorrow":".hljs-tomorrow{}.hljs-tomorrow .hljs-comment,.hljs-tomorrow .hljs-title{color:#8e908c;}.hljs-tomorrow .hljs-variable,.hljs-tomorrow .hljs-attribute,.hljs-tomorrow .hljs-tag,.hljs-tomorrow .hljs-regexp,.hljs-tomorrow .ruby .hljs-constant,.hljs-tomorrow .xml .hljs-tag .hljs-title,.hljs-tomorrow .xml .hljs-pi,.hljs-tomorrow .xml .hljs-doctype,.hljs-tomorrow .html .hljs-doctype,.hljs-tomorrow .css .hljs-id,.hljs-tomorrow .css .hljs-class,.hljs-tomorrow .css .hljs-pseudo{color:#c82829;}.hljs-tomorrow .hljs-number,.hljs-tomorrow .hljs-preprocessor,.hljs-tomorrow .hljs-pragma,.hljs-tomorrow .hljs-built_in,.hljs-tomorrow .hljs-literal,.hljs-tomorrow .hljs-params,.hljs-tomorrow .hljs-constant{color:#f5871f;}.hljs-tomorrow .ruby .hljs-class .hljs-title,.hljs-tomorrow .css .hljs-rules .hljs-attribute{color:#eab700;}.hljs-tomorrow .hljs-string,.hljs-tomorrow .hljs-value,.hljs-tomorrow .hljs-inheritance,.hljs-tomorrow .hljs-header,.hljs-tomorrow .ruby .hljs-symbol,.hljs-tomorrow .xml .hljs-cdata{color:#718c00;}.hljs-tomorrow .css .hljs-hexcolor{color:#3e999f;}.hljs-tomorrow .hljs-function,.hljs-tomorrow .python .hljs-decorator,.hljs-tomorrow .python .hljs-title,.hljs-tomorrow .ruby .hljs-function .hljs-title,.hljs-tomorrow .ruby .hljs-title .hljs-keyword,.hljs-tomorrow .perl .hljs-sub,.hljs-tomorrow .javascript .hljs-title,.hljs-tomorrow .coffeescript .hljs-title{color:#4271ae;}.hljs-tomorrow .hljs-keyword,.hljs-tomorrow .javascript .hljs-function{color:#8959a8;}.hljs-tomorrow .hljs{display:block;background:white;color:#4d4d4c;padding:0.5em;}.hljs-tomorrow .coffeescript .javascript,.hljs-tomorrow .javascript .xml,.hljs-tomorrow .tex .hljs-formula,.hljs-tomorrow .xml .javascript,.hljs-tomorrow .xml .vbscript,.hljs-tomorrow .xml .css,.hljs-tomorrow .xml .hljs-cdata{opacity:0.5;}","vs":".hljs-vs{}.hljs-vs .hljs{display:block;padding:0.5em;background:white;color:black;}.hljs-vs .hljs-comment,.hljs-vs .hljs-annotation,.hljs-vs .hljs-template_comment,.hljs-vs .diff .hljs-header,.hljs-vs .hljs-chunk,.hljs-vs .apache .hljs-cbracket{color:#008000;}.hljs-vs .hljs-keyword,.hljs-vs .hljs-id,.hljs-vs .hljs-built_in,.hljs-vs .css .smalltalk .hljs-class,.hljs-vs .hljs-winutils,.hljs-vs .bash .hljs-variable,.hljs-vs .tex .hljs-command,.hljs-vs .hljs-request,.hljs-vs .hljs-status,.hljs-vs .nginx .hljs-title,.hljs-vs .xml .hljs-tag,.hljs-vs .xml .hljs-tag .hljs-value{color:#00f;}.hljs-vs .hljs-string,.hljs-vs .hljs-title,.hljs-vs .hljs-parent,.hljs-vs .hljs-tag .hljs-value,.hljs-vs .hljs-rules .hljs-value,.hljs-vs .ruby .hljs-symbol,.hljs-vs .ruby .hljs-symbol .hljs-string,.hljs-vs .hljs-template_tag,.hljs-vs .django .hljs-variable,.hljs-vs .hljs-addition,.hljs-vs .hljs-flow,.hljs-vs .hljs-stream,.hljs-vs .apache .hljs-tag,.hljs-vs .hljs-date,.hljs-vs .tex .hljs-formula,.hljs-vs .coffeescript .hljs-attribute{color:#a31515;}.hljs-vs .ruby .hljs-string,.hljs-vs .hljs-decorator,.hljs-vs .hljs-filter .hljs-argument,.hljs-vs .hljs-localvars,.hljs-vs .hljs-array,.hljs-vs .hljs-attr_selector,.hljs-vs .hljs-pseudo,.hljs-vs .hljs-pi,.hljs-vs .hljs-doctype,.hljs-vs .hljs-deletion,.hljs-vs .hljs-envvar,.hljs-vs .hljs-shebang,.hljs-vs .hljs-preprocessor,.hljs-vs .hljs-pragma,.hljs-vs .userType,.hljs-vs .apache .hljs-sqbracket,.hljs-vs .nginx .hljs-built_in,.hljs-vs .tex .hljs-special,.hljs-vs .hljs-prompt{color:#2b91af;}.hljs-vs .hljs-phpdoc,.hljs-vs .hljs-javadoc,.hljs-vs .hljs-xmlDocTag{color:#808080;}.hljs-vs .vhdl .hljs-typename{font-weight:bold;}.hljs-vs .vhdl .hljs-string{color:#666666;}.hljs-vs .vhdl .hljs-literal{color:#a31515;}.hljs-vs .vhdl .hljs-attribute{color:#00b0e8;}.hljs-vs .xml .hljs-attribute{color:#f00;}","xcode":".hljs-xcode{}.hljs-xcode .hljs{display:block;padding:0.5em;background:#fff;color:black;}.hljs-xcode .hljs-comment,.hljs-xcode .hljs-template_comment,.hljs-xcode .hljs-javadoc{color:#006a00;}.hljs-xcode .hljs-keyword,.hljs-xcode .hljs-literal,.hljs-xcode .nginx .hljs-title{color:#aa0d91;}.hljs-xcode .method,.hljs-xcode .hljs-list .hljs-title,.hljs-xcode .hljs-tag .hljs-title,.hljs-xcode .setting .hljs-value,.hljs-xcode .hljs-winutils,.hljs-xcode .tex .hljs-command,.hljs-xcode .http .hljs-title,.hljs-xcode .hljs-request,.hljs-xcode .hljs-status{color:#008;}.hljs-xcode .hljs-envvar,.hljs-xcode .tex .hljs-special{color:#660;}.hljs-xcode .hljs-string{color:#c41a16;}.hljs-xcode .hljs-tag .hljs-value,.hljs-xcode .hljs-cdata,.hljs-xcode .hljs-filter .hljs-argument,.hljs-xcode .hljs-attr_selector,.hljs-xcode .apache .hljs-cbracket,.hljs-xcode .hljs-date,.hljs-xcode .hljs-regexp{color:#080;}.hljs-xcode .hljs-sub .hljs-identifier,.hljs-xcode .hljs-pi,.hljs-xcode .hljs-tag,.hljs-xcode .hljs-tag .hljs-keyword,.hljs-xcode .hljs-decorator,.hljs-xcode .ini .hljs-title,.hljs-xcode .hljs-shebang,.hljs-xcode .hljs-prompt,.hljs-xcode .hljs-hexcolor,.hljs-xcode .hljs-rules .hljs-value,.hljs-xcode .hljs-symbol,.hljs-xcode .hljs-symbol .hljs-string,.hljs-xcode .hljs-number,.hljs-xcode .css .hljs-function,.hljs-xcode .clojure .hljs-title,.hljs-xcode .clojure .hljs-built_in,.hljs-xcode .hljs-function .hljs-title,.hljs-xcode .coffeescript .hljs-attribute{color:#1c00cf;}.hljs-xcode .hljs-class .hljs-title,.hljs-xcode .haskell .hljs-type,.hljs-xcode .smalltalk .hljs-class,.hljs-xcode .hljs-javadoctag,.hljs-xcode .hljs-yardoctag,.hljs-xcode .hljs-phpdoc,.hljs-xcode .hljs-typename,.hljs-xcode .hljs-tag .hljs-attribute,.hljs-xcode .hljs-doctype,.hljs-xcode .hljs-class .hljs-id,.hljs-xcode .hljs-built_in,.hljs-xcode .setting,.hljs-xcode .hljs-params,.hljs-xcode .clojure .hljs-attribute{color:#5c2699;}.hljs-xcode .hljs-variable{color:#3f6e74;}.hljs-xcode .css .hljs-tag,.hljs-xcode .hljs-rules .hljs-property,.hljs-xcode .hljs-pseudo,.hljs-xcode .hljs-subst{color:#000;}.hljs-xcode .css .hljs-class,.hljs-xcode .css .hljs-id{color:#9b703f;}.hljs-xcode .hljs-value .hljs-important{color:#ff7700;font-weight:bold;}.hljs-xcode .hljs-rules .hljs-keyword{color:#c5af75;}.hljs-xcode .hljs-annotation,.hljs-xcode .apache .hljs-sqbracket,.hljs-xcode .nginx .hljs-built_in{color:#9b859d;}.hljs-xcode .hljs-preprocessor,.hljs-xcode .hljs-preprocessor *,.hljs-xcode .hljs-pragma{color:#643820;}.hljs-xcode .tex .hljs-formula{background-color:#eee;font-style:italic;}.hljs-xcode .diff .hljs-header,.hljs-xcode .hljs-chunk{color:#808080;font-weight:bold;}.hljs-xcode .diff .hljs-change{background-color:#bccff9;}.hljs-xcode .hljs-addition{background-color:#baeeba;}.hljs-xcode .hljs-deletion{background-color:#ffc8bd;}.hljs-xcode .hljs-comment .hljs-yardoctag{font-weight:bold;}.hljs-xcode .method .hljs-id{color:#000;}","zenburn":".hljs-zenburn{}.hljs-zenburn .hljs{display:block;padding:0.5em;background:#3f3f3f;color:#dcdcdc;}.hljs-zenburn .hljs-keyword,.hljs-zenburn .hljs-tag,.hljs-zenburn .css .hljs-class,.hljs-zenburn .css .hljs-id,.hljs-zenburn .lisp .hljs-title,.hljs-zenburn .nginx .hljs-title,.hljs-zenburn .hljs-request,.hljs-zenburn .hljs-status,.hljs-zenburn .clojure .hljs-attribute{color:#e3ceab;}.hljs-zenburn .django .hljs-template_tag,.hljs-zenburn .django .hljs-variable,.hljs-zenburn .django .hljs-filter .hljs-argument{color:#dcdcdc;}.hljs-zenburn .hljs-number,.hljs-zenburn .hljs-date{color:#8cd0d3;}.hljs-zenburn .dos .hljs-envvar,.hljs-zenburn .dos .hljs-stream,.hljs-zenburn .hljs-variable,.hljs-zenburn .apache .hljs-sqbracket{color:#efdcbc;}.hljs-zenburn .dos .hljs-flow,.hljs-zenburn .diff .hljs-change,.hljs-zenburn .python .exception,.hljs-zenburn .python .hljs-built_in,.hljs-zenburn .hljs-literal,.hljs-zenburn .tex .hljs-special{color:#efefaf;}.hljs-zenburn .diff .hljs-chunk,.hljs-zenburn .hljs-subst{color:#8f8f8f;}.hljs-zenburn .dos .hljs-keyword,.hljs-zenburn .python .hljs-decorator,.hljs-zenburn .hljs-title,.hljs-zenburn .haskell .hljs-type,.hljs-zenburn .diff .hljs-header,.hljs-zenburn .ruby .hljs-class .hljs-parent,.hljs-zenburn .apache .hljs-tag,.hljs-zenburn .nginx .hljs-built_in,.hljs-zenburn .tex .hljs-command,.hljs-zenburn .hljs-prompt{color:#efef8f;}.hljs-zenburn .dos .hljs-winutils,.hljs-zenburn .ruby .hljs-symbol,.hljs-zenburn .ruby .hljs-symbol .hljs-string,.hljs-zenburn .ruby .hljs-string{color:#dca3a3;}.hljs-zenburn .diff .hljs-deletion,.hljs-zenburn .hljs-string,.hljs-zenburn .hljs-tag .hljs-value,.hljs-zenburn .hljs-preprocessor,.hljs-zenburn .hljs-pragma,.hljs-zenburn .hljs-built_in,.hljs-zenburn .hljs-javadoc,.hljs-zenburn .smalltalk .hljs-class,.hljs-zenburn .smalltalk .hljs-localvars,.hljs-zenburn .smalltalk .hljs-array,.hljs-zenburn .css .hljs-rules .hljs-value,.hljs-zenburn .hljs-attr_selector,.hljs-zenburn .hljs-pseudo,.hljs-zenburn .apache .hljs-cbracket,.hljs-zenburn .tex .hljs-formula,.hljs-zenburn .coffeescript .hljs-attribute{color:#cc9393;}.hljs-zenburn .hljs-shebang,.hljs-zenburn .diff .hljs-addition,.hljs-zenburn .hljs-comment,.hljs-zenburn .java .hljs-annotation,.hljs-zenburn .hljs-template_comment,.hljs-zenburn .hljs-pi,.hljs-zenburn .hljs-doctype{color:#7f9f7f;}.hljs-zenburn .coffeescript .javascript,.hljs-zenburn .javascript .xml,.hljs-zenburn .tex .hljs-formula,.hljs-zenburn .xml .javascript,.hljs-zenburn .xml .vbscript,.hljs-zenburn .xml .css,.hljs-zenburn .xml .hljs-cdata{opacity:0.5;}"},
  engine: hljs
};

})()
},{}],8:[function(require,module,exports){
exports.addClass = function (element, className) {
  element.className = exports.getClasses(element)
    .concat([className])
    .join(' ');
};

exports.removeClass = function (element, className) {
  element.className = exports.getClasses(element)
    .filter(function (klass) { return klass !== className; })
    .join(' ');
};

exports.toggleClass = function (element, className) {
  var classes = exports.getClasses(element),
      index = classes.indexOf(className);

  if (index !== -1) {
    classes.splice(index, 1);
  }
  else {
    classes.push(className);
  }

  element.className = classes.join(' ');
};

exports.getClasses = function (element) {
  return element.className
    .split(' ')
    .filter(function (s) { return s !== ''; });
};

exports.hasClass = function (element, className) {
  return exports.getClasses(element).indexOf(className) !== -1;
};

exports.getPrefixedProperty = function (element, propertyName) {
  var capitalizedPropertName = propertyName[0].toUpperCase() +
    propertyName.slice(1);

  return element[propertyName] || element['moz' + capitalizedPropertName] ||
    element['webkit' + capitalizedPropertName];
};

},{}],4:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter
  , highlighter = require('./highlighter')
  , converter = require('./converter')
  , Parser = require('./parser')
  , Slideshow = require('./models/slideshow')
  , SlideshowView = require('./views/slideshowView')
  , DefaultController = require('./controllers/defaultController')
  , Dom = require('./dom')
  , macros = require('./macros')
  ;

module.exports = Api;

function Api (dom) {
  this.dom = dom || new Dom();
  this.macros = macros;
}

// Expose highlighter to allow enumerating available styles and
// including external language grammars
Api.prototype.highlighter = highlighter;

Api.prototype.convert = function (markdown) {
  var parser = new Parser()
    , content = parser.parse(markdown || '', macros)[0].content
    ;

  return converter.convertMarkdown(content, {}, true);
};

// Creates slideshow initialized from options
Api.prototype.create = function (options) {
  var events
    , slideshow
    , slideshowView
    , controller
    ;

  options = applyDefaults(this.dom, options);

  events = new EventEmitter();
  events.setMaxListeners(0);

  slideshow = new Slideshow(events, options);
  slideshowView = new SlideshowView(events, this.dom, options.container, slideshow);
  controller = options.controller || new DefaultController(events, this.dom, slideshowView, options.navigation);

  return slideshow;
};

function applyDefaults (dom, options) {
  var sourceElement;

  options = options || {};

  if (options.hasOwnProperty('sourceUrl')) {
    var req = new dom.XMLHttpRequest();
    req.open('GET', options.sourceUrl, false);
    req.send();
    options.source = req.responseText.replace(/\r\n/g, '\n');
  }
  else if (!options.hasOwnProperty('source')) {
    sourceElement = dom.getElementById('source');
    if (sourceElement) {
      options.source = unescape(sourceElement.innerHTML);
      sourceElement.style.display = 'none';
    }
  }

  if (!(options.container instanceof window.HTMLElement)) {
    options.container = dom.getBodyElement();
  }

  return options;
}

function unescape (source) {
  source = source.replace(/&[l|g]t;/g,
    function (match) {
      return match === '&lt;' ? '<' : '>';
    });

  source = source.replace(/&amp;/g, '&');
  source = source.replace(/&quot;/g, '"');

  return source;
}

},{"events":1,"./highlighter":7,"./converter":9,"./parser":10,"./dom":11,"./controllers/defaultController":12,"./views/slideshowView":13,"./models/slideshow":14,"./macros":15}],11:[function(require,module,exports){
module.exports = Dom;

function Dom () { }

Dom.prototype.XMLHttpRequest = XMLHttpRequest;

Dom.prototype.getHTMLElement = function () {
  return document.getElementsByTagName('html')[0];
};

Dom.prototype.getBodyElement = function () {
  return document.body;
};

Dom.prototype.getElementById = function (id) {
  return document.getElementById(id);
};

Dom.prototype.getLocationHash = function () {
  return window.location.hash;
};

Dom.prototype.setLocationHash = function (hash) {
  if (typeof window.history.replaceState === 'function') {
    window.history.replaceState(undefined, undefined, hash);
  }
  else {
    window.location.hash = hash;
  }
};

},{}],15:[function(require,module,exports){
var macros = module.exports = {};

macros.hello = function () {
  return 'hello!';
};

},{}],10:[function(require,module,exports){
(function(){var Lexer = require('./lexer');

module.exports = Parser;

function Parser () { }

/*
 *  Parses source string into list of slides.
 *
 *  Output format:
 *
 *  [
 *    // Per slide
 *    {
 *      // Properties
 *      properties: {
 *        name: 'value'
 *      },
 *      // Notes (optional, same format as content list)
 *      notes: [...],
 *      // Link definitions
 *      links: {
 *        id: { href: 'url', title: 'optional title' },
 *        ...
 *      ],
 *      content: [
 *        // Any content but content classes are represented as strings
 *        'plain text ',
 *        // Content classes are represented as objects
 *        { block: false, class: 'the-class', content: [...] },
 *        { block: true, class: 'the-class', content: [...] },
 *        ...
 *      ]
 *    },
 *    ...
 *  ]
 */
Parser.prototype.parse = function (src, macros) {
  var self = this,
      lexer = new Lexer(),
      tokens = lexer.lex(cleanInput(src)),
      slides = [],

      // The last item on the stack contains the current slide or
      // content class we're currently appending content to.
      stack = [createSlide()];

  macros = macros || {};

  tokens.forEach(function (token) {
    switch (token.type) {
      case 'text':
      case 'code':
      case 'fences':
        // Text, code and fenced code tokens are appended to their
        // respective parents as string literals, and are only included
        // in the parse process in order to reason about structure
        // (like ignoring a slide separator inside fenced code).
        appendTo(stack[stack.length - 1], token.text);
        break;
      case 'def':
        // Link definition
        stack[0].links[token.id] = {
          href: token.href,
          title: token.title
        };
        break;
      case 'macro':
        // Macro
        var macro = macros[token.name];
        if (typeof macro !== 'function') {
          throw new Error('Macro "' + token.name + '" not found. ' +
              'You need to define macro using remark.macros[\'' +
              token.name + '\'] = function () { ... };');
        }
        var value = macro.apply(token.obj, token.args);
        if (typeof value === 'string') {
          value = self.parse(value, macros);
          appendTo(stack[stack.length - 1], value[0].content[0]);
        }
        else {
          appendTo(stack[stack.length - 1], value === undefined ?
              '' : value.toString());
        }
        break;
      case 'content_start':
        // Entering content class, so create stack entry for appending
        // upcoming content to.
        //
        // Lexer handles open/close bracket balance, so there's no need
        // to worry about there being a matching closing bracket.
        stack.push(createContentClass(token));
        break;
      case 'content_end':
        // Exiting content class, so remove entry from stack and
        // append to previous item (outer content class or slide).
        appendTo(stack[stack.length - 2], stack[stack.length - 1]);
        stack.pop();
        break;
      case 'separator':
        // Slide separator (--- or --), so add current slide to list of
        // slides and re-initialize stack with new, blank slide.
        slides.push(stack[0]);
        stack = [createSlide()];
        // Tag the new slide as a continued slide if the separator
        // used was -- instead of --- (2 vs. 3 dashes).
        stack[0].properties.continued = (token.text === '--').toString();
        break;
      case 'notes_separator':
        // Notes separator (???), so create empty content list on slide
        // in which all remaining slide content will be put.
        stack[0].notes = [];
        break;
    }
  });

  // Push current slide to list of slides.
  slides.push(stack[0]);

  slides.forEach(function (slide) {
    slide.content[0] = extractProperties(slide.content[0] || '', slide.properties);
  });

  return slides.filter(function (slide) {
    var exclude = (slide.properties.exclude || '').toLowerCase();

    if (exclude === 'true') {
      return false;
    }

    return true;
  });
};

function createSlide () {
  return {
    content: [],
    properties: {
      continued: 'false'
    },
    links: {}
  };
}

function createContentClass (token) {
  return {
    class: token.classes.join(' '),
    block: token.block,
    content: []
  };
}

function appendTo (element, content) {
  var target = element.content;

  if (element.notes !== undefined) {
    target = element.notes;
  }

  // If two string are added after one another, we can just as well
  // go ahead and concatenate them into a single string.
  var lastIdx = target.length - 1;
  if (typeof target[lastIdx] === 'string' && typeof content === 'string') {
    target[lastIdx] += content;
  }
  else {
    target.push(content);
  }
}

function extractProperties (source, properties) {
  var propertyFinder = /^\n*([-\w]+):([^$\n]*)/i
    , match
    ;

  while ((match = propertyFinder.exec(source)) !== null) {
    source = source.substr(0, match.index) +
      source.substr(match.index + match[0].length);

    properties[match[1].trim()] = match[2].trim();

    propertyFinder.lastIndex = match.index;
  }

  return source;
}

function cleanInput(source) {
  // If all lines are indented, we should trim them all to the same point so that code doesn't
  // need to start at column 0 in the source (see GitHub Issue #105)

  // Helper to extract captures from the regex
  var getMatchCaptures = function (source, pattern) {
    var results = [], match;
    while ((match = pattern.exec(source)) !== null)
      results.push(match[1]);
    return results;
  };

  // Calculate the minimum leading whitespace
  // Ensure there's at least one char that's not newline nor whitespace to ignore empty and blank lines
  var leadingWhitespacePattern = /^([ \t]*)[^ \t\n]/gm;
  var whitespace = getMatchCaptures(source, leadingWhitespacePattern).map(function (s) { return s.length; });
  var minWhitespace = Math.min.apply(Math, whitespace);

  // Trim off the exact amount of whitespace, or less for blank lines (non-empty)
  var trimWhitespacePattern = new RegExp('^[ \\t]{0,' + minWhitespace + '}', 'gm');
  return source.replace(trimWhitespacePattern, '');
}

})()
},{"./lexer":16}],13:[function(require,module,exports){
var SlideView = require('./slideView')
  , Timer = require('components/timer')
  , NotesView = require('./notesView')
  , Scaler = require('../scaler')
  , resources = require('../resources')
  , utils = require('../utils')
  , printing = require('components/printing')
  ;

module.exports = SlideshowView;

function SlideshowView (events, dom, containerElement, slideshow) {
  var self = this;

  self.events = events;
  self.dom = dom;
  self.slideshow = slideshow;
  self.scaler = new Scaler(events, slideshow);
  self.slideViews = [];

  self.configureContainerElement(containerElement);
  self.configureChildElements();

  self.updateDimensions();
  self.scaleElements();
  self.updateSlideViews();

  self.timer = new Timer(events, self.timerElement);

  events.on('slidesChanged', function () {
    self.updateSlideViews();
  });

  events.on('hideSlide', function (slideIndex) {
    // To make sure that there is only one element fading at a time,
    // remove the fading class from all slides before hiding
    // the new slide.
    self.elementArea.getElementsByClassName('remark-fading').forEach(function (slide) {
      utils.removeClass(slide, 'remark-fading');
    });
    self.hideSlide(slideIndex);
  });

  events.on('showSlide', function (slideIndex) {
    self.showSlide(slideIndex);
  });

  events.on('forcePresenterMode', function () {

    if (!utils.hasClass(self.containerElement, 'remark-presenter-mode')) {
      utils.toggleClass(self.containerElement, 'remark-presenter-mode');
      self.scaleElements();
      printing.setPageOrientation('landscape');
    }
  });

  events.on('togglePresenterMode', function () {
    utils.toggleClass(self.containerElement, 'remark-presenter-mode');
    self.scaleElements();

    if (utils.hasClass(self.containerElement, 'remark-presenter-mode')) {
      printing.setPageOrientation('portrait');
    }
    else {
      printing.setPageOrientation('landscape');
    }
  });

  events.on('toggleHelp', function () {
    utils.toggleClass(self.containerElement, 'remark-help-mode');
  });

  events.on('toggleBlackout', function () {
    utils.toggleClass(self.containerElement, 'remark-blackout-mode');
  });

  events.on('toggleMirrored', function () {
    utils.toggleClass(self.containerElement, 'remark-mirrored-mode');
  });

  events.on('hideOverlay', function () {
    utils.removeClass(self.containerElement, 'remark-blackout-mode');
    utils.removeClass(self.containerElement, 'remark-help-mode');
  });

  events.on('pause', function () {
    utils.toggleClass(self.containerElement, 'remark-pause-mode');
  });

  events.on('resume', function () {
    utils.toggleClass(self.containerElement, 'remark-pause-mode');
  });

  handleFullscreen(self);
}

function handleFullscreen(self) {
  var requestFullscreen = utils.getPrefixedProperty(self.containerElement, 'requestFullScreen')
    , cancelFullscreen = utils.getPrefixedProperty(document, 'cancelFullScreen')
    ;

  self.events.on('toggleFullscreen', function () {
    var fullscreenElement = utils.getPrefixedProperty(document, 'fullscreenElement') ||
      utils.getPrefixedProperty(document, 'fullScreenElement');

    if (!fullscreenElement && requestFullscreen) {
      requestFullscreen.call(self.containerElement, Element.ALLOW_KEYBOARD_INPUT);
    }
    else if (cancelFullscreen) {
      cancelFullscreen.call(document);
    }
    self.scaleElements();
  });
}

SlideshowView.prototype.isEmbedded = function () {
  return this.containerElement !== this.dom.getBodyElement();
};

SlideshowView.prototype.configureContainerElement = function (element) {
  var self = this;

  self.containerElement = element;

  utils.addClass(element, 'remark-container');

  if (element === self.dom.getBodyElement()) {
    utils.addClass(self.dom.getHTMLElement(), 'remark-container');

    forwardEvents(self.events, window, [
      'hashchange', 'resize', 'keydown', 'keypress', 'mousewheel',
      'message', 'DOMMouseScroll'
    ]);
    forwardEvents(self.events, self.containerElement, [
      'touchstart', 'touchmove', 'touchend', 'click', 'contextmenu'
    ]);
  }
  else {
    element.style.position = 'absolute';
    element.tabIndex = -1;

    forwardEvents(self.events, window, ['resize']);
    forwardEvents(self.events, element, [
      'keydown', 'keypress', 'mousewheel',
      'touchstart', 'touchmove', 'touchend'
    ]);
  }

  // Tap event is handled in slideshow view
  // rather than controller as knowledge of
  // container width is needed to determine
  // whether to move backwards or forwards
  self.events.on('tap', function (endX) {
    if (endX < self.getContainerWidth() / 2) {
      self.slideshow.gotoPreviousSlide();
    }
    else {
      self.slideshow.gotoNextSlide();
    }
  });
};

function forwardEvents (target, source, events) {
  events.forEach(function (eventName) {
    source.addEventListener(eventName, function () {
      var args = Array.prototype.slice.call(arguments);
      target.emit.apply(target, [eventName].concat(args));
    });
  });
}

SlideshowView.prototype.configureChildElements = function () {
  var self = this;

  self.containerElement.innerHTML += resources.containerLayout;

  self.elementArea = self.containerElement.getElementsByClassName('remark-slides-area')[0];
  self.previewArea = self.containerElement.getElementsByClassName('remark-preview-area')[0];
  self.notesArea = self.containerElement.getElementsByClassName('remark-notes-area')[0];

  self.notesView = new NotesView (self.events, self.notesArea, function () {
    return self.slideViews;
  });

  self.backdropElement = self.containerElement.getElementsByClassName('remark-backdrop')[0];
  self.helpElement = self.containerElement.getElementsByClassName('remark-help')[0];

  self.timerElement = self.notesArea.getElementsByClassName('remark-toolbar-timer')[0];
  self.pauseElement = self.containerElement.getElementsByClassName('remark-pause')[0];

  self.events.on('propertiesChanged', function (changes) {
    if (changes.hasOwnProperty('ratio')) {
      self.updateDimensions();
    }
  });

  self.events.on('resize', onResize);

  printing.init();
  printing.on('print', onPrint);

  function onResize () {
    self.scaleElements();
  }

  function onPrint (e) {
    var slideHeight;

    if (e.isPortrait) {
      slideHeight = e.pageHeight * 0.4;
    }
    else {
      slideHeight = e.pageHeight;
    }

    self.slideViews.forEach(function (slideView) {
      slideView.scale({
        clientWidth: e.pageWidth,
        clientHeight: slideHeight
      });

      if (e.isPortrait) {
        slideView.scalingElement.style.top = '20px';
        slideView.notesElement.style.top = slideHeight + 40 + 'px';
      }
    });
  }
};

SlideshowView.prototype.updateSlideViews = function () {
  var self = this;

  self.slideViews.forEach(function (slideView) {
    self.elementArea.removeChild(slideView.containerElement);
  });

  self.slideViews = self.slideshow.getSlides().map(function (slide) {
    return new SlideView(self.events, self.slideshow, self.scaler, slide);
  });

  self.slideViews.forEach(function (slideView) {
    self.elementArea.appendChild(slideView.containerElement);
  });

  self.updateDimensions();

  if (self.slideshow.getCurrentSlideIndex() > -1) {
    self.showSlide(self.slideshow.getCurrentSlideIndex());
  }
};

SlideshowView.prototype.scaleSlideBackgroundImages = function (dimensions) {
  var self = this;

  self.slideViews.forEach(function (slideView) {
    slideView.scaleBackgroundImage(dimensions);
  });
};

SlideshowView.prototype.showSlide =  function (slideIndex) {
  var self = this
    , slideView = self.slideViews[slideIndex]
    , nextSlideView = self.slideViews[slideIndex + 1]
    ;

  self.events.emit("beforeShowSlide", slideIndex);

  slideView.show();

  if (nextSlideView) {
    self.previewArea.innerHTML = nextSlideView.containerElement.outerHTML;
  }
  else {
    self.previewArea.innerHTML = '';
  }

  self.events.emit("afterShowSlide", slideIndex);
};

SlideshowView.prototype.hideSlide = function (slideIndex) {
  var self = this
    , slideView = self.slideViews[slideIndex]
    ;

  self.events.emit("beforeHideSlide", slideIndex);
  slideView.hide();
  self.events.emit("afterHideSlide", slideIndex);

};

SlideshowView.prototype.updateDimensions = function () {
  var self = this
    , dimensions = self.scaler.dimensions
    ;

  self.helpElement.style.width = dimensions.width + 'px';
  self.helpElement.style.height = dimensions.height + 'px';

  self.scaleSlideBackgroundImages(dimensions);
  self.scaleElements();
};

SlideshowView.prototype.scaleElements = function () {
  var self = this;

  self.slideViews.forEach(function (slideView) {
    slideView.scale(self.elementArea);
  });

  if (self.previewArea.children.length) {
    self.scaler.scaleToFit(self.previewArea.children[0].children[0], self.previewArea);
  }
  self.scaler.scaleToFit(self.helpElement, self.containerElement);
  self.scaler.scaleToFit(self.pauseElement, self.containerElement);
};

},{"components/timer":"yAcg0L","components/printing":"nZr0zp","./slideView":17,"./notesView":18,"../resources":6,"../utils":8,"../scaler":19}],14:[function(require,module,exports){
var Navigation = require('./slideshow/navigation')
  , Events = require('./slideshow/events')
  , utils = require('../utils')
  , Slide = require('./slide')
  , Parser = require('../parser')
  , macros = require('../macros')
  ;

module.exports = Slideshow;

function Slideshow (events, options) {
  var self = this
    , slides = []
    , links = {}
    ;

  options = options || {};

  // Extend slideshow functionality
  Events.call(self, events);
  Navigation.call(self, events);

  self.loadFromString = loadFromString;
  self.update = update;
  self.getLinks = getLinks;
  self.getSlides = getSlides;
  self.getSlideCount = getSlideCount;
  self.getSlideByName = getSlideByName;

  self.togglePresenterMode = togglePresenterMode;
  self.toggleHelp = toggleHelp;
  self.toggleBlackout = toggleBlackout;
  self.toggleMirrored = toggleMirrored;
  self.toggleFullscreen = toggleFullscreen;
  self.createClone = createClone;

  self.resetTimer = resetTimer;

  self.getRatio = getOrDefault('ratio', '4:3');
  self.getHighlightStyle = getOrDefault('highlightStyle', 'default');
  self.getHighlightLanguage = getOrDefault('highlightLanguage', '');
  self.getSlideNumberFormat = getOrDefault('slideNumberFormat', '%current% / %total%');

  loadFromString(options.source);

  events.on('toggleBlackout', function () {
    if (self.clone && !self.clone.closed) {
      self.clone.postMessage('toggleBlackout', '*');
    }
  });

  function loadFromString (source) {
    source = source || '';

    slides = createSlides(source, options);
    expandVariables(slides);

    links = {};
    slides.forEach(function (slide) {
      for (var id in slide.links) {
        if (slide.links.hasOwnProperty(id)) {
          links[id] = slide.links[id];
        }
      }
    });

    events.emit('slidesChanged');
  }

  function update () {
    events.emit('resize');
  }

  function getLinks () {
    return links;
  }

  function getSlides () {
    return slides.map(function (slide) { return slide; });
  }

  function getSlideCount () {
    return slides.length;
  }

  function getSlideByName (name) {
    return slides.byName[name];
  }

  function togglePresenterMode () {
    events.emit('togglePresenterMode');
  }

  function toggleHelp () {
    events.emit('toggleHelp');
  }

  function toggleBlackout () {
    events.emit('toggleBlackout');
  }

  function toggleMirrored() {
    events.emit('toggleMirrored');
  }

  function toggleFullscreen () {
    events.emit('toggleFullscreen');
  }

  function createClone () {
    events.emit('createClone');
  }

  function resetTimer () {
    events.emit('resetTimer');
  }

  function getOrDefault (key, defaultValue) {
    return function () {
      if (options[key] === undefined) {
        return defaultValue;
      }

      return options[key];
    };
  }
}

function createSlides (slideshowSource, options) {
  var parser = new Parser()
   ,  parsedSlides = parser.parse(slideshowSource, macros)
    , slides = []
    , byName = {}
    , layoutSlide
    ;

  slides.byName = {};

  parsedSlides.forEach(function (slide, i) {
    var template, slideViewModel;

    if (slide.properties.continued === 'true' && i > 0) {
      template = slides[slides.length - 1];
    }
    else if (byName[slide.properties.template]) {
      template = byName[slide.properties.template];
    }
    else if (slide.properties.layout === 'false') {
      layoutSlide = undefined;
    }
    else if (layoutSlide && slide.properties.layout !== 'true') {
      template = layoutSlide;
    }

    if (slide.properties.continued === 'true' &&
        options.countIncrementalSlides === false &&
        slide.properties.count === undefined) {
      slide.properties.count = 'false';
    }

    slideViewModel = new Slide(slides.length, slide, template);

    if (slide.properties.layout === 'true') {
      layoutSlide = slideViewModel;
    }

    if (slide.properties.name) {
      byName[slide.properties.name] = slideViewModel;
    }

    if (slide.properties.layout !== 'true') {
      slides.push(slideViewModel);
      if (slide.properties.name) {
        slides.byName[slide.properties.name] = slideViewModel;
      }
    }
  });

  return slides;
}

function expandVariables (slides) {
  slides.forEach(function (slide) {
    slide.expandVariables();
  });
}

},{"./slideshow/events":20,"./slideshow/navigation":21,"./slide":22,"../utils":8,"../parser":10,"../macros":15}],12:[function(require,module,exports){
(function(){// Allow override of global `location`
/* global location:true */

module.exports = Controller;

var keyboard = require('./inputs/keyboard')
  , mouse = require('./inputs/mouse')
  , touch = require('./inputs/touch')
  , message = require('./inputs/message')
  , location = require('./inputs/location')
  ;

function Controller (events, dom, slideshowView, options) {
  options = options || {};

  message.register(events);
  location.register(events, dom, slideshowView);
  keyboard.register(events);
  mouse.register(events, options);
  touch.register(events, options);

  addApiEventListeners(events, slideshowView, options);
}

function addApiEventListeners(events, slideshowView, options) {
  events.on('pause', function(event) {
    keyboard.unregister(events);
    mouse.unregister(events);
    touch.unregister(events);
  });

  events.on('resume',  function(event) {
    keyboard.register(events);
    mouse.register(events, options);
    touch.register(events, options);
  });
}

})()
},{"./inputs/keyboard":23,"./inputs/mouse":24,"./inputs/touch":25,"./inputs/message":26,"./inputs/location":27}],16:[function(require,module,exports){
module.exports = Lexer;

var CODE = 1,
    INLINE_CODE = 2,
    CONTENT = 3,
    FENCES = 4,
    DEF = 5,
    DEF_HREF = 6,
    DEF_TITLE = 7,
    MACRO = 8,
    MACRO_ARGS = 9,
    MACRO_OBJ = 10,
    SEPARATOR = 11,
    NOTES_SEPARATOR = 12;

var regexByName = {
    CODE: /(?:^|\n)( {4}[^\n]+\n*)+/,
    INLINE_CODE: /`([^`]+?)`/,
    CONTENT: /(?:\\)?((?:\.[a-zA-Z_\-][a-zA-Z\-_0-9]*)+)\[/,
    FENCES: /(?:^|\n) *(`{3,}|~{3,}) *(?:\S+)? *\n(?:[\s\S]+?)\s*\4 *(?:\n+|$)/,
    DEF: /(?:^|\n) *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
    MACRO: /!\[:([^\] ]+)([^\]]*)\](?:\(([^\)]*)\))?/,
    SEPARATOR: /(?:^|\n)(---?)(?:\n|$)/,
    NOTES_SEPARATOR: /(?:^|\n)(\?{3})(?:\n|$)/
  };

var block = replace(/CODE|INLINE_CODE|CONTENT|FENCES|DEF|MACRO|SEPARATOR|NOTES_SEPARATOR/, regexByName),
    inline = replace(/CODE|INLINE_CODE|CONTENT|FENCES|DEF|MACRO/, regexByName);

function Lexer () { }

Lexer.prototype.lex = function (src) {
  var tokens = lex(src, block),
      i;

  for (i = tokens.length - 2; i >= 0; i--) {
    if (tokens[i].type === 'text' && tokens[i+1].type === 'text') {
      tokens[i].text += tokens[i+1].text;
      tokens.splice(i+1, 1);
    }
  }

  return tokens;
};

function lex (src, regex, tokens) {
  var cap, text;

  tokens = tokens || [];

  while ((cap = regex.exec(src)) !== null) {
    if (cap.index > 0) {
      tokens.push({
        type: 'text',
        text: src.substring(0, cap.index)
      });
    }

    if (cap[CODE]) {
      tokens.push({
        type: 'code',
        text: cap[0]
      });
    }
    else if (cap[INLINE_CODE]) {
      tokens.push({
        type: 'text',
        text: cap[0]
      });
    }
    else if (cap[FENCES]) {
      tokens.push({
        type: 'fences',
        text: cap[0]
      });
    }
    else if (cap[DEF]) {
      tokens.push({
        type: 'def',
        id: cap[DEF],
        href: cap[DEF_HREF],
        title: cap[DEF_TITLE]
      });
    }
    else if (cap[MACRO]) {
      tokens.push({
        type: 'macro',
        name: cap[MACRO],
        args: (cap[MACRO_ARGS] || '').split(',').map(trim),
        obj: cap[MACRO_OBJ]
      });
    }
    else if (cap[SEPARATOR]) {
      tokens.push({
        type: 'separator',
        text: cap[SEPARATOR]
      });
    }
    else if (cap[NOTES_SEPARATOR]) {
      tokens.push({
        type: 'notes_separator',
        text: cap[NOTES_SEPARATOR]
      });
    }
    else if (cap[CONTENT]) {
      text = getTextInBrackets(src, cap.index + cap[0].length);
      if (text !== undefined) {
        src = src.substring(text.length + 1);

        if (cap[0][0] !== '\\') {
          tokens.push({
            type: 'content_start',
            classes: cap[CONTENT].substring(1).split('.'),
            block: text.indexOf('\n') !== -1
          });
          lex(text, inline, tokens);
          tokens.push({
            type: 'content_end',
            block: text.indexOf('\n') !== -1
          });
        }
        else {
          tokens.push({
            type: 'text',
            text: cap[0].substring(1) + text + ']'
          });
        }
      }
      else {
        tokens.push({
          type: 'text',
          text: cap[0]
        });
      }
    }

    src = src.substring(cap.index + cap[0].length);
  }

  if (src || (!src && tokens.length === 0)) {
    tokens.push({
      type: 'text',
      text: src
    });
  }

  return tokens;
}

function replace (regex, replacements) {
  return new RegExp(regex.source.replace(/\w{2,}/g, function (key) {
    return replacements[key].source;
  }));
}

function trim (text) {
  if (typeof text === 'string') {
    return text.trim();
  }

  return text;
}

function getTextInBrackets (src, offset) {
  var depth = 1,
      pos = offset,
      chr;

  while (depth > 0 && pos < src.length) {
    chr = src[pos++];
    depth += (chr === '[' && 1) || (chr === ']' && -1) || 0;
  }

  if (depth === 0) {
    src = src.substr(offset, pos - offset - 1);
    return src;
  }
}

},{}],24:[function(require,module,exports){
exports.register = function (events, options) {
  addMouseEventListeners(events, options);
};

exports.unregister = function (events) {
  removeMouseEventListeners(events);
};

function addMouseEventListeners (events, options) {
  if (options.click) {
    events.on('click', function (event) {
      if (event.target.nodeName === 'A') {
        // Don't interfere when clicking link
        return;
      }
      else if (event.button === 0) {
        events.emit('gotoNextSlide');
      }
    });
    events.on('contextmenu', function (event) {
      if (event.target.nodeName === 'A') {
        // Don't interfere when right-clicking link
        return;
      }
      event.preventDefault();
      events.emit('gotoPreviousSlide');
    });
  }

  if (options.scroll !== false) {
    var scrollHandler = function (event) {
      if (event.wheelDeltaY > 0 || event.detail < 0) {
        events.emit('gotoPreviousSlide');
      }
      else if (event.wheelDeltaY < 0 || event.detail > 0) {
        events.emit('gotoNextSlide');
      }
    };

    // IE9, Chrome, Safari, Opera
    events.on('mousewheel', scrollHandler);
    // Firefox
    events.on('DOMMouseScroll', scrollHandler);
  }
}

function removeMouseEventListeners(events) {
  events.removeAllListeners('click');
  events.removeAllListeners('contextmenu');
  events.removeAllListeners('mousewheel');
}

},{}],23:[function(require,module,exports){
exports.register = function (events) {
  addKeyboardEventListeners(events);
};

exports.unregister = function (events) {
  removeKeyboardEventListeners(events);
};

function addKeyboardEventListeners (events) {
  events.on('keydown', function (event) {
    if (event.metaKey || event.ctrlKey) {
      // Bail out if meta or ctrl key was pressed
      return;
    }

    switch (event.keyCode) {
      case 33: // Page up
      case 37: // Left
      case 38: // Up
        events.emit('gotoPreviousSlide');
        break;
      case 32: // Space
      case 34: // Page down
      case 39: // Right
      case 40: // Down
        events.emit('gotoNextSlide');
        break;
      case 36: // Home
        events.emit('gotoFirstSlide');
        break;
      case 35: // End
        events.emit('gotoLastSlide');
        break;
      case 27: // Escape
        events.emit('hideOverlay');
        break;
    }
  });

  events.on('keypress', function (event) {
    if (event.metaKey || event.ctrlKey) {
      // Bail out if meta or ctrl key was pressed
      return;
    }

    switch (String.fromCharCode(event.which)) {
      case 'j':
        events.emit('gotoNextSlide');
        break;
      case 'k':
        events.emit('gotoPreviousSlide');
        break;
      case 'b':
        events.emit('toggleBlackout');
        break;
      case 'm':
        events.emit('toggleMirrored');
        break;
      case 'c':
        events.emit('createClone');
        break;
      case 'p':
        events.emit('togglePresenterMode');
        break;
      case 'f':
        events.emit('toggleFullscreen');
        break;
      case 't':
        events.emit('resetTimer');
        break;
      case 'h':
      case '?':
        events.emit('toggleHelp');
        break;
    }
  });
}

function removeKeyboardEventListeners(events) {
  events.removeAllListeners("keydown");
  events.removeAllListeners("keypress");
}

},{}],25:[function(require,module,exports){
exports.register = function (events, options) {
  addTouchEventListeners(events, options);
};

exports.unregister = function (events) {
  removeTouchEventListeners(events);
};

function addTouchEventListeners (events, options) {
  var touch
    , startX
    , endX
    ;

  if (options.touch === false) {
    return;
  }

  var isTap = function () {
    return Math.abs(startX - endX) < 10;
  };

  var handleTap = function () {
    events.emit('tap', endX);
  };

  var handleSwipe = function () {
    if (startX > endX) {
      events.emit('gotoNextSlide');
    }
    else {
      events.emit('gotoPreviousSlide');
    }
  };

  events.on('touchstart', function (event) {
    touch = event.touches[0];
    startX = touch.clientX;
  });

  events.on('touchend', function (event) {
    if (event.target.nodeName.toUpperCase() === 'A') {
      return;
    }

    touch = event.changedTouches[0];
    endX = touch.clientX;

    if (isTap()) {
      handleTap();
    }
    else {
      handleSwipe();
    }
  });

  events.on('touchmove', function (event) {
    event.preventDefault();
  });
}

function removeTouchEventListeners(events) {
  events.removeAllListeners("touchstart");
  events.removeAllListeners("touchend");
  events.removeAllListeners("touchmove");
}

},{}],21:[function(require,module,exports){
module.exports = Navigation;

function Navigation (events) {
  var self = this
    , currentSlideIndex = -1
    , started = null
    ;

  self.getCurrentSlideIndex = getCurrentSlideIndex;
  self.gotoSlide = gotoSlide;
  self.gotoPreviousSlide = gotoPreviousSlide;
  self.gotoNextSlide = gotoNextSlide;
  self.gotoFirstSlide = gotoFirstSlide;
  self.gotoLastSlide = gotoLastSlide;
  self.pause = pause;
  self.resume = resume;

  events.on('gotoSlide', gotoSlide);
  events.on('gotoPreviousSlide', gotoPreviousSlide);
  events.on('gotoNextSlide', gotoNextSlide);
  events.on('gotoFirstSlide', gotoFirstSlide);
  events.on('gotoLastSlide', gotoLastSlide);

  events.on('slidesChanged', function () {
    if (currentSlideIndex > self.getSlideCount()) {
      currentSlideIndex = self.getSlideCount();
    }
  });

  events.on('createClone', function () {
    if (!self.clone || self.clone.closed) {
      self.clone = window.open(location.href, '_blank', 'location=no');
    }
    else {
      self.clone.focus();
    }
  });

  events.on('resetTimer', function() {
    started = false;
  });

  function pause () {
    events.emit('pause');
  }

  function resume () {
    events.emit('resume');
  }

  function getCurrentSlideIndex () {
    return currentSlideIndex;
  }

  function gotoSlideByIndex(slideIndex, noMessage) {
    var alreadyOnSlide = slideIndex === currentSlideIndex
      , slideOutOfRange = slideIndex < 0 || slideIndex > self.getSlideCount()-1
      ;

    if (noMessage === undefined) noMessage = false;

    if (alreadyOnSlide || slideOutOfRange) {
      return;
    }

    if (currentSlideIndex !== -1) {
      events.emit('hideSlide', currentSlideIndex, false);
    }

    // Use some tri-state logic here.
    // null = We haven't shown the first slide yet.
    // false = We've shown the initial slide, but we haven't progressed beyond that.
    // true = We've issued the first slide change command.
    if (started === null) {
      started = false;
    } else if (started === false) {
      // We've shown the initial slide previously - that means this is a
      // genuine move to a new slide.
      events.emit('start');
      started = true;
    }

    events.emit('showSlide', slideIndex);

    currentSlideIndex = slideIndex;

    events.emit('slideChanged', slideIndex + 1);

    if (!noMessage) {
      if (self.clone && !self.clone.closed) {
        self.clone.postMessage('gotoSlide:' + (currentSlideIndex + 1), '*');
      }

      if (window.opener) {
        window.opener.postMessage('gotoSlide:' + (currentSlideIndex + 1), '*');
      }
    }
  }

  function gotoSlide (slideNoOrName, noMessage) {
    var slideIndex = getSlideIndex(slideNoOrName);

    gotoSlideByIndex(slideIndex, noMessage);
  }

  function gotoPreviousSlide() {
    gotoSlideByIndex(currentSlideIndex - 1);
  }

  function gotoNextSlide() {
    gotoSlideByIndex(currentSlideIndex + 1);
  }

  function gotoFirstSlide () {
    gotoSlideByIndex(0);
  }

  function gotoLastSlide () {
    gotoSlideByIndex(self.getSlideCount() - 1);
  }

  function getSlideIndex (slideNoOrName) {
    var slideNo
      , slide
      ;

    if (typeof slideNoOrName === 'number') {
      return slideNoOrName - 1;
    }

    slideNo = parseInt(slideNoOrName, 10);
    if (slideNo.toString() === slideNoOrName) {
      return slideNo - 1;
    }

    if(slideNoOrName.match(/^p\d+$/)){
      events.emit('forcePresenterMode');
      return parseInt(slideNoOrName.substr(1), 10)-1;
    }

    slide = self.getSlideByName(slideNoOrName);
    if (slide) {
      return slide.getSlideIndex();
    }

    return 0;
  }
}

},{}],20:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;

module.exports = Events;

function Events (events) {
  var self = this
    , externalEvents = new EventEmitter()
    ;

  externalEvents.setMaxListeners(0);

  self.on = function () {
    externalEvents.on.apply(externalEvents, arguments);
    return self;
  };

  ['showSlide', 'hideSlide', 'beforeShowSlide', 'afterShowSlide', 'beforeHideSlide', 'afterHideSlide'].map(function (eventName) {
    events.on(eventName, function (slideIndex) {
      var slide = self.getSlides()[slideIndex];
      externalEvents.emit(eventName, slide);
    });
  });
}

},{"events":1}],22:[function(require,module,exports){
module.exports = Slide;

function Slide (slideIndex, slide, template) {
  var self = this;

  self.properties = slide.properties || {};
  self.links = slide.links || {};
  self.content = slide.content || [];
  self.notes = slide.notes || '';

  self.getSlideIndex = function () { return slideIndex; };

  if (template) {
    inherit(self, template);
  }
}

function inherit (slide, template) {
  inheritProperties(slide, template);
  inheritContent(slide, template);
  inheritNotes(slide, template);
}

function inheritProperties (slide, template) {
  var property
    , value
    ;

  for (property in template.properties) {
    if (!template.properties.hasOwnProperty(property) ||
        ignoreProperty(property)) {
      continue;
    }

    value = [template.properties[property]];

    if (property === 'class' && slide.properties[property]) {
      value.push(slide.properties[property]);
    }

    if (property === 'class' || slide.properties[property] === undefined) {
      slide.properties[property] = value.join(', ');
    }
  }
}

function ignoreProperty (property) {
  return property === 'name' ||
    property === 'layout' ||
    property === 'count';
}

function inheritContent (slide, template) {
  var expandedVariables;

  slide.properties.content = slide.content.slice();
  slide.content = template.content.slice();

  expandedVariables = slide.expandVariables(/* contentOnly: */ true);

  if (expandedVariables.content === undefined) {
    slide.content = slide.content.concat(slide.properties.content);
  }

  delete slide.properties.content;
}

function inheritNotes (slide, template) {
  if (template.notes) {
    slide.notes = template.notes + '\n\n' + slide.notes;
  }
}

Slide.prototype.expandVariables = function (contentOnly, content, expandResult) {
  var properties = this.properties
    , i
    ;

  content = content !== undefined ? content : this.content;
  expandResult = expandResult || {};

  for (i = 0; i < content.length; ++i) {
    if (typeof content[i] === 'string') {
      content[i] = content[i].replace(/(\\)?(\{\{([^\}\n]+)\}\})/g, expand);
    }
    else {
      this.expandVariables(contentOnly, content[i].content, expandResult);
    }
  }

  function expand (match, escaped, unescapedMatch, property) {
    var propertyName = property.trim()
      , propertyValue
      ;

    if (escaped) {
      return contentOnly ? match[0] : unescapedMatch;
    }

    if (contentOnly && propertyName !== 'content') {
      return match;
    }

    propertyValue = properties[propertyName];

    if (propertyValue !== undefined) {
      expandResult[propertyName] = propertyValue;
      return propertyValue;
    }

    return propertyName === 'content' ? '' : unescapedMatch;
  }

  return expandResult;
};

},{}],19:[function(require,module,exports){
var referenceWidth = 908
  , referenceHeight = 681
  , referenceRatio = referenceWidth / referenceHeight
  ;

module.exports = Scaler;

function Scaler (events, slideshow) {
  var self = this;

  self.events = events;
  self.slideshow = slideshow;
  self.ratio = getRatio(slideshow);
  self.dimensions = getDimensions(self.ratio);

  self.events.on('propertiesChanged', function (changes) {
    if (changes.hasOwnProperty('ratio')) {
      self.ratio = getRatio(slideshow);
      self.dimensions = getDimensions(self.ratio);
    }
  });
}

Scaler.prototype.scaleToFit = function (element, container) {
  var self = this
    , containerHeight = container.clientHeight
    , containerWidth = container.clientWidth
    , scale
    , scaledWidth
    , scaledHeight
    , ratio = self.ratio
    , dimensions = self.dimensions
    , direction
    , left
    , top
    ;

  if (containerWidth / ratio.width > containerHeight / ratio.height) {
    scale = containerHeight / dimensions.height;
  }
  else {
    scale = containerWidth / dimensions.width;
  }

  scaledWidth = dimensions.width * scale;
  scaledHeight = dimensions.height * scale;

  left = (containerWidth - scaledWidth) / 2;
  top = (containerHeight - scaledHeight) / 2;

  element.style['-webkit-transform'] = 'scale(' + scale + ')';
  element.style.MozTransform = 'scale(' + scale + ')';
  element.style.left = Math.max(left, 0) + 'px';
  element.style.top = Math.max(top, 0) + 'px';
};

function getRatio (slideshow) {
  var ratioComponents = slideshow.getRatio().split(':')
    , ratio
    ;

  ratio = {
    width: parseInt(ratioComponents[0], 10)
  , height: parseInt(ratioComponents[1], 10)
  };

  ratio.ratio = ratio.width / ratio.height;

  return ratio;
}

function getDimensions (ratio) {
  return {
    width: Math.floor(referenceWidth / referenceRatio * ratio.ratio)
  , height: referenceHeight
  };
}

},{}],26:[function(require,module,exports){
exports.register = function (events) {
  addMessageEventListeners(events);
};

function addMessageEventListeners (events) {
  events.on('message', navigateByMessage);

  function navigateByMessage(message) {
    var cap;

    if ((cap = /^gotoSlide:(\d+)$/.exec(message.data)) !== null) {
      events.emit('gotoSlide', parseInt(cap[1], 10), true);
    }
    else if (message.data === 'toggleBlackout') {
      events.emit('toggleBlackout');
    }
  }
}

},{}],27:[function(require,module,exports){
exports.register = function (events, dom, slideshowView) {
  addLocationEventListeners(events, dom, slideshowView);
};

function addLocationEventListeners (events, dom, slideshowView) {
  // If slideshow is embedded into custom DOM element, we don't
  // hook up to location hash changes, so just go to first slide.
  if (slideshowView.isEmbedded()) {
    events.emit('gotoSlide', 1);
  }
  // When slideshow is not embedded into custom DOM element, but
  // rather hosted directly inside document.body, we hook up to
  // location hash changes, and trigger initial navigation.
  else {
    events.on('hashchange', navigateByHash);
    events.on('slideChanged', updateHash);

    navigateByHash();
  }

  function navigateByHash () {
    var slideNoOrName = (dom.getLocationHash() || '').substr(1);
    events.emit('gotoSlide', slideNoOrName);
  }

  function updateHash (slideNoOrName) {
    dom.setLocationHash('#' + slideNoOrName);
  }
}

},{}],18:[function(require,module,exports){
var converter = require('../converter');

module.exports = NotesView;

function NotesView (events, element, slideViewsAccessor) {
  var self = this;

  self.events = events;
  self.element = element;
  self.slideViewsAccessor = slideViewsAccessor;

  self.configureElements();

  events.on('showSlide', function (slideIndex) {
    self.showSlide(slideIndex);
  });
}

NotesView.prototype.showSlide = function (slideIndex) {
  var self = this
    , slideViews = self.slideViewsAccessor()
    , slideView = slideViews[slideIndex]
    , nextSlideView = slideViews[slideIndex + 1]
    ;

  self.notesElement.innerHTML = slideView.notesElement.innerHTML;

  if (nextSlideView) {
    self.notesPreviewElement.innerHTML = nextSlideView.notesElement.innerHTML;
  }
  else {
    self.notesPreviewElement.innerHTML = '';
  }
};

NotesView.prototype.configureElements = function () {
  var self = this;

  self.notesElement = self.element.getElementsByClassName('remark-notes')[0];
  self.notesPreviewElement = self.element.getElementsByClassName('remark-notes-preview')[0];

  self.notesElement.addEventListener('mousewheel', function (event) {
    event.stopPropagation();
  });

  self.notesPreviewElement.addEventListener('mousewheel', function (event) {
    event.stopPropagation();
  });

  self.toolbarElement = self.element.getElementsByClassName('remark-toolbar')[0];

  var commands = {
    increase: function () {
      self.notesElement.style.fontSize = (parseFloat(self.notesElement.style.fontSize) || 1) + 0.1 + 'em';
      self.notesPreviewElement.style.fontsize = self.notesElement.style.fontSize;
    },
    decrease: function () {
      self.notesElement.style.fontSize = (parseFloat(self.notesElement.style.fontSize) || 1) - 0.1 + 'em';
      self.notesPreviewElement.style.fontsize = self.notesElement.style.fontSize;
    }
  };

  self.toolbarElement.getElementsByTagName('a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var command = e.target.hash.substr(1);
      commands[command]();
      e.preventDefault();
    });
  });
};

},{"../converter":9}],17:[function(require,module,exports){
var SlideNumber = require('components/slide-number')
  , converter = require('../converter')
  , highlighter = require('../highlighter')
  , utils = require('../utils')
  ;

module.exports = SlideView;

function SlideView (events, slideshow, scaler, slide) {
  var self = this;

  self.events = events;
  self.slideshow = slideshow;
  self.scaler = scaler;
  self.slide = slide;

  self.slideNumber = new SlideNumber(slide, slideshow);

  self.configureElements();
  self.updateDimensions();

  self.events.on('propertiesChanged', function (changes) {
    if (changes.hasOwnProperty('ratio')) {
      self.updateDimensions();
    }
  });
}

SlideView.prototype.updateDimensions = function () {
  var self = this
    , dimensions = self.scaler.dimensions
    ;

  self.scalingElement.style.width = dimensions.width + 'px';
  self.scalingElement.style.height = dimensions.height + 'px';
};

SlideView.prototype.scale = function (containerElement) {
  var self = this;

  self.scaler.scaleToFit(self.scalingElement, containerElement);
};

SlideView.prototype.show = function () {
  utils.addClass(this.containerElement, 'remark-visible');
  utils.removeClass(this.containerElement, 'remark-fading');
};

SlideView.prototype.hide = function () {
  var self = this;
  utils.removeClass(this.containerElement, 'remark-visible');
  // Don't just disappear the slide. Mark it as fading, which
  // keeps it on the screen, but at a reduced z-index.
  // Then set a timer to remove the fading state in 1s.
  utils.addClass(this.containerElement, 'remark-fading');
  setTimeout(function(){
      utils.removeClass(self.containerElement, 'remark-fading');
  }, 1000);
};

SlideView.prototype.configureElements = function () {
  var self = this;

  self.containerElement = document.createElement('div');
  self.containerElement.className = 'remark-slide-container';

  self.scalingElement = document.createElement('div');
  self.scalingElement.className = 'remark-slide-scaler';

  self.element = document.createElement('div');
  self.element.className = 'remark-slide';

  self.contentElement = createContentElement(self.events, self.slideshow, self.slide);
  self.notesElement = createNotesElement(self.slideshow, self.slide.notes);

  self.contentElement.appendChild(self.slideNumber.element);
  self.element.appendChild(self.contentElement);
  self.scalingElement.appendChild(self.element);
  self.containerElement.appendChild(self.scalingElement);
  self.containerElement.appendChild(self.notesElement);
};

SlideView.prototype.scaleBackgroundImage = function (dimensions) {
  var self = this
    , styles = window.getComputedStyle(this.contentElement)
    , backgroundImage = styles.backgroundImage
    , match
    , image
    , scale
    ;

  if ((match = /^url\(("?)([^\)]+?)\1\)/.exec(backgroundImage)) !== null) {
    image = new Image();
    image.onload = function () {
      if (image.width > dimensions.width ||
          image.height > dimensions.height) {
        // Background image is larger than slide
        if (!self.originalBackgroundSize) {
          // No custom background size has been set
          self.originalBackgroundSize = self.contentElement.style.backgroundSize;
          self.originalBackgroundPosition = self.contentElement.style.backgroundPosition;
          self.backgroundSizeSet = true;

          if (dimensions.width / image.width < dimensions.height / image.height) {
            scale = dimensions.width / image.width;
          }
          else {
            scale = dimensions.height / image.height;
          }

          self.contentElement.style.backgroundSize = image.width * scale +
            'px ' + image.height * scale + 'px';
          self.contentElement.style.backgroundPosition = '50% ' +
            ((dimensions.height - (image.height * scale)) / 2) + 'px';
        }
      }
      else {
        // Revert to previous background size setting
        if (self.backgroundSizeSet) {
          self.contentElement.style.backgroundSize = self.originalBackgroundSize;
          self.contentElement.style.backgroundPosition = self.originalBackgroundPosition;
          self.backgroundSizeSet = false;
        }
      }
    };
    image.src = match[2];
  }
};

function createContentElement (events, slideshow, slide) {
  var element = document.createElement('div');

  if (slide.properties.name) {
    element.id = 'slide-' + slide.properties.name;
  }

  styleContentElement(slideshow, element, slide.properties);

  element.innerHTML = converter.convertMarkdown(slide.content, slideshow.getLinks());

  highlightCodeBlocks(element, slideshow);

  return element;
}

function styleContentElement (slideshow, element, properties) {
  element.className = '';

  setClassFromProperties(element, properties);
  setHighlightStyleFromProperties(element, properties, slideshow);
  setBackgroundFromProperties(element, properties);
}

function createNotesElement (slideshow, notes) {
  var element = document.createElement('div');

  element.className = 'remark-slide-notes';

  element.innerHTML = converter.convertMarkdown(notes);

  highlightCodeBlocks(element, slideshow);

  return element;
}

function setBackgroundFromProperties (element, properties) {
  var backgroundImage = properties['background-image'];

  if (backgroundImage) {
    element.style.backgroundImage = backgroundImage;
  }
}

function setHighlightStyleFromProperties (element, properties, slideshow) {
  var highlightStyle = properties['highlight-style'] ||
      slideshow.getHighlightStyle();

  if (highlightStyle) {
    utils.addClass(element, 'hljs-' + highlightStyle);
  }
}

function setClassFromProperties (element, properties) {
  utils.addClass(element, 'remark-slide-content');

  (properties['class'] || '').split(/,| /)
    .filter(function (s) { return s !== ''; })
    .forEach(function (c) { utils.addClass(element, c); });
}

function highlightCodeBlocks (content, slideshow) {
  var codeBlocks = content.getElementsByTagName('code')
    ;

  codeBlocks.forEach(function (block) {
    if (block.parentElement.tagName !== 'PRE') {
      utils.addClass(block, 'remark-inline-code');
      return;
    }

    if (block.className === '') {
      block.className = slideshow.getHighlightLanguage();
    }

    var meta = extractMetadata(block);

    if (block.className !== '') {
      highlighter.engine.highlightBlock(block, '  ');
    }

    wrapLines(block);
    highlightBlockLines(block, meta.highlightedLines);
    highlightBlockSpans(block);

    utils.addClass(block, 'remark-code');
  });
}

function extractMetadata (block) {
  var highlightedLines = [];

  block.innerHTML = block.innerHTML.split(/\r?\n/).map(function (line, i) {
    if (line.indexOf('*') === 0) {
      highlightedLines.push(i);
      return line.replace(/^\*( )?/, '$1$1');
    }

    return line;
  }).join('\n');

  return {
    highlightedLines: highlightedLines
  };
}

function wrapLines (block) {
  var lines = block.innerHTML.split(/\r?\n/).map(function (line) {
    return '<div class="remark-code-line">' + line + '</div>';
  });

  // Remove empty last line (due to last \n)
  if (lines.length && lines[lines.length - 1].indexOf('><') !== -1) {
    lines.pop();
  }

  block.innerHTML = lines.join('');
}

function highlightBlockLines (block, lines) {
  lines.forEach(function (i) {
    utils.addClass(block.childNodes[i], 'remark-code-line-highlighted');
  });
}

function highlightBlockSpans (block) {
  var pattern = /([^\\`])`([^`]+?)`/g
    , replacement = '$1<span class="remark-code-span-highlighted">$2</span>'
    ;

  block.childNodes.forEach(function (element) {
    element.innerHTML = element.innerHTML.replace(pattern, replacement);
  });
}

},{"components/slide-number":"aIW4aw","../converter":9,"../highlighter":7,"../utils":8}],9:[function(require,module,exports){
var marked = require('marked')
  , converter = module.exports = {}
  , element = document.createElement('div')
  ;

marked.setOptions({
  gfm: true,
  tables: true,
  breaks: false,

  // Without this set to true, converting something like
  // <p>*</p><p>*</p> will become <p><em></p><p></em></p>
  pedantic: true,

  sanitize: false,
  smartLists: true,
  langPrefix: ''
});

converter.convertMarkdown = function (content, links, inline) {
  element.innerHTML = convertMarkdown(content, links || {}, inline);
  element.innerHTML = element.innerHTML.replace(/<p>\s*<\/p>/g, '');
  return element.innerHTML.replace(/\n\r?$/, '');
};

function convertMarkdown (content, links, insideContentClass) {
  var i, tag, markdown = '', html;

  for (i = 0; i < content.length; ++i) {
    if (typeof content[i] === 'string') {
      markdown += content[i];
    }
    else {
      tag = content[i].block ? 'div' : 'span';
      markdown += '<' + tag + ' class="' + content[i].class + '">';
      markdown += convertMarkdown(content[i].content, links, true);
      markdown += '</' + tag + '>';
    }
  }

  var tokens = marked.Lexer.lex(markdown.replace(/^\s+/, ''));
  tokens.links = links;
  html = marked.Parser.parse(tokens);

  if (insideContentClass) {
    element.innerHTML = html;
    if (element.children.length === 1 && element.children[0].tagName === 'P') {
      html = element.children[0].innerHTML;
    }
  }

  return html;
}

},{"marked":28}],28:[function(require,module,exports){
(function(global){/**
 * marked - a markdown parser
 * Copyright (c) 2011-2013, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', /\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3]
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style',
        text: cap[0]
      });
      continue;
    }

    // def
    if (top && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (cap = this.rules.url.exec(src)) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? escape(cap[0])
        : cap[0];
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      out += this.outputLink(cap, link);
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += escape(this.smartypants(cap[0]));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/--/g, '\u2014')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>';
  return out;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
  return html.replace(/&([#\w]+);/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function() {
      var out, err;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

})(window)
},{}]},{},[3])
;
/*!
 * jQuery JavaScript Library v2.1.3
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-12-18T15:11Z
 */


(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//

var arr = [];

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,

	version = "2.1.3",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {
		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		return !jQuery.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
	},

	isPlainObject: function( obj ) {
		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		if ( obj.constructor &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		// Support: Android<4.0, iOS<6 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call(obj) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		var script,
			indirect = eval;

		code = jQuery.trim( code );

		if ( code ) {
			// If the code includes a valid, prologue position
			// strict mode pragma, execute code by injecting a
			// script tag into the document.
			if ( code.indexOf("use strict") === 1 ) {
				script = document.createElement("script");
				script.text = code;
				document.head.appendChild( script ).parentNode.removeChild( script );
			} else {
			// Otherwise, avoid the DOM node creation, insertion
			// and removal by using an indirect global eval
				indirect( code );
			}
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE9-11+
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.0-pre
 * http://sizzlejs.com/
 *
 * Copyright 2008, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-12-16
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + characterEncoding + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];
	nodeType = context.nodeType;

	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	if ( !seed && documentIsHTML ) {

		// Try to shortcut find operations when possible (e.g., not under DocumentFragment)
		if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document (jQuery #6963)
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType !== 1 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && testContext( context.parentNode ) || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = attrs.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;
	parent = doc.defaultView;

	// Support: IE>8
	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
	// IE6-8 do not support the defaultView property so parent will be undefined
	if ( parent && parent !== parent.top ) {
		// IE11 does not have attachEvent, so all must suffer
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Support tests
	---------------------------------------------------------------------- */
	documentIsHTML = !isXML( doc );

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( doc.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\f]' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.2+, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.7+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = doc.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return doc;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (oldCache = outerCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							outerCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context !== document && context;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is no seed and only one group
	if ( match.length === 1 ) {

		// Take a shortcut and set the context if the root selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		});

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		});

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( indexOf.call( qualifier, elem ) >= 0 ) !== not;
	});
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		}));
};

jQuery.fn.extend({
	find: function( selector ) {
		var i,
			len = this.length,
			ret = [],
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow(this, selector || [], false) );
	},
	not: function( selector ) {
		return this.pushStack( winnow(this, selector || [], true) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
});


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[0] === "<" && selector[ selector.length - 1 ] === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Support: Blackberry 4.6
					// gEBID returns nodes no longer in the document (#6963)
					if ( elem && elem.parentNode ) {
						// Inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof rootjQuery.ready !== "undefined" ?
				rootjQuery.ready( selector ) :
				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,
	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.extend({
	dir: function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( (elem = elem[ dir ]) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	}
});

jQuery.fn.extend({
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter(function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector(cur, selectors)) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.unique(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

function sibling( cur, dir ) {
	while ( (cur = cur[dir]) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {
			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.unique( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
});
var rnotwhite = (/\S+/g);



// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( list && ( !fired || stack ) ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ tuple[ 0 ] + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// Add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// If we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {
	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend({
	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
});

/**
 * The ready event handler and self cleanup method
 */
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed, false );
	window.removeEventListener( "load", completed, false );
	jQuery.ready();
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// We once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = jQuery.access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {
			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			len ? fn( elems[0], key ) : emptyGet;
};


/**
 * Determines whether an object can have data
 */
jQuery.acceptData = function( owner ) {
	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	/* jshint -W018 */
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};


function Data() {
	// Support: Android<4,
	// Old WebKit does not have Object.preventExtensions/freeze method,
	// return new empty object instead with no [[set]] accessor
	Object.defineProperty( this.cache = {}, 0, {
		get: function() {
			return {};
		}
	});

	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;
Data.accepts = jQuery.acceptData;

Data.prototype = {
	key: function( owner ) {
		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return the key for a frozen object.
		if ( !Data.accepts( owner ) ) {
			return 0;
		}

		var descriptor = {},
			// Check if the owner object already has a cache key
			unlock = owner[ this.expando ];

		// If not, create one
		if ( !unlock ) {
			unlock = Data.uid++;

			// Secure it in a non-enumerable, non-writable property
			try {
				descriptor[ this.expando ] = { value: unlock };
				Object.defineProperties( owner, descriptor );

			// Support: Android<4
			// Fallback to a less secure definition
			} catch ( e ) {
				descriptor[ this.expando ] = unlock;
				jQuery.extend( owner, descriptor );
			}
		}

		// Ensure the cache object
		if ( !this.cache[ unlock ] ) {
			this.cache[ unlock ] = {};
		}

		return unlock;
	},
	set: function( owner, data, value ) {
		var prop,
			// There may be an unlock assigned to this node,
			// if there is no entry for this "owner", create one inline
			// and set the unlock as though an owner entry had always existed
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		// Handle: [ owner, key, value ] args
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		} else {
			// Fresh assignments by object are shallow copied
			if ( jQuery.isEmptyObject( cache ) ) {
				jQuery.extend( this.cache[ unlock ], data );
			// Otherwise, copy the properties one-by-one to the cache object
			} else {
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		// Either a valid cache is found, or will be created.
		// New caches will be created and the unlock returned,
		// allowing direct access to the newly created
		// empty data object. A valid owner object must be provided.
		var cache = this.cache[ this.key( owner ) ];

		return key === undefined ?
			cache : cache[ key ];
	},
	access: function( owner, key, value ) {
		var stored;
		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				((key && typeof key === "string") && value === undefined) ) {

			stored = this.get( owner, key );

			return stored !== undefined ?
				stored : this.get( owner, jQuery.camelCase(key) );
		}

		// [*]When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name, camel,
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		if ( key === undefined ) {
			this.cache[ unlock ] = {};

		} else {
			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				camel = jQuery.camelCase( key );
				// Try the string as a key before any manipulation
				if ( key in cache ) {
					name = [ key, camel ];
				} else {
					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					name = camel;
					name = name in cache ?
						[ name ] : ( name.match( rnotwhite ) || [] );
				}
			}

			i = name.length;
			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}
	},
	hasData: function( owner ) {
		return !jQuery.isEmptyObject(
			this.cache[ owner[ this.expando ] ] || {}
		);
	},
	discard: function( owner ) {
		if ( owner[ this.expando ] ) {
			delete this.cache[ owner[ this.expando ] ];
		}
	}
};
var data_priv = new Data();

var data_user = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			data_user.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend({
	hasData: function( elem ) {
		return data_user.hasData( elem ) || data_priv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return data_user.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		data_user.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to data_priv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return data_priv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		data_priv.remove( elem, name );
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = data_user.get( elem );

				if ( elem.nodeType === 1 && !data_priv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice(5) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					data_priv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				data_user.set( this, key );
			});
		}

		return access( this, function( value ) {
			var data,
				camelKey = jQuery.camelCase( key );

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {
				// Attempt to get data from the cache
				// with the key as-is
				data = data_user.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to get data from the cache
				// with the key camelized
				data = data_user.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each(function() {
				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = data_user.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				data_user.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf("-") !== -1 && data !== undefined ) {
					data_user.set( this, key, value );
				}
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			data_user.remove( this, key );
		});
	}
});


jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = data_priv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = data_priv.access( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return data_priv.get( elem, key ) || data_priv.access( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				data_priv.remove( elem, [ type + "queue", key ] );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = data_priv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;

var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {
		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
	};

var rcheckableType = (/^(?:checkbox|radio)$/i);



(function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Safari<=5.1
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari<=5.1, Android<4.2
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<=11+
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
})();
var strundefined = typeof undefined;



support.focusinBubbles = "onfocusin" in window;


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== strundefined && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.hasData( elem ) && data_priv.get( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;
			data_priv.remove( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( data_priv.get( cur, "events" ) || {} )[ event.type ] && data_priv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && jQuery.acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( data_priv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: Cordova 2.5 (WebKit) (#13255)
		// All events should have a target; Cordova deviceready doesn't
		if ( !event.target ) {
			event.target = document;
		}

		// Support: Safari 6.0+, Chrome<28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle, false );
	}
};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&
				// Support: Android<4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && e.preventDefault ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && e.stopPropagation ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// Support: Chrome 15+
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// Support: Firefox, Chrome, Safari
// Create "bubbling" focus and blur events
if ( !support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				data_priv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					data_priv.remove( doc, fix );

				} else {
					data_priv.access( doc, fix, attaches );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});


var
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {

		// Support: IE9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

// Support: IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// Support: 1.x compatibility
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute("type");
	}

	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		data_priv.set(
			elems[ i ], "globalEval", !refElements || data_priv.get( refElements[ i ], "globalEval" )
		);
	}
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( data_priv.hasData( src ) ) {
		pdataOld = data_priv.access( src );
		pdataCur = data_priv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( data_user.hasData( src ) ) {
		udataOld = data_user.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		data_user.set( dest, udataCur );
	}
}

function getAll( context, tag ) {
	var ret = context.getElementsByTagName ? context.getElementsByTagName( tag || "*" ) :
			context.querySelectorAll ? context.querySelectorAll( tag || "*" ) :
			[];

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], ret ) :
		ret;
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					// Support: QtWebKit, PhantomJS
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: QtWebKit, PhantomJS
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	},

	cleanData: function( elems ) {
		var data, elem, type, key,
			special = jQuery.event.special,
			i = 0;

		for ( ; (elem = elems[ i ]) !== undefined; i++ ) {
			if ( jQuery.acceptData( elem ) ) {
				key = elem[ data_priv.expando ];

				if ( key && (data = data_priv.cache[ key ]) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}
					if ( data_priv.cache[ key ] ) {
						// Discard any remaining `private` data
						delete data_priv.cache[ key ];
					}
				}
			}
			// Discard any remaining `user` data
			delete data_user.cache[ elem[ data_user.expando ] ];
		}
	}
});

jQuery.fn.extend({
	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each(function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				});
		}, null, value, arguments.length );
	},

	append: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	remove: function( selector, keepData /* Internal Use Only */ ) {
		var elem,
			elems = selector ? jQuery.filter( selector, this ) : this,
			i = 0;

		for ( ; (elem = elems[i]) != null; i++ ) {
			if ( !keepData && elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem ) );
			}

			if ( elem.parentNode ) {
				if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
					setGlobalEval( getAll( elem, "script" ) );
				}
				elem.parentNode.removeChild( elem );
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map(function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var arg = arguments[ 0 ];

		// Make the changes, replacing each context element with the new content
		this.domManip( arguments, function( elem ) {
			arg = this.parentNode;

			jQuery.cleanData( getAll( this ) );

			if ( arg ) {
				arg.replaceChild( elem, this );
			}
		});

		// Force removal if there was no new content (e.g., from empty arguments)
		return arg && (arg.length || arg.nodeType) ? this : this.remove();
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				self.domManip( args, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							// Support: QtWebKit
							// jQuery.merge because push.apply(_, arraylike) throws
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( this[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!data_priv.access( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}

		return this;
	}
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: QtWebKit
			// .get() because push.apply(_, arraylike) throws
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});


var iframe,
	elemdisplay = {};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */
// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var style,
		elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		// getDefaultComputedStyle might be reliably used only on attached element
		display = window.getDefaultComputedStyle && ( style = window.getDefaultComputedStyle( elem[ 0 ] ) ) ?

			// Use of this method is a temporary fix (more like optimization) until something better comes along,
			// since it was removed from specification and supported only in FF
			style.display : jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = (iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" )).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = iframe[ 0 ].contentDocument;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = (/^margin/);

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {
		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		if ( elem.ownerDocument.defaultView.opener ) {
			return elem.ownerDocument.defaultView.getComputedStyle( elem, null );
		}

		return window.getComputedStyle( elem, null );
	};



function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		style = elem.style;

	computed = computed || getStyles( elem );

	// Support: IE9
	// getPropertyValue is only needed for .css('filter') (#12537)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];
	}

	if ( computed ) {

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// Support: iOS < 6
		// A tribute to the "awesome hack by Dean Edwards"
		// iOS < 6 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
		// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
		if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?
		// Support: IE
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {
	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {
				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return (this.get = hookFn).apply( this, arguments );
		}
	};
}


(function() {
	var pixelPositionVal, boxSizingReliableVal,
		docElem = document.documentElement,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	if ( !div.style ) {
		return;
	}

	// Support: IE9-11+
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" +
		"position:absolute";
	container.appendChild( div );

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computePixelPositionAndBoxSizingReliable() {
		div.style.cssText =
			// Support: Firefox<29, Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
			"box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
			"border:1px;padding:1px;width:4px;position:absolute";
		div.innerHTML = "";
		docElem.appendChild( container );

		var divStyle = window.getComputedStyle( div, null );
		pixelPositionVal = divStyle.top !== "1%";
		boxSizingReliableVal = divStyle.width === "4px";

		docElem.removeChild( container );
	}

	// Support: node.js jsdom
	// Don't assume that getComputedStyle is a property of the global object
	if ( window.getComputedStyle ) {
		jQuery.extend( support, {
			pixelPosition: function() {

				// This test is executed only once but we still do memoizing
				// since we can use the boxSizingReliable pre-computing.
				// No need to check if the test was already performed, though.
				computePixelPositionAndBoxSizingReliable();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				if ( boxSizingReliableVal == null ) {
					computePixelPositionAndBoxSizingReliable();
				}
				return boxSizingReliableVal;
			},
			reliableMarginRight: function() {

				// Support: Android 2.3
				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// This support function is only executed once so no memoizing is needed.
				var ret,
					marginDiv = div.appendChild( document.createElement( "div" ) );

				// Reset CSS: box-sizing; display; margin; border; padding
				marginDiv.style.cssText = div.style.cssText =
					// Support: Firefox<29, Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
					"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";
				docElem.appendChild( container );

				ret = !parseFloat( window.getComputedStyle( marginDiv, null ).marginRight );

				docElem.removeChild( container );
				div.removeChild( marginDiv );

				return ret;
			}
		});
	}
})();


// A method for quickly swapping in/out CSS properties to get correct calculations.
jQuery.swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var
	// Swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + pnum + ")", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// Shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// Check for vendor prefixed names
	var capName = name[0].toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// Both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// At this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// At this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// At this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// Some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// Check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// Use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = data_priv.get( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = data_priv.access( elem, "olddisplay", defaultDisplay(elem.nodeName) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display !== "none" || !hidden ) {
				data_priv.set( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.extend({

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Support: IE9-11+
			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				style[ name ] = value;
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	}
});

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) && elem.offsetWidth === 0 ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

// Support: Android 2.3
jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return jQuery.swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});

jQuery.fn.extend({
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each(function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE9
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	}
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value ),
				target = tween.cur(),
				parts = rfxnum.exec( value ),
				unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

				// Starting value computation is required for potential unit mismatches
				start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
					rfxnum.exec( jQuery.css( tween.elem, prop ) ),
				scale = 1,
				maxIterations = 20;

			if ( start && start[ 3 ] !== unit ) {
				// Trust units reported by jQuery.css
				unit = unit || start[ 3 ];

				// Make sure we update the tween properties later on
				parts = parts || [];

				// Iteratively approximate from a nonzero starting point
				start = +target || 1;

				do {
					// If previous iteration zeroed out, double until we get *something*.
					// Use string for doubling so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					start = start / scale;
					jQuery.style( tween.elem, prop, start + unit );

				// Update scale, tolerating zero or NaN from tween.cur(),
				// break the loop if scale is unchanged or perfect, or if we've just had enough
				} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
			}

			// Update tween properties
			if ( parts ) {
				start = tween.start = +start || +target || 0;
				tween.unit = unit;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[ 1 ] ?
					start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
					+parts[ 2 ];
			}

			return tween;
		} ]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( (tween = collection[ index ].call( animation, prop, value )) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = data_priv.get( elem, "fxshow" );

	// Handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// Ensure the complete handler is called before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// Height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE9-10 do not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			data_priv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
			style.display = "inline-block";
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always(function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		});
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = data_priv.access( elem, "fxshow", {} );
		}

		// Store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;

			data_priv.remove( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( (display === "none" ? defaultDisplay( elem.nodeName ) : display) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// Don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || data_priv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = data_priv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = data_priv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		});
	}
});

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = setTimeout( next, time );
		hooks.stop = function() {
			clearTimeout( timeout );
		};
	});
};


(function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: iOS<=5.1, Android<=4.2+
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE<=11+
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: Android<=2.3
	// Options inside disabled selects are incorrectly marked as disabled
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<=11+
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
})();


var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend({
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	}
});

jQuery.extend({
	attr: function( elem, name, value ) {
		var hooks, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {
			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {
					// Set corresponding property to false
					elem[ propName ] = false;
				}

				elem.removeAttribute( name );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	}
});

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle;
		if ( !isXML ) {
			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ name ];
			attrHandle[ name ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				name.toLowerCase() :
				null;
			attrHandle[ name ] = handle;
		}
		return ret;
	};
});




var rfocusable = /^(?:input|select|textarea|button)$/i;

jQuery.fn.extend({
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each(function() {
			delete this[ jQuery.propFix[ name ] || name ];
		});
	}
});

jQuery.extend({
	propFix: {
		"for": "htmlFor",
		"class": "className"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
				ret :
				( elem[ name ] = value );

		} else {
			return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
				ret :
				elem[ name ];
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				return elem.hasAttribute( "tabindex" ) || rfocusable.test( elem.nodeName ) || elem.href ?
					elem.tabIndex :
					-1;
			}
		}
	}
});

if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		}
	};
}

jQuery.each([
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
});




var rclass = /[\t\r\n\f]/g;

jQuery.fn.extend({
	addClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = arguments.length === 0 || typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = value ? jQuery.trim( cur ) : "";
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// Toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					classNames = value.match( rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( type === strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					data_priv.set( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : data_priv.get( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	}
});




var rreturn = /\r/g;

jQuery.fn.extend({
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// Handle most common string cases
					ret.replace(rreturn, "") :
					// Handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :
					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					jQuery.trim( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// IE6-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ? !option.disabled : option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];
					if ( (option.selected = jQuery.inArray( option.value, values ) >= 0) ) {
						optionSet = true;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
});

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute("value") === null ? "on" : elem.value;
		};
	}
});




// Return jQuery for attributes-only inclusion


jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.extend({
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	}
});


var nonce = jQuery.now();

var rquery = (/\?/);



// Support: Android 2.3
// Workaround failure to string-cast null input
jQuery.parseJSON = function( data ) {
	return JSON.parse( data + "" );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE9
	try {
		tmp = new DOMParser();
		xml = tmp.parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Document location
	ajaxLocation = window.location.href,

	// Segment location into parts
	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

		// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,
			// URL without anti-cache param
			cacheURL,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {
				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// Shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});


jQuery._evalUrl = function( url ) {
	return jQuery.ajax({
		url: url,
		type: "GET",
		dataType: "script",
		async: false,
		global: false,
		"throws": true
	});
};


jQuery.fn.extend({
	wrapAll: function( html ) {
		var wrap;

		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapAll( html.call(this, i) );
			});
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	}
});


jQuery.expr.filters.hidden = function( elem ) {
	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
};
jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function() {
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		})
		.map(function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});


jQuery.ajaxSettings.xhr = function() {
	try {
		return new XMLHttpRequest();
	} catch( e ) {}
};

var xhrId = 0,
	xhrCallbacks = {},
	xhrSuccessStatus = {
		// file protocol always yields status code 0, assume 200
		0: 200,
		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE9
// Open requests must be manually aborted on unload (#5280)
// See https://support.microsoft.com/kb/2856746 for more info
if ( window.attachEvent ) {
	window.attachEvent( "onunload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]();
		}
	});
}

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport(function( options ) {
	var callback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr(),
					id = ++xhrId;

				xhr.open( options.type, options.url, options.async, options.username, options.password );

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers["X-Requested-With"] ) {
					headers["X-Requested-With"] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							delete xhrCallbacks[ id ];
							callback = xhr.onload = xhr.onerror = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {
								complete(
									// file: protocol always yields status 0; see #8605, #14207
									xhr.status,
									xhr.statusText
								);
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,
									// Support: IE9
									// Accessing binary-data responseText throws an exception
									// (#11426)
									typeof xhr.responseText === "string" ? {
										text: xhr.responseText
									} : undefined,
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				xhr.onerror = callback("error");

				// Create the abort callback
				callback = xhrCallbacks[ id ] = callback("abort");

				try {
					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {
					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {
	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery("<script>").prop({
					async: true,
					charset: s.scriptCharset,
					src: s.url
				}).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});




// data: string of html
// context (optional): If specified, the fragment will be created in this context, defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[1] ) ];
	}

	parsed = jQuery.buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = jQuery.trim( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
});




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep(jQuery.timers, function( fn ) {
		return elem === fn.elem;
	}).length;
};




var docElem = window.document.documentElement;

/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend({
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
		}

		var docElem, win,
			elem = this[ 0 ],
			box = { top: 0, left: 0 },
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// Support: BlackBerry 5, iOS 3 (original iPhone)
		// If we don't have gBCR, just use 0,0 rather than error
		if ( typeof elem.getBoundingClientRect !== strundefined ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top + win.pageYOffset - docElem.clientTop,
			left: box.left + win.pageXOffset - docElem.clientLeft
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// Assume getBoundingClientRect is there when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || docElem;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || docElem;
		});
	}
});

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : window.pageXOffset,
					top ? val : window.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

// Support: Safari<7+, Chrome<37+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );
				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
});


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});


// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	});
}




var
	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === strundefined ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;

}));



