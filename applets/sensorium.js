const cellSz = 32;
let sensorium = null;
app.setBackground('black');

function Sensorium(width, height, offsetX, offsetY) {
    this.draw = function(ctx) {
        for(let y=0; y<height; ++y) for(let x=0; x<width; ++x) {
            let value = this.values[x + y*width];
            ctx.fillStyle = value ? '#b60' : '#222';
            ctx.fillRect(offsetX+1+cellSz*x, offsetY+1+cellSz*y, cellSz-2, cellSz-2);
        }
    }
    this.set = function(x,y, value) { this.values[x + y*width] = value; }
    this.get = function(x,y) { return this.values[x + y*width]; }
    this.reset = function(value=0) { this.values.fill(value); }
    this.px2cell = function(pxX, pxY) {
        let x = Math.floor((pxX-offsetX)/cellSz), y = Math.floor((pxY-offsetY)/cellSz);
        return (x<0 || x>=width || y<0 || y>=height) ? null : { x:x, y:y };
    }
    this.values = Array(width*height).fill(0);
}

app.addEventListener('resize', (width, height)=>{
    let szX = Math.floor(width/cellSz), szY = Math.floor(height/cellSz);
    sensorium = new Sensorium(szX, szY, Math.floor((width-szX*cellSz)/2), Math.floor((height-szY*cellSz)/2));
});

app.addEventListener('update', ()=>{
    let ctx = app.getCanvasContext();
    ctx.clearRect(0,0, app.width, app.height);
    sensorium.draw(ctx);
});

let pointers = [];
app.addEventListener('pointer', (type, x, y, id)=>{
    if(type=='start') {
        let pos = sensorium.px2cell(x, y);
        if(pos!==null) {
            sensorium.set(pos.x, pos.y, 1);
            pointers[id] = pos;
        }
    }
    else if(type=='move') {
        let prev = pointers[id];
        if(prev) {
            let pos = sensorium.px2cell(x, y);
            if(pos===null || prev.x != pos.x || prev.y != pos.y)
                sensorium.set(prev.x, prev.y, 0);
            if(pos) {
                sensorium.set(pos.x, pos.y, 1);
                pointers[id] = pos;
            }
            else
                delete pointers[id];
        }
    }
    else if(type=='end') {
        let pos = sensorium.px2cell(x, y);
        if(pos!==null)
            sensorium.set(pos.x, pos.y, 0);
        delete pointers[id];
    }
});
