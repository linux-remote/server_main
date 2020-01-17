
const methodMap = new Map([
  ['POST', true], 
  ['PUT', true]
]);


const praKeyMap = new Map();

let syncCount = 0;
let asyncCount = 0;

module.exports = function(req, res, next){
  if(!methodMap.has(req.method)){
    return next();
  }
  

  let pra = req.cookies.pra || 0;
  pra = Number(pra);
  if(isNaN(pra) || pra < 1){
    next({
      status: 400,
      message: 'Pra not valid.'
    })
    return;
  }

  syncCount = syncCount + 1;

  if(lastPra === 0){
    // Server start or reload
    // pra = 1;
  } else {
    if(pra < lastPra){
      return next({
        status: 400,
        message: 'Reply Attack Prevented'
      })
    }
  }
  let praKey = pra + '-' + asyncCount;
  if(praKeyMap.has(praKey)){
    return next({
      status: 400,
      message: 'Reply Attack Prevented'
    })
  }
  if(asyncCount === 0){
    lastPra = pra;
  }
  praKeyMap.set(pra, true);
  asyncCount = asyncCount + 1;

  res.on('finish', function(){
    asyncCount = asyncCount - 1;
    praKeyMap.delete(praKey);
  });

  res.cookie('pra', Date.now(), {
    httpOnly: true,
    secure: global.CONF.cookieSecure
  });
  next();
}
