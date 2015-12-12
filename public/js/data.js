/* Sets up the database and file system:
   - Create schema if not created
   - Get purchased and bundled collections
   - For each collection:
      - populate db if not populated
      - for each flow:
         - if not in file system check bundle then download from web
         - write to filesystem
*/

var Db;
var DefaultCollection = {name: "PoemFlow Sampler", value: "240, 269, 276, 280, 311, 327, 328, 349, 480",
    longdescription: "A small sample of the great poems in the PoemFlow collection", summary: "A small sample of the great poems in the PoemFlow collection",
    editor: "TextTelevision"};
var BundledFiles = ["240.xml"];
var Collections = new Array();
var AllFlowIds = new Array();

function OpenDB() {
    Db = window.openDatabase("PoemFlowCollectionsDB", "1.0", "PoemFlowCollectionsDB", 200000);
    Collections = ProcessLocalStorage();

    Db.transaction(CreateDB, 
		   TransactionError, 
		   function () { Db.transaction(PopulateCollectionsToDB, TransactionError, PopulateFlowsToFilesystem)}
		  );
}   



function CreateDB(tx) {
    // $('#busy').show();
    var sql = 
	"CREATE TABLE IF NOT EXISTS FLOW ( "+
	"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
	"FLOWID varchar(12), " +
	"AUTHOR VARCHAR(50), " +
	"TITLE VARCHAR(50), " +
	"FAVORITE VARCHAR(2)) ";
    tx.executeSql(sql);
    var sql2 = 
	"CREATE TABLE IF NOT EXISTS COLLECTION ( "+
	"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
	"NAME VARCHAR(50))";
    tx.executeSql(sql2);
    var sql3 = 
	"CREATE TABLE IF NOT EXISTS FLOWCOLLECTION ( "+
	"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
	"COLLECTIONID INTEGER , " +
	"FLOWID INTEGER);"
    tx.executeSql(sql3);
    console.log("created db.");
}

function UpdateCollectionsToLocalStorage(collections) {
    // push Collections array on to local storage
    window.localStorage.setItem('collections', JSON.stringify(collections))
}

function ProcessLocalStorage() {
    // Return the set of collections stored on this instance of the app
    if (window.localStorage.getItem('flowspeed')) {SetFlowSpeed();}
    if (window.localStorage.getItem('fontsize')) {SetFontSize();}
    var collections = new Array();
    if (!window.localStorage.key('collections')) {
        // No collections purchased or stored, store the default collection
        console.log("need to set up local storage.");
        collections.push(DefaultCollection);
        UpdateCollectionsToLocalStorage(collections);
        return collections;
    }
    
    collections = JSON.parse(window.localStorage.getItem('collections'));
    for (var i = 0; i < collections.length; i++) {
        console.log("found:"+collections[i].name);
        /*
        var obj = {
	    name: collections[i].name,
	    value: window.localStorage.getItem(window.localStorage.key(i))
        }
        collections.push(obj);
         */
    }
    console.log("collections array initialized with n entries where n=" + collections.length);
    return collections;
}

function PopulateCollectionsToDB(tx) {
    // Loop through Collections and make sure they are reflected in the DB.
    // An assumption here is that if the Collection row is there then everything
    // else is set up also - the Flow rows, the collection-flow mapping table
    // and the flow xml files are in local storage
    
    for (var i = 0; i < Collections.length; i++) {
        var name = Collections[i].name;
        var idstring = Collections[i].value;
        tx.executeSql("select * from COLLECTION where NAME = '"+name+"'", [],
                      function(tx, result) {
                      if (result.rows.length == 0) {
                      PopulateCollectionToDB(tx, name, idstring);
                      }},
                      TransactionError);
    }
}

function PopulateCollectionToDB(tx, name, idstring) {
// If the Collection is not set up populate it and associated flows
    tx.executeSql("insert into COLLECTION (NAME) values ('" + name + "')", [],
		  function(tx, result) {
		      PopulateFlowCollectionToDB(tx, result.insertId, idstring);
		  }, 
		  TransactionError);
}

function PopulateFlowCollectionToDB(tx, collectionID, idstring) {
    // Populate the mapping table
    var flows = idstring.split(",");
    for (var i = 0; i < flows.length; i++) {
        var flowid = $.trim(flows[i]);
        tx.executeSql("insert into FLOWCOLLECTION (COLLECTIONID, FLOWID) values('" + collectionID + "','" + flowid + "')");
        AllFlowIds.push(flowid);
    }
}

var LocalFS;
function PopulateFlowsToFilesystem() {
    // Open the file system and read file entries
    console.log("Database update completed! Populating filesystem...");
    window.requestFileSystem(LocalFileSystem.PERSISTENT,
                             0,
                             function(fs) {
                                LocalFS = fs;
                                var filereader = fs.root.createReader();
                                filereader.readEntries(IterateFileEntries, TransactionError);
                             },
                             TransactionError);
}

var NumFilesToLoad = 0;
function IterateFileEntries(entries) {
    // Reconcile flows from all Collections with saved files in filesystem
    
    // Construct an array of names of all files in filesystem
    var filenames = new Array();
    for (var i = 0; i < entries.length; i++) {
        var fname = entries[i].name;
        filenames.push(fname);
        console.log("File exists:" + fname);
    }
    
    // Construct an array of all needed file names
    var neededflownames = new Array();
    for (var j = 0; j < AllFlowIds.length; j++) {
        var fname = AllFlowIds[j]+'.xml';
        neededflownames.push(fname);
        console.log("File needed:" + fname);
    }
    
    // Loop thru needed filenames and see if we have them
    var missingfilesinbundle = new Array();
    var missingfilesnotinbundle = new Array();
    for (var k = 0; k < neededflownames.length; k++) {
        var fname = neededflownames[k];
        if (filenames.indexOf(fname) < 0) {
            // Needed file name is not in filesystem.
            NumFilesToLoad++;       // count the number of files we need so we can know when we're done
            // check to see if its in the bundle or need to fetch from internet
            if (BundledFiles.indexOf(fname) < 0)
                missingfilesnotinbundle.push(fname);
            else
                missingfilesinbundle.push(fname);
        }
    }
    
    // Fetch files and move to filesystem
    missingfilesinbundle.forEach(function(fname) {
                                 console.log("File needed from bundle:" + fname);
                                 LocalFS.root.getFile(fname,
                                                      {create: true},
                                                      function(f) {
                                                      CreateFile(f, "res/flows/"+fname);
                                                      },
                                                      TransactionError);
                                 });
    missingfilesnotinbundle.forEach(function(fname) {
                                    console.log("File needed from poemflowcollections.com:" + fname);
                                    LocalFS.root.getFile(fname, 
                                                         {create: true}, 
                                                         function(f) {
                                                         CreateFile(f, "http://poemflowcollections.com/flows/"+fname);
                                                         },
                                                         TransactionError);
                                    });
	console.log("numfilestoload:"+NumFilesToLoad);
	if (NumFilesToLoad == 0) {
		app.receivedEvent('filespopulated');		// move on to next thing
	}
}

function CreateFile(fileentry, fileurl) {
    // read xml data from the url into the fileentry and populate FLOW table in DB
    console.log("Reading in:"+fileurl);
    $.ajax({
           type: "GET",
           url: fileurl,
           dataType: "xml",
           success: function(thexml) {
           var title = $(thexml).find('title').text();
           var author = $(thexml).find('author').first().text();
           var id = $(thexml).find('flow').attr('id');
           var sqlstring = "insert into FLOW (FLOWID, AUTHOR, TITLE, FAVORITE ) values(?,?,?,?)";
           console.log("Writing Flow to DB:" + sqlstring + " id=" + id);
           Db.transaction(function(tx) {
                          tx.executeSql(sqlstring, [id.toString(), author, title, "N"], function(tx) { console.log("successful insert!");}, TransactionError);
                          },
                          TransactionError2);
           
           console.log("Writing out:"+fileurl);
           fileentry.createWriter(function (filewriter) {
                                  var xmlstring = (new XMLSerializer()).serializeToString(thexml);
                                  filewriter.write(xmlstring);
								  NumFilesToLoad--;
								  console.log("numfilestoload:"+NumFilesToLoad);
								  if (NumFilesToLoad == 0) {
									app.receivedEvent('filespopulated');		// can move on to next thing
								  }

                                  });
           },
           error: function(a,b,c) {
		   console.log("ERROR!:");
		   console.log(a+b+c);
           }// should delete file here
           });
}



function TransactionError(tx, error) {
    console.log("DB Error: " + error);
}
function TransactionError2(tx, error) {
    console.log("DB2 Error: " + error);
}


/*-----------------------------------------------------------------*/
/* Functions used to populate in-memory js arrays
/*-----------------------------------------------------------------*/

function PopulateAllFlows() {
    // create transaction to populate all flow array
    Db.transaction(function (tx) {
                   tx.executeSql('select * from FLOW', [], PopulateAllFlowsArray, TransactionError);
                   },
                   TransactionError);
}

function PopulateAllCollections() {
    // create transaction to populate all collections array
    Db.transaction(function (tx) {
                   tx.executeSql("select * from COLLECTION", [], PopulateAllCollectionsArray, TransactionError);
                   },
                   TransactionError);
}

var Favorites;
function PopulateFavorites() {
    // create transaction to populate all collections array
    Db.transaction(function (tx) {
                   tx.executeSql("select * from FLOW where FAVORITE = 'Y'", [], PopulateFavoritesArray, TransactionError);
                   },
                   TransactionError);
}


function PopulateAllFlowsArray(tx, results) {
    // fill up the array with the DB qry result set
    
    var len = results.rows.length;
    console.log("FLOW table: " + len + " rows found.");
    
    for (var i=0; i<len; i++){
        console.log("Row = " + i + " ID = " + results.rows.item(i).id + " FLOWID = " + results.rows.item(i).FLOWID + " Author =  " + results.rows.item(i).AUTHOR + " Title = " + results.rows.item(i).TITLE + "Fav = " + results.rows.item(i).FAVORITE);
        AllFlows.push(results.rows.item(i));
    }
    
    console.log("did you see "+len+" rows?, Now populating flows list...");
    PopulateAllFlowsList();
}

function PopulateAllCollectionsArray(tx, results) {
    // fill up the array with the DB qry result set
    
    var len = results.rows.length;
    console.log("COLLECTIONS table: " + len + " rows found.");
    for (var i=0; i<len; i++){
        console.log("Row = " + i + " ID = " + results.rows.item(i).id + " NAME =  " + results.rows.item(i).NAME);
		var newcol = {id:results.rows.item(i).id, name:results.rows.item(i).NAME, flows:[]};
        AllCollections[newcol.id] = newcol;
    }
	PopulateCollectionsList();
	tx.executeSql("select * from FLOWCOLLECTION", [], PopulateFlowsInCollections, TransactionError);
}

function PopulateFavoritesArray(tx, results) {
    // fill up the array with the DB qry result set
    
    Favorites = new Array();
    var len = results.rows.length;
    console.log("FLOW table: " + len + " Fav rows found.");
    
    for (var i=0; i<len; i++){
        console.log("Row = " + i + " ID = " + results.rows.item(i).id + " FLOWID = " + results.rows.item(i).FLOWID + " Author =  " + results.rows.item(i).AUTHOR + " Title = " + results.rows.item(i).TITLE + "Fav = " + results.rows.item(i).FAVORITE);
        Favorites.push(results.rows.item(i));
    }
    
    console.log("did you see "+len+" rows?, Now populating favorites list...");
    PopulateFavoritesList();
}

function PopulateFlowsInCollections(tx, results) {
	// Remember the list of flows in each collection
	
    var len = results.rows.length;
    console.log("FLOWCOLLECTION table: " + len + " rows found.");
	for (var i=0; i<len; i++) {
		console.log("Row = " + i + ", COLLECTIONID="+results.rows.item(i).COLLECTIONID+", FLOWID="+results.rows.item(i).FLOWID);
		for (var j=0; j<AllCollections.length; j++) {
			if (AllCollections[j] && (AllCollections[j].id == results.rows.item(i).COLLECTIONID)) {
				AllCollections[j].flows.push(results.rows.item(i).FLOWID);
			}
		}
	}
}

/* Flow reading functions */

var CurrentXML;
function ReadFileXML(filename) {
// create fileentry from filename
	console.log("trying to get"+filename);
    LocalFS.root.getFile(
	filename, 
	null, 
    function(fileentry) {  // call .file to get the file from the fileentry, call read from its success cb
		fileentry.file(function(file){ReadXMLFromFileEntry(file);});
	},
	TransactionError2
    );
}

function ReadXMLFromFileEntry(file) {
// read xml from file
    var reader = new FileReader();
    reader.onloadend = function(evt) {
        var thexmlstring = evt.target.result;
        CurrentXML = $.parseXML(thexmlstring);
        SetupFlow();
    };
    reader.readAsText(file);
}


function ToggleFavorite() {
    // Toggle current flows fav status
    if (CurrentFlowIsAFav()) {
        Db.transaction(function (tx) {
                       var statement = "update FLOW set FAVORITE = 'N' where FLOWID = '" + CurrentFlow + "';";
                       tx.executeSql(statement, [], PopulateFavorites);
                       },
                       TransactionError);
        PoemFooterUnFav();
    }
    else {
        Db.transaction(function (tx) {
                       var statement = "update FLOW set FAVORITE = 'Y' where FLOWID = '" + CurrentFlow + "';";
                       tx.executeSql(statement, [], PopulateFavorites);
                       },
                       TransactionError);
        PoemFooterFav();
    }
}


function CurrentFlowIsAFav() {
    // Is the current flow a fav
    for (var i = 0; i < Favorites.length; i++) {
        if (parseInt(Favorites[i].FLOWID) == CurrentFlow) {
            return true;
        }
    }
    return false;
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



