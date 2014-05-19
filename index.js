'use strict';
var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
var gutil = require('gulp-util');
var mkdirp = require('mkdirp');
var tmpdir = require('os').tmpdir();
var through = require('through2');

module.exports = function (cleanup) {
  var newTempDir = path.join(tmpdir, uuid.v4());

  try {
    mkdirp.sync(newTempDir);
  }
  catch (err) {
    throw new gutil.PluginError('gulp-ruby-jekyll', err);
  }

  console.log(newTempDir);

  function bufferFiles(file, enc, cb) {
    var self = this;
    var intermediateFilePath = path.join(newTempDir, file.path);
    var intermediateFileBase = path.dirname(intermediateFilePath);

    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-ruby-jekyll', 'Streaming not supported'));
      return cb();
    }

    mkdirp(intermediateFileBase, function (err) {
      if (err) {
        self.emit('error', new gutil.PluginError('gulp-ruby-jekyll', 'err'));
        return cb();
      }

      fs.writeFile(intermediateFilePath, file.contents, function(err)  {
        if (err) {
          self.emit('error', new gutil.PluginError('gulp-ruby-jekyll', err));
          return cb();
        }

        cb();
      });
    });
  }

  // Need to expose newTempDir, file.cwd to cleanup
  return through.obj(bufferFiles);
};
