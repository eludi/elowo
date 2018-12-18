console.background('#ddd').height(5).position('bottom');
for(let i=1; i<=10; ++i)
    console.out(i, i*i);
console.error('(°-°)');
let input = await console.in('Is this funny?', 'a little bit');
console.warn('you typed:', input);
console.color('blue').log('READY.');
