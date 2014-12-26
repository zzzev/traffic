// simple 24x7 chart of traffic accident data from California, 2003-2012
// by Zev Youra - zevyoura.com

var min,        // domain of data
    max,
    host,       // d3 selections
    svg,
    dayAxis,
    hourAxis,
    colorScale, // d3 scales for colors
    dayScale,
    hourScale,
    width,      // dimensions (based on screen size)
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

// load csv formated data; originally sourced from http://tims.berkeley.edu/page.php?page=switrs_resources
d3.csv('/data.csv', function(d) {
    // remove loader
    d3.select('.loading').remove();

    // calculate domain (min/max) of data
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

    // set up scales
    dayScale = d3.scale.ordinal()
        .domain(d3.range(1, 8))
        .range(DAY_LABELS);
    hourScale = d3.scale.ordinal()
        .domain(d3.range(0, 23))
        .range(HOUR_LABELS);
    colorScale = d3.scale.linear()
        .domain([min, max])
        .range([d3.rgb('white'), d3.rgb('green')]);

    // calculate dimensions
    chartWidth = width - LEGEND_WIDTH - (CHART_PADDING * 2);
    chartHeight = height - LEGEND_WIDTH - (CHART_PADDING * 2);
    squareSize = Math.floor(Math.min(100, chartWidth / (HOURS_PER_DAY + 1), chartHeight / (DAYS_PER_WEEK + 1))) - SQUARE_PADDING;

    // create legend / axes
    dayAxis = svg.append('g')
        .classed('axis', true)
        .classed('day', true);
    dayAxis.selectAll('.tick').data(d3.range(1, 8))
        .enter().append('text')
            .classed('tick', true)
            .attr('x', CHART_PADDING)
            .attr('y', function(d, i) { console.log(d); return CHART_PADDING + LEGEND_WIDTH + ((i + 0.5) * (squareSize + SQUARE_PADDING))})
            .text(function(d) { return dayScale(d); });
    hourAxis = svg.append('g')
        .classed('axis', true)
        .classed('hour', true);
    hourAxis.selectAll('.tick').data(d3.range(0, 24))
        .enter().append('text')
            .classed('tick', true)
            .attr('x', function(d, i) { return CHART_PADDING + LEGEND_WIDTH + (i * (squareSize + SQUARE_PADDING))})
            .attr('y', CHART_PADDING + (LEGEND_WIDTH / 2))
            .text(function(d) { return hourScale(d); });

    // make basic 24x7 chart
    svg.selectAll('.datum').data(d)
        .enter().append('rect')
            .attr('width', squareSize)
            .attr('height', squareSize)
            .attr('x', function(d,i) { 
                return CHART_PADDING + LEGEND_WIDTH + d.hour * (squareSize + SQUARE_PADDING); 
            }).attr('y', function(d,i) {
                // day of week is 1 indexed per data source
                return CHART_PADDING + LEGEND_WIDTH + (d.dayweek - 1) * (squareSize + SQUARE_PADDING);
            }).attr('fill', function(d,i) { return colorScale(d.count); });

});