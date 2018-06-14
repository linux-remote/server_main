
const {getTimeZone} = require('./util');


// get
exports.time = function(req, res, next){
  getTimeZone(function(err, timeZone){
    if(err){
      return next(err);
    }
    const d = new Date();

    const data = {
      timeZone,
      timeZoneOffset: d.getTimezoneOffset(),
      time: d.getTime()
    }
    res.apiOk(data);
  })
}
