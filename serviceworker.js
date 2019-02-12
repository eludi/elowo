const version = '040';
const cacheWhitelist = ['static_'+version, 'app'];

this.addEventListener('install', (event)=>{
	console.log('cache version '+version+' installing...');
	this.skipWaiting();
	event.waitUntil(caches.open('static_'+version).then((cache)=>{
		return cache.addAll([
			'./lib/jszip.min.js',
			'./lib/base64.min.js',
			'./lib/FileSaver.min.js',
			'./lib/marked.min.js',
			'./templates/index.html',
			'./templates/manifest.json',
			'./templates/serviceworker.js',
			'./applets/test_console.js',
			'./applets/test_canvas.js',
			'./applets/test_resources.json',
			'./applets/layers_test.json',
			'./applets/pocket%20piano.js',
			'./applets/zoom_test.js',
			'./applets/env_test.js',
			//'./doc.html',
			'./doc/api.md',
			'./doc/create.svg',
			'./doc/edit.svg',
			'./doc/export.svg',
			'./doc/happy_devices.svg',
			'./doc/faq.md',
			'./doc/import.svg',
			'./doc/legal.md',
			'./doc/legal.svg',
			'./doc/license.md',
			'./doc/privacy.md',
			'./doc/publishing.md',
			'./doc/resources.md',
			'./doc/resources.svg',
			'./doc/story.md',
			'./icon32.png',
			'./icon144.png',
			'./icon152.png',
			'./icon180.png',
			'./icon192.png',
			'./icon256.png',
			'./icon512.png'/*,
			'./',
			'./app.js',
			'./fileUtils.js',
			'./ide.js',
			'./index.html',
			'./infra.js',
			'./manifest.json',
			'./packager.js',
			'./run.html',
			'./runtime.js'*/
		]);
	}));
});

this.addEventListener('activate', (event)=>{
	event.waitUntil(
		this.clients.claim().then(()=>{
		caches.keys().then((cacheNames)=>{
			return Promise.all(cacheNames.map((name)=>{
				if (cacheWhitelist.indexOf(name) === -1)
					return caches.delete(name);
			}));
		}).then(()=>{
			console.log('cache version '+version+' ready to handle fetches.');
		})
	}));
});

this.addEventListener('fetch', (event)=>{
	event.respondWith(
		caches.match(event.request).then((response)=>{ // cache falling back to network
			if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin')
				return;
			return response || fetch(event.request);
		})
		/*
		fetch(event.request).catch(()=>{ // network falling back to cache
			return caches.match(event.request);
		})
		*/
	);
});

this.addEventListener('message', (event)=>{
	if(event.data)
		event = JSON.parse(event.data);
	console.log("serviceworker received client message:", event);
});
