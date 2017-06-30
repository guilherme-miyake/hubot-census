
var render = function(svg, datasource, timeformat, filter) {

  var margin = {top: 20, right: 120, bottom: 30, left: 30},
      width = window.innerWidth - margin.left - margin.right,
      height = svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var parseTime = d3.timeParse(timeformat);

  var x = d3.scaleTime().range([0, width]),
      y = d3.scaleLinear().range([height, 0]),
      z = d3.scaleOrdinal(d3.schemeCategory10);

  var line = d3.line()
      .curve(d3.curveBasis)
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.operations); });

  d3.tsv(datasource, type, function(error, data) {
    if (error) throw error;

    var operations = data.columns.slice(1).map(function(id) {
      return {
        id: id,
        values: data.map(function(d) {
          return {date: d.date, operations: d[id]};
        })
      };
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));

    y.domain([
      d3.min(operations, function(c) { return d3.min(c.values, function(d) { return d.operations; }); }),
      d3.max(operations, function(c) { return d3.max(c.values, function(d) { return d.operations; }); })
    ]);

    z.domain(operations.map(function(c) { return c.id; }));

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Operations per month");

    var op = g.selectAll(".operations")
      .data(operations)
      .enter().append("g")
      .attr("class", "operations");

    op.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.id); });

    op.append("text")
      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.operations) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "12px sans-serif")
      .text(function(d) { return d.id; });
  });

  function type(d, _, columns) {
    d.date = parseTime(d.date);
    for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
    return d;
  }

};

var svgmonth = d3.select("svg.bymonth");
render(svgmonth, "data/all_months.tsv", "%Y%m", function(d) {
  return true;
});
