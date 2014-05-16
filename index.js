'use strict';
var fs = require('fs');
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
	var versionTest = bundleExec === true ? 'bundle exec jekyll -v' : 'jekyll -v';

	try {
		shelljs.exec(versionTest, {silent: true});
	}
	catch (err) {
		throw new gutil.PluginError('gulp-ruby-jekyll', 'You need to have Ruby and Jekyll installed and in your PATH for this task to work.');
	}

	// NOTE: This looks at single files -- we need to look at the dir as a whole.
	// NOTE: Should source matter / be applied to the input glob? No, let's just
	// say that stream is source, output is dest

	return through.obj(function (file, enc, cb) {
		var self = this;
		// var fileDirname = file.base;

		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-ruby-jekyll', 'Streaming not supported'));
			return cb();
		}

		// NOTE: inputTempFile is a single file based idea.
		tempWrite(file.contents, path.basename(file.path), function (err, inputTempFile) {
			if (err) {
				self.emit('error', new gutil.PluginError('gulp-ruby-jekyll', err));
				return cb();
			}

			// NOTE: set up real args. Let people pass anything except --dest && --source
			var args = [
				// 'sass',
				// inputTempFile,
				// outputTempFile,
				// '--load-path', fileDirname
			].concat(passedArgs);

			if (bundleExec) {
				args.unshift('bundle', 'exec');
			}

			// if we're compiling SCSS or CSS files
			// if (path.extname(file.path) === '.css') {
			// 	args.push('--scss');
			// }

			var cmd = args.shift();
			var cp = spawn(cmd, args);

			// NOTE: Will need this.
			// if (process.argv.indexOf('--verbose') !== -1) {
			// 	gutil.log('gulp-ruby-jekyll:', 'Running command:', cmd, chalk.blue(args.join(' ')));
			// }

			cp.on('error', function (err) {
				// TODO: remove when gulp has fixed error handling
				gutil.log('[gulp-ruby-jekyll] ' + err);

				self.emit('error', new gutil.PluginError('gulp-ruby-jekyll', err));
				return cb();
			});

			// NOTE: Setting up stderr output
			var errors = '';
			cp.stderr.setEncoding('utf8');
			cp.stderr.on('data', function (data) {
				// ignore deprecation and empty warnings
				// if (/DEPRECATION WARNING/.test(data) || data.trim() === '') {
				// 	return;
				// }

				errors += data;
			});

			cp.on('close', function (code) {
				if (errors) {
					// TODO: remove when gulp has fixed error handling
					// NOTE: Probably need to rewrite these two
					// gutil.log('[gulp-ruby-jekyll]', '\n' + errors.replace(inputTempFile, file.path).replace('Use --trace for backtrace.\n', ''));

					// self.emit('error', new gutil.PluginError('gulp-ruby-jekyll', '\n' + errors.replace(inputTempFile, file.path).replace('Use --trace for backtrace.\n', '')));
					return cb();
				}

				if (code > 0) {
					self.emit('error', new gutil.PluginError('gulp-ruby-jekyll', 'Exited with error code ' + code));
					return cb();
				}

				// NOTE: Pull in those new files
				// NOTE: Once again, doing single files here, got to move to dirs
				// fs.readFile(outputTempFile, function (err, data) {
				// 	if (err) {
				// 		self.emit('error', new gutil.PluginError('gulp-ruby-jekyll', err));
				// 		return cb();
				// 	}

				// 	self.push(new gutil.File({
				// 		base: fileDirname,
				// 		contents: data
				// 	}));

				// NOTE: final callback
				// 	cb();
				// });
			});
		});
	});
};
