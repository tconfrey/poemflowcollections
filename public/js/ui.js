/* Handles data lists etc */

var CurrentFlow = 0;
var titlechars = 30;

function TrimTitle(title, size) {
    // titles should be no more than size chars
    if (title.length > size)
        return title.substring(0,size) + "...";
    return title;
}

var ShowOnlyFavs = false;
function PopulateAllFlowsList () {
    // populate the list of poems
    var width = parseInt($(window).width());
    titlechars = (width > 480) ? 60 : 30;
    $("#allflows").empty();
    for (var i = 0; i < AllFlows.length; i++) {
        var flow = AllFlows[i];
        var fid = flow.id;
		var favspan = (flow.favorite) ? "<span class='ui-btn-icon-notext ui-icon-heart' style='position:absolute; right:30px;' />" : "";			
		var favclass = (flow.favorite) ? "class='fav'" : "class='notfav'";
        var child = "<li onclick='CurrentFlow="+fid+";LoadCurrentFlow();'"+favclass+"><div style='width:100%;'>"+TrimTitle(flow.title, titlechars)+favspan+"</div> <div id='poet'>"+flow.author+"</div>   </li>";
        $("#allflows").append(child).css( 'cursor', 'pointer' );
    }

    if (app.allflowinitialized) { // refresh ui on subsequent updates
        $("#allflows").listview("refresh");
    } else {
        app.allflowinitialized = true;
        $("#poemlistpage").bind("pageshow", function(event, data) {$("#poembackbutton").attr("href", "#poemlistpage"); });
    }
	FilterFavorites();
}

function FilterFavorites() {
	// filter in or out the favs in poem list
	if (ShowOnlyFavs) {
		$("#allflows .notfav").slideUp(600);
		$("#poemlistpage h2").text("Favorite Poems");
		$("#filterbutton").css("background-color", "#F69999");
	} else {
		$("#allflows .notfav").slideDown(600);
		$("#poemlistpage h2").text("All Poems");
		$("#filterbutton").css("background-color", "#F6F6F6");
	}
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
		SetFavButtonStatus(flow);
	}
    ReadFileXML(CurrentFlow+".xml");
}

function SetFavButtonStatus(flow) {
	if (flow.favorite) {
		$("#favpoem").css("background-color", "#F69999");
	} else {
		$("#favpoem").css("background-color", "#F6F6F6");
	}
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

