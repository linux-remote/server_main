
const {getTimeZone} = require('./util');

// get
module.exports = function(req, res, next){
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

// function isRecycEmpty(){

// }
// exports.bundle = function(req, res, next){
//   res.apiOk({
//     thirdPartyApp: list
//   })
// }