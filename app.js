'use strict';
window._app = {
	resources: {
		data: new Map(),
		import: function(file, visualize) {
			let isBinary = fileUtils.isBinary(file);
			if(isBinary && file.type.indexOf("audio/")!=0 && file.type.indexOf("image/")!=0)
				return _app.error("invalid resource type "+file.type);

			let reader  = new FileReader();
			reader.addEventListener("load", ()=>{
				isBinary ? this.add(file.name, reader.result, visualize) :
					this.add(file.name, { resource:reader.result, mime:file.type }, visualize);
			}, false);
			if(isBinary)
				reader.readAsDataURL(file);
			else
				reader.readAsText(file);
		},
		add: function(name, data, visualize) {
			this.remove(name);
			let item = ((typeof data=='object')||!data.startsWith('data:')) ?
				data : this.instantiate(name, data);
			if(data.mime=='image/svg+xml' && (typeof item.url != 'string')) {
				item.url = item.resource;
				item.resource = (new DOMParser()).parseFromString(item.url, data.mime);
			}
			if(item) {
				this.data.set(name, item);
				if(visualize)
					this.visualize(name, item);
			}
			return item;
		},
		instantiate(name, dataUrl) {
			let obj = null;
			let mime = this.getMime(dataUrl);
			if(mime.indexOf("audio/")==0)
				obj = new Audio(dataUrl);
			else if(mime.indexOf("image/")==0) {
				obj = new Image();
				obj.src = dataUrl;
			}
			if(obj) {
				obj.title = name;
				obj.className = 'resource';
				return { resource:obj, url:dataUrl, mime:mime };
			}
			return null;
		},
		serialize: function(mimePattern = /.*/, negate=false) {
			let data = {};
			this.data.forEach((item, id)=>{
				if(negate ? !item.mime.match(mimePattern) : item.mime.match(mimePattern))
					data[id] = item.url ? item.url : item;
			});
			return data;
		},
		visualize: function(name, item) {
			let ul = document.querySelector('#resources_list');
			let li = ul.appendChild(document.createElement('li'));
			let left = li.appendChild(document.createElement('div'));
			let center = li.appendChild(document.createElement('div'));
			center.className = 'center';
			let right = li.appendChild(document.createElement('div'));
			let h = center.appendChild(document.createElement('input'));
			li.dataset.name = h.value = name;
			h.addEventListener('change', (evt)=>{ this.rename(name, evt.target.value); });

			let details = center.appendChild(document.createElement('div'));
			let sz = Math.ceil(this.getSize(item.url ? item.url : item.resource)/1024);
			details.innerText = item.mime+', '+sz+'kB';

			if(item.mime.indexOf("image/")==0)
				left.appendChild(item.resource);
			else if(item.mime.indexOf("audio/")==0) {
				let icon = document.querySelector('#musical_note');
				left.appendChild(icon.cloneNode(true)).removeAttribute('id');
				center.appendChild(item.resource).controls = true;
			}

			let btnDelete = right.appendChild(document.createElement('button'));
			btnDelete.innerHTML = document.querySelector('#btn_delete').innerHTML;
			btnDelete.value = name;
			btnDelete.addEventListener('click', (evt)=>{
				if(window.confirm('Delete '+name+'?'))
					this.remove(evt.currentTarget.value);
			});
		},
		empty: function() {
			return this.data.size == 0;
		},
		reset: function(data, visualize) {
			let ul = document.querySelector('#resources_list');
			while (ul && ul.lastChild)
				ul.removeChild(ul.lastChild);

			this.data = new Map();
			if(data) for(let id in data)
				this.add(id, data[id], visualize);
		},
		rename: function(oldName, newName) {
			if(!this.data.has(oldName) || oldName == newName)
				return;
			if(this.data.has(newName))
				return _app.error("resource name " + newName + " is not unique");
			let item = this.data.get(oldName);
			this.remove(oldName);
			this.add(newName, item, true);
		},
		remove: function(name) {
			if(!this.data.has(name))
				return;
			this.data.delete(name);
			let ul = document.querySelector('#resources_list');
			for(let item=ul.firstChild; item!==null; item=item.nextSibling)
				if(item.dataset.name == name)
					return ul.removeChild(item);
		},
		get: function(name) {
			let item = this.data.get(name);
			return item ? item.resource : null;
		},
		getMime(dataUrl) { 
			let mime = dataUrl.substring(5, dataUrl.indexOf(',', 5));
			let sepPos = mime.indexOf(';');
			return sepPos>0 ? mime.substr(0, sepPos)  : mime;
		},
		getSize(dataUrl) {
			return dataUrl.length;
		}
	},
	currentApplet: 'myApp.js',
	currentMeta: null,

	init() { },
	close() { },
	handleError(err) {
		let msg;
		if(err.filename == 'undefined')
			msg = this.currentApplet + ':' + err.lineno + ' ' + err.message;
		else if(err.filename)
			msg = err.filename + ':' + err.lineno + ' ' + err.message;
		else if(err.lineno)
			msg += 'line '+err.lineno + ' ' + err.message;
		this.error(msg);
	},
	resize() {
		let pixelRatio = window.devicePixelRatio || 1;
		let width = window.innerWidth, height = window.innerHeight;

		let orientation = ('orientation' in screen) ? screen.orientation.type : screen.msOrientation;
		if(!orientation && ('orientation' in window)) {
			switch(window.orientation) {
			case 0: orientation = 'portrait-primary'; break;
			case 90: orientation = 'landscape-primary'; break;
			case 180: orientation = 'portrait-secondary'; break;
			case -90: orientation = 'landscape-secondary'; break;
			}
		}

		if(navigator.standalone) { // mobile safari webapp hacks
			if(!('w' in this.resize)) {
				this.resize.w = screen.width;
				this.resize.h = screen.height;
			}
			if(Math.abs(window.orientation)===90) {
				width = Math.max(this.resize.w, this.resize.h);
				height = Math.max(window.innerHeight, Math.min(this.resize.w, this.resize.h)-20);
			}
			else {
				width = Math.min(this.resize.w, this.resize.h);
				height = Math.max(this.resize.w, this.resize.h)-20;
			}
		}
		return { width:width, height:height, orientation:orientation, pixelRatio:pixelRatio};
	},
	setScreen(name) {
		let id = 'screen_'+name;
		if(!document.getElementById(id))
			return false;
		for(let elems = document.querySelectorAll('body > div'), i=0, el; el=elems[i]; ++i)
			el.style.display = (el.id!=id) ? 'none' : (i==0) ? '' : 'block';
		return true;
	},
	error(msg) { this.log(msg,'Crimson'); this.setScreen('output'); },
	log(msg, color) {
		let cons = document.querySelector('#console');
		if(color) {
			let div = cons.appendChild(document.createElement('div'));
			div.style.color = color;
			div.innerText = msg;
		}
		else
			cons.appendChild(document.createElement('div')).innerText = msg;
		cons.scrollTop = cons.scrollHeight;
	}
};

document.addEventListener("DOMContentLoaded", ()=>{
	document.body.addEventListener("touchmove", (evt)=>{ }, {passive: true});
	window.onresize = window.onorientationchange = function() { _app.resize(); }
	window.addEventListener('unload', ()=>{ _app.close(); });
	window.addEventListener('error', (err)=>{ _app.handleError(err); });
	_app.init(window.main);
});
