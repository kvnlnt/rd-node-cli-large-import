var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/db.sqlite');

var str = "INSERT INTO FORMULARY_EXTRACT (`FF_PLAN_ID`, `FF_PLAN_NAME`, `PROVIDER_ID`, `PROVIDER_NAME`, `PARENT_ID`, `PARENT_NAME`, `PLAN_TYPE`, `STATE_S__OF_OPERATION`, `PREFERRED_BRAND_TIER`, `DRUG_ID`, `DRUG_NAME`, `TIER`, `COPAY_RANGE`, `COINSURANCE`, `PA`, `QL`, `ST`, `OR`, `REASON_CODE`, `RESTRICTION_DETAIL`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

console.log(str);

var vals = ['FF_PLAN_ID', 'FF_PLAN_NAME', 'PROVIDER_ID', 'PROVIDER_NAME', 'PARENT_ID', 'PARENT_NAME', 'PLAN_TYPE', 'STATE_S__OF_OPERATION', 'PREFERRED_BRAND_TIER', 'DRUG_ID', 'DRUG_NAME', 'TIER', 'COPAY_RANGE', 'COINSURANCE', 'PA', 'QL', 'ST', 'OR', 'REASON_CODE', 'RESTRICTION_DETAIL'];

db.run(str, vals);