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
        var fid = flow.FLOWID;
        var child = "<li onclick='CurrentFlow="+fid+";LoadCurrentFlow();'><div>"+TrimTitle(flow.title, titlechars)+"</div><div id='poet'>"+flow.author+"</div></li>";
        $("#allflows").append(child);
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
    for (var i = 0; i < AllCollections.length; i++) {
        var collection = AllCollections[i];
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
    for (var i = 0; i < Favorites.length; i++) {
        var flow = Favorites[i];
        var fid = flow.FLOWID;
        var child = "<li onclick='CurrentFlow="+fid+";LoadCurrentFlow();'><div>"+TrimTitle(flow.title, titlechars)+"</div><div id='poet'>"+flow.author+"</div></li>";
        $("#favoriteflows").append(child);
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
    var collection = AllCollections[parseInt(CurrentCollection)];
    var collectionobj = GetCollectionByName(collection.name);       // This is really hooky the arrays should be refactored.
    $("#collectionname").text(collection.name);
    $("#aboutcollectioncontent").text(collectionobj.longdescription);
    $("#abouteditor").text("Editor: " + collectionobj.editor);
    $("#collectionflows").empty();
    for (var i=0; i<collection.flows.length; i++) {
        var fid = collection.flows[i];
        var flow = GetFlowById(fid);
        var child = "<li onclick='CurrentFlow="+fid+";LoadCurrentFlow();'><div>"+TrimTitle(flow.title, titlechars)+"</div><div id='poet'>"+flow.author+"</div></li>";
        $("#collectionflows").append(child);
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
        if (AllFlows[i] && (parseInt(AllFlows[i].FLOWID) == id)) {
            return AllFlows[i];
        }
    }
    return AllFlows[0];     // return something
}

function GetCollectionByName(name) {
    // loop thru Collections array and return named collection. Used to translate between AllCollections which is populated from DB and Collections which is the json
    for (var i = 0; i < Collections.length; i++) {
        if (Collections[i] && (Collections[i].name == name)) {
            return Collections[i];
        }
    }
    return Collections[0];
}

function LoadCurrentFlow() {
    // Fun with Flows...
    var flow = GetFlowById(CurrentFlow);
    console.log("Current Flow = "+flow.title);
    $("#poemname").text(TrimTitle(flow.title, 25));
    ReadFileXML(flow.id+".xml");
    if (CurrentFlowIsAFav()) {
        PoemFooterFav();
    }
    else {
        PoemFooterUnFav();
    }
        /*
    $.ajax({
        type: "GET",
        url: "res/flows/240.xml",
        dataType: "xml",
        success: function(thexml) {
            var title = $(thexml).find('title').text();
            var author = $(thexml).find('author').first().text();
            var id = $(thexml).find('flow').attr('id');
            console.log("Writing Flow to DB:" + title + ", " + author + ", #", + id);
            flowxml = thexml;
            setup(flowxml);
        }
    });
     */
}

function PoemFooterFav() {
    $("#poemfooter").data('icon', 'check');
    $("#poemfooter .ui-icon").addClass("ui-icon-check").removeClass("ui-icon-star");
    // the button active class changes the color, without below the footer change on first click then never thereafter
    $("#poemfooter").addClass("ui-btn-active");
}
function PoemFooterUnFav() {
    $("#poemfooter").data('icon', 'star');
    $("#poemfooter .ui-icon").addClass("ui-icon-star").removeClass("ui-icon-check");
    // the button active class changes the color, without below the footer change on first click then never thereafter
    $("#poemfooter").removeClass("ui-btn-active");
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

