
var css = 'div.tooltip {\
        position: absolute;\
        text-align: center;\
        padding: 5px;\
        /* font: 12px sans-serif; */\
        background: white;\
        border: 1px solid #AAA;\
        border-radius: 2px;\
        pointer-events: none;\
      }';

export default function (domobj, htmlFunc) {
    if (!domobj) {
        domobj = 'body';
    }

    var selection = d3.select(domobj).append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

        var htmlNode = selection.node();

    selection.show = function (d, i, r) {
        selection.interrupt();
        var datay = r[0].attributes['data-y'].value;
        var lastleft = htmlNode.style['left'];
        var lastright = htmlNode.style['right'];
        var x1 = parseInt(r[0].attributes.x.value);
        var html1 = selection.html(htmlFunc.apply(null, [d, i, r]));
        html1.style('left', 'unset')
            .style('right', 'unset');
        var width1 = htmlNode.clientWidth;
        var parentWidth = htmlNode.parentNode.clientWidth;
        html1
            .style('left', lastleft)
            .style('right', lastright);
        var trans = selection.transition()
            .duration(50);
        trans.style('opacity', 0.95);
        if (x1 + width1 + 10 > parentWidth) {
            trans.style('right', '10px')
                .style('left', 'unset')
                .style('top', datay + 'px');
        } else {
            trans.style('left', x1 + 'px')
                .style('right', 'unset')
                .style('top', datay + 'px');
        }
    };

    selection.hide = function () {
        selection.transition()
            .duration(50)
            .style('opacity', 0);
    };

    return selection;
};
