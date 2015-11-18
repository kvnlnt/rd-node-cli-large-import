module.exports = {

   filter: {
      productList:[
         "Activella",
         "Victoza",
         "Levemir",
         "Vagifem",
         "Novo", 
         "Norditropin"
      ]
   },

   filesToProcess:[
      "FORMULARY EXTRACT.TXT"
   ],

   schema: {  
      "FF IMS HIERARCHY.TXT":[  
         "FF PLAN ID",
         "FF PLAN NAME",
         "FF PLAN TYPE",
         "IMS PAYER/PLAN ID",
         "IMS PLAN NAME",
         "IMS PAYER ID",
         "IMS PAYER NAME",
         "FF PROVIDER-TYPE ID",
         "FF PROVIDER-TYPE NAME",
         "FF PROVIDER ID",
         "FF PROVIDER NAME",
         "NNI ID",
         "NNI NAME"
      ],
      "FF WK HIERARCHY.TXT":[  
         "FF PLAN ID",
         "FF PLAN NAME",
         "FF PLAN TYPE",
         "WK PLAN ID",
         "WK PLAN NAME",
         "FF PROVIDER-TYPE ID",
         "FF PROVIDER-TYPE NAME",
         "FF PROVIDER ID",
         "FF PROVIDER NAME",
         "NNI ID",
         "NNI NAME"
      ],
      "FORMULARY EXTRACT.TXT":[  
         "FF PLAN ID",
         "FF PLAN NAME",
         "PROVIDER ID",
         "PROVIDER NAME",
         "PARENT ID",
         "PARENT NAME",
         "PLAN TYPE",
         "STATE(S) OF OPERATION",
         "PREFERRED BRAND TIER",
         "DRUG ID",
         "DRUG NAME",
         "TIER",
         "COPAY RANGE",
         "COINSURANCE",
         "PA",
         "QL",
         "ST",
         "OR",
         "REASON CODE",
         "RESTRICTION DETAIL"
      ],
      "CONTROL.TXT":[  
         "FILE NAME",
         "RECORD COUNT",
         "CREATED AT (TIME STAMP)",
         "CHECKSUM FILE"
      ],
      "PBM DATA.TXT":[  
         "PLAN_ID",
         "PLAN_NAME",
         "PBM_ID",
         "PBM_NAME",
         "PBM_FUNCTION_ID",
         "PBM_FUNCTION_NAME"
      ],
      "TIER NOMENCLATURE.TXT":[  
         "FF PLAN ID",
         "FF PRODUCT ID",
         "STATUS",
         "MATERIAL RESTRICTION",
         "CLASS NOMENCLATURE",
         "CLASS PRODUCTS",
         "CLASS PRODUCTS ON FORMULARY",
         "SUBCLASS NAME",
         "SUBCLASS NOMENCLATURE",
         "SUBCLASS PRODUCTS",
         "SUBCLASS PRODUCTS ON FORMULARY",
         "PA",
         "QL",
         "ST",
         "OR",
         "REASON CODE",
         "RESTRICTION DETAIL",
         "COPAY RANGE"
      ],
      "ZIP LEVEL LIVES.TXT":[  
         "FF PLAN ID",
         "ZIP CODE",
         "ZIP CODE LIVES"
      ]
   }
   
};

