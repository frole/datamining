/**
 * (c) Cotrino, 2012 (http://www.cotrino.com/)
 * 
 */

var w = 0, h = 0;
var chart = "network";
var networkChart = {
		vis : null,
		nodes : [],
		labelAnchors : [],
		labelAnchorLinks : [],
		links : [],
		force : null,
		force2 : null
};

var hideUnrelated = false;
var similarityThresholdMin = 100;
var similarityThresholdMax = 0;
var similarityThreshold = 0;

function restart(indexRow,indexCol) {

	if( d3.select("#graph") != null ) {
		d3.select("#graph").remove();
	}
	w = $('#graphHolder').width();
	h = $('#graphHolder').height();

	$('#similarity').html(Math.round(similarityThreshold)+"%");

	// clear network, if available
	if( networkChart.force != null ) {	networkChart.force.stop();	}
	if( networkChart.force2 != null ) {	networkChart.force2.stop();	}
	networkChart.nodes = [];
	networkChart.labelAnchors = [];
	networkChart.labelAnchorLinks = [];
	networkChart.links = [];


	if( chart == "network" ) {
		drawNetwork(indexRow,indexCol);
	} else if( chart == "chord" ) {
		drawChord();
	}
}

function about() {
    $("#about" ).dialog( "open" );
    return false;
}



function drawNetwork(indexRow,indexCol) {

	buildNetwork(indexRow,indexCol);

	$("#hint").html("Move the mouse over any node to show further information or click to grab the bubble around.");

	networkChart.vis = d3.select("#graphHolder").append("svg:svg").attr("id", "graph").attr("width", w).attr("height", h);

	networkChart.force = d3.layout.force().size([w, h])
	.nodes(networkChart.nodes).links(networkChart.links)
	.linkDistance(150).charge(-400)
	.linkStrength(function(x) {
		return x.weight * 10
	});
	networkChart.force.start();

	// brings everything towards the center of the screen
	networkChart.force2 = d3.layout.force()
	.nodes(networkChart.labelAnchors).links(networkChart.labelAnchorLinks)
        .linkDistance(0).linkStrength(8).charge(-100).size([w, h]);
	networkChart.force2.start();

	var link = networkChart.vis.selectAll("line.link")
	.data(networkChart.links).enter()
	.append("svg:line").attr("class", "link")
	.style("stroke", function(d, i) { return d.color })
        .on("mouseover", function(d, i) {
               //highlight text
               d3.select(this).classed("cell-hover",true);
        
               //Update the tooltip position and value
               d3.select("#tooltip")
                 .style("left", (d3.event.pageX+10) + "px")
                 .style("top", (d3.event.pageY-10) + "px")
                 .select("#value")
                 .text(d.desc);  
               //Show the tooltip
               d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function(){
               d3.select(this).classed("cell-hover",false);
               d3.select("#tooltip").classed("hidden", true);
        })
        ;

	var node = networkChart.vis.selectAll("g.node")
	.data(networkChart.force.nodes()).enter()
	.append("svg:g").attr("id", function(d, i) { return d.label }).attr("class", "node");
	node.append("svg:circle").attr("id",function(d, i) { return "c_"+d.label })
	.attr("r", function(d, i) { return d.size })
	.style("fill", function(d, i) { return d.color })
	.style("stroke", "#FFF").style("stroke-width", 2);
	node.call(networkChart.force.drag);
	//node.on("mouseover", function(d) {
		//showInformation(d.label);
        node.on('mouseover', function(d) {
            if (!selected.obj) {
                if (graph.mouseoutTimeout) {
                    clearTimeout(graph.mouseoutTimeout);
                    graph.mouseoutTimeout = null;
                }
                highlightObject(d);
            }
        })
        .on('mouseout', function() {
            if (!selected.obj) {
                if (graph.mouseoutTimeout) {
                    clearTimeout(graph.mouseoutTimeout);
                    graph.mouseoutTimeout = null;
                }
                graph.mouseoutTimeout = setTimeout(function() {
                    highlightObject(null);
                }, 300);
            }
        });


	var anchorLink = networkChart.vis.selectAll("line.anchorLink")
	.data(networkChart.labelAnchorLinks);

	var anchorNode = networkChart.vis.selectAll("g.anchorNode")
	.data(networkChart.force2.nodes()).enter()
	.append("svg:g").attr("class", "anchorNode");
	anchorNode.append("svg:circle")
	.attr("id",function(d, i) { return "ct_"+d.node.label })
	.attr("r", 0).style("fill", "#FFF");
	anchorNode.append("svg:text")
	.attr("id",function(d, i) { return "t_"+d.node.label })
	.text(function(d, i) {
		return i % 2 == 0 ? "" : d.node.label
	}).style("fill", function(d, i) { return d.node.textcolor })
	.style("font-family", "Arial")
	.style("font-size", 10)
	.on("mouseover", function(d) {
		showInformation(d.node.label);
	});

	var updateLink = function() {
		this.attr("x1", function(d) {
			return d.source.x;
		}).attr("y1", function(d) {
			return d.source.y;
		}).attr("x2", function(d) {
			return d.target.x;
		}).attr("y2", function(d) {
			return d.target.y;
		});

	}

	var updateNode = function() {
		this.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

	}

	networkChart.force.on("tick", function() {
		networkChart.force2.start();
		node.call(updateNode);
		anchorNode.each(function(d, i) {
			if(i % 2 == 0) {
				d.x = d.node.x;
				d.y = d.node.y;
			} else {
				var b = this.childNodes[1].getBBox();
				var diffX = d.x - d.node.x;
				var diffY = d.y - d.node.y;
				var dist = Math.sqrt(diffX * diffX + diffY * diffY);
				var shiftX = b.width * (diffX - dist) / (dist * 2);
				shiftX = Math.max(-b.width, Math.min(0, shiftX));
				var shiftY = 5;
				this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
			}
		});
		anchorNode.call(updateNode);
		link.call(updateLink);
		anchorLink.call(updateLink);
	});

}

function highlightObject(obj) {
    if (obj) {
        if (obj !== highlighted) {
            node.classed('inactive', function(d) {
                return (obj !== d
                     && d.depends.indexOf(obj.name) == -1
                     && d.dependedOnBy.indexOf(obj.name) == -1);
            });
            link.classed('inactive', function(d) {
                return (obj !== d.source && obj !== d.target);
            });
        }
        highlighted = obj;
    } else {
        if (highlighted) {
            node.classed('inactive', false);
            link.classed('inactive', false);
        }
        highlighted = null;
    }
}

function buildNetwork(indexRow,indexCol) {

	var newMapping = [];
	var k = 0;
	var nodesArray = nodesArray1[indexRow];
	var linksArray = linksArray1[indexRow];
	for(var i=0; i<nodesArray.length; i++) {
		var node = nodesArray[i];
		var draw = true;
		if( hideUnrelated ) {
			if( getAmountLinks(i,indexRow,indexCol) == 0 ) {
				draw = false;
			}
		}
		if( draw ) {
			newMapping[i] = k;
			networkChart.nodes.push(node);
			networkChart.labelAnchors.push({ node : node });
			networkChart.labelAnchors.push({ node : node	});
			k++;
		} else {
			newMapping[i] = -1;
		}
	}

	for(var j=0; j<linksArray.length; j++) {
		var link = linksArray[j];
		var sim = link.weight;
		adjustSlider(sim);

		// just draw the links if similarity is higher than the threshold
		// or the nodes exist
		if( sim >= similarityThreshold/100.0 && newMapping[link.source] != -1 && newMapping[link.target] != -1 ) {
			var newLink = { source : newMapping[link.source], target : newMapping[link.target], weight : sim, color : link.color, desc: link.desc };
			networkChart.links.push(newLink);
		}
	}

	// link labels to circles
	for(var i = 0; i < networkChart.nodes.length; i++) {
		networkChart.labelAnchorLinks.push({ source : i * 2, target : i * 2 + 1, weight : 1 });
	}
}

//adjust the scala of the slider
function adjustSlider(sim) {
	if( sim*100 > similarityThresholdMax ) {
		similarityThresholdMax = sim*100; 
	} else if( sim*100 < similarityThresholdMin ) {
		similarityThresholdMin = sim*100;
	}
}




function hide(indexRow,indexCol) {
	if( $('#hide_checkbox').is(':checked') ) {
		hideUnrelated = true;
		restart(indexRow,indexCol);
	} else {
		hideUnrelated = false;
		restart(indexRow,indexCol);
	}
}

function filterChange(event, ui) {
	similarityThreshold = ui.value;
	alert(ui.value);
	restart(ui.indexRow,ui.indexCol);
}

function chartChange(value,indexRow,indexCol) {
	chart = value;
	restart(indexRow,indexCol);
}

function getAmountLinks(n,indexRow,indexCol) {
	var linksAmount = 0;
	var linksArray = linksArray1[indexRow];
	for(var j=0; j<linksArray.length; j++) {
		var link = linksArray[j];
		if( (link.source == n || link.target == n) && link.weight >= similarityThreshold/100.0 ) {
			linksAmount ++;
		}
	}
	return linksAmount;
}

function showInformation(language) {
	var url = "http://en.wikipedia.org/wiki/"+language+"_language";
	var n = nodesHash[language];
	$('#language_information').html(nodesArray[n].desc);
}
