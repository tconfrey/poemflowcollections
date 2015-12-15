// Do initial set up

var AllCollections = new Array();
var AllFlows = new Array();
var app = new Object();

$(document).ready(function(){
    console.log("Device Ready. Opening DB...");
    $.mobile.loading('show');
	ProcessLocalStorage();
    AllCollections = [];
    AllFlows = [];
	PopulateAllFlows();
	PopulateAllCollections();
	SetupCallbacks();	// register for rotation events etc
    SetupScreen();

	// set up listeners for ui events
	$("#favoritespage").on("pagebeforeshow", function(event) { PopulateFavoritesList(); } );
	$("#collectionspage").on("pagebeforeshow", function(event) { PopulateCollectionsList(); } );
	$("#poemlistpage").on("pagebeforeshow", function(event) { PopulateAllFlowsList(); } );
});

