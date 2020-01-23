// Asynchronous
// buffer_buffers_and_character_encodings 
// https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings
// nodejs: this encoding will also correctly accept "URL and Filename Safe Alphabet" 
// is a lie: https://github.com/nodejs/node/blob/f0d2df41f8716670435b284e987b2fcc23221947/lib/buffer.js#L694-L698

// https://tools.ietf.org/html/rfc4648#section-5

// Fast than tree regxp function: https://github.com/crypto-utils/uid-safe/blob/52edb678aebda31723ddc90048df07315408256b/index.js#L102-L107

const REGEXP = /\+|\//g;

function base64ToSafe(base64){
  let result;

  let lastIndex = base64.length - 2;
  if(base64[lastIndex] !== '='){
    lastIndex = lastIndex + 1;
  }
  if(base64[lastIndex] === '='){
    result = base64.substr(0, lastIndex)
  }

  return result.replace(REGEXP, function(mstr){
    if(mstr === '+'){
      return '-';
    } else {
      // "/"
      return '_';
    }
  });
}

console.log(base64ToSafe('abc='));