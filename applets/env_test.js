console.warn('browser/platform');
['userAgent','languages','language','hardwareConcurrency', 'maxTouchPoints'].forEach(key=>{
    console.log(key, '=>', navigator[key]);
});

console.warn('\nlocalStorage');
for(let key in localStorage) {
    let value = localStorage[key];
    if(typeof value == 'string')
        console.log(key,'=>', value.substr(0,80), value.length>=80 ? '...' : '');
}

console.warn('\nsessionStorage');
for(let key in sessionStorage) {
    let value = sessionStorage[key];
    if(typeof value == 'string')
        console.log(key,'=>', value.substr(0,80));
}


console.warn('\ncookies');
let cookies = document.cookie.split(';');
for (let i = 0 ; i<cookies.length; ++i)
    console.log(i,'=>', cookies[i]);

console.warn('\ncaches');
caches.keys().then((keys)=>{
    for(let i=0; i<keys.length; ++i) {
        let cacheName = keys[i];
        caches.open(cacheName).then((cache)=>{
            cache.keys().then(entries=>{
                let urls = [];
                let ownPath = document.URL.substr(0, document.URL.lastIndexOf('/')); 
                entries.forEach((entry)=>{
                    let url = entry.url;
                    if(url.startsWith(ownPath));
                        url = url.substr(ownPath.length+1);
                    urls.push(url);
                });
                console.log(cacheName, '=>', urls);
            });
        });
    }
});
