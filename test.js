const Rx = require('rx');
var source = Rx.Observable.timer(0, 1000)
    .take(10)
    .takeLastWithTime(5000);

var subscription = source.subscribe(
    function (x) {
        console.log('Next: ' + x);
    },
    function (err) {
        console.log('Error: ' + err);
    },
    function () {
        console.log('Completed');
    });