'use strict';

var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
var File = require('vinyl');
var glob = require('glob');
var gutil = require('gulp-util');
var mkdirp = require('mkdirp');
var osTempDir = require('os').tmpdir();
var Transform = require('stream').Transform;

// use: intermediate({ outputDir: 'someDir' }, function(tempDir, cb) { actions; cb() })
// TODO: Need better names for transform, process, shortpath & other vars

module.exports = function (options, process) {
  var tempDir = path.join(osTempDir, uuid.v4());
  var transform = new Transform({ objectMode: true });
  var outputDir = options.outputDir ? path.join(tempDir, options.outputDir) : tempDir;
  var origCWD;
  var origBase;

  transform._transform = function(file, encoding, cb) {
    var self = this;
    var shortPath = path.relative(file.cwd, file.path);
    var intermediateFilePath = path.join(tempDir, shortPath);
    var intermediateFileDir = path.dirname(intermediateFilePath);

    if (!origCWD){
      origCWD = origCWD || file.cwd;
    }

    if (!origBase){
      origBase = origBase || file.base;
    }

    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-intermediate', 'Streaming not supported'));
      return cb();
    }

    // Can we cut this down?
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

  transform._flush = function(cb) {
    var self = this;

    process(tempDir, function() {
      glob('**/*', { cwd: outputDir }, function (err, files) {

        if (err) {
          self.emit('error', new gutil.PluginError('gulp-intermediate', err));
          return cb();
        }

        files.forEach(function (file) {
          var realPath = path.join(outputDir, file);

          if (fs.statSync(realPath).isFile()) {
            fs.readFile(realPath, function(err, data) {

              if (err) {
                self.emit('error', new gutil.PluginError('gulp-intermediate', err));
                return cb();
              }

              self.push( new File({
                cwd: origCWD,
                base: origBase,
                path: path.join(origBase, file),
                contents: new Buffer(data)
              }));
            });
          }
        });

        cb();
      });
    });
  };

  return transform;
};
