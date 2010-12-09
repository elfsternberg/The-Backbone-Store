/*
    Copyright © 2008
    Rob Manson <roBman@MobileOnlineBusiness.com.au>, 
    Sean McCarthy <sean@MobileOnlineBusiness.com.au> 
    and http://SOAPjr.org

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
 
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.


    Acknoweldgements
    ----------------
    This jQuery plugin utilises and requires the JSONSchema Validator
    which is created by and Copyright (c) 2007 Kris Zyp SitePen (www.sitepen.com)
    Licensed under the MIT (MIT-LICENSE.txt) licence.

    JSONSchema Validator - Validates JavaScript objects using JSON Schemas 
    - http://jsonschema.googlecode.com/files/jsonschema-b2.js
      (but check for the latest release)

    For more information visit:
    - http://www.json.com/json-schema-proposal/
    - http://code.google.com/p/jsonschema/



    Revision history
    ----------------
    v1.0.1  - 4 Dec 2008
    - Extended $.getValidJSON(params) API so you can define 
      { schema : { send : xxx, receive : zzz } } so you can 
      optionally validate data on the way out and on the way in.
    - Added tests to ensure that the schema key defined does really 
      exist as a typeof "object" in validJSONSchemas.

    v1.0.0  - 3 Dec 2008
    - initial release


    Support
    -------
    For support, suggestions or general discussion please visit the #SOAPjr irc
    channel on freenode.net or visit http://SOAPjr.org 


    Implementation overview
    -----------------------
    NOTE:   This work contributes to the SOAPjr Data Model Definition project
            that is designed to encourage the adoption and use of common JSON
            data models with common SOAPjr APIs.

            See http://soapjr.org/specs.html#dmd for more information

    1.  Include the jquery.js, jsonschema-b2.js and jquery.ValidJSON.js src files
        into your html page - optionally include the jquery.SOAPjr.js plugin too

    2.  Add a call to the $(document).ready(function() { ... }) block to load
        the relevant JSON Schema definition files you require

        e.g.
                - http://soapjr.org/schemas/SOAPjr_request
                - see http://json-schema.org/shared.html for common formats

    3.  Get the JSON files/objects you require using the $.getValidJSON() API

    4.  Check the "result.valid" boolean and "result.errors" array for any
        validation errors and if all is good then use "json" like normal.

    5.  Sleep well knowing your data is cleanly validated and conforms to your
        chosen schema.


    Code usage examples
    -------------------
    1. Include src files

        <script type="text/javascript" src="jquery-1.2.6.js"></script>
        <script type="text/javascript" src="jsonschema-b2.js"></script>
        <script type="text/javascript" src="jquery.ValidJSON.js"></script>


    2. Add calls to load schema files

        <script type="text/javascript">
        $(document).ready(function() {
            //load them from a URL
            $.getValidJSONSchemas({
                //id          //url
                "card"      : "http://json-schema.org/card",
                "calendar"  : "http://json-schema.org/calendar"
            });

            //import them from a local var
            $.setValidJSONSchemas({
                //id          //pre-populated vars (possibly included in .js files)
                "geo"       : geoschema_var,
                "address"   : addressschema_var
            });
        });
        </script> 

        NOTE: cross-domain xhr restrictions apply - look at JSONP for cross domain requests


    3. Get the JSON files/objects

        <script type="text/javascript">
        function do_your_stuff() {
            //collect data from a form or setup a stub
            var params = { ... };

            //get your data and validate it in one call
            var xhr = $.getValidJSON({
                "url"           : url,                                              //required
                "data"          : params,                                           //optional
                "callback"      : "my_callback",                                    //required (see point 4 below)
                "schema"        : { "send":"schema_id1", "receive":"schema_id2" }   //optional - can be defined within the response JSON object using $schema
            });
        }
        </script>


    4. Check the validation results/errors

        <script type="text/javascript">
        //setup your callback to handle the json data and any validation errors
        function my_callback(result, json) {
            if (result.valid) {
                //json contains a valid XXX data object
            } else {
                for (var e in result.errors) {
                    //e.property tells you which value is invalid
                    //e.message is a human readable error message
                }
            }
        }
        </script>


    5. Relax
        
        This plugin will let you do field level schema based validation.
        You can also connect this to your form validation for standardised form data.
        And you can use it in combination with the SOAPjr plugin to make sure
        your apps handle metadata and complex/multiple errors seamlessly.

        Isn't technology great! 8)

*/

//very weak example location script 8) for instant gratification
//javascript:function f(j, v) { alert(v.valid+" : "+v.errors[0].message) };$.getValidJSON({ "url":"test.json", "data":{"longitude":333, "latitude":123},"callback":"f", "schema": {"send":"geothingy","receive":"geothingy"}});void(0)

var validJSONSchemas = {};

// Example simple JSON Schema - see http://json-schema.org/geo for latest version
var  geoschema =  {
    "description":"A geographical coordinate",
    "type":"object",
    "properties":{
        "latitude":{"type":"number"},
        "longitude":{"type":"number"}
    }
};


jQuery.setValidJSONSchemas = function(input) {
    for (var id in input) {
        if (typeof input[id] == "object") {
            validJSONSchemas[id] = input[id];
        }
    }
}

jQuery.getValidJSONSchemas = function(input) {
    for (var id in input) {
        var url         = input[id];
        if (!url) {
            throw("Not even a URL or filename was supplied!");
        }
        var xhr = $.ajax({
            "url"       : url,
            "complete"  : gotValidJSONSchema
        });
        xhr.getValidJSONSchemasConfig = {
            "id"    : id,
            "url"   : input[id]
        };
    }
}

function gotValidJSONSchema(xhr, status) {
    var json = eval("("+xhr.responseText+")");
    if (xhr.getValidJSONSchemasConfig != null) {
        if (xhr.getValidJSONSchemasConfig.id) {
            //this assumes one schema per json returned
            var id = xhr.getValidJSONSchemasConfig.id;
            var tmp = {};
            tmp[id] = json;
            $.setValidJSONSchemas(tmp);
        }
    } else {
        throw("No config data available for this schema");
    }
}

jQuery.getValidJSON = function(input) {  //url, data, callback and schema
    //TODO: add a queue for xhr's
    //var req         = new Date().valueOf();

    var url         = input.url;
    if (!url) {
        throw("Not even a URL or filename was supplied!");
    }
    var data        = input.data || null;
    var callback    = input.callback;
    if (!callback) {
        throw("No callback provided");
    }
    var schema      = input.schema || null;

    var config      = { 
        "callback"  : callback,
        "schema"    : schema
    }

    if (schema.send && data) {
        if (typeof validJSONSchemas[schema.send] == "object") {
            var result = JSONSchema.validate(data, validJSONSchemas[schema.send]);
            if (!result.valid) {
                var errors = [];
                for (var e in result.errors) {
                    var tmp = result.errors[e].property+" : "+result.errors[e].message;
                    errors.push(tmp);
                }
                throw(errors.join(", \n"));
            }
        } else {
            throw("Invalid send schema defined - "+schema.send);
        }
    }

    if (schema.receive && typeof validJSONSchemas[schema.receive] != "object") {
        throw("Invalid receive schema defined - "+schema.receive);
    }

    var ajax_options = {
        "url"       : url, 
        "complete"  : gotValidJSON,
    };
    if (data) {
        ajax_options.data = data;
    }
        
    var xhr = $.ajax(ajax_options);

    xhr.getValidJSONConfig = config;
    return xhr;
};

function gotValidJSON (xhr, status) {
    var json = eval("("+xhr.responseText+")");
    if (xhr.getValidJSONConfig != null) {
        if (xhr.getValidJSONConfig.schema.receive) {
            var valid = JSONSchema.validate(json, validJSONSchemas[xhr.getValidJSONConfig.schema.receive]);
        } else {
            var valid = JSONSchema.validate(json);
        }
        eval(xhr.getValidJSONConfig.callback+"(json,valid)");
    } else {
        throw("No data object was attached to the json response so no callback could be found");
    }
}
