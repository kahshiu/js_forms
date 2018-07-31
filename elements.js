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
    if(dd  !==undefined) this.date.setDate(dd);
    if(mm  !==undefined) this.date.setMonth(mm);
    if(yyyy!==undefined) this.date.setFullYear(yyyy);
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
// alternating date key, value
function Scroller () {
    this.currPos = 0;
    this.items = [];
    for(var i=0;i<arguments.length;i++) {
        this.items.push(arguments[i]);
    }
}
Scroller.prototype.push     = function (addition)  { this.items.push(addition); }
Scroller.prototype.unshift  = function (addition)  { this.items.unshift(addition); }
Scroller.prototype.setPos   = function (pos)       { this.currPos = pos; }
Scroller.prototype.getItem  = function ()          { return this.items[this.currPos]; }
Scroller.prototype.scroll   = function (direction) {
    direction = direction? direction: 1;
    this.currPos = this.currPos + (direction<0? -1: 1);
    var loopback = 0;
    var len = this.items.length;

    if(this.currPos>=len) {
        this.currPos = 0;
        loopback = 1;

    } else if(this.currPos<0) {
        this.currPos = len-1;
        loopback = -1
    }
    return loopback;
}

function CalendarManager () {
    this.scroller = new Scroller();
    this.maxItems = 10;
}
CalendarManager.prototype.add = function () {
    var toAdd = this.scroller.items.length<this.maxItems;
    if(toAdd) {
        this.scroller.push( document.createElement("MY-CALENDAR") );
    }
    return toAdd;
}
CalendarManager.prototype.hide = function (targetCal) {
    //hide elements except pinned calendars
    var hiddenEls = [];
    var hiddenIdx = [];
    for(var i=0;i<this.scroller.items.length;i++) {
        var item = this.scroller.items[i];
        var isTarget = (targetCal && targetCal===item) || (!targetCal);
        if( isTarget && item.pinned=="0") {
            hiddenEls.push(item);
            hiddenIdx.push(i);

            //clear bindings
            var input = item.getAugmentedInput();
            if(input) {
                input.unbindCalendar();
                item.unbindInput();
            }
        }
    }
    return {els:hiddenEls, index:hiddenIdx};
}
CalendarManager.prototype.getNext = function () {
    var ready, index, hidden = this.hide();
    ready = hidden.index.length>0;
    index = hidden.index[0];
    if(!ready) {
        ready = this.add();
        index = this.scroller.items.length-1;
    }
    if(!ready) return undefined;

    this.scroller.setPos(index);
    return this.scroller.getItem();
}
CalendarManager.prototype.isAugmented = function (el) {
    var elP = elGetParent(el,{tagName:"MY-CALENDAR"});
    var c = this.scroller.getItem();
    return c && (el===c || elP===c || el===c.getAugmentedInput());
}
CalendarManager.prototype.augmentEl = function (el) {
    var existingCal = el.getCalendar();
    if(existingCal) {
        this.zIndexSorting(existingCal);
        return undefined;
    }
    var cal = this.getNext();
    if(!cal) return undefined;
    cal.bindInput(el);
    el.bindCalendar(cal);
    this.zIndexSorting(cal);
}
CalendarManager.prototype.zIndexSorting = function (target) {
    // zIndex reserved: 900-999
    for(var i=0;i<this.scroller.items.length;i++) {
        var item = this.scroller.items[i];
        if (item===target) {
            item.style.zIndex = 999;

        } else if( item.pinned==="1" ) {
            item.style.zIndex = item.style.zIndex-1;
        }
        if(item.style.zIndex<900) {
            //todo: proper handling of index pushed out of reserved range
        }
    }
}
// TODO: keyboard manager to the whole body
xtags["my-manager"] = xtag.register("my-manager",{
    extends:"body",
    lifecycle:{
        created: function () { 
            this.init();
        },
        inserted: function () { },
        removed: function () { },
        attributeChanged: function (attr,old,next) { 
        }
    },
    methods: {
        init: function () {
            this.xtag.data.calman = new CalendarManager();
        },
        getManager: function (type) {
            var m;
            if(type==="calendar") m=this.xtag.data.calman;
            return m;
        }
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
    },
    events: {
        "focus": function (ev) {
            var t = ev.target;
            if( elIs(t,{tagName:"INPUT",type:"text",dataType:"date"}) ){
                this.xtag.data.calman.augmentEl(t);
            }
        },
        "blur": function(ev){
        },
        "click": function(ev){
            var t = ev.target;
            if(!this.xtag.data.calman.isAugmented(t)) {
                this.xtag.data.calman.hide(
                    this.xtag.data.calman.scroller.getItem()
                );
            }
        }
		//,
        //"keydown": debounce(function(){
        //},500)
    }
})

xtags["my-calendar"] = xtag.register("my-calendar",{
    content:'<div class="indicator"> <div class="button">&#x1f4cc;</div> <div class="mid"> <span class="scrollkey"> </span> <span class="scrollval"> </span> </div> <div class="button"> </div> </div> <div class="indicator"> <input type="button" class="button" value="&laquo;"> <div class="mid"> <span class="mm"> </span> <span class="yyyy"> </span> </div> <input type="button" class="button" value="&raquo;"> </div> <table> <thead> <tr is="my-data-tr"> </tr> </thead> <tbody is="my-data-tbody"> </tbody> </table>',
    lifecycle:{
        created: function () { 
            this.init();
        },
        inserted: function () { },
        removed: function () { },
        attributeChanged: function (attr,old,next) { 
            if(attr=="pinned" && next=="0") {
                var input = this.getAugmentedInput();
                if(input) {
                    this.getAugmentedInput().unbindCalendar();
                    this.unbindInput();
                }
            }
        },
    },
    methods: {
        init: function () {
            this.xtag.data.dtselected = undefined;
            this.xtag.data.dtnow = new Date();
            this.xtag.data.dtnow.setHours(0,0,0,0);
            this.xtag.data.scroller = new Scroller(
                 { key:"today"   ,val: function(){ return this.xtag.data.dtnow; }}
                ,{ key:"selected",val: function(){ return this.xtag.data.dtselected; }} 
            );

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
                    tr.className="dates"
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
            this.xtag.data.elPrev     = inputs[0];
            this.xtag.data.elNext     = inputs[1];
            this.xtag.data.elPin      = divs[1];
            this.xtag.data.elDayType  = spans[0];
            this.xtag.data.elDayValue = spans[1];
            this.xtag.data.elmm       = spans[2];
            this.xtag.data.elyyyy     = spans[3];

            this.xtag.data.augmentedEl = undefined;
            this.pinned = "0";
            this.render();
            this.renderScroller();
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
            if( yyyy===undefined && mm===undefined && dd===undefined ){
                this.xtag.data.dtselected = undefined;

            } else {
                if(!this.xtag.data.dtselected){
                    this.xtag.data.dtselected = new Date();
                }
                if(dd  !==undefined) this.xtag.data.dtselected.setDate(dd);
                if(mm  !==undefined) this.xtag.data.dtselected.setMonth(mm);
                if(yyyy!==undefined) this.xtag.data.dtselected.setFullYear(yyyy);
                this.xtag.data.dtselected.setHours(0,0,0,0);
            }
        },
        render: function (yyyy,mm,dd) {
            this.renderData(yyyy,mm,dd);
            this.renderMMYYYY();
            this.layerStyles();
        },
        renderData: function (yyyy,mm,dd) {
            if( yyyy!==undefined || mm!==undefined || dd!==undefined ) {
                this.xtag.data.cal.dateSet(yyyy,mm,dd);
            }
            this.xtag.data.skin.renderData(this.xtag.data.cal.getData());
        },
        renderMMYYYY: function () {
            var d = this.xtag.data.cal;
            this.xtag.data.elmm.textContent = d.getStrMonth()
            this.xtag.data.elyyyy.textContent = d.getStrYear()
        },
        renderScroller: function () {
            var curr = this.xtag.data.scroller.getItem(); 
            var dt = curr.val.call(this);
            this.xtag.data.elDayType.textContent = curr.key.toUpperCase();
            this.xtag.data.elDayValue.textContent = dt? dateFormat(dt): "";
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
                    dt1.setDate     (currdata.dd  );
                    dt1.setMonth    (currdata.mm  );
                    dt1.setFullYear (currdata.yyyy);
                    classes = 
                         (toStyleSelected.call(this,dt1)===0? "selected ": "")
                         +(toStyleToday.call(this,dt1)===0? "today ": "")
                         +(toStylePrev.call(this,currdata)? "mprev ": "")
                         +(toStyleNext.call(this,currdata)? "mnext ": "");
                     tds[j].className = classes;
                }
            }
        },
        synchInput: function () {
            var input = this.getAugmentedInput();
            if(input){
                var dt = this.xtag.data.dtselected;
                if(!dt) {
                    input.setValue("");
                } else {
                    input.setValue(dateFormat(dt));
                }
            }
        },
        getAugmentedInput: function () {
            return this.xtag.data.augmentedEl;
        },
        bindInput: function (el) {
            this.xtag.data.augmentedEl = el;
        },
        unbindInput: function () {
            this.xtag.data.augmentedEl = undefined;
        }
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
        pinned:{attribute:{}, }
    },
    events: {
        "click": function (ev) {
            console.log("hit")
            var t = ev.target;
            var tc = ev.currentTarget;

            if( t===this.xtag.data.elPin ) {
                this.pinned = (this.pinned=="0"? "1": "0"); 
            }
            else if( t===this.xtag.data.elPrev )     { this.xtag.data.cal.dateAdd("mm",-1);this.render(); }
            else if( t===this.xtag.data.elNext )     { this.xtag.data.cal.dateAdd("mm",1);this.render(); }
            else if( t===this.xtag.data.elDayType )  { 
                this.xtag.data.scroller.scroll(); 
                this.renderScroller();

            } else if( t===this.xtag.data.elDayValue ) { 
                var dt = this.xtag.data.scroller.getItem().val.call(this); 
                var dd   = dt.getDate();      
                var mm   = dt.getMonth();    
                var yyyy = dt.getFullYear(); 
                this.render(yyyy,mm,dd);

            } else if( t.tagName==="TD") {
                var d = t.getData();
                if(elHasClassName(t.parentElement,"dates")){
                    if(elHasClassName(t,"selected")) {
                        this.setSelectedDate();
                        elRemoveClassName(t,"selected");
                    } else {
                        this.setSelectedDate(d.yyyy,d.mm,d.dd);
                        elAppendClassName(t,"selected");
                    }
                    this.synchInput();
                }
                this.render();
                this.renderScroller();
                
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
            this.xtag.data.warningEl  = undefined;
            this.xtag.data.svalidated = new signals.Signal();
            this.xtag.data.validation = undefined;
            this.xtag.data.calendar   = undefined;
            this.xtag.data.converted  = undefined;

            if( this.value.length>0 ) {
                this.setValue(this.value); 
            }
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
            return this.getValue();
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
            return temp;
        },
        onValidated: function (fn) {
            this.xtag.data.svalidated.add(fn,this);
        },
        getCalendar: function (c) {
            return this.xtag.data.calendar
        },
        synchCalendar: function () {
            if(this.dataType==="date") {
                var dtselected = this.getValue();
                var dt   = dtselected || new Date();
                var dd   = dt.getDate();      
                var mm   = dt.getMonth();    
                var yyyy = dt.getFullYear(); 

                if(dtselected) {
                    this.xtag.data.calendar.setSelectedDate( yyyy,mm,dd );
                } else {
                    this.xtag.data.calendar.setSelectedDate();
                }
                this.xtag.data.calendar.renderScroller();
                this.xtag.data.calendar.render(yyyy,mm,dd);
            }
        },
        bindCalendar: function (c) {
            this.xtag.data.calendar = c;

            this.synchCalendar();
            var rec  = this.getBoundingClientRect();
            c.style.marginTop  = rec.height + 2;
            c.style.marginLeft = 0

            elRemoveClassName(c,"hide");
            this.parentElement.insertBefore(c,this);
        }
        ,unbindCalendar: function () {
            elAppendClassName(this.xtag.data.calendar,"hide");
            this.xtag.data.calendar = undefined;
        }
        ,highlightContent: function () {
            if(this.dataType=="date") {
                this.select();
            }
        }
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
        "focus": function(ev){
            this.highlightContent();
        },
        "blur": function(ev){
            var el = ev.target;
            if( el.hasAttribute("data-valid") ) {
                el.validate();
            } else {
                el.setValue(el.value);
            }
            el.synchCalendar();
        },
        "keydown": debounce(this,function(ev){
            var el = ev.target;    
            el.setValue(el.value); 
            el.synchCalendar();    
            el.highlightContent();   
        },800)
    }
})
xtags["my-checkbox-radio"] = xtag.register("my-checkbox-radio",{
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
            var targetVal = this.getValue(filter);
            if(targetVal) { 
                setValueByName(source,this.name,filter); 
                applyEachGroup.call(this
                    ,this.name
                    ,function(g,k){ return k == writeKey(this); }
                    ,function(el,index){ el.dataString = targetVal.join(","); }
                )
            }
            this.validate();
            return targetVal;
        },
        getValue: function (filter) {
            var temp = this.name? getValueByName(this.name,filter): undefined;
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
            return temp;
        },
        onValidated: function (fn) {
            this.xtag.data.svalidated.add(fn,this);
        },
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
        dataString:{attribute:{}, },
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
            var targetVal = this.getValue(filter)
            if(targetVal) { 
                temp = true;
                setValueByName(source,this.name,filter); 
                applyEachGroup.call(this
                    ,this.name
                    ,function(g,k){ return k == writeKey(this); }
                    ,function(el,index){ el.dataString = targetVal.join(","); }
                )
            }
            this.validate();
            return temp;
        },
        getValue: function (filter) {
            var temp = this.name? getValueByName(this.name,filter): undefined;
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
            return temp;
        },
        onValidated: function (fn) {
            this.xtag.data.svalidated.add(fn,this);
        },
    },
    accessors: {
        // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
        dataString:{attribute:{}, },
    },
    events: {
        "change": function(ev){
            var el = ev.target;
            var list = this.getValue().join(",");
            this.setValue(list);
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
            this.xtag.data.generator = function () {
                return document.createElement("div");
            };
        },
        getChild: function () {
            var el = this.xtag.data.frag.shift();
            if(!el) el = this.xtag.data.generator();
            return el;
        },
        clearMsg: function () {
            elRemoveChildren(this,this.xtag.data.frag);
        },
        printArray: function (arr,fnRender) {
            fnRender = fnRender || function (el,d) {
                el.innerHTML = d;
            }
            this.clearMsg();
            elsEach(arr,function(a) {
                var el = this.getChild();
                fnRender.call(this,el,a);
                this.appendChild(el);
            },this);
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
    prototype: xtags["my-msg"].prototype,
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
            this.xtag.data.looper = undefined;
        }
        ,startLoop: function (interval,data,dataContext,render) {
            interval = interval || 1000;
            this.stopLoop();
            this.xtag.data.looper = setInterval(
                function(myContext,data,dataContext,render){
                    myContext.printArray.call(myContext
                        ,data.call(dataContext)
                        ,render
                    );
                }
                ,interval,this,data,dataContext,render
            );
        }
        ,stopLoop: function () {
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
            this.xtag.data.msgtxt = { };
            this.xtag.data.msgtxt["ready"     ] = function () { return "Connecting"; }
            this.xtag.data.msgtxt["connected" ] = function () { return "Connected" ; }
            this.xtag.data.msgtxt["responded" ] = function () { return this.method=="GET"? "Getting"    : this.method=="POST"?"Posting" :"Sending"; }
            this.xtag.data.msgtxt["processing"] = function () { return this.method=="GET"? "Loading"    : this.method=="POST"?"Saving"  :"Loading"; }
            this.xtag.data.msgtxt["success"   ] = function () { return this.method=="GET"? "Data loaded": this.method=="POST"?"Saved"   :"Success"; }
            this.xtag.data.msgtxt["error"     ] = function () { return "Error"     ; }
            this.xtag.data.dots = "";
            this.xtag.data.maxLen = 9;

            this.xtag.data.msgloop = document.createElement("MY-MSG-LOOP");
            this.appendChild(this.xtag.data.msgloop);
        },
        composeHandlerWithMsg: function (handler) {
            var newHandler = {};
            for(var k in handler) {
                newHandler[k] = (function (key,val,tagContext) {
                    return function () {
                        val.apply(tagContext,arguments);
                        tagContext.xtag.data.dots = "";
                        if(k=="success" || k=="error") {
                            tagContext.xtag.data.msgloop.stopLoop();
                            tagContext.xtag.data.msgloop.printArray([tagContext.xtag.data.msgtxt[k]()]);
                        } else {
                            tagContext.xtag.data.msgloop.startLoop(1000
                                ,function(){
                                    if(tagContext.xtag.data.dots.length>tagContext.xtag.data.maxLen) {
                                        tagContext.xtag.data.dots = "";
                                    }
                                    tagContext.xtag.data.dots = tagContext.xtag.data.dots + ".";
                                    return [tagContext.xtag.data.msgtxt[key]()+tagContext.xtag.data.dots];
                                }
                                ,tagContext
                            )
                        }
                    }
                })(k,handler[k],this)
            }
            return newHandler;
        },
        fire: function (data,success,error,ready,connected,responded,processing) {
            var handler = {};
            if(ready     ) handler["ready"      ] = ready     ;
            if(connected ) handler["connected"  ] = connected ;
            if(responded ) handler["responded"  ] = responded ;
            if(processing) handler["processing" ] = processing;
            if(success   ) handler["success"    ] = success   ;
            if(error     ) handler["error"      ] = error     ;
            console.log(this.composeHandlerWithMsg(handler))

            return ajax({method:this.method, action:this.action, params:data||{} }, this.composeHandlerWithMsg(handler) );
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

