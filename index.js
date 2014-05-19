'use strict';
var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
var gutil = require('gulp-util');
var mkdirp = require('mkdirp');
var tmpdir = require('os').tmpdir();
var through = require('through2');

module.exports = function (transform) {
  var newTempDir = path.join(tmpdir, uuid.v4());
  var tempCWD;

  try {
    mkdirp.sync(newTempDir);
  }
  catch (err) {
    throw new gutil.PluginError('gulp-intermediate', err);
  }

  function bufferFiles(file, enc, cb) {
    var self = this;
    var intermediateFilePath = path.join(newTempDir, file.path);
    var intermediateFileDir = path.dirname(intermediateFilePath);

    if (typeof tempCWD !== undefined) {
      tempCWD = file.cwd;
    }

    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-intermediate', 'Streaming not supported'));
      return cb();
    }

    mkdirp(intermediateFileDir, function (err) {
      if (err) {
        self.emit('error', new gutil.PluginError('gulp-intermediate', 'err'));
        return cb();
      }

      fs.writeFile(intermediateFilePath, file.contents, function(err)  {
        if (err) {
          self.emit('error', new gutil.PluginError('gulp-intermediate', err));
          return cb();
        }

        cb();
      });
    });
  }

  function processFiles() {
    transform(newTempDir, tempCWD);
  }

  return through.obj(bufferFiles, processFiles);
};
