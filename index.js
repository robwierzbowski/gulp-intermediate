'use strict';
var fs = require('fs');
var path = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var spawn = require('win-spawn');
var tempWrite = require('temp-write');
var dargs = require('dargs');
var shelljs = require('shelljs');
var chalk = require('chalk');

module.exports = function (options) {
	options = options || {};
	var passedArgs = dargs(options, ['bundleExec']);
	var bundleExec = options.bundleExec;
	var versionCommand = bundleExec === true ? 'bundle exec jekyll -v' : 'jekyll -v';

	// Catch errors first.

	try {
		shelljs.exec(versionCommand, {silent: true});
	}
	catch (err) {
		throw new gutil.PluginError('gulp-ruby-jekyll', 'You need to have Ruby and Jekyll installed and in your PATH for this task to work.');
	}

	// NOTE: Manage args up here?
	// Throw error for source or dest option
	// Get abs path to config
	// Throw error for missing config file? Does Jekyll already do this?

	// NOTE: This looks at single files -- we need to look at the dir as a whole.
	// NOTE: Should source matter / be applied to the input glob? No, let's just
	// say that stream is source, output is dest
	// NOTE: Only compiles site. Run doctor with node spawn or exec.

	// function writeFiles(file, enc, cb) {
	// 	// var self = this;
	// 	var origFileDir = file.base;
	// 	var origFilePath = file.path;
	// 	var fileName = path.basename(origFilePath);

	// 	// NOTE: WE don't have any contol on when cleanup happens. If we write all the files to tmpdir and then run jekyll on them right after we're trusting cleanup won't be immediate. WORRISOME.
	// 	// NOTE: (data, path, cb)
	// 	tempWrite.sync(file.contents, origFilePath, function (err, tempFilePath) {
	// 		if (err) {
	// 			self.emit('error', new gutil.PluginError('gulp-ruby-jekyll', err));
	// 			return cb();
	// 		}
	// 	});
	// }

	// function transformAndReadFiles() {
	// 	return null;
	// };

	// function readBack() {
	// 	fs.readFile(tempFilePath, function (err, data) {
	// 		if (err) {
	// 			self.emit('error', new gutil.PluginError('gulp-ruby-jekyll', err));
	// 			return cb();
	// 		}

	// 		self.push(new gutil.File({
	// 			base: origFileDir,
	// 			path: origFilePath,
	// 			contents: data
	// 		}));

	// 		cb(); // NOTE: final callback
	// 	});
	// }

	// New node parts
	var tmpdir = require('os').tmpdir();

	// Also in shelljs
	var mkdirp = require('mkdirp');
	var uuid = require('uuid');
	var newTmp = path.join(tmpdir, uuid.v4());
	mkdirp.sync(newTmp);

	function bufferFiles(file, enc, cb) {
    var self = this;
		// var origFileDir = file.base;
		var origFilePath = file.path;
		var fileName = path.basename(origFilePath);
		// var fileCWD = file.cwd;
		console.log(newTmp);

		var newFile = path.join(newTmp, origFilePath);
		var newDir = path.join(newTmp, path.dirname(file.path));
		// var newFile = path.join(newTmp, path.basename(origFilePath));

		// Errors:
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-ruby-jekyll', 'Streaming not supported'));
			return cb();
		}

		mkdirp.sync(newDir);
		fs.writeFile(newFile, file.contents, function(err)  {
			if (err) {
				self.emit('error', new gutil.PluginError('gulp-ruby-jekyll', err));
				return cb();
			}

      cb();
		});
	}


	return through.obj(bufferFiles);
};
