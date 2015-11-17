# Formulary Data Manager

## History
This is a second generation version of this tool. It was originally part of formulary.novonordisk.com which comprised an Importer (most closely related to this tool) and a Formulary API backed by a database. The Formulary API is used by a front end WEM tool called the Formulary Tool.

## New Plan
As of 11/2015 the front end Formulary Tool is now being re-invisioned. To support this new vision, the Formulary API will now be consolidated into `api.novonordisk.com`. The current Importer will be replaced with this data manager. 

## Objectives
The source of formulary data is provided by a third party company called Fingertip Formulary. The data provided is a series of pipe delimited flat files. This data needs to be parsed and produce SQL files which can be used to import the data into the test and production API database. It cannot be assumed the data will always have the same structure. Therefore this tool has two main objectives:

1. Analyze the structure and content of formulary export files
2. Provide an easily customizable migration script generator

## How it works
The current stable/working schema of the exports should always be maintained in config.js. Hopefully this has been constructed in a way to make it easier to make changes in the future.

The config contains a list of the export files and their column names as the assumed schema. This schema is used as the comparator for analyzing new data sets and for internal storage of the data.

The app is a command line tool and can be launched with:

    node app

It has two mode options:
1. Generate
2. Analyze

`Generate` generates migration scripts which are used to publish data to api.novonordisk.com. `Analyze` is a utility used to verify the structure of data sets against the current schema.

### Worfklow
The implied workflow here is that the Generator is the only tool needed to be run since it runs the Analyzer. However if and when data structures change in the future, the analyzer will fail. This will require changes to configuration and possibly code. Therefore when updating configuration, etc...use the Analyzer. This will help you "get it right" before running the Generator again. Once your updates are complete and the generator runs successfully, it's up to you to ensure that the output of the final migration scripts don't affect anything "upstream" in the api.novomedlink.com website. 

### Analyze
To analyze a new set of provided data, save all export files to a folder in `data`  and run:
    
    node app

Select the name of the folder you created. The Analyzer will:

* Check to see if the export file set differs in any way to the current set defined in config.js
* Checks to see if any of the column names in the files have changed compared to those defined in config.js
* Output the final schema

FYI: The original column names definitions are in a word doc in the `docs` folder. However, most are not that helpful.

### Generate
To generate a new set of migration scripts, save all export files to a folder in `data` and run:
    
    node app

Select the name of the folder you created. The Generator will:

* Run the Analyzer and quit if something is wrong
* Generate an internal sqlite database based on the schema of the data
* Populate the internal sqlite database (filtered for only products that apply, see config.js > filter)
* Select needed data from internal sqlite database and generate TSQL migration scripts for api.novomedlink.com. 

### Migration Scripts
The Generator tool saves migration scripts to the migrations folder with the same name as the folder name you selected. These scripts should be saved as a single TSQL script that can be used to import data in api.novomedlink.com. It's up to you to follow any conventions, etc set by the api.

### Internal Database
The internal database used by the Generator is stored in `data/db.sqlite`. It is overwritten with each successive import. You might need a sqlite client to do some troubleshooting (this works: http://sqlitebrowser.org/).

## Future Improvements
* Maintain list of meaningful column definitions
