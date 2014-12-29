// simple 24x7 chart of traffic accident data from California, 2003-2012
// by Zev Youra - zevyoura.com

var data,       // raw csv data provided to d3.csv callback
    min,        // domain of data
    max,
    host,       // d3 selections
    svg,
    dayAxis,
    hourAxis,
    dayTicks,
    hourTicks,
    colorLegend,
    legendRect,
    legendLabels,
    datumSelection,
    selectOptions,
    colorScale, // d3 scale for square coloring
    dayScale,   // d3 ordinal scales for axis labels
    hourScale,
    width,      // dimensions (based on screen size)
    height,
    maxChartWidth, 
    maxChartHeight,
    squareSize,
    centerOffset,
    chartWidth,
    metrics,    // array of possible metrics
    metric;     // metric being visualized, one of [total, alcoholrelated]

var SQUARE_PADDING = 5,
    HOURS_PER_DAY = 24,
    DAYS_PER_WEEK = 7,
    LEGEND_WIDTH = 40,
    CHART_PADDING = 10,
    DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    HOUR_LABELS = ['Midnight', '', '', '', '', '',
                       '6 AM', '', '', '', '', '',
                       'Noon', '', '', '', '', '',
                       '6 PM', '', '', '', '', ''];
    METRIC_LABELS = {
        'total': 'All incidents',
        'alcoholrelated': 'Alcohol-related crashes',
        'fatal': 'Fatal crashes',
        'pedestrian': 'Crashes with pedestrians',
        'bicycle': 'Bicycle crashes',
        'motorcycle': 'Motorcycle crashes',
        'sleep': 'Sleeping drivers',
        'hitandrun': 'Hit and runs'
    };

var getTranslateString = function(x, y) {
    return 'translate(' + x + ',' + y + ')';
}

var setMetric = function(metricToSet) {
    metric = metricToSet;

    min = 0;    // zero for min to avoid distorting low values
    max = null; // max based on actual data's max
    data.forEach(function(row, i) {
        // calc min/max for given metric
        if (min == null || row[metric] < min) {
            min = row[metric];
        }
        if (max == null || row[metric] > max) {
            max = row[metric];
        }
    });

    legendLabels.data([min, max]);
    legendLabels.text(function(d) { return d; });

    colorScale
        .domain([min, max])
        .range([d3.rgb('white'), d3.rgb('green')]);

    datumSelection.transition().attr('fill', function(d,i) { 
        return colorScale(d[metric]); 
    });

    // update selector
    selectOptions.classed('selected', function(d) { return d == metric; });
}

var resize = function() {
    width = host.node().clientWidth;
    height = host.node().clientHeight;
    svg
        .attr('width', width)
        .attr('height', height);

    // calculate dimensions
    // 2 legends subtracted from width (day axis + color legend)
    maxCaxChartWidth = width - (2 * LEGEND_WIDTH) - (CHART_PADDING * 2);
    maxChartHeight = height - LEGEND_WIDTH - (CHART_PADDING * 2);
    squareSize = Math.floor(Math.min(50, 
                                     maxCaxChartWidth / (HOURS_PER_DAY + 1),
                                     maxChartHeight / (DAYS_PER_WEEK + 1)
                            )) - SQUARE_PADDING;
    chartWidth = HOURS_PER_DAY * (squareSize + SQUARE_PADDING);
    centerOffset = (width - chartWidth - 2 * LEGEND_WIDTH) / 2; 

    // update axis positions
    dayTicks
        .attr('x', CHART_PADDING + centerOffset)
        .attr('y', function(d, i) { return CHART_PADDING + LEGEND_WIDTH + ((i + 0.5) * (squareSize + SQUARE_PADDING))});
    hourTicks.attr('x', function(d, i) { return centerOffset + CHART_PADDING + LEGEND_WIDTH + (i * (squareSize + SQUARE_PADDING))});
    colorLegend.attr('transform', getTranslateString((CHART_PADDING * 2) + centerOffset + LEGEND_WIDTH + chartWidth, CHART_PADDING + LEGEND_WIDTH));
    legendRect.attr('height', (squareSize + SQUARE_PADDING) * DAYS_PER_WEEK - SQUARE_PADDING);
    legendLabels.attr('y', function(d, i) { return i == 0 ? 18 : (squareSize + SQUARE_PADDING) * DAYS_PER_WEEK - SQUARE_PADDING; });

    // update chart data positions
    datumSelection
        .attr('width', squareSize)
        .attr('height', squareSize)
        .attr('x', function(d,i) { 
            return centerOffset + CHART_PADDING + LEGEND_WIDTH + d.hour * (squareSize + SQUARE_PADDING); 
        }).attr('y', function(d,i) {
            // day of week is 1 indexed per data source
            return CHART_PADDING + LEGEND_WIDTH + (d.dayweek - 1) * (squareSize + SQUARE_PADDING);
        });
}

var processData = function(csv) {
    data = csv;

    // take string raw data in all caps keys and store int version in lower case key
    data.forEach(function(row, i) {
        d3.map(row).forEach(function(key, val) {
            row[key.toLowerCase()] = parseInt(val);
            delete row[key];
        });
    });

    metrics = d3.map(data[0]).keys().filter(function(key) { return key != 'dayweek' && key != 'hour'; });

    selectElt = d3.select('.selector')
        .text('')
        .on('mouseover', function(d, i) { selectElt.classed('open', true); })
        .on('mouseout', function(d, u) { selectElt.classed('open', false); });
    selectOptions = selectElt.selectAll('.option').data(metrics)
        .enter().append('div')
            .classed('option', true)
            .text(function(d,i) { return METRIC_LABELS[d]; })
            .on('click', function(d) {
                selectElt.classed('open', false);
                setMetric(d);
            });
}

var setupChart = function() {
    // remove loader
    d3.select('.loading').remove();

    // set up basic d3 selections
    host = d3.select('.content');
    svg = host.select('svg');

    // set up scales
    dayScale = d3.scale.ordinal()
        .domain(d3.range(1, 8))
        .range(DAY_LABELS);
    hourScale = d3.scale.ordinal()
        .domain(d3.range(0, 23))
        .range(HOUR_LABELS);
    colorScale = d3.scale.linear();

    // create legend / axes
    dayAxis = svg.append('g')
        .classed('axis', true)
        .classed('day', true);
    dayTicks = dayAxis.selectAll('.tick').data(d3.range(1, 8))
        .enter().append('text')
            .classed('tick', true)
            .text(function(d) { return dayScale(d); });
    hourAxis = svg.append('g')
        .classed('axis', true)
        .classed('hour', true);
    hourTicks = hourAxis.selectAll('.tick').data(d3.range(0, 24))
        .enter().append('text')
            .attr('y', CHART_PADDING + (LEGEND_WIDTH / 2))
            .classed('tick', true)
            .text(function(d) { return hourScale(d); });
    colorLegend = svg.append('g')
        .classed('legend', true);
    legendRect = colorLegend.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', LEGEND_WIDTH / 2);
    legendLabels = colorLegend.selectAll('text').data([0,1]).enter().append('text')
        .attr('x', LEGEND_WIDTH / 2 + 4);

    // make basic 24x7 chart
    datumSelection = svg.selectAll('.datum').data(data)
        .enter().append('rect');
}

// load csv formated data; originally sourced from http://tims.berkeley.edu/page.php?page=switrs_resources
d3.csv('data.csv', function(d) {
    processData(d);

    setupChart(d);

    resize();
    window.addEventListener('resize', resize);

    setMetric(metrics[0]);
});