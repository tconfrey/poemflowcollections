/*
  General data processsing
*/


var Collections = new Array();
var AllFlows = new Array();


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
	} else {
        // No collections purchased or stored, store the default collection
        console.log("need to set up local storage.");
        Collections.push(DefaultCollection);
        UpdateCollectionsToLocalStorage();
    }

    if (window.localStorage.getItem('flows')) {	
		AllFlows = JSON.parse(window.localStorage.getItem('flows'));	
	} else {
        // No flows purchased or stored, store the default set
		console.log("need to set up local flow storage");
		AllFlows = DefaultCollection.flows;
		UpdateFlowsToLocalStorage();
	}
}

/*-----------------------------------------------------------------*/
/* Functions used to populate in-memory js arrays
/*-----------------------------------------------------------------*/

/* Flow reading function */
var CurrentXML;
function ReadFileXML(filename) {
	console.log("trying to get "+filename);
    $.mobile.loading('show');
	$.ajax({
        type: "GET",
		url: "/flows/" + filename,
		dataType: "xml",
		success: function(thexml) {
			CurrentXML = thexml;
			SetupFlow();
			$.mobile.loading('hide');
		}
    });
}


function ToggleFavorite() {
    // Toggle current flows fav status
	var flow = GetFlowById(CurrentFlow);
	flow.favorite = !flow.favorite;
	SetFavButtonStatus(flow);
	UpdateFlowsToLocalStorage();
}


function SetFlowSpeed() {
    
    if (!window.localStorage.getItem('flowspeed')) return;
    var spd = window.localStorage.getItem('flowspeed');
    flowspeed = spd;
    $('#speed').val(spd);
    
    /* Need to wait until the prefs page is initialized ot refresh the slider */
    $( '#preferencespage' ).on( 'pageinit', null, function(event){
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
