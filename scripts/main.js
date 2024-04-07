const data = d3.csv("data/mbta_rideship.csv");

data.then(function(data) {
   // Group data by route_name
   const groupedData = d3.group(data, d => d.route_name);

   // Calculate average_flow for each route
   const averageFlows = Array.from(groupedData, ([route_name, values]) => ({
       route_name,
       average_flow: d3.mean(values, d => +d.average_flow)
   }));

   // Sort routes by average_flow in des8cending order
   averageFlows.sort((a, b) => b.average_flow - a.average_flow);

   // Set up dimensions for the plot
   let
      width = 600,
      height = 500;
   
   let margin ={
      top: 50,
      bottom: 130,
      left: 130,
      right: 100
   }
   // const margin = { top: 30, right: 30, bottom: 70, left: 60 };

   let svg = d3
       .select("body")
       .append("svg")
       .attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
       .attr('id', 'plot')
       .append("g")
       .attr("transform", `translate(${margin.left},${margin.top})`);

   // Define x scale
   const xScale = d3.scaleBand()
       .domain(averageFlows.map(d => d.route_name))
       .range([0, width])
       .padding(0.1);

   // Define y scale
   const yScale = d3.scaleLinear()
       .domain([0, d3.max(averageFlows, d => d.average_flow)])
       .nice()
       .range([height, 0]);

   // Draw bars
   let bars = svg.selectAll(".bar")
       .data(averageFlows)
       .enter().append("rect")
       .attr("class", "bar")
       .attr("x", d => x(d.route_name))
       .attr("width", x.bandwidth())
       .attr("y", d => y(d.average_flow))
       .attr("height", d => height - y(d.average_flow))
       .on("mouseover", function(event, d) {
           // Adding tooltip here for interactivity
           tooltip.style("opacity", 1)
               .html(`<strong>Route Name:</strong> ${d.route_name}<br><strong>Average Flow:</strong> ${d.average_flow}`)
               .style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 20) + "px");
       })
       .on("mouseout", function() {
           // Hiding tooltip if not hovering
           tooltip.style("opacity", 0);
       });

   // x-axis
   svg.append("g")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(x))
       .selectAll("text")
       .style("text-anchor", "end")
       .attr("dx", "-.8em")
       .attr("dy", "-.55em")
       .attr("transform", "rotate(-90)");

   // y-axis
   svg.append("g")
       .call(d3.axisLeft(y));

   // Add chart title
   svg.append("text")
       .attr("x", (width / 2))
       .attr("y", 0 - (margin.top / 2))
       .attr("text-anchor", "middle")
       .style("font-size", "16px")
       .text("Average Flow vs Route Name");

   // Define tooltip
   const tooltip = d3.select("body").append("div")
       .attr("class", "tooltip")
       .style("opacity", 0);

}).catch(function(error) {
   console.log(error);
});

// d3.csv("data/mbta_rideship.csv").then(function(data) {
//     // Group the data
//     const groupedData = d3.group(data, d => d.route_name, d => d.day_type_name);
//     const routes = Array.from(groupedData.keys());

//     // Now, let's compute the mean 'average_flow' for each route and day type
//     const meanFlows = routes.map(route => {
//       const dayTypes = Array.from(groupedData.get(route).keys());
//       const meanFlowObj = { route_name: route };
//       dayTypes.forEach(dayType => {
//         const averageFlows = groupedData.get(route).get(dayType).map(d => +d.average_flow); // Convert average_flow to number
//         const meanFlow = d3.mean(averageFlows);
//         meanFlowObj[dayType] = meanFlow;
//       });
//       return meanFlowObj;
//     });

//     // Now, 'meanFlows' contains the aggregated data similar to unstacked DataFrame
//     console.log(meanFlows);

//     // Set up dimensions for the plot
//     var margin = {top: 50, right: 50, bottom: 50, left: 50},
//         width = 800 - margin.left - margin.right,
//         height = 500 - margin.top - margin.bottom;

//     // Create SVG container
//     var svg = d3.select("#plot-container")
//                 .append("svg")
//                 .attr("width", width + margin.left + margin.right)
//                 .attr("height", height + margin.top + margin.bottom)
//                 .append("g")
//                 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//     // Extract route names and day types
//     var dayTypes = Object.keys(meanFlows[0]).filter(key => key !== "route_name");

//     // Stack the data
//     var stack = d3.stack().keys(dayTypes);
//     var stackedData = stack(meanFlows);

//     // Set x and y scales
//     var x = d3.scaleBand()
//               .domain(routes)
//               .range([0, width])
//               .padding(0.1);

//     var y = d3.scaleLinear()
//               .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
//               .nice()
//               .range([height, 0]);

//     // Set color scale
//     var color = d3.scaleOrdinal()
//                   .domain(dayTypes)
//                   .range(d3.schemeCategory10);

//      svg.selectAll(".serie")
//         .data(stackedData)
//         .join("g")
//         .attr("class", "serie")
//         .attr("fill", d => color(d.key))
//         .selectAll("rect")
//         .data(d => d)
//         .join("rect")
//         .attr("x", d => x(d.data.route_name))
//         .attr("y", d => y(d[1]))
//         .attr("height", d => y(d[0]) - y(d[1]))
//         .attr("width", x.bandwidth())
//         // Add tooltips
//         .append("title")
//         .text(d => {
//         const routeName = d.data.route_name;
//         const dayType = d3.select(this.parentNode).datum().key;
//         const averageFlow = meanFlows.find(route => route.route_name === routeName)[dayType];
//         return `Route: ${routeName}\nDay Type: ${dayType}\nAverage Flow: ${averageFlow}`;
//         });

//      // Add hover effects
//      svg.selectAll("rect")
//         .on("mouseover", function() {
//         d3.select(this).attr("fill", "orange");
//         })
//         .on("mouseout", function() {
//         d3.select(this).attr("fill", d => color(d3.select(this.parentNode).datum().key));
//         });

//     // Add x axis
//     svg.append("g")
//        .attr("transform", "translate(0," + height + ")")
//        .call(d3.axisBottom(x))
//        .selectAll("text")
//        .style("text-anchor", "end")
//        .attr("transform", "rotate(-45)");

//     // Add y axis
//     svg.append("g")
//        .call(d3.axisLeft(y));

//     // Add chart title and axis labels
//     svg.append("text")
//        .attr("x", (width / 2))
//        .attr("y", 0 - (margin.top / 2))
//        .attr("text-anchor", "middle")
//        .style("font-size", "18px")
//        .text("Ridership Trends by Day Type for Different Routes");

//     svg.append("text")
//        .attr("x", width / 2)
//        .attr("y", height + margin.top / 2)
//        .attr("text-anchor", "middle")
//        .style("font-size", "14px")
//        .text("Route Name");

//     svg.append("text")
//        .attr("transform", "rotate(-90)")
//        .attr("y", 0 - margin.left / 2)
//        .attr("x", 0 - (height / 2))
//        .attr("dy", "1em")
//        .style("font-size", "14px")
//        .style("text-anchor", "middle")
//        .text("Average Flow");
//   });