const { src, dest, series, parallel } = require('gulp');
const del = require('del');
const fs   = require('fs');
const zip = require('gulp-zip');
const log = require('fancy-log');
var exec = require('child_process').exec;

const paths = {
  prod_build: 'prod-build',
  server_file_name: 'server.bundle.js',
  angular_src: 'jmdev/dist/**/*',
  angular_dist: 'prod-build/jmdev/dist',
  zipped_file_name: 'jmdev-app.zip'
};

function clean()  {
  log('removing the old files in the directory')
  return del('prod-build/**', {force:true});
}

function createProdBuildFolder() {

  const dir = paths.prod_build;
  log(`Creating the folder if not exist  ${dir}`)
  if(!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    log('📁  folder created:', dir);
  }

  return Promise.resolve('the value is ignored');
}

function buildAngularCodeTask(cb) {
  log('building Angular code into the directory')
  return exec('cd jmdev && npm run build', function (err, stdout, stderr) {
    log(stdout);
    log(stderr);
    cb(err);
  })
}

function copyAngularCodeTask() {
  log('copying Angular code into the directory')
  return src(`${paths.angular_src}`)
        .pipe(dest(`${paths.angular_dist}`));
}

function copySEOFiles(){
  log('copying robots.txt and sitemap.xml into the directory')
  return src(['robots.txt', 'sitemap.xml'])
        .pipe(dest(`${paths.angular_dist}` + '/jmdev'));
}

function copyNodeJSCodeTask() {
  log('building and copying server code into the directory')
  return src(['package.json', 'server.js', 'details.json'])
        .pipe(dest(`${paths.prod_build}`))
}

function zippingTask() {
  log('zipping the code ')
  return src(`${paths.prod_build}/**`)
      .pipe(zip(`${paths.zipped_file_name}`))
      .pipe(dest(`${paths.prod_build}`))
}

exports.default = series(
  clean,
  createProdBuildFolder,
  buildAngularCodeTask,
  parallel(copyAngularCodeTask, copySEOFiles, copyNodeJSCodeTask),
  zippingTask
);