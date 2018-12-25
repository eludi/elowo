"use strict";
_app = (function(parent) {
let ide = Object.create(parent);
ide.applets = {};
ide.tStart = null;
ide.installEvt = null;
ide.installationRejected = false;

ide.editor = {
	currentIndent: '',
	textarea: null,

	replaceSmartPunctuation: function(str) {
		const convMap = {
			// Open-quotes: http://www.fileformat.info/info/unicode/category/Pi/list.htm
			0x2018:'\'', 0x201B:'\'', 0x201C:'"', 0x201F:'"', "‚": "'", "„": '"',
			// Close-quotes: http://www.fileformat.info/info/unicode/category/Pf/list.htm
			0x2019:'\'', 0x201D:'\"', "‘": "'", "“": '"',
			// Primes: http://www.fileformat.info/info/unicode/category/Po/list.htm
			0x2032:'\'', 0x2033:'"', 0x2035:'\'', 0x2036:'"', 0x2014:'-', // iOS 11 also replaces dashes with em-dash
			0x2013:'-' // and "--" with en-dash
		};
		for(const key in convMap)
			str = str.replace(new RegExp(key, 'g'), convMap[key]);
		return str;
	},
	getContent: function() {
		return this.replaceSmartPunctuation(this.textarea.value);
	},
	reset: function(name, content='') {
		document.querySelector('#editor_title').value = name;
		this.textarea.value = content;
		document.querySelector('#editor_sidebar').className = 'closed';
	},
	getCursorPos: function(textarea) {
		let lines = textarea.value.substr(0, textarea.selectionStart).split("\n");
		let pos = { x:lines[lines.length-1].length+1, y:lines.length };
		let currLine = lines[pos.y-1];
		if(!currLine && pos.y>1)
			currLine = lines[pos.y-2];
		this.currentIndent = currLine.substr(0, currLine.search(/\S/));
		return pos;
	},
	getState() {
		return { selectionStart:this.textarea.selectionStart, scrollTop:this.textarea.scrollTop };
	},
	setState(state) {
		this.textarea.selectionStart = state.selectionStart;
		this.textarea.selectionEnd = state.selectionStart;
		this.textarea.scrollTop = state.scrollTop;
	},
	insertAtCursor: function(input, textToInsert) {
		const isSuccess = document.execCommand("insertText", false, textToInsert);
		// Firefox (non-standard method)
		if (!isSuccess && typeof input.setRangeText === "function") {
			const start = input.selectionStart;
			input.setRangeText(textToInsert);
			// update cursor to be at the end of insertion
			input.selectionStart = input.selectionEnd = start + textToInsert.length;
		}
	},
	handleEnterEvent: function() {
		if(this.currentIndent)
			setTimeout(()=>{
				this.insertAtCursor(this.textarea, this.currentIndent);
			}, infra.isIOS() ? 10 : 0);
	},

	init: function(title) {
		for(let elems = document.querySelectorAll('button'), i=0, el; el=elems[i]; ++i)
			if(el.value)
				el.addEventListener('click', (evt)=>{
					ide.handleUIEvent(evt.currentTarget.value.split(/\s+/)); });

		document.querySelector('#loadFS').addEventListener('change', function(e) {
			for(let i=0; i<this.files.length; ++i) {
				let file = this.files[i];
				let reader = new FileReader();
				reader.addEventListener("load", function(e) { ide.importApplet(file, this.result); });
				reader.readAsText(file);
			}
		});
		document.querySelector('#importRes').addEventListener('change', function(e) {
			for(let i=0; i<this.files.length; ++i)
				ide.resources.import(this.files[i], true);
		});

		let editorTitle = document.querySelector('#editor_title');
		editorTitle.value = title;
		editorTitle.addEventListener('change', function(e) { ide.renameApplet(this.value); });

		this.textarea = document.querySelector('#editor');
		[ 'input', 'keydown', 'keyup', 'click', 'focus' ].forEach((evtName)=>{
			this.textarea.addEventListener(evtName, (e)=>{
				let pos = this.getCursorPos(this.textarea);
				document.querySelector('#editor_pos').innerHTML = 'Ln&nbsp;'+pos.y+'<br/>Col&nbsp;'+pos.x;
			});
		});
		this.textarea.addEventListener('keypress', (evt)=>{
			if(evt.key=='Enter')
				this.handleEnterEvent();
		});
	}
};

ide.init = function() {
	if ('serviceWorker' in navigator && location.protocol != 'file:') {
		navigator.serviceWorker.register('serviceworker.js', {scope:'./'}).then(() =>{
			console.log('service worker installed');
		}).catch(err => console.error('Error', err));
		window.addEventListener('beforeinstallprompt', evt => {
			if(this.installEvt === null)
				this.installEvt = evt;
			evt.preventDefault();
		});
	}
	this.editor.init(this.currentApplet);
	this.applets_init();
	this.metaInit();
	this.tStart = new Date();

	window.addEventListener("hashchange", (evt)=>{ this.autoRun(evt.newURL); }, false);
	if(location.hash)
		this.autoRun();
};

ide.autoRun = function(url = location.hash) {
	let hashPos = url.indexOf('#');
	if(hashPos==-1 || hashPos+1 >= url.length)
		return;

	url = url.substr(hashPos+1);
	location.hash = '';
	if(url in this.applets)
		return this.run(this.openApplet(url));

	let callback = (main)=>{
		document.cookie = '';
		localStorage.clear();
		this.run(main);
	};
	let isSandbox = (location.hostname === 'sandbox.eludi.net');
	this.downloadApplet(url, isSandbox ? callback : null);
};
ide.run = async function(main = ide.storeCurrentApplet()) {
	await this.cacheApplet(main);
	setTimeout(()=>{ location.href = 'run.html'; }, 20);
};
ide.close = function() {
	this.storeCurrentApplet();
};

// applets manager:
ide.applets_init = function() {
	if(typeof localStorage !== 'undefined') {
		let data = localStorage.getItem('elowo_applets');
		if(data!==null) {
			try {
				data = JSON.parse(data);
			}
			catch(err) {
				console.error(err);
			}
		}
		if(typeof data === 'object')
			this.restoreApplets(data);

		let state = localStorage.getItem('elowo_state');
		if(state!==null) {
			try {
				state = JSON.parse(state);
			}
			catch(err) {
				console.error(err);
			}
			if(typeof state==='object') {
				this.openApplet(state.currentApplet);
				if('editor' in state)
					this.editor.setState(state.editor);
				if(state.installationRejected)
					this.installationRejected = true;
			}
		}
	}
};
ide.restoreApplets = function(data) {
	this.applets = {};
	for(let id in data) {
		let item = data[id];
		switch(typeof item) {
		case 'string':
			this.applets[id] = { main:item, resources:null, meta:null };
			break;
		case 'object':
			this.applets[id] = item;
		}
	}
};
ide.storeCurrentApplet = function() {
	const main = this.editor.getContent();
	let data = { main:main };
	if(!this.metaEmpty())
		data.meta = this.currentMeta;
	if(!this.resources.empty())
		data.resources = this.resources.serialize();
	if(main || !this.resources.empty() || data.meta)
		this.applets[this.currentApplet] = data;
	else
		delete this.applets[this.currentApplet];

	try {
		if(typeof localStorage !== 'undefined') {
			localStorage.setItem('elowo_applets', JSON.stringify(this.applets));
			let state = {
				currentApplet:this.currentApplet,
				editor: this.editor.getState()
			};
			if(this.installationRejected)
				state.installationRejected = true;
			localStorage.setItem('elowo_state', JSON.stringify(state));
		}
	} catch (err) { this.error(err); }
	return main;
};
ide.cacheApplet = async function(main) {
	let addCacheEntry = async function(url, content) {
		let cache = await caches.open('app');
		await cache.put(url, new Response(content, {
			headers:{
				'Content-Type': fileUtils.fileType(url),
				'Content-Length': content.length,
				'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate',
				'Pragma':'no-cache'
			}
		}));
	}

	let cacheMain = addCacheEntry('main.js', 'async function main(app, console) { '+main+'\n}\n');
	let cmd = '_app.currentApplet = '+JSON.stringify(fileUtils.baseName(this.currentApplet))+';\n';
	cmd += '_app.resources.reset('+JSON.stringify(this.resources.serialize())+');\n\n';
	let cacheData = addCacheEntry('data.js', cmd);
	return [ await cacheMain, await cacheData ]; 
}
ide.newApplet = function() {
	let newAppletName = (prefix)=>{
		let name = prefix;
		let counter = 0;
		while(name in this.applets)
			name = prefix + (++counter);
		return name;
	}
	this.storeCurrentApplet();
	this.currentApplet = newAppletName('myApp');
	this.resources.reset();
	this.editor.reset(this.currentApplet);
	this.metaReset();
	return '';
};
ide.openApplet = function(name, data) {
	if(!name)
		return this.newApplet();

	data = data || this.applets[name];
	if(!data)
		return this.error('applet '+name+' does not exist');

	this.applets[name] = data;
	this.currentApplet = name;

	this.resources.reset(data.resources, true);
	this.editor.reset(name, data.main);
	this.metaReset(data.meta);
	return data.main;
};
ide.importApplet = function(file, data) {
	if(fileUtils.fileType(file) !== 'application/json')
		data = { main:data, resources:null };
	else try {
		data = JSON.parse(data);
	}
	catch(err) {
		return console.error(err);
	}
	return this.openApplet(fileUtils.baseName(file.name), data);
};
ide.exportApplet = function() {
	let applet = this.applets[this.currentApplet];
	let main = applet.main = this.editor.getContent();
	let name = fileUtils.baseName(this.currentApplet);
	if(this.resources.empty() && this.metaEmpty())
		fileUtils.saveText(main, name+'.js', 'application/javascript');
	else
		fileUtils.saveText(JSON.stringify(applet), name+'.json', 'application/json');
};
ide.compileApplet = async function() {
	this.metaIncVersion();
	await this.cacheApplet(this.storeCurrentApplet());
	this.packageApplet(fileUtils.baseName(this.currentApplet), this.resources, this.currentMeta);
}
ide.renameApplet = function(name) {
	delete this.applets[this.currentApplet];
	this.currentApplet = name;
	this.storeCurrentApplet();
};
ide.removeApplet = function(name) {
	delete this.applets[name];
	let ul = document.querySelector('#files_list');
	for(let item=ul.firstChild; item!==null; item=item.nextSibling)
		if(item.dataset.name == name) {
			ul.removeChild(item);
			break;
		}

	if(this.currentApplet == name)
		return this.newApplet();
	this.storeCurrentApplet();
};
ide.downloadApplet = function(url, callback) {
	if(url.startsWith('https://www.dropbox.com')) // convenience
		url = 'https://dl.dropbox.com' + url.substr(url.indexOf('/', 9));

	let file = null;
	fetch(url, { mode:'cors' }).then((resp)=>{
		if(!resp.ok)
			return this.error('Download '+url+' failed: '+resp.statusText);
		let fname = url.substr(url.lastIndexOf('/')+1);
		fname = decodeURIComponent((fname+'').replace(/\+/g, '%20'));
		file = {
			name:fname,
			type:resp.headers.get("content-type")
		};
		return resp.text();
	}).then((data)=>{
		let main = this.importApplet(file, data);
		if(callback)
			callback(main);
	});
};
ide.visualizeApplets = function(data) {
	let ul = document.querySelector('#files_list');
	while (ul.lastChild)
		ul.removeChild(ul.lastChild);

	for(let name in data) {
		let li = ul.appendChild(document.createElement('li'));
		let center = li.appendChild(document.createElement('div'));
		center.className = 'center';
		let right = li.appendChild(document.createElement('div'));

		let btnDelete = right.appendChild(document.createElement('button'));
		btnDelete.innerHTML = document.querySelector('#btn_delete').innerHTML;
		btnDelete.addEventListener('click', (evt)=>{
			if(window.confirm('Delete '+name+'?'))
				this.removeApplet(evt.currentTarget.value);
		});

		let h = center.appendChild(document.createElement('h3'));
		btnDelete.value = li.dataset.name = h.innerText = name;
		
		let content = data[name].main;
		let preview = center.appendChild(document.createElement('code'));
		preview.innerText = content.substr(0, content.indexOf('\n', 0));

		li.addEventListener('click', (evt)=>{
			let name = evt.currentTarget.dataset.name;
			this.storeCurrentApplet();
			this.openApplet(name);
			this.setScreen('editor');
		});
	}
}

ide.metaInit = function() {
	let elems = document.querySelectorAll('#meta_middle > input, #meta_middle > select');
	for(let i=0, el; el=elems[i]; ++i) {
		el.addEventListener('change', (evt)=>{
			let id = evt.currentTarget.id.substr(5);
			this.currentMeta[id] = evt.currentTarget.value;
		});
	}
}
ide.metaReset = function(data) {
	this.currentMeta = data = data || { version:0 };
	let parent = document.getElementById('meta_middle');
	for(let item=parent.firstChild; item!==null; item=item.nextSibling) {
		if(item.id.startsWith('meta_')) {
			let key = item.id.substr(5);
			item.value = (key in data) ? data[key] : '';
		}
	}
}
ide.metaIncVersion = function() {
	this.currentMeta.version = this.currentMeta.version ? this.currentMeta.version+1 : 1;
}
ide.metaEmpty = function() {
	for(let id in this.currentMeta) {
		if(id=='version' && !this.currentMeta.version)
			continue;
		return false;
	}
	return true;
}

ide.handleUIEvent = function(args) {
	if(args[0]=='screen')
		this.setScreen(args[1]);
	else if(args[0]=='run')
		this.run();
	else if(args[0]=='new')
		this.newApplet();
	else if(args[0]=='open') {
		this.visualizeApplets(this.applets);
		this.setScreen("files")
	}
	else if(args[0]=='saveFS')
		this.exportApplet();
	else if(args[0]=='compile')
		this.compileApplet();
	else if(args[0]=='exportRes')
		this.packageResources(this.resources, fileUtils.baseName(this.currentApplet)+'.resources.zip');
	else if(args[0]=='toggleMenu') {
		let el = document.querySelector('#editor_sidebar');
		el.className = (el.className=='closed') ? 'open' : 'closed';
	}
	else if(args[0]=='doc')
		location.href = 'doc.html#' + (args[1] ? args[1] : '');
	else if(args[0]=='toggleConsole') {
		let el = document.querySelector('#console');
		el.className = (el.className=='console_big') ? 'console_small' : 'console_big';
		document.getElementById('btn_toggleConsole').style.transform =
			(el.className=='console_big') ? 'scaleY(-1)' : 'scaleY(1)';
	}
	else
		this.log('"'+args.join(' ')+'" not yet implemented');

	if(this.installEvt && (new Date())-this.tStart > 30000 && !this.installationRejected && args[0]!='run') {
		this.installEvt.prompt();
		this.installEvt.userChoice.then((choiceResult)=>{
			if (choiceResult.outcome !== 'accepted')
				this.installationRejected = true;
		});
		delete this.installEvt;
	}
};
return ide;
})(_app);
