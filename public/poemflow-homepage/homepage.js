// Code here overrides the stuff in the parent (PFC app) codebase
// Should ideally be refactored to work better standalone from the rest of the JQM-basde app


function PlayFlow() {
	// Play current flow

	if ($("#scrubberslider").hasClass("ui-slider-input")) // ensure already set up
		$("#scrubberslider").val(0).slider("refresh");

    setScale();
    paused = true;          // need to set this to get unpause to work on initial start
    UnPause();
}

var containerX;
var containerY;
function setScale()
// Set the scale
{
    var width = parseInt($("#poemflow").width());
    var height = parseInt($("#poemflow").height());
    var scalex = width / 480;	   // base width is 480
    var scaley = height / 320;     // base height is 320
    scale = (scalex < scaley) ? scalex : scaley;       // scale to fit
	var flowwidth = 480 * scale;
	var flowheight = 320 * scale;
    rightmargin = parseInt(parseFloat($("#poemflow").css("marginRight"))/scale);
    $("#poemflow").css("font-size", (28 * scale));
}



function UnPause(){
    console.log("into UNPause");
    if (!paused) { return;}
    $('#flowbuttoncontrolgroup').hide();
    var d = new Date();
	
	// scrubber has the interval whether we've scrubbed or not
	var interval = 0; //$("#scrubberslider").val();
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
    }
}

function ReadFileXML(filename) {
	console.log("trying to get "+filename);

	$.ajax({
        type: "GET",
		url: "..//flows/" + filename,
		dataType: "xml",
		success: function(thexml) {
			CurrentXML = thexml;
			AddFlowLocally();
			SetupFlow();
		}
    });
}

function setDisplay() {
	PlayFlow();
}

Mobile = false;
