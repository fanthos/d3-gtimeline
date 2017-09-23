(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';

var tooltip = function (domobj, htmlFunc) {
    if (!domobj) {
        domobj = 'body';
    }

    var selection = d3.select(domobj).append('div')
        .style('position', 'absolute')
        .style('padding', '10px')
        .style('background', '#fff')
        .style('border', '1px solid #aaa')
        .style('border-radius', '2px')
        .style('z-index', '32767')
        .style('pointer-events', 'none')
        .style('opacity', 0);

    var htmlNode = selection.node();

    selection.show = function (d, i, r) {
        // selection.interrupt();
        var datay = r[0].attributes['data-y'].value;
        // var lastleft = htmlNode.style['left'];
        // var lastright = htmlNode.style['right'];
        var x1 = parseInt(r[0].attributes.x.value);
        var html1 = selection.html(htmlFunc.apply(null, [d, i, r]));
        html1.style('left', 'unset')
            .style('right', 'unset');
        var width1 = htmlNode.clientWidth;
        var parentWidth = htmlNode.parentNode.clientWidth;
        // html1
        //     .style('left', lastleft)
        //     .style('right', lastright);
        if (x1 + width1 + 10 > parentWidth) {
            selection.style('right', '10px')
                .style('left', 'unset')
                .style('top', datay + 'px');
        } else {
            selection.style('left', x1 + 'px')
                .style('right', 'unset')
                .style('top', datay + 'px');
        }
        var trans = selection.transition()
            .duration(100);
        trans.style('opacity', 0.95);
    };

    selection.hide = function () {
        selection.transition()
            .duration(100)
            .style('opacity', 0);
    };

    return selection;
};

var axisRight = 1;
var axisLeft = 2;
var axisNone = 0;

function timelineAxis(orient, scale) {
    var colors = ['#FFF', '#EEE'];
    var padding = 5;
    var range;
    var lineColor = '#AAA';
    var trim = 40;
    var width = 100;
    function maxTextWidth(selection) {
        if(selection.nodes().length === 0) {
            return 0;
        }
        return d3.max(selection.nodes().map(d => d.getComputedTextLength()));
    }
    function trimLongString(value) {
        return function (d) {
            return d.length > value ? d.slice(0, value - 1) + '\u2026' : d;
        };
    }
    function axis(selection) {
        var domain = scale.domain();
        var colorscale = d3.scaleOrdinal(colors);
        var labels = trimLongString(trim);
        var row = selection.selectAll('.row').data(domain, scale).order();
        var rowEnter = row.enter().append('g').attr('class', 'row');
        var rowExit = row.exit();
        var offset;
        row = row.merge(rowEnter)
            .attr('transform', d => 'translate(0,' + scale(d) + ')');
        rowExit.remove();
        rowEnter.append('rect')
            .attr('y', 0.5)
            .attr('width', width)
            .attr('height', scale.bandwidth())
            .attr('stroke', lineColor)
            .attr('stroke-width', 0.75)
            .attr('fill', colorscale);  // should be re-done if domain changed?
        if (orient !== axisNone) {
            var texts = row.select('text');
            texts = texts.merge(rowEnter.append('text')
                .attr('y', scale.bandwidth() / 2)
                .attr('dy', '0.32em')
            ).text(labels);
            var textWidthLimit = width * 0.2;
            offset = maxTextWidth(texts) + padding + padding;
            offset = Math.min(textWidthLimit, offset);
            offset = orient === axisRight ? width - offset : offset;
            range = orient === axisRight ? [0, offset] : [offset, width];
            texts
                .attr('text-anchor', orient === axisRight ? 'start' : 'end')
                .attr('dx', orient === axisRight ? padding : -padding)
                .attr('x', offset);
        } else {
            range = [0, width];
            offset = 0;
        }
        selection.append('path')
            .attr('stroke', lineColor)
            .attr('d', 'M' + (offset + 0.5) + ',0.5V' + scale.range()[1]);
    }
    axis.draw_ticks = function (selection, ticks) {
        selection.selectAll('.row').select('path')
            .attr('d', ticks.map(
                t => 'M' + t + ',' + 1 + 'v' + (scale.bandwidth() - 1)).join(''));
    };

    axis.scale   = function(_) { return arguments.length? (scale   = _, axis): scale };
    axis.width   = function(_) { return arguments.length? (width   = _, axis): width };
    axis.colors  = function(_) { return arguments.length? (colors  = _, axis): colors };
    axis.padding = function(_) { return arguments.length? (padding = _, axis): padding };
    axis.range   = function(_) { return arguments.length? (range   = _, axis): range };
    axis.trim    = function(_) { return arguments.length? (trim    = _, axis): trim };

    return axis;
}

function timelineAxisLeft(scale) {
  return timelineAxis(axisLeft, scale);
}

function timelineAxisRight(scale) {
  return timelineAxis(axisRight, scale);
}

function timelineAxisNone(scale) {
  return timelineAxis(axisNone, scale);
}

//var moment = require("moment"),
//    d3 = require("d3");
    
// import { createDuration } from 'moment/src/lib/duration/create';
// import {humanize} from 'moment/src/lib/duration/humanize';

// import {default as moment} from 'moment/moment';

function durationFormat(seconds) {
    function round10(x) {
        return Math.round(x * 10) / 10;
    }
    var cutoff = 2;
    var ret;
    if (seconds < cutoff * 60) {
        ret = seconds + 's';
    } else if (seconds < cutoff * 60 * 60) {
        ret = round10(seconds / 60) + ' min';
    } else if (seconds < cutoff * 60 * 60 * 24) {
        ret = round10(seconds / 3600) + ' hours';
    } else if (seconds < cutoff * 3600 * 24 * 30) {
        ret = round10(seconds / 86400) + ' day(s)';
    } else if (seconds < cutoff * 3600 * 24 * 365) {
        ret = round10(seconds / (86400 * 30)) + ' month(s)';
    } else {
        ret = round10(seconds / (86400 * 365)) + ' year(s)';
    }
    return ret;
}

//
// Function composition
//
// Function.prototype.wrap = function(g) {
//      var fn = this;
//      return function() {
//          return g.call(this, fn.apply(this, arguments));
//      };
// };

// Function.prototype.compose = function(g) {
//      var fn = this;
//      return function() {
//          return fn.call(this, g.apply(this, arguments));
//      };
// };

// export function compose() {
//     var funcs = [].slice.call(arguments, 1),
//         first = arguments[0];
//     return function () {
//         return funcs.reduce(function(value, fn) {
//             return fn.call(this, value);
//         }, first.apply(this, arguments));
//     }
// }

function f(value) {
    return function(d) {
        return value === undefined? d: d[value];
    }
}

function getFontSize(element) {
    var style = window
        .getComputedStyle(element, null)
        .getPropertyValue('font-size');
    return parseFloat(style);
}

function translate(x, y) {
    return 'translate(' + x + ',' + y + ')';
}

var timeline = function () {
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
            d3.min(dataTable.map( (d) => d3.min(d.data, starts))),
            d3.max(dataTable.map( (d) => d3.max(d.data, ends)))
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
};

exports.timeline = timeline;
exports.tooltip = tooltip;
exports.timelineAxisLeft = timelineAxisLeft;
exports.timelineAxisRight = timelineAxisRight;
exports.durationFormat = durationFormat;

Object.defineProperty(exports, '__esModule', { value: true });

})));
