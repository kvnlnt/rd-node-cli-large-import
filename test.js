var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/db.sqlite');

// var str = "INSERT INTO FORMULARY_EXTRACT (`FF_PLAN_ID`, `FF_PLAN_NAME`, `PROVIDER_ID`, `PROVIDER_NAME`, `PARENT_ID`, `PARENT_NAME`, `PLAN_TYPE`, `STATE_S__OF_OPERATION`, `PREFERRED_BRAND_TIER`, `DRUG_ID`, `DRUG_NAME`, `TIER`, `COPAY_RANGE`, `COINSURANCE`, `PA`, `QL`, `ST`, `OR`, `REASON_CODE`, `RESTRICTION_DETAIL`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

// console.log(str);

// var vals = ['FF_PLAN_ID', 'FF_PLAN_NAME', 'PROVIDER_ID', 'PROVIDER_NAME', 'PARENT_ID', 'PARENT_NAME', 'PLAN_TYPE', 'STATE_S__OF_OPERATION', 'PREFERRED_BRAND_TIER', 'DRUG_ID', 'DRUG_NAME', 'TIER', 'COPAY_RANGE', 'COINSURANCE', 'PA', 'QL', 'ST', 'OR', 'REASON_CODE', 'RESTRICTION_DETAIL'];

// db.run(str, vals);

db.run("INSERT INTO CONTROL ('FILE_NAME', 'RECORD_COUNT', 'CREATED_AT__TIME_STAMP_', 'CHECKSUM_FILE') VALUES ('File name','Record Count','Created At (Time Stamp)','Checksum file'), ('FF IMS Hierarchy.txt','42580','20150902-0752','d41d8cd98f00b204e9800998ecf8427e'), ('FF WK Hierarchy.txt','19118','20150902-0752','d41d8cd98f00b204e9800998ecf8427e'), ('Formulary Extract.txt','542489','20150902-0827','de27972ef2b158a5c5aa7d697a72132c'), ('Zip Level Lives.txt','9226890','20150902-0829','7c4f813f2fa715b9c1e6debf26ee7799'), ('pbm_data.txt','16616','20150902-0829','abc768b7ea465aca82a11b08c0c5e552'), ('Tier Nomenclature.txt','176473','20150902-0831','d41d8cd98f00b204e9800998ecf8427e')");