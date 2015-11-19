var fs = require("fs");
var readline = require('readline');
var stream = require('stream');
var glob = require("glob");
var _ = require("lodash");
var config = require("../config");
var colors = require('colors');
var Analyzer = require('./analyzer');
var humanize = require('humanize');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/db.sqlite');

/**
 * Main Generator function
 * @param {Object} options result of command line options
 */
function Generator(options){
    this.options = options || {};
    this.unique_ff_plan_ids = [];
}

/**
 * Main Generator methods
 * @type {Object}
 */
Generator.prototype = {

    importZipLevelLives: function(){

        // inform user of long running process about to go down
        console.log("\nIMPORTING ZIP LEVEL LIVES DATA INTO DATABASE".blue);

        var that = this;
        var filePath = this.options.folder + "/ZIP LEVEL LIVES.TXT";
        var fileName = this.getFileNameFromFilepath(filePath);
        var tableName = this.dbFormatText(filePath);
        var columns = config.schema[fileName].map(function(column){ return "'" + that.dbFormatText(column) + "'"; }).join(", ");
        var schema = config.schema[this.getFileNameFromFilepath(filePath)];
        var instream = fs.createReadStream(filePath);
        var records = [];

        // empty the table first
        db.run("DELETE FROM " + tableName + " WHERE 1=1");

        // status update
        console.log("READING".yellow, filePath);

        // create line reader interface
        var lineReader = readline.createInterface({
            input: instream,
            terminal: false
        });

        // on each line, collect valuess
        lineReader.on('line', function(line) {

            // turn values into arrays
            line_values = line.split('|');
            var ff_plan_id = parseInt(line_values[0]);

            // regex row
            isMatch = that.unique_ff_plan_ids.indexOf(ff_plan_id) >= -1;
                
            // if this is a match, collect it
            if(isMatch){
                // store values
                records.push(line_values);
                var showStatus = (records.length > 10000 ? records.length % 10000 : 10000 > records.length) === 0;
                if(showStatus) process.stdout.write("RELEVANT RECORDS FOUND ".yellow + humanize.numberFormat(records.length, 0) + " \r");

            }

        });

        // when all done with streaming the file
        lineReader.on('close', function(){
            
            // chunk the records array to bolster bulk import performance
            var chunks = _.chunk(records, 10000);
            var recordCount = records.length;

            // tell user what's happening
            console.log("RELEVANT RECORDS FOUND".yellow, humanize.numberFormat(recordCount, 0));
            console.log("INSERTING RECORDS INTO".yellow, tableName);

            db.serialize(function() {

                // loop and insert the chunks
                for(var chunk in chunks){

                    // create a big sqlite friendly values list like this ('val', 'val', 'val'), ('val', 'val', 'val'),...
                    var chunkRecords = chunks[chunk];
                    var values = chunkRecords.map(function(record){
                        return "(" + record.map(function(val){
                            return "'" + that.escape(val) + "'";
                        }) + ")";
                    }).join(', ');

                    // build a final insert statement
                    var insertStatement = "INSERT INTO "+tableName+" ("+columns+") VALUES " + values;

                    // run the insert statement
                    db.run(insertStatement);

                }

                console.log("RECORDS INSERTED".yellow, humanize.numberFormat(recordCount, 0), "\n");

            });

        });

    },

    importFormularyExtract: function(){

        // inform user of long running process about to go down
        console.log("\nIMPORTING FORMULARY EXTRACT DATA INTO DATABASE".blue);

        var that = this;
        var filePath = this.options.folder + "/FORMULARY EXTRACT.TXT";
        var fileName = this.getFileNameFromFilepath(filePath);
        var tableName = this.dbFormatText(filePath);
        var columns = config.schema[fileName].map(function(column){ return "'" + that.dbFormatText(column) + "'"; }).join(", ");
        var schema = config.schema[this.getFileNameFromFilepath(filePath)];
        var re = new RegExp("("+config.filter.productList.join("|")+")", "gi");
        var instream = fs.createReadStream(filePath);
        var records = [];

        // empty the table first
        db.run("DELETE FROM " + tableName + " WHERE 1=1");

        // create line reader interface
        var lineReader = readline.createInterface({
            input: instream,
            terminal: false
        });

        console.log("READING".yellow, filePath);

        // on each line, collect values
        lineReader.on('line', function(line) {

            // regex row
            isMatch = line.match(re);
            this.next = that.importZipLevelLives;
                
            // if this is a match, collect it
            if(isMatch){

                // turn values into arrays
                line_values = line.split('|');

                var ff_plan_id = parseInt(line_values[0]);
                if(that.unique_ff_plan_ids.indexOf(ff_plan_id) == -1){
                    that.unique_ff_plan_ids.push(ff_plan_id);
                }

                // store values
                records.push(line_values);

                var showStatus = (records.length > 1000 ? records.length % 1000 : 1000 > records.length) === 0;
                if(showStatus) process.stdout.write("RELEVANT RECORDS FOUND ".yellow + humanize.numberFormat(records.length, 0) + " \r");

            }

        });

        // when all done with streaming the file
        lineReader.on('close', function(){
            
            // chunk the records array to bolster bulk import performance
            var chunks = _.chunk(records, 10000);
            var recordCount = records.length;

            // tell user what's happening
            console.log("RELEVANT RECORDS FOUND".yellow, humanize.numberFormat(recordCount, 0));
            console.log("INSERTING RECORDS INTO".yellow, tableName);

            db.serialize(function() {

                // loop and insert the chunks
                for(var chunk in chunks){

                    // create a big sqlite friendly values list like this ('val', 'val', 'val'), ('val', 'val', 'val'),...
                    var chunkRecords = chunks[chunk];
                    var values = chunkRecords.map(function(record){
                        return "(" + record.map(function(val){
                            return "'" + that.escape(val) + "'";
                        }) + ")";
                    }).join(', ');

                    // build a final insert statement
                    var insertStatement = "INSERT INTO "+tableName+" ("+columns+") VALUES " + values;

                    // run the insert statement
                    db.run(insertStatement);

                }

                console.log("RECORDS INSERTED".yellow, humanize.numberFormat(recordCount, 0), "\n");
                that.importZipLevelLives();

            });

        });
    },

    /**
     * helper escape function for sqlite inadequacies
     * @type {[type]}
     */
    escape: function(value) {
        if (value && value.replace) {
            return value.replace(/'/g, "''");
        }
        else {
            return value;
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
    createDB: function(done){

        var that = this;
        var tablesToBeCreated = Object.keys(config.schema).map(function(table){
            return {
                name: that.dbFormatText(table),
                columns: config.schema[table].map(function(col){
                    return that.dbFormatText(col);
                })
            };
        });

        // tell user what's going on
        console.log('\nCREATING INTERNAL DATABASE'.blue);

        // serialize table creation
        db.serialize(function() {

            for(var i in tablesToBeCreated){
                var table = tablesToBeCreated[i];
                var tableName = table.name;
                var tableColumns = table.columns.map(function(column){ return "'" + that.dbFormatText(column) + "' TEXT"; }).join(", ");
                var createStatement = "CREATE TABLE IF NOT EXISTS " + tableName + " (" + tableColumns + ")";
                console.log("CREATING TABLE".yellow, tableName);
                db.run(createStatement);
            }
            // in each run callback and then run this final callback
            done();
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

            // create database before import silly!
            that.createDB(function(){
                that.importFormularyExtract();
            });

        });
    }
};

module.exports = Generator;