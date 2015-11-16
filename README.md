# Importer
The formulary tool relies on third party data provided as a series of text files. These text files do not necessarily represent the data format needed by the formulary tool. Therefore this tool has two main objectives:
1. Analyze the structure and content of formulary export files
2. Provide an easily customizable migration script generator

Objective 1 is to help track changes to these exports as time moves on. Objective 2 is to help modify the migration scripts generatated in reaction to changes in 1.

## How it works
The current schema of the exports should always be maintained in config.js. The config contains a list of the export files, their column names and descriptions. This configuration is used as the comparator for data sets to be analyzed against.

## Running the App
    node app

### Schema
Analyze schema

### Unique Columns
Analyze columns
