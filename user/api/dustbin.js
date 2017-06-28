// const os = require('os');
const {exec} = require('child_process');
const fs = require('fs');
const sas = require('sas');
const path = require('path');
// const express = require('express');
// const router = express.Router();
const ADDRESS = '/var/tmp/linux-remote/dustbin/' + global.APP.USER.username;
module.exports = function(req, res, next){

  fs.readdir(ADDRESS, (err, result) => {
    if(err){
      return next(err);
    }
    res.apiOk(result);
  })
}
