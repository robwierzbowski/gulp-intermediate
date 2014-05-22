'use strict';
var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
var gutil = require('gulp-util');
var mkdirp = require('mkdirp');
var through = require('through2');
var osTempdir = require('os').tmpdir();

// to use:
// intermediate({ outputDir: 'some/relative/dir' }, function(){});

module.exports = function (options, cb) {
  var tempDir = path.join(osTempdir, uuid.v4());

  function writeIntermediateFiles(file, enc, cb) {
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

  function processAndOutputFiles() {
    cb();
    // read options.outputdir back into stream
  }

  return through.obj(writeIntermediateFiles, processAndOutputFiles);
};
