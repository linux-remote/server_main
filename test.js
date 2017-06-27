console.log('process.env.USER', process.env.USER)
process.env.USER = 'test';
const os = require('os');

console.log('process.env.USER', process.env.USER)
console.log('process.env.USER', os.userInfo())
