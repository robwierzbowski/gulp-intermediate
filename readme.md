# gulp-intermediate

> Write gulp files to a temporary directory, perform a custom transform on the file system, and load back into the gulp pipe

#### In progress

**TODO:**
- [ ] Document
- [ ] Test

**General idea**

1. take a gulp stream
1. write to disk in tmp dir
1. user provides custom transform
1. user provides directory to read (based on custom transform)
1. gobbles it back up and passes back to pipe/through

## Install

```sh
$ npm install --save-dev gulp-intermediate
```

## Usage

```js
var gulp = require('gulp');
var jekyll = require('gulp-intermediate');

// Use: 
// intermediate({ outputDir: 'someDir' }, function(tempDir, cb) { actions; cb() })

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
