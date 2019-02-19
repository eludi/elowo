"use strict";
fileUtils.loadjs(['lib/sjcl.min.js'], true, ()=>{

	_app.DataTransfer = function(baseUrl = location.origin+'/dt/') {

		const sha256hex = function(data) {
			let bitArray = sjcl.hash.sha256.hash(data);  
			return sjcl.codec.hex.fromBits(bitArray);   
		}

		const makeid = function(len=6, prefix='') {
			const charset = "ABCDEFGHKLMNPQRSTUVWXYZ123456789";
			const charsetLen = charset.length;
			let id = (typeof prefix === 'string') ? prefix : '';
			for(let i = id.length; i < len; ++i)
				id += charset.charAt(Math.floor(Math.random() * charsetLen));	
			return id;
		}

		this.put = function(data) {
			let key = makeid();
			const encryptedData = sjcl.encrypt(key, data);

			return new Promise((resolve, reject)=>{
				fetch(baseUrl+sha256hex(key), {
					method:'POST',
					headers: {"Content-Type": "application/x-www-form-urlencoded" },
					body:"data="+encodeURIComponent(encryptedData)
				}).then((resp)=>{
					if(resp.status == 409) // name clash, try again
						return this.put(data);
					if(!resp.ok)
						reject(Error(resp.statusText));
					else
						resolve(key);
				});
			});
		}

		this.get = function(key) {
			return new Promise((resolve, reject)=>{
				fetch(baseUrl+sha256hex(key)).then((resp)=>{
					if(!resp.ok)
						return reject(Error(resp.statusText));
					return resp.text();
				}).then((data)=>{
					if(!data)
						return reject(Error("no data received"));
					resolve(sjcl.decrypt(key, data));
				});
			});
		}
	}
});
