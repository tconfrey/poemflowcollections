
/* Handles Store interactions */


var StoreCollections = [{name: "Classics", value: "292, 1781, 280, 390, 476, 356, 1175, 549, 337, 320, 321, 627, 728, 480",
                  description: "A selection of classic poems from the PoemFlow collection", price: 0.99},
                        {name: "Contemporary", value: "1770, 1756, 1340, 1351, 1415, 1649, 939, 1743, 506, 586, 638",
                  description: "A selection of contemporary poems from the PoemFlow collection", price: 2.99},
                        {name: "Poetry Month", value: "1465, 1464, 1460, 1450, 1448, 1442, 1443, 1441, 1439, 1438, 1437",
                  description: "From the 2012 poetry month collection", price: 0.99},
                        {name: "Valentines", value: "1756, 1662, 1490, 1328, 839, 409, 306, 276, 337, 327",
                  description: "A selection of poems of Love", price: 5.99},
                        {name: "CCHS Mr Spences English Class", value: "269, 276, 336, 283, 349, 1354, 580, 537, 248, 466, 335, 278, 243",
                  description: "Oh, Mr Spence!", price: 1.0}];
var PreviewedCollection;

function GetStoreCollections(cbfunction) {
    // return an array of collections in the store
    
    //$.getJSON('https://googledrive.com/host/0B9azlFhg9-PrMGV4aDd1OHBaZG8/store.json', function(data) {
	var url = 'http://' + window.location.hostname + ':' + window.location.port + '/store.json';
    $.getJSON(url, function(data) {
              var items = data.StoreCollections;
              StoreCollections = items;
			  //SetUpLinks(data.iPadAd, data.iPhoneAd, data.AdDestinaton);
              cbfunction(items);
              });
}

function CheckNetworkAvailable() {
	return true; 				// bypass for now
    var networkState = navigator.network.connection.type;
    
    // Options: UNKNOWN, ETHERNET, WIFI, CELL_2G CELL_3G CELL_4G NONE
    if ((networkState == Connection.NONE) || (networkState == Connection.UNKNOWN))
        return false;
    return true;
}

function SetUpLinks(ipadad, iphonead, dest) {
	// update the in-store ad image and its link
	var ad = RunningOnIPad ? ipadad : iphonead;
	$("#adimage").attr("src", ad);
	$("#adlink").attr("href", dest);
}

function CollectionId(name) {
    // Do we already have this collection, if so return its Id
    
    for (var i = 0; i < Collections.length; i++) {
        if (Collections[i].name == name) return i;
    }
    return false;
}


function PopulateStore() {
    if (!CheckNetworkAvailable()) {
		//$("#networkErrorDialog").popup("open");
		$("#storelink").removeClass("ui-btn-active");
        alert("Can't access Store offline.");
        return;
    }
    $("#purchasingnotification").popup({positionTo: "#purchasebutton", shadow: true});
    $.mobile.loading('show');
    $("#storelink").removeClass("ui-btn-active");
    $("#store").empty();
    GetStoreCollections(_PopulateStore);
}

var _PopulateStore = function (collections) {
    for (var i = 0; i < collections.length; i++) {
		var prefix = (collections[i].price == "Free") ? "" : "$";
		var suffix = (collections[i].price == "Free") ? "!" : "";
        var price = CollectionId(collections[i].name) ? "<i>Purchased</i>" : prefix + collections[i].price + suffix;
        var child = "<li onclick='PreviewCollection(\"" + collections[i].name + "\")'><div>"+collections[i].name+"</div><!--<div id='price'>"+price+"</div>--><div id='description'>"+ collections[i].summary + "</div></li>";
        if (collections[i].showinstore) {
			$("#store").append(child).css( 'cursor', 'pointer' );
		}
    }
    $("#store").listview("refresh");
    $.mobile.loading('hide');
    $.mobile.changePage($("#storepage"));
}


function PreviewCollection(name) {
    // populate the preview pages for the selected collection and allow its purchase
    
    if (!CheckNetworkAvailable()) {
        alert("Can't access Store offline.");
        return;
    }
    if (CollectionId(name)) {
        CurrentCollection = CollectionId(name);         // collection id
        ShowCurrentCollection();                        // we own it, so show it!
        var cp = $("#collectionpage");
        $.mobile.changePage(cp);
        return;
    }
    
    var collection = null;
    for (var i = 0; i < StoreCollections.length; i++) {
        if (StoreCollections[i].name == name) 
			collection = StoreCollections[i];
    }
    if (!collection) return;

    var pp = $("#previewpage");
    ShowPreviewCollection(collection);
    PreviewedCollection = collection;
    $.mobile.changePage(pp);

}

function PurchaseCollection() {
    // Respond to a purchase request
    var confirmation = "Download this collection?";
	$("#purchaseconfirmation").text(confirmation);
	$( "#popupDialog" ).popup("open");
}

function ActuallyPurchase() {
	// Purchase button in popup was selected
	$( "#popupDialog" ).popup("close");
	$.mobile.loading('show');
    setTimeout(function(){InteractWithAppStore(PreviewedCollection);}, 1000); // pretend for now
}




function ShowPreviewCollection(collection){
    // populate info in to the collection preview window
    $("#previewname").text(collection.name);
    $("#previewdescription").text(collection.longdescription);
    $("#previeweditor").text("Editor: " + collection.editor);
    $("#previewflows").empty();
    for (var i=0; i<collection.flows.length; i++) {
        var flow = collection.flows[i];
        var child = "<li onclick='CurrentFlow="+flow.id+";LoadCurrentFlow();'><div>"+TrimTitle(flow.title, titlechars)+"</div><div id='poet'>"+flow.author+"</div></li>";
        $("#previewflows").append(child).css( 'cursor', 'pointer' );
    }

    if (app.previewinitialized) {  // refresh ui on subsequent updates
        $("#previewflows").listview("refresh");
    }  else {
        app.previewinitialized = true;
    }

	// Todo - this will bind multiple events to the button, need to remove other events first
    $("#previewpage").bind("pageshow", function(event, data) {$("#poembackbutton").attr("href", "#previewpage"); });
}


function arrayUnique(array) {
	// Utility needed below
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
}

function InteractWithAppStore(collection) {
    /* Do app Store stuff here, and then... */
    
    Collections.push(collection);
    UpdateCollectionsToLocalStorage();

	// Could be duplicate flows
	var newallflows = arrayUnique(AllFlows.concat(collection.flows));
	AllFlows = newallflows;
	UpdateFlowsToLocalStorage();
    
	alert("Updating your library with your new Collection");
    $.mobile.loading('hide');
//    PopulateCollectionsList();
//    PopulateAllFlowsList();
    PopulateStore();
}
