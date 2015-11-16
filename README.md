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
The current stable/working schema of the exports should always be maintained in config.js. The config contains a list of the export files, their column names and descriptions. This configuration is used as the comparator for new data sets to be analyzed.

## Analyze
To analyze a new set of provided data, save all export files to a folder in `data`  and run:
    
    node app

type in the path to the folder. Example `data/newdataset`. A console output will be produced that will:

* Checks to see if the export file set differs in any way to the current set defined in config.js
* Checks to see if any of the column names in the files have changed compared to those defined in config.js
* Output the final schema

Column names are currently defined in a word doc in the `docs` folder.