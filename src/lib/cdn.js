// URL scheme default is cdnjs.com
// https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js
function getCDN(clientVersion){
  let clientCDNPrefix = '/build/';
  let prefix = '/public';
  if(global.CONF.publicCDN){
    prefix = global.CONF.publicCDNURL || 'https://cdnjs.cloudflare.com/ajax/libs/';
    clientCDNPrefix = 'https://linux-remote.github.io/tmp_cdn/libs/';
  }

  const map = Object.create(null);
  const _resources = global.CONF.publicCDNTplMaps || Object.create(null);

  map['require'] = '2.3.6';
  map['jquery'] = '3.4.1';
  map['vue'] = '2.5.16';
  map['vuex'] = '3.0.1';
  map['vue-router'] = '3.0.1';
  map['pako'] = '1.0.10';

  const xtermV = '3.14.5';
  map['xterm'] = xtermV;
  
  Object.keys(map).forEach(k => {
    _set(_resources, k, {
      def: prefix + k + '/' + map[k] + '/' + k + '.min.js', 
      version: map[k],
      prefix
    });
  });

  map['xtermCss'] = xtermV;
  map['xtermAddonsAttach'] = xtermV;
  map['xtermAddonsFit'] = xtermV;
  map['xtermAddonsWebLinks'] = xtermV;

  _set(_resources, 'xtermCss', {
    def: prefix + 'xterm/' + xtermV + '/xterm.min.css', 
    version: xtermV,
    prefix
  });
  const addonPrefix = prefix + 'xterm/' + xtermV + '/addons/';
  _set(_resources, 'xtermAddonsAttach', {
    def: addonPrefix + 'attach/attach.min.js', 
    version: xtermV,
    prefix
  });
  _set(_resources, 'xtermAddonsFit', {
    def: addonPrefix + 'fit/fit.min.js', 
    version: xtermV,
    prefix
  });
  _set(_resources, 'xtermAddonsWebLinks', {
    def: addonPrefix + '/webLinks/webLinks.min.js', 
    version: xtermV,
    prefix
  });

  map['lrClient'] = clientVersion;
  _set(_resources, 'lrClient', {
    def: clientCDNPrefix  + clientVersion + '/lr-client.min.js',
    version: clientVersion,
    prefix
  });
  map['lrClientCss'] = clientVersion;
  _set(_resources, 'lrClientCss', {
    def: clientCDNPrefix  + clientVersion + '/lr-client.min.css',
    version: clientVersion,
    prefix
  });
  return _genResult(map, _resources, prefix);
}
  
function _set(obj, k, {def, version, prefix}){
  if(!obj[k]){
    obj[k] = def;
  } else {
    obj[k] = _render(obj[k],  version, prefix)
  }
}

function _render(tpl, version, prefix){
  return tpl.replace(/^\{\{PREFIX_URL\}\}/g, prefix)
    .replace(/\{\{VERSION\}\}/g, version);
}
function _genResult(map, tpls){
  const result = {
    css: [],
    js: []
  };
  Object.keys(map).forEach((k) => {
    if(isCss[k]){
      result.css.push(tpls[k]);
    } else {
      result.js.push(tpls[k]);
    }
  });
  return result;
}

function isCss(k){
  return k.substr(k.length - 3) === 'Css';
}

module.exports = getCDN;
