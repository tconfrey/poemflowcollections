/*
  General data processsing
*/

var DefaultCollection = {
      "name": "Classics",
      "value": "1770,1756,1340,1351,1415,1649,939,1743,506,586,638,1946",
      "summary": "A selection of classic poems from the PoemFlow collection",
      "longdescription": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "editor": "TextTelevision",
      "flows": [
        {
          "id": "1770",
          "title": "Autumn Poem 2012",
          "author": "Hoa Nguyen"
        },
        {
          "id": "1756",
          "title": "Love Poem",
          "author": "Graham Foust"
        },
        {
          "id": "1340",
          "title": "Half-Hearted Sonnet",
          "author": "Kim Addonizio"
        },
        {
          "id": "1351",
          "title": "Directions for Lines that will Remain Unfinished",
          "author": "Sarah Messer"
        },
        {
          "id": "1415",
          "title": "Economy",
          "author": "Sandra Beasley"
        },
        {
          "id": "1649",
          "title": "Quiet the Dog, Tether the Pony",
          "author": "Marilyn Chin"
        },
        {
          "id": "939",
          "title": "On The Origins Of Things",
          "author": "Troy Jollimore"
        },
        {
          "id": "1743",
          "title": "Praise Song for the Day",
          "author": "Elizabeth Alexander"
        },
        {
          "id": "506",
          "title": "I Have News for You",
          "author": "Tony Hoagland"
        },
        {
          "id": "586",
          "title": "Tell Me",
          "author": "Sara London"
        },
        {
          "id": "638",
          "title": "Chaos is the New Calm",
          "author": "Wyn Cooper"
        },
        {
          "id": "1946",
          "title": "Poem (As the cat)",
          "author": "William Carlos Williams"
        }
      ],
      "price": "Free",
      "showinstore": true
    };
var DefaultFlows = [{id: '240', title: 'Shall I Compare Thee', author: 'Shakespeare'},
					{id: '269', title: 'The Road Not Taken', author: 'Frost'}];
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
	SetFavStatus(flow);
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
