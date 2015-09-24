var width = window.innerWidth,
    height = window.innerHeight,
    svg = d3.select("#world").append("svg")
        .attr("width", width)
        .attr("height", height),
    logo = svg.append("g").attr('id', 'logo').style("fill", "transparent"),
    polygonDataLeft = [],
    polygonDataRight = [],
    polygonDataBottom = [],
    scaleGlob = width / 150,
    massX = width / 2 - 70 / 2 * scaleGlob,
    massY = height / 2 - 70 / 2 * scaleGlob,
    countNode = width/3,
    clasterNode = 3,
    maxRadius = 12,
    padding = 2,
    clusters = new Array(clasterNode),
    clusterPadding = maxRadius,
    nodes = d3.range(countNode).map(function () {
        var i = Math.floor(Math.random() * clasterNode),
            r = Math.sqrt((i + 1) / clasterNode * -Math.log(Math.random())) * maxRadius,
            d = {cluster: i, radius: r};
        if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
        return d;
    }),
    force = d3.layout.force()
        .gravity(.02)
        .charge(0)
        .nodes(nodes)
        .size([width, height]);

logo.append("path").attr('id', 'petalLeft').attr("d", "M40 40 C26 28 16 32 12 26 S8 18 10 14 S36 10 40 40");
logo.append("path").attr('id', 'petalRight').attr("d", "M45 40 S28 10 44 10 S48 36 45 40");
logo.append("path").attr('id', 'petalBottom').attr("d", "M40 45 S40 56 24 56 Q28 26 40 45");
logo.attr("transform",
    function () {
        return "translate(" + massX + "," + massY + ") scale(" + scaleGlob + ")"
    });

$("#logo").find("path").each(function () {

    var path = this,
        len = path.getTotalLength(),
        p = path.getPointAtLength(0),
        logo = {
            "petalLeft": function (point) {
                polygonDataLeft.push([point.x * scaleGlob + massX, point.y * scaleGlob + massY]);
            },
            "petalRight": function (point) {
                polygonDataRight.push([point.x * scaleGlob + massX, point.y * scaleGlob + massY]);
            },
            "petalBottom": function (point) {
                polygonDataBottom.push([point.x * scaleGlob + massX, point.y * scaleGlob + massY]);
            }
        };

    for (var i = 1; i < len; i++) {
        p = path.getPointAtLength(i);
        logo[this.id](p)
    }

});

for (i = 0; i < polygonDataLeft.length; i++) {
    svg.append("circle").attr("cx", polygonDataLeft[i][0]).attr("cy", polygonDataLeft[i][1]).attr("r", Math.random() * (6 - 1) + 1).style("fill", "orange")
}

for (i = 0; i < polygonDataRight.length; i++) {
    svg.append("circle").attr("cx", polygonDataRight[i][0]).attr("cy", polygonDataRight[i][1]).attr("r", Math.random() * (6 - 1) + 1).style("fill", "green")
}

for (i = 0; i < polygonDataBottom.length; i++) {
    svg.append("circle").attr("cx", polygonDataBottom[i][0]).attr("cy", polygonDataBottom[i][1]).attr("r", Math.random() * (6 - 1) + 1).style("fill", "#AAD5F3")
}

svg.append("g").attr('name', 'bubbles').selectAll("circle")
    .data(nodes.slice(1))
    .enter().append("circle")
    .attr('class', 'bubble')
    .attr("r", function (d) {
        return d.radius;
    });

force.start();
force.on("tick", function (e) {

    // Push different nodes in different directions for clustering.
    var k = 50 * e.alpha;

    svg.selectAll("circle.bubble")
        .each(collide(.5))
        .each(cluster(10 * e.alpha * e.alpha))
        .attr("cx", function (d, i) {
            if (pointInPolygon(d, polygonDataLeft) || pointInPolygon(d, polygonDataRight) || pointInPolygon(d, polygonDataBottom)) {
                return d.x += i % 2 ? k : -k;
            }
            return d.x
        })
        .attr("cy", function (d, i) {
            if (pointInPolygon(d, polygonDataLeft) || pointInPolygon(d, polygonDataRight) || pointInPolygon(d, polygonDataBottom)) {
                return d.y += i % 2 ? k : -k;
            }
            return d.y
        })
        .style("fill", function (d) {
            if (pointInPolygon(d, polygonDataBottom)) {
                return '#AAD5F3';
            }
            if (pointInPolygon(d, polygonDataLeft)) {
                return 'orange';
            }
            if (pointInPolygon(d, polygonDataRight)) {
                return 'green';
            }
        });
});

svg.on("click", function () {
    force.resume();
});

pointInPolygon = function (point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    var xi, xj, i, intersect,
        x = point.x,
        y = point.y,
        radius = point.radius / 2,
        inside = false;

    for (i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        xi = vs[i][0];
        yi = vs[i][1];
        xj = vs[j][0];
        yj = vs[j][1];
        intersect = ((yi > y + radius) != (yj > y + radius))
            && (x + radius < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

// Move d to be adjacent to the cluster node.
function cluster(alpha) {
    return function (d) {
        var cluster = clusters[d.cluster];
        if (cluster === d) return;
        var x = d.x - cluster.x,
            y = d.y - cluster.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + cluster.radius;
        if (l != r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            cluster.x += x;
            cluster.y += y;
        }
    };
}

function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function (d) {
        var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
        quadtree.visit(function (quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== d)) {
                var x = d.x - quad.point.x,
                    y = d.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
                if (l < r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
    };
}