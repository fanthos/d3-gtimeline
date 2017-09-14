export default function (domobj, htmlFunc) {
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
