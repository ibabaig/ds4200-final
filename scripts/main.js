const rail = d3.csv("data/mbta_ridership.csv", function(d) {
    return {
        route_name: d.route_name,
        average_flow: +d.average_flow
    };
  });

  rail.then(function(data) {
    console.log(data);
    const margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 60 
    };

    const width = 1250;
    const height = 800;

     const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.average_flow)])
        .nice()
        .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.route_name))
        .range([margin.top, height - margin.bottom])
        .padding(0.1);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.route_name))
        .range(["green", "steelblue", "orange", "red"]);

    const svg = d3.select("#plot")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr('id', 'plot')
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.selectAll("rect")
        .data(data)
        .join("rect")
        .attr("y", d => y(d.route_name))
        .attr("x", margin.left) 
        .attr("width", d => x(d.average_flow) - margin.left)
        .attr("height", y.bandwidth()) 
        .attr("fill", d => colorScale(d.route_name));

    // y axis label
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Route Name");

    // y axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // x axis label
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Average Flow of People");

    // x axis
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x));

  });