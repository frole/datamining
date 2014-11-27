!function(){
	var bP={};	
	var b=30, bb=150, height=600, buffMargin=1, minHeight=14;
        var c1=[-180, 40], c2=[-100, 130], c3=[-10, 200];//Column positions of labels.
	var colors =["#3366CC", "#DC3912",  "#FF9900","#109618", "#990099", "#0099C6"];
        var rowClusterJob = [["doc1","doc2","doc3"],["doc4","doc5","doc6"],["doc7","doc8","doc9"]];

        var jobgenre = ["Docs","Terms"];
		
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
	
	function visualize(data,rowClusterProp,colClusterProp){
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
//console.log(data.data[0].map(function(d){ return d3.sum(d);}));
//console.log(data.data[1].map(function(d){ return d3.sum(d);}));
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
	
	function drawPart(data, id, p, test,rowClusterProp,colClusterProp){
                var prop = [rowClusterProp,colClusterProp];
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
	
	function transitionPart(data, id, p,prop,info){
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
	
	function transition(data, id,rowClusterPro,colClusterPro,info){
                var prop = [rowClusterPro,colClusterPro];
		transitionPart(data, id, 0,prop,info);
		transitionPart(data, id, 1,prop,info);
		transitionEdges(data, id);
	}
	
	bP.draw = function(data, svg){
		data.forEach(function(biP,s){
			svg.append("g")
				.attr("id", biP.id)
				.attr("transform","translate("+ (550*s)+",0)");	
			var visData = visualize(biP.data,biP.rowClusterProp,biP.colClusterProp);
                        var info = {};
                        info.labels = [biP.rowClusterJob,biP.colClusterGenre];
                        info.proportions = [biP.rowClusterJobProp,biP.colClusterGenreProp];                        

			drawPart(visData, biP.id, 0,info,biP.rowClusterProp,biP.colClusterProp);
			drawPart(visData, biP.id, 1,info,biP.rowClusterProp,biP.colClusterProp); 
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
                                                                        //Show the tooltip
                                                                        d3.select("#tooltip").classed("hidden", false);
                                                                         return bP.selectSegment(data, p, i,biP.rowClusterProp,biP.colClusterProp,info); })
					.on("mouseout",function(d, i){   d3.select(this).classed("cell-hover",false);
					                                                    $("#info").empty(); 
                                                                         d3.select("#tooltip").classed("hidden", true);
                                                                         return bP.deSelectSegment(data, p, i,biP.rowClusterProp,biP.colClusterProp,info); });	
			});
		});	
	}
	
	bP.selectSegment = function(data, m, s,rowClusterPro,colClusterPro,info){
		data.forEach(function(k){
			var newdata =  {keys:[], data:[]};	
				
			newdata.keys = k.data.keys.map( function(d){ return d;});
			
			newdata.data[m] = k.data.data[m].map( function(d){ return d;});
			
			newdata.data[1-m] = k.data.data[1-m]
				.map( function(v){ return v.map(function(d, i){ return (s==i ? d : 0);}); });
			
			transition(visualize(newdata,rowClusterPro,colClusterPro), k.id,rowClusterPro,colClusterPro,info);
				
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
	
	bP.deSelectSegment = function(data, m, s,rowClusterPro,colClusterPro,info){
		data.forEach(function(k){
			transition(visualize(k.data,rowClusterPro,colClusterPro), k.id,rowClusterPro,colClusterPro,info);
			
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

