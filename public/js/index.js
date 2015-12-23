// Do initial set up

var app = new Object();

// Test is device is mobile, ie can rotate
var Mobile;

$(document).ready(function(){
    console.log("Device Ready. Initializing...");

	if (($(window).width() / $(window).height()) > 1.3) { 
		$('#home').css('background-image', 'url("css/images/pf-collections-background-wide.jpg")');
	} 

    $.mobile.loading('show');
	ProcessLocalStorage();
    PopulateAllFlowsList();
    PopulateCollectionsList();
    SetupScreen();

	// set up listeners for ui events
	$("#storepage").on("pagebeforeshow", function(event) { PopulateStore(); } );
	$("#collectionspage").on("pagebeforeshow", function(event) { PopulateCollectionsList(); } );
	$("#poemlistpage").on("pagebeforeshow", function(event) { PopulateAllFlowsList(); } );
/*
	$("#flowpage").on("pagebeforeshow", function(event) { FullScreen(true); } );
*/
	$("#poempage").on("pagebeforeshow", function(event) { FullScreen(false); } );
	
	Mobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) );
    $(window).bind('orientationChange', function(event) {
        checkOrientation();
    });
    $(window).bind('resize', function(event) {
        //checkOrientation();
    });

    $("#poemflow").click(function() {
        if (paused) {UnPause();} else {Pause();}
    });

	if (!localStorage.notFirstTime) {
		setTimeout("$('#overlay').popup('open')", 250);
		localStorage.notFirstTime = true;
	}

});

