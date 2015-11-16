var inquirer = require("inquirer");
var Analyzer = require("./analyzer");

/**
 * Interactive Commandline Program
 * @type {Array} Array of inquirer questions
 */
var questions = [

  // Schema args
  { 
    type: 'input',
    name: 'folder',
    message: 'Name of folder containing the formulary exports',
  }


];

// Operation mode switches
inquirer.prompt(questions, function(answers) {

  // Create main instance of analyzer
  var analyzer = new Analyzer(answers);
  analyzer.analyzeSchema();

});