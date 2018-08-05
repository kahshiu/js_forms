document.getElementById("mm").onclick=function(ev){
var t = ev.target;
var target = t.getAttribute("target");
if(target==="m1" || target==="m2") {
	document.getElementById(target).showContent();
}
}

var fdate = document.getElementsByName("fdate");
var m = document.getElementById("m");
fdate[0].onfocus=function(){console.log(m.getManager("calendar").scroller.items.length)}
fdate[1].onfocus=function(){console.log(m.getManager("calendar").scroller.items.length)}
fdate[2].onfocus=function(){console.log(m.getManager("calendar").scroller.items.length)}
fdate[3].onfocus=function(){console.log(m.getManager("calendar").scroller.items.length)}

		var tr1 = document.getElementById("tr1");
		var tr2 = document.getElementById("tr2");
		tr1.setPipeline(
			undefined
			,function(td,data,index,list) {
				td.setData("tet");
			}
			,function(td,data,index,list) {
				td.textContent = td.getData();
			}
		)
		tr2.setPipeline(
			function(td,data,index,list) {
				return td? td: document.createElement("td")
			}
			,function(td,data,index,list) {
			}
			,function(td,data,index,list) {
				td.textContent = index;
			}
		)
		tr1.renderData(["test","something","within","row"])
		tr2.renderData(["test","something","within","row2"])
		
					var tb2 = document.getElementById("tb2");
		tb2.setPipeline(
			undefined
			,undefined
			,function(tr,data,index,list) {
				if(index>0) {
					tr.setPipeline(
						undefined
						,undefined
						,function(td,data,index,list) {
							if(index>2) {
								td.textContent = "GOAL!"
							} else {
								td.textContent = td.getData();
							}
						}
					)
				} else {
					tr.setPipeline(
						undefined
						,undefined
						,function(td,data,index,list) {
							if(index==0) {
								td.textContent = "000"
							} else {
								td.textContent = td.getData();
							}
						}
					)
				}
				tr.renderData(data);
			}
		)
		tb2.renderData([
			  ["test","something","within","row"]
			 ,["test2","something2","within2","row2"]
			 ,["test3","something3","within3","row3"]
		]);
		
var items = [];
		
var count = 0;

var loop = document.getElementById("loop");
loop.startLoop(
1000
,function(){
	items.push(count++);
	if(count>20) {
		this.stopLoop();
	}
	return items;
}
,loop
);

var jax = document.getElementById("jax");
jax.fire({}
,function(x){console.log("success",x)}
,function(x){console.log("error",x)}
);