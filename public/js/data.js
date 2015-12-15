/*
  General data processsing
*/

var Db;
var DefaultCollection = {name: "PoemFlow Sampler", flows: [240, 269, 276, 280, 311, 327, 328, 349, 480],
    longdescription: "A small sample of the great poems in the PoemFlow collection", summary: "A small sample of the great poems in the PoemFlow collection",
    editor: "TextTelevision"};
var DefaultFlows = [{id: '240', title: 'Shall I Compare Thee', author: 'Shakespeare'},
					{id: '269', title: 'The Road Not Taken', author: 'Frost'}];
var Collections = new Array();
var AllFlowIds = new Array();

function UpdateCollectionsToLocalStorage() {
    // push Collections array on to local storage
    window.localStorage.setItem('collections', JSON.stringify(Collections))
}

function UpdateFlowsToLocalStorage() {
    // push Collections array on to local storage
    window.localStorage.setItem('flows', JSON.stringify(AllFlows))
}

function ProcessLocalStorage() {
    // Return the set of collections stored on this instance of the app
    if (window.localStorage.getItem('flowspeed')) {SetFlowSpeed();}
    if (window.localStorage.getItem('fontsize')) {SetFontSize();}

    if (window.localStorage.getItem('collections')) {
		Collections = JSON.parse(window.localStorage.getItem('collections'));
		console.log("collections array initialized with n entries where n=" + Collections.length);
	} else {
        // No collections purchased or stored, store the default collection
        console.log("need to set up local storage.");
        Collections.push(DefaultCollection);
        UpdateCollectionsToLocalStorage();
    }

    if (!window.localStorage.getItem('flows')) {
        // No flows purchased or stored, store the default set
		console.log("need to set up local flow storage");
		window.localStorage.setItem('flows', JSON.stringify(DefaultFlows));
	}
}

/*-----------------------------------------------------------------*/
/* Functions used to populate in-memory js arrays
/*-----------------------------------------------------------------*/

function PopulateAllFlows() {
    // copy flows from localStorage and update ui lists
    
    AllFlows = JSON.parse(window.localStorage.getItem("flows"));
    PopulateAllFlowsList();
    PopulateFavoritesList();
}

function PopulateAllCollections() {
    // copy collections from localStorage
	
	AllCollections = JSON.parse(window.localStorage.getItem('collections'));
	PopulateCollectionsList();
}


/* Flow reading function */
var CurrentXML;
function ReadFileXML(filename) {
	console.log("trying to get "+filename);
	$.ajax({
        type: "GET",
		url: "flows/" + filename,
		dataType: "xml",
		success: function(thexml) {
			CurrentXML = thexml;
			SetupFlow();
		}
    });
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


function ToggleFavorite() {
    // Toggle current flows fav status
	var flow = GetFlowById(CurrentFlow);
    if (flow.favorite) {
		flow.favorite = false;
        PoemFooterUnFav();
    }
    else {
		flow.favorite = true;
        PoemFooterFav();
    }
	UpdateFlowsToLocalStorage();
}


function SetFlowSpeed() {
    
    if (!window.localStorage.getItem('flowspeed')) return;
    var spd = window.localStorage.getItem('flowspeed');
    flowspeed = spd;
    $('#speed').val(spd);
    
    /* Need to wait until the prefs page is initialized ot refresh the slider */
    $( '#preferencespage' ).live( 'pageinit',function(event){
                                 $('#speed').val(spd);
                                 $('#speed').slider("refresh");
                           });
}

function SetFontSize() {
    
    if (!window.localStorage.getItem('fontsize')) return;
    var fontsize = window.localStorage.getItem('fontsize');
    fontpx = GetFontPx(fontsize);
    $('#textsize').val(fontsize);
    $('#staticpoem').css('font-size', fontpx);
}
