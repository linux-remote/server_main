// on Sep 22, 2018 copyright https://github.com/hezedu/SomethingBoring/blob/master/algorithm/DebounceTime.js
// unmidify

function DebounceTime(callback, dealy){
  this.go = callback;
  this.dealy = dealy;
  this.isInputing = false;
  this.inputCount = 0;
  this.inputedCount = 0;
  this.timer = null;
}

DebounceTime.prototype.trigger = function(){
  this.inputCount = this.inputCount + 1;
  if(this.isInputing){
    return;
  }
  this.isInputing = true;
  this.inputedCount = this.inputedCount + 1;
  this.process();
}

DebounceTime.prototype.process = function(){
  if(this.timer){
    return;
  }
  this.timer = setInterval(() => {
    // console.error('setInterval');
    this.isInputing = false;
    if(this.inputedCount === this.inputCount){
      this.inputedCount = this.inputCount = 0;
      clearInterval(this.timer);
      this.timer = null;
      this.go();
    }else{
      this.inputedCount = this.inputCount;
    }
  }, this.dealy);
}

exports.DebounceTime = DebounceTime;
