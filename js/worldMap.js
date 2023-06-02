// The svg
let svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection.
let projection = d3.geoNaturalEarth1()
    .scale(width / 2.1 / Math.PI)
    .translate([width / 2.2, height / 2]);

// A path generator
let path = d3.geoPath()
    .projection(projection);

// Load in GeoJSON data
d3.json("../data/circuits2000.geojson", function (data) {

    // Load external data and boot
    d3.json("../data/world_map.geojson", function (world) {

        // Merge the two datasets
        let features = data.features.concat(world.features);

        // Draw the map
        let map = svg.selectAll("path")
            .data(features)
            .enter().append("path")
            .attr("fill", "#bdbdbd")
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .style("stroke", "#fff")
            .style("opacity", 0.8);

        // Draw the circuits as dots on the map
        let markers = svg.selectAll("circle")
            .data(data.features)
            .enter().append("circle")
            .attr("cx", function(d) {
                return projection(d.geometry.coordinates)[0];
            })
            .attr("cy", function(d) {
                return projection(d.geometry.coordinates)[1];
            })
            .attr("r", 5)
            .style("fill", "#e00600")
            .style("opacity", 0.7)
            .on("mouseover", function(d) {
                d3.select(this)
                    .attr('opacity', 0.9)
                    .style("fill", "#3A5F6F");
                // Show the name of the circuit on mouseover
                svg.append("text")
                    .attr("class", "circuits")
                    .attr("x", projection(d.geometry.coordinates)[0] + 10)
                    .attr("y", projection(d.geometry.coordinates)[1] + 5)
                    .text(d.properties.name + ", " + d.properties.location);
            })
            .on("mouseout", function(d) {
                d3.select(this)
                    .attr("r", 5)
                    .style("fill", "#e00600")
                    .style("opacity", 0.7);
                // Hide the name of the circuit on mouseout
                svg.selectAll(".circuits").remove();
            })
            .on("click", function(d) {
                window.location.href = "formula1Circuits.html?circuit=" + encodeURIComponent(d.properties.id);
            })


    });
});
