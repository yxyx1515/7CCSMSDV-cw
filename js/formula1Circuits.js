function goBackMap() {
    window.location.href = "../html/HomePageWorldMap.html";
}

// Get the circuit ID from the URL
let urlParams = new URLSearchParams(window.location.search);
let circuitId0 = urlParams.get('circuit');

// set the dimensions and margins of the graph
let margin = {top: 50, right: 30, bottom: 50, left: 60},
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg = d3.select("#drivers_data")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("../data/drivers_min.csv",

    function(d){
        return { raceId: +d.raceId, circuit: d.circuit, circuitId: +d.circuitId, date : d3.timeParse("%Y-%m-%d")(d.date), min_millis : +d.min_millis }
    },
    // Use dataset:
    function(data) {

        // Filter data by circuitId
        data = data.filter(function(d) { return d.circuitId == circuitId0; });
        console.log(data);

        // Get circuit name from circuitId
        let circuitName = data[0].circuit;

        // Add title to the graph
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .attr("stroke", "#5f5f5f")
            .style("font-size", "32px")
            .text("Race Results: Winners of the " + circuitName.charAt(0).toUpperCase() + circuitName.substr(1).toLowerCase() +  " Grand Prix");

        // Add X axis
        let x = d3.scaleTime()
            .domain([
                d3.timeMonth.offset(d3.min(data, function(d) { return d.date; }), -1),
                d3.timeMonth.offset(d3.max(data, function(d) { return d.date; }), 1)
            ])
            .range([ 0, width ]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add X axis label
        svg.append("text")
            .attr("transform",
                "translate(" + (width/2) + " ," +
                (height + margin.top - 10) + ")")
            .attr("stroke", "#5f5f5f")
            .style("text-anchor", "middle")
            .text("Date");

        // Add Y axis
        let y = d3.scaleLinear()
            .domain([d3.min(data, function(d) { return d.min_millis; }) - 5000, d3.max(data, function(d) { return d.min_millis; }) + 5000])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add Y axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - (margin.left + 6))
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .attr("stroke", "#5f5f5f")
            .style("text-anchor", "middle")
            .text("Average time in each race in milliseconds");

        // Add the line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) { return x(d.date) })
                .y(function(d) { return y(d.min_millis) })
            );

        // Add the line
        let line = svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#8BA583")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) { return x(d.date) })
                .y(function(d) { return y(d.min_millis) })
            );

        // Add the markers
        let markers = svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return x(d.date); })
            .attr("cy", function(d) { return y(d.min_millis); })
            .attr("r", 5)
            .style("fill", "#3A5F6F")
            .style("opacity", 0.7);

        // Add mouseover event
        markers.on("mouseover", function(d) {
            d3.select(this)
                .attr('opacity', 0.5)
                .style("fill", "#e00600");
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Date: " + d.date.toLocaleDateString() + "<br/>" + "Average time (ms): " + Math.round(d.min_millis))
                .style("left",  (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
                .style("transform", "translate(-50%, -50%)");
        })
            .on("mouseout", function(d) {
                d3.select(this)
                    .attr("r", 5)
                    .style("fill", "#3A5F6F")
                    .style("opacity", 0.7);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function(d) {
                window.location.href = "winnerLapTimes.html?race=" + encodeURIComponent(d.raceId);
            });

        // Add tooltip
        let tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

    }
);
