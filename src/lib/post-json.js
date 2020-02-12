// used for post.
// post no cache, don't need etag. 
// But express res.json method set etag always.
// no content-type, Client use XMLHttpRequest.overrideMimeType to set. 
// So...
module.exports = function(_http){
  _http.ServerResponse.prototype.postJSON = function(data){
    this.end(JSON.stringify(data));
  }
}