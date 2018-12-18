app.addEventListener('resize', (width, height, orientation)=>{
    let ctx = app.getCanvasContext();
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(width, height);
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    ctx.fillStyle = 'black';
    ctx.font = '12px sans-serif';
    ctx.fillText('canvas w:'+ctx.canvas.width+' h:'+ctx.canvas.height
        +' viewport w:'+app.width+' h:'+app.height, 36,12);
    ctx.fillText('screen w:'+screen.width+' h:'+screen.height
        +' inner w:'+window.innerWidth+' h:'+window.innerHeight
        +' orientation:'+orientation, 36,24);
});

app.addEventListener('pointer', (type, x, y, id, device)=>{
    let ctx = app.getCanvasContext();
    switch(type) {
    case 'start':
        ctx.fillStyle = 'rgba(0,127,0,0.75)'; break;
    case 'move':
        ctx.fillStyle = 'rgba(255,127,0,0.5)'; break;
    case 'end':
        ctx.fillStyle = 'rgba(255,0,127,0.5)'; break;
    default:
        return;
    }
    ctx.fillRect(x-5, y-5, 10,10);

    ctx.fillStyle = 'white';
    ctx.fillRect(20,24, 300,14);
    ctx.fillStyle = 'black';
    ctx.fillText('evt:'+type+' at '+Math.round(x)+','+Math.round(y)
        +' id:'+id+' device:'+device, 36,36);
});
