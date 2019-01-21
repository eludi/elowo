fileUtils = {
	saveText(data, filename, mime = 'text/plain') {
		if('msSaveBlob' in navigator) {
			if(!(data instanceof Blob))
				data = new Blob([data], {type:mime})
			return navigator.msSaveBlob(data, filename);
		}
		let pom = document.createElement('a');
		pom.setAttribute('href', 'data:'+mime+';charset=utf-8,' + encodeURIComponent(data));
		pom.setAttribute('download', filename);

		if (document.createEvent) {
			let event = document.createEvent('MouseEvents');
			event.initEvent('click', true, true);
			pom.dispatchEvent(event);
		}
		else
			pom.click();
	},
	loadjs(urls, async, callback) {
		if(!Array.isArray(urls))
			urls = [ urls ];
		let numLoaded = 0;
		for(let i=0; i<urls.length; ++i) {
			let node=document.createElement('script');
			node.setAttribute("type","text/javascript");
			node.setAttribute("src", urls[i]);
			if(async)
				node.setAttribute('async','async');
			if(callback)
				node.addEventListener("load", ()=>{ if(++numLoaded==urls.length) callback(); }, false);
			document.getElementsByTagName("head")[0].appendChild(node);
		}
	},
	fileType(file) {
		if(typeof file == 'string')
			file = { name:file };
		if(file.type) {
			if(file.type.indexOf(';')>=0)
				return file.type.substring(0, file.type.indexOf(';'));
			return file.type;
		}
		let suffix = file.name.substr(file.name.lastIndexOf('.')+1).toLowerCase();
		switch(suffix) {
		case 'json':
			return 'application/json';
		case 'js':
			return 'application/javascript';
		case 'txt':
			return 'text/plain';
		case 'html':
			return 'text/html';
		case 'woff':
			return 'font/woff';
		case 'woff2':
			return 'font/woff2';
		}
		console.warn('unknown file type', suffix);
	},
	suffix(mime) {
		switch(mime) {
		case 'application/javascript':
			return 'js';
		case 'text/plain':
			return 'txt';
		case 'image/svg+xml':
			return 'svg';
		default:
			return mime.substr(mime.indexOf('/')+1);
		}
	},
	isBinary(file) {
		let type = this.fileType(file);
		if(typeof type != 'string')
			return true;
		return (type.startsWith('text/') || type.endsWith('/json') || type.endsWith('javascript')) ?
			false : true;
	},
	baseName(name) {
		let suffixStart = name.lastIndexOf('.');
		return (suffixStart<0) ? name : name.substring(0, suffixStart);
	}
};