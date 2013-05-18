(function(global) {
  
  // TODO: sort this out
  var react = {};
  module.exports = react;
  
  function addSubscriber(self, subscriber) {
    self.subscribers.push(subscriber);
  }
  
  function emit(self, value) {
    for (var i = 0, subs = self.subscribers, len = subs.length; i < len; ++i) {
      try {
        subs[i](value);
      } catch (e) {
        setTimeout(function() { throw e; }, 0);
      }
    }
  }
  
  function Base() { }
  Base.prototype = {
    onValue: function(subscriber) {
      addSubscriber(this, subscriber);
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
        setTimeout(function() { proxy.emit(v) }, delay);
      });
      return proxy;
    },
    
    merge: function(otherSignal) {
      var mixer = new Mixer();
      mixer.add(this);
      mixer.add(otherSignal);
      return mixer;
    }
  };
  
  //
  // Signal
  
  function Signal() {
    this.subscribers = [];
  }
  
  Signal.prototype = new Base;
  
  Signal.prototype.emit = function(value) {
    emit(this, value);
  };
  
  //
  // Properties
  
  function Property(initialValue) {
    this.value = initialValue;
    this.subscribers = [];
  }
  
  Property.prototype = new Base;
  
  Property.prototype.valueOf = function() {
    return this.value;
  }
  
  Property.prototype.get = function() {
    return this.value;
  }
  
  Property.prototype.set = function(newValue) {
    this.value = newValue;
    emit(this, this.value);
  }
  
  Property.prototype.onValue = function(subscriber) {
    addSubscriber(this, subscriber);
    subscriber(this.value);
  }
  
  // TODO: derived signals should get current value
  // This requires contemplation. Should a signal have
  // some sort of buffering?
  
  //
  // Mixer
  
  function Mixer() {
    this.subscribers = [];
  }
  
  Mixer.prototype = new Base;
  
  Mixer.prototype.add = function(signal) {
    var self = this;
    signal.onValue(function(v) { emit(self, v); });
    return this;
  };
  
  react.Signal    = Signal;
  react.Property  = Property;
  react.Mixer     = Mixer;
   
})();