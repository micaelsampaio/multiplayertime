var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

function Engine (id, w, h, config) {
	new FastClick(document.body);

	var game = this;
	this.canvas = document.getElementById(id);
	this.canvas.width = w ||  this.canvas.width;
	this.canvas.height = h ||  this.canvas.height;
	this.width = w || this.canvas.width;
	this.height = h ||this.canvas.height;
	this.resizedWidth = this.width;
	this.resizedHeight = this.height;
	this.context = this.canvas.getContext("2d");
	this.offSetX = 0;
	this.offSetY = 0;
	this.update = null;
	this.config = config || {};
	//update
	this.idRequestAnimation;
	//button
	this.clicks = [];

	this.deltaTime = 0;

	var Time = {currentTime : new Date(), oldTime : new Date(), deltaTime:0};
	
	this.clear = function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	function clear () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	this.start = function(update){
		this.update = update;
		UpdateTime();
		ClearTime();
		this.gameLoop();
	}

	this.gameLoop = function(){
		this.clear();
		UpdateTime();
		this.update();
		if(this.clicks.length>0){
			this.clicks = [];
		}
		ClearTime();
		this.idRequestAnimation = requestAnimationFrame(this.gameLoop.bind(this));
	}
	this.stop = function(){
		console.log(this.idRequestAnimation);
		cancelAnimationFrame( this.idRequestAnimation ); 
	}
	this.drawLine = function(x1, y1, x2,y2,w, c){
		this.context.beginPath();
		this.context.moveTo(this.offSetX +x1, this.offSetY +y1);
		this.context.lineTo(this.offSetX +x2, this.offSetY +y2);
		this.context.lineWidth = w;

		this.context.strokeStyle = c;
		this.context.stroke();
	}
	this.drawRect = function(x, y, w, h, c){
		this.context.fillStyle = c;
		this.context.fillRect(this.offSetX + x, this.offSetY+ y, w, h);
	}
	this.drawCircle = function(x, y, r, c){
		this.context.fillStyle = c;
		this.context.beginPath();
		this.context.arc(x+r/2, y+r/2, r/2, 0, 2 * Math.PI);
		this.context.fill();
	}
	this.drawGUICircle = function(x, y, r, c){
		this.context.fillStyle = c;
		this.context.beginPath();
		this.context.arc(x+r/2, y+r/2, r/2, 0, 2 * Math.PI);
		this.context.fill();
	}
	this.drawText = function(x, y, text, c, font){
		this.context.fillStyle = c | "black";
		this.context.font = font | "20px Arial";
		this.context.fillText(text, this.offSetX + x, this.offSetY + y);
	}

	this.drawSprite = function(img, sx, sy, sw, sh, x, y, w, h, scale, r){
		scale = scale || 1;
		r = r || 0;

		this.context.setTransform(scale,0,0,1,this.offSetX + x + w/2,this.offSetY + y + h/2);
		this.context.rotate(r);
		
		this.context.drawImage(img, sx, sy, sw, sh, -w/2, -h/2, w, h); 

		this.context.setTransform(1, 0, 0, 1, 0, 0);
	}
	this.drawImage = function(img, x, y, w, h, scale, r){
		scale = scale || 1;
		r = r || 0;
		this.context.setTransform(scale,0,0,1,this.offSetX + x + w/2, this.offSetY + y + h/2);
		this.context.rotate(r);
		this.context.drawImage(img, -w/2, -h/2, w, h); 
		
		this.context.setTransform(1, 0, 0, 1, 0, 0);
	}

	this.drawImage2 = function(image, x, y,s,r,a){ 
		var spr = image;
		var w = 200;
		var h = 200;
	    this.context.setTransform(s,0,0,s,x + w/2,y + h/2); // set scale and position
	    this.context.rotate(r);
	    this.context.globalAlpha = a;
	    this.context.drawImage(image,spr.x,spr.y,w,h,-w/2,-h/2,w,h); // render the subimage
	    this.context.setTransform(1, 0, 0, 1, 0, 0);
	}

	this.drawGUICircleImage = function(img, x, y, w, h){
		this.context.save();
		this.context.beginPath();
		this.context.arc(x+w/2, y+h/2, w/2, 0, Math.PI * 2, false);
		this.context.clip();
		this.context.drawImage(img, x, y, w, h);
		this.context.restore();
	}
	this.drawGUIText = function(x, y, text, color, font, align, baseLine){
		this.context.fillStyle = color || "black";
		this.context.font = font || "20px Arial";
		this.context.textAlign = align || "left";
		this.context.textBaseline = baseLine || "top";
		this.context.fillText(text, x, y);
	}
	this.drawGUILabel = function(x, y, w, h, text, color, font, align, baseLine){
		this.drawGUIText( (align=="center" ? x +(w/2) : x), (align=="center" ? y+(h/2) : y), text, color, font, align, baseLine);
	}
	this.drawGUIRect = function(x, y, w, h, c){
		this.context.fillStyle = c;
		this.context.fillRect(x, y, w, h);
	}
	this.drawText = function(x, y, text, color, font){
		this.context.fillStyle = color || "black";
		this.context.font = font || "20px Arial";
		this.context.fillText(text, this.offSetX + x, this.offSetY + y);
	}
	this.drawLabel = function(x, y, w, h, text,color, font, align, baseLine){
		this.context.fillStyle = color || "black";
		this.context.font = font || "20px Arial";
		this.context.textAlign = align || "left";
		this.context.textBaseline = baseLine || "top";
		this.context.fillText(text,  this.offSetX  + (align=="center" ? x +(w/2) : x), this.offSetY +(align=="center" ? y+(h/2) : y));
	}
	this.drawGUIImage = function(img, x, y, w, h){
		this.context.drawImage(img, x, y, w, h);
	}
	this.addClick = function(evt){
		this.clicks.push(this.getMousePos(evt));
	}
	this.checkClick = function(x, y, w, h){
		if(this.clicks != undefined && this.clicks.length>0){
			for(var i = 0; i < this.clicks.length; i++){
				if(x <= this.clicks[i].x && x + w >= this.clicks[i].x && y < this.clicks[i].y && y + h >= this.clicks[i].y){
					return true;
				}
			}
		}
		return false;

	}
	this.Button = function(x, y, w, h, text, tcolor, color, font){
		this.drawGUIRect(x, y, w, h, color);
		this.drawGUIText(x+(w/2),y+(h/2), text, tcolor, font, "center", "middle");
		return game.checkClick(x,y,w,h);
	}
	this.ImageButton = function(x, y, w, h, text, tcolor,img, font){
		this.drawGUIImage(img, x, y, w, h);
		//this.drawGUIText(x+(w/2),y+(h/2), text, tcolor, font, "center", "middle");
		return game.checkClick(x,y,w,h);
	}
	this.Sprite = function(x, y, width, height, image, tilesX , tilesY){
		this.x = x;
		this.y = y;
		this.scale = 1;
		this.rotation = 0;
		this.image = image;
		this.width = width;
		this.height = height;
		this.tilesX = tilesX !== undefined ? tilesX : 1;
		this.tilesY = tilesY !== undefined ? tilesY : 1;
		this.offSetWidth = image.width / this.tilesX;
		this.offSetHeight = image.height / this.tilesY;

		this.animator = null;
		var frameX;
		var frameY;

		this.addAnimation = function(key, frames, rate, loop){
			if(this.animator == null){
				this.animator = new game.Animator(this.tilesX, this.tilesY);
			}

			this.animator.addAnimation(key, new game.Animation(frames, rate, loop));
			if(this.animator.clip==null){
				this.animator.play(key);
			}
		}
		this.draw = function(){
			if(this.x>-100 && this.x>-100 && this.x>-100 &&this.x>-100){

				if(this.animator != null){
					var f = this.animator.animate();
					frameX = f.x;
					frameY = f.y;
				}else{
					frameX = 0;
					frameY = 0; 
				}
				game.drawSprite(this.image, frameX * this.offSetWidth, frameY*this.offSetHeight, this.offSetWidth, this.offSetHeight, this.x, this.y, this.width, this.height, this.scale, Math.angleToRad(this.rotation)); 
			}
		}
	}

	this.Animation = function(frames, rate, loop){
		this.frames = frames;
		this.rate = rate;
		this.loop = loop;
	}

	this.Animator = function(tilesX, tilesY){
		this.tilesX = tilesX;
		this.tilesY = tilesY;
		this.animations = {};
		this.clip = null;
		this.startTime = 0;
		this.isPlaying = false;
		this.isStoped = false;
		this.currentFrame = 0;
		this.frameX = 0;
		this.frameY = 0;

		this.addAnimation = function(key, animation){
			this.animations[key] = animation;
		}

		this.play = function(key){
			if(this.clip != this.animations[key] || (this.clip == this.animations[key] && this.isStoped)){
				this.startTime = getTime();
				this.clip = this.animations[key];
				this.currentFrame = 0;
				this.isPlaying = true;
				this.isStoped = false;
			}
		}

		this.stop = function(animation){
			this.isPlaying = false;
			this.isStoped = true;
			this.currentFrame = 0;
		}

		this.animate = function(){
			if(this.isPlaying && this.clip!= null){
				var currentTime = (getTime() - this.startTime) / 1000;		
				if(currentTime > this.clip.rate){
					this.startTime = getTime();
					this.currentFrame++;
					if(this.currentFrame >= this.clip.frames.length && this.clip.loop){
						this.currentFrame = 0;
					}
					if(this.currentFrame >= this.clip.frames.length && !this.clip.loop){
						this.isPlaying = false;
						this.currentFrame = this.clip.frames.length -1; 
					}
				}
			}
			this.frameX = this.clip.frames[this.currentFrame] % this.tilesX || 0;
			this.frameY = Math.floor(this.clip.frames[this.currentFrame] / this.tilesX) || 0;
			return {x: this.frameX, y: this.frameY};
		}
	}

	this.Image = function(x, y, w, h, s){
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.sprite = s;
		this.scale = 1;

		this.draw = function(){
			if(this.x>-100 && this.x>-100 && this.x>-100 &&this.x>-100){
				game.drawImage(this.sprite, this.x, this.y, this.width, this.height, this.scale);
			}
		}
	}

	this.Rect = function(x,y,w,h, c){
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.color = c;

		this.draw = function(){
			game.drawRect(this.x, this.y, this.width, this.height, this.color);
		}
	}

	///
	this.setCamera = function(x, y){
		this.offSetX = -x;
		this.offSetY = -y;
	}

	//
	var loadCallback;
	var imageSources = {};
	var loadedImages = {};

	var soundContext;
	var soundSources = {};
	var loadedSounds = {};

	var assets = 0;
	var loadedAssets = 0;
	this.getLoading = function(){
		return loadedAssets * 100 / assets;
	}
	this.loadImage = function(key, path){
		imageSources[key] = path;
	}
	this.getImage = function(key){
		return loadedImages[key];
	}
	this.loadSound = function(key, path){
		soundSources[key] = path;
	}

	this.playSound = function(key, volume, loop){
		volume = volume || 1;
		var snd = soundContext.createBufferSource();
		var gainNode = soundContext.createGain();
		snd.buffer = loadedSounds[key];
		snd.connect(gainNode);
		gainNode.gain.value = volume;
		gainNode.connect(soundContext.destination);
		snd.loop = loop | false;
		snd.start(0);
		return snd;
	}
	
	function BufferLoader(context, urlList) {
		this.context = context;
		this.urlList = urlList;
		this.bufferList = new Array();
		this.loadCount = 0;
	}
	function loadBuffer (key, url) {

		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";
		request.onload = function() {
			soundContext.decodeAudioData(
				request.response,
				function(buffer) {
					if (!buffer) {
						alert('error decoding file data: ' + url);
						return;
					}
					loadedSounds[key] = buffer;

					if(++loadedAssets >= assets) {
						loadCallback(loadedImages, loadedSounds);
					} 
					
				},
				function(error) {
					console.error('decodeAudioData error', error);
				}
				);
		};

		request.onerror = function() {
			alert('BufferLoader: XHR error');
		}	

		request.send();
	}
	this.load = function(callback) {
		loadCallback = callback;
		var images = {};
		var loadedImgs = 0;

		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		soundContext = new AudioContext();
		
		for(var src in imageSources) {
			assets++;
		}
		for(var src in soundSources) {
			assets++;
		}
		for(var src in imageSources) {
			loadedImages[src] = new Image();
			loadedImages[src].onload = function() {
				if(++loadedAssets >= assets) {
					loadCallback(loadedImages, loadedSounds);
				}
			};
			loadedImages[src].onerror = function() {
				if(++loadedAssets >= assets) {
					loadCallback(loadedImages, loadedSounds);
				}
				console.log("ERROR AT LOADING IMAGE " + this.src);
			};
			loadedImages[src].src = imageSources[src];
		}

		for(var src in soundSources) {
			loadBuffer(src, soundSources[src]);
		}

		if(assets == 0){
			loadCallback(null, null);
		}
	}

	this.isMobile = function(){
		return navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i)
		|| navigator.userAgent.match(/Opera Mini/i) || navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i)
	}

	this.eventClick = this.isMobile() ? "touchend" : "click";

	var fpsStartTime =0;
	var frameNumber =0;
	this.getFPS = function(){		
		frameNumber++;		
		var d = new Date().getTime(),			
		currentTime = ( d - fpsStartTime ) / 1000,
		result = Math.floor( ( frameNumber / currentTime ) );
		if( currentTime > 1 ){
			fpsStartTime = new Date().getTime();
			frameNumber = 0;
		}		
		return result;
	}	

	function UpdateTime(){
		Time.currentTime = new Date();
		Time.deltaTime = (Time.currentTime.getTime() - Time.oldTime.getTime()) / 1000;
		game.deltaTime = Time.deltaTime;
	}

	function ClearTime(){
		Time.oldTime = Time.currentTime;
	}

	this.resizeCanvas = function(){

		var g = this.canvas;
		var p= g.parentElement;

		var pw = p.offsetWidth;
		var ph = p.offsetHeight;
		console.log(ph + " " + pw);

		var gw = g.offsetWidth;
		var gh = g.offsetHeight;
		var aspect = gw / gh;
		
		if(ph < pw) {
			this.resizedHeight = ph;
			this.resizedWidth = this.resizedHeight * aspect;
		}else {
			this.resizedWidth = pw;
			this.resizedHeight = this.resizedWidth / aspect;
		}
		
		if(g.style.position == "absolute"){
			g.style.top = (Math.abs((ph - this.resizedHeight))/2) + "px";
			g.style.left = (Math.abs((pw - this.resizedWidth))/2) + "px";
		}else{
			g.style.marginTop = (Math.abs((ph - this.resizedHeight))/2) + "px";
			g.style.marginLeft = (Math.abs((pw - this.resizedWidth))/2) + "px";
		}
		g.style.width = this.resizedWidth+"px";
		g.style.height = this.resizedHeight+"px";
	}

	this.setResize = function(){
		window.addEventListener("load", function load(event){
			window.removeEventListener("load", load, false);
			game.resizeCanvas();
		},false);

		window.addEventListener("resize", function res(event){
			game.resizeCanvas();  
		},false);

		game.resizeCanvas();
	}

	this.getMousePos = function(evt) {
		var rect = this.canvas.getBoundingClientRect();
		var mobile = this.isMobile();
		return {
			x: parseInt(((mobile ?evt.touches[0].clientX :evt.clientX) - rect.left) * this.canvas.width / this.resizedWidth),
			y: parseInt(((mobile ?evt.touches[0].clientY :evt.clientY) - rect.top) * this.canvas.height / this.resizedHeight)
		};
	}

	if(config.resize == undefined || config.resize){
		this.setResize();
	}

	this.canvas.addEventListener(this.isMobile() ? 'touchstart' : 'click', function(evt) {
		var mousePos = game.getMousePos(evt);
		game.clicks.push(mousePos);

		if(game.config.click!= undefined){
			game.config.click(mousePos);
		}
	}, false);

	//move
	this.lerp = function(p, n, t) { var _t = Number(t); _t = (Math.max(0, Math.min(1, _t))).fixed(); return (p + _t * (n - p)).fixed(); };
};


function getTime(){
	return (new Date()).getTime();
}
function setResize(el){
	resize(el);
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
};

Math.lerp = function (value1, value2, amount) {
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;
	return value1 + (value2 - value1) * amount;
};

Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };

Math.distance = function(x1, y1, x2,y2){ 
	var a = x1 - x2
	var b = y1 - y2

	return Math.sqrt( a*a + b*b );
}
Math.angleToRad = function(angle){
	return angle * 3.14 / 180;
}
Math.between = function(min,max)
{
	return Math.floor(Math.random()*(max-min+1)+min);
}



///////////////////////////FAST CLICK
;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	 /*jslint browser:true, node:true*/
	 /*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	 function FastClick(layer, options) {
	 	var oldOnClick;

	 	options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		 this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		 this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		 this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		 this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		 this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		 this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		 this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		 this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		 this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		 this.tapTimeout = options.tapTimeout || 700;

		 if (FastClick.notNeeded(layer)) {
		 	return;
		 }

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	 var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	 var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	 var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	 var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	 var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	 FastClick.prototype.needsClick = function(target) {
	 	switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
		if (target.disabled) {
			return true;
		}

		break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
			case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
		return true;
	}

	return (/\bneedsclick\b/).test(target.className);
};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	 FastClick.prototype.needsFocus = function(target) {
	 	switch (target.nodeName.toLowerCase()) {
	 		case 'textarea':
	 		return true;
	 		case 'select':
	 		return !deviceIsAndroid;
	 		case 'input':
	 		switch (target.type) {
	 			case 'button':
	 			case 'checkbox':
	 			case 'file':
	 			case 'image':
	 			case 'radio':
	 			case 'submit':
	 			return false;
	 		}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
			default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	 FastClick.prototype.sendClick = function(targetElement, event) {
	 	var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	 FastClick.prototype.focus = function(targetElement) {
	 	var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	 FastClick.prototype.updateScrollParent = function(targetElement) {
	 	var scrollParent, parentElement;

	 	scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	 FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	 FastClick.prototype.onTouchStart = function(event) {
	 	var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	 FastClick.prototype.touchHasMoved = function(event) {
	 	var touch = event.changedTouches[0], boundary = this.touchBoundary;

	 	if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
	 		return true;
	 	}

	 	return false;
	 };


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	 FastClick.prototype.onTouchMove = function(event) {
	 	if (!this.trackingClick) {
	 		return true;
	 	}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	 FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	 FastClick.prototype.onTouchEnd = function(event) {
	 	var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

	 	if (!this.trackingClick) {
	 		return true;
	 	}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	 FastClick.prototype.onTouchCancel = function() {
	 	this.trackingClick = false;
	 	this.targetElement = null;
	 };


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	 FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	 FastClick.prototype.onClick = function(event) {
	 	var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	 FastClick.prototype.destroy = function() {
	 	var layer = this.layer;

	 	if (deviceIsAndroid) {
	 		layer.removeEventListener('mouseover', this.onMouse, true);
	 		layer.removeEventListener('mousedown', this.onMouse, true);
	 		layer.removeEventListener('mouseup', this.onMouse, true);
	 	}

	 	layer.removeEventListener('click', this.onClick, true);
	 	layer.removeEventListener('touchstart', this.onTouchStart, false);
	 	layer.removeEventListener('touchmove', this.onTouchMove, false);
	 	layer.removeEventListener('touchend', this.onTouchEnd, false);
	 	layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	 };


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	 FastClick.notNeeded = function(layer) {
	 	var metaViewport;
	 	var chromeVersion;
	 	var blackberryVersion;
	 	var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
		} else {
			return true;
		}
	}

	if (deviceIsBlackBerry10) {
		blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	 FastClick.attach = function(layer, options) {
	 	return new FastClick(layer, options);
	 };


	 if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());
