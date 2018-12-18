const speed = 0.005;

app.setBackground('rgb(47,47,47)');
let ctx = app.getCanvasContext();

let rnd = function(n) { return Math.floor(Math.random()*n); }

let Rect = function() {
    let color, x1,y1, x2,y2, z;
    this.init = function() {
        color = 'rgba('+rnd(256)+','+rnd(256)+','+rnd(256)+','+Math.random()+')';
        let x_1 = rnd(app.width), y_1 = rnd(app.height);
        let x_2 = rnd(app.width), y_2 = rnd(app.height);
        x1 = Math.min(x_1, x_2);
        x2 = Math.max(x_1, x_2);
        y1 = Math.min(y_1, y_2);
        y2 = Math.max(y_1, y_2);
        z = 1+Math.random()*4;
    }
    this.update = function(deltaT, speed, cx, cy) {
        let f = (1+deltaT)*speed;
        x1 += (x1-cx)*f;
        y1 += (y1-cy)*f;
        x2 += (x2-cx)*f;
        y2 += (y2-cy)*f;
        z -= deltaT * speed;
        if(z<0)
            this.init();
        return this;
    }
    this.draw = rnd(2) ? function(ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(x1,y1,x2-x1,y2-y1);
    } : function(ctx) {
        ctx.strokeStyle = color;
        ctx.strokeRect(x1+.5,y1+.5,x2-x1,y2-y1);
    };
    this.init();
}

let rects = [];
for(let i=0; i<50; ++i)
    rects.push(new Rect());

app.addEventListener('update', (deltaT)=>{
    ctx.clearRect(0,0,app.width,app.height);
    rects.forEach((rect)=>{ rect.update(deltaT, speed, app.width/2, app.height/2).draw(ctx); });
});