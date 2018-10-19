var img;
var img_mo;
var img_cl;
img = new Array();
img_mo = new Array();
img_cl = new Array();

function initMo(uniqueid, origImgSrc, overImgSrc, clickImgSrc) {
  if (origImgSrc != '') {
    img[uniqueid] = new Image();
    img[uniqueid].src = origImgSrc;
  }
  if (overImgSrc != '') {
    img_mo[uniqueid] = new Image();
    img_mo[uniqueid].src = overImgSrc;
  }
  if (clickImgSrc != '') {
    img_cl[uniqueid] = new Image();
    img_cl[uniqueid].src = clickImgSrc;
  }
}


function mov(uniqueid) {
  if (img_mo[uniqueid]) {
	if (typeof document[uniqueid] != 'undefined') {
    	document[uniqueid].src = img_mo[uniqueid].src;
    } else {
    	obj = document.getElementById(uniqueid);
    	if (typeof obj != 'undefined') {
	    	obj.src = img_mo[uniqueid].src;
    	}
    }
  }
}


function mou(uniqueid) {
  if(img[uniqueid]) {
	if (typeof document[uniqueid] != 'undefined') {
		document[uniqueid].src = img[uniqueid].src;
    } else {
    	obj = document.getElementById(uniqueid);
    	if (typeof obj != 'undefined') {
		    obj.src = img[uniqueid].src;
    	}
    }
  }
}


function md(uniqueid) {
  if (img_cl[uniqueid]) {
	if (typeof document[uniqueid] != 'undefined') {
	    document[uniqueid].src = img_cl[uniqueid].src;
    } else {
    	obj = document.getElementById(uniqueid);
    	if (typeof obj != 'undefined') {
		    obj.src = img_cl[uniqueid].src;
    	}
    }
  }
}

function setCookie(name, value, expire) {
  if (expire == '') {
    document.cookie = name + '=' + escape(value) + '; path=/';
  } else {
    var expires = new Date();
    expires.setTime(expires.getTime() + expire);

    document.cookie = name + '=' + escape(value) + ((expire == null) ? '' : ('; expires=' + expires.toGMTString())) + '; path=/';
  }
}


function getCookie(name) {
   var search = name + "=";
   var val = "";
   var offset,end;
   
   if(document.cookie.length > 0) { // if there are any cookies
      offset = document.cookie.indexOf(search) 

      if(offset != -1) { // if cookie exists 
         offset += search.length;

         // set index of beginning of value
         end = document.cookie.indexOf(";", offset) 

         // set index of end of cookie value
         if (end == -1) {
            end = document.cookie.length;
         }

         val = unescape(document.cookie.substring(offset, end));
      } 
   }

   return val;
}

function newSession() {
  if (getCookie('session') == 'set') {
    return false;
  } else {
    setCookie('session', 'set', '');
    if (getCookie('session') == 'set') {
      return true;
    } else {
      return false;
    }
  }
}

function showURL(url, windowname, width, height) {
  var w;
  w = top.open(url, windowname, 'toolbar=no,location=no,directories=no,status=yes,menubar=no,scrollbars=yes,resizable=yes,height=' + height + ',width=' + width);
  if(w==null) {
    return null;
  }
  w.opener = window;
  return w;
}

var requiredVersion = 5; 
var useRedirect = false; 
           
var flash2Installed = false;  
var flash3Installed = false;  
var flash4Installed = false;  
var flash5Installed = false;  
var flash6Installed = false;
var flash7Installed = false;
var flash8Installed = false;
var flash9Installed = false;
var flash10Installed = false;
var flash11Installed = false;
var flash12Installed = false;
var flash13Installed = false;
var flash14Installed = false;
var flash15Installed = false;
var flash16Installed = false;


var maxVersion = 16;
var actualVersion = 0;    
var hasRightVersion = false;  
var jsVersion = 1.0;    

var isIE = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;   // true if we're on ie
var isWin = (navigator.appVersion.indexOf("Windows") != -1) ? true : false; // true if we're on windows

if(isIE && isWin){ // don't write vbscript tags on anything but ie win
  document.write('<SCR' + 'IPT LANGUAGE=VBScript\> \n');
  document.write('on error resume next \n');
  document.write('flash2Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.2"))) \n');
  document.write('flash3Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.3"))) \n');
  document.write('flash4Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.4"))) \n');
  document.write('flash5Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.5"))) \n');
  document.write('flash6Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.6"))) \n');
  document.write('flash7Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.7"))) \n');
  document.write('flash8Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.8"))) \n');
  document.write('flash9Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.9"))) \n');
  document.write('flash10Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.10"))) \n');
  document.write('flash11Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.11"))) \n');
  document.write('flash12Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.12"))) \n');
  document.write('flash13Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.13"))) \n');
  document.write('flash14Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.14"))) \n');
  document.write('flash15Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.15"))) \n');
  document.write('flash16Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.16"))) \n');
  document.write('</SCR' + 'IPT\> \n'); // break up end tag so it doesn't end our script
}

jsVersion = 1.1;
detectFlash = function(){
  if (navigator.plugins) {  // does navigator.plugins exist?
    if (navigator.plugins["Shockwave Flash 2.0"]  
  || navigator.plugins["Shockwave Flash"]){   

    var isVersion2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
    var flashDescription = navigator.plugins["Shockwave Flash" + isVersion2].description;
    var flashVersion = parseInt(flashDescription.substr(flashDescription.indexOf(".") - 2, 2));

    flash2Installed = flashVersion == 2;
    flash3Installed = flashVersion == 3;
    flash4Installed = flashVersion == 4;
    flash5Installed = flashVersion == 5;
    flash6Installed = flashVersion == 6;
    flash7Installed = flashVersion == 7;
    flash8Installed = flashVersion == 8;
    flash9Installed = flashVersion == 9;
    flash10Installed = flashVersion == 10;
    flash11Installed = flashVersion == 11;
    flash12Installed = flashVersion == 12;
    flash13Installed = flashVersion == 13;
    flash14Installed = flashVersion == 14;
    flash15Installed = flashVersion == 15;
    flash16Installed = flashVersion == 16;
    }
  }

  for (var i = 2; i <= maxVersion; i++) {
    if (eval("flash" + i + "Installed") == true) actualVersion = i;
  }

  if(navigator.userAgent.indexOf("WebTV") != -1) actualVersion = 2;

  if (actualVersion >= requiredVersion) {
    hasRightVersion = true;
    if (useRedirect) {
      if(jsVersion > 1.0) {
        window.location.replace(flashPage);
      } else {
        window.location = flashPage;
      }
    }
  } else {  
    if (useRedirect) {    
      if(jsVersion > 1.0) { 
        window.location.replace((actualVersion >= 2) ? upgradePage : noFlashPage);
      } else {
        window.location = (actualVersion >= 2) ? upgradePage : noFlashPage;
      }
    }
  }
}
 
writeFlash = function(s,w,h,a,wmode,div) {
  if (typeof wmode == 'undefined') {
    wmode = null;
  }

  if (typeof div == 'undefined') {
    div = null;
  }
  
  var alternateContent = a;
  if (alternateContent == '') {
    alternateContent = 'Voor deze site heeft u <a target="_blank" href="http://www.microsoft.com/download/">Microsoft Internet Explorer</a> versie 5.5 (of hoger) en de <a target="_blank" href="http://get.adobe.com/nl/flashplayer/">Adobe Flash Player</a> versie ' + requiredVersion + ' (of hoger) nodig.'
  }

  var flashContent = '<OBJECT CLASSID="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" WIDTH="'+w+'" HEIGHT="'+h+'" CODEBASE="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" WMODE="transparent">'
  + '<PARAM NAME="MOVIE" VALUE="'+s+'">'
  + '<PARAM NAME="PLAY" VALUE="true">'
  + '<PARAM NAME="LOOP" VALUE="false">'
  + '<PARAM NAME="QUALITY" VALUE="high">';
  if (wmode!=null) {
      flashContent += '<PARAM NAME="wmode" VALUE="'+wmode+'">';
  }
  flashContent += '<PARAM NAME="MENU" VALUE="false">'
  + '<EMBED SRC="'+s+'" ';
  if (wmode!=null) {
    flashContent += ' WMODE="'+wmode+'" ';
  }
  flashContent += 'WIDTH="'+w+'" HEIGHT="'+h+'" PLAY="true" LOOP="false" QUALITY="high" MENU="false" TYPE="application/x-shockwave-flash" PLUGINSPAGE="http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash"></EMBED>'
  + '<NOEMBED>' + alternateContent + '</NOEMBED></OBJECT>';
  if (hasRightVersion) {
    if (div != null) {
      div.innerHTML = flashContent;
    } else {
      document.write(flashContent);
    }
  } else {
    if (div != null) {
      div.innerHTML = alternateContent;
    } else {
      document.write(alternateContent);
    }  
  }
}


// addOnLoadListener(func)
// ~~~~~~~~~~~~~~~~~~~~~~~
// Adds a function to be called during the window's onLoad event. Multiple
// functions may be registered. This function is intended to be called during
// document load-time.
// For example:
//
// <body>
//   <script language="javascript1.2">
//     function task1() { alert('task1'); }
//     addOnLoadListener(task1);
//   </script>
// </body>
//
// Tested on IE 6.0 and Mozilla 1.5.
//
// Parameters:
// func - Function to be called during the window's onLoad event.

function addOnLoadListener(func) {
  if (window.addEventListener) {
    window.addEventListener("load", func, true);
  } else if (window.attachEvent) {
    window.attachEvent("onload", func);   
  }
}
