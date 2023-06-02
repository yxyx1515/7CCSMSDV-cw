function goBackCircuits() {
    window.history.back();
}

// Get the race ID from the URL
let urlParams = new URLSearchParams(window.location.search);
let raceId0 = urlParams.get('race');

// set the dimensions and margins of the graph
let margin = {top: 50, right: 30, bottom: 50, left: 60},
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg = d3.select("#winnerLapTime")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("../data/winner_lap_time.csv",

    function(d){
        return { raceId: +d.raceId, circuit: d.circuit, circuitId: +d.circuitId, date : d3.timeParse("%Y-%m-%d")(d.date), name : d.fullname, lap : d.lap, millis : +d.milliseconds }
    },

    // Use dataset:
    function(data) {

        // Filter data by circuitId
        data = data.filter(function(d) { return d.raceId == raceId0; });

        // Get circuit name from circuitId
        let driverName = data[0].name;
        let raceDate = data[0].date;

        // Add title to the graph
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "32px")
            .attr("stroke", "#5f5f5f")
            .text(driverName + "'s lap times on " + raceDate.toLocaleDateString());

        // Add X axis
        let x = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.lap +3 })])
            .range([0, width]);
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
            .text("Lap");

        // Add Y axis
        let y = d3.scaleLinear()
            .domain([d3.min(data, function(d) { return d.millis; }) - 5000, d3.max(data, function(d) { return d.millis; }) + 5000])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add Y axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - (margin.left + 5))
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .attr("stroke", "#5f5f5f")
            .style("text-anchor", "middle")
            .text("Lap time in milliseconds");

        // Add the line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#8BA583")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) { return x(d.lap) })
                .y(function(d) { return y(d.millis) })
            );

        // Compute the average lap time
        let avgLapTime = d3.mean(data, function(d) { return d.millis; });

        // Add the average line
        let averageLine = svg.append("line")
            .attr("x1", 0)
            .attr("y1", y(avgLapTime))
            .attr("x2", width)
            .attr("y2", y(avgLapTime))
            .attr("stroke", "#e00600")
            .attr("stroke-width", 3.5)
            .attr("stroke-dasharray", "10");

        // Add mouseover event
        averageLine.on("mouseover", function(d) {
            d3.select(this)
                .attr("stroke", "#e00600")
                .attr("stroke-width", 5.5)
                .attr("stroke-dasharray", "15");
            // Show the value of the average lap time on mouseover
            svg.append("text")
                .attr("class", "average-text")
                .attr("x", 950)
                .attr("y", y(avgLapTime) - 5)
                .attr("fill", "#e00600")
                .text("Average (ms): " + Math.round(avgLapTime));
        })
            .on("mouseout", function(d) {
                d3.select(this)
                    .attr("stroke", "#e00600")
                    .attr("stroke-width", 3.5)
                    .attr("stroke-dasharray", "10")
                svg.select(".average-text").remove();
            })
            .on("click", function (d) {
                window.history.back();
            });

        // Add the markers
        let markers = svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return x(d.lap); })
            .attr("cy", function(d) { return y(d.millis); })
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
            tooltip.html("Lap: " + d.lap + "<br/>" + "Lap time (ms): " + Math.round(d.millis) )
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
            });

        // Add tooltip
        let tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

    }
);
