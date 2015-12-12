
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
    if($(window).width() != previousWidth){
        previousWidth = $(window).width();
        setDisplay();
    }
};

function SetupCallbacks()
// initial setup
{
	console.log("--------- Setting up orientation callbacks --------");
    $(window).bind('orientationChange', function(event) {
        checkOrientation();
    });
    $(window).bind('resize', function(event) {
        checkOrientation();
    });
    $("#poemflow").click(function() {
        if (paused) {UnPause();} else {Pause();}
    });
}

function SetupFlow() {
    
    // Clear the decks for a new flow
    labels = []; displayed = [];
    $("#poemflow").empty();
    $("#replaybutton").css("visibility", "hidden");
    max = 0; vmax = 0; paused = false;
    var staticHTML = "<b>" + $(CurrentXML).find("title").text() + "</b><br/><br/>" + $(CurrentXML).find("ttvHTMLText").text();
    $('#staticpoem').html(staticHTML);
    var description = $(CurrentXML).find("description").text()
    $('#poeminfo').html(description);
    $("#poemname").text($(CurrentXML).find("author").first().text());  // set header title
    CreateFlow();
    
    // now start the animation
    var d = new Date();
    starttime = d.getTime();
    pausedstart = starttime;
    setDisplay();
}

function Replay() {
    // start the flow again
    $("#replaybutton").css("visibility", "hidden");
    paused = true;
    var d = new Date();
    starttime = d.getTime();
    pausedstart = starttime;
    setDisplay();
}

var pausedstart = 0;
function Pause(){
    console.log("into Pause");
    if (paused) { return;}
    $('#resumebutton').show();
    var d = new Date();
    pausedstart = d.getTime();
    if (timeout) { clearTimeout(timeout);}
    paused = true;
    console.log("outof Pause");
}

function UnPause(){
    console.log("into UNPause");
    if (!paused) { return;}
    $('#resumebutton').hide();
    var d = new Date();
    var pausetime = d.getTime() - pausedstart;
    starttime += pausetime;
    ttvPosition();
    paused = false;
    console.log("outof UNPause");
}

function setDisplay()
// set portrait or landscape display (flow or static)
{
    console.log("width="+$(window).width()+", height="+ $(window).height());
    if ($(window).width() > $(window).height()) {
        // landscape
        $.mobile.changePage($("#flowpage"), {transition: "slide"});
        setScale();
        paused = true;          // need to set this to get unpause to work on initial start
        UnPause();
    }
    else {
        $.mobile.changePage($("#poempage"), {transition: "slide"});
        setScale();
        Pause();
    }
}

var containerX;
var containerY;
function setScale()
// Set the scale
{
    var width = parseInt($(window).width());
    var height = parseInt($(window).height());
    var scalex = width / 480;	                       // base width is 480
    var scaley = height / 320;                         // base height is 320
    scale = (scalex < scaley) ? scalex : scaley;       // scale to fit
    
    $("#poemflow").css({"width" : 480*scale});
    $("#poemflow").css({"height" : 320*scale});
    $("#poemflow").css("font-size", (28 * scale));
	if (width == 568) {			// hokey hard coding for the long skinny iphone rather than screwing w css to center
		$("#poemflow").css("left", "29px");
	}
    
}

var flowcache;
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
            var x11 = parseInt($(m1).attr('x1'));
            var x12 = parseInt($(m1).attr('x2'));
            var x21 = parseInt($(m2).attr('x1'));
            var x22 = parseInt($(m2).attr('x2'));
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
            //ttvDiv.attr('x11', x11); ttvDiv.attr('x12', x12); ttvDiv.attr('x21', x21); ttvDiv.attr('x22', x22);
            //ttvDiv.attr('y11', y11); ttvDiv.attr('y12', y12); ttvDiv.attr('y21', y21); ttvDiv.attr('y22', y22);
            //ttvDiv.attr('a11', a11); ttvDiv.attr('a12', a12); ttvDiv.attr('a21', a21); ttvDiv.attr('a22', a22);
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
    var interval = ((d.getTime() - starttime) / 10) * flowspeed; // current animation time
    
    /*
    if (paused) {										   // reset the timer
        timeout = window.setTimeout(ttvPosition, 10, starttime + 10, maxtime);
        return;
    }
     */
    
    var fntsize;
    // Used by UpdateDisplay, calculate once for performance
    containerX = parseInt($("#poemflow").position().left);
    containerY = parseInt($("#poemflow").position().top);
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
            updateDisplay($(this), interval);                           // update this labels display for this time
        }
        else if (interval > $(this).attr('t22')) {                      // else hide it if display time passed
            if ($.inArray(id, displayed) >= 0) {                         // if still being displayed
                displayed.splice( $.inArray(id, displayed), 1 );        // remove from displayed list
                $(this).remove();
            }
        }
    });
    if (interval < max)	{								   // reset the timer
        timeout = window.setTimeout(ttvPosition, 20);
    } else {
        $("#replaybutton").css("visibility", "visible");
    }
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
