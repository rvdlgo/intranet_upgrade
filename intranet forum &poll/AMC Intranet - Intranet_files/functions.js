function checkCookie(url, pollId) {
	// Get the real cookie
	var pollCookie = getCookie('poll-' + pollId);

	if (pollCookie != undefined && pollCookie != "") {
		loadVotes(url, pollId);
		$("#poll_result_" + pollId).show();
	} else{
		$("#poll_form_" + pollId).show();
	}		
}

function getCookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) {
		return parts[1];
	}
}

function setCookie(pollId) {
	var expires = new Date();
    expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie = 'poll-' + pollId + '=' + 'poll-' + pollId + ';expires=' + expires.toUTCString() + ';path=/';
}

function loadVotes(url, pollId) {
	$.get(url, function(data, status) {
	     var totalVotes = data.totalVotes;
	     $("#total-votes-count_" + pollId).html(totalVotes + "");
	     for (var i = 0; i < data.pollItemVotes.length; ++i){
	     	var pollItemVote = data.pollItemVotes[i];
	     	$("#vote-" + pollItemVote.id).html(pollItemVote.numberOfVotes + "");
	     	if (pollItemVote.numberOfVotes > 0) {
	     		var percentage = pollItemVote.numberOfVotes * 100 / totalVotes;
	     		$("#percent-" + pollItemVote.id).html(percentage.toFixed(2)+" %");
	     		$("#bar-" + pollItemVote.id).css('width', percentage + "%");
	     	}
	     }
	 });
}

function submitVote(event) {
	var form = $(event.target);
	var servletUrl = form[0].action;
	var pollId = form.children("input[name='content_id']")[0].value;
	var useAjax = form.children("input[name='ajax']")[0].value;

	setCookie(pollId);
	if(useAjax == "true") {
		event.preventDefault();
		$.post(servletUrl, $('#pollform_' + pollId).serialize(), function() {
			$("#poll_form_" + pollId).hide();
			loadVotes(servletUrl + "?contentId=" + pollId, pollId);
			$("#poll_result_" + pollId).show();
		});
	}
}