const version = {version};
const cacheWhitelist = ['static_'+version];

this.addEventListener('install', (event)=>{
	console.log('cache version '+version+' installing...');
	this.skipWaiting();
	event.waitUntil(caches.open('static_'+version).then((cache)=>{
		return cache.addAll({filesToBeCached});
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
		caches.match(event.request).then((response)=>{
			if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin')
				return;
			return response || fetch(event.request);
		})
	);
});
