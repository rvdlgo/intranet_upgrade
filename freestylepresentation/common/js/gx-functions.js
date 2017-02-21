var defaultSearchFieldValue = '';

/**
* Roberts versie This function appends the print link
* to the DIV tag with ID 'printlink-text'
*/
function writePrintLink() {
    var printLinkText = $("#printlink-text").html();
    var printLinkContainer = $("#printlink-container");
    if (printLinkContainer != null) {
        printLinkContainer.append('<a href="#" onclick="window.print(); return false;">' + printLinkText + '</a>');
    }
}

/**
* This function appends the send link to the
* DIV tag with ID 'sendlink-container'
*/
function writeSendLink() {
    var sendLinkText = $("#sendlink-text").html();
    var sendLinkContainer = $("#sendlink-container");
    if (sendLinkContainer != null) {
        sendLinkContainer.append('<a href="#">' + sendLinkText + '</a>');
    }
}

/**
 * This function appends the tooltip to the calendar overview.
 */
$.fn.CalendarTooltip = function(params){
    var conf = $.extend({
      contentBlock:'span',
      arrowSrc:'<li class="tooltipArrow"><strong></strong></li>'
    }, params);
    return this.each(function(){
      var c=conf,o=$(this),w=o.find(c.contentBlock),h;
      if(w != null){
        w.hide().bind('hover', function() { $(this).toggleClass('hovered') }).append(c.arrowSrc);
        o.bind('mouseenter', function(){
          h=w.innerHeight();
          o.css({zIndex:100});
          w.css({top:-((h/2)-(o.height()/2))}).show();
        }).bind('mouseleave', function(){
          setTimeout(function() {
            if(!w.hasClass('hovered')) {
              w.hide();
              o.css({zIndex:1});
            }
          }, 250);
        })
      }
    })
};

/**
 * This function appends the readSpeaker link to the
 * DIV tag with ID 'readspeakerlink-container'
 */
function writeReadSpeakerLink() {
    var linkText = $("#readspeakerlink-text").html();
    var readSpeakerContainer = document.getElementById("readspeakerlink-container");
    if(readSpeakerContainer != null){
        $(readSpeakerContainer).append('<a href="#" title="' + linkText + '" id="rstextlink"><span>' + linkText + '</span></a>')
        $('#rstextlink').click(function(){
            var isHidden = $('#readspeaker_button1').hasClass('displaynone');
            if(isHidden){
                $('#readspeaker_button1').removeClass('displaynone');
            }else{
                $('#readspeaker_button1').addClass('displaynone');
            }
            return false;
        });

        var readSpeakerLink = document.getElementById('readspeaker_link');
        readSpeakerLink.href += location.href;
    }
}

/**
* code that must be executed when the
* page is loaded
*/
$(document).ready(function() {
    writePrintLink();
    writeSendLink();
    writeReadSpeakerLink();

    $('.wrapper td div').CalendarTooltip({
      contentBlock:'ul.bh-tooltipList',
      arrowSrc:'<li class="tooltipArrow"><strong></strong></li>'
    });

    $('.bh-datepicker').datepicker({startDate:'01/01/1960'});

});

/**
 * Validates the CVDR search form.
 */
function cvdrValidate(id) {
    if ($('#search_in_title' + id).val() == '') {
        $('#search_in_title' + id).attr('disabled', 'disabled');
    }
    if ($('#search_in_lawtechnical_values' + id).val() == '') {
        $('#search_in_lawtechnical_values' + id).attr('disabled', 'disabled');
    }
    if ($('#regulation_date' + id).val() == '') {
        $('#regulation_date' + id).attr('disabled', 'disabled');
    }
    return true;
}

/*
 * facetsearch
 */
selected = '';

var facets;
var excludes;
var showResultsFrom;
var numberOfItemsPerPage;
var noResultsFound;
var resultsFrom;
var    resultsUntil;
var    facetPagingNext;
var    facetPagingPrevious;
var    facetPagingFirst;
var    facetPagingLast;
var fromMaster;
var facetItemDisableText;
var published;
var showContentType;
var showPublicationDate;
var splitter;
var nrOfPagesInPaging;
var tabbedFacetName;
var onSearchResultPage;
var tabbedSc;
var showNrOfFacetItems;
var facetValuesShowAll;

$(document).ready(function(){

    //init auto completion when needed
    if(typeof fsInitAutoCompletion !== 'undefined'){
        if(fsInitAutoCompletion != ''){
            initAutoCompletion('autocompleteurl' + fsInitAutoCompletion, 'autocompletechars' + fsInitAutoCompletion, 'query' + fsInitAutoCompletion);
        }
    }

    //When tabbing the SC search result do the initial tabbing.
    if(typeof fsTabbedSc !== 'undefined' && typeof fsScFrom !== 'undefined'){
        if(fsTabbedSc == 'true'){
            //Add the SC tab and bind click event.
            $("div.searchresult-tabbedfacet ul").append(createScTab());
            $('a.sctab').unbind('click').click(tabSC);

            //Hide the org html
            $('div.searchresultcollaborative-default').hide();
            var pagingblock = $('div.searchresultcollaborative-default').parent().next();
            if(pagingblock.html().indexOf('scfrom') > -1){
                pagingblock.hide();
            }

            if(fsScFrom != ''){
                //activate the scfrom tab
                activateScTab($('a.sctab'));
            }
        }
    }

    // initialize facet settings
    if (typeof fsFacetSettingsCall !== 'undefined' && fsFacetSettingsCall !== null) {
        $.ajax({
            mode: "queue",
            url: fsFacetSettingsCall,
            type: "GET",
            dataType: "json",
            success: initFacetSettings
        });

        $("a[class^='facet']").each(function () {
            if ($(this).attr("rel") != 'true') {
                $(this).attr("rel", "false");
            } else {
                divId = '#' + $(this).next().text() + '#';
                selected += divId;
            }
        });
        defineForm();
    }

});

function initFacetSettings(data) {
    facets = data.facets;
    showResultsFrom = data.showresultsfrom;
    numberOfItemsPerPage = data.numberofresultsperpage;
    noResultsFound = data.noresultstext;
    resultsFrom = data.showresultsfromtext;
    resultsUntil = data.showresultsuntiltext;
    facetPagingNext = data.pagingnexttext;
    facetPagingMore = data.pagingmoretext;
    facetPagingPrevious = data.pagingprevioustext;
    facetItemDisableText = data.facetitemdisable;
    excludes = data.exclude;
    published = data.published;
    showContentType = data.showContentType;
    showPublicationDate = data.showPublicationDate;
    splitter = data.splitter;
    facetPagingFirst = data.pagingfirsttext;
    facetPagingLast = data.paginglasttext;
    nrOfPagesInPaging = data.nrOfPagesInPaging;
    fromMaster = parseInt(showResultsFrom);
    tabbedFacetName = data.tabbedFacetName;
    tabbedSc = data.tabbedSc;
  showNrOfFacetItems = parseInt(data.showNrOfFacetItems);

  facetValuesShowAll = data.facetValuesShowAll;
    // Hook to do additional stuff after facet initialization
    if (typeof postInitFacetSettings == 'function') {
        postInitFacetSettings();
    }
}

function initAutoCompletion(urlFieldId, charsFieldId, queryFieldId) {
    var autoCompleteUrl = $('#' + urlFieldId);
    var charsFieldId = $('#' + charsFieldId);
    var queryFieldId = $('#' + queryFieldId);
    if (autoCompleteUrl.length != 0 && queryFieldId.length != 0) {
        $(queryFieldId).autocomplete({
            source: function(request, response) {
                var acurl = autoCompleteUrl.attr("value");
                if (acurl.indexOf("?") == -1) {
                    $.getJSON(acurl + '?' + queryFieldId.val(), { q: request.term }, response);
                } else {
                    $.getJSON(acurl + '&' + queryFieldId.val(), { q: request.term }, response);
                }
            },
            minLength: charsFieldId.val(),
            select: function(event, ui) {
                $(this).val(ui.item.value);
                $(this).closest("form").submit();
            }
        });
    }
}

function showDetails() {
  $('#details').jqmShow();
}

function formProcess(event) {
  event.preventDefault();

  search('','');

  return false;
}

function search(mode, from, rows) {
    var base = fsSolrAjaxCall;
    var urlSep = '&';
    if (base != null && typeof base !== 'undefined') {
        if (base.indexOf('?') < 0) {
            urlSep = '?';
        }
        base += urlSep + 'query=' + encodeURIComponent($('#searchquery').val());

        if (mode != 'initial') {
            $("a[rel^='true']").each(function () {
                var aFacetName = $(this).next().text().split('|')[0];
                var aFacetValue = $(this).next().text().split('|')[1];
                var escapedValue = escape(aFacetValue);
                escapedValue = escapedValue.replace(/\+/g, "%2B");;
                base += '&' + aFacetName + '=' + escapedValue;
            });
        }

    if ($('#searchresult-order').length > 0) {
      var sortValue = $('#searchresult-order').val();
      base += '&orderby=' + sortValue;
    }

        if (from != null && from != '') {
            base += '&from=' + from;
            //store the from in a hidden field, workaround for the next and previous buttons.
            fromMaster = from;
        }

        var url = (base + '&retrieve=all');
        if (rows != undefined) {
            url += "&rows=" + rows;
        }
        $.ajax({
            mode: "queue",
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data) {
                fillResult(mode, data);
            }
        });
    }
}

function defineForm() {
    $('a.facet').unbind('click').click(searchFacet);
    $('a.paginglink').unbind('click').click(pageClick);
    $('a.pbut').unbind('click').click(pageClick);
    if(tabbedSc == 'true'){
        $('a.sctab').unbind('click').click(tabSC);
    }

    $("div.more").each(function() {
        $(this).hide();
    });
}

function pageClick(event) {
    var from = parseInt(fromMaster);

    if ($(this).hasClass('moreresults')) {
        search('moreresults', $(this).attr("name"));
        $('a.paginglink').unbind('click').click(pageClick);
    } else {
        search('', $(this).attr("name"));
    }

    // prevent the link from following it's href
    event.preventDefault();
}

// Loads and appends more results
function loadMoreResults(aFrom, rows) {
    var from = parseInt(fromMaster);
    search('moreresults', aFrom, rows);
    $('a.paginglink').unbind('click').click(pageClick);
}

function searchFacet(event) {
    var executeSearch = true;
    divId = '#' + $(this).next().text() + '#';
    checked = $(this).attr("rel");
    var id = $(this).parent().attr('id');
    if (checked == 'false') {
        $(this).attr("rel", "true");
    } else {

        //when a active tabbed facet has been clicked do nothing.
        if(tabbedFacetName != null && tabbedFacetName != ''){
            if(divId.indexOf('#'+tabbedFacetName) == 0){
                return;
            }
        }

        $(this).attr("rel", "false");
    }
    checked = $(this).attr("rel");

    if (checked == "true") {
        selected += divId;
    } else {
        selected = selected.replace(divId,'');
    }

    if(tabbedFacetName != null && tabbedFacetName != ''){
        if(divId.indexOf('#'+tabbedFacetName) == 0){
            //when a tabbed facet has been clicked deactivate all others.
            var activeFacets = $("[rel='true']");
            $.each(activeFacets, function(i,facet){
                var fcid = $(facet).parent().attr('id');
                if(fcid != id){
                    $(facet).attr("rel", "false");
                    $(facet).parent().attr("class", "");
                }
            });
            selected = divId;
        }
    }

    if(executeSearch){
        search('facetsearch', '0');
    }

    // prevent the link from following it's href
    event.preventDefault();
}

function tabSC(event) {
    var checked = $(this).attr("rel");
    if (checked == 'false') {

        //de-select active facets.
        var activeFacets = $("[rel='true']");
        $.each(activeFacets, function(i,facet){
            $(facet).attr("rel", "false");
            $(facet).parent().attr("class", "");
        });
        selected = '';
        activateScTab(this);
    } else {
        $(this).attr("rel", "false");
        search('','');
    }
}

function activateScTab(facetLink){
    //select sc 'dummy' facet.
    $(facetLink).attr("rel", "true");
    $(facetLink).parent().attr("class", "active");

    //remove sol searchresult, paging and facets
    $('#searchresult').html("");
    $('#pagingblock').html("");
    $('#facetinfo').html("");

    //append sc html to the default search result html
    var $scResults = $('div.searchresultcollaborative-default').html();
    $('#searchresult').append($scResults);

    var pagingblock = $('div.searchresultcollaborative-default').parent().next().html();
    if(pagingblock.indexOf('scfrom') > -1){
        var scpagingwrapper = $('div.searchresultcollaborative-default').parent().next().find('div.wrapper').html();
        $('#pagingblock').append(scpagingwrapper);
    }
}

function createScTab(){
    var $tabbedItem = $('<li id="sctab"></li>');
    var title = $('div.searchresultcollaborative-default div.h2-wrapper h2').text();
    var $tabbedLink = $('<a rel="false" href="#" onclick="return false;" class="sctab" title="' + title + '">' + title + '</a> ');
    $tabbedItem.append($tabbedLink);
    return $tabbedItem
}

function fillValues(data) {

    var $facetWrapper = $('<div class="facet-wrapper"></div>');
    var $tabbedList = $('<ul></ul>');
    $.each(data.facets, function(i,facet){
        // Get the name of the facet
        var facetName = facet.facet;
        // Get the label of the facet
        var facetLabel = facet.facet;

        // Check if the current facet has facet items which should be excluded
        var excludeFacet;
        if (typeof excludes !=  'undefined') {
            $.each(excludes, function(k,exclude){
                if (exclude.facetname == facetName) {
                    excludeFacet = exclude;
                }
            });
        }

        // Check if the current facet is marked as the tabbed facet.
        var tabbedFacet = false
        if(tabbedFacetName != undefined) {
            if(tabbedFacetName == facetName) {
                tabbedFacet = true;
            }
        }

        // Loop the facet items and check if they have results. If not, the entire facet should not be rendered.
        var resultsFound = false;
        var facetItemExcluded = false;
        $.each(facet.values, function(k,facetitem){
            if (typeof facetitem !=  'undefined') {
                if (excludeFacet != undefined) {
                    $.each(excludeFacet.facetitems, function(k,item){
                        if (item.name == facetitem.name) {
                            facetItemExcluded = true;
                        }
                    });
                }
                if (facetitem.count > 0 && !facetItemExcluded) {
                    resultsFound = true;
                }
                facetItemExcluded = false;
            }
        });

        // We need language labels for the facet labels
        if (typeof facets !=  'undefined') {
            $.each(facets, function(i,facetsetting){
                if (facetLabel.indexOf(facetsetting.facetname) > -1) {
                    facetLabel = facet.facet.replace(facetsetting.facetname, facetsetting.label);
                }
            });
        }

        if(!tabbedFacet){
            // If results are found render the facet
            if (resultsFound) {
                var $facetTitle = $('<div class="facet-title">' + facetLabel + '</div>');
                var $facetDef = $('<input type="hidden" class="facetdef" name="facets" value="' + facet.facet + '" />');

                $facetTitle.append($facetDef);
                $facetWrapper.append($facetTitle);
                var $facetItemWrapper = $('<div class="facet-items"></div>');
                var $facetList = $('<ul></ul>');
                $facetItemWrapper.append($facetList);
                $facetWrapper.append($facetItemWrapper);

                // For each facet item...
        var facetItemCount = 0;
        var facetHidden = false;
        var facetMaxItems = showNrOfFacetItems;
        if (isNaN(facetMaxItems)) {
          facetMaxItems = -1;
        }
                $.each(facet.values, function(j,facetvalue){
                    if (typeof facetvalue !=  'undefined') {
                        var showFacetItem = true;

                        // Check if the facet item should be excluded
                        if (excludeFacet != undefined) {
                            $.each(excludeFacet.facetitems, function(k,item){
                                if (item.name == facetvalue.name) {
                                    showFacetItem = false;
                                }
                            });
                        }

                        // If the facet item has results AND the facet item must not be excluded...
                        if (facetvalue.count != 0 && showFacetItem) {
              facetItemCount++;
              if (facetMaxItems != -1 && (facetMaxItems+1) == facetItemCount) {
                facetHidden = true;
              }
                            var $facetItem;
              if (facetHidden) {
                $facetItem = $('<li style="display: none;"></li>');
              } else {
                $facetItem = $('<li></li>');
              }
                            $facetList.append($facetItem);

                            var selectedFacetItem = false;

                            if (selected.indexOf('#' + facet.facet + '|' + facetvalue.name + '#') != -1) {
                                selectedFacetItem = true;
                            }

                            var relValue = "";
                            if (selectedFacetItem) {
                                relValue = 'true';
                            } else {
                                relValue += 'false';
                            }

                            var facetLabel = facetvalue.label;
                            if (selectedFacetItem) {
                                facetLabel = '<strong>' + facetLabel + '</strong>';
                            }

                            var $facetLink = '<a rel="' + relValue + '" href="#" onclick="return false;" class="facet" title="' + facetvalue.label + '">' + facetLabel + '</a> ';

                            $facetItem.append($facetLink);

                            var $facetVals = $('<span class="displayNone">' + facet.facet + '|' + facetvalue.name + '</span>');
                            $facetItem.append($facetVals);

                            var $facetCount;
                            if (selectedFacetItem) {
                                $facetCount = $('<span class="facetcount"><strong>(' + facetItemDisableText + ')</strong></span>');;
                            } else {
                                $facetCount = $('<span class="facetcount">(' + facetvalue.count + ')</span>');
                            }
                            $facetItem.append($facetCount);
                        }
                    }

                });
        if (facetHidden) {
          $facetList.append('<li class="facets_showmore"><a href="javascript:void(0)" onclick="showAllFacets(this);">' + facetValuesShowAll + '</a></li>');
            }
            }
        }else{
            $.each(facet.values, function(j,facetvalue){
                if (typeof facetvalue !=  'undefined') {
                    // Check if the facet item should be excluded
                    var name = facetvalue.name
                    var showFacetItem = true;
                    if (excludeFacet != undefined) {
                        $.each(excludeFacet.facetitems, function(k,item){
                            if (item.name == name) {
                                showFacetItem = false;
                            }
                        });
                    }

                    if(showFacetItem){

                        var selectedFacetItem = false;
                        if (selected.indexOf('#' + facet.facet + '|' + name + '#') != -1) {
                            selectedFacetItem = true;
                        }

                        var classValue = 'class=""'
                        var relTabbedValue = 'false';
                        if(selectedFacetItem){
                            relTabbedValue = 'true';
                            var classValue = 'class="active"'
                        }

                        var $tabbedItem = $('<li id="' + name + '" ' + classValue + '></li>');
                        $tabbedList.append($tabbedItem);

                        var $tabbedLink = $('<a rel="' + relTabbedValue + '" href="#" onclick="return false;" class="facet" title="' + facetvalue.label + '">' + facetvalue.label + '</a> ');
                        var $tabbedSpan = $('<span class="displaynone">' + facet.facet + '|' + name + '</span>');
                        $tabbedItem.append($tabbedLink);
                        $tabbedItem.append($tabbedSpan);
                    }
                }
            });

            if(tabbedSc == 'true'){
                $tabbedList.append(createScTab());
            }
        }
    });

    // Append the constructed HTML
    $('#facetinfo').append($facetWrapper);
    $('div .searchresult-tabbedfacet').append($tabbedList);
    // Attach event handlers to the constructed HTML
    defineForm();
}

function fillResult(mode, data) {
  var moreResultsMode = false;
  if ($('div#pagingblock a.moreresults').length > 0) {
    moreResultsMode = true;
  }
    if (mode != 'moreresults') {
        $('#searchresult').html("");
    }
    var from = parseInt(fromMaster);
    var nrOfItemsPerPage = parseInt(numberOfItemsPerPage);
  var itemOrder = data.itemOrder.split(",");

    var until = from + nrOfItemsPerPage;
    if (data.results.length < nrOfItemsPerPage) {
        until = from + data.results.length;
    }

    newData = '<div class="search-result-count">';

    if (data.results.length == 0) {
        newData += noResultsFound;
    } else {
        newData += resultsFrom + ' ' + (from + 1) + ' ' + resultsUntil + ' ' + until;
    }

    newData += '</div>'
    newData += '<div class="search-wrapper">';
    newData += '<div id="searchresultbox"><ol>';

    $.each(data.results, function(i,r){
        var title = r.title;
        if (title == undefined || title == '') {
            title = r.location;
        }
        newData += '<li>';

        for (itemIndex = 0; itemIndex<itemOrder.length; itemIndex++) {
            itemProperty = itemOrder[itemIndex];

            if (itemProperty == 'title') {
              index = from + i + 1;
                newData += '<h3><a id="anchor_' + index + '" href="#' + index + '" onclick="searchResultSelected(\'' + r.location + '\');" title="' + title + '">' + title + '</a></h3>';
            } else if (itemProperty == 'summary') {
                newData += '<div class="summary">';

                if (r.snippets != null && r.snippets.length > 0) {
                    $.each(r.snippets, function(j,s) {
                        newData += s.snippet;
                        if (!(r.snippets.length == (j + 1))) {
                            newData += ' ... ';
                        }
                    })
                } else {
                    newData += r.summary;
                }
                newData += '</div>';
            } else if (itemProperty == 'meta') {
                var extra = '';
                if (showPublicationDate == 'true' && r.date != '') {
                    extra += '<span class="publicationDateLabel">' + published + '</span>';
                    extra += '<span class="publicationDate">' + r.date + '</span>';
                }
                if (showContentType == 'true' && r.category != '') {
                    if (showPublicationDate == 'true' && r.date != '') {
                        extra += '<span class="splitter">' + splitter + '</span>';
                    }
                    extra += '<span class="category">' + r.category + '</span>';
                }
                extra += '<span class="url">' + r.location + '</span>';

                // Cater for overrule plugins here
                if (typeof postMeta == 'function') {
                    extra += postMeta(r, extra == '');
                }


                newData += '<div class="meta">' + extra + '</div>';
            } else if (itemProperty == 'leadimage') {
                if (r.leadimage != '') {
                    newData += '<div class="leadimage"><img src="' + r.leadimage + '"/></div>';
                }
            } else if (itemProperty == 'count') {
                newData += '<span class="count">' + r.count + '</span>';
            }
    }
    newData += '</li>';
    });

    newData += '</ol></div></div><div class="clearer"><!--  --></div>';

    $('#searchresult').append(newData);

    // add the paging
    var pagingHtml;
  if (moreResultsMode) {
    pagingHtml = createPagingBlock('moreresults', data);
  } else {
    pagingHtml = createPagingBlock(mode, data);
  }
    if (pagingHtml != "") {
        $('#pagingblock').html("");
        $('#pagingblock').append(pagingHtml);
    } else {
        $('#pagingblock').remove();
    }
    $('#facetinfo').html('');
    $('div .searchresult-tabbedfacet').html('');
    fillValues(data);
}

function trim(myString) {
    return myString.replace(/^s+/g,'').replace(/s+$/g,'')
}

function createPagingBlock(mode, data){
    paginghtml = '';
    moreResultsAvailable = false;
    currentFrom = parseFloat(fromMaster);
    itemPerPage = parseFloat(numberOfItemsPerPage);
    nrOfPagesInPaging = parseFloat(nrOfPagesInPaging);
    //determine the number of pages to build the paging for
    pages = data.count / parseFloat(itemPerPage);
    pages = pages.toFixed(0);

    paginghtml += "<div class=\"top\"><!--  --></div>";
    paginghtml += "<div class=\"wrapper\">";

    if ((pages * parseFloat(itemPerPage)) < data.count){
        pages ++;
    }

    if(pages >= 2) {
        // max pages size is 10
        if (pages > 10) {
            pages = 10;
        }

        var startPage = 1;
        var endPage = pages;
        if (nrOfPagesInPaging >= parseFloat(pages)) {
            endPage = pages;
        } else {
            var currentPage = (currentFrom / itemPerPage) + 1;
            startPage = parseFloat(Math.floor(currentPage - (nrOfPagesInPaging + nrOfPagesInPaging % 2) / 2 + 1));
            endPage = parseFloat(Math.floor(startPage + nrOfPagesInPaging - 1));
            if (startPage < 1) {
                endPage = endPage + 1 - startPage;
                startPage = 1;
            } else if (endPage > parseFloat(pages)) {
                startPage = startPage - endPage + parseFloat(pages);
                endPage = parseFloat(pages);
            }
        }

        // max data count = pages * itemPerPage
        var dataCount = data.count;
        if (dataCount > (pages * itemPerPage)) {
            dataCount = (pages * itemPerPage);
        }
        if (mode != 'moreresults') {
            if (currentFrom > 1) {
                var firstLabel = facetPagingFirst;
                paginghtml += '<span class="first"><a href="#" onclick="return false;" class="paginglink navigation" title="' + firstLabel + '" name="0"><span>' + firstLabel + '</span></a></span>';

                var previousLabel = facetPagingPrevious;
                paginghtml += '<span class="prev"><a href="#" onclick="return false;" class="paginglink navigation" title="' + previousLabel + '" name="'+ (currentFrom - itemPerPage) + '"><span>' + previousLabel + '</span></a></span>';
            }


            if (startPage != 1) {
                paginghtml += '<span class="more">&hellip;</span>';
            }

            for(k = startPage - 1; k < endPage; k++){
                showpage = k + 1;
                var until = showpage * itemPerPage;
                // check if the last page contains less results then 'itemPerPage'
                if (k == (pages - 1)) {
                    if ((dataCount%itemPerPage) != 0) {
                        until = (showpage * itemPerPage) - (itemPerPage - (data.count%itemPerPage));
                    }
                }
                if (currentFrom != (k*itemPerPage)) {
                    paginghtml += '<a href="#" onclick="return false;" class="paginglink navigation" title="' + showpage + '" name="'+ k*itemPerPage + '"><span>' + showpage + '</span></a>';
                }else{
                    paginghtml += '<span>' + showpage + '</span>'
                }
            }

            if (endPage != pages) {
                paginghtml += '<span class="more">&hellip;</span>';
            }
        }

        if ((currentFrom != ((pages-1) * itemPerPage)) && pages > 1) {
            var nextLabel = facetPagingNext;
            var cssClass = "paginglink navigation";
            var name = (currentFrom + itemPerPage);
            if (mode == 'moreresults') {
                cssClass += " moreresults";
                nextLabel = facetPagingMore;
                moreResultsAvailable = true;
                name = currentFrom + data.results.length;
            }
            paginghtml += '<span class="next"><a href="#" onclick="return false;" class="' + cssClass + '" title="' + nextLabel + '" name="'+ (name) + '"><span>' + nextLabel + '</span></a></span>';

            if (mode != 'moreresults') {
                var lastLabel = facetPagingLast;
                paginghtml += '<span class="last"><a href="#" onclick="return false;" class="paginglink navigation" title="' + lastLabel + '" name="'+ (itemPerPage * (pages - 1)) + '"><span>' + lastLabel + '</span></a></span>';
            }
        }
    }

    paginghtml += '<div class="clearer"><!--  --></div></div><div class="bottom"><!--  --></div>';

    if (!moreResultsAvailable && mode == 'moreresults') {
        paginghtml = '';
    }
    return paginghtml;
}

/*
 * jquery.tabs.js
 */
$(document).ready(function() {

    // Insert the wrapper for the controls
    $('#slides').before('<ul id="slidecontrols"></ul>');

    // Hide those H2s
    $('.column-wide #slides .h2-wrapper > h2').each(function(){
        var parent = $(this).parent().parent();
        if(parent.attr('class') == 'productsection-default'){
            $(this).hide();
        }
    });

    //Set the initial state: highlight the first button...
    $('#slidecontrols').find('li:eq(0)').addClass('selected');

    //and hide all slides except the first one
    $('#slides').find('> div:eq(0)').nextAll().hide();

    //actions that apply on click of any of the buttons
    $('#slidecontrols li').click( function(event) {

        //turn off the link so it doesn't try to jump down the page
        event.preventDefault();

        //un-highlight the buttons
        $('#slidecontrols li').removeClass();

        //hide all the slides
        $('#slides > div').hide();

        //highlight the current button
        $(this).addClass('selected');

        //get the index of the current button...
        var index = $('#slidecontrols li').index(this);

        //and use that index to show the corresponding slide
        $('#slides > div:eq('+index+')').show();

    });

});


/*
 * $-accordion-site.js
 */
$().ready(function(){

    // first simple accordion with special markup
    $('#searchresultVAC').accordion({
        header: 'dt.question',
        active: false,
        alwaysOpen: false,
        animated: false,
        autoheight: false
    });


    // bind to change event of select to control first and seconds accordion
    // similar to tab's plugin triggerTab(), without an extra method
    var accordions = $('#searchresultVAC');

    $('#switch select').change(function() {
        accordions.accordion("activate", this.selectedIndex-1 );
    });
    $('#close').click(function() {
        accordions.accordion("activate", -1);
    });
    $('#switch2').change(function() {
        accordions.accordion("activate", this.value);
    });
    $('#enable').click(function() {
        accordions.accordion("enable");
    });
    $('#disable').click(function() {
        accordions.accordion("disable");
    });
    $('#remove').click(function() {
        accordions.accordion("destroy");
        wizardButtons.unbind("click");
    });
});

/*
 * userinteraction.js
 */
function submitRating(contentId,id){
    document.getElementById('vote'+contentId).value=id;
    document.getElementById('votingform'+contentId).submit();
}

/**
 * Fills the street and residence based on the zipcode and housenumber.
 */
function zipcodeCheck(zipcodeEl, housenumberEl, streetEl, residenceEl) {
    zipcodeEl.value = formatZipcode(zipcodeEl.value);

    var zipcode = zipcodeEl.value;
    var housenumber = housenumberEl.value;

    if (validZipcode(zipcode) && validHousenumber(housenumber)) {
        var status;

        var req = new Request({
             method: 'get',
             url: "/web/wcbservlet/com.gxwebmanager.solutions.jghandlers.servlet?zipcode=" + zipcode + "&housenumber=" + housenumber,
             onRequest: function() {},
             onComplete: function(response) {
                try {
                    var browserName=navigator.appName;
                    if (browserName=="Microsoft Internet Explorer") {
                        xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
                        xmlDoc.async="false";
                        xmlDoc.loadXML(response);

                        status = getZipcodeCheckValueIE(xmlDoc, "status");
                        street = getZipcodeCheckValueIE(xmlDoc, "straatnaam");
                        residence = getZipcodeCheckValueIE(xmlDoc, "woonplaats");
                    } else {
                        //Firefox, Mozilla, Opera, etc.
                        parser=new DOMParser();
                        xmlDoc=parser.parseFromString(response,"text/xml");

                        status = getZipcodeCheckValue(xmlDoc, "status");
                        street = getZipcodeCheckValue(xmlDoc, "straatnaam");
                        residence = getZipcodeCheckValue(xmlDoc, "woonplaats");
                    }
                } catch(e) {
//                    alert(e.message);
                    return;
                }
                if(status == 1) {
                    streetEl.value = street;
                    residenceEl.value = residence;
                    streetEl.readOnly      = true;
                    residenceEl.readOnly   = true;
                } else {
                    // Enable street and residence
                    if(streetEl.value == '') {
                        streetEl.value = 'straat onbekend';
                        streetEl.addClass("grey");
                    }
                    streetEl.readOnly      = false;
                    if(residenceEl.value == '') {
                        residenceEl.value = 'woonplaats onbekend';
                        residenceEl.addClass("grey");
                    }
                    residenceEl.readOnly   = false;
                }
             }
         }).send();
    }
}

function formatZipcode(zipcode) {
    zipcode = zipcode.replace(/\s+/g, '');
    return zipcode;
}

function getZipcodeCheckValue(xmlDoc, name) {
    node = xmlDoc.evaluate("//member[name = '" + name + "']/value/string", xmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null );
    return node.singleNodeValue.textContent;
}

function getZipcodeCheckValueIE(xmlDoc, name) {
    xmlDoc.setProperty('SelectionLanguage', 'XPath');
    node = xmlDoc.selectSingleNode("//member[name = '" + name + "']/value/string")
    value = node.text;
    return value;
}

function validZipcode(value) {
    return /^[1-9]{1}[0-9]{3}[a-zA-Z]{2}$/.test(value);
}

function validHousenumber(value) {
    return /^[0-9]+$/.test(value);
}

function sendBabycreatorForm(flashurl, imageurl, title, name, email) {
    var elFlashurl  = $(babycreator_flashurl);
    var elImageurl  = $(babycreator_imageurl);
    var elTitle     = $(babycreator_title);
    var elName      = $(babycreator_name);
    var elEmail     = $(babycreator_email);

    elFlashurl.value    = flashurl;
    elImageurl.value    = imageurl;
    elTitle.value       = title;
    elName.value        = name;
    elEmail.value       = email;

    elFlashurl.form.submit();
}

function showAllFacets(el) {
  var facetsListTag = $(el).closest('ul');

  facetsListTag.find('> li').each(function() {
    if ($(this).hasClass('facets_showmore')) {
      $(this).hide();
    } else {
      $(this).show();
    }
  });
}

// This function is invoked when a search result is clicked. By using anchors, it is possible
// to remember the state of the search result page including hash parameters, which are used
// to invoke 'more results' ajax calls.
function searchResultSelected(url) {
    window.location.href = url;
}

// This function is invoked when the sort-options pullwon is changed. Results are sorted accordingly
function orderSearchResults(el) {
  search('', '0');
}

/**
 * Validation of search form.
 */
$(document).ready(function() {
    $("form.sitewidesearch").bind("submit", function() {
        return validateSearchKeyword($("input.sitewidesearchfield", this).val());
    });

    $("input.sitewidesearchfield").bind("keyup", function() {
        checkSearchInput($(this));
    });

    $("input.sitewidesearchfield").each(function() {
        checkSearchInput($(this));
    });
});

function checkSearchInput(field) {
    var searchForm = field.closest(".sitewidesearch");
    if(validateSearchKeyword(field.val())) {
        searchForm.removeClass("invalidKeyword");
    } else {
        searchForm.addClass("invalidKeyword");
    }
}

/**
 * Checks if the search keyword is valid.
 * It should be at least 2 characters long.
 */
function validateSearchKeyword(keywordd) {
    return /^.{2,}$/.test(keywordd);
}