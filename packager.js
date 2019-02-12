"use strict";
fileUtils.loadjs(['lib/jszip.min.js', 'lib/base64.min.js'], true, ()=>{
	let isBase64 = function(dataUrl) {
		let mime = dataUrl.substring(5, dataUrl.indexOf(',', 5));
		let sepPos = mime.indexOf(';');
		return sepPos>0 && mime.substr(sepPos+1)=='base64';
	};
	let urlData = function(data) {
		if(!data.startsWith('data:'))
			return data;
		return data.substring(data.indexOf(',', 5)+1);
	};
	let svg2png = function(svg, width, height) {
		let canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		canvas.getContext('2d').drawImage(svg,0,0,width,height);
		return canvas.toDataURL("image/png");
	};

	_app.packageResources = function(resources, zipName) {
		let zip = new JSZip();
		resources.data.forEach((item, id)=>{
			let fname = fileUtils.baseName(id)+'.'+fileUtils.suffix(item.mime);
			let data;
			if(!item.url)
				data = item.resource;
			else {
				data = urlData(item.url);
				if(isBase64(item.url))
					data = base64js.toByteArray(data);
			}
			zip.file(fname, data);
			if(item.terms) {
				let fname = fileUtils.baseName(id)+'.license.txt';
				zip.file(fname, item.terms);
			}
		});
		zip.generateAsync({type:"blob"}).then((blob)=>{
			saveAs(blob, zipName, blob.type);
		});
	};
	_app.packageApplet = function(title, resources, metadata={}) {
		let numDownloaded=0, numDownloads = 0;
		let zip = new JSZip();
		let filesToBeCached = [ '' ];
		let serviceWorkerContent = '';
		let iconData = [];

		const defaultMeta = {
			author: '',
			color: "#000000",
			descr: '',
			display: "window",
			keywords: '',
			icon: 'icon.svg',
			title: title,
			version: 0
		};
		for(let id in defaultMeta)
			if(!(id in metadata))
				metadata[id] = defaultMeta[id];

		let download = (url, callback)=>{
			++numDownloads;
			let xhr = new XMLHttpRequest();
			xhr.open( 'GET', url, true );
			xhr.onload = (evt)=>{ callback(url, xhr.responseText); };
			xhr.send();
		};
		let finalize = (fname, data)=>{
			if(fname && data) {
				fname = fname.substr(fname.lastIndexOf('/')+1);
				filesToBeCached.push(fname)
				zip.file(fname, data);
			}

			if(++numDownloaded == numDownloads) {
				for(let i=0; i<filesToBeCached.length; ++i)
					filesToBeCached[i] = './'+filesToBeCached[i];
				serviceWorkerContent = serviceWorkerContent.replace(
					new RegExp('\\{filesToBeCached\\}', 'gi'), JSON.stringify(filesToBeCached));
				zip.file('serviceworker.js', serviceWorkerContent);

				zip.generateAsync({type:"blob", compression:'DEFLATE'}).then((blob)=>{
					saveAs(blob, title+".zip", blob.type);
				});
			}
		};

		download('templates/index.html', (url, content)=>{
			for(let id in metadata)
				content = content.replace(new RegExp('\\{'+id+'\\}', 'g'), metadata[id]);
			let doc = (new DOMParser()).parseFromString(content, 'text/html');
			for(let scripts = doc.querySelectorAll('script'), i=0, scr; scr=scripts[i]; ++i)
				if(scr.src)
					download(scr.src, finalize);
			finalize("index.html", content);
		});
		let icon = resources.get(metadata.icon);
		if(icon) {
			const iconSizes = [ 32, 144, 152, 180, 192, 256, 512 ];
			for(let i=0; i<iconSizes.length; ++i) {
				let sz = iconSizes[i];
				let data = svg2png(icon, sz, sz);
				let fname = 'icon'+sz+'.png';
				zip.file(fname, base64js.toByteArray(urlData(data)));
				filesToBeCached.push(fname);
				iconData.push({
					"src": fname,
					"sizes": sz+"x"+sz,
					"type": "image/png"
				});
			}
		}

		download('templates/manifest.json', (fname, content)=>{
			for(let id in metadata)
				content = content.replace(new RegExp('\\{'+id+'\\}', 'g'), metadata[id]);
			content = content.replace(new RegExp('\\{iconData\\}'), JSON.stringify(iconData));
			finalize(fname, content);
		});
		download('templates/serviceworker.js', (fname, content)=>{
			serviceWorkerContent = content.replace(new RegExp('\\{version\\}'), metadata.version);
			finalize();
		});
		download('styles.css', finalize);
	};
});
