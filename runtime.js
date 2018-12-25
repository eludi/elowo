"use strict";
_app = (function(parent) {
	let rte = Object.create(parent);
	rte.console = Object.create(window.console);
	rte.screen = 'output';
	rte.now = 0.0;
	rte.eventListeners = {};
	rte.state = 'init';
	rte.vp = {};

	rte.init = function(main) {
		this.console.col = 'rgba(0,0,0,0.75)';
		this.console.color = function(col) {
			this.col = col;
			return this;
		};
		this.console.background = function(bg) { document.querySelector('#console').style.background = bg; return this; };
		this.console.out = function(...args) {
			parent.log(args.join(' '), this.col);
			return this;
		};
		this.console.log = function(...args) {
			window.console.log(...args);
			return this.out(...args);
		};
		this.console.warn = function(...args) {
			window.console.warn(...args);
			parent.log(args.join(' '), 'DarkOrange');
			return this;
		};
		this.console.error = function(...args) {
			window.console.error(...args);
			parent.error(args.join(' '));
			return this;
		};
		this.console.clear = function() { document.querySelector('#console').innerHTML = ''; return this; };
		this.console.hide = function() { document.querySelector('#console').style.display = 'none'; return this; };
		this.console.show = function() { document.querySelector('#console').style.display = ''; return this; };
		this.console.position = function() {
			let cons = document.querySelector('#console');
			cons.style.top = cons.style.bottom = cons.style.left = cons.style.right = 'auto';
			for(let i=0; i<arguments.length; ++i)
				cons.style[arguments[i]] = 0;
			return this;
		};
		this.console.width = function(w) { document.querySelector('#console').style.width = w; return this; }
		this.console.height = function(h) {
			if(typeof h === 'number') {
				const lineHeight = infra.isIOS() ? 1.1 : 1.2;
				h = (h*lineHeight)+'em';
			}
			document.querySelector('#console').style.height = h;
			return this;
		}
		this.console.layer = function(layer) { document.querySelector('#console').style.zIndex = layer; return this; }
		this.console.in = function(prompt, value) {
			let cons = document.querySelector('#console');
			if(prompt !== undefined) {
				let span = cons.appendChild(document.createElement('span'));
				span.innerText = prompt;
				span.style.color = this.col;
				cons.appendChild(document.createTextNode(' '));
			}
			return new Promise((resolve, reject)=>{
				let inp = cons.appendChild(document.createElement('input'));
				let ovl = document.querySelector('#overlay');
				let focusIOS = ()=>{ inp.focus(); }

				if(prompt===undefined && value===undefined)
					inp.placeholder = '>';
				else if(value!==undefined)
					inp.value = value;
				inp.style.color = this.col;
				inp.focus();
				inp.addEventListener('keydown', function(evt) {
					if(evt.key==='Enter') {
						resolve(this.value);
						this.disabled = true;
						this.blur();
						if(infra.isIOS())
							ovl.removeEventListener('touchstart', focusIOS);
					}
				});
				inp.addEventListener('blur', function(evt) {
					if(!this.disabled)
						this.focus();
				});
				if(infra.isIOS())
					ovl.addEventListener('touchstart', focusIOS);
			});
		}
	
		infra.addPointerEventListener(document.querySelector('#overlay'),
			(evt)=>{ this.emit('pointer', evt.type, evt.x, evt.y, evt.id, evt.pointerType); });
		document.getElementById('btn_close').addEventListener('click', ()=>{ this.close(); history.back(); });

		if(typeof main=='function')
			this.run(main);
	};
	rte.run = function(main) {
		let app = Object.create(this.vp);
		app.getCanvasContext = (layer, type)=>{ return this.getCanvasContext(layer, type); };
		app.setBackground = (bg)=>{ document.body.style.background = bg; };
		app.addEventListener = (event, callback)=>{ this.addEventListener(event, callback); };
		app.getResource = (id)=>{ return this.resources.get(id); };
		app.getLayer = (layer)=>{ return document.getElementById(this.screen+'_layer_'+layer); };
		app.addCanvasLayer = (layer)=>{ return this.addCanvasLayer(layer); };
		app.addHTMLLayer = (layer, innerHTML='')=>{ return this.addHTMLLayer(layer, innerHTML); };
		app.showLayer = (layer)=>{ document.getElementById(this.screen+'_layer_'+layer).style.display = ''; };
		app.hideLayer = (layer)=>{ document.getElementById(this.screen+'_layer_'+layer).style.display = 'none'; };
		app.setScreen = (name)=>{
			if(this.setScreen(name)) { this.screen = name; return true; } return false; };
		app.addScreen = (name)=>{ return this.addScreen(name); };

		this.console.clear();
		document.title = fileUtils.baseName(this.currentApplet);
		this.resize();
		this.state = 'running';
		this.now = new Date();

		try {
			if(typeof main === 'string')
				main = new AsyncFunction('app', 'console', main);
			main(app, this.console);
			this.emit('resize', this.vp.width, this.vp.height, this.vp.orientation);
			if('update' in this.eventListeners)
				requestAnimationFrame(()=>{ this.update(); });
		}
		catch (err) {
			this.state = 'error';
			window.console.error(err);
			let msg = err.name;
			if('lineNumber' in err)
				msg += ' at line '+ (err.lineNumber - 2);
			this.error(msg+': '+err.message);
		}
	};
	rte.update = function() {
		let now = new Date();
		let deltaT = now - this.now;
		this.now = now;
		this.emit('update', deltaT, now);
		if(this.state == 'running')
			requestAnimationFrame(()=>{ this.update(); });
	};
	rte.getCanvasContext = function(layer=0, type='2d') {
		let id = this.screen+'_layer_'+layer;
		let canvas = document.getElementById(id);
		return (canvas && ('getContext' in canvas)) ? canvas.getContext(type) : null;
	};
	rte.addCanvasLayer = function(layer) {
		let id = this.screen+'_layer_'+layer;
		if(document.getElementById(id))
			return this.error('layer '+id+' already exists.');
		let node = document.getElementById('screen_'+this.screen).appendChild(document.createElement('canvas'));
		node.id = id;
		node.style.zIndex = layer;
		this.resizeCanvas(node, this.vp);
		return node;
	};
	rte.addHTMLLayer = function(layer, innerHTML) {
		let id = this.screen+'_layer_'+layer;
		if(document.getElementById(id))
			return this.error('layer '+id+' already exists.');
		let node = document.getElementById('screen_'+this.screen).appendChild(document.createElement('div'));
		node.id = id;
		node.style.zIndex = layer;
		node.innerHTML = innerHTML;
		return node;
	};
	rte.addScreen = function(name) {
		let id = 'screen_'+name;
		if(document.getElementById(id))
			return this.error('screen '+name+' already exists.');
		let screen = document.body.appendChild(document.createElement('div'));
		screen.className = 'screen';
		screen.id = id;
		this.screen = name;
		this.setScreen(name);
	};
	rte.emit = function(event, ...args) {
		if(event in this.eventListeners)
			this.eventListeners[event].forEach((callback)=>{ callback(...args); });
		if('*' in this.eventListeners)
			this.eventListeners['*'].forEach((callback)=>{ callback(event, ...args); });
	};
	rte.addEventListener = function(event, callback) {
		if(!(event in this.eventListeners))
			this.eventListeners[event] = [];
		this.eventListeners[event].push(callback);
	};
	rte.resizeCanvas = function(canvas, vp) {
		canvas.width = vp.width * vp.pixelRatio;
		canvas.height = vp.height * vp.pixelRatio;
		canvas.getContext('2d').setTransform(vp.pixelRatio, 0, 0, vp.pixelRatio, 0, 0);
	};
	rte.close = function() {
		if(this.state == 'running')
			this.emit('close');
		this.state = 'over';
	}
	rte.resize = function() {
		let vp = parent.resize();
		for(let id in vp)
			this.vp[id] = vp[id];
		let layers = document.querySelectorAll('.screen > canvas');
		for(let i=0, canvas; canvas=layers[i]; ++i)
			this.resizeCanvas(canvas, vp);
		this.emit('resize', vp.width, vp.height, vp.orientation);
	}
	return rte;
})(_app);
