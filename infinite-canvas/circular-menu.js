function createCircularMenu(config) {
  // has two dependencies, d3 and drawingCollection (for string.format)
    var width = window.innerWidth;
    var height = window.innerHeight;
    var translation = "translate({x}, {y})";

    // config: {
    //  radius: 120,
    //  donutWidth: 65,
    //  data: [{color: "#550000", content: "red"}, {...}],
    //  onMenuSelection: function (selected) {
    //    // 'selected' is the data object corresponding to the selection made, so this is an object with data defined by you, in data: [...]
    //  }
    // }
    config = config || {};

    if (!config.radius) {
        config.radius = 120;
    }
    if (!config.donutWidth) {
        config.donutWidth = 65;
    }
    if (!config.onMenuSelection) {
        config.onMenuSelection = function() {
            console.log("You forgot to add an onMenuSelection handler to your createCircularMenu(config) object!")
        };
    }

    // expressed in percentages of the total radius
    // 0 means no donut, 100% means no chart :(
    var color = d3.scale.ordinal()
        .range(['#A60F2B', '#648C85', '#B3F2C9', '#528C18', '#C3F25C']);

    var svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var container = svg.append("g")
        .attr("transform", translation.format({
            x: width / 2,
            y: height / 2
        }));

    var arc = d3.svg.arc()
        .innerRadius(config.radius * (config.donutWidth / 100))
        .outerRadius(config.radius);

    var pie = d3.layout.pie()
        .value(function() {
            return 1;
        })
        .sort(null);

    var arcs = container.selectAll("path")
        .data(pie(config.data))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", function(d, i) {
            return d.data.color;
        });

    window.addEventListener("resize", function(event) {
        width = window.innerWidth;
        height = window.innerHeight;

        svg.attr("width", width)
           .attr("height", height);
    });

    window.addEventListener("contextmenu", function(event) {
        event.preventDefault();
        return false;
    });

    arcs.style("display", "none");

    (function() {
        var startPos;
        var rightMouseDown = false;
        var selection;
        var line = svg
            .append("line")
            .attr("stroke", "CornflowerBlue")
            .attr("stroke-width", 2);

        window.addEventListener("mousedown", function(event) {
            if (event.which === 3) {
                startPos = {
                    x: event.clientX,
                    y: event.clientY
                };
                container.attr("transform", translation.format(startPos));
                arcs.style("display", "inherit");
                rightMouseDown = true;

                line
                    .style("display", "inherit")
                    .attr("x1", startPos.x)
                    .attr("y1", startPos.y)
                    .attr("x2", startPos.x)
                    .attr("y2", startPos.y);
            }
        });

        window.addEventListener("mousemove", function(event) {
            if (rightMouseDown) {
                line
                    .attr("x2", event.clientX)
                    .attr("y2", event.clientY);

                var pos = {
                    x: event.clientX - startPos.x,
                    y: event.clientY - startPos.y
                };

                // added half a PI because mouse angle 0 is at ->
                // while our menu's angle 0 is at ^
                //                                |
                // I added 90 deg (pi/2) to line them up.
                var mouseAngle = Math.atan2(pos.y, pos.x) + (Math.PI / 2);
                if (mouseAngle < 0) {
                    mouseAngle += Math.PI * 2;
                }
                var angle = 0;
                var arcSpan = (Math.PI * 2) / arcs[0].length;
                for (var i = 0; i < arcs[0].length; i++) {

                    if (mouseAngle > angle && mouseAngle < angle + arcSpan) {
                        selection = config.data[i];
                        arcs[0][i].setAttribute("class", "circularMenuSelected");
                    } else {
                        arcs[0][i].setAttribute("class", "");
                    }
                    angle += arcSpan;
                }
            }
        });

        window.addEventListener("mouseup", function(event) {
            if (event.which === 3) {
                arcs.style("display", "none");
                line.style("display", "none");
                rightMouseDown = false;
                if (selection) {
                    config.menuSelectionHandler(selection);
                }
            }
        });
    }());
}
