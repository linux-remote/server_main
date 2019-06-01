
function getUser(term){
  return {
    term,
    now: Date.now()
  }
}

module.exports = {
  getUser
}
