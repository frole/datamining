!function(){
	var bP={};	
	var b=30, bb=150, height=600, buffMargin=1, minHeight=14;
        var c1=[-180, 40], c2=[-100, 130], c3=[-10, 200];//Column positions of labels.
	var colors =["#3366CC", "#DC3912",  "#FF9900","#109618", "#990099", "#0099C6"];
        var rowClusterJob = [["student","other","educator"],["student","administrator","other"],["other","student","writer"],["librarian","administrator","artist"],["student","programmer","educator"],["educator","administrator","lawyer"]];
//var rowClusterProp = [217,140,195,172,125,94];
//var colClusterProp = [98,48,138,80,972,204, 74,68];

var rowClusterProp = [217,140,195,172,125,94];
var colClusterProp = [98,138,80, 74,68];

        var colClusterGenreProp = [[{"Action":0.17,"Adventure":0.09,"Animation":0.06,"Children":0.08,"Comedy":0.15,"Crime":0.04,"Drama":0.08,"Musical":0.08,"Romance":0.13,"Sci-Fi":0.04,"Thriller":0.08,"Western":0.02}],[{"Action":0.09,"Adventure":0.06,"Animation":0.03,"Comedy":0.09,"Drama":0.37,"Musical":0.03,"Mystery":0.03,"Romance":0.11,"Sci-Fi":0.03,"Thriller":0.03,"War":0.09,"Western":0.06}],[{"Action":0.11,"Adventure":0.02,"Comedy":0.11,"Crime":0.05,"Drama":0.18,"Film-Noir":0.02,"Horror":0.05,"Musical":0.02,"Mystery":0.09,"Romance":0.09,"Sci-Fi":0.02,"Thriller":0.18,"War":0.05}],[{"Action":0.15,"Adventure":0.13,"Animation":0.02,"Children":0.04,"Comedy":0.08,"Crime":0.04,"Drama":0.19,"Mystery":0.02,"Romance":0.1,"Sci-Fi":0.12,"Thriller":0.06,"War":0.06}], [{"Action":0.18,"Adventure":0.08,"Comedy":0.08,"Crime":0.04,"Drama":0.16,"Film-Noir":0.02,"Horror":0.02,"Mystery":0.02,"Romance":0.06,"Sci-Fi":0.12,"Thriller":0.12,"War":0.08}]];

        var rowClusterJobProp = [[{"educator":0.1,"engineer":0.1,"other":0.25,"programmer":0.1,"student":0.3,"technician":0.1,"writer":0.05}], [{"administrator":0.2,"healthcare":0.05,"marketing":0.1,"other":0.2,"student":0.3,"technician":0.05,"writer":0.1}],[{"artist":0.05,"educator":0.05,"executive":0.05,"healthcare":0.05,"librarian":0.05,"other":0.35,"programmer":0.05,"retired":0.05,"student":0.15,"writer":0.15}], [{"administrator":0.15,"artist":0.1,"doctor":0.05,"entertainment":0.05,"executive":0.05,"healthcare":0.05,"librarian":0.25,"programmer":0.05,"student":0.1,"technician":0.05,"writer":0.1}], [{"educator":0.1,"none":0.05,"other":0.1,"programmer":0.15,"salesman":0.05,"student":0.5,"writer":0.05}], [{"administrator":0.15,"educator":0.3,"engineer":0.05,"executive":0.05,"healthcare":0.05,"lawyer":0.1,"other":0.1,"retired":0.05,"student":0.1,"technician":0.05}]];

        var rowClusterGenrProp = [{"Male":0.9,"Female":0.1},{"Male":0.35,"Female":0.65},{"Male":0.85,"Female":0.15},{"Male":0.75,"Female":0.25},{"Male":0.8,"Female":0.2},{"Male":0.85,"Female":0.15}];

        var rowClusterAgeProp = [{"[07-->17]":0,"[18-->25]":0.55,"[26-->34]":0.15,"[35-->44]":0.15,"[45-->54]":0.15,"[55-->75]":0},{"[7-->17]":0,"[18-->25]":0.3,"[26-->34]":0.4,"[35-->44]":0.25,"[45-->54]":0.05,"[55-->75]":0},{"[7-->17]":0.1,"[18-->25]":0.15,"[26-->34]":0.4,"[35-->44]":0.05,"[45-->54]":0,"[55-->75]":0.3},{"[7-->17]":0,"[18-->25]":0.15,"[26-->34]":0.3,"[35-->44]":0.25,"[45-->54]":0.25,"[55-->75]":0.05},{"[7-->17]":0.05,"[18-->25]":0.5,"[26-->34]":0.4,"[35-->44]":0.05,"[45-->54]":0,"[55-->75]":0},{"[7-->17]":0,"[18-->25]":0.05,"[26-->34]":0.2,"[35-->44]":0.25,"[45-->54]":0.3,"[55-->75]":0.2}]

//[["other","student","writer"],["student","programmer","other"],["student","engineer","administrator"],["educator","administrator","engineer"],["student","other","engineer"],["programmer","student","educator"],["student","educator","administrator"]];

        var colClusterGenre = [["Action","Comedy","Romance"],["Drama","Romance","Action"],["Drama","Thriller","Action"],["Drama","Action","Adventure"],["Action","Drama","Sci-Fi"]];
//[["Action","Sci-Fi","Thriller"],["Drama","Thriller","Action"],["Drama","Comedy","Children"],["Drama","Comedy","Crime"],["Action","Adventure","Drama"],["Comedy","Drama","Romance"],["Drama","Comedy","Romance"],["Drama","Crime","Action"],["Drama","Comedy","Thriller"],["Drama","Action","Crime"]];

/*var rowClusterJob = [["educator","administrator","librarian"],["student","other","educator"],["programmer","engineer","administrator"],["student","other","educator"],["student","programmer","other"]];
var colClusterGenre = [["Comedy","Action","Animation"],["Action","Drama","Comedy"],["Comedy","Drama","Action"],["Drama","Comedy","War"],["Drama","Comedy","Thriller"],["Drama","Comedy","Romance"],["Drama","Action","Thriller"],["Drama","Action","Comedy"]];*/

        var info = {};
        var jobgenre = ["Jobs","Genres"];
        info.labels = [rowClusterJob,colClusterGenre];
        info.proportions = [rowClusterJobProp,colClusterGenreProp];
        var prop = [rowClusterProp,colClusterProp];
		
		function bySortedValue(obj) {
    var tuples = [];

    for (var key in obj) tuples.push([key, obj[key]]);

    tuples.sort(function(a, b) { return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0 }); return tuples;}
	
	bP.partData = function(data,p){
		var sData={};
		
		sData.keys=[
			d3.set(data.map(function(d){ return d[0];})).values().sort(function(a,b){ return ( a<b? -1 : a>b ? 1 : 0);}),
			d3.set(data.map(function(d){ return d[1];})).values().sort(function(a,b){ return ( a<b? -1 : a>b ? 1 : 0);})		
		];
		
		sData.data = [	sData.keys[0].map( function(d){ return sData.keys[1].map( function(v){ return 0; }); }),
						sData.keys[1].map( function(d){ return sData.keys[0].map( function(v){ return 0; }); }) 
		];
		
		data.forEach(function(d){ 
			sData.data[0][sData.keys[0].indexOf(d[0])][sData.keys[1].indexOf(d[1])]=d[p];
			sData.data[1][sData.keys[1].indexOf(d[1])][sData.keys[0].indexOf(d[0])]=d[p]; 
		});
		
		return sData;
	}
	
	function visualize(data){
		var vis ={};
		function calculatePosition(a, s, e, b, m){
			var total=d3.sum(a);
			var sum=0, neededHeight=0, leftoverHeight= e-s-2*b*a.length;
			var ret =[];
			var dz = 0;
			a.forEach(
				function(d){ 
				    dz = dz+1;
					//alert(dz);
					var v={};
					v.percent = (total == 0 ? 0 : d/total); 
					v.value=d;
					v.height=Math.max(v.percent*(e-s-2*b*a.length), m);
					(v.height==m ? leftoverHeight-=m : neededHeight+=v.height );
					ret.push(v);
				}
			);
			
			var scaleFact=leftoverHeight/Math.max(neededHeight,1), sum=0;
			console.log(ret);
			ret.forEach(
				function(d){ 
					d.percent = scaleFact*d.percent; 
					d.height=(d.height==m? m : d.height*scaleFact);
					d.middle=sum+b+d.height/2;
					d.y=s + d.middle - d.percent*(e-s-2*b*a.length)/2;
					d.h= d.percent*(e-s-2*b*a.length);
					d.percent = (total == 0 ? 0 : d.value/total);
					sum+=2*b+d.height;
				}
			);
			return ret;
		}
console.log(data.data[0].map(function(d){ return d3.sum(d);}));

console.log(data.data[1].map(function(d){ return d3.sum(d);}));
		vis.mainBars = [ 
			calculatePosition( rowClusterProp, 0, height, buffMargin, minHeight),
			calculatePosition( colClusterProp, 0, height, buffMargin, minHeight)
		];
		
		vis.subBars = [[],[]];
		vis.mainBars.forEach(function(pos,p){
			pos.forEach(function(bar, i){	
				calculatePosition(data.data[p][i], bar.y, bar.y+bar.h, 0, 0).forEach(function(sBar,j){ 
					sBar.key1=(p==0 ? i : j); 
					sBar.key2=(p==0 ? j : i); 
					vis.subBars[p].push(sBar); 
				});
			});
		});
		vis.subBars.forEach(function(sBar){
			sBar.sort(function(a,b){ 
				return (a.key1 < b.key1 ? -1 : a.key1 > b.key1 ? 
						1 : a.key2 < b.key2 ? -1 : a.key2 > b.key2 ? 1: 0 )});
		});
		
		vis.edges = vis.subBars[0].map(function(p,i){
			return {
				key1: p.key1,
				key2: p.key2,
				y1:p.y,
				y2:vis.subBars[1][i].y,
				h1:p.h,
				h2:vis.subBars[1][i].h
			};
		});
		vis.keys=data.keys;
		return vis;
	}
	
	function arcTween(a) {
		var i = d3.interpolate(this._current, a);
		this._current = i(0);
		return function(t) {
			return edgePolygon(i(t));
		};
	}
	
	function drawPart(data, id, p, test){
		d3.select("#"+id).append("g").attr("class","part"+p)
			.attr("transform","translate("+( p*(bb+b))+",0)");
		d3.select("#"+id).select(".part"+p).append("g").attr("class","subbars");
		d3.select("#"+id).select(".part"+p).append("g").attr("class","mainbars");
		
		var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
			.selectAll(".mainbar").data(data.mainBars[p])
			.enter().append("g").attr("class","mainbar").attr("width",100);

		mainbar.append("rect").attr("class","mainrect")
			.attr("x", 0).attr("y",function(d){ return d.middle-d.height/2; })
			.attr("width",b).attr("height",function(d){ return d.height; })
			.style("shape-rendering","auto")
			.style("fill-opacity",0).style("stroke-width","0.5")
			.style("stroke","black").style("stroke-opacity",0);
			
		mainbar.append("text").attr("class","barlabel")
			.attr("x", c1[p]).attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return data.keys[p][i];})
			.attr("text-anchor","start" );
			
		mainbar.append("text").attr("class","barvalue")
			.attr("x", c2[p]).attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return prop[p][i]; /*d.value*/ ;})
			.attr("text-anchor","end");
			
		mainbar.append("text").attr("class","barpercent")
			.attr("x", c3[p]).attr("y",function(d){ return d.middle+5;})
                        .append("tspan")
			.text(function(d,i){ return (test.labels[p][i][0]) /*"( "+Math.round(100*d.percent)+"%)"*/ ;})
			.attr("text-anchor","end");

                mainbar.append("text").attr("class","barpercent1")
			.attr("x", c3[p]).attr("y",function(d){ return d.middle+18;})
                        .append("tspan")
			.text(function(d,i){ return (test.labels[p][i][1]) /*"( "+Math.round(100*d.percent)+"%)"*/ ;})
			.attr("text-anchor","end");

		d3.select("#"+id).select(".part"+p).select(".subbars")
			.selectAll(".subbar").data(data.subBars[p]).enter()
			.append("rect").attr("class","subbar")
			.attr("x", 0).attr("y",function(d){ return d.y})
			.attr("width",b).attr("height",function(d){ return d.h})
			.style("fill",function(d){ return colors[d.key1];});
	}
	
	function drawEdges(data, id){
		d3.select("#"+id).append("g").attr("class","edges").attr("transform","translate("+ b+",0)");

		d3.select("#"+id).select(".edges").selectAll(".edge")
			.data(data.edges).enter().append("polygon").attr("class","edge")
			.attr("points", edgePolygon).style("fill",function(d){ return colors[d.key1];})
			.style("opacity",0.5).each(function(d) { this._current = d; });	
	}	
	
	function drawHeader(header, id){
		d3.select("#"+id).append("g").attr("class","header").append("text").text(header[2])
			.style("font-size","20").attr("x",108).attr("y",-20).style("text-anchor","middle")
			.style("font-weight","bold");
		
		[0,1].forEach(function(d){
			var h = d3.select("#"+id).select(".part"+d).append("g").attr("class","header");
			
			h.append("text").text(header[d]).attr("x", (c1[d]-30))
				.attr("y", -5).style("fill","grey");
			
			h.append("text").text("Count").attr("x", (c2[d]-20))
				.attr("y", -5).style("fill","grey");
			h.append("text").text(jobgenre[d]).attr("x", (c2[d]+50))
				.attr("y", -5).style("fill","grey");
			h.append("line").attr("x1",c1[d]-10).attr("y1", -2)
				.attr("x2",c3[d]+10).attr("y2", -2).style("stroke","black")
				.style("stroke-width","1").style("shape-rendering","crispEdges");
		});
	}
	
	function edgePolygon(d){
		return [0, d.y1, bb, d.y2, bb, d.y2+d.h2, 0, d.y1+d.h1].join(" ");
	}	
	
	function transitionPart(data, id, p){
		var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
			.selectAll(".mainbar").data(data.mainBars[p]);
		
		mainbar.select(".mainrect").transition().duration(500)
			.attr("y",function(d){ return d.middle-d.height/2;})
			.attr("height",function(d){ return d.height;});
			
		mainbar.select(".barlabel").transition().duration(500)
			.attr("y",function(d){ return d.middle+5;});
			
		mainbar.select(".barvalue").transition().duration(500)
			.attr("y",function(d){ return d.middle+5;}).text(function(d,i){ return prop[p][i]; /*d.value*/ ;});

		mainbar.select(".barpercent")
			.attr("x", c3[p]).attr("y",function(d){ return d.middle+5;})
                        .select("tspan")
			.text(function(d,i){ return (info.labels[p][i][0]) /*"( "+Math.round(100*d.percent)+"%)"*/ ;})
			.attr("text-anchor","end");
                mainbar.select(".barpercent1")
			.attr("x", c3[p]).attr("y",function(d){ return d.middle+18;})
                        .select("tspan")
			.text(function(d,i){ return (info.labels[p][i][1]) /*"( "+Math.round(100*d.percent)+"%)"*/ ;})
			.attr("text-anchor","end");
			
		d3.select("#"+id).select(".part"+p).select(".subbars")
			.selectAll(".subbar").data(data.subBars[p])
			.transition().duration(500)
			.attr("y",function(d){ return d.y}).attr("height",function(d){ return d.h});
	}
	
	function transitionEdges(data, id){
		d3.select("#"+id).append("g").attr("class","edges")
			.attr("transform","translate("+ b+",0)");

		d3.select("#"+id).select(".edges").selectAll(".edge").data(data.edges)
			.transition().duration(500)
			.attrTween("points", arcTween)
			.style("opacity",function(d){ return (d.h1 ==0 || d.h2 == 0 ? 0 : 0.5);});	
	}
	
	function transition(data, id){
		transitionPart(data, id, 0);
		transitionPart(data, id, 1);
		transitionEdges(data, id);
	}
	
	bP.draw = function(data, svg){
		data.forEach(function(biP,s){
			svg.append("g")
				.attr("id", biP.id)
				.attr("transform","translate("+ (550*s)+",0)");
				
			var visData = visualize(biP.data);
			drawPart(visData, biP.id, 0,info);
			drawPart(visData, biP.id, 1,info); 
			drawEdges(visData, biP.id);
			drawHeader(biP.header, biP.id);
			
			[0,1].forEach(function(p){			
				d3.select("#"+biP.id)
					.select(".part"+p)
					.select(".mainbars")
					.selectAll(".mainbar")
					.on("mouseover",function(d, i){ d3.select(this).classed("cell-hover",true);
                                                                        /*d3.select("#tooltip")
                                                                          .style("left", (d3.event.pageX+10) + "px")
                                                                          .style("top", (d3.event.pageY-10) + "px");*/
                                                                          //.select("#value")
                                                                         $("#info").empty(); 
								         $("#info").append('<div id="graphHolder">Proportions</div>');
								         $("#graphHolder").append('<ul id="Proportions">')
										 temp = bySortedValue(info.proportions[p][i][0]);
									for(r in  temp){
                                                                                 $("#Proportions")
                                                                                 .append('<li> '+temp[r][0]+': '+ temp[r][1]+'</li>'); 
                                                                         }  
									$("#graphHolder").append('</ul>')
                                                                        if(p==0){$("#graphHolder").append('Gender proportions ')
                                                                                 $("#graphHolder").append('<ul id="Gender_proportions">')
                                                                                 $("#Gender_proportions")
                                                                                 .append('<li> Male: '+ rowClusterGenrProp[i].Male+'</li>'+
                                                                                         '<li> Female: '+ rowClusterGenrProp[i].Female+'</li>'
                                                                                 ); 
                                                                                 $("#graphHolder").append('Age proportions ')
                                                                                 $("#graphHolder").append('<ul id="Age_proportions">')
                                                                                 for(r in  rowClusterAgeProp[i]){
                                                                                     $("#Age_proportions")
                                                                                     .append('<li> '+r+': '+ rowClusterAgeProp[i][r]+'</li>'); 
                                                                                 }  
                                                                                 
                                                                        }
                                                                        //Show the tooltip
                                                                        d3.select("#tooltip").classed("hidden", false);
                                                                         return bP.selectSegment(data, p, i); })
					.on("mouseout",function(d, i){   d3.select(this).classed("cell-hover",false);
					                                                    $("#info").empty(); 
                                                                         d3.select("#tooltip").classed("hidden", true);
                                                                         return bP.deSelectSegment(data, p, i); });	
			});
		});	
	}
	
	bP.selectSegment = function(data, m, s){
		data.forEach(function(k){
			var newdata =  {keys:[], data:[]};	
				
			newdata.keys = k.data.keys.map( function(d){ return d;});
			
			newdata.data[m] = k.data.data[m].map( function(d){ return d;});
			
			newdata.data[1-m] = k.data.data[1-m]
				.map( function(v){ return v.map(function(d, i){ return (s==i ? d : 0);}); });
			
			transition(visualize(newdata), k.id);
				
			var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
				.selectAll(".mainbar").filter(function(d,i){ return (i==s);});
                        //d3.select("#"+k.id).classed("cell-hover",true);
			selectedBar.select(".mainrect").style("stroke-opacity",1);			
			selectedBar.select(".barlabel").style('font-weight','bold');
			selectedBar.select(".barvalue").style('font-weight','bold');
			selectedBar.selectAll(".barpercent").style('font-weight','bold');
			selectedBar.selectAll(".barpercent1").style('font-weight','bold');
		});
	}	
	
	bP.deSelectSegment = function(data, m, s){
		data.forEach(function(k){
			transition(visualize(k.data), k.id);
			
			var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
				.selectAll(".mainbar").filter(function(d,i){ return (i==s);});
			selectedBar.select(".mainrect").style("stroke-opacity",0);			
			selectedBar.select(".barlabel").style('font-weight','normal');
			selectedBar.select(".barvalue").style('font-weight','normal');
			selectedBar.selectAll(".barpercent").style('font-weight','normal');
			selectedBar.selectAll(".barpercent1").style('font-weight','normal');
		});		
	}
	
	this.bP = bP;
}();

