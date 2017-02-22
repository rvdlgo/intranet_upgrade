$(document).ready(function() {
 	function toggleNavFunction(i){
		return function(){
			$('.subnavigation-default').hide();
			$('.site-navigation').not('.s-nav-'+ i).hide();
			$('.s-nav-'+ i).toggle();
	        return false;
		}
	}	
	var navItems = $('nav .item a');	
	if (navItems.length) {
		navItems.each(function(index) {
			// skip the homepage
			if (index > 0) {
				$(this).click(toggleNavFunction(index));		
			}
		});
	}
    
    $('.site-navigation .close-menu').click(function() {
        $('.site-navigation').hide();
    });
    $('.subnavigation-default .close-menu').click(function() {
        $('.subnavigation-default').hide();
    });
    
    /*
     * Subnavigation
     */
    $('<span class="open-subnavigation">Menu</span>').insertAfter($('.clustertitle-wrapper').find('h2'));
    $('.open-subnavigation').click(function() {
        $('.site-navigation').hide();
        $('.subnavigation-default').toggle();
        return false;
    });

// console.log($('h1.pagetitle').find('a'));
    if (($('.h1-wrapper h1').find('a')).length) {
        // console.log($('h1.pagetitle').find('a'));
        return false;
    }
    else {
        $('<a href="javascript:history.back();"></a>').prependTo('.h1-wrapper h1');
    }
});
    /*
     * tabs
     */
function TabsActivate(rootnode, selectedindex) {
    var rootdivs;
    function findDivs(parentnode) {
        var kids = parentnode.childNodes;
        var len = kids.length;
        var i;
        var result = [];
        var kid;
        
        for (i=0; i<len; i++) {
            kid = kids[i];
            if (kid.nodeName.toLowerCase() === "div") {
                result.push(kid);
            }
        }
        return result;
    }
    
    function activatePane(panes, selectedindex) {
        var classname;
        var i;
        for (i=0; i < panes.length; i++) {
            classname = panes[i].className.replace("tabsactive","tabsinactive");
            panes[i].className = classname.replace("tabsinactive",
                i === selectedindex ? "tabsactive" : "tabsinactive");
        }
    }
        
    rootdivs = findDivs(rootnode);
    activatePane(findDivs(rootdivs[0]), selectedindex);
    activatePane(findDivs(rootdivs[1]), selectedindex);
    return false;
}
  $(function() {
    $( ".accordion" ).accordion({
      heightStyle: "content"
    });
  });
  
  
  
function fillResult(mode, data) {
	//alert('ping');
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
		var rendersoftware = r.rendersoftware;
		if(rendersoftware == 'true'){
			index = from + i + 1;
			newData += '<h3>' + title;
			if (r.version != null && r.version.length > 0) {
				newData += ' (';
				$.each(r.version, function(j,s) {
					newData += s;
				})
				newData += ')';
			}			
			newData += ' | <a id="anchor_' + index + '" href="#' + index + '" onclick="searchResultSelected(\'' + r.location + '\');" title="' + title + '">aanvragen</a></h3>';
			newData += '<div class="summary">';
			if (r.details != null && r.details.length > 0) {
				$.each(r.details, function(j,s) {
					newData += s + '<br/>';
				})
			}
			newData += '[Software]</div>';
			
		}else{
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