// Do initial set up

var app = new Object();

$(document).ready(function(){
    console.log("Device Ready. Opening DB...");
    $.mobile.loading('show');
	ProcessLocalStorage();
    PopulateAllFlowsList();
    PopulateFavoritesList();
	PopulateCollectionsList();
	SetupCallbacks();	// register for rotation events etc
    SetupScreen();

	// set up listeners for ui events
	$("#storepage").on("pagebeforeshow", function(event) { PopulateStore(); } );
	$("#collectionspage").on("pagebeforeshow", function(event) { PopulateCollectionsList(); } );
	$("#poemlistpage").on("pagebeforeshow", function(event) { PopulateAllFlowsList(); } );
});

