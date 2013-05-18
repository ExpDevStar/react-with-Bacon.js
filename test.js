var react = require('./src/react.js');

var sig = new react.Signal;

function dubl(x) { return x * 2; }
function isEven(x) { return x % 2 == 0; }

sig.filter(isEven).map(dubl).sum().onValue(function(v) {
  console.log(v);
});

for (var i = 1; i <= 10; ++i) {
  sig.emit(i);
}

var s1 = new react.Signal;
var s2 = new react.Signal;

var mixed = s1.merge(s2);

mixed.onValue(function(v) {
  console.log(v);
});

s1.emit(1);
s2.emit(2);
s1.emit(3);
s2.emit(4);
s1.emit(5);
s2.emit(6);

var p1 = new react.Property(10);
p1.onValue(function(v) {
  console.log("p1", v);
});

p1.set(20);

p1.map(function(v) {
  return v * 2;
}).onValue(function(v) {
  console.log("p1, doubled", v * 2)
});