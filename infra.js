infra = {
	addPointerEventListener: function(target, callback) {
		let self = this;
		let cb = function(e) {
			for(let i=0, events = self.normalizeEvents(e); i<events.length; ++i)
				callback(events[i]);
			return true;
		}

		if(typeof target.style.touchAction != 'undefined')
			target.style.touchAction = 'none';
		target.oncontextmenu = function(e) { return false; }

		this.normalizeEvents.pointerDown=[];
		if(window.PointerEvent)
			target.onpointerdown = target.onpointermove = target.onpointerup = target.onpointerout
				= target.onpointerenter = target.onpointerleave = cb;
		else
			target.ontouchstart = target.ontouchend = target.ontouchmove = cb;
	},
	normalizeEvents: function(e) {
		let pointersDown = this.normalizeEvents.pointerDown;
		let readPointerId = function(pointerId) {
			for(let i=0, end=pointersDown.length; i!=end; ++i)
				if(pointersDown[i]==pointerId)
					return i;
		}
		let writePointerId = function(pointerId) {
 			for(let i=0; ; ++i)
				if(pointersDown[i] === undefined)
					return i;
		}

		let events = [];
		if(window.PointerEvent) { // pointer events
			let id, type = null;
			if(e.type in {'pointerdown':true, 'pointerenter':true}) {
				id = (e.pointerType=='mouse') ? e.button : writePointerId(e.pointerId);
				if(id>=0) {
					type = 'start';
					pointersDown[id] = e.pointerId;
				}
			}
			else if(e.type in {'pointerup':true, 'pointerout':true, 'pointerleave':true}) {
				id = readPointerId(e.pointerId);
				if(id===undefined)
					return false;
				type = 'end';
				delete pointersDown[id];
			}
			else if(e.type=='pointermove') {
				id = readPointerId(e.pointerId);
				if(id!==undefined)
					type = 'move';
				else if(e.pointerType=='mouse') 
					type = 'hover';
			}
			if(type) events.push({ type:type, target:e.target, id:id || 0, pointerType:e.pointerType,
				pageX:e.pageX, pageY:e.pageY,
				clientX:e.clientX,clientY:e.clientY,
				x:e.offsetX,y:e.offsetY });
		}
		else if(e.type in { 'touchstart':true, 'touchmove':true, 'touchend':true, 'touchcancel':true, 'touchleave':true }) {
			e.preventDefault();

			let node = e.target;
			let offsetX = 0, offsetY=0;
			while(node && (typeof node.offsetLeft != 'undefined')) {
				offsetX += node.offsetLeft;
				offsetY += node.offsetTop;
				node = node.offsetParent;
			}
			for(let i=0; i<e.changedTouches.length; ++i) {
				let touch = e.changedTouches[i];
				let id, type = e.type.substr(5);
				if(type=='start') {
					id = writePointerId(touch.identifier);
					pointersDown[id] = touch.identifier;
				}
				else {
					id = readPointerId(touch.identifier);
					if(id===undefined)
						continue;
					if(type=='cancel' || type=='leave')
						type = 'end';
					if(type=='end')
						delete pointersDown[id];
				}
				events.push({ type:type, id:id, pointerType:'touch',
					pageX:touch.pageX, pageY:touch.pageY,
					clientX:touch.clientX,clientY:touch.clientY,
					x: touch.clientX - offsetX, y: touch.clientY - offsetY });
			}
		}
		return events.length ? events : false;
	},
	extendCanvasContext: function(dc) {
		dc.circle = function(x,y,r, style) {
			if(style!==undefined)
				for(let key in style)
					this[key] = style[key];
			this.beginPath();
			this.arc(x,y, r, 0, 2*Math.PI, true);
			this.closePath();
			if(style.fillStyle)
				this.fill();
			if(style.strokeStyle)
				this.stroke();
		}
		dc.strokeLine = function(x1,y1,x2,y2) {
			this.beginPath();
			this.moveTo(x1,y1);
			this.lineTo(x2,y2);
			this.stroke();
		}
		dc.dashLine = function(x1, y1, x2, y2, da = [10,5]) {
			this.save();
			this.setLineDash(da);
			this.strokeLine(x1,y1, x2,y2);
			this.restore();
		}
		dc.hex = function(x,y,r, style) {
			const rx = r/2, ry = Math.sin(Math.PI/3)*r;
			if(style!==undefined) for(let key in style)
				this[key] = style[key];

			this.beginPath();
			this.moveTo(x-rx,y-ry);
			this.lineTo(x-r,y);
			this.lineTo(x-rx,y+ry);
			this.lineTo(x+rx,y+ry);
			this.lineTo(x+r,y);
			this.lineTo(x+rx,y-ry);
			this.closePath();
			if(style.fillStyle)
				this.fill();
			if(style.strokeStyle)
				this.stroke();
		}
		return dc;
	}
};