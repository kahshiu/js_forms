// ### form element manipulators
// @return (string): pseudo key for grouping elements (element.type)
function writeKey (el) {
    var tag      = el.tagName.toLowerCase();
    var type     = (tag === "input"? el.type: "");
    var multiple = (tag === "select" && el.multiple? "multiple": "");

    var k = [tag];
    if(type.length>0)     k.push(type);
    if(multiple.length>0) k.push(multiple);
    return k.join("."); 
}
// @return (string): pseudo key for grouping elements (name)
function writeName (el) {
    var name = el.name || "base";
    return name;
}
// @return (string): pseudo key base (element.type.name)
function writeNameKey (el) {
    return writeName(el)+"."+writeKey(el);
}
// filter input elements from form
// ```
// @name: elFilterInputs
// @params (htmlelement): form element input
// ```
function elFilterInputs (formEl) {
    formEl = formEl || document;
    var selector = [
        'textarea'
        ,'select'
        ,'input[type=text]'
        ,'input[type=hidden]'
        ,'input[type=password]'
        ,'input[type=radio]'
        ,'input[type=checkbox]'
    ]
    var nodelist = formEl.querySelectorAll(selector.join(","));
    return nodelist;
}
//
// helper function: for validation function, extracts values into result
function elsMapExtractor (els,fn,result) {
    var result = result || [];
    for(var i=0; i<els.length; i++) {
        var el = els[i];
        if( fn(el,result) ) break;
    }
    return result;
}
//
// helper function: apply fnApply to targetname's subgroups (eg. input.checkbox, input.radiobox, input.textbox) when fulfils targetgroup
// ```
// @params targetname (string): name of targeted form element
// @params targetgroup (string): function(array of elements, key)
// @params fnApply (string): function(element, key, array of elements)
// ```
function applyEachGroup(targetname,targetgroup,fnApply) {
    targetgroup = targetgroup || function () {return true;}
    if(targetname) {
        var g = elsGroup(document.getElementsByName(targetname),writeKey);
        for(var k in g) {
            if(targetgroup.call(this,g[k],k)) elsEach(g[k],fnApply,this);
        }
    }
}
// ### A breakdown of api for getting/ setting inputs 
// getting/ setting grouped interfaces
// @params groups (object): items groupby writekey, or outputs that abide to that key formatting
// @params fnFilter (function): function to filter individual elements
function getValueByGroup (groups,fnFilter) {
    var getters = function (type) {
        var fn = fnFilter || function(el) { return true; };
        var target;
        switch(type) {
        case "textarea"       : target = function (el,vals) { if(fn(el)) vals.push(el.value); }; break; 
        case "input.text"     : target = function (el,vals) { if(fn(el)) vals.push(el.value); }; break; 
        case "input.hidden"   : target = function (el,vals) { if(fn(el)) vals.push(el.value); }; break; 
        case "input.password" : target = function (el,vals) { if(fn(el)) vals.push(el.value); }; break; 
        case "input.radio"    : target = function (el,vals) { if(fn(el) && el.checked) vals.push(el.value); return vals.length>0;}; break; 
        case "input.checkbox" : target = function (el,vals) { if(fn(el) && el.checked) vals.push(el.value); }; break; 
        case "select"         : target = function (el,vals) { if(fn(el) && el.selected) vals.push(el.value); return vals.length>0;}; break; 
        case "select.multiple": target = function (el,vals) { if(fn(el) && el.selected) vals.push(el.value); }; break; 
        case "input.reset"    : target = function (el,vals) {}; break; 
        case "input.submit"   : target = function (el,vals) {}; break; 
        case "input.button"   : target = function (el,vals) {}; break; 
        case "button"         : target = function (el,vals) {}; break; 
        }
        return target;
    }; 
    var result = {};
    var fnTemp,arrTemp;

    for(var g in groups) {
        fnTemp = getters(g);

        // different handling of select element because its options are targeted
        if( fnTemp.constructor===Function ) {
            if(g==="select" || g==="select.multiple") {
                for(var i=0; i<groups[g].length; i++) {
                    var target = groups[g][i];
                    arrTemp = elsMapExtractor(target.options, fnTemp);
                }
            } else {
                arrTemp = elsMapExtractor(groups[g], fnTemp);
            }
            result[g] = arrTemp;
        }
    }
    return result;
}
function setValueByGroup (values,groups,fnFilter) {
    var setters = function (type) {
        var fn = fnFilter || function(el) { return true; };
        var target;
        switch(type) {
            case "textarea"       : target = function (el,vals) { var val = vals.shift(); if(val && fn(el)) el.value = val; }; break;
            case "input.text"     : target = function (el,vals) { var val = vals.shift(); if(val && fn(el)) el.value = val; }; break;
            case "input.hidden"   : target = function (el,vals) { var val = vals.shift(); if(val && fn(el)) el.value = val; }; break;
            case "input.password" : target = function (el,vals) { var val = vals.shift(); if(val && fn(el)) el.value = val; }; break;
            case "input.radio"    : target = function (el,vals) { var idx = vals.indexOf(el.value); if(idx>-1){ vals.splice(idx,1); }; if(fn(el)) el.checked  = idx>-1; return idx>-1;}; break;
            case "input.checkbox" : target = function (el,vals) { var idx = vals.indexOf(el.value); if(idx>-1){ vals.splice(idx,1); }; if(fn(el)) el.checked  = idx>-1;}; break;
            case "select"         : target = function (el,vals) { var idx = vals.indexOf(el.value); if(idx>-1){ vals.splice(idx,1); }; if(fn(el)) el.selected = idx>-1; return idx>-1;}; break;
            case "select.multiple": target = function (el,vals) { var idx = vals.indexOf(el.value); if(idx>-1){ vals.splice(idx,1); }; if(fn(el)) el.selected = idx>-1;}; break;
            case "input.reset"    : target = function (el,vals) {}; break;
            case "input.submit"   : target = function (el,vals) {}; break;
            case "input.button"   : target = function (el,vals) {}; break;
            case "button"         : target = function (el,vals) {}; break;
        }
        return target;
    }; 
    var result = true;
    var fnTemp,arrTemp;

    for(var g in groups) {
        fnTemp = setters(g);
        if( fnTemp.constructor===Function && values.hasOwnProperty(g) ) {
            if(g==="select" || g==="select.multiple") {
                for(var i=0; i<groups[g].length; i++) {
                    var target = groups[g][i];
                    arrTemp = elsMapExtractor(target.options, fnTemp, values[g].slice(0));
                }
            } else {
                arrTemp = elsMapExtractor(groups[g], fnTemp, values[g].slice(0));
            }
        }
        result = result 
            && arrTemp.constructor === Array 
            && arrTemp.length==0; 
    }
    return result;
}
// getter/ setter by nodelist
// objects with only ONE key hoisted out of its object shell
function simplifyObj(obj) {
    var olen = Object.keys(obj);
    return olen>1? obj: obj[olen[0]]; 
}
function getValueByNodelist(nodelist,fnFilter,isSimplified) {
    var temp = nodelist.length>0? getValueByGroup( elsGroup(nodelist,writeKey), fnFilter ): null;
    isSimplified = isSimplified !== undefined? isSimplified: true;
    return isSimplified? simplifyObj(temp): temp;
}
function setValueByNodelist(values,nodelist,fnFilter) {
    var group, gKey;
    var temp = {};
    var result = null;

    if(!values || !nodelist) return result;

    group = elsGroup(nodelist,writeKey);
    gKey = Object.keys(group);

    // patching of alternate parameter
    if(values.constructor===String && gKey.length==1) {
        temp[ gKey[0] ] = values.split(",");

    } else if(values.constructor===Array && gKey.length==1) {
        temp[ gKey[0] ] = values;

    } else if(values.constructor===Object){
        temp = values;

    } else {
        // proper error handling
        throw "Invalid parameter"
    }

    result = setValueByGroup(temp,group,fnFilter);
    return result;
}
// getter/ setter by form input name
function getValueByName(name,fnFilter,isSimplified) {
    return getValueByNodelist(document.getElementsByName(name),fnFilter,isSimplified);
}
function setValueByName(values,name,fnFilter,isSimplified) {
    return setValueByNodelist(values,document.getElementsByName(name),fnFilter,isSimplified);
}
// getter/ setter by form element
function getValuesByForm(formEl,fnFilter,isSimplified) {
    var nodelistGroup = elsGroup( elFilterInputs(formEl),writeName ); 
    var result = {};
    for(var n in nodelistGroup) {
        result[n] = getValueByNodelist(nodelistGroup[n],fnFilter,isSimplified);
    }
    return result; 
}
function setValuesByForm(values,formEl,fnFilter) {
    var nodelistGroup = elsGroup( elFilterInputs(formEl),writeName ); 
    var temp = {};
    for(var k in nodelistGroup) {
        temp[k] = setValueByNodelist(values[k],nodelistGroup[k],fnFilter);
    }
    return temp;
}   
function validateByForm(formEl,fnFilter) {
    var isCustomInput = function (el) {
        var tags = ["my-select","my-textbox","my-checkbox-radio"]
        return tags.indexOf( el.getAttribute("is") )>-1;
    }
    var isFinalValid=true, temp, inputs=elFilterInputs(formEl);
    for(var i=0;i<inputs.length;i++) {
        if( isCustomInput(inputs[i]) ) {
            temp = inputs[i].validate();
            isFinalValid = isFinalValid&&temp.isValid;
        }
        if(!isFinalValid) break;
    }
    return isFinalValid;
}
// ### formatting object
function Formatter (source) {
    this.source = undefined; 
    this.data = undefined;
    this.datamask = undefined;
    this.datastring = undefined;
    this.isValid = true;

    if(source.constructor===String) this.source=source;
} 
//```
// search for 1st matching regex to format source
// @params source (string): source
// @params regex: regex obj
// @params replace: replacement fn for regex terms
// @params etc: will alternate between regex,replace. eg
// @returns (array): array of matched [regex,replace];
//```
Formatter.prototype.formatMatched = function (source/*alternate: regex1,fn1,regex2,fn2*/) {
    var re,fn,matched,result;
    for(var i=1;i<arguments.length;i=i+2) {
        re = arguments[i+0];
        fn = arguments[i+1];

        matched = re.test(source);
        if(matched) {
            result = [];
            result.push(re,fn);
            break;
        }
    }
    return result;
}
//```
// search for 1st matching regex to format source
// @params source (string): source
// @params regex: regex obj
// @params replace: replacement fn for regex terms
// @params etc: will alternate between regex,replace. eg
// @returns (string): formatted text, based on replace
//```
Formatter.prototype.formatText = function (source/*alternate: regex1,fn1,regex2,fn2*/) {
    var re,fn,matched,result;
    for(var i=1;i<arguments.length;i=i+2) {
        re = arguments[i+0];
        fn = arguments[i+1];

        matched = re.test(source);
        if(matched) {
            result = source.replace(re,fn);
            break;
        }
    }
    return result;
}
// source is run through pipeline, value output from each stage is saved 
Formatter.prototype.pipeline = function (datatype) {
    var sourceTemp=this.source, temp1, temp2, isValidSource;

    if(!Formatter.presets.hasOwnProperty(datatype)) return false;
    // stage: sanitise source, sourceTemp saved
    if(Formatter.presets[datatype]["sanitiseSource"] && sourceTemp) {
        sourceTemp = Formatter.presets[datatype]["sanitiseSource"](sourceTemp);
    }
    // stage: shorthands expanded, sourceTemp overwritten
    if(Formatter.presets[datatype]["abbrevs"] && sourceTemp) {
        temp1 = Formatter.presets[datatype]["abbrevs"].slice(0);
        temp1.unshift(sourceTemp);
        temp2 = this.formatMatched.apply(this,temp1);
        if(temp2) {
            temp2.unshift(sourceTemp);
            sourceTemp = this.formatText.apply(this,temp2);
        }
    }
    // stage: validate source, this.isValid flagged 
    isValidSource = true;
    if(Formatter.presets[datatype]["validateSource"]) {
        isValidSource = Formatter.presets[datatype]["validateSource"](sourceTemp);
    }
    this.isValid = (this.source==="" || isValidSource);

    // stage: data conversion, this.data saved
    this.data = isValidSource? sourceTemp: undefined;
    if(Formatter.presets[datatype]["convertData"] && this.data) {
        this.data = Formatter.presets[datatype]["convertData"](this.data,sourceTemp);
    }
    // stage: data string form (for html attribute string storing), this.datastring saved
    this.datastring = this.data;
    if(Formatter.presets[datatype]["stringifyData"] && this.data) {
        this.datastring = Formatter.presets[datatype]["stringifyData"](this.data,sourceTemp);
    }
    // stage: data masking, this.datamask saved
    this.datamask = this.data;
    if(Formatter.presets[datatype]["maskData"] && this.data) {
        this.datamask = Formatter.presets[datatype]["maskData"] (this.data,sourceTemp);
    }
    return true;
}
// ### preset formats
Formatter.presets = {};
// preset text
Formatter.presets.text = {
}
// preset date text
Formatter.presets.date = {
    abbrevs: 
        [/^(\d{2})$/                                ,function(match,a1,offset,fullstring      ){ var d = new Date(); a2 = d.getMonth()+1; a3 = d.getFullYear(); return [pad0(a1,2),pad0(a2,2),a3].join("/"); }
        ,/^(\d{2})[\/\-\s]?(\d{2})$/                ,function(match,a1,a2,offset,fullstring   ){ var d = new Date(); a3 = d.getFullYear();                      return [pad0(a1,2),pad0(a2,2),a3].join("/"); }
        ,/^(\d{2})[\/\-\s]?(\d{2})[\/\-\s]?(\d{2})$/,function(match,a1,a2,a3,offset,fullstring){ var d = new Date(); a3 = "20"+a3.toString();                   return [pad0(a1,2),pad0(a2,2),a3].join("/"); }
        ,/^(\d{2})[\/\-\s]?(\d{2})[\/\-\s]?(\d{4})$/,function(match,a1,a2,a3,offset,fullstring){ var d = new Date();                                            return [pad0(a1,2),pad0(a2,2),a3].join("/"); }
        ],
    validateSource: function(source) {
        var temp, result;
        result = /^(\d{2})\/(\d{2})\/(\d{4})$/.test(source);
        if(!result) return result;

        temp = source.split("/");
        result = isValidDate(temp[0],temp[1],temp[2]);
        return result;
    },
    convertData: function (data,source) {
        temp = data.split("/");
        return new Date(temp[2],temp[1]-1,temp[0]); 
    },
    stringifyData: function (data,source) {
        return data.getTime();
    },
    maskData: function (data,source) {
        return source; 
    }
}
// preset money text
Formatter.presets.money = {
    sanitiseSource: function(source) {
        //money demasking
        return source.replace(/[\s\,]/gi,"");
    },
    validateSource: function(source) {
        return /^[1234567890\.]+$/.test(source);
    },
    convertData: function (data,source) {
        return Number(data);
    },
    maskData: function (data,source) {
        var re = /^(\d{0,})?[\.]?(\d{0,})$/;
        var fn = function(match,a1,a2,offset,fullstring){ return [moneyDelim(a1? Number(a1): 0),a2? pad0(a2,2,"post"):"00"].join(".")};
        return source.replace(re,fn); 
    }
}
// preset ic text
Formatter.presets.ic = {
    abbrevs: [ /^(\d{6})[\s\-]?(\d{2})[\s\-]?(\d{4})$/,function(match,a1,a2,a3,offset,fullstring){ return [a1,a2,a3].join("-"); } 
    ],
    validateSource: function(source) {
        var result;
        result = /^(\d{6})[\s\-](\d{2})[\s\-](\d{4})$/.test(source);
        return result;
    },
}
// preset phone text
Formatter.presets.phone = {
    abbrevs: [ /^(0[18]\d|0[2345679])[\s\-]?(\d{6,})/,function(match,a1,a2){ return [a1,a2].join("-")} 
    ],
    validateSource: function(source) {
        var result;
        result = /^(0[18]\d|0[2345679])[\s\-]?(\d{6,})/.test(source);
        return result;
    },
}
// ### validation object
function Validate () {
    this.iargcount=4
    this.fns = [];
}
// validation: push custom rule
Validate.prototype.push = function (fnRule,fnMsg,fnParams,fnFilter) {
    fnRule   = fnRule   || function (value,params) { return true; }
    fnMsg    = fnMsg    || function (value,params) { return "Data failed validation"; }
    fnFilter = fnFilter || function (value,params,result) { return value!==typeof Undefined && result; }

    //number in a set => this.iargcount 
    this.fns.push(fnRule,fnMsg,fnParams,fnFilter);
}
// validation: unshift custom rule
Validate.prototype.unshift = function (fnRule,fnMsg,fnParams,fnFilter) {
    fnRule   = fnRule   || function (value,params) { return true; }
    fnMsg    = fnMsg    || function (value,params) { return "Data failed validation"; }
    fnFilter = fnFilter || function (value,params,result) { return value!==typeof Undefined && result; }

    //number in a set => this.iargcount 
    this.fns.unshift(fnRule,fnMsg,fnParams,fnFilter);
}
// validation: push preset rule
Validate.prototype.pushPreset = function (rulename,fnParams,fnFilter) {
    if( Validate.presets.hasOwnProperty(rulename) ) {
        this.push(
            Validate.presets[rulename]["evaluator"]
            ,Validate.presets[rulename]["msg"]
            ,fnParams || Validate.presets[rulename]["params"] 
            ,fnFilter || Validate.presets[rulename]["filter"]  );
    }
}
// validation: push all rules  
// arguments: arrays of signature 
// [fnRule,fnMsg,fnParams,fnFilter] ==> push OR 
// [rulename    ,fnParams,fnFilter] ==> pushPreset
Validate.prototype.pushAll = function () {
    elsEach(arguments,function(arg){
        var param1 = arg[0];
        if(param1.constructor===String) {
            this.pushPreset.apply(this,arg);
        } else {
            this.push.apply(this,arg);
        }
    },this)
}
// validation: remove validation at specific point
Validate.prototype.removeAt = function(index) {
    //note: sequence sensitive
    return this.fns.splice(index*this.iargcount,this.iargcount).length>0;
}
// validation: remove all validation rules
Validate.prototype.removeAll = function () {
    this.fns = [];
}
// ```
// base validation evaluator:
// @params context    (obj/ htmlelement): context of element
// @params value      (obj/ htmlelement): value to validate againt
// @params baseResult (obj/ htmlelement): result obj to integrate into
// ```
Validate.prototype.eval = function(context,value,baseResult) {
    var iarg=0, fnRule, fnMsg, fnFilter, result=baseResult || {isValid: true, warnings:[]};

    while( (iarg+this.iargcount)<=this.fns.length ) {
        fnRule   = this.fns[iarg];
        fnMsg    = this.fns[iarg+1];
        fnParams = this.fns[iarg+2];
        fnFilter = this.fns[iarg+3];

        var params = fnParams? fnParams: {};
        params = params.constructor===Function? params.call(context,value): params; 

        var flag = fnRule.call(context,value,params);
        if(fnFilter.call(context,value,params,result.isValid) && !flag) {
            result.isValid = result.isValid && flag;
            result.warnings.push(fnMsg.call(context,value,params));
        }
        iarg=iarg+this.iargcount;
    }
    return result;
}
// validation run on html element
Validate.prototype.evalElement = function(el,value,datatype,baseResult) {
    var val = value || el.getValue() || el.dataString || el.value;

    var fmt = new Validate()
    fmt.pushAll(["dataFormat"]);
    baseResult = fmt.eval(el,val,baseResult);
    //console.log(baseResult.isValid,val,el.value)

    if(baseResult.isValid) {
        baseResult = this.eval(el,val,baseResult);
    }

    return baseResult;
}
// ### validation presets
Validate.presets = {};

// rule: required field
Validate.presets.required = {
    evaluator: function (value,params) {
        return this.value.length>0;
    },
    msg: function(value,params) {
        var temp = "{name} is required."
                    .replace("{name}",this.name || this.id || "Item")
        return temp;
    },
    filter: function(value,params,result) {
        return result && true;
    }
}
// rule: format data according to input data-type
Validate.presets.dataFormat = {
    evaluator: function (value,params) {
        return !(this.hasAttribute("data-valid") && this.getAttribute("data-valid") === "false");
    }, 
    msg: function(value,params) {
        dt = this.hasAttribute("data-type") && this.getAttribute("data-type").length>0? this.getAttribute("data-type"): "data";
        var temp = "Invalid {datatype} format."
                    .replace("{datatype}",dt);
        return temp;
    },
    filter: function(value,params,result) {
        return result && true;
    }
}
// rule: min/ max length, applies to radios (array length)/ checkboxes(array length)/ select(array length)/ textbox (string length)
// params.len: length of array/ length of string
Validate.presets.minLen = {
    evaluator: function (value,params) {
        params.len = params.len || 0;
        return value.length>=params.len; //logic to follow that of array.slice
    },
    msg: function(value,params) {
        var temp = "Length of {name} at least {len}."
                    .replace("{name}",this.name || this.id || "Item")
                    .replace("{len}",params.len);
        return temp;
    }
}
Validate.presets.maxLen = {
    evaluator: function (value,params) {
        params.len = params.len || -1;
        return params.len == -1 || value.length<params.len; //logic to follow that of array.slice
    }, 
    msg: function(value,params) {
        var temp = "Length of {name} must not be more than {len}."
                    .replace("{name}",this.name || this.id || "Item")
                    .replace("{len}",params.len-1);
        return temp;
    }
}
// rule: min/ max date
// params.target = js Date object
// todo: max date
Validate.presets.minDate = {
    evaluator: function (value,params) {
        var result = true;
        if(!params.hasOwnProperty("target")) return result;

        result = (value.constructor===Date && params.target.constructor===Date)? value.getTime()>params.target.getTime(): true;
        return result;
    },
    msg: function(value,params) {
        var temp = "{name} must be later than {dt}."
                    .replace("{name}",this.name || this.id || "Date")
                    .replace("{dt}",dateFormat(value));
        return temp;
    }
}
// rule: min/ max number (applies to $$ values)
// params.target = js Date object
// todo: max date
Validate.presets.minNum = {
    evaluator: function (value,params) {
        params.target = params.target || 0;
        return value>=params.target;
    },
    msg: function(value,params) {
        var temp = "{name} must be more than {min}."
                    .replace("{name}",this.name || this.id || "Number")
                    .replace("{min}",params.target);
        return temp;
    }
}
