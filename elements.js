// custom tags
var xtags= {};

// modal container
xtags["my-modal-content"] = xtag.register("my-modal-content",{
    lifecycle:{
        created: function () { 
            this.xtag.data.container = undefined;
            this.init();
        },
        inserted: function () { },
        removed: function () { },
        attributeChanged: function (attr,old,next) {},
    },
    methods: {
        init: function () {
            elHide(this);
        },
        getWrapper: function () {
            var target; 
            if(!this.xtag.data.container) {
                target = document.getElementsByTagName("MY-MODAL");
                if(target.length==0){
                    target = document.createElement("MY-MODAL");
                    document.body.appendChild(target);
                } else {
                    // pick the first
                    target = target[0];
                }
                this.xtag.data.container = target;
            }
        },
        showContent: function () {
            this.getWrapper();
            this.xtag.data.container.appendSource(this);
            elShow(this.xtag.data.container);
        },
        hideContent: function () {
            this.getWrapper();
            elHide(this.xtag.data.container);
        }
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
    },
    events: {
    }
})
xtags["my-modal"] = xtag.register("my-modal",{
    content:'<div class="my-modal-container"> <div class="my-modal-close"> &times; </div> <div class="my-modal-content"> </div> </div>',
    lifecycle:{
        created: function () { 
            this.xtag.data.targetEl = undefined;
            this.xtag.data.sourceEl = undefined;
            this.init();
        },
        inserted: function () {
        },
        removed: function () {},
        attributeChanged: function (attr,old,next) {},
    },
    methods: {
        init: function () {
            this.xtag.data.targetEl = this.getElementsByClassName("my-modal-content")[0];
            elHide(this);
        },
        moveFragments: function (target,source) {
            while(source.firstChild) {
                target.appendChild(source.removeChild(source.firstChild));
            }
        },
        returnSource: function (el) {
            if(this.xtag.data.sourceEl && this.xtag.data.sourceEl!==el) {
                this.moveFragments(this.xtag.data.sourceEl,this.xtag.data.targetEl);
            }
            this.xtag.data.sourceEl = el;
        },
        appendSource: function (el) {
            if(el.tagName === "MY-MODAL-CONTENT") {
                this.returnSource(el);
                this.moveFragments(this.xtag.data.targetEl,el);
            }
        }
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
    },
    events: {
        "click": function (ev) {
            var isClosing = ev.target.tagName==="MY-MODAL" || elHasClassName(ev.target,"my-modal-close");
            if(isClosing) {
                elHide(this);
            }
        }
    }
})
// custom table setup
xtags["my-data-td"] = xtag.register("my-data-td",{
    extends:"td",
    lifecycle:{
        created: function () { 
            this.xtag.data = undefined;
        },
        inserted: function () { },
        removed: function () { },
        attributeChanged: function (attr,old,next) { }
    },
    methods: { 
        setData: function (data) {
            this.xtag.data = data;
        },
        getData: function () {
            return this.xtag.data;
        },
        getPosition: function () {
            var p = this;
            var pp = this.parentElement;
            var pos = {
                 xIndex: elIndex( p  )
                ,yIndex: elIndex( pp )
            }
            if( p.colName) { pos.colName =  p.colName; }
            if(pp.rowName) { pos.rowName = pp.rowName; }
            return pos;
        }
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
        colName:{ attribute: {}, }
    },
    events: {
    }
})
xtags["my-data-th"] = xtag.register("my-data-th",{
    extends:"th",
    prototype: xtags["my-data-td"].prototype
});

xtags["my-data-tr"] = xtag.register("my-data-tr",{
    extends:"tr",
    lifecycle:{
        created: function () { 
            this.init();
        },
        inserted: function () { },
        removed: function () { },
        attributeChanged: function (attr,old,next) {},
    },
    methods: {
        init: function (data,index,list) {
            this.xtag.data.fnGenerate = function (td,data,key,list) {
                return td? td: document.createElement("td","my-data-td");
            };
            this.xtag.data.fnData = function (td,data,key,list) {
                td.colName = key;
                td.setData(data);
            };
            this.xtag.data.fnRender = function (td,data,key,list) {
                td.textContent = td.getData();
            };
            this.xtag.data.cached = [];
        },
        cacheEls: function () {
            while(this.lastElementChild) {
                this.xtag.data.cached.unshift( this.removeChild(this.lastElementChild) );
            }
        },
        setPipeline: function (fnGenerate,fnData,fnRender) {
            this.xtag.data.fnGenerate = (fnGenerate && fnGenerate.constructor===Function? fnGenerate: this.xtag.data.fnGenerate);
            this.xtag.data.fnData     = (fnData     &&     fnData.constructor===Function? fnData    : this.xtag.data.fnData    );
            this.xtag.data.fnRender   = (fnRender   &&   fnRender.constructor===Function? fnRender  : this.xtag.data.fnRender  );
        },
        renderData: function (targetData) {
            var sourceType = xtag.typeOf(targetData);
            var pipeline = function (td,data,key,list) {
                td = this.xtag.data.fnGenerate.call(this,td,data,key,list);
                this.appendChild(td);
                this.xtag.data.fnData.call(this,td,data,key,list);
                this.xtag.data.fnRender.call(this,td,data,key,list);
            }
            this.cacheEls();
            if(sourceType==="array") {
                for(var i=0; i<targetData.length; i++) 
                    pipeline.call(this,this.xtag.data.cached.shift(),targetData[i],i,targetData);

            } else if(sourceType==="object") {
                for(var i in targetData) 
                    pipeline.call(this,this.xtag.data.cached.shift(),targetData[i],i,targetData);
            }
        },
        getData: function () {
            var target = undefined;
            elsEach(this.children,function(el,index,all){
                var t = el.getPosition();
                if(t.hasOwnProperty("colName")) {
                    if(!target) target = {};
                    target[el.colName] = el.getData();
                } else {
                    if(!target) target = [];
                    target.push(el.getData());
                }
            })
            return target; 
        },
        getPosition: function () {
            var p = this;
            var pos = {
                yIndex: elIndex( p )
            }
            if(this.rowName) {
                pos.rowName = this.rowName;
            }
            return pos;
        }
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
        rowName:{ attribute: {}, }
    },
    events: {
    }
})
xtags["my-data-tbody"] = xtag.register("my-data-tbody",{
    extends:"tbody",
    lifecycle:{
        created: function () { 
            this.init();
        },
        inserted: function () { },
        removed: function () { },
        attributeChanged: function (attr,old,next) { }
    },
    methods: {
        init: function () {
            this.xtag.data.fnGenerate = function (tr,data,key,list) {
                return tr? tr: document.createElement("tr","my-data-tr");
            };
            this.xtag.data.fnData = function (tr,data,key,list) {
                tr.rowName = key;
            };
            this.xtag.data.fnRender = function (tr,data,key,list) {
                tr.renderData(data);
            };
            this.xtag.data.cached = [];
        },
        cacheEls: function () {
            while(this.lastElementChild) {
                this.xtag.data.cached.unshift( this.removeChild(this.lastElementChild) );
            }
        },
        setPipeline: function (fnGenerate,fnData,fnRender) {
            this.xtag.data.fnGenerate = (fnGenerate && fnGenerate.constructor===Function? fnGenerate: this.xtag.data.fnGenerate);
            this.xtag.data.fnData     = (fnData     &&     fnData.constructor===Function? fnData    : this.xtag.data.fnData    );
            this.xtag.data.fnRender   = (fnRender   &&   fnRender.constructor===Function? fnRender  : this.xtag.data.fnRender  );
        },
        renderData: function (targetData) {
            var sourceType = xtag.typeOf(targetData);
            var pipeline = function (tr,data,key,list) {
                tr = this.xtag.data.fnGenerate.call(this,tr,data,key,list);
                this.appendChild(tr);
                this.xtag.data.fnData.call(this,tr,data,key,list);
                this.xtag.data.fnRender.call(this,tr,data,key,list);
            }
            this.cacheEls();
            if(sourceType==="array") {
                for(var i=0; i<targetData.length; i++) 
                    pipeline.call(this,this.xtag.data.cached.shift(),targetData[i],i,targetData);

            } else if(sourceType==="object") {
                for(var i in targetData) 
                    pipeline.call(this,this.xtag.data.cached.shift(),targetData[i],i,targetData);
            }
        },
        getData: function () {
            var target = undefined;
            elsEach(this.children,function(el,index,all){
                var t = el.getPosition();
                if(t.hasOwnProperty("rowName")) {
                    if(!target) target = {};
                    target[el.rowName] = el.getData();
                } else {
                    if(!target) target = [];
                    target.push(el.getData());
                }
            })
            return target; 
        }
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
    },
    events: {
    }
})
xtags["my-data-table"] = xtag.register("my-data-table",{
    extends:"table",
    content:"<thead><tr is='my-data-tr'></tr></thead><tbody is='my-data-tbody'></tbody>",
    lifecycle:{
        created: function () { 
            this.init();
        },
        inserted: function () { },
        removed: function () { },
        attributeChanged: function (attr,old,next) {},
    },
    methods: {
        init: function () {
            this.xtag.data.source = undefined;
            this.xtag.data.tbody = this.getElementsByTagName("TBODY")[0];
            this.xtag.data.thead = this.getElementsByTagName("THEAD")[0].firstElementChild;
            this.xtag.data.thead.setPipeline(
                function(td,data,index,list){
                    return td? td: document.createElement("th","my-data-th");
                }
                ,undefined
                ,undefined
            );
        },
        renderData: function (d) {
            //data format: cf query
            this.xtag.data.thead.renderData( d.COLUMNS );
            this.xtag.data.tbody.renderData( d.DATA );
        },
        headPipeline: function (fnGen,fnData,fnRender) {
            this.xtag.data.thead.setPipeline(fnGen,fnData,fnRender);
        },
        bodyPipeline: function (fnGen,fnRender) {
            this.xtag.data.tbody.setPipeline(fnGen,fnRender);
        },
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
    },
    events: {
    }
})
function getOffset(dt,weekstartday,weeklength) {
    var dddd = dt.getDay();
    var dd = dt.getDate();
    var mm = dt.getMonth();
    var yyyy = dt.getFullYear();

    weeklength = (weeklength===undefined || weeklength===null)? 7: weeklength;
    weekstartday = (weekstartday===undefined || weekstartday===null)? 0: weekstartday; //0:sunday,1:monday,2:tuesday,etc
    var tempback,weeksback = 0;
    var limit = -1;
    do {
        tempback = dd-dddd +weekstartday -weeklength*weeksback;
        if(tempback<=limit) {
            break;
        }
        weeksback++;
    } while(tempback>limit) 
    return dateAdd("dd",-dddd+weekstartday-weeklength*weeksback,new Date(yyyy,mm,dd));
}
function Calendar(dt,weekstartday) {
    this.date = dt; 
    this.weekstartday = weekstartday;
    this.weekstartday = 1;
    this.data = [
         ["","","","","","",""]
        ,["","","","","","",""]
        ,["","","","","","",""]
        ,["","","","","","",""]
        ,["","","","","","",""]
        ,["","","","","","",""]
    ];
}
Calendar.prototype.setup = function (dt,weekstartday) {
    this.date = dt; 
    this.weekstartday = weekstartday;
    this.setData();
}
Calendar.prototype.dateSet = function (yyyy,mm,dd) {
    if(yyyy) this.date.setFullYear (yyyy);
    if(mm  ) this.date.setMonth    (mm);
    if(dd  ) this.date.setDate     (dd);
    this.setData();
}
Calendar.prototype.dateGet = function () {
    return this.date;
}
Calendar.prototype.dateAdd = function (type,interval) {
    dateAdd(type,interval,this.date);
    this.setData();
}
Calendar.prototype.listWeekdays = function (d,len) {
    len = len? len: "short"; //"normal","long"
    var days = [
        "sun-day"
        ,"mon-day"
        ,"tue-s-day"
        ,"wed-nesday"
        ,"thu-rs-day"
        ,"fri-day"
        ,"sat-urday"
    ];
    var temp,count = this.weekstartday;
    while(count>0) {
        days.push(days.shift());
        count--;
    }
    if( !(d===undefined || d===null) ) {
        days = [ days[d] ];
    }
    var result;
    if(len=="short")       { result = elsMap(days,function(el,index,list){ var temp = el.split("-"); return temp[0];}); }
    else if(len=="normal") { result = elsMap(days,function(el,index,list){ var temp = el.split("-"); temp.pop(); return temp.join("");}); }
    else if(len=="long")   { result = elsMap(days,function(el,index,list){ var temp = el.split("-"); return temp.join("");}); }
    return result;
}
Calendar.prototype.getStrMonth = function (m,len) {
    len = len? len: 3;
    m = m || this.date.getMonth();
    var mm = ['january'
        ,'february'
        ,'march'
        ,'april'
        ,'may'
        ,'june'
        ,'july'
        ,'august'
        ,'september'
        ,'october'
        ,'november'
        ,'december'
    ];
    return capitalise( mm[m].substr(0,len) );
}
Calendar.prototype.getStrYear = function () {
    return this.date.getFullYear();
}
Calendar.prototype.getStrDate = function (dt,type) {
    dt = dt || this.date;
    type = type || "short";
    var result = [];
    if(type==="short") {
        result.push( 
            this.getStrMonth(dt.getMonth()) 
            ,dt.getFullYear()
        );
    }
    return result.join(" ")
}
Calendar.prototype.setData = function () {
    var temp = getOffset(this.date,this.weekstartday);
    var dd = temp.getDate();
    var mm = temp.getMonth();
    var yyyy = temp.getFullYear();
    var eom = daysInMonth(mm,yyyy);
    var dtnext = dd;

    //rows
    for(var j=0;j<this.data.length;j++) {
        // columns
        for(var i=0;i<this.data[j].length;i++) {
            if(dtnext>=eom) {
                dd = -1*(j*7+i)+1;
                mm = mm+1;
                if(mm>11) {
                    yyyy = yyyy+1;
                    mm = 0;
                }
                eom = daysInMonth(mm,yyyy)
            }
            dtnext = (j*7+i)+dd;
            this.data[j][i] = yyyy.toString()+pad0(mm,2)+pad0(dtnext,2);
        }
    }
}
Calendar.prototype.getData = function () {
    return this.data;
}
xtags["my-calendar"] = xtag.register("my-calendar",{
    content:'<div class="indicator"> <input type="button" value="&laquo;"> <div class="today"> TODAY </div> <div> <span class="yyyy">dd  </span> <span class="mm">dd </span> </div> <div class="selected"> </div> <input type="button" value="&raquo;"> </div> <table> <thead> <tr is="my-data-tr"> </tr> </thead> <tbody is="my-data-tbody"> </tbody> </table>',
    lifecycle:{
        created: function () { 
            this.init();
        },
        inserted: function () { },
        removed: function () { },
        attributeChanged: function (attr,old,next) {},
    },
    methods: {
        init: function () {
            this.xtag.data.dtselected = undefined;
            this.xtag.data.dtnow = new Date();
            this.xtag.data.dtnow.setHours(0,0,0,0);

            this.xtag.data.cal = new Calendar(new Date(2018,6,30));
            this.xtag.data.cal.setData();

            this.xtag.data.head = this.getElementsByTagName("thead")[0].firstElementChild;
            this.xtag.data.head.renderData(
                elsMap(this.xtag.data.cal.listWeekdays(),function(el) { return capitalise(el)}, this)
            )

            this.xtag.data.skin = this.getElementsByTagName("TBODY")[0];
            var fnRender = (function (calendar) {
                return function(tr,data,key,list) {
                    var dtx = calendar.xtag.data.dtnow;
                    tr.setPipeline(
                        undefined
                        ,function(td,data,index,list) {
                            var temp = {}
                            temp.yyyy = data.substr(0,4);
                            temp.mm = data.substr(4,2);
                            temp.dd = data.substr(6,2);
                            td.setData(temp);
                        }
                        ,function(td,data,index,list) {
                            td.textContent = Number(td.getData().dd);
                        }
                    )
                    tr.renderData(data);
                }
            })(this)
            this.xtag.data.skin.setPipeline(
                undefined
                ,undefined
                ,fnRender
            );

            var inputs = this.getElementsByTagName("input");
            var spans = this.getElementsByTagName("span");
            var divs = this.getElementsByTagName("div");
            this.xtag.data.elPrev  = inputs[0];
            this.xtag.data.elNext  = inputs[1];
            this.xtag.data.elToday = divs[1];
            this.xtag.data.elmm    = spans[0]
            this.xtag.data.elyyyy  = spans[1]
            this.xtag.data.elSelected = divs[3];    

            this.render();
        },
        getSelectedDate: function () {
            var result;
            if(this.xtag.data.dtselected){
                result = {};
                result.yyyy = this.xtag.data.dtselected.getFullYear();
                result.mm   = this.xtag.data.dtselected.getMonth();
                result.dd   = this.xtag.data.dtselected.getDate();
            }
            return result;
        },
        setSelectedDate: function (yyyy,mm,dd) {
            if(!this.xtag.data.dtselected){
                this.xtag.data.dtselected = new Date();
            }
            if(yyyy) this.xtag.data.dtselected.setFullYear(yyyy);
            if(mm)   this.xtag.data.dtselected.setMonth(mm);
            if(dd)   this.xtag.data.dtselected.setDate(dd);
            this.xtag.data.dtselected.setHours(0,0,0,0);
        },
        render: function (yyyy,mm,dd) {
            this.renderData(yyyy,mm,dd);
            this.renderText();
            this.layerStyles();
        },
        renderData: function (yyyy,mm,dd) {
            if(yyyy || mm || dd) {
                this.xtag.data.cal.dateSet(yyyy,mm,dd);
            }
            this.xtag.data.skin.renderData(this.xtag.data.cal.getData());
        },
        renderText: function () {
            var d = this.xtag.data.cal;
            if(this.xtag.data.dtselected) {
                this.xtag.data.elSelected.textContent = dateFormat(this.xtag.data.dtselected);
            }
            this.xtag.data.elmm.textContent = d.getStrMonth()
            this.xtag.data.elyyyy.textContent = d.getStrYear()
        },
        layerStyles: function () {
            //layer style classes
            var last,lastDt,currdata,classes="";
            var dt1=new Date();
            dt1.setHours(0,0,0,0);

            var tds,trs = this.xtag.data.skin.children;
            for(var i=0;i<trs.length;i++){
                var last = trs[i].lastElementChild;
                var lastDt = last.getData();

                var toStyleSelected = function(d) { return this.xtag.data.dtselected? dateCompare(d,this.xtag.data.dtselected): 1; }
                var toStyleToday    = function(d) { return dateCompare(d,this.xtag.data.dtnow); }
                var toStylePrev     = function(d) { return this.xtag.data.cal.dateGet().getMonth()>Number(d.mm); }
                var toStyleNext     = function(d) { return this.xtag.data.cal.dateGet().getMonth()<Number(d.mm); }

                tds = trs[i].children;
                for(var j=0;j<tds.length;j++) {

                    currdata = tds[j].getData();
                    dt1.setFullYear (currdata.yyyy);
                    dt1.setMonth    (currdata.mm  );
                    dt1.setDate     (currdata.dd  );
                    classes = 
                         (toStyleSelected.call(this,dt1)===0? "selected ": "")
                         +(toStyleToday.call(this,dt1)===0? "today ": "")
                         +(toStylePrev.call(this,currdata)? "mprev ": "")
                         +(toStyleNext.call(this,currdata)? "mnext ": "");
                     tds[j].className = classes;
                }
            }
        }
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
    },
    events: {
        "mouseover": function (ev) {
            var t = ev.target;
            if( t===this.xtag.data.elToday ) { 
                t.textContent = dateFormat(this.xtag.data.dtnow);

            } else if( t===this.xtag.data.elSelected ) { 
                t.textContent = "Selected"
            }
        },
        "mouseout": function (ev) {
            var t = ev.target;
            if( t===this.xtag.data.elToday ) { 
                t.textContent = "TODAY"

            } else if( t===this.xtag.data.elSelected ) { 
                t.textContent = dateFormat(this.xtag.data.dtnow);
            }
        },
        "click": function (ev) {
            var t = ev.target;
            var tc = ev.currentTarget;

            if( t===this.xtag.data.elPrev      ) { this.xtag.data.cal.dateAdd("mm",-1);this.render(); }
            else if( t===this.xtag.data.elNext ) { this.xtag.data.cal.dateAdd("mm",1);this.render(); }
            else if( t===this.xtag.data.elToday ) { 
                var yyyy = this.xtag.data.dtnow.getFullYear(); 
                var mm   = this.xtag.data.dtnow.getMonth();    
                var dd   = this.xtag.data.dtnow.getDate();      
                this.render(yyyy,mm,dd);

            } else if( t===this.xtag.data.elSelected ) { 
                var temp = this.getSelectedDate();
                if(temp) {
                    var yyyy = this.xtag.data.dtselected.getFullYear(); 
                    var mm   = this.xtag.data.dtselected.getMonth();    
                    var dd   = this.xtag.data.dtselected.getDate();      
                    this.render(yyyy,mm,dd);
                }

            } else if( t.tagName==="TD") {
                var d = t.getData();
                this.setSelectedDate(d.yyyy,d.mm,d.dd);
                this.render();
                
                xtag.fireEvent(this,"dtselected",{
                    selected: this.xtag.data.dtselected
                    ,cell: t
                })
            }
        }
    }
})

xtags["my-textbox"] = xtag.register("my-textbox",{
    extends:"input",
    lifecycle:{
        created: function () { 
            this.init();
        },
        inserted: function () { },
        removed: function () { },
        attributeChanged: function (attr,old,next) { },
    },
    methods: {
        init: function () {
            this.type = "text";
            this.xtag.data.warningEl = undefined;
            this.xtag.data.svalidated = new signals.Signal();
            this.xtag.data.validation = undefined;
            this.xtag.data.converted = undefined;
        },
        setValue: function(source,datatype) {
            if(source.constructor !== String) source = this.value;
            datatype = datatype || this.dataType;

            var f = new Formatter(source);
            f.pipeline(datatype)
            this.dataValid  = f.isValid;
            this.dataMask   = f.datamask; 
            this.dataString = f.datastring;

            this.xtag.data.converted = f.data;
            this.value      = f.datamask || f.source || "";

            this.validate();
        },
        getValue: function () {
            return this.xtag.data.converted;
        },
        setWarningEl: function (el) {
            this.xtag.data.warningEl = el;
        },
        getWarningEl: function () {
            if(!this.xtag.data.warningEl) {
                this.xtag.data.warningEl = document.createElement("MY-MSG-VALIDATE")
                this.parentElement.insertBefore(
                    this.xtag.data.warningEl
                    ,this.nextSiblingElement
                );
            }
            return this.xtag.data.warningEl;
        },
        showWarning: function (warnings) {
            this.getWarningEl().printArray(warnings);
        },
        getValidation: function () {
            if(!this.xtag.data.validation) {
                this.xtag.data.validation = new Validate();
            }
            return this.xtag.data.validation;
        },
        validate: function (value) {
            var temp = this.getValidation().evalElement(this,value);
            //todo: event obj to propagate
            this.showWarning(temp.warnings);

            // dispatch items
            this.xtag.data.svalidated.dispatch(temp);
            xtag.fireEvent(this, 'validate', {detail: temp});
        },
        onValidated: function (fn) {
            this.xtag.data.svalidated.add(fn,this);
        },

    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
        dataValid:{attribute:{}, },
        dataMask:{attribute:{}, },
        dataString:{attribute:{}, },
        dataType:{attribute:{}, get: function() {
            var temp = this.getAttribute("data-type");
            return temp? temp: "text";
        }}
    },
    events: {
        "blur": function(ev){
            var el = ev.target;
            if( el.hasAttribute("data-valid") ) {
                el.validate();
            } else {
                el.setValue(el.value);
            }
        },
        "keydown": debounce(function(){
            var ev = this;
            var el = ev.target;
            el.setValue(el.value);
        },500)
    }
})
xtags["my-radio-checkbox"] = xtag.register("my-radio-checkbox",{
    extends:"input",
    lifecycle:{
        created: function () { 
            this.init();
        },
        inserted: function () { },
        removed: function () { },
        attributeChanged: function (attr,old,next) { },
    },
    methods: {
        init: function () {
            if(this.type=="text") { this.type = "radio"; }
            this.xtag.data.warningEl = undefined;
            this.xtag.data.svalidated = new signals.Signal();
            this.xtag.data.validation = undefined;
        },
        setValue: function(source,filter) {
            var temp = false;
            if(this.name) { 
                temp = true;
                setValueByName(source,this.name,filter); 

                targetVal = this.getValue().join(",");
                applyEachGroup.call(this
                    ,this.name
                    ,function(g,k){ return k == writeKey(this); }
                    ,function(el,index){ el.dataString = targetVal; }
                )
            }
            this.validate();
            return temp;
        },
        getValue: function (filter) {
            var temp = this.name? getValueByName(this.name,filter): temp;
            return temp;
        },
        setWarningEl: function (el) {
            this.xtag.data.warningEl = el;
        },
        getWarningEl: function () {
            if(!this.xtag.data.warningEl) {
                this.xtag.data.warningEl = document.createElement("MY-MSG-VALIDATE")
                this.parentElement.insertBefore(
                    this.xtag.data.warningEl
                    ,this.nextSiblingElement
                );
            }
            return this.xtag.data.warningEl;
        },
        showWarning: function (warnings) {
            this.getWarningEl().printArray(warnings);
        },
        getValidation: function () {
            if(!this.xtag.data.validation) {
                this.xtag.data.validation = new Validate();
            }
            return this.xtag.data.validation;
        },
        validate: function (value) {
            var temp = this.getValidation().evalElement(this,value);
            this.showWarning(temp.warnings);

            this.xtag.data.svalidated.dispatch(temp);
            xtag.fireEvent(this, 'validate', {detail: temp});
        },
        onValidated: function (fn) {
            this.xtag.data.svalidated.add(fn,this);
        },
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
        dataString:{attribute:{}, },
        dataType:{attribute:{}, get: function() {
            var temp = this.getAttribute("data-type");
            return temp? temp: "text";
        }}
    },
    events: {
        "change": function(ev){
            var el = ev.target;
            var list = this.getValue().join(",");
            if(this.type==="checkbox") {
                this.setValue( 
                    el.checked? listAppendUnique( list, ev.target.value ): listRemove (list, ev.target.value)
                );
            } else if(this.type==="radio") {
                this.setValue(ev.target.value);
            }
            el.validate();
        }
    }
})
xtags["my-select"] = xtag.register("my-select",{
    extends:"select",
    lifecycle:{
        created: function () { 
            this.init();
        },
        inserted: function () { },
        removed: function () { },
        attributeChanged: function (attr,old,next) { },
    },
    methods: {
        init: function () {
            this.xtag.data.warningEl = undefined;
            this.xtag.data.svalidated = new signals.Signal();
            this.xtag.data.validation = undefined;
        },
        setValue: function(source,filter) {
            var temp = false;
            if(this.name) { 
                temp = true;
                setValueByName(source,this.name,filter); 

                targetVal = this.getValue(filter).join(",");
                applyEachGroup.call(this
                    ,this.name
                    ,function(g,k){ return k == writeKey(this); }
                    ,function(el,index){ el.dataString = targetVal; }
                )
            }
            return temp;
        },
        getValue: function (filter) {
            var temp = this.name? getValueByName(this.name,filter): temp;
            return temp;
        },
        setWarningEl: function (el) {
            this.xtag.data.warningEl = el;
        },
        getWarningEl: function () {
            if(!this.xtag.data.warningEl) {
                this.xtag.data.warningEl = document.createElement("MY-MSG-VALIDATE")
                this.parentElement.insertBefore(
                    this.xtag.data.warningEl
                    ,this.nextSiblingElement
                );
            }
            return this.xtag.data.warningEl;
        },
        showWarning: function (warnings) {
            this.getWarningEl().printArray(warnings);
        },
        getValidation: function () {
            if(!this.xtag.data.validation) {
                this.xtag.data.validation = new Validate();
            }
            return this.xtag.data.validation;
        },
        validate: function (value) {
            var temp = this.getValidation().evalElement(this,value);
            this.showWarning(temp.warnings);

            this.xtag.data.svalidated.dispatch(temp);
            xtag.fireEvent(this, 'validate', {detail: temp});
        },
        onValidated: function (fn) {
            this.xtag.data.svalidated.add(fn,this);
        },
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
        dataString:{attribute:{}, },
        dataType:{attribute:{}, get: function() {
            var temp = this.getAttribute("data-type");
            return temp? temp: "text";
        }}
    },
    events: {
        "change": function(ev){
            var el = ev.target;
            var list = this.getValue().join(",");
            this.setValue(list);
            el.validate();
        }
    }
})
xtags["my-msg"] = xtag.register("my-msg",{
    lifecycle:{
        created: function () {
            this.init();
        },
        inserted: function () {},
        removed: function () {},
        attributeChanged: function (attr,old,next) {},
    },
    methods: {
        init: function () {
            this.xtag.data.frag = [];
        },
        getChild: function (fn) {
            fn = fn || function () {
                return document.createElement("div");
            }
            var el = this.xtag.data.frag.shift();
            if(!el) el = fn();
            return el;
        },
        clearMsg: function () {
            elRemoveChildren(this,this.xtag.data.frag);
        },
        printArray: function (arr,fn) {
            fn = fn || function(a) {
                var el = this.getChild();
                el.innerHTML = a;
                this.appendChild(el);
            }
            this.clearMsg();
            elsEach(arr,fn,this);
        }
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
    },
    events: {
    }
})
xtag.register("my-msg-validate",{
    prototype: xtags["my-msg"].prototype,
    lifecycle:{
        created: function () { 
            this.init();
        },
        inserted: function () { },
        removed: function () {
            this.unhookTargets(this.targetName);
        },
        attributeChanged: function (attr,old,next) { 
            if(attr==="target-name"){
                this.hookTargets(next);
            }
        },
    },
    methods: {
        init: function () {
            if(this.hookType=="auto") this.hookTargets();
        },
        unhookTargets: function (namelist) {
            namelist = namelist || this.targetName || "";
            var temp = namelist.split(",");

            for(var i=0;i<temp.length;i++) {
                applyEachGroup.call(this
                    ,temp[i]
                    ,undefined
                    ,function(el,index,list){ if(el) { el.setWarningEl(undefined) }; }
                )
            }
        },
        hookTargets: function (namelist) {
            namelist = namelist || this.targetName || "";
            var temp = namelist.split(",");

            for(var i=0;i<temp.length;i++) {
                applyEachGroup.call(this
                    ,temp[i]
                    ,undefined
                    ,function(el,index,list){ if(el) { el.setWarningEl(this) }; }
                )
            }
        }
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
        // targetId:{attribute:{}}
        targetName:{attribute:{}}
        ,hookType:{
            attribute:{
                validate: function (val) {
                    return (val=="manual" || val=="auto")? val: null;
                }
            }
            ,get: function() { 
                var isExists = this.getAttribute("hook-type");
                return isExists? this.getAttribute("hook-type"): "auto";
            }
        }
    },
    events: {
    }
})
// looping text
xtag.register("my-msg-loop",{
    lifecycle:{
        created: function () {
        },
        inserted: function () {
            this.init()
        },
        removed: function () {},
        attributeChanged: function (attr,old,next) {
            if(attr=="show-msg") {
                if(next=="show") {
                    elRemoveClassName(this,"hide");
                } else {
                    elAppendClassName(this,"hide");
                }
            }
        },
    },
    methods: {
        init: function () {
            this.xtag.data.looper;
            this.showMsg = "hide"
        }
        ,loopFn: function (interval,fn,fnContext) {
            this.loopStop();
            var args = [fn,interval,fnContext];
            for(var i=3;i<arguments.length;i++) {
                args.push(arguments[i]);
            }
            this.xtag.data.looper = setInterval.apply(undefined,args);
        }
        ,loopStop: function () {
            if(this.xtag.data.looper) {
                clearInterval(this.xtag.data.looper);
                this.xtag.data.looper = undefined;
            }
        }
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
        showMsg:{attribute:{} }
    },
    events: {
    }
})

// ajax handlers
xtag.register("my-handler",{
    lifecycle:{
        created: function () {},
        inserted: function () {},
        removed: function () {},
        attributeChanged: function (attr,old,next) {}
    },
    methods: {
        getDefinition: function () {
            var result = {type:"", handler:undefined, fnName:"", fn:"" }

            var filtered = elsFilter(this.attributes, function(attr) {
                return new RegExp("^params|type").test(attr.nodeName);
            });

            for(var i=0;i<filtered.length;i++) {
                var n = filtered[i].nodeName;
                var v = filtered[i].nodeValue;

                n = n.split("-");
                var n0 = n.shift();
                var n1 = camelCase(n);

                if(n0=="type") { result[n0] = v; }
                else if(n0==="params"){ result[n1]=v; } 
            }

            if(result.fnName.length>0) {
                result.handler = window[result.fnName];

            } else if(result.fn.length>0) {
                result.handler = new Function ("return "+result.fn)();
            }
            return this.isValidResult(result)? result: undefined;
        },
        isValidResult: function (obj) {
            var validTypes = ["ready","connected","responded","processing","success","error"];

            return obj.hasOwnProperty("type") && validTypes.indexOf(obj.type)>-1 
                && obj.hasOwnProperty("handler") && xtag.typeOf(obj.handler)=="function";
        }
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
    },
    events: {
    }
})
xtag.register("my-ajax",{
    lifecycle:{
        created: function () {},
        inserted: function () {
            this.init();
        },
        removed: function () {},
        attributeChanged: function (attr,old,next) {},
    },
    methods: {
        init: function () {
            this.xtag.data.msgloop = document.createElement("MY-MSG-LOOP");
            this.appendChild(this.xtag.data.msgloop);
        },
        getHandlerByTag: function () {
            var baseHandler = baseHandler || {};
            baseHandler["ready"      ] = baseHandler.hasOwnProperty("ready"      )? baseHandler["ready"      ]: function (xhttp) {console.log(0,"ready")                    }
            baseHandler["connected"  ] = baseHandler.hasOwnProperty("connected"  )? baseHandler["connected"  ]: function (xhttp) {console.log(1,"connecting remote server") }
            baseHandler["responded"  ] = baseHandler.hasOwnProperty("responded"  )? baseHandler["responded"  ]: function (xhttp) {console.log(2,"remote server responded")  }
            baseHandler["processing" ] = baseHandler.hasOwnProperty("processing" )? baseHandler["processing" ]: function (xhttp) {console.log(3,"remote server processing") }
            baseHandler["success"    ] = baseHandler.hasOwnProperty("success"    )? baseHandler["success"    ]: function (xhttp) {console.log(4,xhttp.status,"success",xhttp.responseText)}
            baseHandler["error"      ] = baseHandler.hasOwnProperty("error"      )? baseHandler["error"      ]: function (xhttp) {console.log(4,xhttp.status,"error")}

            var handlerEls = this.getElementsByTagName("MY-HANDLER");

            elsEach(handlerEls,function(el){
                var temp = el.getDefinition();
                if(temp!==undefined && baseHandler.hasOwnProperty(temp.type)) {
                    baseHandler[temp.type] = temp.handler;
                }
            })

            return baseHandler;
        },
        composeHandlerWithMsg: function (obj,method) {
            var composer = function(k,fn,fnContext) {
                var msgtxt = { };
                msgtxt["ready"     ] = "Connecting";
                msgtxt["connected" ] = "Connected" ;
                msgtxt["responded" ] = (method=="GET"? "Getting"    : method=="POST"?"Posting" :"Sending");
                msgtxt["processing"] = (method=="GET"? "Loading"    : method=="POST"?"Saving"  :"Loading");
                msgtxt["success"   ] = (method=="GET"? "Data loaded": method=="POST"?"Saved"   :"Success");
                msgtxt["error"     ] = "Error"     ;

                var msgRoller = function(msgEl,msgText,forceRewrite) {
                    forceRewrite = forceRewrite || false;
                    var max=10;
                    if (forceRewrite || msgEl.textContent.length == 0 || msgEl.textContent.length >= (msgText.length+max)) {
                        msgEl.textContent = msgText;
                    } else {
                        msgEl.textContent = msgEl.textContent+"."
                    }
                }

                return function () {
                    var args = elsMap(arguments,function(el){
                        return el;
                    })
                    fn.apply(fnContext,args);
                    if(k=="success" || k=="error") {
                        fnContext.xtag.data.msgloop.loopStop();
                        msgRoller(fnContext.xtag.data.msgloop,msgtxt[k],true);
                    } else {
                        fnContext.xtag.data.msgloop.loopFn(1000,msgRoller,fnContext.xtag.data.msgloop,msgtxt[k]);
                    }
                }
            }

            for(var k in obj) {
                obj[k] = composer(k,obj[k],this);
            }
            return obj;
        },
        fire: function (data,success,error,ready,connected,responded,processing) {
            var handler = this.getHandlerByTag();
            if(ready     ) handler["ready"      ] = ready     ;
            if(connected ) handler["connected"  ] = connected ;
            if(responded ) handler["responded"  ] = responded ;
            if(processing) handler["processing" ] = processing;
            if(success   ) handler["success"    ] = success   ;
            if(error     ) handler["error"      ] = error     ;
            handler = this.composeHandlerWithMsg( handler,this.method );

            return ajax({method: this.method, action: this.action,params: data || {} },handler);
        }
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
         method:{attribute:{}, get: function() {
             var val = "GET", temp = this.getAttribute("method").toUpperCase();
             var isValidMethod = "GET,POST".split(",").indexOf(temp)>-1;
             if(isValidMethod) {
                 val = temp;
             }
             return val;
         }}
        ,action:{attribute:{} }
    },
    events: {
    }
})




// formatter
xtag.register("my-regex",{
    lifecycle:{
        created: function () {},
        inserted: function () {},
        removed: function () {},
        attributeChanged: function (attr,old,next) {}
    },
    methods: {
        getDefinition: function () {
            var filtered = elsFilter(this.attributes, function(attr){
                return new RegExp("^params").test(attr.nodeName);
            });
            var result = {regex:undefined, str:"", flags:"gi", fnName:"", fn:"function(match){ return match;}" }
            for(var i=0;i<filtered.length;i++) {
                var n = filtered[i].nodeName;
                var v = filtered[i].nodeValue;

                n = n.split("-");
                var n0 = n.shift();
                var n1 = camelCase(n);
                if(n0==="params"){ result[n1]=v; } 
            }
            if(result.str.length>0) {
                result.regex = new RegExp(result.str,result.flags);
            }
            if(result.fnName.length>0) {
                result.fnReplace = window[result.fnName];

            } else {
                result.fnReplace = new Function ("return "+result.fn)();
            }
            return result;
        }
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
    },
    events: {
    }
})
xtag.register("my-format",{
    lifecycle:{
        created: function () { },
        inserted: function () { },
        removed: function () {},
        attributeChanged: function (attr,old,next) {},
    },
    methods: {
        refreshRegexes: function () {
            var temp = elsMap(elChildren(this,{tagName:"MY-REGEX"}), function(el){
                var result;
                if(el.getDefinition) {
                    result = el.getDefinition();
                }
                return result;
            });
            return temp;
        }
        ,formatByRegexes: function (source) {
            var regexes,fmt; 
            if(this.type && Formatter.presets.hasOwnProperty(this.type)) {
                regexes = Formatter.presets[this.type];
            } else {
                regexes = this.refreshRegexes();
            }
            fmt = new Formatter(regexes).format(source);
            return {isFormatted:(fmt? true: false), target: (fmt? fmt: source)};
        }
        ,formatEl: function (name) {
            var temps = getValueByName(name);
            var textEls = ["input.text","input.textarea"];
            var result = {};
            for(var t in temps) {
                if(textEls.indexOf(t)>-1) {
                    result[t] = elsMap(temps[t], function(v){
                        var f = this.formatByRegexes( v );
                        return f.isFormatted? f.target: v;
                    },this)
                }
            }
            setValueByName(result,name);
        }
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
        type:{attribute:{} }
        ,name:{attribute:{}
            , get: function() { var n = this.getAttribute("name"); return n? n: "base";}
            , set: function(val) {return val; } 
        }
        ,handleOn:{attribute:{}
            , get: function() { var n = this.getAttribute("handleOn"); return n? n: "pre";} 
            , set: function(val) { return val; } 
        }
    },
    events: {
    }
})

