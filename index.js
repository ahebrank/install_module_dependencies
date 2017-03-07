#!/usr/bin/env node

const exec = require('child_process').exec;
var fs = require('fs');
var glob = require('glob');
var argv = require('minimist')(process.argv.slice(2));

if ('root' in argv) {
  var root = argv.root;
} else {
  throw new Error('Need project root --root specified (directory with project composer.json).');
}
if ('moduledir' in argv) {
  var moduleDir = argv.moduledir;
} else {
  throw new Error('Need project module --moduledir specified.');
}

// make sure package is a module
function isModuleComposer(json) {
  if (json.type) {
    return (json.type == 'drupal-module');
  }
  return false;
}

function findDependencies(json) {
  return (json.require);
}

function installPackages(packages) {
  var cmd = 'composer --working-dir=' + root + ' require ' + packages.join(' ');
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
}

function removeGit() {
  var composerdir = root + '/vendor';
  glob(composerdir + '/**/.git', {}, (err, files) => {
    files.forEach((fn) => {
     deleteFolderRecurise(fn);
    });
  });
}

function deleteFolderRecursive(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

var packages = [];
glob(moduleDir + '/**/composer.json', {}, (err, files) => {
  files.forEach((fn) => {
    var json = JSON.parse(fs.readFileSync(fn, 'utf8'));
    if (isModuleComposer(json)) {
      var dependencies = findDependencies(json);
      if (dependencies) {
        var nonModuleNames = Object.keys(dependencies).filter((name) => {
          return (name.split('/')[0] != 'drupal');
        });
        packages = packages.concat(nonModuleNames.map((n) => {
          return n + ':' + dependencies[n];
        }));
      }
    }
  });
  
  if (packages) {
    installPackages(packages);
  }
});
