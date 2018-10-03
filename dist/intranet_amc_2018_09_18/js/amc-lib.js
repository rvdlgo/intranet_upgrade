var getHeightProperty = function() {
    var browser_id = 0;
    var property = [
        ['min-height','0px'],
        ['height','1%']
    ];

    if($.browser.msie && $.browser.version < 7){
        browser_id = 1;
    }
    
    return { 'name': property[browser_id][0], 
             'autoheightVal': property[browser_id][1] };
};

$.getSyncedHeight = function(selector) {
    var max = 0;
    var heightProperty = getHeightProperty();
    $(selector).each(function() {
        $(this).css(heightProperty.name, heightProperty.autoheightVal);
        var val = $(this).height();
        if(val > max){
           max = val;
        }
    });
    return max;
};

$.fn.syncHeight = function(config) {
    var defaults = {
        updateOnResize: false,
        height: false
    };
    var options = $.extend(defaults, config);

    var e = this;

    var max = 0;
    var heightPropertyName = getHeightProperty().name;

    if(typeof(options.height) === "number") {
        max = options.height;
    } else {
        max = $.getSyncedHeight(this);
    }
    $(this).each(function() {
        $(this).css(heightPropertyName, max+'px');
    });

    if (options.updateOnResize === true) {
        $(window).resize(function(){ 
            $(e).syncHeight();
        });
    }
    return this;
};