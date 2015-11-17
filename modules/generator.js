var fs = require("fs");
var readline = require('readline');
var stream = require('stream');
var glob = require("glob");
var _ = require("lodash");
var config = require("../config");
var colors = require('colors');
var Analyzer = require('./analyzer');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var humanize = require('humanize');

/**
 * Main Generator function
 * @param {Object} options result of command line options
 */
function Generator(options){
    this.options = options || {};
    this.schema;
    this.filesProcessed = [];
    this.filesToProcess = [];
}

/**
 * Main Generator methods
 * @type {Object}
 */
Generator.prototype = {

    /**
     * Streams file data to table line by line
     * @param  {String}   filePath file path to file
     */
    streamDataToSqlite: function(filePath){

        var that = this;
        var fileName = this.getFileNameFromFilepath(filePath);
        var tableName = this.getTableNameFromFilePath(filePath).replace('.TXT', '');
        var schema = this.schema[this.getFileNameFromFilepath(filePath)];
        var records = 1;
        var instream = fs.createReadStream(filePath);
        var rl = readline.createInterface({ input: instream });

        rl.on('line', function(line) {
            records +=1;
            // console.log(line);
        });

        instream.on('open', function(){
            console.log("\nPROCESSING".yellow, filePath);
        });

        instream.on('end', function(){
            eventEmitter.emit('dataStreamedToSqlite', that);
            console.log("\n", humanize.numberFormat(records, 0), "RECORDS IMPORTED INTO TABLE:".blue, tableName);
        });
        
    },

    /**
     * Helper function to syncrhonize data imports
     * @param  {object} scope this scope of the main Generator object
     */
    importData: function(scope){
        if(scope.filesToProcess.length){
            var fileToProcess = scope.filesToProcess.pop();
            scope.streamDataToSqlite(fileToProcess);
        }
    },

    /**
     * Create a sqlite friendly table name by file name
     * @param  {String} filePath string of filename
     * @return {String}          reformatted name
     */
    getFileNameFromFilepath: function(filePath){
        return _.last(filePath.split('/')).toUpperCase();
    },

    /**
     * Create a sqlite friendly table name by file name
     * @param  {String} filePath string of filename
     * @return {String}          reformatted name
     */
    getTableNameFromFilePath: function(filePath){
        return this.getFileNameFromFilepath(filePath).replace(/ /g,"_");
    },

    /**
     * Generate migration entry
     * - runs analyzer
     * - get's schema
     * - creates database off of schema
     * - kicks off data import
     */
    generate: function(){
        
        var that = this;

        // use the analyzer to preprocess the schema
        var analyzer = new Analyzer(this.options);

        // once the schema has been constructed, stream the files to the db
        analyzer.analyze(function(schema, filesAndSchemaOK){

            // if the schema was not ok, stop everything
            if(false === filesAndSchemaOK){
                console.log("\nIMPORT FAILED: \nThe import files and/or schema does not match that in the config. Reference the errors output above. Run the analyer tool to troubleshoot.".red);
                return false;
            } else {
                console.log("\nANALYSIS COMPLETE".blue, "\nEverything seems to be in order. Moving on.");
            }

            // if we got here, the schema is ok, store schema for later use
            that.schema = schema;

            // store files to process and kick off data import
            glob(that.options.folder+"/*.txt", function(er, filePaths){
                that.filesToProcess = filePaths;

                // inform user of long running process about to go down
                console.log("\nIMPORTING".blue, filePaths.length, "FILES INTO SQLITE".blue, "\nThis will take a few minutes");
                eventEmitter.on('dataStreamedToSqlite', function(scope){
                    that.importData(scope);
                });
                that.importData(that);
            });

        });

    }
};

module.exports = Generator;