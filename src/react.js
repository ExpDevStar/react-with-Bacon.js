(function(global) {
  
  // TODO: sort this out
  var react = {};
  module.exports = react;
  
  //
  // Signal
  
  function Signal() {
    this.subscribers = [];
    this.async = false;
  }
  
  Signal.prototype = {
    onValue: function(subscriber) {
      this.subscribers.push(subscriber);
    },
    
    emit: function(arg) {
      for (var i = 0; i < this.subscribers.length; ++i) {
        try {
          this.subscribers[i](arg);
        } catch (e) {
          setTimeout(function() { throw e; }, 0);
        }
      }
    },
    
    map: function(fn) {
      var proxy = new Signal();
      this.onValue(function(v) { proxy.emit(fn(v)); });
      return proxy;
    },
    
    reduce: function(value, reducer) {
      if (typeof reducer === 'undefined') {
        reducer = value;
        value = 0;
      }
      var proxy = new Signal();
      this.onValue(function(v) {
        value = reducer(value, v);
        proxy.emit(value);
      });
      return proxy;
    },
    
    sum: function(initialValue) {
      return this.reduce(initialValue || 0, function(memo, v) {
        return memo + v;
      });
    },
    
    filter: function(test) {
      var proxy = new Signal();
      this.onValue(function(v) { if (test(v)) proxy.emit(v); });
      return proxy;
    },
    
    debounce: function(minDelay) {
      var lastTriggered = 0;
      var proxy = new Signal;
      this.onValue(function(v) {
        var now = Date.now();
        if (now - lastTriggered >= minDelay) {
          proxy.emit(v);
          lastTriggered = now;
        }
      });
      return proxy;
    },
    
    delay: function(delay) {
      var proxy = new Signal;
      this.onValue(function(v) {
        setTimeout(function() {
          proxy.emit(v)
        }, delay);
      });
      return proxy;
    },
    
    merge: function(otherSignal) {
      var mixer = new Mixer();
      mixer.add(this);
      mixer.add(otherSignal);
      return mixer;
    }
  }
  
  //
  // Mixer
  
  function Mixer() {
    this.subscribers = [];
  }
  
  Mixer.prototype = {
    onValue: function(subscriber) {
      this.subscribers.push(subscriber);
    },
    
    add: function(signal) {
      var self = this;
      signal.onValue(function(v) { self._emit(v); });
      return this;
    },
    
    // TODO: extract emit/subscriber functionality
    _emit: function(arg) {
      for (var i = 0; i < this.subscribers.length; ++i) {
        try {
          this.subscribers[i](arg);
        } catch (e) {
          setTimeout(function() { throw e; }, 0);
        }
      }
    }
  }
  
  react.Signal  = Signal;
  react.Mixer   = Mixer;
   
})();