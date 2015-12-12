/**
 *  svgtopng [0.1]
 *
 *  License - https://github.com/SaiAshirwadInformatia/SVG2PNG/blob/master/LICENSE
 *
 *  @author Rohan Sakhale <Rohan.Sakhale@diebold.com>
 *  @since Version 1 - Dec 2015
 */
;
"use strict";
var svgtopng = null;
(function($) {

    var ops = {
        selector: 'svg',
        filename: 'svgtopng.png',
        scale: 1,
        backgroundColor: '#fff',
        title: null,
        width: 500,
        height: 300
    };

    var getSVG = function(el) {
        console.log($(el).prop('tagName'));
        if (el === undefined || el === '') {
            el = $('svg').get(0);
        } else if (typeof el === 'string') {
            ops.selector = el;
            el = $(el).get(0);
        }
        if (el && $(el).prop('tagName') != 'svg') {
            el = $(ops.selector + ' svg').get(0);
        }
        
        if (el === undefined || el.nodeType !== 1) {
            throw new Error('svgtopng: Cannot find svg element for saving');
        }
        return el;
    };

    var getDimensions = function(el) {
        if ($(el).length > 0) {
            ops.width = $(el).width();
            ops.height = $(el).height();
        }
        if (ops.scale !== undefined && ops.scale !== '') {
            ops.scale -= 1;
            ops.width += ops.width * ops.scale;
            ops.height += ops.width * ops.scale;
        }
        return {
            width: ops.width,
            height: ops.height
        };
    };

    var getHTML = function(el) {
        el = getSVG(el);
        var di = getDimensions(el);
        var s = $(el).clone();
        $(s).attr('xmlns', 'http://www.w3.org/2000/svg');
        $(s).attr('version', 1.1);

        $(s).width(di.width);
        $(s).height(di.height);
        return $(s).html() || (new window.XMLSerializer()).serializeToString(s);
    };

    var getUri = function(el){
        var h = encodeURIComponent(getHTML(el));
        return 'data:image/svg+xml;base64,' + window.btoa(unescape(h));
    };

    var getBlob = function(el) {
        var html = getHTML(el);
        return new Blob([html], {
            type: 'text/xml'
        });
    };

    var saveUri = function(uri, f){
        if(typeof document !== 'undefined' && 
            ('download' in document.createElement('a'))){
            var dl = document.createElement('a');
            $(dl).attr('href', uri);
            $(dl).attr('download', f);
            $(dl).trigger('click');
            return true;
        }else{
            window.open(uri, '_blank', '');
            return true;
        }
        return false;
    };

    var savePng = function(uri, f){
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        var image = new Image();

        // force load on browser
        $(image).css('position', 'fixed');
        $(image).css('top', '-1000px');
        $(image).css('left', '-1000px');
        $('body').append(image);
        
        $(image).load(function(){
            $(canvas).width(ops.width);
            $(canvas).height(ops.height);
            context.drawImage(image, 0, 0);

            if(typeof window.saveAs === 'function' 
                &&  typeof canvas.toBlob === 'function'){
                canvas.toBlob(function(b){
                    saveAs(b, f);
                });
            }else{
                saveUri(canvas.toDataUrl('image/png'), name);
            }
        });
        $(image).attr('src', uri);
        return true;
    };

    svgtopng = function(el, f, o) {
        ops = $.extend(ops, o);
        return savePng(getUri(el), f);
    };

    $.fn.svgtopng = function(f, o) {
        if (typeof f === 'object' && o === undefined) {
            o = f;
            f = undefined;
        }

        if (f === undefined || f === null) {
            f = ops.filename;
        }

        if (f === undefined || f === null) {
            throw new Error('Filename required to save svg to png');
        }

        svgtopng($(this).get(0), f, o);
    };

}(jQuery));