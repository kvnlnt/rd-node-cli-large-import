var fs = require("fs");
var glob = require("glob");
var _ = require("lodash");
var config = require("./config");
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
    getColumnNamesFromFiles: function(content){
        return content.split(/\r?\n/)[0].split('|').map(function(col){
            return col.toUpperCase();
        });
    },

    /**
     * Analyze schema
     * @return {[type]} [description]
     */
    analyzeSchema: function(){
        var that = this;

        // get all txt files
        glob(this.options.folder+"/*.txt", function(er, filePaths){

            // get all data
            var data = that.getDataFromFiles(filePaths);
            var schema = {};
            var all_columns = [];
            var columns;
            var report_directory = 'reports/'+that.options.save_folder;

            // loop data
            for(var table in data){
                columns = that.getColumnNamesFromFiles(data[table]);
                all_columns = _.union(all_columns, columns);
                schema[table.toUpperCase()] = columns;
            }

            // compare basic files
            var configSchemaDiff = _.difference(_.keys(config.schema),_.keys(schema));
            var schemaDiff = _.difference(_.keys(schema),_.keys(config.schema));

            // files diff 
            console.log("\nCHECK FILES".blue);
            if(configSchemaDiff.length) console.log("New schema is missing files: ", configSchemaDiff);
            if(schemaDiff.length) console.log("New schema has added files:", schemaDiff);
            if(0 === configSchemaDiff.length && 0 === schemaDiff.length) console.log("Files look ok");

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

        });
    }

}

module.exports = Analyzer;
