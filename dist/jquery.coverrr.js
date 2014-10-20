(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  (function($, window, document) {
    var Plugin, defaults, getPrefixes, pluginName, _css;
    pluginName = "coverrr";
    defaults = {
      duration: 20,
      direction: 'alternate',
      delay: 0,
      timingFunction: 'ease-in-out',
      iterationCount: 'infinite'
    };
    _css = {
      animation: false,
      transform: false,
      animation_string: 'animation',
      transform_string: 'transform',
      prefix: ''
    };
    Plugin = (function() {
      function Plugin(el, options) {
        this.el = el;
        this.init = __bind(this.init, this);
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this._el = $(this.el);
        this.oldSize = [0, 0];
        this.cover = $('<img>');
        this.img = {
          src: this.getImageSrc(),
          w: 0,
          h: 0,
          ratio: 0
        };
        if (_css.animation === true) {
          this.getBg().then(this.init);
        } else {
          console.log('Your browser does not support CSS animations. ' + pluginName + ' won\'t run this time');
        }
      }

      Plugin.prototype.init = function() {
        this.convertBgToCover();
        this.update();
        return $(window).smartresize((function(_this) {
          return function() {
            if (!(_this._el.outerWidth() === _this.oldSize[0] && _this._el.outerHeight() === _this.oldSize[1])) {
              return _this.update();
            }
          };
        })(this));
      };

      Plugin.prototype.convertBgToCover = function() {
        var pos;
        pos = this._el.css('position');
        if (pos === 'static') {
          pos = 'relative';
        }
        this._el.css({
          'overflow': 'hidden',
          'background-image': 'none',
          'position': pos
        });
        this.cover.attr('src', this.img.src);
        this.cover.css({
          'top': 0,
          'left': 0,
          'position': 'absolute',
          'z-index': -1
        });
        return this.cover.prependTo(this._el);
      };

      Plugin.prototype.update = function() {
        var diff, elRatio, elSize, keyframes, s;
        this.id = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        elSize = [this._el.outerWidth(), this._el.outerHeight()];
        this.oldSize = elSize;
        elRatio = elSize[0] / elSize[1];
        this.cover[0].style[_css.animation_string] = 'coverrr' + this.id + ' ' + this.settings.duration + 's ' + this.settings.timingFunction + ' ' + this.settings.delay + 's ' + this.settings.iterationCount + ' ' + this.settings.direction;
        if (elRatio > this.img.ratio) {
          diff = Math.round(elSize[1] - elSize[0] * this.img.h / this.img.w);
          this.cover.css({
            'width': elSize[0] + 'px',
            'height': 'auto'
          });
          keyframes = '@' + _css.prefix + 'keyframes coverrr' + this.id + ' { ' + 'from {' + _css.prefix + 'transform:translateY( 0 ) }' + 'to {' + _css.prefix + 'transform:translateY( ' + diff + 'px ) }' + '}';
        } else {
          diff = Math.round(elSize[0] - elSize[1] * this.img.w / this.img.h);
          this.cover.css({
            'width': 'auto',
            'height': elSize[1] + 'px'
          });
          keyframes = '@' + _css.prefix + 'keyframes coverrr' + this.id + ' { ' + 'from {' + _css.prefix + 'transform:translateX( 0 ) }' + 'to {' + _css.prefix + 'transform:translateX( ' + diff + 'px ) }' + '}';
        }
        if (document.styleSheets && document.styleSheets.length) {
          return document.styleSheets[0].insertRule(keyframes, 0);
        } else {
          s = document.createElement("style");
          s.innerHTML = keyframes;
          return document.getElementsByTagName("head")[0].appendChild(s);
        }
      };

      Plugin.prototype.getImageSrc = function() {
        var i;
        i = ($(this.el)).css('background-image');
        return i.replace(/url\((['"])?(.*?)\1\)/gi, '$2').split(',')[0];
      };

      Plugin.prototype.getBg = function() {
        var deferred;
        deferred = $.Deferred();
        this.loadImage(this.img.src).done((function(_this) {
          return function(image) {
            _this.img.w = image.width;
            _this.img.h = image.height;
            _this.img.ratio = image.width / image.height;
            return deferred.resolve();
          };
        })(this));
        return deferred.promise();
      };

      Plugin.prototype.loadImage = function(src) {
        return $.Deferred(function(task) {
          var image;
          image = new Image();
          image.onload = function() {
            task.resolve(image);
          };
          image.onerror = function() {
            task.reject();
          };
          image.src = src;
        }).promise();
      };

      return Plugin;

    })();
    (getPrefixes = function() {
      var el, i, pfx, prefixes;
      prefixes = 'Webkit Moz O ms Khtml'.split(' ');
      el = document.createElement('p');
      document.body.insertBefore(el, null);
      if (el.style.animationName) {
        _css.animation = true;
      }
      if (el.style.transform) {
        _css.transform = true;
      }
      if (_css.animation === false) {
        i = 0;
        while (i < prefixes.length) {
          if (el.style[prefixes[i] + "AnimationName"] !== undefined) {
            pfx = prefixes[i];
            _css.animation_string = pfx + "Animation";
            _css.prefix = "-" + pfx.toLowerCase() + "-";
            _css.animation = true;
            break;
          }
          i++;
        }
      }
      if (_css.transform === false) {
        i = 0;
        while (i < prefixes.length) {
          if (el.style[prefixes[i] + "Transform"] !== undefined) {
            pfx = prefixes[i];
            _css.transform_string = pfx + "Transform";
            _css.animation = true;
            break;
          }
          i++;
        }
      }
      return document.body.removeChild(el);
    })();
    return $.fn[pluginName] = function(options) {
      var debounce, sr;
      this.each(function() {
        if (!$.data(this, "plugin_" + pluginName)) {
          return $.data(this, "plugin_" + pluginName, new Plugin(this, options));
        }
      });
      debounce = function(func, threshold, execAsap) {
        var debounced, timeout;
        timeout = void 0;
        return debounced = function() {
          var args, delayed, obj;
          delayed = function() {
            if (!execAsap) {
              func.apply(obj, args);
            }
            timeout = null;
          };
          obj = this;
          args = arguments;
          if (timeout) {
            clearTimeout(timeout);
          } else {
            if (execAsap) {
              func.apply(obj, args);
            }
          }
          timeout = setTimeout(delayed, threshold || 200);
        };
      };
      sr = 'smartresize';
      return $.fn[sr] = function(fn) {
        if (fn) {
          return this.bind("resize", debounce(fn));
        } else {
          return this.trigger(sr);
        }
      };
    };
  })(jQuery, window, document);

}).call(this);
