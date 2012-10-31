var mejs = mejs || {};
mejs.version = '2.6.5';
mejs.meIndex = 0;
mejs.plugins = {silverlight: [{version: [3, 0],types: ['video/mp4', 'video/m4v', 'video/mov', 'video/wmv', 'audio/wma', 'audio/m4a', 'audio/mp3', 'audio/wav', 'audio/mpeg']}],flash: [{version: [9, 0, 124],types: ['video/mp4', 'video/m4v', 'video/mov', 'video/flv', 'video/x-flv', 'audio/flv', 'audio/x-flv', 'audio/mp3', 'audio/m4a', 'audio/mpeg']}],youtube: [{version: null,types: ['video/youtube']}]};
mejs.Utility = {encodeUrl: function(url) {
        return encodeURIComponent(url);
    },escapeHTML: function(s) {
        return s.toString().split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
    },absolutizeUrl: function(url) {
        var el = document.createElement('div');
        el.innerHTML = '<a href="' + this.escapeHTML(url) + '">x</a>';
        return el.firstChild.href;
    },getScriptPath: function(scriptNames) {
        var 
        i = 0, j, path = '', name = '', script, scripts = document.getElementsByTagName('script');
        for (; i < scripts.length; i++) {
            script = scripts[i].src;
            for (j = 0; j < scriptNames.length; j++) {
                name = scriptNames[j];
                if (script.indexOf(name) > -1) {
                    path = script.substring(0, script.indexOf(name));
                    break;
                }
            }
            if (path !== '') {
                break;
            }
        }
        return path;
    },secondsToTimeCode: function(time, forceHours, showFrameCount, fps) {
        if (typeof showFrameCount == 'undefined') {
            showFrameCount = false;
        } else if (typeof fps == 'undefined') {
            fps = 25;
        }
        var hours = Math.floor(time / 3600) % 24, minutes = Math.floor(time / 60) % 60, seconds = Math.floor(time % 60), frames = Math.floor(((time % 1) * fps).toFixed(3));
        if (minutes < 0)
            minutes = 0;
        if (seconds < 0)
            seconds = 0;
        var result = ((forceHours || hours > 0) ? (hours < 10 ? '0' + hours : hours) + ':' : '') + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds) + ((showFrameCount) ? ':' + (frames < 10 ? '0' + frames : frames) : '');
        return result;
    },timeCodeToSeconds: function(hh_mm_ss_ff, forceHours, showFrameCount, fps) {
        if (typeof showFrameCount == 'undefined') {
            showFrameCount = false;
        } else if (typeof fps == 'undefined') {
            fps = 25;
        }
        var tc_array = hh_mm_ss_ff.split(":"), tc_hh = parseInt(tc_array[0], 10), tc_mm = parseInt(tc_array[1], 10), tc_ss = parseInt(tc_array[2], 10), tc_ff = 0, tc_in_seconds = 0;
        if (showFrameCount) {
            tc_ff = parseInt(tc_array[3]) / fps;
        }
        tc_in_seconds = (tc_hh * 3600) + (tc_mm * 60) + tc_ss + tc_ff;
        return tc_in_seconds;
    },removeSwf: function(id) {
        var obj = document.getElementById(id);
        if (obj && obj.nodeName == "OBJECT") {
            if (mejs.MediaFeatures.isIE) {
                obj.style.display = "none";
                (function() {
                    if (obj.readyState == 4) {
                        mejs.Utility.removeObjectInIE(id);
                    } else {
                        setTimeout(arguments.callee, 10);
                    }
                })();
            } else {
                obj.parentNode.removeChild(obj);
            }
        }
    },removeObjectInIE: function(id) {
        var obj = document.getElementById(id);
        if (obj) {
            for (var i in obj) {
                if (typeof obj[i] == "function") {
                    obj[i] = null;
                }
            }
            obj.parentNode.removeChild(obj);
        }
    }};
mejs.PluginDetector = {hasPluginVersion: function(plugin, v) {
        var pv = this.plugins[plugin];
        v[1] = v[1] || 0;
        v[2] = v[2] || 0;
        return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
    },nav: window.navigator,ua: window.navigator.userAgent.toLowerCase(),plugins: [],addPlugin: function(p, pluginName, mimeType, activeX, axDetect) {
        this.plugins[p] = this.detectPlugin(pluginName, mimeType, activeX, axDetect);
    },detectPlugin: function(pluginName, mimeType, activeX, axDetect) {
        var version = [0, 0, 0], description, i, ax;
        if (typeof (this.nav.plugins) != 'undefined' && typeof this.nav.plugins[pluginName] == 'object') {
            description = this.nav.plugins[pluginName].description;
            if (description && !(typeof this.nav.mimeTypes != 'undefined' && this.nav.mimeTypes[mimeType] && !this.nav.mimeTypes[mimeType].enabledPlugin)) {
                version = description.replace(pluginName, '').replace(/^\s+/, '').replace(/\sr/gi, '.').split('.');
                for (i = 0; i < version.length; i++) {
                    version[i] = parseInt(version[i].match(/\d+/), 10);
                }
            }
        } else if (typeof (window.ActiveXObject) != 'undefined') {
            try {
                ax = new ActiveXObject(activeX);
                if (ax) {
                    version = axDetect(ax);
                }
            } 
            catch (e) {
            }
        }
        return version;
    }};
mejs.PluginDetector.addPlugin('flash', 'Shockwave Flash', 'application/x-shockwave-flash', 'ShockwaveFlash.ShockwaveFlash', function(ax) {
    var version = [], d = ax.GetVariable("$version");
    if (d) {
        d = d.split(" ")[1].split(",");
        version = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
    }
    return version;
});
mejs.PluginDetector.addPlugin('silverlight', 'Silverlight Plug-In', 'application/x-silverlight-2', 'AgControl.AgControl', function(ax) {
    var v = [0, 0, 0, 0], loopMatch = function(ax, v, i, n) {
        while (ax.isVersionSupported(v[0] + "." + v[1] + "." + v[2] + "." + v[3])) {
            v[i] += n;
        }
        v[i] -= n;
    };
    loopMatch(ax, v, 0, 1);
    loopMatch(ax, v, 1, 1);
    loopMatch(ax, v, 2, 10000);
    loopMatch(ax, v, 2, 1000);
    loopMatch(ax, v, 2, 100);
    loopMatch(ax, v, 2, 10);
    loopMatch(ax, v, 2, 1);
    loopMatch(ax, v, 3, 1);
    return v;
});
mejs.MediaFeatures = {init: function() {
        var 
        t = this, d = document, nav = mejs.PluginDetector.nav, ua = mejs.PluginDetector.ua.toLowerCase(), i, v, html5Elements = ['source', 'track', 'audio', 'video'];
        t.isiPad = (ua.match(/ipad/i) !== null);
        t.isiPhone = (ua.match(/iphone/i) !== null);
        t.isiOS = t.isiPhone || t.isiPad;
        t.isAndroid = (ua.match(/android/i) !== null);
        t.isBustedAndroid = (ua.match(/android 2\.[12]/) !== null);
        t.isIE = (nav.appName.toLowerCase().indexOf("microsoft") != -1);
        t.isChrome = (ua.match(/chrome/gi) !== null);
        t.isFirefox = (ua.match(/firefox/gi) !== null);
        t.isWebkit = (ua.match(/webkit/gi) !== null);
        t.isGecko = (ua.match(/gecko/gi) !== null) && !t.isWebkit;
        t.isOpera = (ua.match(/opera/gi) !== null);
        t.hasTouch = ('ontouchstart' in window);
        for (i = 0; i < html5Elements.length; i++) {
            v = document.createElement(html5Elements[i]);
        }
        t.supportsMediaTag = (typeof v.canPlayType !== 'undefined' || t.isBustedAndroid);
        t.hasSemiNativeFullScreen = (typeof v.webkitEnterFullscreen !== 'undefined');
        t.hasWebkitNativeFullScreen = (typeof v.webkitRequestFullScreen !== 'undefined');
        t.hasMozNativeFullScreen = (typeof v.mozRequestFullScreen !== 'undefined');
        t.hasTrueNativeFullScreen = (t.hasWebkitNativeFullScreen || t.hasMozNativeFullScreen);
        t.nativeFullScreenEnabled = t.hasTrueNativeFullScreen;
        if (t.hasMozNativeFullScreen) {
            t.nativeFullScreenEnabled = v.mozFullScreenEnabled;
        }
        if (this.isChrome) {
            t.hasSemiNativeFullScreen = false;
        }
        if (t.hasTrueNativeFullScreen) {
            t.fullScreenEventName = (t.hasWebkitNativeFullScreen) ? 'webkitfullscreenchange' : 'mozfullscreenchange';
            t.isFullScreen = function() {
                if (v.mozRequestFullScreen) {
                    return d.mozFullScreen;
                } else if (v.webkitRequestFullScreen) {
                    return d.webkitIsFullScreen;
                }
            }
            t.requestFullScreen = function(el) {
                if (t.hasWebkitNativeFullScreen) {
                    el.webkitRequestFullScreen();
                } else if (t.hasMozNativeFullScreen) {
                    el.mozRequestFullScreen();
                }
            }
            t.cancelFullScreen = function() {
                if (t.hasWebkitNativeFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (t.hasMozNativeFullScreen) {
                    document.mozCancelFullScreen();
                }
            }
        }
        if (t.hasSemiNativeFullScreen && ua.match(/mac os x 10_5/i)) {
            t.hasNativeFullScreen = false;
            t.hasSemiNativeFullScreen = false;
        }
    }};
mejs.MediaFeatures.init();
mejs.HtmlMediaElement = {pluginType: 'native',isFullScreen: false,setCurrentTime: function(time) {
        this.currentTime = time;
    },setMuted: function(muted) {
        this.muted = muted;
    },setVolume: function(volume) {
        this.volume = volume;
    },stop: function() {
        this.pause();
    },setSrc: function(url) {
        var 
        existingSources = this.getElementsByTagName('source');
        while (existingSources.length > 0) {
            this.removeChild(existingSources[0]);
        }
        if (typeof url == 'string') {
            this.src = url;
        } else {
            var i, media;
            for (i = 0; i < url.length; i++) {
                media = url[i];
                if (this.canPlayType(media.type)) {
                    this.src = media.src;
                }
            }
        }
    },changeQuality: function(player) {
        player.container.find('.mejs-overlay-blackdrop').show();
        player.qualitySwitchTime = player.getCurrentTime();
        if (player.quality == 'sd') {
            this.src = player.qualityPairs.hd.url;
            player.quality = 'hd';
        } 
        else if (player.quality == 'hd') {
            this.src = player.qualityPairs.sd.url;
            player.quality = 'sd';
        }
        player.load();
        player.play();
        qualityChanged = true;
        player.media.addEventListener('playing', function() {
            if (qualityChanged == true) {
                player.setCurrentTime(player.qualitySwitchTime);
                player.container.find('.mejs-overlay-blackdrop').hide();
            }
            qualityChanged = false;
        });
    },setVideoSize: function(width, height) {
        this.width = width;
        this.height = height;
    }};
mejs.PluginMediaElement = function(pluginid, pluginType, mediaUrl) {
    this.id = pluginid;
    this.pluginType = pluginType;
    this.src = mediaUrl;
    this.events = {};
};
mejs.PluginMediaElement.prototype = {pluginElement: null,pluginType: '',isFullScreen: false,playbackRate: -1,defaultPlaybackRate: -1,seekable: [],played: [],paused: true,ended: false,seeking: false,duration: 0,error: null,muted: false,volume: 1,currentTime: 0,play: function() {
        if (this.pluginApi != null) {
            if (this.pluginType == 'youtube') {
                this.pluginApi.playVideo();
            } else {
                this.pluginApi.playMedia();
            }
            this.paused = false;
        }
    },load: function() {
        if (this.pluginApi != null) {
            if (this.pluginType == 'youtube') {
            } else {
                this.pluginApi.loadMedia();
            }
            this.paused = false;
        }
    },pause: function() {
        if (this.pluginApi != null) {
            if (this.pluginType == 'youtube') {
                this.pluginApi.pauseVideo();
            } else {
                this.pluginApi.pauseMedia();
            }
            this.paused = true;
        }
    },stop: function() {
        if (this.pluginApi != null) {
            if (this.pluginType == 'youtube') {
                this.pluginApi.stopVideo();
            } else {
                this.pluginApi.stopMedia();
            }
            this.paused = true;
        }
    },canPlayType: function(type) {
        var i, j, pluginInfo, pluginVersions = mejs.plugins[this.pluginType];
        for (i = 0; i < pluginVersions.length; i++) {
            pluginInfo = pluginVersions[i];
            if (mejs.PluginDetector.hasPluginVersion(this.pluginType, pluginInfo.version)) {
                for (j = 0; j < pluginInfo.types.length; j++) {
                    if (type == pluginInfo.types[j]) {
                        return true;
                    }
                }
            }
        }
        return false;
    },positionFullscreenButton: function(x, y, visibleAndAbove) {
        if (this.pluginApi != null && this.pluginApi.positionFullscreenButton) {
            this.pluginApi.positionFullscreenButton(x, y, visibleAndAbove);
        }
    },hideFullscreenButton: function() {
        if (this.pluginApi != null && this.pluginApi.hideFullscreenButton) {
            this.pluginApi.hideFullscreenButton();
        }
    },setSrc: function(url) {
        if (typeof url == 'string') {
            this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(url));
            this.src = mejs.Utility.absolutizeUrl(url);
        } else {
            var i, media;
            for (i = 0; i < url.length; i++) {
                media = url[i];
                if (this.canPlayType(media.type)) {
                    this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(media.src));
                    this.src = mejs.Utility.absolutizeUrl(url);
                }
            }
        }
    },setCurrentTime: function(time) {
        if (this.pluginApi != null) {
            if (this.pluginType == 'youtube') {
                this.pluginApi.seekTo(time);
            } else {
                this.pluginApi.setCurrentTime(time);
            }
            this.currentTime = time;
        }
    },setVolume: function(volume) {
        if (this.pluginApi != null) {
            if (this.pluginType == 'youtube') {
                this.pluginApi.setVolume(volume * 100);
            } else {
                this.pluginApi.setVolume(volume);
            }
            this.volume = volume;
        }
    },setMuted: function(muted) {
        if (this.pluginApi != null) {
            if (this.pluginType == 'youtube') {
                if (muted) {
                    this.pluginApi.mute();
                } else {
                    this.pluginApi.unMute();
                }
                this.muted = muted;
                this.dispatchEvent('volumechange');
            } else {
                this.pluginApi.setMuted(muted);
            }
            this.muted = muted;
        }
    },changeQuality: function(player) {
        player.container.find('.mejs-overlay-blackdrop').show();
        var src;
        if (player.quality == 'sd') {
            src = player.qualityPairs.hd.url;
            player.quality = 'hd';
        } 
        else if (player.quality == 'hd') {
            src = player.qualityPairs.sd.url;
            player.quality = 'sd';
        }
        this.setSrc(src);
        player.load();
        player.play();
        qualityChanged = true;
        player.media.addEventListener('playing', function() {
            if (qualityChanged == true) {
                player.container.find('.mejs-overlay-blackdrop').hide();
            }
            qualityChanged = false;
        });
    },setVideoSize: function(width, height) {
        if (this.pluginElement.style) {
            this.pluginElement.style.width = width + 'px';
            this.pluginElement.style.height = (height - 26) + 'px';
        }
        if (this.pluginApi != null) {
            if (this.pluginType == 'youtube') {
                newh = height - 26
                this.pluginApi.setSize(width, newh)
            }
        }
        if (this.pluginApi != null && this.pluginApi.setVideoSize) {
            this.pluginApi.setVideoSize(width, height);
        }
    },setFullscreen: function(fullscreen) {
        if (this.pluginApi != null && this.pluginApi.setFullscreen) {
            this.pluginApi.setFullscreen(fullscreen);
        }
    },enterFullScreen: function() {
        if (this.pluginApi != null && this.pluginApi.setFullscreen) {
            this.setFullscreen(true);
        }
    },exitFullScreen: function() {
        if (this.pluginApi != null && this.pluginApi.setFullscreen) {
            this.setFullscreen(false);
        }
    },addEventListener: function(eventName, callback, bubble) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(callback);
    },removeEventListener: function(eventName, callback) {
        if (!eventName) {
            this.events = {};
            return true;
        }
        var callbacks = this.events[eventName];
        if (!callbacks)
            return true;
        if (!callback) {
            this.events[eventName] = [];
            return true;
        }
        for (i = 0; i < callbacks.length; i++) {
            if (callbacks[i] === callback) {
                this.events[eventName].splice(i, 1);
                return true;
            }
        }
        return false;
    },dispatchEvent: function(eventName) {
        var i, args, callbacks = this.events[eventName];
        if (callbacks) {
            args = Array.prototype.slice.call(arguments, 1);
            for (i = 0; i < callbacks.length; i++) {
                callbacks[i].apply(null, args);
            }
        }
    },remove: function() {
        mejs.Utility.removeSwf(this.pluginElement.id);
    }};
mejs.MediaPluginBridge = {pluginMediaElements: {},htmlMediaElements: {},registerPluginElement: function(id, pluginMediaElement, htmlMediaElement) {
        this.pluginMediaElements[id] = pluginMediaElement;
        this.htmlMediaElements[id] = htmlMediaElement;
    },initPlugin: function(id) {
        var pluginMediaElement = this.pluginMediaElements[id], htmlMediaElement = this.htmlMediaElements[id];
        if (pluginMediaElement) {
            switch (pluginMediaElement.pluginType) {
                case "flash":
                    pluginMediaElement.pluginElement = pluginMediaElement.pluginApi = document.getElementById(id);
                    break;
                case "silverlight":
                    pluginMediaElement.pluginElement = document.getElementById(pluginMediaElement.id);
                    pluginMediaElement.pluginApi = pluginMediaElement.pluginElement.Content.MediaElementJS;
                    break;
            }
            if (pluginMediaElement.pluginApi != null && pluginMediaElement.success) {
                pluginMediaElement.success(pluginMediaElement, htmlMediaElement);
            }
        }
    },fireEvent: function(id, eventName, values) {
        var 
        e, i, bufferedTime, pluginMediaElement = this.pluginMediaElements[id];
        pluginMediaElement.ended = false;
        pluginMediaElement.paused = true;
        e = {type: eventName,target: pluginMediaElement};
        for (i in values) {
            pluginMediaElement[i] = values[i];
            e[i] = values[i];
        }
        bufferedTime = values.bufferedTime || 0;
        e.target.buffered = e.buffered = {start: function(index) {
                return 0;
            },end: function(index) {
                return bufferedTime;
            },length: 1};
        pluginMediaElement.dispatchEvent(e.type, e);
    }};
mejs.MediaElementDefaults = {mode: 'auto',plugins: ['flash', 'silverlight', 'youtube'],enablePluginDebug: false,type: '',pluginPath: mejs.Utility.getScriptPath(['mediaelement.js', 'mediaelement.min.js', 'mediaelement-and-player.js', 'mediaelement-and-player.min.js']),flashName: 'flashmediaelement.swf',enablePluginSmoothing: true,silverlightName: 'silverlightmediaelement.xap',defaultVideoWidth: 480,defaultVideoHeight: 270,pluginWidth: -1,pluginHeight: -1,pluginVars: [],timerRate: 250,startVolume: 0.8,success: function() {
    },error: function() {
    }};
mejs.MediaElement = function(el, o) {
    return mejs.HtmlMediaElementShim.create(el, o);
};
mejs.HtmlMediaElementShim = {create: function(el, o) {
        var 
        options = mejs.MediaElementDefaults, htmlMediaElement = (typeof (el) == 'string') ? document.getElementById(el) : el, tagName = htmlMediaElement.tagName.toLowerCase(), isMediaTag = (tagName === 'audio' || tagName === 'video'), src = (isMediaTag) ? htmlMediaElement.getAttribute('src') : htmlMediaElement.getAttribute('href'), poster = htmlMediaElement.getAttribute('poster'), autoplay = htmlMediaElement.getAttribute('autoplay'), preload = htmlMediaElement.getAttribute('preload'), controls = htmlMediaElement.getAttribute('controls'), playback, prop;
        for (prop in o) {
            options[prop] = o[prop];
        }
        src = (typeof src == 'undefined' || src === null || src == '') ? null : src;
        poster = (typeof poster == 'undefined' || poster === null) ? '' : poster;
        preload = (typeof preload == 'undefined' || preload === null || preload === 'false') ? 'none' : preload;
        autoplay = !(typeof autoplay == 'undefined' || autoplay === null || autoplay === 'false');
        controls = !(typeof controls == 'undefined' || controls === null || controls === 'false');
        playback = this.determinePlayback(htmlMediaElement, options, mejs.MediaFeatures.supportsMediaTag, isMediaTag, src);
        playback.url = (playback.url !== null) ? mejs.Utility.absolutizeUrl(playback.url) : '';
        if (playback.method == 'native') {
            if (mejs.MediaFeatures.isBustedAndroid) {
                htmlMediaElement.src = playback.url;
                htmlMediaElement.addEventListener('click', function() {
                    htmlMediaElement.play();
                }, false);
            }
            return this.updateNative(playback, options, autoplay, preload);
        } else if (playback.method !== '') {
            return this.createPlugin(playback, options, poster, autoplay, preload, controls);
        } else {
            this.createErrorMessage(playback, options, poster);
            return this;
        }
    },determinePlayback: function(htmlMediaElement, options, supportsMediaTag, isMediaTag, src) {
        var 
        mediaFiles = [], i, j, k, l, n, type, result = {method: '',url: '',htmlMediaElement: htmlMediaElement,isVideo: (htmlMediaElement.tagName.toLowerCase() != 'audio')}, pluginName, pluginVersions, pluginInfo, dummy;
        if (typeof options.type != 'undefined' && options.type !== '') {
            if (typeof options.type == 'string') {
                mediaFiles.push({type: options.type,url: src});
            } else {
                for (i = 0; i < options.type.length; i++) {
                    mediaFiles.push({type: options.type[i],url: src});
                }
            }
        } else if (src !== null) {
            type = this.formatType(src, htmlMediaElement.getAttribute('type'));
            mediaFiles.push({type: type,url: src});
        } else {
            for (i = 0; i < htmlMediaElement.childNodes.length; i++) {
                n = htmlMediaElement.childNodes[i];
                if (n.nodeType == 1 && n.tagName.toLowerCase() == 'source') {
                    src = n.getAttribute('src');
                    type = this.formatType(src, n.getAttribute('type'));
                    mediaFiles.push({type: type,url: src});
                }
            }
        }
        if (!isMediaTag && mediaFiles.length > 0 && mediaFiles[0].url !== null && this.getTypeFromFile(mediaFiles[0].url).indexOf('audio') > -1) {
            result.isVideo = false;
        }
        if (mejs.MediaFeatures.isBustedAndroid) {
            htmlMediaElement.canPlayType = function(type) {
                return (type.match(/video\/(mp4|m4v)/gi) !== null) ? 'maybe' : '';
            };
        }
        if (supportsMediaTag && (options.mode === 'auto' || options.mode === 'native')) {
            if (!isMediaTag) {
                dummy = document.createElement(result.isVideo ? 'video' : 'audio');
                htmlMediaElement.parentNode.insertBefore(dummy, htmlMediaElement);
                htmlMediaElement.style.display = 'none';
                result.htmlMediaElement = htmlMediaElement = dummy;
            }
            for (i = 0; i < mediaFiles.length; i++) {
                if (htmlMediaElement.canPlayType(mediaFiles[i].type).replace(/no/, '') !== '' || htmlMediaElement.canPlayType(mediaFiles[i].type.replace(/mp3/, 'mpeg')).replace(/no/, '') !== '') {
                    result.method = 'native';
                    result.url = mediaFiles[i].url;
                    break;
                }
            }
            if (result.method === 'native') {
                if (result.url !== null) {
                    htmlMediaElement.src = result.url;
                }
                return result;
            }
        }
        if (options.mode === 'auto' || options.mode === 'shim') {
            for (i = 0; i < mediaFiles.length; i++) {
                type = mediaFiles[i].type;
                for (j = 0; j < options.plugins.length; j++) {
                    pluginName = options.plugins[j];
                    pluginVersions = mejs.plugins[pluginName];
                    for (k = 0; k < pluginVersions.length; k++) {
                        pluginInfo = pluginVersions[k];
                        if (pluginInfo.version == null || mejs.PluginDetector.hasPluginVersion(pluginName, pluginInfo.version)) {
                            for (l = 0; l < pluginInfo.types.length; l++) {
                                if (type == pluginInfo.types[l]) {
                                    result.method = pluginName;
                                    result.url = mediaFiles[i].url;
                                    return result;
                                }
                            }
                        }
                    }
                }
            }
        }
        if (result.method === '' && mediaFiles.length > 0) {
            result.url = mediaFiles[0].url;
        }
        return result;
    },formatType: function(url, type) {
        var ext;
        if (url && !type) {
            return this.getTypeFromFile(url);
        } else {
            if (type && ~type.indexOf(';')) {
                return type.substr(0, type.indexOf(';'));
            } else {
                return type;
            }
        }
    },getTypeFromFile: function(url) {
        var ext = url.substring(url.lastIndexOf('.') + 1);
        return (/(mp4|m4v|ogg|ogv|webm|flv|wmv|mpeg|mov)/gi.test(ext) ? 'video' : 'audio') + '/' + ext;
    },createErrorMessage: function(playback, options, poster) {
        var 
        htmlMediaElement = playback.htmlMediaElement, errorContainer = document.createElement('div');
        errorContainer.className = 'me-cannotplay';
        try {
            errorContainer.style.width = htmlMediaElement.width + 'px';
            errorContainer.style.height = htmlMediaElement.height + 'px';
        } catch (e) {
        }
        errorContainer.innerHTML = (poster !== '') ? '<a href="' + playback.url + '"><img src="' + poster + '" /></a>' : '<a href="' + playback.url + '"><span>Download File</span></a>';
        htmlMediaElement.parentNode.insertBefore(errorContainer, htmlMediaElement);
        htmlMediaElement.style.display = 'none';
        options.error(htmlMediaElement);
    },createPlugin: function(playback, options, poster, autoplay, preload, controls) {
        var 
        htmlMediaElement = playback.htmlMediaElement, width = 1, height = 1, pluginid = 'me_' + playback.method + '_' + (mejs.meIndex++), pluginMediaElement = new mejs.PluginMediaElement(pluginid, playback.method, playback.url), container = document.createElement('div'), specialIEContainer, node, initVars;
        node = htmlMediaElement.parentNode;
        while (node !== null && node.tagName.toLowerCase() != 'body') {
            if (node.parentNode.tagName.toLowerCase() == 'p') {
                node.parentNode.parentNode.insertBefore(node, node.parentNode);
                break;
            }
            node = node.parentNode;
        }
        if (playback.isVideo) {
            width = (options.videoWidth > 0) ? options.videoWidth : (htmlMediaElement.getAttribute('width') !== null) ? htmlMediaElement.getAttribute('width') : options.defaultVideoWidth;
            height = (options.videoHeight > 0) ? options.videoHeight : (htmlMediaElement.getAttribute('height') !== null) ? htmlMediaElement.getAttribute('height') : options.defaultVideoHeight;
            width = mejs.Utility.encodeUrl(width);
            height = mejs.Utility.encodeUrl(height);
        } else {
            if (options.enablePluginDebug) {
                width = 320;
                height = 240;
            }
        }
        pluginMediaElement.success = options.success;
        mejs.MediaPluginBridge.registerPluginElement(pluginid, pluginMediaElement, htmlMediaElement);
        container.className = 'me-plugin';
        container.id = pluginid + '_container';
        if (playback.isVideo) {
            htmlMediaElement.parentNode.insertBefore(container, htmlMediaElement);
        } else {
            document.body.insertBefore(container, document.body.childNodes[0]);
        }
        initVars = ['id=' + pluginid, 'isvideo=' + ((playback.isVideo) ? "true" : "false"), 'autoplay=' + ((autoplay) ? "true" : "false"), 'preload=none', 'width=' + width, 'startvolume=' + options.startVolume, 'timerrate=' + options.timerRate, 'height=' + height, 'defaultHd=' + options.defaultHd];
        if (playback.url !== null) {
            if (playback.method == 'flash') {
                initVars.push('file=' + mejs.Utility.encodeUrl(playback.url));
            } else {
                initVars.push('file=' + playback.url);
            }
        }
        if (options.enablePluginDebug) {
            initVars.push('debug=true');
        }
        if (options.enablePluginSmoothing) {
            initVars.push('smoothing=true');
        }
        if (controls) {
            initVars.push('controls=true');
        }
        if (options.pluginVars) {
            initVars = initVars.concat(options.pluginVars);
        }
        switch (playback.method) {
            case 'silverlight':
                container.innerHTML = '<object data="data:application/x-silverlight-2," type="application/x-silverlight-2" id="' + pluginid + '" name="' + pluginid + '" width="' + width + '" height="' + height + '">' + '<param name="initParams" value="' + initVars.join(',') + '" />' + '<param name="windowless" value="true" />' + '<param name="background" value="black" />' + '<param name="minRuntimeVersion" value="3.0.0.0" />' + '<param name="autoUpgrade" value="true" />' + '<param name="source" value="' + options.pluginPath + options.silverlightName + '" />' + '</object>';
                break;
            case 'flash':
                if (mejs.MediaFeatures.isIE) {
                    specialIEContainer = document.createElement('div');
                    container.appendChild(specialIEContainer);
                    specialIEContainer.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" ' + 'id="' + pluginid + '" width="' + width + '" height="' + height + '">' + '<param name="movie" value="' + options.pluginPath + options.flashName + '?x=' + (new Date()) + '" />' + '<param name="flashvars" value="' + initVars.join('&amp;') + '" />' + '<param name="quality" value="high" />' + '<param name="bgcolor" value="#000000" />' + '<param name="wmode" value="transparent" />' + '<param name="allowScriptAccess" value="always" />' + '<param name="allowFullScreen" value="true" />' + '</object>';
                } else {
                    container.innerHTML = '<embed id="' + pluginid + '" name="' + pluginid + '" ' + 'play="true" ' + 'loop="false" ' + 'quality="high" ' + 'bgcolor="#000000" ' + 'wmode="transparent" ' + 'allowScriptAccess="always" ' + 'allowFullScreen="true" ' + 'type="application/x-shockwave-flash" pluginspage="//www.macromedia.com/go/getflashplayer" ' + 'src="' + options.pluginPath + options.flashName + '" ' + 'flashvars="' + initVars.join('&') + '" ' + 'width="' + width + '" ' + 'height="' + height + '"></embed>';
                }
                break;
            case 'youtube':
                var 
                videoId = playback.url.substr(playback.url.lastIndexOf('=') + 1);
                youtubeSettings = {container: container,containerId: container.id,pluginMediaElement: pluginMediaElement,pluginId: pluginid,videoId: videoId,height: height,width: width};
                if (mejs.PluginDetector.hasPluginVersion('flash', [10, 0, 0])) {
                    mejs.YouTubeApi.createFlash(youtubeSettings);
                } else {
                    mejs.YouTubeApi.enqueueIframe(youtubeSettings);
                }
                break;
        }
        htmlMediaElement.style.display = 'none';
        return pluginMediaElement;
    },updateNative: function(playback, options, autoplay, preload) {
        var htmlMediaElement = playback.htmlMediaElement, m;
        for (m in mejs.HtmlMediaElement) {
            htmlMediaElement[m] = mejs.HtmlMediaElement[m];
        }
        options.success(htmlMediaElement, htmlMediaElement);
        return htmlMediaElement;
    }};
mejs.YouTubeApi = {isIframeStarted: false,isIframeLoaded: false,loadIframeApi: function() {
        if (!this.isIframeStarted) {
            var tag = document.createElement('script');
            tag.src = "http://www.youtube.com/player_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            this.isIframeStarted = true;
        }
    },iframeQueue: [],enqueueIframe: function(yt) {
        if (this.isLoaded) {
            this.createIframe(yt);
        } else {
            this.loadIframeApi();
            this.iframeQueue.push(yt);
        }
    },createIframe: function(settings) {
        var 
        pluginMediaElement = settings.pluginMediaElement, player = new YT.Player(settings.containerId, {height: settings.height,width: settings.width,videoId: settings.videoId,playerVars: {controls: 0},events: {'onReady': function() {
                    settings.pluginMediaElement.pluginApi = player;
                    mejs.MediaPluginBridge.initPlugin(settings.pluginId);
                    setInterval(function() {
                        mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'timeupdate');
                    }, 250);
                },'onStateChange': function(e) {
                    mejs.YouTubeApi.handleStateChange(e.data, player, pluginMediaElement);
                }}});
    },createEvent: function(player, pluginMediaElement, eventName) {
        var obj = {type: eventName,target: pluginMediaElement};
        if (player && player.getDuration) {
            pluginMediaElement.currentTime = obj.currentTime = player.getCurrentTime();
            pluginMediaElement.duration = obj.duration = player.getDuration();
            obj.paused = pluginMediaElement.paused;
            obj.ended = pluginMediaElement.ended;
            obj.muted = player.isMuted();
            obj.volume = player.getVolume() / 100;
            obj.bytesTotal = player.getVideoBytesTotal();
            obj.bufferedBytes = player.getVideoBytesLoaded();
            var bufferedTime = obj.bufferedBytes / obj.bytesTotal * obj.duration;
            obj.target.buffered = obj.buffered = {start: function(index) {
                    return 0;
                },end: function(index) {
                    return bufferedTime;
                },length: 1};
        }
        pluginMediaElement.dispatchEvent(obj.type, obj);
    },iFrameReady: function() {
        this.isIframeLoaded = true;
        while (this.iframeQueue.length > 0) {
            var settings = this.iframeQueue.pop();
            this.createIframe(settings);
        }
    },flashPlayers: {},createFlash: function(settings) {
        this.flashPlayers[settings.pluginId] = settings;
        var specialIEContainer, youtubeUrl = 'http://www.youtube.com/apiplayer?enablejsapi=1&amp;playerapiid=' + settings.pluginId + '&amp;autoplay=0&amp;controls=0&amp;modestbranding=1&loop=0&feature=player_embedded';
        if (mejs.MediaFeatures.isIE) {
            specialIEContainer = document.createElement('div');
            settings.container.appendChild(specialIEContainer);
            specialIEContainer.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" ' + 'id="' + settings.pluginId + '" width="' + settings.width + '" height="' + settings.height + '">' + '<param name="movie" value="' + youtubeUrl + '" />' + '<param name="wmode" value="transparent" />' + '<param name="allowScriptAccess" value="always" />' + '<param name="allowFullScreen" value="true" />' + '</object>';
        } else {
            if (settings.width.toString().indexOf('%') > 0) {
                settings.width = 840;
                settings.height = 446;
            }
            settings.container.innerHTML = '<object type="application/x-shockwave-flash" id="' + settings.pluginId + '" data="' + youtubeUrl + '" ' + 'width="' + settings.width + '" height="' + settings.height + '" style="visibility: visible; ">' + '<param name="allowScriptAccess" value="always">' + '<param name="wmode" value="transparent">' + '</object>';
        }
    },flashReady: function(id) {
        var 
        settings = this.flashPlayers[id], player = document.getElementById(id), pluginMediaElement = settings.pluginMediaElement;
        pluginMediaElement.pluginApi = pluginMediaElement.pluginElement = player;
        mejs.MediaPluginBridge.initPlugin(id);
        player.cueVideoById(settings.videoId);
        var callbackName = settings.containerId + '_callback'
        window[callbackName] = function(e) {
            mejs.YouTubeApi.handleStateChange(e, player, pluginMediaElement);
        }
        player.addEventListener('onStateChange', callbackName);
        setInterval(function() {
            mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'timeupdate');
        }, 250);
    },handleStateChange: function(youTubeState, player, pluginMediaElement) {
        switch (youTubeState) {
            case -1:
                pluginMediaElement.paused = true;
                pluginMediaElement.ended = true;
                mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'loadedmetadata');
                break;
            case 0:
                pluginMediaElement.paused = false;
                pluginMediaElement.ended = true;
                mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'ended');
                break;
            case 1:
                pluginMediaElement.paused = false;
                pluginMediaElement.ended = false;
                mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'play');
                mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'playing');
                break;
            case 2:
                pluginMediaElement.paused = true;
                pluginMediaElement.ended = false;
                mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'pause');
                break;
            case 3:
                mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'progress');
                break;
            case 5:
                break;
        }
    }}
function onYouTubePlayerAPIReady() {
    mejs.YouTubeApi.iFrameReady();
}
function onYouTubePlayerReady(id) {
    mejs.YouTubeApi.flashReady(id);
}
window.mejs = mejs;
window.MediaElement = mejs.MediaElement;
if (typeof jQuery != 'undefined') {
    mejs.$ = jQuery;
} else if (typeof ender != 'undefined') {
    mejs.$ = ender;
}
(function($) {
    mejs.MepDefaults = {poster: '',defaultVideoWidth: 480,defaultVideoHeight: 270,videoWidth: -1,videoHeight: -1,defaultAudioWidth: 400,defaultAudioHeight: 30,audioWidth: -1,audioHeight: -1,startVolume: 0.8,loop: false,enableAutosize: true,alwaysShowHours: false,showTimecodeFrameCount: false,framesPerSecond: 25,autosizeProgress: true,alwaysShowControls: true,iPadUseNativeControls: false,iPhoneUseNativeControls: false,AndroidUseNativeControls: false,features: ['contextmenu', 'playpause', 'current', 'progress', 'duration', 'tracks', 'quality', 'volume', 'fullscreen', 'ping'],isVideo: true,defaultHd: false,loadingPng: true,loadingPngHeight: 80,horizontalVolumeOnFullscreen: true,enableKeyboard: true,pauseOtherPlayers: true,keyActions: [{keys: [32, 179],action: function(player, media) {
                    if (media.paused || media.ended) {
                        media.play();
                    } else {
                        media.pause();
                    }
                }}, {keys: [38],action: function(player, media) {
                    var newVolume = Math.min(media.volume + 0.1, 1);
                    media.setVolume(newVolume);
                }}, {keys: [40],action: function(player, media) {
                    var newVolume = Math.max(media.volume - 0.1, 0);
                    media.setVolume(newVolume);
                }}, {keys: [37, 227],action: function(player, media) {
                    if (!isNaN(media.duration) && media.duration > 0) {
                        if (player.isVideo) {
                            player.showControls();
                            player.startControlsTimer();
                        }
                        var newTime = Math.min(media.currentTime - (media.duration * 0.05), media.duration);
                        media.setCurrentTime(newTime);
                    }
                }}, {keys: [39, 228],action: function(player, media) {
                    if (!isNaN(media.duration) && media.duration > 0) {
                        if (player.isVideo) {
                            player.showControls();
                            player.startControlsTimer();
                        }
                        var newTime = Math.max(media.currentTime + (media.duration * 0.05), 0);
                        media.setCurrentTime(newTime);
                    }
                }}, {keys: [70],action: function(player, media) {
                    if (typeof player.enterFullScreen != 'undefined') {
                        if (player.isFullScreen) {
                            player.exitFullScreen();
                        } else {
                            player.enterFullScreen();
                        }
                    }
                }}]};
    mejs.mepIndex = 0;
    mejs.players = [];
    mejs.MediaElementPlayer = function(node, o) {
        if (!(this instanceof mejs.MediaElementPlayer)) {
            return new mejs.MediaElementPlayer(node, o);
        }
        var t = this;
        t.$media = t.$node = $(node);
        t.node = t.media = t.$media[0];
        if (typeof t.node.player != 'undefined') {
            return t.node.player;
        } else {
            t.node.player = t;
        }
        o = t.$node.data('mejsoptions');
        t.options = $.extend({}, mejs.MepDefaults, o);
        mejs.players.push(t);
        t.init();
        return t;
    };
    mejs.MediaElementPlayer.prototype = {hasFocus: false,controlsAreVisible: true,init: function() {
            var 
            t = this, mf = mejs.MediaFeatures, meOptions = $.extend(true, {}, t.options, {success: function(media, domNode) {
                    t.meReady(media, domNode);
                },error: function(e) {
                    t.handleError(e);
                }}), tagName = t.media.tagName.toLowerCase();
            t.isDynamic = (tagName !== 'audio' && tagName !== 'video');
            if (t.isDynamic) {
                t.isVideo = t.options.isVideo;
            } else {
                t.isVideo = (tagName !== 'audio' && t.options.isVideo);
            }
            if ((mf.isiPad && t.options.iPadUseNativeControls) || (mf.isiPhone && t.options.iPhoneUseNativeControls)) {
                t.$media.attr('controls', 'controls');
                t.$media.removeAttr('poster');
                if (mf.isiPad && t.media.getAttribute('autoplay') !== null) {
                    t.media.load();
                    t.media.play();
                }
            } else if (mf.isAndroid && t.AndroidUseNativeControls) {
            } else {
                t.$media.removeAttr('controls');
                t.id = 'mep_' + mejs.mepIndex++;
                t.container = $('<div id="' + t.id + '" class="mejs-container">' + '<div class="mejs-inner">' + '<div class="mejs-mediaelement"></div>' + '<div class="mejs-layers"></div>' + '<div class="mejs-controls"></div>' + '<div class="mejs-clear"></div>' + '</div>' + '</div>').addClass(t.$media[0].className).insertBefore(t.$media);
                t.container.addClass((mf.isAndroid ? 'mejs-android ' : '') + (mf.isiOS ? 'mejs-ios ' : '') + (mf.isiPad ? 'mejs-ipad ' : '') + (mf.isiPhone ? 'mejs-iphone ' : '') + (t.isVideo ? 'mejs-video ' : 'mejs-audio '));
                if (mf.isiOS) {
                    var $newMedia = t.$media.clone();
                    t.container.find('.mejs-mediaelement').append($newMedia);
                    t.$media.remove();
                    t.$node = t.$media = $newMedia;
                    t.node = t.media = $newMedia[0]
                } else {
                    t.container.find('.mejs-mediaelement').append(t.$media);
                }
                t.controls = t.container.find('.mejs-controls');
                t.layers = t.container.find('.mejs-layers');
                var capsTagName = tagName.substring(0, 1).toUpperCase() + tagName.substring(1);
                if (t.options[tagName + 'Width'] > 0 || t.options[tagName + 'Width'].toString().indexOf('%') > -1) {
                    t.width = t.options[tagName + 'Width'];
                } else if (t.media.style.width !== '' && t.media.style.width !== null) {
                    t.width = t.media.style.width;
                } else if (t.media.getAttribute('width') !== null) {
                    t.width = t.$media.attr('width');
                } else {
                    t.width = t.options['default' + capsTagName + 'Width'];
                }
                if (t.options[tagName + 'Height'] > 0 || t.options[tagName + 'Height'].toString().indexOf('%') > -1) {
                    t.height = t.options[tagName + 'Height'];
                } else if (t.media.style.height !== '' && t.media.style.height !== null) {
                    t.height = t.media.style.height;
                } else if (t.$media[0].getAttribute('height') !== null) {
                    t.height = t.$media.attr('height');
                } else {
                    t.height = t.options['default' + capsTagName + 'Height'];
                }
                t.setPlayerSize(t.width, t.height);
                meOptions.pluginWidth = t.height;
                meOptions.pluginHeight = t.width;
            }
            mejs.MediaElement(t.$media[0], meOptions);
        },showControls: function(doAnimation) {
            var t = this;
            doAnimation = typeof doAnimation == 'undefined' || doAnimation;
            if (t.controlsAreVisible)
                return;
            if (doAnimation) {
                t.controls.fadeIn(200, function() {
                    $(this).css('display', 'block');
                    t.controlsAreVisible = true;
                });
                t.container.find('.mejs-control').fadeIn(200, function() {
                    $(this).css('display', 'block');
                    t.controlsAreVisible = true;
                });
            } else {
                t.controls.css('display', 'block');
                t.container.find('.mejs-control').css('display', 'block');
                t.controlsAreVisible = true;
            }
            t.setControlsSize();
        },hideControls: function(doAnimation) {
            var t = this;
            doAnimation = typeof doAnimation == 'undefined' || doAnimation;
            if (!t.controlsAreVisible)
                return;
            if (doAnimation) {
                t.controls.stop(true, true).fadeOut(200, function() {
                    $(this).css('display', 'none');
                    t.controlsAreVisible = false;
                });
                t.container.find('.mejs-control').stop(true, true).fadeOut(200, function() {
                    $(this).css('display', 'none');
                });
            } else {
                t.controls.css('display', 'none');
                t.container.find('.mejs-control').css('display', 'none');
                t.controlsAreVisible = false;
            }
        },controlsTimer: null,startControlsTimer: function(timeout) {
            var t = this;
            timeout = typeof timeout != 'undefined' ? timeout : 1500;
            clearTimeout(t.controlsTimer);
            t.controlsTimer = setTimeout(function() {
                t.hideControls();
                t.killControlsTimer('hide');
            }, timeout);
        },killControlsTimer: function(src) {
            var t = this;
            if (t.controlsTimer !== null) {
                clearTimeout(t.controlsTimer);
                delete t.controlsTimer;
                t.controlsTimer = null;
            }
        },controlsEnabled: true,disableControls: function() {
            var t = this;
            t.killControlsTimer();
            t.hideControls(false);
            this.controlsEnabled = false;
        },enableControls: function() {
            var t = this;
            t.showControls(false);
            t.controlsEnabled = true;
        },meReady: function(media, domNode) {
            var t = this, mf = mejs.MediaFeatures, autoplayAttr = domNode.getAttribute('autoplay'), autoplay = !(typeof autoplayAttr == 'undefined' || autoplayAttr === null || autoplayAttr === 'false'), featureIndex, feature;
            if (t.created)
                return;
            else
                t.created = true;
            t.media = media;
            t.domNode = domNode;
            if (!(mf.isAndroid && t.options.AndroidUseNativeControls) && !(mf.isiPad && t.options.iPadUseNativeControls) && !(mf.isiPhone && t.options.iPhoneUseNativeControls)) {
                t.buildposter(t, t.controls, t.layers, t.media);
                t.buildkeyboard(t, t.controls, t.layers, t.media);
                t.buildoverlays(t, t.controls, t.layers, t.media);
                t.findTracks();
                for (featureIndex in t.options.features) {
                    feature = t.options.features[featureIndex];
                    if (t['build' + feature]) {
                        try {
                            t['build' + feature](t, t.controls, t.layers, t.media);
                        } catch (e) {
                        }
                    }
                }
                t.container.trigger('controlsready');
                t.setPlayerSize(t.width, t.height);
                t.setControlsSize();
                if (t.isVideo) {
                    if (mejs.MediaFeatures.hasTouch) {
                        t.$media.bind('touchstart', function() {
                            if (t.controlsAreVisible) {
                                t.hideControls(false);
                            } else {
                                if (t.controlsEnabled) {
                                    t.showControls(false);
                                }
                            }
                        });
                    } else {
                        var clickElement = (t.media.pluginType == 'native') ? t.$media : $(t.media.pluginElement);
                        clickElement.click(function() {
                            if (media.paused) {
                                media.play();
                            } else {
                                media.pause();
                            }
                        });
                        t.container.bind('mouseenter mouseover', function() {
                            if (t.controlsEnabled) {
                                if (!t.options.alwaysShowControls) {
                                    t.killControlsTimer('enter');
                                    t.showControls();
                                    t.startControlsTimer(2500);
                                    t.container.bind('mousemove.cont', function() {
                                        if (t.controlsEnabled) {
                                            if (!t.controlsAreVisible) {
                                                t.showControls();
                                            }
                                            if (!t.options.alwaysShowControls) {
                                                t.startControlsTimer(2500);
                                            }
                                        }
                                    });
                                }
                            }
                        }).bind('mouseleave', function() {
                            if (t.controlsEnabled) {
                                $(document).unbind('.cont');
                                if (!t.media.paused && !t.options.alwaysShowControls) {
                                    t.startControlsTimer(1000);
                                }
                            }
                        });
                    }
                    if (autoplay && !t.options.alwaysShowControls) {
                        t.hideControls();
                    }
                    if (t.options.enableAutosize) {
                        t.media.addEventListener('loadedmetadata', function(e) {
                            if (t.options.videoHeight <= 0 && t.domNode.getAttribute('height') === null && !isNaN(e.target.videoHeight)) {
                                t.setPlayerSize(e.target.videoWidth, e.target.videoHeight);
                                t.setControlsSize();
                                t.media.setVideoSize(e.target.videoWidth, e.target.videoHeight);
                            }
                        }, false);
                    }
                }
                media.addEventListener('play', function() {
                    for (var i = 0, il = mejs.players.length; i < il; i++) {
                        var p = mejs.players[i];
                        if (p.id != t.id && t.options.pauseOtherPlayers && !p.paused && !p.ended) {
                            p.pause();
                        }
                        p.hasFocus = false;
                    }
                    t.hasFocus = true;
                }, false);
                t.media.addEventListener('ended', function(e) {
                    try {
                        t.media.setCurrentTime(0);
                    } catch (exp) {
                    }
                    if (t.isVideo) {
                        t.layers.find('.mejs-poster').show()
                    }
                    t.media.pause();
                    if (t.setProgressRail)
                        t.setProgressRail();
                    if (t.setCurrentRail)
                        t.setCurrentRail();
                    if (t.options.loop) {
                        t.media.play();
                    } else if (!t.options.alwaysShowControls && t.controlsEnabled) {
                        t.showControls();
                    }
                }, false);
                t.media.addEventListener('loadedmetadata', function(e) {
                    if (t.updateDuration) {
                        t.updateDuration();
                    }
                    if (t.updateCurrent) {
                        t.updateCurrent();
                    }
                    if (!t.isFullScreen) {
                        t.setPlayerSize(t.width, t.height);
                        t.setControlsSize();
                    }
                }, false);
                setTimeout(function() {
                    t.setPlayerSize(t.width, t.height);
                    t.setControlsSize();
                }, 50);
                $(window).resize(function() {
                    if (!(t.isFullScreen || (mejs.MediaFeatures.hasTrueNativeFullScreen && document.webkitIsFullScreen))) {
                        t.setPlayerSize(t.width, t.height);
                    }
                    t.setControlsSize();
                });
                if (t.media.pluginType == 'youtube') {
                    t.container.find('.mejs-overlay-play').hide();
                }
            }
            if (autoplay && media.pluginType == 'native') {
                media.load();
                media.play();
            }
            if (t.options.success) {
                if (typeof t.options.success == 'string') {
                    window[t.options.success](t.media, t.domNode, t);
                } else {
                    t.options.success(t.media, t.domNode, t);
                }
            }
        },handleError: function(e) {
            var t = this;
            t.controls.hide();
            if (t.options.error) {
                t.options.error(e);
            }
        },setPlayerSize: function(width, height) {
            var t = this;
            t.width = width;
            t.height = height;
            if (t.height.toString().indexOf('%') > 0) {
                var 
                nativeWidth = (t.media.videoWidth && t.media.videoWidth > 0) ? t.media.videoWidth : t.options.defaultVideoWidth, nativeHeight = (t.media.videoHeight && t.media.videoHeight > 0) ? t.media.videoHeight : t.options.defaultVideoHeight, parentWidth = t.container.parent().width(), newHeight = parseInt(parentWidth * nativeHeight / nativeWidth, 10);
                if (t.container.parent()[0].tagName.toLowerCase() === 'body') {
                    parentWidth = $(window).width();
                    newHeight = $(window).height();
                }
                t.container.width(parentWidth).height(newHeight);
                t.$media.width('100%').height('100%');
                t.container.find('object, embed, iframe').width('100%').height('100%');
                if (t.media.setVideoSize)
                    t.media.setVideoSize(parentWidth, newHeight);
                t.layers.children('.mejs-layer').width('100%').height('100%');
            } else {
                t.container.width(t.width).height(t.height);
                t.layers.children('.mejs-layer').width(t.width).height(t.height);
                if (t.media.setVideoSize)
                    t.media.setVideoSize(t.width, t.height);
            }
        },setControlsSize: function() {
            var t = this, usedWidth = 0, railWidth = 0, rail = t.controls.find('.mejs-time-rail'), total = t.controls.find('.mejs-time-total'), current = t.controls.find('.mejs-time-current'), loaded = t.controls.find('.mejs-time-loaded');
            others = rail.siblings();
            t.totalOuterWidth_ = undefined;
            t.totalOffset_ = undefined;
            t.handleWidthHalf_ = undefined;
            t.totalWidth_ = undefined;
            if (t.options && !t.options.autosizeProgress) {
                railWidth = parseInt(rail.css('width'));
            }
            if (railWidth === 0 || !railWidth) {
                others.each(function() {
                    if ($(this).css('position') != 'absolute') {
                        usedWidth += $(this).outerWidth(true);
                    }
                });
                railWidth = t.controls.width() - usedWidth - (rail.outerWidth(true) - rail.outerWidth(false)) - 1;
            }
            rail.width(railWidth);
            total.width(railWidth - (total.outerWidth(true) - total.width()));
            if (t.setProgressRail)
                t.setProgressRail();
            if (t.setCurrentRail)
                t.setCurrentRail();
        },buildposter: function(player, controls, layers, media) {
            var t = this, poster = $('<div class="mejs-poster mejs-layer">' + '</div>').appendTo(layers), posterUrl = player.$media.attr('poster');
            if (player.options.poster !== '') {
                posterUrl = player.options.poster;
            }
            if (posterUrl !== '' && posterUrl != null) {
                t.setPoster(posterUrl);
            } else {
                poster.hide();
            }
            media.addEventListener('playing', function() {
                poster.fadeOut();
            }, false);
        },setPoster: function(url) {
            var t = this, posterDiv = t.container.find('.mejs-poster'), posterImg = posterDiv.find('img');
            if (posterImg.length == 0) {
                posterImg = $('<img width="100%" height="100%" />').appendTo(posterDiv);
            }
            posterImg.attr('src', url);
        },buildoverlays: function(player, controls, layers, media) {
            if (!player.isVideo)
                return;
            var 
            t = this, timer, blackdrop = $('<div class="mejs-overlay mejs-layer mejs-overlay-blackdrop"></div>').hide().appendTo(layers), loading = $('<div class="mejs-overlay mejs-layer loading">' + '<div class="mejs-overlay-loading"><span></span></div>' + '</div>').hide().appendTo(layers), titleInfo = $('<div class="mejs-overlay mejs-layer mejs-titleinfo">' + '<div class="mejs-titleinfo-holder"><span>You&#146;re watching</span><span class="mejs-title">' + player.$media.data("name") + '</span></div>' + '</div>').hide().appendTo(layers), error = $('<div class="mejs-overlay mejs-layer">' + '<div class="mejs-overlay-error"></div>' + '</div>').hide().appendTo(layers), bigPlay = $('<div class="mejs-overlay mejs-layer mejs-overlay-play">' + '<div class="mejs-overlay-button"></div>' + '</div>').appendTo(layers).click(function() {
                if (media.paused) {
                    media.play();
                } else {
                    media.pause();
                }
            });
            media.addEventListener('play', function() {
                bigPlay.hide();
                loading.hide();
                if (player.$media.data("name")) {
                    titleInfo.hide();
                }
                error.hide();
            }, false);
            media.addEventListener('playing', function() {
                bigPlay.hide();
                loading.hide();
                controls.find('.mejs-time-buffering').hide();
                console.log('is playing');
                error.hide();
            }, false);
            media.addEventListener('pause', function() {
                if (!mejs.MediaFeatures.isiPhone) {
                    bigPlay.show();
                    if (player.$media.data("name") && (media.duration - 1 > media.currentTime && media.currentTime > 0)) {
                        titleInfo.delay(1500).fadeIn(800);
                    }
                }
            }, false);
            media.addEventListener('seeking', function() {
                loading.show();
                controls.find('.mejs-time-buffering').show();
            }, false);
            media.addEventListener('seeked', function() {
                loading.hide();
                controls.find('.mejs-time-buffering').hide();
            }, false);
            media.addEventListener('waiting', function() {
                loading.show();
                controls.find('.mejs-time-buffering').show();
                console.log('is waiting');
            }, false);
            media.addEventListener('loadeddata', function() {
                loading.show();
            }, false);
            media.addEventListener('canplay', function() {
                loading.hide();
            }, false);
            media.addEventListener('error', function() {
                loading.hide();
                error.show();
                error.find('mejs-overlay-error').html("Error loading this resource");
            }, false);
        },buildkeyboard: function(player, controls, layers, media) {
            var t = this;
            $(document).keydown(function(e) {
                if (player.hasFocus && player.options.enableKeyboard) {
                    for (var i = 0, il = player.options.keyActions.length; i < il; i++) {
                        var keyAction = player.options.keyActions[i];
                        for (var j = 0, jl = keyAction.keys.length; j < jl; j++) {
                            if (e.keyCode == keyAction.keys[j]) {
                                e.preventDefault();
                                keyAction.action(player, media);
                                return false;
                            }
                        }
                    }
                }
                return true;
            });
            $(document).click(function(event) {
                if ($(event.target).closest('.mejs-container').length == 0) {
                    player.hasFocus = false;
                }
            });
        },findTracks: function() {
            var t = this, tracktags = t.$media.find('track');
            t.tracks = [];
            tracktags.each(function(index, track) {
                track = $(track);
                t.tracks.push({srclang: track.attr('srclang').toLowerCase(),src: track.attr('src'),kind: track.attr('kind'),label: track.attr('label') || '',entries: [],isLoaded: false});
            });
        },changeSkin: function(className) {
            this.container[0].className = 'mejs-container ' + className;
            this.setPlayerSize(this.width, this.height);
            this.setControlsSize();
        },play: function() {
            this.media.play();
        },pause: function() {
            this.media.pause();
        },load: function() {
            this.media.load();
        },setMuted: function(muted) {
            this.media.setMuted(muted);
        },setCurrentTime: function(time) {
            this.media.setCurrentTime(time);
        },getCurrentTime: function() {
            return this.media.currentTime;
        },setVolume: function(volume) {
            this.media.setVolume(volume);
        },getVolume: function() {
            return this.media.volume;
        },setSrc: function(src) {
            this.media.setSrc(src);
        },changeQuality: function(src) {
            this.media.changeQuality(this);
        },remove: function() {
            var t = this;
            if (t.media.pluginType == 'flash') {
                t.media.remove();
            } else if (t.media.pluginTyp == 'native') {
                t.media.prop('controls', true);
            }
            if (!t.isDynamic) {
                t.$node.insertBefore(t.container)
            }
            t.container.remove();
        }};
    if (typeof jQuery != 'undefined') {
        jQuery.fn.mediaelementplayer = function(options) {
            return this.each(function() {
                new mejs.MediaElementPlayer(this, options);
            });
        };
    }
    $(document).ready(function() {
        $('.mejs-player').mediaelementplayer();
    });
    window.MediaElementPlayer = mejs.MediaElementPlayer;
})(mejs.$);
(function($) {
    $.extend(mejs.MepDefaults, {playpauseText: 'Play/Pause'});
    $.extend(MediaElementPlayer.prototype, {buildplaypause: function(player, controls, layers, media) {
            var 
            t = this, play = $('<div class="mejs-button mejs-playpause-button mejs-play" >' + '<button type="button" aria-controls="' + t.id + '" title="' + t.options.playpauseText + '"></button>' + '</div>').appendTo(controls).click(function(e) {
                e.preventDefault();
                if (media.paused) {
                    media.play();
                } else {
                    media.pause();
                }
                return false;
            });
            media.addEventListener('play', function() {
                play.removeClass('mejs-play').addClass('mejs-pause');
            }, false);
            media.addEventListener('playing', function() {
                play.removeClass('mejs-play').addClass('mejs-pause');
            }, false);
            media.addEventListener('pause', function() {
                play.removeClass('mejs-pause').addClass('mejs-play');
            }, false);
            media.addEventListener('paused', function() {
                play.removeClass('mejs-pause').addClass('mejs-play');
            }, false);
        }});
})(mejs.$);
(function($) {
    $.extend(mejs.MepDefaults, {stopText: 'Stop'});
    $.extend(MediaElementPlayer.prototype, {buildstop: function(player, controls, layers, media) {
            var t = this, stop = $('<div class="mejs-button mejs-stop-button mejs-stop">' + '<button type="button" aria-controls="' + t.id + '" title="' + t.options.stopText + '></button>' + '</div>').appendTo(controls).click(function() {
                if (!media.paused) {
                    media.pause();
                }
                if (media.currentTime > 0) {
                    media.setCurrentTime(0);
                    controls.find('.mejs-time-current').width('0px');
                    controls.find('.mejs-time-handle').css('left', '0px');
                    controls.find('.mejs-time-float-current').html(mejs.Utility.secondsToTimeCode(0));
                    controls.find('.mejs-currenttime').html(mejs.Utility.secondsToTimeCode(0));
                    layers.find('.mejs-poster').show();
                }
            });
        }});
})(mejs.$);
(function($) {
    $.extend(MediaElementPlayer.prototype, {buildprogress: function(player, controls, layers, media) {
            $('<div class="mejs-time-rail">' + '<span class="mejs-time-total">' + '<span class="mejs-time-internal">' + '<span class="mejs-time-loaded"></span>' + '<span class="mejs-time-buffering"></span>' + '<span class="mejs-time-current"></span>' + '<span class="mejs-time-handle"></span>' + '</span>' + '<span class="mejs-time-float">' + '<span class="mejs-time-float-current">00:00</span>' + '<span class="mejs-time-float-corner"></span>' + '</span>' + '</span>' + '</div>').appendTo(controls);
            controls.find('.mejs-time-buffering').hide();
            var 
            t = this, total = controls.find('.mejs-time-total'), loaded = controls.find('.mejs-time-loaded'), current = controls.find('.mejs-time-current'), handle = controls.find('.mejs-time-handle'), timefloat = controls.find('.mejs-time-float'), timefloatcurrent = controls.find('.mejs-time-float-current'), handleMouseMove = function(e) {
                if (t.totalOuterWidth_ == undefined) {
                    t.totalOuterWidth_ = total.outerWidth();
                }
                if (t.totalOffset_ == undefined) {
                    t.totalOffset_ = total.offset();
                }
                var x = e.pageX, offset = t.totalOffset_, width = t.totalOuterWidth_, percentage = 0, newTime = 0, pos = x - total.offset().left;
                if (x > offset.left && x <= width + offset.left && media.duration) {
                    percentage = ((x - offset.left) / width);
                    newTime = (percentage <= 0.02) ? 0 : percentage * media.duration;
                    if (newTime > media.bufferedTime && media.pluginType == 'flash') {
                        return false;
                    }
                    if (mouseIsDown) {
                        media.setCurrentTime(newTime);
                    }
                    if (!mejs.MediaFeatures.hasTouch) {
                        timefloat[0].style.left = pos + 'px';
                        timefloatcurrent.text(mejs.Utility.secondsToTimeCode(newTime));
                    }
                }
            }, mouseIsDown = false, mouseIsOver = false;
            total.bind('mousedown', function(e) {
                if (e.which === 1) {
                    mouseIsDown = true;
                    handleMouseMove(e);
                    $(document).bind('mousemove.dur', function(e) {
                        handleMouseMove(e);
                    }).bind('mouseup.dur', function(e) {
                        mouseIsDown = false;
                        timefloat.hide();
                        $(document).unbind('.dur');
                    });
                    return false;
                }
            }).bind('mouseenter', function(e) {
                mouseIsOver = true;
                $(document).bind('mousemove.dur', function(e) {
                    handleMouseMove(e);
                });
                if (!mejs.MediaFeatures.hasTouch) {
                    timefloat.show();
                }
            }).bind('mouseleave', function(e) {
                mouseIsOver = false;
                if (!mouseIsDown) {
                    $(document).unbind('.dur');
                    timefloat.hide();
                }
            });
            media.addEventListener('progress', function(e) {
                player.setProgressRail(e);
                player.setCurrentRail(e);
            }, false);
            media.addEventListener('timeupdate', function(e) {
                player.setProgressRail(e);
                player.setCurrentRail(e);
            }, false);
            t.loaded = loaded;
            t.total = total;
            t.current = current;
            t.handle = handle;
        },setProgressRail: function(e) {
            var 
            t = this, target = (e != undefined) ? e.target : t.media, percent = null;
            if (target && target.buffered && target.buffered.length > 0 && target.buffered.end && target.duration) {
                percent = target.buffered.end(0) / target.duration;
            } 
            else if (target && target.bytesTotal != undefined && target.bytesTotal > 0 && target.bufferedBytes != undefined) {
                percent = target.bufferedBytes / target.bytesTotal;
            } 
            else if (e && e.lengthComputable && e.total != 0) {
                percent = e.loaded / e.total;
            }
            if (t.totalWidth_ == undefined) {
                t.totalWidth_ = t.total[0].offsetWidth;
            }
            if (percent !== null) {
                percent = percent > 1 ? 1 : percent < 0 ? 0 : percent;
                if (t.loaded && t.total) {
                    t.loaded[0].style.width = (t.totalWidth_ * percent) + 'px';
                }
            }
        },setCurrentRail: function() {
            var t = this;
            if (t.media.currentTime != undefined && t.media.duration) {
                if (t.total && t.handle) {
                    if (t.handleWidthHalf_ == undefined) {
                        t.handleWidthHalf_ = (t.handle.outerWidth(true) / 2);
                    }
                    if (t.totalWidth_ == undefined) {
                        t.totalWidth_ = t.total[0].offsetWidth;
                    }
                    var 
                    newWidth = t.totalWidth_ * t.media.currentTime / t.media.duration, handlePos = newWidth - t.handleWidthHalf_;
                    t.current[0].style.width = newWidth + 'px';
                    t.handle[0].style.left = handlePos + 'px';
                }
            }
        }});
})(mejs.$);
(function($) {
    $.extend(mejs.MepDefaults, {duration: -1,timeAndDurationSeparator: ' <span> | </span> '});
    $.extend(MediaElementPlayer.prototype, {buildcurrent: function(player, controls, layers, media) {
            var t = this;
            $('<div class="mejs-time">' + '<span class="mejs-currenttime">' + (player.options.alwaysShowHours ? '00:' : '') + (player.options.showTimecodeFrameCount ? '00:00:00' : '00:00') + '</span>' + '</div>').appendTo(controls);
            t.currenttime = t.controls.find('.mejs-currenttime');
            media.addEventListener('timeupdate', function() {
                player.updateCurrent();
            }, false);
        },buildduration: function(player, controls, layers, media) {
            var t = this;
            if (controls.children().last().find('.mejs-currenttime').length > 0) {
                $(t.options.timeAndDurationSeparator + '<span class="mejs-duration">' + (t.options.duration > 0 ? mejs.Utility.secondsToTimeCode(t.options.duration, t.options.alwaysShowHours || t.media.duration > 3600, t.options.showTimecodeFrameCount, t.options.framesPerSecond || 25) : ((player.options.alwaysShowHours ? '00:' : '') + (player.options.showTimecodeFrameCount ? '00:00:00' : '00:00'))) + '</span>').appendTo(controls.find('.mejs-time'));
            } else {
                controls.find('.mejs-currenttime').parent().addClass('mejs-currenttime-container');
                $('<div class="mejs-time mejs-duration-container">' + '<span class="mejs-duration">' + (t.options.duration > 0 ? mejs.Utility.secondsToTimeCode(t.options.duration, t.options.alwaysShowHours || t.media.duration > 3600, t.options.showTimecodeFrameCount, t.options.framesPerSecond || 25) : ((player.options.alwaysShowHours ? '00:' : '') + (player.options.showTimecodeFrameCount ? '00:00:00' : '00:00'))) + '</span>' + '</div>').appendTo(controls);
            }
            t.durationD = t.controls.find('.mejs-duration');
            media.addEventListener('timeupdate', function() {
                player.updateDuration();
            }, false);
        },updateCurrent: function() {
            var t = this;
            if (t.currenttime) {
                t.currenttime.text(mejs.Utility.secondsToTimeCode(t.media.currentTime, t.options.alwaysShowHours || t.media.duration > 3600, t.options.showTimecodeFrameCount, t.options.framesPerSecond || 25));
            }
        },updateDuration: function() {
            var t = this;
            if (t.media.duration && t.durationD) {
                t.durationD.text(mejs.Utility.secondsToTimeCode(t.media.duration, t.options.alwaysShowHours, t.options.showTimecodeFrameCount, t.options.framesPerSecond || 25));
            }
        }});
})(mejs.$);
(function($) {
    $.extend(mejs.MepDefaults, {muteText: 'Mute Toggle',hideVolumeOnTouchDevices: true});
    $.extend(MediaElementPlayer.prototype, {buildvolume: function(player, controls, layers, media) {
            if (mejs.MediaFeatures.hasTouch && this.options.hideVolumeOnTouchDevices)
                return;
            var t = this, mute = $('<div class="mejs-button mejs-volume-button mejs-mute">' + '<button type="button" aria-controls="' + t.id + '" title="' + t.options.muteText + '" class="mute"></button>' + '<button type="button" class="full-volume"></button>' + '<div class="mejs-volume-slider">' + '<div class="mejs-volume-total"></div>' + '<div class="mejs-volume-current"></div>' + '<div class="mejs-volume-handle"></div>' + '</div>' + '</div>').appendTo(controls), volumeSlider = mute.find('.mejs-volume-slider'), volumeTotal = mute.find('.mejs-volume-total'), volumeCurrent = mute.find('.mejs-volume-current'), volumeHandle = mute.find('.mejs-volume-handle'), positionVolumeHandle = function(volume) {
                if (!player.isFullscreen) {
                    if (!volumeSlider.is(':visible')) {
                        volumeSlider.show();
                        positionVolumeHandle(volume);
                        volumeSlider.hide()
                        return;
                    }
                    var 
                    totalHeight = volumeTotal.height(), totalPosition = volumeTotal.position(), newTop = totalHeight - (totalHeight * volume);
                    var newPos = Math.max(totalPosition.top + newTop - (volumeHandle.height() / 2), parseInt(volumeTotal.css('top').replace(/px/, ''), 10));
                    volumeHandle.css('top', newPos);
                    volumeCurrent.height(totalHeight - newTop);
                    volumeCurrent.css('top', totalPosition.top + newTop);
                }
            }, handleVolumeMove = function(e) {
                if (player.options.horizontalVolumeOnFullscreen && player.isFullScreen) {
                    var 
                    railWidth = volumeTotal.width(), totalOffset = volumeTotal.offset(), totalLeft = parseInt(volumeTotal.css('left').replace(/px/, ''), 10), newX = e.pageX - totalOffset.left, volume = newX / railWidth;
                    if (totalOffset.top == 0 || totalOffset.left == 0)
                        return;
                    volume = Math.max(0, volume);
                    volume = Math.min(volume, 1);
                    if (newX < 0)
                        newX = 0;
                    else if (newX > railWidth)
                        newX = railWidth;
                    newPos = Math.max(newX - (volumeHandle.width() / 2) + totalLeft, 0);
                    newPos = Math.min(newPos, railWidth - volumeHandle.width());
                    volumeHandle.css('left', newPos);
                    volumeCurrent.width(railWidth - newX);
                    volumeCurrent.css('left', newX + totalLeft);
                } 
                else {
                    var 
                    railHeight = volumeTotal.height(), totalOffset = volumeTotal.offset(), totalTop = parseInt(volumeTotal.css('top').replace(/px/, ''), 10), newY = e.pageY - totalOffset.top, volume = (railHeight - newY) / railHeight
                    if (totalOffset.top == 0 || totalOffset.left == 0)
                        return;
                    volume = Math.max(0, volume);
                    volume = Math.min(volume, 1);
                    if (newY < 0)
                        newY = 0;
                    else if (newY > railHeight)
                        newY = railHeight;
                    if (newY + totalTop <= totalTop + volumeHandle.height() / 2) {
                        volumeHandle.css('top', totalTop);
                    } 
                    else if (newY + totalTop >= totalTop + railHeight) {
                        volumeHandle.css('top', totalTop + railHeight - (volumeHandle.height() / 2));
                    } 
                    else {
                        volumeHandle.css('top', newY - (volumeHandle.height() / 2) + totalTop);
                    }
                    volumeCurrent.height(railHeight - newY);
                    volumeCurrent.css('top', newY + totalTop);
                }
                if (volume == 0) {
                    media.setMuted(true);
                    mute.removeClass('mejs-mute').addClass('mejs-unmute');
                } else {
                    media.setMuted(false);
                    mute.removeClass('mejs-unmute').addClass('mejs-mute');
                }
                volume = Math.max(0, volume);
                volume = Math.min(volume, 1);
                media.setVolume(volume);
            }, mouseIsDown = false, mouseIsOver = false;
            $(player).bind('enteredfullscreen', function() {
                if (player.options.horizontalVolumeOnFullscreen) {
                    var 
                    volume = media.volume, railWidth = volumeTotal.width(), totalOffset = volumeTotal.offset(), totalLeft = parseInt(volumeTotal.css('left').replace(/px/, ''), 10), newX = railWidth * volume;
                    newPos = Math.max(newX - (volumeHandle.width() / 2) + totalLeft, 0);
                    newPos = Math.min(newPos, railWidth - volumeHandle.width());
                    volumeHandle.css('left', newPos);
                    volumeCurrent.width(railWidth - newX);
                    volumeCurrent.css('left', newX + totalLeft);
                }
            });
            $(player).bind('exitedfullscreen', function() {
                if (player.options.horizontalVolumeOnFullscreen) {
                    var 
                    volume = media.volume, railHeight = volumeTotal.height(), totalOffset = volumeTotal.offset(), totalPosition = volumeTotal.position(), newTop = railHeight - (railHeight * volume);
                    totalTop = parseInt(volumeTotal.css('top').replace(/px/, ''), 10), newY = railHeight * volume;
                    if (newTop + totalTop <= totalTop + volumeHandle.height() / 2) {
                        volumeHandle.css('top', totalTop);
                    } 
                    else {
                        volumeHandle.css('top', totalTop + newTop - (volumeHandle.height() / 2));
                    }
                    volumeHandle.css('left', '');
                    volumeCurrent.height(railHeight - newY);
                    volumeCurrent.css('top', newY + totalTop);
                }
            });
            mute.hover(function() {
                volumeSlider.show();
                positionVolumeHandle(media.volume);
                mouseIsOver = true;
            }, function() {
                if (!mouseIsDown) {
                    volumeSlider.hide();
                }
            });
            volumeSlider.bind('mouseover', function() {
                mouseIsOver = true;
            }).bind('mousedown', function(e) {
                handleVolumeMove(e);
                $(document).bind('mousemove.vol', function(e) {
                    handleVolumeMove(e);
                }).bind('mouseup.vol', function() {
                    mouseIsDown = false;
                    $(document).unbind('.vol');
                    if (!mouseIsOver) {
                        volumeSlider.hide();
                    }
                });
                mouseIsDown = true;
                return false;
            });
            mute.find('button.mute').click(function() {
                if (player.isFullScreen) {
                    media.setMuted(true);
                    volumeHandle.animate({left: 0}, {queue: false,duration: 100});
                } else {
                    media.setMuted(!media.muted);
                    totalTop = parseInt(volumeTotal.css('top').replace(/px/, ''), 10)
                    newTop = volumeTotal.height() - (volumeTotal.height() * media.volume);
                    if (media.muted) {
                        volumeHandle.animate({top: totalTop + volumeTotal.height() - (volumeHandle.height() / 2)}, {queue: false,duration: 100});
                    } else {
                        volumeHandle.animate({top: totalTop + newTop - (volumeHandle.height() / 2)}, {queue: false,duration: 100});
                    }
                }
            });
            mute.find('button.full-volume').click(function() {
                if (player.isFullScreen) {
                    media.setVolume(1);
                    media.setMuted(false);
                    volumeHandle.animate({left: volumeTotal.width() - volumeHandle.width()}, {queue: false,duration: 100});
                }
            });
            media.addEventListener('volumechange', function(e) {
                if (!mouseIsDown) {
                    if (media.muted || !media.volume) {
                        mute.removeClass('mejs-mute').addClass('mejs-unmute');
                    } else {
                        mute.removeClass('mejs-unmute').addClass('mejs-mute');
                    }
                }
            }, false);
            positionVolumeHandle(player.options.startVolume);
            if (media.pluginType === 'native') {
                media.setVolume(player.options.startVolume);
            }
        }});
})(mejs.$);
(function($) {
    $.extend(mejs.MepDefaults, {usePluginFullScreen: true,newWindowCallback: function() {
            return '';
        },fullscreenText: 'Fullscreen'});
    $.extend(MediaElementPlayer.prototype, {isFullScreen: false,isNativeFullScreen: false,docStyleOverflow: null,isInIframe: false,buildfullscreen: function(player, controls, layers, media) {
            if (!player.isVideo)
                return;
            player.isInIframe = (window.location != window.parent.location);
            if (mejs.MediaFeatures.hasTrueNativeFullScreen) {
                player.container.bind(mejs.MediaFeatures.fullScreenEventName, function(e) {
                    if (mejs.MediaFeatures.isFullScreen()) {
                        player.isNativeFullScreen = true;
                        player.setControlsSize();
                    } else {
                        player.isNativeFullScreen = false;
                        player.exitFullScreen();
                    }
                });
            }
            var t = this, normalHeight = 0, normalWidth = 0, container = player.container, fullscreenBtn = $('<div class="mejs-button mejs-fullscreen-button">' + '<button type="button" aria-controls="' + t.id + '" title="' + t.options.fullscreenText + '"></button>' + '</div>').appendTo(controls);
            if (t.media.pluginType === 'native' || (!t.options.usePluginFullScreen && !mejs.MediaFeatures.isFirefox)) {
                fullscreenBtn.click(function() {
                    var isFullScreen = (mejs.MediaFeatures.hasTrueNativeFullScreen && mejs.MediaFeatures.isFullScreen()) || player.isFullScreen;
                    if (isFullScreen) {
                        player.exitFullScreen();
                    } else {
                        player.enterFullScreen();
                    }
                });
            } else {
                var hideTimeout = null, supportsPointerEvents = (document.documentElement.style.pointerEvents === '');
                if (supportsPointerEvents && !mejs.MediaFeatures.isOpera) {
                    var fullscreenIsDisabled = false, restoreControls = function() {
                        if (fullscreenIsDisabled) {
                            videoHoverDiv.hide();
                            controlsLeftHoverDiv.hide();
                            controlsRightHoverDiv.hide();
                            fullscreenBtn.css('pointer-events', '');
                            t.controls.css('pointer-events', '');
                            fullscreenIsDisabled = false;
                        }
                    }, videoHoverDiv = $('<div class="mejs-fullscreen-hover" />').appendTo(t.container).mouseover(restoreControls), controlsLeftHoverDiv = $('<div class="mejs-fullscreen-hover"  />').appendTo(t.container).mouseover(restoreControls), controlsRightHoverDiv = $('<div class="mejs-fullscreen-hover"  />').appendTo(t.container).mouseover(restoreControls), positionHoverDivs = function() {
                        var style = {position: 'absolute',top: 0,left: 0};
                        videoHoverDiv.css(style);
                        controlsLeftHoverDiv.css(style);
                        controlsRightHoverDiv.css(style);
                        videoHoverDiv.width(t.container.width()).height(t.container.height() - t.controls.height());
                        var fullScreenBtnOffset = fullscreenBtn.offset().left - t.container.offset().left;
                        fullScreenBtnWidth = fullscreenBtn.outerWidth(true);
                        controlsLeftHoverDiv.width(fullScreenBtnOffset).height(t.controls.height()).css({top: t.container.height() - t.controls.height()});
                        controlsRightHoverDiv.width(t.container.width() - fullScreenBtnOffset - fullScreenBtnWidth).height(t.controls.height()).css({top: t.container.height() - t.controls.height(),left: fullScreenBtnOffset + fullScreenBtnWidth});
                    };
                    $(document).resize(function() {
                        positionHoverDivs();
                    });
                    fullscreenBtn.mouseover(function() {
                        if (!t.isFullScreen) {
                            var buttonPos = fullscreenBtn.offset(), containerPos = player.container.offset();
                            media.positionFullscreenButton(buttonPos.left - containerPos.left, buttonPos.top - containerPos.top, false);
                            fullscreenBtn.css('pointer-events', 'none');
                            t.controls.css('pointer-events', 'none');
                            videoHoverDiv.show();
                            controlsRightHoverDiv.show();
                            controlsLeftHoverDiv.show();
                            positionHoverDivs();
                            fullscreenIsDisabled = true;
                        }
                    });
                    media.addEventListener('fullscreenchange', function(e) {
                        restoreControls();
                    });
                } else {
                    fullscreenBtn.mouseover(function() {
                        if (hideTimeout !== null) {
                            clearTimeout(hideTimeout);
                            delete hideTimeout;
                        }
                        var buttonPos = fullscreenBtn.offset(), containerPos = player.container.offset();
                        media.positionFullscreenButton(buttonPos.left - containerPos.left, buttonPos.top - containerPos.top, true);
                    }).mouseout(function() {
                        if (hideTimeout !== null) {
                            clearTimeout(hideTimeout);
                            delete hideTimeout;
                        }
                        hideTimeout = setTimeout(function() {
                            media.hideFullscreenButton();
                        }, 1500);
                    });
                }
            }
            player.fullscreenBtn = fullscreenBtn;
            $(document).bind('keydown', function(e) {
                if (((mejs.MediaFeatures.hasTrueNativeFullScreen && mejs.MediaFeatures.isFullScreen()) || t.isFullScreen) && e.keyCode == 27) {
                    player.exitFullScreen();
                }
            });
        },enterFullScreen: function() {
            var t = this;
            $(t).trigger('enteringfullscreen');
            if (t.media.pluginType !== 'native' && (mejs.MediaFeatures.isFirefox || t.options.usePluginFullScreen)) {
                return;
            }
            docStyleOverflow = document.documentElement.style.overflow;
            document.documentElement.style.overflow = 'hidden';
            normalHeight = t.container.height();
            normalWidth = t.container.width();
            if (t.media.pluginType === 'native') {
                if (mejs.MediaFeatures.hasTrueNativeFullScreen) {
                    mejs.MediaFeatures.requestFullScreen(t.container[0]);
                    if (t.isInIframe) {
                        setTimeout(function checkFullscreen() {
                            if (t.isNativeFullScreen) {
                                if ($(window).width() !== screen.width) {
                                    t.exitFullScreen();
                                } else {
                                    setTimeout(checkFullscreen, 500);
                                }
                            }
                        }, 500);
                    }
                } else if (mejs.MediaFeatures.hasSemiNativeFullScreen) {
                    t.media.webkitEnterFullscreen();
                    return;
                }
            }
            if (t.isInIframe) {
                var url = t.options.newWindowCallback(this);
                if (url !== '') {
                    if (!mejs.MediaFeatures.hasTrueNativeFullScreen) {
                        t.pause();
                        window.open(url, t.id, 'top=0,left=0,width=' + screen.availWidth + ',height=' + screen.availHeight + ',resizable=yes,scrollbars=no,status=no,toolbar=no');
                        return;
                    } else {
                        setTimeout(function() {
                            if (!t.isNativeFullScreen) {
                                t.pause();
                                window.open(url, t.id, 'top=0,left=0,width=' + screen.availWidth + ',height=' + screen.availHeight + ',resizable=yes,scrollbars=no,status=no,toolbar=no');
                            }
                        }, 250);
                    }
                }
            }
            t.container.addClass('mejs-container-fullscreen').width('100%').height('100%');
            setTimeout(function() {
                t.container.css({width: '100%',height: '100%'});
                t.setControlsSize();
            }, 500);
            if (t.pluginType === 'native') {
                t.$media.width('100%').height('100%');
            } else {
                t.container.find('object, embed, iframe').width('100%').height('100%');
                t.media.setVideoSize($(window).width(), $(window).height());
            }
            t.layers.children('div').width('100%').height('100%');
            if (t.fullscreenBtn) {
                t.fullscreenBtn.removeClass('mejs-fullscreen').addClass('mejs-unfullscreen');
            }
            t.setControlsSize();
            t.isFullScreen = true;
            $(t).trigger('enteredfullscreen');
        },exitFullScreen: function() {
            var t = this;
            $(t).trigger('exitingfullscreen');
            if (t.media.pluginType !== 'native' && mejs.MediaFeatures.isFirefox) {
                t.media.setFullscreen(false);
                return;
            }
            if (mejs.MediaFeatures.hasTrueNativeFullScreen && (mejs.MediaFeatures.isFullScreen() || t.isFullScreen)) {
                mejs.MediaFeatures.cancelFullScreen();
            }
            document.documentElement.style.overflow = docStyleOverflow;
            t.container.removeClass('mejs-container-fullscreen').width(normalWidth).height(normalHeight);
            if (t.pluginType === 'native') {
                t.$media.width(normalWidth).height(normalHeight);
            } else {
                t.container.find('object embed').width(normalWidth).height(normalHeight);
                t.media.setVideoSize(normalWidth, normalHeight);
            }
            t.layers.children('div').width(normalWidth).height(normalHeight);
            t.fullscreenBtn.removeClass('mejs-unfullscreen').addClass('mejs-fullscreen');
            t.setControlsSize();
            t.isFullScreen = false;
            $(t).trigger('exitedfullscreen');
        }});
})(mejs.$);
(function($) {
    $.extend(mejs.MepDefaults, {startLanguage: '',tracksText: 'Captions/Subtitles'});
    $.extend(MediaElementPlayer.prototype, {hasChapters: false,buildtracks: function(player, controls, layers, media) {
            if (!player.isVideo)
                return;
            if (player.tracks.length == 0)
                return;
            var t = this, i, options = '';
            player.chapters = $('<div class="mejs-chapters mejs-layer"></div>').prependTo(layers).hide();
            player.captions = $('<div class="mejs-captions-layer mejs-layer"><div class="mejs-captions-position"><span class="mejs-captions-text"></span></div></div>').prependTo(layers).hide();
            player.captionsText = player.captions.find('.mejs-captions-text');
            player.captionsButton = $('<div class="mejs-button mejs-captions-button">' + '<button type="button" aria-controls="' + t.id + '" title="' + t.options.tracksText + '"></button>' + '<div class="mejs-captions-selector">' + '<ul>' + '<li>' + '<input type="radio" name="' + player.id + '_captions" id="' + player.id + '_captions_none" value="none" checked="checked" />' + '<label for="' + player.id + '_captions_none">None</label>' + '</li>' + '</ul>' + '</div>' + '</div>').appendTo(controls).hover(function() {
                $(this).find('.mejs-captions-selector').css('visibility', 'visible');
            }, function() {
                $(this).find('.mejs-captions-selector').css('visibility', 'hidden');
            }).delegate('input[type=radio]', 'click', function() {
                lang = this.value;
                if (lang == 'none') {
                    player.selectedTrack = null;
                } else {
                    for (i = 0; i < player.tracks.length; i++) {
                        if (player.tracks[i].srclang == lang) {
                            player.selectedTrack = player.tracks[i];
                            player.captions.attr('lang', player.selectedTrack.srclang);
                            player.displayCaptions();
                            break;
                        }
                    }
                }
            });
            if (!player.options.alwaysShowControls) {
                player.container.bind('mouseenter', function() {
                    player.container.find('.mejs-captions-position').addClass('mejs-captions-position-hover');
                }).bind('mouseleave', function() {
                    if (!media.paused) {
                        player.container.find('.mejs-captions-position').removeClass('mejs-captions-position-hover');
                    }
                });
            } else {
                player.container.find('.mejs-captions-position').addClass('mejs-captions-position-hover');
            }
            player.trackToLoad = -1;
            player.selectedTrack = null;
            player.isLoadingTrack = false;
            for (i = 0; i < player.tracks.length; i++) {
                if (player.tracks[i].kind == 'subtitles') {
                    player.addTrackButton(player.tracks[i].srclang, player.tracks[i].label);
                }
            }
            player.loadNextTrack();
            media.addEventListener('timeupdate', function(e) {
                player.displayCaptions();
            }, false);
            media.addEventListener('loadedmetadata', function(e) {
                player.displayChapters();
            }, false);
            player.container.hover(function() {
                if (player.hasChapters) {
                    player.chapters.css('visibility', 'visible');
                    player.chapters.fadeIn(200);
                }
            }, function() {
                if (player.hasChapters && !media.paused) {
                    player.chapters.fadeOut(200, function() {
                        $(this).css('visibility', 'hidden');
                        $(this).css('display', 'block');
                    });
                }
            });
            if (player.node.getAttribute('autoplay') !== null) {
                player.chapters.css('visibility', 'hidden');
            }
        },loadNextTrack: function() {
            var t = this;
            t.trackToLoad++;
            if (t.trackToLoad < t.tracks.length) {
                t.isLoadingTrack = true;
                t.loadTrack(t.trackToLoad);
            } else {
                t.isLoadingTrack = false;
            }
        },loadTrack: function(index) {
            var 
            t = this, track = t.tracks[index], after = function() {
                track.isLoaded = true;
                t.enableTrackButton(track.srclang, track.label);
                t.loadNextTrack();
            };
            if (track.isTranslation) {
                mejs.TrackFormatParser.translateTrackText(t.tracks[0].entries, t.tracks[0].srclang, track.srclang, t.options.googleApiKey, function(newOne) {
                    track.entries = newOne;
                    after();
                });
            } else {
                $.ajax({url: track.src,success: function(d) {
                        track.entries = mejs.TrackFormatParser.parse(d);
                        after();
                        if (track.kind == 'chapters' && t.media.duration > 0) {
                            t.drawChapters(track);
                        }
                    },error: function() {
                        t.loadNextTrack();
                    }});
            }
        },enableTrackButton: function(lang, label) {
            var t = this;
            if (label === '') {
                label = mejs.language.codes[lang] || lang;
            }
            t.captionsButton.find('input[value=' + lang + ']').prop('disabled', false).siblings('label').html(label);
            if (t.options.startLanguage == lang) {
                $('#' + t.id + '_captions_' + lang).click();
            }
            t.adjustLanguageBox();
        },addTrackButton: function(lang, label) {
            var t = this;
            if (label === '') {
                label = mejs.language.codes[lang] || lang;
            }
            t.captionsButton.find('ul').append($('<li>' + '<input type="radio" name="' + t.id + '_captions" id="' + t.id + '_captions_' + lang + '" value="' + lang + '" disabled="disabled" />' + '<label for="' + t.id + '_captions_' + lang + '">' + label + ' (loading)' + '</label>' + '</li>'));
            t.adjustLanguageBox();
            t.container.find('.mejs-captions-translations option[value=' + lang + ']').remove();
        },adjustLanguageBox: function() {
            var t = this;
            t.captionsButton.find('.mejs-captions-selector').height(t.captionsButton.find('.mejs-captions-selector ul').outerHeight(true) + t.captionsButton.find('.mejs-captions-translations').outerHeight(true));
        },displayCaptions: function() {
            if (typeof this.tracks == 'undefined')
                return;
            var 
            t = this, i, track = t.selectedTrack;
            if (track != null && track.isLoaded) {
                for (i = 0; i < track.entries.times.length; i++) {
                    if (t.media.currentTime >= track.entries.times[i].start && t.media.currentTime <= track.entries.times[i].stop) {
                        t.captionsText.html(track.entries.text[i]);
                        t.captions.show();
                        return;
                    }
                }
                t.captions.hide();
            } else {
                t.captions.hide();
            }
        },displayChapters: function() {
            var 
            t = this, i;
            for (i = 0; i < t.tracks.length; i++) {
                if (t.tracks[i].kind == 'chapters' && t.tracks[i].isLoaded) {
                    t.drawChapters(t.tracks[i]);
                    t.hasChapters = true;
                    break;
                }
            }
        },drawChapters: function(chapters) {
            var 
            t = this, i, dur, percent = 0, usedPercent = 0;
            t.chapters.empty();
            for (i = 0; i < chapters.entries.times.length; i++) {
                dur = chapters.entries.times[i].stop - chapters.entries.times[i].start;
                percent = Math.floor(dur / t.media.duration * 100);
                if (percent + usedPercent > 100 || i == chapters.entries.times.length - 1 && percent + usedPercent < 100) 
                {
                    percent = 100 - usedPercent;
                }
                t.chapters.append($('<div class="mejs-chapter" rel="' + chapters.entries.times[i].start + '" style="left: ' + usedPercent.toString() + '%;width: ' + percent.toString() + '%;">' + '<div class="mejs-chapter-block' + ((i == chapters.entries.times.length - 1) ? ' mejs-chapter-block-last' : '') + '">' + '<span class="ch-title">' + chapters.entries.text[i] + '</span>' + '<span class="ch-time">' + mejs.Utility.secondsToTimeCode(chapters.entries.times[i].start) + '&ndash;' + mejs.Utility.secondsToTimeCode(chapters.entries.times[i].stop) + '</span>' + '</div>' + '</div>'));
                usedPercent += percent;
            }
            t.chapters.find('div.mejs-chapter').click(function() {
                t.media.setCurrentTime(parseFloat($(this).attr('rel')));
                if (t.media.paused) {
                    t.media.play();
                }
            });
            t.chapters.show();
        }});
    mejs.language = {codes: {af: 'Afrikaans',sq: 'Albanian',ar: 'Arabic',be: 'Belarusian',bg: 'Bulgarian',ca: 'Catalan',zh: 'Chinese','zh-cn': 'Chinese Simplified','zh-tw': 'Chinese Traditional',hr: 'Croatian',cs: 'Czech',da: 'Danish',nl: 'Dutch',en: 'English',et: 'Estonian',tl: 'Filipino',fi: 'Finnish',fr: 'French',gl: 'Galician',de: 'German',el: 'Greek',ht: 'Haitian Creole',iw: 'Hebrew',hi: 'Hindi',hu: 'Hungarian',is: 'Icelandic',id: 'Indonesian',ga: 'Irish',it: 'Italian',ja: 'Japanese',ko: 'Korean',lv: 'Latvian',lt: 'Lithuanian',mk: 'Macedonian',ms: 'Malay',mt: 'Maltese',no: 'Norwegian',fa: 'Persian',pl: 'Polish',pt: 'Portuguese',ro: 'Romanian',ru: 'Russian',sr: 'Serbian',sk: 'Slovak',sl: 'Slovenian',es: 'Spanish',sw: 'Swahili',sv: 'Swedish',tl: 'Tagalog',th: 'Thai',tr: 'Turkish',uk: 'Ukrainian',vi: 'Vietnamese',cy: 'Welsh',yi: 'Yiddish'}};
    mejs.TrackFormatParser = {pattern_identifier: /^([a-zA-z]+-)?[0-9]+$/,pattern_timecode: /^([0-9]{2}:[0-9]{2}:[0-9]{2}([,.][0-9]{1,3})?) --\> ([0-9]{2}:[0-9]{2}:[0-9]{2}([,.][0-9]{3})?)(.*)$/,split2: function(text, regex) {
            return text.split(regex);
        },parse: function(trackText) {
            var 
            i = 0, lines = this.split2(trackText, /\r?\n/), entries = {text: [],times: []}, timecode, text;
            for (; i < lines.length; i++) {
                if (this.pattern_identifier.exec(lines[i])) {
                    i++;
                    timecode = this.pattern_timecode.exec(lines[i]);
                    if (timecode && i < lines.length) {
                        i++;
                        text = lines[i];
                        i++;
                        while (lines[i] !== '' && i < lines.length) {
                            text = text + '\n' + lines[i];
                            i++;
                        }
                        entries.text.push(text);
                        entries.times.push({start: mejs.Utility.timeCodeToSeconds(timecode[1]),stop: mejs.Utility.timeCodeToSeconds(timecode[3]),settings: timecode[5]});
                    }
                }
            }
            return entries;
        }};
    if ('x\n\ny'.split(/\n/gi).length != 3) {
        mejs.TrackFormatParser.split2 = function(text, regex) {
            var 
            parts = [], chunk = '', i;
            for (i = 0; i < text.length; i++) {
                chunk += text.substring(i, i + 1);
                if (regex.test(chunk)) {
                    parts.push(chunk.replace(regex, ''));
                    chunk = '';
                }
            }
            parts.push(chunk);
            return parts;
        }
    }
})(mejs.$);
(function($) {
    $.extend(mejs.MepDefaults, {contextMenuItems: [{render: function(player) {
                    if (typeof player.enterFullScreen == 'undefined')
                        return null;
                    if (player.isFullScreen) {
                        return "Turn off Fullscreen";
                    } else {
                        return "Go Fullscreen";
                    }
                },click: function(player) {
                    if (player.isFullScreen) {
                        player.exitFullScreen();
                    } else {
                        player.enterFullScreen();
                    }
                }}, {render: function(player) {
                    if (player.media.muted) {
                        return "Unmute";
                    } else {
                        return "Mute";
                    }
                },click: function(player) {
                    if (player.media.muted) {
                        player.setMuted(false);
                    } else {
                        player.setMuted(true);
                    }
                }}, {isSeparator: true}, {render: function(player) {
                    return "Download Video";
                },click: function(player) {
                    window.location.href = player.media.currentSrc;
                }}, {render: function(player) {
                    return "Powered by Ministry Ops";
                },click: function(player) {
                    window.location.href = "http://ministryops.com";
                }}]});
    $.extend(MediaElementPlayer.prototype, {buildcontextmenu: function(player, controls, layers, media) {
            var t = this;
            player.contextMenu = $('<div class="mejs-contextmenu"></div>').appendTo($('body')).hide();
            player.container.bind('contextmenu', function(e) {
                if (player.isContextMenuEnabled) {
                    e.preventDefault();
                    player.renderContextMenu(e.originalEvent.pageX + 4, e.originalEvent.pageY + 5);
                    $(document).click(function() {
                        player.contextMenu.hide();
                    });
                    return false;
                }
            });
            player.contextMenu.bind('mouseleave', function() {
                console.log('context hover out');
                player.startContextMenuTimer();
            });
        },isContextMenuEnabled: true,enableContextMenu: function() {
            this.isContextMenuEnabled = true;
        },disableContextMenu: function() {
            this.isContextMenuEnabled = false;
        },contextMenuTimeout: null,startContextMenuTimer: function() {
            var t = this;
            t.killContextMenuTimer();
            t.contextMenuTimer = setTimeout(function() {
                t.hideContextMenu();
                t.contextMenuIsVisible = false;
                t.killContextMenuTimer();
            }, 750);
        },killContextMenuTimer: function() {
            var timer = this.contextMenuTimer;
            if (timer != null) {
                clearTimeout(timer);
                delete timer;
                timer = null;
            }
        },hideContextMenu: function() {
            this.contextMenu.hide();
        },renderContextMenu: function(x, y) {
            var t = this, html = '', items = t.options.contextMenuItems;
            for (var i = 0, il = items.length; i < il; i++) {
                if (items[i].isSeparator) {
                    html += '<div class="mejs-contextmenu-separator"></div>';
                } else {
                    var rendered = items[i].render(t);
                    if (rendered != null) {
                        html += '<div class="mejs-contextmenu-item" data-itemindex="' + i + '" id="element-' + (Math.random() * 1000000) + '">' + rendered + '</div>';
                    }
                }
            }
            t.contextMenu.empty().append($(html)).css({top: y,left: x}).show();
            t.contextMenuIsVisible = true;
            t.contextMenu.find('.mejs-contextmenu-item').each(function() {
                var $dom = $(this), itemIndex = parseInt($dom.data('itemindex'), 10), item = t.options.contextMenuItems[itemIndex];
                if (typeof item.show != 'undefined')
                    item.show($dom, t);
                $dom.click(function() {
                    if (typeof item.click != 'undefined')
                        item.click(t);
                    t.contextMenu.hide();
                    t.contextMenuIsVisible = false;
                });
            });
            setTimeout(function() {
                t.killControlsTimer('rev3');
            }, 100);
        }});
})(mejs.$);
(function($) {
    $.extend(mejs.MepDefaults, {qualityText: 'HD Toggle'});
    $.extend(MediaElementPlayer.prototype, {buildquality: function(player, controls, layers, media) {
            var t = this;
            var sources = [];
            player.qualityPairs = [];
            var qualityButton = $('<div class="mejs-button mejs-quality-button">' + '<button type="button" aria-controls="' + t.id + '" title="' + t.options.qualityText + '"></button>' + '</div>')
            var getSrc = function(qualityButton) {
                for (var i = 0; i < player.domNode.childNodes.length; i++) {
                    var n = player.domNode.childNodes[i];
                    if (n.nodeType == 1 && n.tagName.toLowerCase() == 'source') {
                        var src = n.getAttribute('src');
                        var type = formatType(src, n.getAttribute('type'));
                        var quality = n.getAttribute('data-quality');
                        sources.push({type: type,url: src,quality: quality});
                    }
                }
                for (var i = 0; i < sources.length; i++) {
                    var type = sources[i].type;
                    for (k = i + 1; k < sources.length; k++) {
                        if (sources[k].type == type && sources[i].quality && sources[k].quality) {
                            if (sources[i].quality == 'sd') {
                                player.qualityPairs.push({sd: sources[i],hd: sources[k],type: sources[i].type});
                            } 
                            else {
                                player.qualityPairs.push({sd: sources[k],hd: sources[i],type: sources[i].type});
                            }
                        }
                    }
                }
                var src = null;
                for (var i = 0; i < player.qualityPairs.length; i++) {
                    if (media.canPlayType(player.qualityPairs[i].type) != '' && player.qualityPairs[i].type == 'video/mp4') {
                        src = player.qualityPairs[i];
                    }
                }
                if (src) {
                    player.qualityPairs = src;
                    qualityButton.appendTo(controls);
                    if (t.options.defaultHd) {
                        player.setSrc(src.hd.url);
                        player.quality = 'hd';
                        qualityButton.addClass('hd');
                    } 
                    else {
                        player.setSrc(src.sd.url);
                        player.quality = 'sd';
                        qualityButton.removeClass('hd');
                    }
                }
            };
            getSrc(qualityButton);
            function toggleQuality() {
                if (player.qualityPairs) {
                    if (player.quality == 'hd') {
                        player.changeQuality(player.qualityPairs.sd.url);
                        qualityButton.removeClass('hd');
                        if (media.pluginType == 'flash') {
                            media.pluginApi.setHD(false);
                        }
                    } 
                    else if (player.quality == 'sd') {
                        player.changeQuality(player.qualityPairs.hd.url);
                        qualityButton.addClass('hd');
                        if (media.pluginType == 'flash') {
                            media.pluginApi.setHD(true);
                        }
                    }
                }
            }
            ;
            if (media.pluginType == 'flash') {
                media.addEventListener('hdchange', toggleQuality, false);
            }
            qualityButton.click(toggleQuality);
            function formatType(url, type) {
                var ext;
                if (url && !type) {
                    return this.getTypeFromFile(url);
                } else {
                    if (type && ~type.indexOf(';')) {
                        return type.substr(0, type.indexOf(';'));
                    } else {
                        return type;
                    }
                }
            }
        }});
})(mejs.$);
