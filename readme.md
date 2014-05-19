# gulp-intermediate

> Write gulp files to a temporary directory, perform a custom transform on the file system, and load back into the gulp pipe

#### In progress

**TODO:**
- [ ] Should this be a gulp plugin or a node plugin to use for building gulp plugins?
- [ ] Refine and example what we should do in the transform callback
- [ ] Automate reading from the filesystem back into the gulp stream
- [ ] Name vars better
- [ ] Remove cwd path from gulp files?
- [ ] Test

## Install

```sh
$ npm install --save-dev gulp-intermediate
```

## Usage

```js
var gulp = require('gulp');
var jekyll = require('gulp-intermediate');

gulp.task('default', function () {
	// return gulp.src('src/app.scss')
	//	.pipe(intermediate(function(tempDir, tempCWD) {
  //    console.log('Heyo!');
  //  }))
	//	.pipe(gulp.dest('dist'));
});
```

## API

### intermediate(callback)

#### callback(tempDir, tempCWD)

## License

MIT © [Rob Wierzbowski](http://robwierzbowski.com)
