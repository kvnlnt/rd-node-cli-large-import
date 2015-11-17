var fs = require("fs");
var glob = require("glob");
var _ = require("lodash");
var config = require("../config");
var colors = require('colors');

/**
 * Main Analyzer function
 * @param {Object} options result of command line options
 */
function Analyzer(options){
    this.options = options || {};
}

/**
 * Main Analyzer methods
 * @type {Object}
 */
Analyzer.prototype = {

    /**
     * Loop and get data from each file
     * @param  {Array} filePaths array of paths to files
     * @return {Object}        Object literal where key is the files name and value is it's contets
     */
    getDataFromFiles: function(filePaths){
        var data = {};
        for(var filePath in filePaths){
            data[filePaths[filePath]] = fs.readFileSync(filePaths[filePath], 'utf8');;
        }
        return data;
    },

    /**
     * Get column names from txt file content
     * @param  {String} content txt file content
     * @return {Array}         Array of column name
     */
    getColumnNames: function(content){
        return content.split(/\r?\n/)[0].split('|').map(function(col){
            return col.toUpperCase();
        });
    },

    /**
     * Stream files to get schema
     * @param  {Array}   filePaths  list of files to stream
     * @param  {Function} cb        callback to execute on finish
     */
    getSchemaData: function(filePaths, cb){

        var streamedFiles = {};
        var fileNames = filePaths.map(function(filePath){ return _.last(filePath.split('/')); });
        var that = this;

        /**
         * Stream first row of file
         * @param  {String}   filePath
         * @param  {Function} cb       callback
         */
        function streamFirstRow(filePath, cb){

            // create file stream
            var stream = fs.createReadStream(filePath, {
              flags: 'r',
              encoding: 'utf-8',
              fd: null,
              mode: 0666,
              bufferSize: 64 * 1024
            });

            // create data container
            var fileData = '';

            // listen for data
            stream.on('data', function(data){
                cb(filePath, that.getColumnNames(data));
                // immediately kill it, we got the data
                stream.destroy();
            });

        }

        /**
         * If all file paths have been evaluated, run callback
         * @param  {String}  filePath file path that was evalauted
         * @param  {Array}  data     columns found
         */
        function isFinished(filePath, data){

            // collect data
            var fileName = _.last(filePath.split('/'));
            streamedFiles[fileName] = data;

            // if the keys are same, we're good to go
            var diff = _.difference(fileNames, _.keys(streamedFiles));

            // if done, send final data back to callback
            if(!diff.length) cb(streamedFiles);
        }

        // loop data
        for(var filePath in filePaths){
           streamFirstRow(filePaths[filePath], isFinished);
        }

    },

    /**
     * Analyze schema
     * @return {[type]} [description]
     */
    analyze: function(cb){

        var that = this;

        // get all txt files
        glob(this.options.folder+"/*.txt", function(er, filePaths){

            // get all data
            that.getSchemaData(filePaths, function(column_data){

                var schema = {};
                var all_columns = [];
                var columns;

                // loop data
                for(var table in column_data){
                    columns = column_data[table];
                    all_columns = _.union(all_columns, columns);
                    schema[table.toUpperCase()] = columns;
                }

                // compare basic files
                var configSchemaDiff = _.difference(_.keys(config.schema),_.keys(schema));
                var schemaDiff = _.difference(_.keys(schema),_.keys(config.schema));

                // files diff 
                console.log("\nCHECK FILES".blue);
                if(configSchemaDiff.length) console.log("New schema is missing files:".red, configSchemaDiff);
                if(schemaDiff.length) console.log("New schema has added files:".red, schemaDiff);
                var filesAndSchemaOK = 0 === configSchemaDiff.length && 0 === schemaDiff.length;
                if(filesAndSchemaOK) console.log("Files look ok");

                console.log("\nCHECK SCHEMA".blue);
                // compare new schema's file columns to current
                var fullSchemaDiff = {};
                for(var table in schema){
                    var diffTable = _.difference(schema[table], config.schema[table]);
                    if(diffTable.length && !_.includes(schemaDiff, table)){
                        fullSchemaDiff[table] = diffTable;
                    }
                }

                if(_.keys(fullSchemaDiff).length){
                    for(var table in fullSchemaDiff){
                        console.log(table, " columns are different, see:", fullSchemaDiff[table]);
                    }
                } else {
                    console.log("Schema looks ok");
                }

                // the new schema looks like this
                console.log("\nSCHEMA".blue);
                console.log(JSON.stringify(schema));

                // for external use, run a callback with the schema
                if(cb) cb(schema, filesAndSchemaOK);

            });
            

        });
    }

}

module.exports = Analyzer;
