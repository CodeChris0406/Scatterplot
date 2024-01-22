// Define dimensions and margins for the graph
const margin = { top: 20, right: 20, bottom: 30, left: 50 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// Create an SVG element
const svg = d3
  .select("#scatterplot")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Fetch the data
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
).then((data) => {
  // Define the scales
  const xScale = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.Year) - 1, d3.max(data, (d) => d.Year) + 1])
    .range([0, width]);

  const yScale = d3
    .scaleTime()
    .domain(
      d3.extent(
        data,
        (d) => new Date(0, 0, 0, 0, d.Time.split(":")[0], d.Time.split(":")[1])
      )
    )
    .range([0, height]);

  // Define the axes
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

  // Add the x-axis
  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add the y-axis
  svg.append("g").attr("id", "y-axis").call(yAxis);

  // Add dots for the scatterplot
  svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 5)
    .attr("cx", (d) => xScale(d.Year))
    .attr("cy", (d) =>
      yScale(new Date(0, 0, 0, 0, d.Time.split(":")[0], d.Time.split(":")[1]))
    )
    .attr("data-xvalue", (d) => d.Year)
    .attr(
      "data-yvalue",
      (d) => new Date(0, 0, 0, 0, d.Time.split(":")[0], d.Time.split(":")[1])
    )
    .style("fill", (d) => (d.Doping ? "red" : "green")); // Color based on doping allegations

  // Add tooltips
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute");

  svg
    .selectAll(".dot")
    .on("mouseover", function (event, d) {
      const x =
        xScale(d.Year) + svg.node().getBoundingClientRect().left + margin.left;
      const y =
        yScale(
          new Date(0, 0, 0, 0, d.Time.split(":")[0], d.Time.split(":")[1])
        ) +
        svg.node().getBoundingClientRect().top +
        margin.top;

      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(d.Name + ": " + d.Year + "<br/> Time: " + d.Time)
        .style("left", x + "px")
        .style("top", y + "px")
        .attr("data-year", d.Year);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Add legend
  const legendContainer = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", "translate(" + (width - 200) + "," + 20 + ")"); // Adjust as needed

  const legendData = [
    { text: "Doping allegations", color: "red" },
    { text: "No doping allegations", color: "green" }
  ];

  const legendItem = legendContainer
    .selectAll(".legend-item")
    .data(legendData)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

  legendItem
    .append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", (d) => d.color);

  legendItem
    .append("text")
    .attr("x", -80)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text((d) => d.text);
});
