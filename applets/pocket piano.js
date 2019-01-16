function Polyphonium(oscillator='triangle') {
    const numVoicesMax = 10;
    let ctx = null;
    this.voices = Array(10).fill(null);
    function init() {
        if(ctx===null)
            ctx = new(window.AudioContext || window.webkitAudioContext);
    }
    this.getFreeVoice = function() {
        for(let i=0; i<numVoicesMax; ++i)
            if(this.voices[i]===null)
                return i;
        return -1;
    }
    this.start = function(freq) {
        init();
        let id = this.getFreeVoice();
        if(id<0) {
            console.warn('no voice available');
            return;
        }
        let v = this.voices[id] = { osc:ctx.createOscillator(), gain:ctx.createGain(), state:1 };
        v.gain.connect(ctx.destination);
        v.osc.connect(v.gain);
        v.gain.gain.value = 0.0;
        v.gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.1);
        v.osc.type = oscillator;
        v.osc.frequency.setValueAtTime(freq, ctx.currentTime);
        v.osc.start();
        v.freq = freq;
        return id;
    }
    this.stop = function(id) {
        let v = this.voices[id];
        if(!v)
            return;
        v.gain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.25);
        setTimeout(()=>{
            v.gain.disconnect();
            v.osc.stop();
            v.osc.disconnect();
            this.voices[id]=null;
        }, 250);
    }
}


let phonium = new Polyphonium('triangle'); // or "sine", "square", "sawtooth", "triangle"
let pianoBoard = null;
let voices = {};
let pointers = [];

function PianoBoard() {
    let hotspots = [];
    this.addKey = function(x0,y0,x1,y1, freq, label) {
        hotspots.push([x0,y0,x1,y1,freq,0,label]);
    }
    this.hitsKey = function(x,y) {
        for(let i=0; i<hotspots.length; ++i) {
            let h = hotspots[i];
            if(h[0]<=x && h[1]<=y && h[2]>x && h[3]>y)
                return i;
        }
        return -1;
    }
    this.keyDown = function(i) {
        if(i<0 || i>=hotspots.length)
            return false;
        if(hotspots[i][5] === 1)
            return false;
        hotspots[i][5] = 1;
        return true;
    }
    this.keyUp = function(i) {
        if(i<0 || i>=hotspots.length)
            return false;
        if(hotspots[i][5] === 0)
            return false;
        hotspots[i][5] = 0;
        return true;
    }
    this.keyFreq = function(i) { return hotspots[i][4]; }
    this.draw = function(ctx) {
        for(let i=0; i<hotspots.length; ++i) {
            let h = hotspots[i];
            ctx.fillStyle = h[5] ? '#888' : '#ccc';
            ctx.fillRect(h[0]+1,h[1]+1,h[2]-h[0]-2,h[3]-h[1]-2);
            if(h[6]) { // label
                ctx.fillStyle = '#000';
                ctx.fillText(h[6], (h[0]+h[2])/2, (h[1]+h[3])/2);
            }
        }
    }
}

function redraw() {
    let ctx = app.getCanvasContext();
    ctx.clearRect(0,0,app.width,app.height);
    ctx.font = '20px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = "center";
    pianoBoard.draw(ctx);
}

app.addEventListener('resize', (width, height)=>{
    let keyW = Math.floor(width / 8);
    let keyH = Math.floor(height / 4);
    pianoBoard = new PianoBoard();
    for(let i=0; i<=12; ++i) {
        let freq = Math.round(220 * Math.pow(2, i/12));
        let l = Math.floor(i/2), sharp = '';
        let x = keyW*l;
        let y = keyH*3;
        if(i%12 == 1 || i%12 == 3 || i%12==6 || i%12==8 || i%12==10) {
            x += keyW/2;
            y -= keyH;
            sharp = '#';
        }
        else if(i>4) {
            ++l;
            x += keyW;
        }
        let label = String.fromCharCode('A'.charCodeAt(0) + (l+2)%7) + sharp;
        pianoBoard.addKey(x,y, x+keyW,y+keyH, freq, label);
    }
    redraw();
});


app.addEventListener('pointer', (type, x, y, id)=>{
    let key = pianoBoard.hitsKey(x, y);
    if(type=='start' && pianoBoard.keyDown(key)) {
        voices[key] = phonium.start(pianoBoard.keyFreq(key));
        pointers[id] = key;
        return redraw();
    }
    else if(type=='move') {
        let prev = pointers[id];
        if((typeof prev === 'number') && key!=prev) {
            phonium.stop(voices[prev]);
            delete voices[prev];
            pianoBoard.keyUp(prev);
            if(key<0)
                delete pointers[id];
            else {
                pianoBoard.keyDown(key);
                voices[key] = phonium.start(pianoBoard.keyFreq(key));
                pointers[id] = key;
            }
            redraw();
        }
        else if(pianoBoard.keyDown(key)) {
            voices[key] = phonium.start(pianoBoard.keyFreq(key));
            pointers[id] = key;
            redraw();
        }
        return;
    }
    else if(type=='end' && pianoBoard.keyUp(key) && key>=0) {
        phonium.stop(voices[key]);
        delete voices[key];
        delete pointers[id];
        return redraw();
    }
});