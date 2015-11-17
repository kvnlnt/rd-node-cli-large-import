var inquirer = require("inquirer");
var Analyzer = require("./modules/analyzer");
var Generator = require("./modules/generator");
var fs = require('fs');
var path = require('path');

/**
 * list all directories in a directory
 * @param  {[type]} srcpath [description]
 * @return {[type]}         [description]
 */
function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

var dataFolders = getDirectories('./data').map(function(dir){ return './data/' + dir});

/**
 * Interactive Commandline Program
 * @type {Array} Array of inquirer questions
 */
var questions = [

  { 
    type: 'list',
    name: 'mode',

    message: 'What are you looking to do?',
    choices: [
      'Generate',
      'Analyze'
    ]
  },

  { 
    type: 'list',
    name: 'folder',
    message: "Select the folder containg your exports",
    choices: dataFolders
  }

];

// Operation mode switches
inquirer.prompt(questions, function(answers) {

  // Create main instance of analyzer
  if(answers.mode === 'Analyze'){
    var analyzer = new Analyzer(answers);
    analyzer.analyze();
  } else {
    var generator = new Generator(answers);
    generator.generate();
  }

});