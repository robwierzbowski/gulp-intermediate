# Recipes

## Using gulp-intermediate directly

### Jekyll

[Jekyll](http://jekyllrb.com) is a static site builder written in Ruby. It requires access to files on disk in order to run, making it incompatible with streams. [gulp-intermediate](https://github.com/robwierzbowski/gulp-intermediate) allows you to use Jekyll with gulp relatively easily.

#### File structure

For this example we're using a [Yeoman](http://yeoman.io)-like directory structure. Config and workflow files live in the root directory, source files live in `app`, and we are compiling our site into `dist`.

```
├── _config.yml
├── Gemfile
├── gulpfile.js
├── package.json
├── app
│   ├── _includes
│   │   ├── footer.html
│   │   ├── head.html
│   │   └── header.html
│   ├── _layouts
│   │   ├── default.html
│   │   ├── page.html
│   │   └── post.html
│   ├── _posts
│   │   └── 2019-11-03-welcome-to-jekyll.md
│   ├── about.md
│   ├── css
│   │   └── main.css
│   ├── js
│   │   └── main.js
│   ├── index.html
├── dist
└── npm_modules
```

#### Task

```js
var gulp = require('gulp');
var path = require('path');
var gutil = require('gulp-util');
var spawn = require('child_process').spawn;
var intermediate = require('gulp-intermediate');

// Name the gulp task.
gulp.task('html', function () {
  
  // Pull the files you need for Jekyll into the stream. Here we're only using
  // Gulp to compile HTML, and leaving CSS, JS, and images for other, faster
  // tasks. Gemfile is required because we're running `bundle exec`.
  return gulp.src([
    'app/**/*.{html,md,yml}',
    'Gemfile'
  ])
  
  // Pipe to intermediate. Set the outputDir to the directory we're compiling
  // Jekyll to.
  .pipe(plug.intermediate('_site', function(tempDir, cb) {
    
    // Add some pretty logging.
    gutil.log('Running \'' + gutil.colors.cyan('jekyll') + '\'...');

    var config = path.join(__dirname, '_config.yml');
    
    // Spawn a `jekyll build` process. Use the tempDir as the CWD to simplify
    // the rest of the source and destination paths. Specify our config, source,
    // and dest.
    var jekyll = spawn(
      'bundle',
      ['exec', 'jekyll', 'build', '--config', config, '-s', 'app', '-d', '_site'],
      { cwd: tempDir }
    );

    // Log Jekyll messages to the console. Remove extra linebreaks.
    jekyll.stdout.on('data', function (data) {
      console.log(data.toString().replace(/\s+$/g, ''));
    });

    // Log any errors to the console.
    jekyll.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    // Run the callback when Jekyll is finished.
    jekyll.on('close', cb);
  }))
  
  // Output files to the dist directory.
  .pipe(gulp.dest('dist/'));
});
```

Now that you have Jekyll compilation as part of a stream, you can:

Write all your layout and template files in [jade](https://github.com/phated/gulp-jade), compile them to HTML and then run them through Jekyll.  

```js
 return gulp.src([
    'app/**/*.{jade,md,yml}',
    'Gemfile'
  ])
  .pipe(jade({ pretty: true }))
  .pipe(plug.intermediate('_site', function(tempDir, cb) { ... }))
  .pipe(gulp.dest('dist/'));
```

[Minify](https://github.com/jonschlinkert/gulp-htmlmin) your Jekyll HTML after compilation.

```js
 return gulp.src([
    'app/**/*.{html,md,yml}',
    'Gemfile'
  ])
  .pipe(plug.intermediate('_site', function(tempDir, cb) { ... }))
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('dist/'));
```

Or anything else you like with gulp plugins.

## Using gulp-intermediate as part of your own plugin

You can return gulp-intermediate as a through stream in your own plugin. Examples:

- [gulp-ruby-sass fork](https://github.com/robwierzbowski/gulp-ruby-sass/tree/rw/gulp-intermediate)
