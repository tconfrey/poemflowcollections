/*
  General data processsing
*/

function isLocalStorageAvailable() {
    try {
        const test = 'test';
        window.localStorage.setItem(test, test);
        window.localStorage.removeItem(test);
        return false; // should be: true;
    } catch(e) {
        return false;
    }
}
let localStorageMock = (function() {
    let store = {};

    return {
        getItem: function(key) {
            return store[key] || null;
        },
        setItem: function(key, value) {
            store[key] = value.toString();
        },
        removeItem: function(key) {
            delete store[key];
        },
        clear: function() {
            store = {};
        }
    };
})();

// Check if localStorage is available
if (!isLocalStorageAvailable()) {
    // If not, use the mock
    window.localStorage = localStorageMock;
}

var DefaultCollection = 
    {
		"name": "PoemFlow Classics",
		"price": "11",
		"giftprice": 9,
		"showinstore": true,
		"editor": "Tony",
		"summary": "Tonys favs",
		"longdescription": "A representative set of the poems of the day from the PoemFlow app courtesy of TextTelevision.",
		"flows": [
			{
				"id": "800",
				"title": "The Gettysburg Address",
				"author": "Abraham Lincoln"
			},
			{
				"id": "280",
				"title": "The Second Coming",
				"author": "William Butler Yeats"
			},
			{
				"id": "390",
				"title": "The Lake Isle of Innisfree",
				"author": "William Butler Yeats"
			},
			{
				"id": "1354",
				"title": "Jabberwocky",
				"author": "Lewis Carroll"
			},
			{
				"id": "1636",
				"title": "St. Crispin",
				"author": "William Shakespeare"
			},
			{
				"id": "1743",
				"title": "Praise Song for the Day",
				"author": "Elizabeth Alexander"
			},
			{
				"id": "564",
				"title": "All the world",
				"author": "William Shakespeare"
			},
			{
				"id": "276",
				"title": "How Do I Love Thee?",
				"author": "Elizabeth Barret Browning"
			},
			{
				"id": "270",
				"title": "Mending Wall",
				"author": "Robert Frost"
			},
			{
				"id": "269",
				"title": "The Road Not Taken",
				"author": "Robert Frost",
				"favorite" : "true"
			},
			{
				"id": "2306",
				"title": "Poem Flow is closing",
				"author": "TextTelevision"
			}
		],
		"value": "2306,800,280,390,1354,1636,1743,564,856,270,269"
    };
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
	return new Promise((resolve, reject) => {
		console.log("trying to get "+filename);
		$.mobile.loading('show');
		$.ajax({
			type: "GET",
			url: "/flows/" + filename,
			dataType: "xml",
			success: function(thexml) {
				CurrentXML = thexml;
				AddFlowLocally();
				SetupFlow();
				$.mobile.loading('hide');
				resolve(CurrentXML);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$.mobile.loading('hide');
				reject(errorThrown);
			}
		});
	});
}


function FlowArrayUnique(array) {
	// Utility needed below
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i].id === a[j].id)
                a.splice(j--, 1);
        }
    }
    return a;
}

function AddFlowLocally() {
	// Add flow to allflows if not there
	var newflow = new Object;
	newflow.title = $(CurrentXML).find("title").text();
	newflow.author = $(CurrentXML).find("author").text();
	newflow.id = $(CurrentXML).find("flow").attr("id");
	AllFlows.push(newflow);
	AllFlows = FlowArrayUnique(AllFlows);  // need to figure out object equivalance
	UpdateFlowsToLocalStorage();
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
    fontpx = ScreenFonts[fontsize];
    $('#textsize').val(fontsize);
    $('#staticpoem').css('font-size', fontpx);
}
