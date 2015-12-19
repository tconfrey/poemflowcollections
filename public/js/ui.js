/* Handles data lists etc */

var CurrentFlow = 0;
var titlechars = 30;
function PopulateAllFlowsList () {
    // populate the list of poems
    var width = parseInt($(window).width());
    titlechars = (width > 480) ? 60 : 30;
    $("#allflows").empty();
    for (var i = 0; i < AllFlows.length; i++) {
        var flow = AllFlows[i];
        var fid = flow.id;
        var child = "<li onclick='CurrentFlow="+fid+";LoadCurrentFlow();'><div>"+TrimTitle(flow.title, titlechars)+"</div><div id='poet'>"+flow.author+"</div></li>";
        $("#allflows").append(child).css( 'cursor', 'pointer' );
    }
    console.log("created flow list items, now refreshing view:");
    if (app.allflowinitialized) { // refresh ui on subsequent updates
        $("#allflows").listview("refresh");
    } else {
        app.allflowinitialized = true;
        $("#poemlistpage").bind("pageshow", function(event, data) {$("#poembackbutton").attr("href", "#poemlistpage"); });
    }
    console.log("view refreshed");
}

function TrimTitle(title, size) {
    // titles should be no more than size chars
    if (title.length > size)
        return title.substring(0,size) + "...";
    return title;
}

function PopulateCollectionsList() {
    // populate the collections page in the ui
    
    $("#allcollections").empty();
    for (var i = 0; i < Collections.length; i++) {
        var collection = Collections[i];
        if (collection) {
			var child = "<li onclick='CurrentCollection=\""+i+"\";ShowCurrentCollection();'><a href='#collectionpage' data-transition='slide'><div>"+TrimTitle(collection.name, titlechars)+"</div></a></li>";
			$("#allcollections").append(child);
        }
    }
    if (app.collectionlistinitialized && $("#allcollections").hasClass("ui-listview")) {     // refresh ui on subsequent updates
        $("#allcollections").listview("refresh");
    } else {
        app.collectionlistinitialized = true;
        $("#collectionpage").bind("pageshow", function(event, data) {$("#poembackbutton").attr("href", "#collectionpage");});
    }
}


function PopulateFavoritesList () {
    // populate the list of poems
    
    $("#favoriteflows").empty();
    for (var i = 0; i < AllFlows.length; i++) {
        var flow = AllFlows[i];
		if (flow.favorite) {
			var fid = flow.id;
			var child = "<li onclick='CurrentFlow="+fid+";LoadCurrentFlow();'><div>"+TrimTitle(flow.title, titlechars)+"</div><div id='poet'>"+flow.author+"</div></li>";
			$("#favoriteflows").append(child).css( 'cursor', 'pointer' );
		}
    }
    if (app.favoritesinitialized && $("#favoriteflows").hasClass("ui-listview")) {  // refresh ui on subsequent updates
		$("#favoriteflows").listview("refresh");
    }  else {
        app.favoritesinitialized = true;
        $("#favoritespage").bind("pageshow", function(event, data) {$("#poembackbutton").attr("href", "#favoritespage"); });
    }
}


function ShowCurrentCollection(){
    // populate the correct flows into the collection window
    var collection = Collections[parseInt(CurrentCollection)];
    $("#collectionname").text(collection.name);
    $("#aboutcollectioncontent").text(collection.longdescription);
    $("#abouteditor").text("Editor: " + collection.editor);
    $("#collectionflows").empty();
    for (var i=0; i<collection.flows.length; i++) {
        var flow = collection.flows[i];
        var child = "<li onclick='CurrentFlow="+flow.id+";LoadCurrentFlow();'><div>"+TrimTitle(flow.title, titlechars)+"</div><div id='poet'>"+flow.author+"</div></li>";
        $("#collectionflows").append(child).css( 'cursor', 'pointer' );
    }
    if (app.collectioninitialized) {  // refresh ui on subsequent updates
        $("#collectionflows").listview("refresh");
    }  else {
        app.collectioninitialized = true;
    }
}

function GetFlowById(id) {
    // iterate thru flows and return by matched id
    for (var i = 0; i<AllFlows.length; i++){
        if (AllFlows[i] && (parseInt(AllFlows[i].id) == id)) {
            return AllFlows[i];
        }
    }
    return false;     // return something
}

function LoadCurrentFlow() {
    // Fun with Flows...
    var flow = GetFlowById(CurrentFlow);
	if (flow) {					// might not be loaded
		$("#poemname").text(TrimTitle(flow.title, 25));
		if (flow.favorite) {
			PoemFooterFav();
		}
		else {
			PoemFooterUnFav();
		}
	}
    ReadFileXML(CurrentFlow+".xml");
}

function PoemFooterFav() {
	$('#poemfooter').buttonMarkup({ icon: "heart" });
/*
    // the button active class changes the color, without below the footer change on first click then never thereafter
    $("#poemfooter").addClass("ui-btn-active");
*/
}
function PoemFooterUnFav() {
	$('#poemfooter').buttonMarkup({ icon: "star" });
}

var SmallScreenFont = {'smallest' : '12px', 'small' : '14px', 'medium' : '18px', 'large' : '21px', 'largest' : '24px'};
var LargeScreenFont = {'smallest' : '14px', 'small' : '18px', 'medium' : '21px', 'large' : '24px', 'largest' : '32px'};
var RunningOnIPad = false;

function SetupScreen() {
    // Running on iPad?
    if (($(window).width() + $(window).height()) == 1792) {
        RunningOnIPad = true;
//        $("#adimage").attr("src", "https://googledrive.com/host/0B9azlFhg9-PrMGV4aDd1OHBaZG8/ipad-ad.gif");
    }
    $.mobile.loading('hide');
}

function GetFontPx(fontsize) {
    // bigger for ipad
    if (RunningOnIPad) {
        if (LargeScreenFont[fontsize]) return LargeScreenFont[fontsize];
    } else {
        if (SmallScreenFont[fontsize]) return SmallScreenFont[fontsize];
    }
    // default in case of error:
    return '18px';
}

function ChangeTextSize() {
    // Called from prefs
    var newfontsize = $('#textsize').val();
    
    fontpx = GetFontPx(newfontsize);
    $('#staticpoem').css('font-size', fontpx);
    window.localStorage.setItem('fontsize', newfontsize);
}

function ChangeSpeed() {
    // Called from prefs
    var speedvalue = $('#speed').val();
    flowspeed = speedvalue;
    window.localStorage.setItem('flowspeed', flowspeed);
}

