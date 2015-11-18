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
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/db.sqlite');

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

        var that                 = this;
        var fileName             = this.getFileNameFromFilepath(filePath);
        var tableName            = this.dbFormatText(filePath);
        var schema               = this.schema[this.getFileNameFromFilepath(filePath)];
        var re_formulary_extract = new RegExp("("+config.filter.productList.join("|")+")", "gi");
        var columns              = that.schema[fileName].map(function(column){ return "'" + that.dbFormatText(column) + "'"; }).join(", ");
        var column_placeholders  = that.schema[fileName].map(function(){ return '?'; }).join(', ');
        var sqlInsertString      = "INSERT INTO "+tableName+" ("+columns+") VALUES ("+column_placeholders+")";
        var isMatch              = false;
        var instream             = fs.createReadStream(filePath);
        var records              = [];

        // create line reader interface
        var lineReader = readline.createInterface({
            input: instream,
            terminal: false
        });

        // on each line, collect
        lineReader.on('line', function(line) {
            isMatch = line.match(re_formulary_extract);
            if(isMatch){
                line_values = line.split('|');
                records.push(line_values);
                process.stdout.write("records found " + humanize.numberFormat(records.length, 0) + " \r");
            }
        });

        var vals = ['FF_PLAN_ID', 'FF_PLAN_NAME', 'PROVIDER_ID', 'PROVIDER_NAME', 'PARENT_ID', 'PARENT_NAME', 'PLAN_TYPE', 'STATE_S__OF_OPERATION', 'PREFERRED_BRAND_TIER', 'DRUG_ID', 'DRUG_NAME', 'TIER', 'COPAY_RANGE', 'COINSURANCE', 'PA', 'QL', 'ST', 'OR', 'REASON_CODE', 'RESTRICTION_DETAIL'];

        // when all done reading file
        lineReader.on('close', function(){
            console.log("\n", sqlInsertString);
            db.run(sqlInsertString, records[0]);
            db.run(sqlInsertString, records[1]);
            // for(var records in records){
            //     db.run(sqlInsertString, vals);
            // }
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
    dbFormatText: function(filePath){
        return this.getFileNameFromFilepath(filePath)
        .replace(/(\s+|-|\(|\))/g,"_").replace(".TXT",'');
    },

    /**
     * Create internal sqlite database of data
     * @param  {Function} cb callback to run upon completion
     */
    createDB: function(cb){

        var that = this;

        // tell user what's going on
        console.log('\nCREATING INTERNAL DATABASE'.blue);

        // serialize table creation
        db.serialize(function() {
            for(var t in that.schema){
                var table = that.dbFormatText(t);
                var columns = that.schema[t].map(function(column){
                    return "'" + that.dbFormatText(column) + "' TEXT";
                }).join(", ");
                var createStatement = "CREATE TABLE " + table + " (" + columns + ")";
                db.run("DROP TABLE IF EXISTS " + table);
                console.log("CREATING TABLE".yellow, table);
                db.run(createStatement);
            }
            // after it's all said and done you can run the callback that presumably
            // will now be importing the actual data
            // make sure to call it here within serialize!
            cb();
        });

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

            // we need to process the files in specific order
            that.filesToProcess = config.filesToProcess.map(function(file){
                return that.options.folder + "/" + file;
            });

            // register a listener here for streamed inputs
            eventEmitter.on('streamDataToSqliteComplete', function(scope){
                that.importData(scope);
            });
            
            // create database before import silly!
            that.createDB(function(){
                // inform user of long running process about to go down
                console.log("\nIMPORTING".blue, config.filesToProcess.length, "FILES INTO DATABASE".blue, "\nThis will take a few minutes");
                that.importData(that);
            });

        });

    }
};

module.exports = Generator;