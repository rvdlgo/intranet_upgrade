var defaultSearchFieldValue = '';

/**
* This function appends the print link
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
    sendLinkContainer.append('<a href="javascript:;">' + sendLinkText + '</a>');
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
    $(readSpeakerContainer).append('<a href="#" title="' + linkText + '" id="rstextlink" class="readspeaker_link"><span>' + linkText + '</span></a>')
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
 * Gets the media collection block articles for the ajax based more functionality.
 */
function getMoreMediaItems(event){
  var elementId = event.data.elementIdParam;
  var mediaBlockShowMoreDiv = $("div#mediablockshowmore" + elementId);
  if(mediaBlockShowMoreDiv !== 'undefined' && mediaBlockShowMoreDiv.length != 0){
    var link = mediaBlockShowMoreDiv.data("moreitems-url");
    var start = mediaBlockShowMoreDiv.data("start");
    var count = mediaBlockShowMoreDiv.data("count");
    var url = link + '&start=' + start + '&count=' + count;
    $.ajax({
      mode: "queue",
      url: url,
      type: "GET",
      dataType: "html",
      success: function(html){
      $("p#mediablockmorelink" + elementId).unbind('click');
      $("div.mediablockmore" + elementId).remove();
      $("div#mediacollectionelementdiv" + elementId + " div.wrapper:first div.clearer").remove();
      $("div#mediacollectionelementdiv" + elementId + " div.wrapper:first").append(html);
      $("div#mediacollectionelementdiv" + elementId + " div.wrapper:first").append('<div class="clearer"></div>');
      $("div#mediacollectionelementdiv" + elementId + " div.wrapper:first div.item").removeClass("last");
      $("div#mediacollectionelementdiv" + elementId + " div.wrapper:first div.item:last").addClass("last");

      //repaint all responsive images
      if (picturefill) {
      picturefill();
      }
      $("p#mediablockmorelink" + elementId).click({elementIdParam: elementId}, getMoreMediaItems);
    }
    });
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

	$('.bh-datepicker').datepicker({startDate:'01/01/1960'});

	$("p[id^='mediablockmorelink']").each(function(index) {
		var elementId = $(this).data("element-id");
		$(this).click({elementIdParam: elementId}, getMoreMediaItems);
	});
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
$(document).ready(function(){
  var searchInfoDiv = $("div.fssearchinfo");
  if(searchInfoDiv !== 'undefined' && searchInfoDiv.length != 0){  
	searchInfoDiv.each(function(i, val) {
		if($(val).data("useautocompletion")){
			var fsInitAutoCompletion = $(val).data("fsinitautocompletion");
			initAutoCompletion('query' + fsInitAutoCompletion);
		}
  	});
    defineForm();
	
	$(document).on("click", ".searchresults-orderlinks a", function(event){
		$('.searchresults-orderlinks a').removeClass("active");
		$(this).addClass("active");
		
		var href = $(this).attr('href');
		var activeFacets = '';
		if(href.indexOf("?") > -1){
			activeFacets = href.substr(href.indexOf("?") + 1)
			fillValues(activeFacets);
		}
  
		search(0, activeFacets, $(this).data('orderby'));
		return false;
	});
  }
});

function initAutoCompletion(queryFieldId) {
  var searchInfoDiv = $("div.fssearchinfo");
  var autoCompleteUrl = searchInfoDiv.data("fsautocompleteurl");
  var autoCompleteChars = searchInfoDiv.data("fsautocompletechars");
  var queryFieldId = $('#' + queryFieldId);
  if (queryFieldId.length != 0) {
    $(queryFieldId).autocomplete({
      source: function(request, response) {
        if (autoCompleteUrl.indexOf("?") == -1) {
          $.getJSON(autoCompleteUrl + '?' + queryFieldId.val(), { q: request.term }, response);
        } else {
          $.getJSON(autoCompleteUrl + '&' + queryFieldId.val(), { q: request.term }, response);
        }
      },
      minLength: autoCompleteChars,
      select: function(event, ui) {
        $(this).val(ui.item.value);
        $(this).closest("form").submit();
      }
    });
  }
}

function getFSSearchOrderBy(){
  var orderby = '';
  var orderbylink = $('div.searchresults-orderlinks a.active');
  if(orderbylink !== 'undefined' && orderbylink.length != 0){
	orderby = $(orderbylink).data('orderby');
  }
  return orderby;
}
  
function showDetails() {
  $('#details').jqmShow();
}


function search(from, activeFacets, orderby) {
  console.log(from + ',' + activeFacets + ',' + orderby);
  var searchResultInfoDiv = $("div#searchresult");
  if(searchResultInfoDiv !== 'undefined' && searchResultInfoDiv.length != 0){
    var base = searchResultInfoDiv.data('searchurl');
    var urlSep = '&';
    if (base.indexOf('?') < 0) {
      urlSep = '?';
    }
    if (from != null && from != '') {
      base += urlSep + 'from=' + from;
	  urlSep = "&";
    }
	if (activeFacets != null && activeFacets != '') {
		base += urlSep + activeFacets;
	}
	
	if(orderby != null && orderby != ''){
		base += urlSep + "orderby=" + orderby;		
	}
    
	$.ajax({
      url: base,
      dataType: "text",
      type: "GET",
      success: fillResult
    });
  }
}

function defineForm() {
  $('a.facet').click(searchFacet);
  $('a.paginglink').click(fsSearchPageClick);
  $("div.more").each(function() {
    $(this).hide();
  });  
}

function fsSearchPageClick(event) {
	var href = $(this).attr('href');
	var activeFacets = '';
	if(href.indexOf("?") > -1){
		activeFacets = href.substr(href.indexOf("?") + 1)
	}
	search($(this).attr("name"), activeFacets, getFSSearchOrderBy());
	$('html,body').scrollTop(0);
	event.preventDefault();
}

function searchFacet(event) {
  var href = $(this).attr('href');
  var activeFacets = href.substr(href.indexOf("?") + 1)
  fillValues(activeFacets);
  search('0', activeFacets, getFSSearchOrderBy());
  event.preventDefault();
}

function fillValues(activeFacet) {
    var facetInfo = $("div#facetinfo");
    if(facetInfo !== 'undefined' && facetInfo.length != 0){
		var url = facetInfo.data('facetsurl');
		if(url.indexOf("?") == -1){
			url = url + '?' + activeFacet;
		}else{
			url = url + '&' + activeFacet;
		}
		$.ajax({
			url: url,
			dataType: "text",
			type: "GET",
			success:(function(data) {
				 $('#facetinfo').html('');
				 var $facetWrapper = $('<div class="facet-wrapper"></div>');
				 $('#facetinfo').append($facetWrapper); 
				 var html = $.parseHTML(data)
				 $("#facetinfo div.facet-wrapper").append(html);		 
				 defineForm();
			})
		});
	}
}

function fillResult(data) {
  var newData = $.parseHTML(data)
  $('#searchresult').html(newData);
  defineForm();
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
  $('div.question-overview').accordion({
    header: 'div.title',
    active: false,
    alwaysOpen: false,
    animated: false,
    autoheight: false
  });

  $('#searchresultVAC').accordion({
  header: 'div.question',
    active: false,
    animate: 150,
    collapsible: true,
    heightStyle: 'content'
  });
});

/*
 * userinteraction.js
 */
function submitRating(contentId,id){
    document.getElementById('vote'+contentId).value=id;
    document.getElementById('votingform'+contentId).submit();
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
