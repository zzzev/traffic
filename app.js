// simple 24x7 chart of traffic accident data from California, 2003-2012

var min,        // domain of data
    max,
    host,       // d3 selection for .content area 
    svg,        // "          " of svg element
    colorScale, // d3 scale for colors
    dayScale,   // "      " for days
    width,      // dimensions are based on screen size
    height,
    chartWidth, 
    chartHeight,
    squareSize;

var SQUARE_PADDING = 5,
    HOURS_PER_DAY = 24,
    DAYS_PER_WEEK = 7,
    LEGEND_WIDTH = 40,
    CHART_PADDING = 20,
    DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    HOUR_LABELS = ['Midnight', '', '', '', '', '',
                       '6 AM', '', '', '', '', '',
                       'Noon', '', '', '', '', '',
                       '6 PM', '', '', '', '', ''];

d3.csv('/data.csv', function(d) {
    // remove loader
    d3.select('.loading').remove();

    d.forEach(function(row, i) {
        // take string raw data in all caps keys and store int version in lower case key
        d3.map(row).forEach(function(key, val) {
            row[key.toLowerCase()] = parseInt(val);
            delete row[key];
        });
        if (min == null || row.count < min) {
            min = row.count;
        }
        if (max == null || row.count > max) {
            max = row.count;
        }
    })
    console.log(min + ' ' + max);

    // set up basic d3 selections
    host = d3.select('.content');
    width = host.node().clientWidth;
    height = host.node().clientHeight;
    svg = host.append('svg')
        .attr('width', width)
        .attr('height', height);

    // scales
    dayScale = d3.scale.ordinal()
        .domain(d3.range(1, 7))
        .range(DAY_LABELS);
    hourScale = d3.scale.ordinal()
        .domain(d3.range(0, 23))
        .range(HOUR_LABELS);
    colorScale = d3.scale.linear()
        .domain([min, max])
        .range('blue', 'green')

    // calculate dimensions
    chartWidth = width - LEGEND_WIDTH - (CHART_PADDING * 2);
    chartHeight = height - LEGEND_WIDTH - (CHART_PADDING * 2);
    squareSize = Math.floor(Math.min(100, chartWidth / (HOURS_PER_DAY + 1), chartHeight / (DAYS_PER_WEEK + 1))) - SQUARE_PADDING;

    // create legend / axes
    svg.selectAll('.day.axis').data(DAY_LABELS)

    // make basic 24x7 chart
    svg.selectAll('.datum').data(d)
        .enter().append('rect')
            .attr('width', squareSize)
            .attr('height', squareSize)
            .attr('x', function(d,i) { 
                return CHART_PADDING + LEGEND_WIDTH + d.hour * (squareSize + SQUARE_PADDING); 
            }).attr('y', function(d,i) {
                //return LEGEND_WIDTH + Math.floor(i / HOURS_PER_DAY) * (squareSize + SQUARE_PADDING);
                return CHART_PADDING + LEGEND_WIDTH + (d.dayweek - 1) * (squareSize + SQUARE_PADDING);
            }).attr('fill', function(d,i) { return colorScale.apply(d); });

});