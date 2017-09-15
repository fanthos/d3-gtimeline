import { timelineAxisLeft, timelineAxisRight, timelineAxisNone } from './timelineaxis';
import tooltip from './tooltip';
import { durationFormat, f } from './utils';

function getFontSize(element) {
    var style = window
        .getComputedStyle(element, null)
        .getPropertyValue('font-size');
    return parseFloat(style);
}

function luma_BT709(c) {
    return c.r * 0.299 + c.g * 0.587 + c.b * 0.114;
}

function isBright(color) {
    return luma_BT709(color) > 165; // original is 186, but I prefer that value
}

function textColor(value) {
    return isBright(d3.color(value)) ? 'black' : 'white';
}

function translate(x, y) {
    return 'translate(' + x + ',' + y + ')';
}

export default function () {
    var padding = 5;
    var reversed = false;
    var today = false;
    var dates;
    var constWidth;
    var duration = 0;
    var names = f(0);
    var starts = f(1);
    var ends = f(2);
    var knownColor;

    function chart(selection) {
        // Known colors for static data,
        // should add for very common state string manually.
        // Distribute the color data like complete binary tree
        function getColorRange(x) {
            if (x === 0) return 0;
            if (x === 1) return 0.5;
            var y = Math.floor(Math.log2(x));
            var e = Math.pow(2, y);
            var n = x - e;
            var a;
            if (y % 2 === 1) {
                if (n % 2 === 0) {
                    a = n + 1;
                } else {
                    a = n + e;
                }
            } else {
                // eslint-disable-next-line no-lonely-if
                if (n % 2 === 0) {
                    a = e - n - 1;
                } else {
                    a = e + e - n;
                }
            }
            return a / (e + e);
        }
        var colorDict = new Map();
        var colorIndex = 0;
        // Custom color assign
        function getColor(name) {
            var ret;
            if (knownColor) {
                ret = knownColor[name];
            }
            if (ret === undefined) {
                ret = colorDict.get(name);
            }
            if (ret === undefined) {
                var h1 = getColorRange(colorIndex);
                ret = d3.hcl(h1 * 360, 75, 65);
                colorIndex++;
                colorDict.set(name, ret);
            }
            return ret;
        }
        var dataTable = selection.datum();
        var rows = d3.map(dataTable, x => x.label).keys();

        dates = dates || [
            d3.min(dataTable, d => d.start),
            d3.max(dataTable, d => d.end)
        ];

        selection.each(function (data) {
            var width = constWidth || this.getBoundingClientRect().width;
            var height = rows.length * (getFontSize(this) + 4 * padding);
            var yScale = d3.scaleBand().domain(rows).range([0, height]);
            var xScale = d3.scaleTime().domain(dates);
            var yAxis;
            if (data.length === 1) {
                yAxis = timelineAxisNone(yScale).width(width);
            } else {
                yAxis = (reversed ? timelineAxisRight : timelineAxisLeft)(yScale)
                    .width(width);
            }
            var thisNode = d3.select(this);
            thisNode.style('position', 'relative');
            thisNode.select('div').remove();
            thisNode.select('svg').remove();
            var svg = thisNode.append('svg').attr('class', 'timeline');
            var tip = new tooltip(this, tooltipHtml);

            svg.attr('width', width);
            svg.attr('height', height + 20); // margin.bottom

            var g = svg.append('g');
            //g.selectAll('g.task').remove();

            var yGroup = g.append('g')
                .attr('class', 'y axis')
                .call(yAxis);

            var range = yAxis.range();
            xScale.range([range[0], range[1]]).clamp(true);
            var xAxis = d3.axisBottom(xScale);
            var xGroup = g.append('g')
                .attr('class', 'x axis')
                .attr('transform', translate(0, height))
                .call(xAxis);

            xGroup.select('.domain').remove();
            xGroup.selectAll('.tick line')
                .attr('stroke', '#AAA')
                .attr('stroke-width', 0.75)
                .attr('y1', -height);

            var ticks = xScale.ticks().map(xScale);
            yGroup.call(yAxis.draw_ticks, ticks);

            var padding2 = padding + padding;
            var yScaleList = data.map(x => yScale(x.label) + padding);
            var yScaleBandwidth = yScale.bandwidth() - padding2;

            g.append('g').selectAll('g').data(data).enter()
                .append('g')
                .attr('transform', d => 'translate(0, ' + yScale(d.label) + ')')
                .classed('task', true)
                .each((data1, i1, node1) => {
                    d3.select(node1[i1])
                        .selectAll('rect')
                        .data(d => d.data)
                        .enter()
                        .each((data2, i2, n) => {
                            var g2 = d3.select(n[i2]);
                            var bgColor = getColor(names(data2));
                            var xStart = xScale(starts(data2));
                            var xWidth = xScale(ends(data2)) - xStart;
                            g2.append('rect')
                                .attr('y', 5)
                                .attr('x', xStart)
                                .attr('width', xWidth + 0.5)
                                .attr('height', yScaleBandwidth)
                                .attr('data-y', yScaleList[i1] + yScaleBandwidth)
                                .on('mouseover', tip.show)
                                .on('mouseout', tip.hide)
                                .attr('fill', bgColor);

                            // Dont fill text if no enough space
                            if (xWidth > padding2) {
                                // Hide text for small node
                                var str1 = names(data2);
                                var t = g2.append('text')
                                    .attr('x', xStart)
                                    .attr('y', 5)
                                    .attr('dx', padding)
                                    .attr('dy', yScaleBandwidth / 2 + padding)
                                    .attr('text-anchor', 'start')
                                    .attr('fill', 'black')
                                    .attr('pointer-events', 'none')
                                    .text(str1);
                                if (xWidth - padding < t.node().getComputedTextLength()) {
                                    t.remove();
                                }
                            }
                        });
                });
            if (today)
                selection.append('path')
                    .attr('stroke', 'red')
                    .attr('d', 'M' + xScale(new Date) + ',0.5V' + height);
        });
    }

    //chart.axis     = function(_) { return arguments.length? (axis  = _, chart): axis ; };
    chart.dates    = function(_) { return arguments.length? (dates = _, chart): dates; };
    chart.width    = function(_) { return arguments.length? (const_width = _, chart): const_width; };
    chart.today    = function(_) { return arguments.length? (today = _, chart): today; };
    chart.colors   = function(_) { return arguments.length? (colors = _, chart): colors; };
    chart.padding  = function(_) { return arguments.length? (padding = _, chart): padding; };
    chart.reversed = function(_) { return arguments.length? (reversed = _, chart): reversed; };
    chart.duration = function(_) { return arguments.length? (duration = _, chart): duration; };
    chart.knownColor = function(_) { return arguments.length? (knownColor = _, chart): knownColor; };

    return chart;
    
    function tooltipHtml(d) {
        // Format date for human
        var seconds = (ends(d) - starts(d)) / 1000;
        var dateFormat;
        if (seconds < 3600 * 18) {
            dateFormat = '%H:%M:%S';
        } else if (seconds < 86400 * 7) {
            dateFormat = '%m-%d %H:%M';
        } else {
            dateFormat = '%Y-%m-%d';
        }
        var format = x => d3.timeFormat(dateFormat)(d3.isoParse(x));
        return '<b>' + names(d) + '</b>' +
            '<hr style="margin: 2px 0 2px 0">' +
            format(starts(d)) + ' - ' + format(ends(d)) + '<br>' +
            durationFormat(seconds);
    }
}
