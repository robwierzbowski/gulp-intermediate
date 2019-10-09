'use strict';

var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
var glob = require('glob');
var Vinyl = require('vinyl');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var osTempDir = require('os').tmpdir();
var Transform = require('stream').Transform;
var PluginError = require('plugin-error');

var noopProcess = function(tempDir, callback) { callback(); };

module.exports = function (options, process) {
  if (typeof options === 'function') {
    process = options;
    options = {};
  }

  options = options || {};
  process = process || noopProcess;

  var outputDir = options.output || '.';
  var container = options.container || uuid.v4();
  var transform = new Transform({ objectMode: true });
  var tempDir = path.join(osTempDir, container);
  var vinylFiles = [];

  if (options.container) {
    rimraf.sync(tempDir);
  }

  transform._transform = function(file, encoding, cb) {
    var self = this;
    var tempFilePath = path.join(tempDir, file.relative);
    var tempFileBase = path.dirname(tempFilePath);

    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-intermediate', 'Streaming not supported'));
      return cb();
    }

    vinylFiles.push(file);

    mkdirp(tempFileBase, function (err) {
      if (err) {
        self.emit('error', new PluginError('gulp-intermediate', err));
        return cb();
      }

      fs.writeFile(tempFilePath, file.contents, function(err)  {
        if (err) {
          self.emit('error', new PluginError('gulp-intermediate', err));
          return cb();
        }

        if (file.stat && file.stat.atime && file.stat.mtime) {
          fs.utimes(tempFilePath, file.stat.atime, file.stat.mtime, function(err)  {
            if (err) {
              self.emit('error', new PluginError('gulp-intermediate', err));
              return cb();
            }

            cb();
          });
        }
        else {
          cb();
        }
      });
    });
  };

  transform._flush = function(cb) {
    var self = this;

    if (vinylFiles.length === 0) {
      return cb();
    }

    process(tempDir, function(err) {
      if (err) {
        self.emit('error', new PluginError('gulp-intermediate', err));
        return cb();
      }

      var base = path.join(tempDir, outputDir);

      glob('**/*', { cwd: base }, function (err, files) {
        if (err) {
          self.emit('error', new PluginError('gulp-intermediate', err));
          return cb();
        }

        files.forEach(function (file) {
          var filePath = path.join(base, file);

          // TODO: Can we make readFile async?
          if (fs.statSync(filePath).isFile()) {
            self.push( new Vinyl({
              cwd: base,
              base: base,
              path: path.join(base, file),
              contents: Buffer.from(fs.readFileSync(filePath))
            }));
          }
        });

        cb();
      });
    }, vinylFiles);
  };

  return transform;
};
