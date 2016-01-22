
var thetable;
var thecollection = null;
$(document).ready(function() {

    Parse.initialize("MwFX1aKFmDgqMMAyRg3Ihocx3MSqes1unTokLIk9", "TYG6LuxH1V4eEbz9S06tmkcTw8D9OiP2Cv9HQkCp");

/*
    thetable = $('#poems').dataTable({
	"bAutoWidth": false,
	"bJQueryUI": true,           
	"bLengthChange": false,
	"iDisplayLength": 10,
	"aaSorting": [[0,'asc']],
        "aaData" : tabledata,	           // defined in tabledata.json
	"aoColumns": [
	    { "bVisible" : false },
            { "bVisible" : false }, 
            { "bSortable": true  },
            { "bSortable": true  },
	    { "bVisible" : false },
	],
    }); 
*/
	PopulateTable();
});

function PostTableSetup() {
    // If an ID is passed in we should read that collection and populate the form
    var collectionID = GetURLParameter("ID");
    if (collectionID) {
		var Collection = Parse.Object.extend("Collection");
		var query = new Parse.Query(Collection);
		query.get(collectionID, {
			success: function(collection) {
				// The object was retrieved successfully.
				thecollection = collection;
				PopulateForm(thecollection);
			},
			error: function(object, error) {
				// The object was not retrieved successfully.
				// error is a Parse.Error with an error code and description.
			}
		});
    }

    // need .delegate to have the events trigger even after filtering
    $("body").delegate('#poems tbody tr', 'click', function() {
        $(this).toggleClass('row_selected');
	
		var tds = $(this).children("td");
		var flowid = thetable.fnGetData(this)[0];
		if ($(this).hasClass('row_selected')) {
			// add to selections
			var author = $(tds[1]).text();
			var title =  $(tds[0]).text();
			// Only add if its new
			var same = $("#selections li[flowid='" + flowid + "']");
			if (same.length == 0) {
				$("#selections").append("<li flowid='" + flowid + "' author='" + author + "' title='" + title + "'>" + author + ":" + title + "</li>");
			}
		} else {
			// remove from selections
            var listitems = $("#selections li");
			for (var i=0; i < listitems.length; i++) {
				var itemflowid = $(listitems[i]).attr('flowid');
				if (itemflowid == flowid) {
					$("#selections li").eq(i).remove();
				}
			}
		}
		$('#selections li').removeClass('alternate');
		$('#selections li:nth-child(odd)').addClass('alternate');
        var listitems = $("#selections li");
		$('#numpoems').text(listitems.length);
		if (listitems.length > 0) {
			$("#createcollection").removeAttr('disabled');
		} else {
			$("#createcollection").attr('disabled', "disabled");
		}
    } );

    // form validation for email field
    $("#emailtext").keyup(function(e) {
	if ($('#emailtext').val() && validateEmail($('#emailtext').val())) {
	    $('#emailbutton').removeAttr('disabled');
	} else {
            $('#emailbutton').attr('disabled', true);
	}
    });
    
}

function ResetDefaults() {
    // revert creation form back to its default state
    $("#nametext").val("New Collection");
    $("#taglinetext").val("");
    $("#editortext").val("TextTelevision");
    $("#descriptiontext").val("");
    $("#costselector").text("0");
    $("#isfree").removeAttr("checked");
    $("#selections").empty();
}

function CreateCollection() {
    // create the collection if its new (ie we havent read it in from Parse)
    if (!thecollection) {
	var Collection = Parse.Object.extend("Collection");
	thecollection = new Collection;
    }
    thecollection = PopulateCollection(thecollection);

    thecollection.save(null, {
	success: function(object) {
	    thecollection = object;
	    $(".pfcid").text(object.id);
	    $("#overlay").show();
	},
	error: function(object, error) {
	    alert("Error saving: " + error.description);
	}
    });
}

function PopulateCollection(collection) {
    // populate collection from widgets
    collection.set("name", $("#nametext").val());
    collection.set("price", $("#numpoems").text()); // use .text cos its not an input and so val returns null
    collection.set("editor", $("#editortext").val());
    collection.set("summary", $("#taglinetext").val());
    collection.set("longdescription", $("#descriptiontext").val());
    var flows = [];
    var flowids = "";
    var listitems = $("#selections li");
    for (var i=0; i < listitems.length; i++) {
        var itemid = $(listitems[i]).attr('flowid');
        var itemauthor = $(listitems[i]).attr('author');
        var itemtitle = $(listitems[i]).attr('title');
	flowids += (itemid + ",");
	var flow = new Object;
	flow.id = itemid;
	flow.title = itemtitle;
	flow.author = itemauthor;
	flows.push(flow);
    };
    flowids = flowids.replace(/,$/,'');      // replace final comma
    collection.set("value", flowids);
    collection.set("flows", flows);
    return collection;
}

function PopulateForm(collection) {
    // populate form from collection object
    $("#nametext").val(collection.get("name"));
    $("#taglinetext").val(collection.get("summary"));
    $("#editortext").val(collection.get("editor"));
    $("#descriptiontext").val(collection.get("longdescription"));
    $("#numpoems").text(collection.get("price"));

    $("#selections").empty();
    var flows = collection.get("flows");
    for (var i = 0; i < flows.length; i++) {
	var flow = flows[i];
	$("#selections").append("<li flowid='" + flow.id + "' author='" + flow.author + "' title='" + flow.title + "'>" + flow.author + ":" + flow.title + "</li>");
    }
    $('#selections li').removeClass('alternate');
    $('#selections li:nth-child(odd)').addClass('alternate');

    if (flows.length > 0) {
	$("#createcollection").removeAttr('disabled');
    } else {
	$("#createcollection").attr('disabled', "disabled");
    }
}

function GetURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,""])[1]
    );
}

// Validate email address fn stolen from http://stackoverflow.com/questions/11690947/
var validateEmail = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

function EmailDetails() {
    // use Parse/Mandrill could code to send out email with collection id
    var id = thecollection.id;
    var email = $("#emailtext").val();
    var person = $("editortext").val();

    Parse.Cloud.run('EmailCollectionDetails', 
		    { collectionID: id, toEmail: email, toPerson: person }, 
		    {
			success: function() {
			    alert("Email sent.");
			    $('#overlay').hide(); // done with overlay
			},
			error: function(error) {
			    alert("Sorry there was an error sending the email.");
			}
		    });
}


var DATA = [];
var TABLEDATA = [];
function PopulateTable() {
	// use queries with skip to get all 1000+ flow names/authers
	var Flow = Parse.Object.extend("Flow");
	var query = new Parse.Query(Flow);
	query.select("author", "title", "arrangedby");
	query.limit(1000);
	query.find({
		success: function(results) {
			DATA = results;
			query.skip(1000);
			query.find({
				success: function(results) {
					DATA = DATA.concat(results);
					PopulateTableData();
					console.log("loaded " + DATA.length + " objects");
				}});
			}});
}

function PopulateTableData() {
	// iterate over DATA to populate datatable store

	var title, author, arrangedby, id;
	for (var i = 0; i < DATA.length; i++) {
		title = DATA[i].get("title");
		author = DATA[i].get("author");
		arrangedby = DATA[i].get("arrangedby");
		id = DATA[i].id;
		TABLEDATA.push([id,title,author,arrangedby]);
	}

    thetable = $('#poems').dataTable({
	"bAutoWidth": false,
	"bJQueryUI": true,           
	"bLengthChange": false,
	"iDisplayLength": 10,
	"aaSorting": [[1,'asc']],
        "aaData" : TABLEDATA,
	"aoColumns": [
            { "bVisible" : false },
            { "bSortable": true  },
            { "bSortable": true  },
            { "bSortable": true  }
	],
    }); 

	PostTableSetup();
}
