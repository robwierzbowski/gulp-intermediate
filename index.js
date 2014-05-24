'use strict';
var fs = require('fs');
var vfs = require('vinyl-fs');
var path = require('path');
var uuid = require('uuid');
var gutil = require('gulp-util');
var mkdirp = require('mkdirp');
var osTempDir = require('os').tmpdir();
var Transform = require('stream').Transform;

module.exports = function (options, process) {
  var tempDir = path.join(osTempDir, uuid.v4());
  var parser = new Transform({ objectMode: true });
  options.outputDir = options.outputDir ? path.join(tempDir, options.outputDir) : tempDir;

  parser._transform = function(file, encoding, cb) {
    var self = this;
    var shortPath = path.relative(file.cwd, file.path);
    var intermediateFilePath = path.join(tempDir, shortPath);
    var intermediateFileDir = path.dirname(intermediateFilePath);

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
        self.emit('error', new gutil.PluginError('gulp-intermediate', err));
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
  };

  parser._flush = function(cb) {
    var self = this;

    // ALL RIGHT FOOLS, ADD SOME PROCESSING HERE

    vfs.src(path.join(tempDir, '**/*')).on('data', function(file) {
      // TODO: better way to filter directories?
      if (file.contents) {
        self.push(file);
      }
    })
    .on('end', function() {
      cb();
    });
  };

  return parser;
};
