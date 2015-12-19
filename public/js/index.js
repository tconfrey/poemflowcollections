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
	$("#favoritespage").on("pagebeforeshow", function(event) { PopulateFavoritesList(); } );
	$("#collectionspage").on("pagebeforeshow", function(event) { PopulateCollectionsList(); } );
	$("#poemlistpage").on("pagebeforeshow", function(event) { PopulateAllFlowsList(); } );
});

