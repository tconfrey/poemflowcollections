/*
  Code to create and play the actual flow
*/

var labels = [];
var displayed = [];
var scale = 1.0;
var paused = false;
var previousWidth = 0;
var timeout = null;
var starttime = 0;
var max = 0;
var vmax = 0;
var flowspeed = 1.0;

var checkOrientation = function(){
    console.log('checkOrientation: window width = ' + $(window).width());
    if (($.mobile.activePage.attr("id") != "poempage") && ($.mobile.activePage.attr("id") != "flowpage")) return;
	if (!Mobile && !window.screenTop && !window.screenY) return; // full screen (don't heed resize event)
    if($(window).width() != previousWidth){
        previousWidth = $(window).width();
        setDisplay();
    }
};

function SetupFlow() {
    
    // Clear the decks for a new flow
	SetupScreen();
    labels = []; displayed = [];
    $("#poemflow").empty();
    max = 0; vmax = 0; paused = false;
    var staticHTML = "<b>" + $(CurrentXML).find("title").text() + "</b><br/><br/>" + $(CurrentXML).find("ttvHTMLText").text();
    $('#staticpoem').html(staticHTML);
    var description = $(CurrentXML).find("description").text()
    $('#poeminfo').html(description);
	var poet = $(CurrentXML).find("author").first().text();
    $("#poetname").text(TrimTitle(poet, 20));  // set header title
    CreateFlow();

	// set up scrubber
	$("#scrubberslider").attr("max", max);

    // now start the animation
    var d = new Date();
    starttime = d.getTime();
    pausedstart = starttime;
    setDisplay();
}

// We get scrub start and stop events and set a timeout to capture motions in between
var scrubbing = null;
function Scrub() {
	var val = $("#scrubberslider").val();
	ttvInstant(val);			// scrub to val
	scrubbing = window.setTimeout(function() {Scrub();}, 100);
}

function ScrubStop() {
	if (scrubbing) { clearTimeout(scrubbing); scrubbing = false;}
}

function Pause(){
    console.log("into Pause");
    if (paused) { return;}

	var d = new Date();
    var interval =  ((d.getTime() - starttime) / 10) * flowspeed;
	if ($("#scrubberslider").hasClass("ui-slider-input")) // ensure already set up
		$("#scrubberslider").val(interval).slider("refresh");

    $('#flowbuttoncontrolgroup').show();
    if (timeout) { clearTimeout(timeout);}
    paused = true;
    console.log("outof Pause");
}

function UnPause(){
    console.log("into UNPause");
    if (!paused) { return;}
    $('#flowbuttoncontrolgroup').hide();
    var d = new Date();
	
	// scrubber has the interval whether we've scrubbed or not
	var interval = $("#scrubberslider").val();
	// flow time is centa-seconds, scaled by flowspeed
	var timeinterval = interval * 10 / flowspeed;
	var currenttime = d.getTime();
	starttime = currenttime - timeinterval;
	
//	ttvInstant(timeinterval);
	displayed = [];				// clear the stage for restarting
    $(labels).each(function () {
        $(this).remove();
	});

    ttvPosition();
    paused = false;
    console.log("outof UNPause");
}

function setDisplay()
// set portrait or landscape display (flow or static)
{
    console.log("width="+$(window).width()+", height="+ $(window).height());
    if (Mobile && ($(window).width() > $(window).height())) {
        // landscape on mobile device
		PlayFlow();
    }
    else {
        $.mobile.changePage($("#poempage"), {transition: "fade"});
        setScale();
        Pause();
    }
}

var FirstFlowOverlayDelay = 1000;
function FirstFlowOverlay() {
	//show overlay if first time
	if (!localStorage.notFirstFlow) {
		setTimeout("$('#poemoverlay').popup('open')", FirstFlowOverlayDelay);
		localStorage.notFirstFlow = true;
	}
}

var IsFullScreen = false;
function FullScreen(on) {	
	// Experimental fullscreen
	var docElement, request;
    docElement = document.documentElement;
	if (on && !IsFullScreen) {	// go full screen
		request = docElement.requestFullScreen || docElement.webkitRequestFullScreen || docElement.mozRequestFullScreen || docElement.msRequestFullScreen;
		if(typeof request!="undefined" && request){
			IsFullScreen = true; console.log("set fullscreen on");
			request.call(docElement);
		}
    }
	if (!on && IsFullScreen) {	// quit full screen
		request = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || document.msCancelFullScreen || document.exitFullscreen;
		if(typeof request!="undefined" && request){
			IsFullScreen = false; console.log("set fullscreen off");
			request.call(document);
		}
	}		
}

function PlayFlow(fullScreen=true) {
	// Play current flow

	if ($("#scrubberslider").hasClass("ui-slider-input")) // ensure already set up
		$("#scrubberslider").val(0).slider("refresh");
	SetupScreen();

    $.mobile.changePage($("#flowpage"), {transition: "fade"});
	FullScreen(fullScreen);
    setScale();
    paused = true;          // need to set this to get unpause to work on initial start
    UnPause();
}

var containerX;
var containerY;
function setScale()
// Set the scale
{
    var width = parseInt($(window).width());
    var height = parseInt($(window).height());
	var extrascalefactor = 1.25;
    var scalex = width / 480;	   // base width is 480
    var scaley = height / 320;     // base height is 320
    scale = (scalex < scaley) ? scalex : scaley;       // scale to fit
	scale = scale * extrascalefactor;
	var flowwidth = 480 * scale;
	var flowheight = 320 * scale;
    
    $("#poemflow").css({"width" : flowwidth});
    $("#poemflow").css({"height" : flowheight});
    $("#poemflow").css("font-size", (28 * scale));
    $("#poemflow").css("padding", 0);
	$("#poemflow").css("margin-left", ((width - flowwidth)/2));
	$("#poemflow").css("margin-top", ((height - flowheight)/4));
}

var flowcache;
var rightmargin = 0;
function CreateFlow() {
    // Function to parse flow xml and create label objects
    setScale();             // need scale set below
    var index = 0;
    flowcache = new Object();
    $(CurrentXML).find("ttvVerse").each(function () {
        $(this).find("ttvLabel").each(function () {
            var m1 = $(this).find("ttvMotion")[0];
            var m2 = $(this).find("ttvMotion")[1];
            var t11 = parseInt($(m1).attr('t1')) + max;
            var t12 = parseInt($(m1).attr('t2')) + max;
            var t21 = parseInt($(m2).attr('t1')) + max;
            var t22 = parseInt($(m2).attr('t2')) + max;
            var x11 = parseInt($(m1).attr('x1')) + rightmargin;
            var x12 = parseInt($(m1).attr('x2')) + rightmargin;
            var x21 = parseInt($(m2).attr('x1')) + rightmargin;
            var x22 = parseInt($(m2).attr('x2')) + rightmargin;
            var y11 = parseInt($(m1).attr('y1'));
            var y12 = parseInt($(m1).attr('y2'));
            var y21 = parseInt($(m2).attr('y1'));
            var y22 = parseInt($(m2).attr('y2'));
            var a11 = parseInt($(m1).attr('a1'));
            var a12 = parseInt($(m1).attr('a2'));
            var a21 = parseInt($(m2).attr('a1'));
            var a22 = parseInt($(m2).attr('a2'));
            if (parseInt($(m2).attr('t2')) > vmax) {
                vmax = parseInt($(m2).attr('t2'));
            }

            var ttvDiv = $("<div class='ttvLabel' style='white-space: pre; position: absolute; opacity: 0.0' id ='" + index + "'>" + $(this).attr('text') + "</div>" );
            ttvDiv.attr('t11', t11); ttvDiv.attr('t12', t12); ttvDiv.attr('t21', t21); ttvDiv.attr('t22', t22);
            ttvDiv.attr('fontstyle', ($(this).attr('fontStyle') == 'italic') ? 'italic' : 'normal');
            if ($(this).attr('fontSize')) {
                ttvDiv.attr('fontSize', $(this).attr('fontSize'));
            }
            if ($(this).attr('text')) {
                labels.push(ttvDiv);        // Avoid the no text labels the Composer sometimes creates
            }
			flowcache[index] = new Object();
			flowcache[index].t11 = t11; flowcache[index].t12 = t12; flowcache[index].t21 = t21; flowcache[index].t22 = t22;
			flowcache[index].x11 = x11; flowcache[index].x12 = x12; flowcache[index].x21 = x21; flowcache[index].x22 = x22;
			flowcache[index].y11 = y11; flowcache[index].y12 = y12; flowcache[index].y21 = y21; flowcache[index].y22 = y22;
			flowcache[index].a11 = a11; flowcache[index].a12 = a12; flowcache[index].a21 = a21; flowcache[index++].a22 = a22;
        });
        max += vmax; vmax = 0;
    });
}

function ttvPosition() {
    // called continuously to update display until complete
    //console.log("starttime="+starttime);
    var d = new Date();
	// calculate current animation time if not passed in
    var interval =  ((d.getTime() - starttime) / 10) * flowspeed;
    // Used by UpdateDisplay, calculate once for performance
    containerX = parseInt($("#poemflow").position().left);
    containerY = parseInt($("#poemflow").position().top);

	ttvInstant(interval); 		// display appropriate labels

    if (interval < max)	{								   // reset the timer
        timeout = window.setTimeout(ttvPosition, 20);
    } else {					// or back to poem page
        $.mobile.changePage($("#poempage"), {transition: "fade"});
    }
}

function ttvInstant (interval) {
	// display flow at this interval
    $(labels).each(function () {
		var id = $(this).attr('id');
        if ((interval > $(this).attr('t11')) && (interval < $(this).attr('t22'))) { // should be displayed
			if ($.inArray(id, displayed) < 0) {	   // if not already, add to display
				if ($(this).attr('fontsize')) {
                    $(this).css({"fontSize": parseInt($(this).attr('fontSize') * scale) +'px', "fontStyle": $(this).attr('fontstyle')});
				}
                $("#poemflow").append($(this));
                displayed.push(id);
            }
            updateDisplay($(this), interval);           // update label for this time
        }
        else { //if (interval > $(this).attr('t22')) {      // else hide it - time passed
            if ($.inArray(id, displayed) >= 0) {        // If still being displayed
                displayed.splice( $.inArray(id, displayed), 1 );  // remove from displayed list
                $(this).remove();
            }
        }
    });
}

function updateDisplay(ttvLabel, time) {
    // update this labels position at this time
    var x,y,a,deltaT, top, left;
    var fontsize = parseInt($(ttvLabel).css("font-size"));
	var flowcacheobj = flowcache[$(ttvLabel).attr('id')];
    if ((time >= flowcacheobj.t11) && (time < flowcacheobj.t12)) {						   // first motion
        deltaT = (time - flowcacheobj.t11) / (flowcacheobj.t12 - flowcacheobj.t11);
        x = interpolateX(flowcacheobj.x11, flowcacheobj.x12, deltaT); x = parseInt(x * scale);
        y = interpolateX(flowcacheobj.y11, flowcacheobj.y12, deltaT); y = parseInt(y * scale) - fontsize;
        a = interpolateX(flowcacheobj.a11, flowcacheobj.a12, deltaT);
        top = parseInt(containerY + y) + "px";
        left = parseInt(containerX + x) + "px";
		$(ttvLabel).css({"top": top, "left": left, "opacity": a });
        //		console.log("M1[" + $(ttvLabel).text() + "]: top = " + top + " left = " + left + " cX: " + containerX + " @t=" + time);
    } else if ((time >= flowcacheobj.t12) && (time < flowcacheobj.t21)){					   // between motions
	// ONLY DO THIS ONCE FOR PERFORMANCE
        x = flowcacheobj.x12; x = parseInt(x * scale);
        y = flowcacheobj.y12; y = parseInt(y * scale) - fontsize;
        a = flowcacheobj.a12;
        top = parseInt(containerY + y) + "px";
        left = parseInt(containerX + x) + "px";
		$(ttvLabel).css({"top": top, "left": left, "opacity": a });
        //		console.log("Mid[" + $(ttvLabel).text() + "]: top = " + top + " left = " + left + " cX: " + containerX + " @t=" + time);
    } else if ((time >= flowcacheobj.t21) && (time <= flowcacheobj.t22)){
        deltaT = (time - flowcacheobj.t21) / (flowcacheobj.t22 - flowcacheobj.t21);
        x = interpolateX(flowcacheobj.x21, flowcacheobj.x22, deltaT); x = parseInt(x * scale);
        y = interpolateX(flowcacheobj.y21, flowcacheobj.y22, deltaT); y = parseInt(y * scale) - fontsize;
        a = interpolateX(flowcacheobj.a21, flowcacheobj.a22, deltaT);
        top = parseInt(containerY + y) + "px";
        left = parseInt(containerX + x) + "px";
		$(ttvLabel).css({"top": top, "left": left, "opacity": a });
        // console.log("M2: top = " + top + " left = " + left + " @t=" + time);
    }
}

function interpolateX(x1, x2, deltaT) {
    // return new x
    var val =  parseFloat((x2 - x1) * deltaT) + parseInt(x1);
    //console.log("x1:", x1, " x2:", x2, " delt:", deltaT, " value:", val);
    return val;
}
