# gulp-intermediate

> Use tools that require files on disk as part of the gulp stream.

Some tools work on the file system instead of `stdin` and `stdout`. This plugin writes the current stream to a temporary directory, lets you run commands on the file system, and pushes the results back into the gulp stream.

**NOTE:** Writing intermediate files to disk is counter to the gulp philosophy. If possible, use a tool or plugin that works with streams, or a purpose-built plugin (e.g., [gulp-ruby-sass](https://github.com/sindresorhus/gulp-ruby-sass)). Use gulp-intermediate only if other (better) options aren't available.

## Install

```sh
$ npm install --save-dev gulp-intermediate
```

## Usage

```js
var gulp = require('gulp');
var spawn = require('child-process').spawn;
var intermediate = require('gulp-intermediate');

gulp.task('default', function () {
  return gulp.src('app/**/*.jade')
    .pipe(intermediate({ outputDir: '_processed' }, function (tempDir, cb) {
      // A command that reads the files in `tempDir`, transforms them, and
      // writes the  transformed files to the specified outputDir.
      var command = spawn('a_command', ['arg'], {cwd: tempDir});
      command.on('close', function () {
        cb();
      });
    }))
    .pipe(gulp.dest('dist'));
});
```

## API

### intermediate(options, process)

#### options

##### outputDir

Type: `string`  
Default: `.`  

Tell the plugin what directory (relative to the tempDir) it should read back into the stream after processing is finished.

#### process(tempDir, cb)

Type: `function`  

Run your commands inside the `process` function.

The first argument is a path to the directory that contains your temporary files. If using `spawn` you may want to set the `cwd` option to this directory.

The second argument is the callback to fire when all processing is finished.

## Recipes

<!-- TODO: Get a working spawn jekyll example for the recipes -->

## License

MIT © [Rob Wierzbowski](http://robwierzbowski.com)
