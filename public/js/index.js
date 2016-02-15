// Do initial set up

var app = new Object();

// Test is device is mobile, ie can rotate
var Mobile;

function FirstTimeOverlay() {
	//show overlay if first time
	if (!localStorage.notFirstTime) {
		setTimeout("$('#overlay').popup('open')", 1000);
		localStorage.notFirstTime = true;
	}
}
var SliderActive = false;
$(document).ready(function(){
    console.log("Device Ready. Initializing...");
	var background = (($(window).width() / $(window).height()) > 1.2) ?
		'css/images/pf-collections-background-wide.jpg' :
		'css/images/pf-collections-background.jpg';

	// load image before changing background to avoid conflict w overlay
	$('<img/>').attr('src', background ).load(function() {
		$(this).remove(); // prevent memory leak
		$('#home').css('background-image', 'url('+background+')');
		//FirstTimeOverlay();
	});

    $.mobile.loading('show');
    ScreenFonts = ($(window).width() > 800) ? LargeScreenFont : SmallScreenFont;
    SetupScreen();
	ProcessLocalStorage();
    PopulateAllFlowsList();
    PopulateCollectionsList();

	// set up listeners for ui events
	$("#storepage").on("pagebeforeshow", function(event) { PopulateStore(); } );
	$("#collectionspage").on("pagebeforeshow", function(event) { PopulateCollectionsList(); } );
	$("#poemlistpage").on("pagebeforeshow", function(event) { PopulateAllFlowsList(); } );
/*
	$("#flowpage").on("pagebeforeshow", function(event) { FullScreen(true); } );
*/
	$("#poempage").on("pagebeforeshow", 
					  function(event) { 
						  FullScreen(false); 
						  FirstFlowOverlay();
					  } );
	$("#home").on("pageinit", 
					  function(event) { FirstTimeOverlay(); } );

	Mobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) );
    $(window).bind('orientationChange', function(event) {
        checkOrientation();
    });
    $(window).bind('resize', function(event) {
        checkOrientation();
    });

	// click or tap anywhere on the page toggles pause
    $("#flowpage").click(function(e) {
		if (SliderActive) { SliderActive = false; return;}
        if (paused) {UnPause();} else {Pause();}
    });
    $("#flowbuttoncontrolgroup").click(function(event) {
		// Here we note that the click/tap was while the Slider is active and therefore the flowpage click which propagates above should not be handled. (Couldn't figure out how to have the flowpage event not get fired at all.
		SliderActive = true;
    });

	$(document).on("pageinit", "#flowpage", function(){
		$("#scrubberslider").on('slidestart', function(e) {Scrub(); });
		$("#scrubberslider").on('slidestop', function(e) {ScrubStop(); });
	});
	
	setTimeout("DispatchToPage();", 100);
    $.mobile.loading('hide');
});


function DispatchToPage() {
// handle any passed in url params to deep link
	if (location.hash.split('?ID=')[0] == '#poempage')
		DispatchToPoemPage();
	else if (location.hash.split('?ID=')[0] == '#collectionpage')
		DispatchToCollectionPage();
	else
		FirstTimeOverlay();
}

function DispatchToPoemPage() {
// handle any passed in poem id
	CurrentFlow = location.hash.split('ID=')[1] || 280;
	FirstFlowOverlayDelay += 1000; // delay overlay
	FirstFlowOverlay();
	LoadCurrentFlow();
}
	
