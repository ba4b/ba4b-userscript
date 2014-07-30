// Generated by CommonJS Everywhere 0.9.7
(function (global) {
  function require(file, parentModule) {
    if ({}.hasOwnProperty.call(require.cache, file))
      return require.cache[file];
    var resolved = require.resolve(file);
    if (!resolved)
      throw new Error('Failed to resolve module ' + file);
    var module$ = {
        id: file,
        require: require,
        filename: file,
        exports: {},
        loaded: false,
        parent: parentModule,
        children: []
      };
    if (parentModule)
      parentModule.children.push(module$);
    var dirname = file.slice(0, file.lastIndexOf('/') + 1);
    require.cache[file] = module$.exports;
    resolved.call(module$.exports, module$, module$.exports, dirname, file);
    module$.loaded = true;
    return require.cache[file] = module$.exports;
  }
  require.modules = {};
  require.cache = {};
  require.resolve = function (file) {
    return {}.hasOwnProperty.call(require.modules, file) ? require.modules[file] : void 0;
  };
  require.define = function (file, fn) {
    require.modules[file] = fn;
  };
  var process = function () {
      var cwd = '/';
      return {
        title: 'browser',
        version: 'v0.10.26',
        browser: true,
        env: {},
        argv: [],
        nextTick: global.setImmediate || function (fn) {
          setTimeout(fn, 0);
        },
        cwd: function () {
          return cwd;
        },
        chdir: function (dir) {
          cwd = dir;
        }
      };
    }();
  require.define('/ba4b-userscript.coffee', function (module, exports, __dirname, __filename) {
    var defaultConfig, Downloader, ImageChanger, libs, main, Storage;
    libs = { $: jQuery };
    Downloader = require('/util/downloader.coffee', module);
    defaultConfig = require('/config.js', module);
    ImageChanger = require('/view/image_replacer.coffee', module);
    Storage = require('/util/storage.coffee', module);
    main = function ($) {
      var config, downloader, imageChanger, storage;
      downloader = new Downloader;
      imageChanger = new ImageChanger($);
      downloader.responseType = 'json';
      storage = new Storage(GM_getValue, GM_setValue);
      config = storage.get(config, defaultConfig);
      if (null != storage.get('list') && storage.get('expire') > Date.now()) {
        imageChanger.change(storage.get('list'));
      } else {
        downloader.on('success', function (obj) {
          imageChanger.change(obj.list);
          storage.set('expire', Date.now() + config.expireTime * 1e3);
          storage.set('list', obj.list);
          return true;
        });
        downloader.download(config.path);
      }
      return true;
    };
    if (window === window.top)
      main(libs.$);
  });
  require.define('/util/storage.coffee', function (module, exports, __dirname, __filename) {
    var GM_Storage;
    GM_Storage = function () {
      function GM_Storage(getMethod, setMethod, namespace) {
        if (null == namespace)
          namespace = 'ba4b';
        this._get = getMethod;
        this._set = setMethod;
        this.namespace = namespace;
        this.cache = null;
        this._load();
      }
      GM_Storage.prototype.set = function (key, value) {
        this._load();
        this.cache[key] = value;
        return this._save();
      };
      GM_Storage.prototype.get = function (key, defaultValue) {
        this._load();
        if (this.cache[key]) {
          return this.cache[key];
        } else if (null != defaultValue) {
          return defaultValue;
        } else {
          return void 0;
        }
      };
      GM_Storage.prototype.remove = function (key) {
        this._load();
        delete cache[key];
        return this._save();
      };
      GM_Storage.prototype.reload = function () {
        return this._load;
      };
      GM_Storage.prototype._load = function () {
        if (GM_getValue(this.namespace)) {
          return this.cache = JSON.parse(GM_getValue(this.namespace));
        } else {
          this.cache = {};
          return this._save;
        }
      };
      GM_Storage.prototype._save = function () {
        return GM_setValue(this.namespace, JSON.stringify(this.cache));
      };
      return GM_Storage;
    }();
    module.exports = GM_Storage;
  });
  require.define('/view/image_replacer.coffee', function (module, exports, __dirname, __filename) {
    var ImageReplacer;
    ImageReplacer = function () {
      function ImageReplacer(jQuery) {
        this.$ = jQuery;
      }
      ImageReplacer.prototype.change = function (list) {
        var format, images, result;
        images = this.$('img');
        result = false;
        format = /http:\/\/avatar2.bahamut.com.tw\/avataruserpic\/\w\/\w\/(\w+)\/.*/g;
        images = images.filter(function () {
          var str;
          str = this.src;
          return format.test(str);
        });
        images.each(function () {
          var name, str, value;
          str = this.src;
          name = str.split('/');
          name = name[6];
          for (var i$ = 0, length$ = list.length; i$ < length$; ++i$) {
            value = list[i$];
            if (value.BAHA_ID === name) {
              if (str.search('_s') >= 0) {
                this.src = 'http://www.gravatar.com/avatar/' + value.HASHED_MAIL + '?s=40';
              } else {
                this.src = 'http://www.gravatar.com/avatar/' + value.HASHED_MAIL + '?s=110';
              }
              result = true;
              return true;
            }
          }
          return true;
        });
        return true;
      };
      return ImageReplacer;
    }();
    module.exports = ImageReplacer;
  });
  require.define('/config.js', function (module, exports, __dirname, __filename) {
    var config = {
        path: '',
        expireTime: '1800'
      };
    module.exports = config;
  });
  require.define('/util/downloader.coffee', function (module, exports, __dirname, __filename) {
    var Downloader, EventEmitter;
    EventEmitter = require('events', module).EventEmitter;
    Downloader = function (super$) {
      extends$(Downloader, super$);
      function Downloader() {
        this.locked = false;
        this.responseType = '';
      }
      Downloader.prototype.download = function (url) {
        if (this.locked) {
          console.log('incorrect invoke');
          return false;
        }
        this.locked = true;
        console.log('download start : ' + url);
        GM_xmlhttpRequest({
          url: url,
          onload: function (this$) {
            return function (e) {
              var response;
              response = e.responseText;
              console.log('download finish : ' + url);
              if (this$.responseType === 'json')
                response = JSON.parse(response);
              if (!response) {
                this$.emit('fail', url);
                return true;
              }
              this$.emit('success', response);
              return true;
            };
          }(this),
          onerror: function (this$) {
            return function (e) {
              this$.emit('fail', url);
              this$.locked = false;
              return true;
            };
          }(this),
          method: 'GET'
        });
        return true;
      };
      return Downloader;
    }(EventEmitter);
    module.exports = Downloader;
    function isOwn$(o, p) {
      return {}.hasOwnProperty.call(o, p);
    }
    function extends$(child, parent) {
      for (var key in parent)
        if (isOwn$(parent, key))
          child[key] = parent[key];
      function ctor() {
        this.constructor = child;
      }
      ctor.prototype = parent.prototype;
      child.prototype = new ctor;
      child.__super__ = parent.prototype;
      return child;
    }
  });
  require.define('events', function (module, exports, __dirname, __filename) {
    if (!process.EventEmitter)
      process.EventEmitter = function () {
      };
    var EventEmitter = exports.EventEmitter = process.EventEmitter;
    var isArray = typeof Array.isArray === 'function' ? Array.isArray : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]';
      };
    var defaultMaxListeners = 10;
    EventEmitter.prototype.setMaxListeners = function (n) {
      if (!this._events)
        this._events = {};
      this._events.maxListeners = n;
    };
    EventEmitter.prototype.emit = function (type) {
      if (type === 'error') {
        if (!this._events || !this._events.error || isArray(this._events.error) && !this._events.error.length) {
          if (arguments[1] instanceof Error) {
            throw arguments[1];
          } else {
            throw new Error("Uncaught, unspecified 'error' event.");
          }
          return false;
        }
      }
      if (!this._events)
        return false;
      var handler = this._events[type];
      if (!handler)
        return false;
      if (typeof handler == 'function') {
        switch (arguments.length) {
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
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
    EventEmitter.prototype.addListener = function (type, listener) {
      if ('function' !== typeof listener) {
        throw new Error('addListener only takes instances of Function');
      }
      if (!this._events)
        this._events = {};
      this.emit('newListener', type, listener);
      if (!this._events[type]) {
        this._events[type] = listener;
      } else if (isArray(this._events[type])) {
        if (!this._events[type].warned) {
          var m;
          if (this._events.maxListeners !== undefined) {
            m = this._events.maxListeners;
          } else {
            m = defaultMaxListeners;
          }
          if (m && m > 0 && this._events[type].length > m) {
            this._events[type].warned = true;
            console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
            console.trace();
          }
        }
        this._events[type].push(listener);
      } else {
        this._events[type] = [
          this._events[type],
          listener
        ];
      }
      return this;
    };
    EventEmitter.prototype.on = EventEmitter.prototype.addListener;
    EventEmitter.prototype.once = function (type, listener) {
      var self = this;
      self.on(type, function g() {
        self.removeListener(type, g);
        listener.apply(this, arguments);
      });
      return this;
    };
    EventEmitter.prototype.removeListener = function (type, listener) {
      if ('function' !== typeof listener) {
        throw new Error('removeListener only takes instances of Function');
      }
      if (!this._events || !this._events[type])
        return this;
      var list = this._events[type];
      if (isArray(list)) {
        var i = list.indexOf(listener);
        if (i < 0)
          return this;
        list.splice(i, 1);
        if (list.length == 0)
          delete this._events[type];
      } else if (this._events[type] === listener) {
        delete this._events[type];
      }
      return this;
    };
    EventEmitter.prototype.removeAllListeners = function (type) {
      if (type && this._events && this._events[type])
        this._events[type] = null;
      return this;
    };
    EventEmitter.prototype.listeners = function (type) {
      if (!this._events)
        this._events = {};
      if (!this._events[type])
        this._events[type] = [];
      if (!isArray(this._events[type])) {
        this._events[type] = [this._events[type]];
      }
      return this._events[type];
    };
  });
  global.ba4b = require('/ba4b-userscript.coffee');
}.call(this, this));
//# sourceMappingURL=ba4b-userscript.js.map 
// ba4b-userscript.js   https://github.com/ba4b/ba4b-userscript 
