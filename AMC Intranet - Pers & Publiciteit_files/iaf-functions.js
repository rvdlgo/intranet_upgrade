// formutil.js
var WebmanagerFormStateRegistry = {};

//
// Utility function to support the clientside framework.
// This file is javascript library independent.
//

var FormsUtil = function() {

  //
  // Function to check if the client is an internet explorer browser
  //
  function isIE() {
    var isIE = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;   // true if we're on ie
    return isIE;
  }

  //
  // function to normalize a string: convert dots to underscores.
  // this is used, because div id, names are not allowed to have dots in it.
  //
  function normalize(str) {
    // global replace the dot by an underscore
    return str.replace(/\./g,'_');
  }

  //
  // function which makes sure the hidden variable precondition_show and precondition_hide are set correctly.
  // these hidden are set to let the engine know, a field is clientside shown or hidden.
  // otherwise the engine would return to the same step (for non javascript support)
  //
  function setPrecondition(identifier, inputidentifier, mode, formid) {
    var obj = document.getElementById('precondition_' + formid.replace('wmform_','') + '_' + inputidentifier);
    if (typeof obj !== 'undefined') {
      var value = obj.value;
      var spl = value.split(',');

      if (mode == 'add') {
        if (!contains(spl, identifier)) {
          // add it
          spl.push(identifier);
        }
      } else {
        if (contains(spl, identifier)) {
          // remove it
          removeByElement(spl,identifier);
        }
      }
      obj.value = spl.join(',');
    }
  }

  //
  // function to remove an entry from an array
  //
  function removeByElement(arrayName,arrayElement) {
    for(var i=0; i<arrayName.length;i++) {
      if(arrayName[i]==arrayElement) {
        arrayName.splice(i,1);
        break;
      }
    }
  }

  //
  // function to join the attributes of an object with a delimiter.
  // the joined string is returned
  //
  function join(obj,delimiter) {
    var str = '';
    for(var item in obj) {
      if (str != '') {
        str += delimiter;
      }
      str += obj[item];
    }
    return str;
  }

  //
  // function to check if a value is contained in an array
  //
  function contains(array, element) {
   for (var i = 0; i < array.length; i++) {
     if (array[i] == element) {
       return true;
     }
    }
    return false;
  }

  //
  // function to get an object / attribute based on the attributes of the given object and a dot expression.
  // returns the object / attribute
  //
  function getObject(obj, expression) {
    if ((typeof obj !== 'undefined' && obj != null) && (typeof expression !== 'undefined' && expression !== null)) {
      var index = expression.indexOf('.');
      if (index == -1) {
        return obj[expression];
      } else {
        return getObject(obj[expression.substring(0,index)],expression.substring(index+1, expression.length));
      }
    } else {
      return null;
    }
  }

  //
  // Function to check if fields have to be shown or hidden. The function uses an object from the scope as input.
  //
  function checkConditions(obj, path, formId) {
    var result = new Array();
    // loop over all objects in the scope and check if the visibility is changed
    for (var item in obj) {
      if (obj != null && obj[item] != null) {
        var property = obj[item];
        if (typeof property.checkConditions == 'function') {
          // do the check
          if (property.checkConditions()) {
            if (property.visible) {
              setPrecondition(path + item,'show','add', formId);
              setPrecondition(path + item,'hide','remove', formId);

              result.push({"value":"show","identifier":path + item});
            } else {

              setPrecondition(path + item,'hide','add', formId);
              setPrecondition(path + item,'show','remove', formId);

              result.push({"value":"hide","identifier":path + item});
            }
          }

        }
        // if object then go recursive to look for subforms and repeaters
        if (typeof property == 'object' && property.visible) {
          // FIXME: maybe this can be optimized??
          var subResult = checkConditions(property,path + item + '.', formId);
          for (i=0;i < subResult.length;i++) {
            result.push(subResult[i]);
          }
        }
      }
    }
    return result;
  }

  //
  // Public methods and variables.
  //
  return {
    checkConditions:checkConditions,
    getObject:getObject,
    contains:contains,
    join:join,
    isIE:isIE,
    normalize:normalize
  }


}();

var FormValidation = function() {

  //
  // function to trigger a change of a fragment. The fragment will be validated and other fields are checked for
  // possible visual changes (shown or hidden)
  //
  function changeFragment(obj, validate, triggerPreconditions, changeHistory) {
    var formId = obj.parents('form:first').attr("id");
    var step = WebmanagerFormStateRegistry[formId].currentStep();

    var inputName = obj.attr("name");
    var fragmentObj = FormsUtil.getObject(step, inputName);
    var hasErrors = false;

    // set the value in the scope
    var newValue = getFragmentValue(obj);
    var valueChanged = false;

    // only re-validate when the "old" value is not the same as the "new value"
    // or when the "old" value is empty or undefined
    // or when the "new" value is empty or undefined
    if (fragmentObj !== null && typeof fragmentObj !== 'undefined' && (fragmentObj.value !== newValue ||
      typeof fragmentObj.value == 'undefined' || fragmentObj.value === '' || typeof newValue === 'undefined' || newValue === ''))
    {
      valueChanged = true;

      // only trigger actions when the value is changed
      fragmentObj.value = newValue;
      fragmentObj.validated = false;

      // Revalidate the fragment
      if (validate) {
        hasErrors = validateFormFragment(obj, fragmentObj);
      }
    }

    if (fragmentObj != null && (triggerPreconditions || valueChanged)) {
      // (2) when a fragment has got a new value, check if other fields have to (dis)appear
      // Added hidden, because you can have a hidden counter (eg for the repeater) which needs to trigger the checkConditions
      var inputType = obj.attr("type");

      if (changeHistory == undefined) {
        changeHistory = new Array();
      }
      var changes = FormsUtil.checkConditions(step, '', formId);
      for (var i=0; i < changes.length;i++) {
        changedFragmentObj = FormsUtil.getObject(step, changes[i].identifier);
        if (changes[i].value == 'show' && $('#' + FormsUtil.normalize(changes[i].identifier)).is(':hidden')) {
          // throw high level event, so custom code can react on that
          $('#' + FormsUtil.normalize(changes[i].identifier)).trigger('IAF_ShowFormFragment');

          var conditionChanged = false;

          if (typeof changedFragmentObj != 'undefined' && !changedFragmentObj.condition) {
            changedFragmentObj.condition = true;
            conditionChanged = true;
          }

          //update condition for visible elements within this element
          $('#' + FormsUtil.normalize(changes[i].identifier)).find(":input").addBack(":input").filter(":visible").each(function() {
            if ($(this).attr("name") != '' && typeof $(this).attr("name") != 'undefined') {
              recursiveChangedFragmentObj = FormsUtil.getObject(step, $(this).attr("name"));

              if (recursiveChangedFragmentObj != undefined) {
                //console.log("Set condition and visible to true for "+$(this).attr("name") + " because parent became visible");
                recursiveChangedFragmentObj.condition = true;
                recursiveChangedFragmentObj.visible = true;
                if ($.inArray($(this).attr("name"), changeHistory) == -1) {
                  //console.log("Recurse into " + $(this).attr("name"));
                  changeHistory.push($(this).attr("name"));
                  changeFragment($(this), false, true, changeHistory);
                  conditionChanged = true;
                }
              }
            }
          });

          if (conditionChanged) {
            newChanges = FormsUtil.checkConditions(step, '', formId);

            for (var j=0; j < newChanges.length;j++) {
              for (var k=i; k < changes.length;k++) {
                if (changes[k].identifier == newChanges[j].identifier && changes[k].value != newChanges[j].value) {
                  //console.log("Condition updated, use new status! "+changes[k].identifier + newChanges[j].value);
                  changes[k].value = newChanges[j].value;
                }
              }
            }
          }
        } else if (changes[i].value == 'hide' && $('#' + FormsUtil.normalize(changes[i].identifier)).is(':visible')) {
          //update condition for visible elements within this element
          var conditionChanged = false;
          if (typeof changedFragmentObj != 'undefined' && changedFragmentObj.condition) {
            changedFragmentObj.condition = false;
            conditionChanged = true;
            //console.log("Set condition to false for "+FormsUtil.normalize(changes[i].identifier));
          }

          // throw high level event, so custom code can react on that
          $('#' + FormsUtil.normalize(changes[i].identifier)).trigger('IAF_HideFormFragment');

          $('#' + FormsUtil.normalize(changes[i].identifier)).find(":input").addBack(":input").filter(":hidden").each(function() {
            if ($(this).attr("name") != '' && typeof $(this).attr("name") != 'undefined') {
              recursiveChangedFragmentObj = FormsUtil.getObject(step, $(this).attr("name"));
              if (recursiveChangedFragmentObj != undefined) {
                //console.log("Set condition and visible to false for "+$(this).attr("name") + " because parent became invisible");
                recursiveChangedFragmentObj.condition = false;
                recursiveChangedFragmentObj.visible = false;
                if ($.inArray($(this).attr("name"), changeHistory) == -1) {
                  //console.log("Recurse into " + $(this).attr("name"));
                  changeHistory.push($(this).attr("name"));
                  changeFragment($(this), false, true, changeHistory);
                  conditionChanged = true;
                }
              }
            }
          });

          if (conditionChanged) {  
            newChanges = FormsUtil.checkConditions(step, '', formId);

            for (var j=0; j < newChanges.length;j++) {
              for (var k=i; k < changes.length;k++) {
                if (changes[k].identifier == newChanges[j].identifier && changes[k].value != newChanges[j].value) {
                  //console.log("Condition updated, use new status! "+changes[k].identifier + newChanges[j].value);
                  changes[k].value = newChanges[j].value;
                }
              }
            }
          }
        }
      }
    }
    return hasErrors;
  }

  //
  // Function to validate a form fragment
  // Returns true if an error has occurred
  //
  function validateFormFragment(inputObj, fragmentObj) {
    var inputName = inputObj.attr("name");
    var formId = inputObj.parents('form:first').attr("id");
    var hasError = false;
    if (fragmentObj !== null && typeof fragmentObj !== 'undefined' && !fragmentObj.validated) {
      // validate the input: only when visible
      if (inputObj.is(":visible")) {
        var validationResult = fragmentObj.validate();

        // gather the errors
        var errors = FormsUtil.join(validationResult,',');
        hasError = (errors != '');

        var errorDivId = "error_" + formId + "_" + FormsUtil.normalize(inputName);
        var errorObj = $("#" + errorDivId);
        if (errorObj.length > 0) {
          if (errors != '') {
            errorObj.trigger('IAF_ShowError',[errorDivId,validationResult]);
          } else {
            errorObj.trigger('IAF_HideError', errorDivId);
          }
        }
      }
    }
    return hasError;
  }


  //
  // Function for validating the form: the inputs are validated and the form is not submitted, when there are errors
  //
  function validateForm(formObj, step) {
    // loop over the inputs
    var hasError = false;
    $(':input[name][type!="hidden"][type!="button"][type!="submit"]', formObj).each(function() {
      var inputName = $(this).attr("name");
      var inputType = $(this).attr("type");

      // first, call changeFragment to set the "value" property for this formFragment
        var fragmentError = FormValidation.changeFragment($(this), true, false);

      // validate the formFragment again, now that the formFragment definitly has its "value" property set
      var fragmentObj = FormsUtil.getObject(step, inputName);
      fragmentError = validateFormFragment($(this), fragmentObj);
      if (fragmentError) {
        hasError = true;
      }
    });
    return hasError;
  }

  //
  // function to trigger a submit. Before submitting, all values which are not visible are cleared.
  //
  function submitForm(formObj, step) {
    // (4) make the value empty to prevent to be routed to the same step
    // issue: http://jira.gxdeveloperweb.com/jira/browse/GXWMF-626

    formObj.unbind('submit');

    $(':input', formObj).each(function() {
      // skip the hidden inputs
      var inputName = $(this).attr("name");

      var fragmentObj = FormsUtil.getObject(step, inputName);
      if (fragmentObj !== null && typeof fragmentObj !== 'undefined' && !fragmentObj.visible) {
        // clear the value
        switch(this.type) {
          case 'password':
          case 'select-multiple':
          case 'select-one':
          case 'text':
          case 'textarea':
            $(this).val('');
            break;
          case 'checkbox':
          case 'radio':
            $(this).removeAttr("checked");
            // add an empty input type="hidden": this because the browser doesn't send an empty radio
            formObj.append('<input type="hidden" name="' + inputName + '" value="" />');
        }
      }
    });
    formObj.trigger('IAF_SubmitForm');
  };


  //
  // Utility functions with jQuery syntax, and thus not in the formutil.js
  // Get the value(s) for an object. This implementation differs per input type
  //
  function getFragmentValue(obj) {
    value = obj.val();

    if (obj.attr("type") == 'radio') {
      var fieldname = obj.attr("name");
      fieldname = fieldname.replace(/\./g, "\\.");
      value = $('input[name=' + fieldname + ']:checked').val();
    }
    // for checkboxes we pass the array of values
    if (obj.attr("type") == 'checkbox') {
      values = $("input:checkbox[name='" + obj.attr("name") + "']:checked") || [];
      value = new Array();

      i=0;
      values.each(function() {
        value.push($(this).val());
        i++;
      });
    }
    return value;
  }

  //
  // Public methods and variables.
  //
  return {
    changeFragment:changeFragment,
    submitForm:submitForm,
    validateForm:validateForm,
    validateFormFragment:validateFormFragment,
    getFragmentValue:getFragmentValue
  }

}();

//
// Implemented interaction:
//  (1) onchange: the fragment is validated clientside
//  (2) onchange of a radio, checkbox or selectbox, the preconditions are verified to determine if part of the form has to be shown or not
//  (3) onsubmit: all fields, which are not validated yet are validated. When there are errors the form is not posted
//  (4) onsubmit: when the form is posted: fields which are not visible are cleared
//  (5) onload: the value and the visibility from the inputs are set. This is for the Firefox prefilling values
//

var SUBMIT_TIMEOUT = 1000 * 60; // 1 minute

$(document).ready(function(event) {

  //
  // implemented a optimization for the clientside framework:
  //  - load the formState object aynsychronous
  //  - cache the formState serverside
  //  - add an extra call for the filled in values
  //  - init the bindings
  //
  $('.wmpform').each(function() {
    initCSFW($(this));
  });

  function initCSFW(formObj) {
    var url = $(formObj).find('.csfw').val();
    var versionId = $(formObj).find('.csfw_versionId').val();
    var stepId = $(formObj).find('.csfw_stepId').val();
    var formId = $(formObj).attr('id');
    var useAjax = $("input[name='clientsideRouting']", formObj).val() === 'true';

    if (typeof url !== 'undefined') {
      // Asynchronous calls cause errors when there are multiple forms on the page and the step is not loaded with Ajax
      var async = ($('.wmpform').length == 1 || (useAjax && stepId != ''));
      $.ajax({
        url: url,
        async: async,
        success: function(data) {
          // Always fill the WebmanagerFormStateRegistry with the result of the clientside framework,
          // because the default code in XC does not do not that correctly for ajax forms
          if (useAjax && stepId !== '') {
            data += ";\nWebmanagerFormStateRegistry['" + formId + "'] = " + formId + ";";
          }

          eval(data);
          var formState = WebmanagerFormStateRegistry[formId];

          // we don't get the form values from the user when we don't have a wmstepid in the form
          if (stepId != '') {

            $.getJSON(contextPath + '/wcbservlet/nl.gx.forms.wmpformelement.servlet?formVersionId=' + versionId, function(data) {
              var formOk = false;

              $.each(data.steps, function(j,step){
                formOk = true;
                var stepId = step.identifier;
                $.each(step.fragments, function(i,item){
                  if (typeof item.name !== 'undefined') {
                    var fragmentObj = FormsUtil.getObject(formState[stepId], item.name);
                    if (fragmentObj !== null && typeof fragmentObj != 'undefined') {
                      if (item.value !== null && typeof item.value != 'undefined') {
                        fragmentObj.value = item.value;
                      }
                      fragmentObj.visible = item.visible;
                    }
                  }
                });
              });

              if (formOk) {
                enableButtons(formObj);
              } else {
                disableButtons(formObj);
              }
              init(formObj);
            });
          } else {
            init(formObj);
          }
        }
      });
    } else {
      // do the old behavior
      init(formObj);
    }
  }

  // Capture the high level events
  $(document).on('IAF_ShowFormFragment', 'div', function() {
    $(this).removeClass('displayNone').show();
    return false;
  });

  $(document).on('IAF_HideFormFragment', 'div', function() {
    $(this).hide();
    return false;
  });

  $(document).on('IAF_SubmitForm', 'form', function(event) {
    var useAjax = $("input[name='clientsideRouting']", this).val();
    var iaForm = $(this);

    if (useAjax === 'true') {
      $(this).ajaxSubmit({
        dataType:'json',
        timeout: SUBMIT_TIMEOUT,
        error: function(xhr, textStatus, errorThrown) {
          var response = null;
          try {
            response = xhr.responseText;
          } catch (e) {}

          if (response !== null && response.toLowerCase().indexOf("<pre>") === 0) {
            // When the form contains an upload, the json response is wrapped in (firefox) or
            // prefixed by (IE 8) a <pre> tag. As a result the default conversion to json fails
            var data = response.substring(5, response.lastIndexOf("}") + 1);
            iaForm.trigger("IAF_AfterSubmit", $.parseJSON(data));
          } else {
            iaForm.trigger("IAF_AfterSubmit");
          }
        },
        success: function(data) {
          iaForm.trigger("IAF_AfterSubmit", data);
        },
        semantic: false
      });
    } else {
      $(this).submit();
    }

    return false;
  });

  $(document).on('IAF_AfterSubmit', 'form', function(event, data) {
    if (typeof data === "undefined" || (typeof data.routingResult !== "undefined" &&
        typeof data.routingResult.httpError !== "undefined"))
    {
      // There was no response or the response is a routing result with http error
      showGeneralErrorMessage($(this));
      init($(this));
    } else if (typeof data.routingResult !== "undefined") {
      if (data.routingResult.type === '0') {
        document.location.href = data.routingResult.url;
      } else {
        $(this).trigger("IAF_AjaxShowFormStep", data.routingResult.step);
      }
    } else if (typeof data.result !== "undefined") {
      var formStep = $(":input[name='wmstepid']:first", $(this)).val();
      $(this).trigger("IAF_AjaxShowFormStep", formStep);
    } else {
      showGeneralErrorMessage($(this));
      init($(this));
    }
  });

  $(document).on('IAF_AjaxShowFormStep', 'form', function(event, formStep) {
    var baseUrl = $(this).data("ajax-url");
    var nextUrl = baseUrl;
    if (typeof formStep !== 'undefined' && formStep !== '') {
      if (nextUrl.indexOf('?') !== -1) {
        nextUrl = nextUrl + '&wmstepid=' + formStep;
      } else {
        nextUrl = nextUrl + '/wmstepid=' + formStep;
      }
    }

    $(this).closest("div.iaf-form-holder-outer").load(nextUrl + " .iaf-form-holder-inner", function() {
      var form = $(this).find(".wmpform");
      initCSFW($(form));
    });
  });

  $(document).on('IAF_ShowError', 'div', function(e, errorDivId, errors) {
    $('#' + errorDivId)
        .html('<ul><li>' + FormsUtil.join(errors,'</li><li>') + '</li></ul>')
        .addClass('error-message')
        .show();
    $('#' + errorDivId)
        .closest('.fieldgrp')
        .addClass('error');
  });

  $(document).on('IAF_HideError', 'div', function(e, errorDivId) {
    $('#' + errorDivId)
        .empty()
        .hide();
    $('#' + errorDivId)
        .parents('.fieldgrp')
        .removeClass('error-message')
        .removeClass('error');
  });

  // Show a general error message and enable all buttons in a form
  function showGeneralErrorMessage(formObj) {
    var fieldObj = $(".generalerrormessage", formObj);

    // Show the error message
    fieldObj.removeClass('displayNone');

    // Re-enable the buttons
    enableButtons(formObj);
  }

  // Enable all buttons in a form
  function enableButtons(formObj) {
    formObj.find(':input:submit').each(function() {
      $(this).removeAttr('disabled');
    });
  }

  // Disable all buttons in a form
  function disableButtons(formObj) {
    formObj.find(':input:submit').each(function() {
      $(this).attr('disabled', 'disabled');
    });
  }

  //
  // The init is called after the form values from the use are set in the client side framework:
  // Now we can add the events.
  //
  function init(formObj) {
    //
    // (1) Set a change event on all inputs: we can determine clientside if other fields needs to be shown
    // This is not done by looping over the inputs, because this doesn't work for repeats
    //
    formObj.find(':input').change(function() {
      FormValidation.changeFragment($(this), true, false);
    });

    // (3) validate all inputs when the form is submitted
    formObj.submit(function(event) {
      var formId = $(this).attr("id");
      var step = WebmanagerFormStateRegistry[formId].currentStep();

      var useAjax = $("input[name='clientsideRouting']", this).val();
      var backPressed = $("input[type='hidden'][name='wmback']", this).val();
      if (useAjax === 'true' || !backPressed) {
        event.preventDefault();
      }

      if (!backPressed) {
        var hasErrors = FormValidation.validateForm($(this), step);
        if (!hasErrors) {
          var actionButton = $(this).data("actionButton");
          if (typeof actionButton !== "undefined" && actionButton !== '') {
            var action = actionButton.closest(".wm-field").attr("id");
            if (typeof action !== "undefined" && action !== '') {
              var actionField = actionButton.attr("data-iaf_action");
              if (typeof actionField !== "undefined" && actionField !== '') {
                $(formObj).find(actionField).val(action);
              }
            }
            $(formObj).removeData("actionButton");
          }

          // now we can submit the form
          disableButtons(formObj);
          FormValidation.submitForm($(this), step);
        }
      } else {
        disableButtons(formObj);
        if (useAjax === 'true') {
          FormValidation.submitForm($(this), step);
        }
      }
    });

    formObj.find('.wm_input_back_button').click(function() {
      $("input[type='hidden'][name='wmback']", formObj).val('true');
    });

    $(':input:submit[data-iaf_action],:input:button[data-iaf_action]', formObj).bind("click", function(event) {
      event.preventDefault();
      $(formObj).data("actionButton", $(this));
      $(formObj).trigger("submit");
    });

    //
    // Set a click event on all radio inputs and pipe it to the onChange
    // this to avoid problems in IE6/IE7/IE8 that have a different event model
    //
    formObj.find(':input:radio').click(function() {
      if (FormsUtil.isIE) {
        $(this).change();
      }
    });


    //
    // (5) Set the initial value and visibility
    //
    var inputs = new Array();
    // This is for the radio and checkboxes: we only need to set them once
    var done = new Array();

    formObj.find(':input').each(function() {
      var formId = formObj.attr("id");
      var step = WebmanagerFormStateRegistry[formId].currentStep();

      var inputName = $(this).attr("name");
      var inputType = $(this).attr("type");
      if (!FormsUtil.contains(done, inputName)) {
        if (inputType !== 'hidden') {
          done.push(inputName);
        }

        var fragmentObj = FormsUtil.getObject(step, $(this).attr("name"));
        if (fragmentObj !== null && typeof fragmentObj !== "undefined") {
          fragmentObj.visible = $(this).is(":visible");
          inputs.push($(this));
        }
      }
    });

    // Trigger the change event after the value and visibility is set
    for (var i = 0; i < inputs.length; i++) {
      FormValidation.changeFragment(inputs[i], false, true);
    }
    formObj.trigger('IAF_ClientsideFrameworkLoaded');
  }
});

/* Dutch (UTF-8) initialisation for the jQuery UI date picker plugin. */
/* Written by Mathias Bynens <http://mathiasbynens.be/> */
jQuery(function($){
        $.datepicker.regional['nl'] = {
                closeText: 'Sluiten',
                prevText: 'Vorige',
                nextText: 'Volgende',
                currentText: 'Vandaag',
                monthNames: ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
                'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
                monthNamesShort: ['jan', 'feb', 'maa', 'apr', 'mei', 'jun',
                'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
                dayNames: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
                dayNamesShort: ['zon', 'maa', 'din', 'woe', 'don', 'vri', 'zat'],
                dayNamesMin: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
                weekHeader: 'Wk',
                dateFormat: 'dd-mm-yy',
                firstDay: 1,
                isRTL: false,
                showMonthAfterYear: false,
                yearSuffix: ''};
        $.datepicker.setDefaults($.datepicker.regional['nl']);
});