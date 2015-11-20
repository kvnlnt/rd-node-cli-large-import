var fs                    = require('fs');
var readline              = require('readline');
var config                = require("../config");

// formulary files
var formularySource       = "../data/novo_monthly_nnids_20150901/FORMULARY EXTRACT.TXT";
var formularySourceStream = fs.createReadStream(formularySource);
var formularyRE           = new RegExp("("+config.filter.productList.join("|")+")", "gi");
var formluaryTarget       = "./formulary_products.sql";
var formluaryTargetStream = fs.createWriteStream(formluaryTarget);
var formularyCols         = [0, 1, 3, 10, 11];
var formularyRecords      = [];

// escape single quote 
function escape(value) {
    if (value && value.replace) {
        return value.replace(/'/g, "''");
    }
    else {
        return value;
    }
};

// read formulary
var formularyReader = readline.createInterface({
    input: formularySourceStream,
    terminal: false
});

function getBulkInsert(records){
   return records.map(function(record){
        return "(" + record.map(function(val){
            return "'" + escape(val) + "'";
        }) + ")";
    }).join(',\n');
}

 // on each line, collect values
formularyReader.on('line', function(line) {
    isMatch = line.match(formularyRE);
    if(isMatch){
        var line_values = line.split('|');
        var vals = formularyCols.map(function(col){ return line_values[col]; });
        formularyRecords.push(vals);
        if(formularyRecords.length === 10000){
            formluaryTargetStream.write(getBulkInsert(formularyRecords));
            formularyRecords = [];
        }
    }
});

// end stream on read completion
formularyReader.on('close', function(){
    formluaryTargetStream.write(getBulkInsert(formularyRecords));
    formularyRecords = [];
});