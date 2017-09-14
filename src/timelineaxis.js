import tooltip from "./tooltip";

function identity(x) {
    return x;
}

var axisRight = 1,
    axisLeft = 2,
    axisNone = 0;

function timelineAxis(orient, scale) {
    var colors = ['#FFF', '#EEE'];
    var padding = 5;
    var range;
    var lineColor = '#AAA';
    var trim = 40;
    var width = 100;
    function maxTextWidth(selection) {
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

export function timelineAxisLeft(scale) {
  return timelineAxis(axisLeft, scale);
}

export function timelineAxisRight(scale) {
  return timelineAxis(axisRight, scale);
}

export function timelineAxisNone(scale) {
  return timelineAxis(axisNone, scale);
}
