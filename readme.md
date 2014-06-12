# gulp-intermediate ![status](https://api.travis-ci.org/robwierzbowski/gulp-intermediate.svg)&nbsp;![dependencies](https://david-dm.org/robwierzbowski/gulp-intermediate.svg)

> Use tools that act on the file system with gulp.

Some tools work on the file system instead of `stdin` and `stdout`. `gulp-intermediate` is a convenience plugin that writes the current stream to a temporary directory, lets you run commands on the file system, and pushes the results back into the gulp stream.

**NOTE:** Writing intermediate files to disk is counter to the gulp philosophy. If possible, use a tool or plugin that works with streams. Use gulp-intermediate only if other (better) options aren't available.

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
    .pipe(intermediate('_site', function (tempDir, cb) {

      // Run a command on the file system in tempDir and write the results to
      // the specified outputDir.
      var command = spawn('a_command', ['--dest', '_site'], {cwd: tempDir});
      command.on('close', cb);
    }))
    .pipe(gulp.dest('dist'));
});
```

For more examples see [recipes.md](https://github.com/robwierzbowski/gulp-intermediate/blob/master/recipes.md).

## API

### intermediate(outputDir, process, options)

#### outputDir

Type: `string`  

The plugin reads files back into the stream from this directory when processing is finished. Relative to `tempDir`.

#### process(tempDir, cb)

Type: `function`  

Run your commands inside the `process` callback.

`tempDir`: The first argument is the absolute path to the directory that contains your temporary files. If using `spawn` you may want to set the `cwd` option to `tempDir`.

`cb`: The second argument is a callback to call when processing is finished.

#### options

##### customDir

Type: `string`  
Default: random uuid

By default the intermediate files are processed in a unique, random temporary directory on every run. You can choose a specific directory with the `customDir` option. Its path is relative to the operating system's temporary directory.

For safety, the `customDir` is cleaned before every run. 

## License

[MIT](http://en.wikipedia.org/wiki/MIT_License) © [Rob Wierzbowski](http://robwierzbowski.com)
