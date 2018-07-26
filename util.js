// string based utility functions
function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
// @example: camelCase("params-len","-") 
// expects "params-len" to "paramsLen"
function camelCase(str,delim) {
    delim = delim || "-";
    var arr = xtag.typeOf(str)=="string"? str.split(delim): str;
    for(var i=1;i<arr.length;i++) {
        arr[i] = capitalise(arr[i]);
    }
    return arr.join("");
}
// @example: pad0(new Date().getMonth(),2)
// expects "02","03","05","07","10","11" 
function pad0(num, size, pos) {
    pos = pos || "pre"
    var s = num+"";
    while (s.length < size) s = (pos=="pre"?"0":"") + s + (pos=="post"?"0":"");
    return s;
}
// @example: 
// moneyDelim(3000) expects "3,000"
// moneyDelim(2000000,2,".") expects "2.00.00.00"
function moneyDelim(num,digits,delim){
    num = num+"";
    digits = digits || 3;
    delim = delim || ",";
    var temp = num, target = [];
    while(temp.length>0) {
        target.unshift(temp.substr(-digits,digits));
        temp = temp.substring(0,temp.length-digits);
    }
    return target.join(delim);
}
// @example:
// truncDecimal (12.344,2) expects 12.34
// truncDecimal (12.645,0) expects 12
function truncDecimal (num,digits) {
    var re = new RegExp("(\\d+\\.\\d{"+digits+"})(\\d)")
    var m = num.toString().match(re);
    return m? parseFloat(m[1]): m.valueOf();
};
// total days in a month
//```
// @params m (int): month 
// @params y (int): year 
//```
function daysInMonth (m,y) {
    switch (m) {
        case 1:
            return (y%4==0 && y%100) || y%400==0? 29: 28;
        case 8: case 3: case 5: case 10:
            return 30;
        default:
            return 31;
    }
}
//stepping through months
function stepMonths (mm,d) {
    d = d || new Date();

    // problem: tail end of month (28,29,30,31), will set month jumping undesirably to next/ prev
    // example: Add 1 month to Jan30 (expects Feb30) will forward to March1 or March2
    // solution: Set to 1st of month, do month arithmatic, add back tail end
    var tail = d.getDate()-1;
    d.setDate(1);
    d.setMonth(d.getMonth()+mm);
    d.setDate(Math.min(
        1+tail
        ,daysInMonth(d.getMonth(),d.getFullYear())
    ))
    return d;
}
// @example: 
// dateAdd("mm",1,new Date(2018,6,31)) Fri Aug 31 2018 00:00:00 GMT+0800 (Malaysia Time)
// dateAdd("mm",-1,new Date(2018,6,31)) Sat Jun 30 2018 00:00:00 GMT+0800 (Malaysia Time)
function dateAdd (type,interval,dt) {
    dt = dt || new Date(yyyy,mm);
    var yyyyMonths = 12;
           if(type==="yyyy") { stepMonths(interval*yyyyMonths,dt);
    } else if(type==="mm"  ) { stepMonths(interval,dt);
    } else if(type==="dd"  ) { dt.setDate(interval+dt.getDate());
    }
    return dt;
}
// @example: compare dates by dt2-dt1
// dateCompare( new Date(2012,2,3), new Date(2013,2,3)) expects 1
// dateCompare( new Date(2016,2,3), new Date(2013,2,3)) expects -1
// dateCompare( new Date(2013,2,3), new Date(2013,2,3)) expects 0
function dateCompare (dt1,dt2) {
    return Math.min(1,Math.max(-1,dt2.getTime()-dt1.getTime()));
}
//```
// @params dt: js date object
// @params format (function): function(dd,mm,yyyy)
//```
function dateFormat(dt,format) {
    var a1 = dt.getDate();
    var a2 = dt.getMonth()+1; 
    var a3 = dt.getFullYear(); 

    format = format || function (a1,a2,a3) {
        return [pad0(a1,2),pad0(a2,2),a3].join("/");
    }
    return format(a1,a2,a3); 
}
// @example: check date validity
// @note: mm is 1-indexed as opposed to js 0-indexed
// isValidDate(30,2,2018) expects false
// isValidDate(28,2,2018) expects true
function isValidDate (d,m,y) {
    m = parseInt(m,10) - 1;
    return m>=0 && m<12 && d>0 && d<=daysInMonth(m, y);
}

// @example: turn objects to string
// stringifyObj({a:1,b:3},"=","&") expects "a=1&b=3"
function stringifyObj(obj,delimKVal,delimPair){
    obj = obj || {};
    delimKVal = delimKVal || "=";
    delimPair = delimPair || "&";
    var temp,target = [];
    for(var k in obj) {
        temp = k.toString()+delimKVal+obj[k].toString();
        target.push(temp);
    }
    return target.join(delimPair);
}
// @example: objectifyString("a=1&b=") expects {a: "1", b: ""}
function objectifyString(str,delimKVal,delimPair) {
    delimKVal = delimKVal || "=";
    delimPair = delimPair || "&";
    var temp = str.split(delimPair);
    var temp2;
    var result = {};
    for(var i=0;i<temp.length;i++) {
        var temp2 = temp[i].split(delimKVal);
        if(temp2.length>0 && temp2[0]) {
            result[temp2[0]] = temp2[1];
        }
    }
    return result;
}
// fires once after sufficiently long inactivity. usage: rate limiting keyboard events
function debounce(func, wait, immediate) {
	var timeout;
	return function(context) {
		var args = [];
        for(var i=1;i<arguments.length;i++) {
            args.push(arguments[i])
        }
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		}, wait);
		if (immediate && !timeout) func.apply(context, args);
	};
}
// simplified ajax call
function ajax(config,handler) {
    config = config || {};
    config.method = config.method || "GET";
    config.action = config.action || "";
    config.params = config.params || {};

    handler = handler || {};
    handler["ready"      ] = handler.hasOwnProperty("ready"      )? handler["ready"      ]: function (xhttp) {console.log(0,"ready")                    }
    handler["connected"  ] = handler.hasOwnProperty("connected"  )? handler["connected"  ]: function (xhttp) {console.log(1,"connecting remote server") }
    handler["responded"  ] = handler.hasOwnProperty("responded"  )? handler["responded"  ]: function (xhttp) {console.log(2,"remote server responded")  }
    handler["processing" ] = handler.hasOwnProperty("processing" )? handler["processing" ]: function (xhttp) {console.log(3,"remote server processing") }
    handler["success"    ] = handler.hasOwnProperty("success"    )? handler["success"    ]: function (xhttp) {console.log(4,xhttp.status,"success",xhttp.responseText)}
    handler["error"      ] = handler.hasOwnProperty("error"      )? handler["error"      ]: function (xhttp) {console.log(4,xhttp.status,"error")}

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function (evt) {
        if(this.readyState == 0)        { handler["ready"      ](evt.currentTarget);
        } else if(this.readyState == 1) { handler["connected"  ](evt.currentTarget);
        } else if(this.readyState == 2) { handler["responded"  ](evt.currentTarget);
        } else if(this.readyState == 3) { handler["processing" ](evt.currentTarget);
        } else if(this.readyState == 4) { 
            if(this.status == 200)        { handler["success"   ](evt.currentTarget);
            } else                        { handler["error"     ](evt.currentTarget);
            }
        }
    };
    var url,data,result = false;
    if(config.action.length>0) {
        if(config.method=="GET") {
            url = config.action + "?" + stringifyObj(config.params);
            data = null;
            xhttp.open(config.method,url,true);
            xhttp.send(data);
            result = true;
        } else if(config.method=="POST") {
            url = config.action + "?";
            data = stringifyObj(config.params);
            xhttp.open(config.method,url,true);
            xhttp.send(data);
            result = true;
        }
    }
    return result;
}


// list fns
// helper function to remove spacing in string and breakdown into array
function listSanitise(list,mark) {
    var re = new RegExp("\\s{0,}"+mark+"\\s{0,}","gi");
    var arr = list.length>0? list.replace(re,mark).split(mark): [];
    return arr;
}
// @examples:
//```
// var a = "test,test222";
// listAppend("test,test222","test222")
// a expected "test,test222,test222" 
//```
function listAppend (list,item,mark) {
    if(!mark) mark = ",";

    var arr = listSanitise(list,mark);
    arr.push(item);
    return arr.join(mark);
}
// @example:
//```
// var a = "test,test222";
// listAppendUnique("test,test222","test222")
// a expected "test,test222" 
// listAppendUnique("test,test222","test223")
// a expected "test,test222,test223" 
//```
function listAppendUnique(str,val,delim) {
    var uniq = function (arr,val) {
        var isUniq = true;
        var vstring = val.toString();
        for(var i=0; i<arr.length; i++){
            isUniq = (arr[i] !== vstring)
            if(!isUniq) break;
        }
        if(isUniq) {
            arr.push(val);
        }
    };
    return listAppend(str,val,delim,uniq);
}
// @example: 
//```
// var a = "test,test222";
// listRemove("test,test222","test222")
// a expected "test" 
//```
function listRemove (list,item,mark) {
    if(!mark) mark = ",";

    var idx,arr = listSanitise(list,mark);
    while( (idx = arr.indexOf(item)) >-1) {
        arr.splice(idx,1);
    }
    return arr.join(mark);
}
// @example: 
//```
// listHas("test,test222","test222") expects true
// listHas("test,test222","test223") expects false
//```
function listHas (list,item,mark) {
    if(!mark) mark = ",";

    return listSanitise(list,mark).indexOf(item)>-1;
}

// ### Looping through elements
// Iterator of elements. Applies a function (element,index,elements) signature
// onto each element, with reference to a certain context.
// ```
// @name: elsEach
// @param els (array,nodelist,namedNodelist): iterable indexed list of whatever 
// @param fn (function)                     : input function (element,index,elements)
// @param fnContext (obj)                   : context of 'this' within function
// @returns els (obj)                       : unaltered reference to params els
// @example:
// elsEach(document.getElementsByTagName("DIV"),function(el,index,els) {
//     el.className="hide";
// }) 
// ```
function elsEach (els,fn,fnContext) {
    var temp = [];
    for(var i=0;i<els.length;i++){
        var el = els[i];
        fn.call(fnContext,el,i,els);
        temp.push(el);
    }
    return temp;
}
// ```
// @name: elsMap
// @returns: new array with values mapped via fn through 
// ```
function elsMap (els,fn,fnContext) {
    var temp = [];
    for(var i=0;i<els.length;i++){
        var el = els[i];
        temp.push( fn.call(fnContext,el,i,els) );
    }
    return temp;
}
// ```
// @name: elsFilter
// @returns: new array with values filtered via fn
// ```
function elsFilter(els,fn,fnContext) {
    var temp = [];
    for(var i=0;i<els.length;i++){
        var el = els[i];
        var passed = fn.call(fnContext,el,i,els);
        if(passed) temp.push(el);
    }
    return temp;
}
// ```
// @name: elsGroup
// @returns: new object with keys of string and values of arrays. 
// As each element passes fn, fn outputs key for element and item added to object
// ```
function elsGroup(els,fn,fnContext) {
    var temp = {};
    for(var i=0;i<els.length;i++){
        var el = els[i];
        var key = fn.call(fnContext,el,i,els);
        if(!temp.hasOwnProperty(key)) temp[key] = [];
        temp[key].push(el);
    }
    return temp;
}

// ### element functions
// Functions to work on HTML element only.
// First parameter of function always HTML element.
//
// Check if element is of specified details
// ```
// @name: elIs
// @params el (htmlelement): html element queried 
// @params specs (obj/ fn that returns obj): object with keys of method, attributes, keys are
// values corresponding to its key
// @example:
// elIs(document.getElementById("t"),{className: "s1"})
// elIs(document.getElementById("t"),function(el) { return {el.className: "s1"} })
// ```
function elIs(el,specs) {
    if(!el) return false;

    var temp,flag = true;
    for(var k in specs) {
        var valElem = el[k];
        var valExp  = specs[k];
        var valExpType = valExp.constructor;

        if(valExpType == Function) {
            temp = valExp.call(el,valElem);
        } else {
            temp = (valElem==valExp);
        } 
        flag = flag && temp;
        if(!flag) break;
    }
    return flag;
}
// @returns (number): Scan index order of element in its container
function elIndex(el,breakCondition) {
    breakCondition = breakCondition || function (el) { return false; }
    var count = 0;
    while(el = el.previousElementSibling) {
        if(breakCondition(el)) {break;}
        count++;
    }
    return count;
}
// @returns (htmlelement): Get ancestor of element that fulfills specs 
function elGetParent(el,specs) {
    var temp = null;
    if(el) {
    while( el.parentElement!==null 
        && el.parentElement!==document.body
    ){
        if( elIs(el.parentElement,specs) ) {
            temp = el.parentElement;
        }
        el = el.parentElement;
    }
    }
    return temp;
}
// @returns (array): Get immediate children of element that fulfills specs
function elGetChildren(el,specs) {
    var temp = [];
    for(var i=0;i<el.children.length;i++) {
        var curr = el.children[i];
        if(elIs(curr,specs)) {
            temp.push(curr);
        }
    }
    return temp;
}
// @returns (boolean): Check if element has specifield className (tring) 
function elHasClassName(el,className) {
    return listHas(el.className,className," ");
}
// @returns (boolean): flag to tell if unique className added
function elAppendClassName(el,className) {
    var appended = false;
    if(!elHasClassName(el,className)) {
        el.className = listAppend(el.className,className," ");
        appended = true;
    }
    return appended
}
// @returns (boolean): flag to tell if unique className removed
function elRemoveClassName(el,className) {
    var removed = false;
    if(elHasClassName(el,className)) {
        el.className = listRemove(el.className,className," ");
        removed = true;
    }
    return removed;
}
// @returns (undefined): hide element by appending "hide" to className
function elHide(el) {
    if(!el) return
    if(!listHas(el.className,"hide"," ")) {
        el.className = listAppend(el.className,"hide"," ");
    }
}
// @returns (undefined): hide element by removing "hide" to className
function elShow(el) {
    if(!el) return
    el.className = listRemove(el.className,"hide"," ");
}
// @returns (undefined): toggle element visibility (if showing now, hide. vice versa)
function elToggle(el) {
    if(!el) return
    if(!listHas(el.className,"hide"," ")) {
        el.className = listAppend(el.className,"hide"," ");
    } else {
        el.className = listRemove(el.className,"hide"," ");
    }
}
// @returns (undefined): remove all children from element
function elRemoveChildren (el,result) {
    result = result || [];
    while(el.firstElementChild) {
        result.unshift(
            el.removeChild(el.firstElementChild)
        );
    }
    return result;
}
