
// Entry
global.IS_PRO = process.env.NODE_ENV === 'production';

require('./src/server.js');

process.on('disconnect', function(){
  process.exit();
});
