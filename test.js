// const Rx = require('rx');
// var source = Rx.Observable.timer(0, 1000)
//     .take(10)
//     .takeLastWithTime(5000);

// var subscription = source.subscribe(
//     function (x) {
//         console.log('Next: ' + x);
//     },
//     function (err) {
//         console.log('Error: ' + err);
//     },
//     function () {
//         console.log('Completed');
//     });

var gloves=require('./index.js')
gloves.createOnclickStream('We').stream.subscribe((x)=>{  console.log(`${x} onclick`)})
