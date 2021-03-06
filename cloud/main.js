// > parse deploy 
// from
// /Users/tconfrey/Google Drive/poemflow-collections/MyCloudCode
// to upload new code to cloud.

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
    response.success("Hello worlds!");
});

// Setting up Mandrill email service
var Mandrill = require('mandrill');
Mandrill.initialize('KyblfsskhPl72Sph7WOlxQ');     // API key for my account

Parse.Cloud.define("EmailCollectionDetails", function(request, response) {
    var collectionID = request.params.collectionID;
    var toEmail = request.params.toEmail;
    var toPerson = request.params.toPerson;

    var mailText = "Thanks for creating a PoemFlow Collection. Open this link to access your Collection on your iOS device: \n poemflowcollections://Collection/" + collectionID + "\n";
    mailText += "\nTo update and re-save your collection use this url: http://poemflowcollections.com/CollectionMaker.html?ID=" + collectionID + "\n";
    mailText += "\nIf you do not already have the PoemFlowCollections app installed you can download it for free from the Apple App Store: http://itunes.apple.com/us/app/id339835648?mt=8 \n";
    mailText += "\n Enjoy your PoemFlows! \n\n - The PoemFlow team \n";
    Mandrill.sendEmail({
	message: {
	    text: mailText,
	    subject: "Your PoemFlow Collection",
	    from_email: "CollectionMaker@poemflowcollections.com",
	    from_name: "Collection Maker",
	    to: [
		{
		    email: toEmail,
		    name: toPerson
		}
	    ]
	},
	async: true
    },{
	success: function(httpResponse) {
	    console.log(httpResponse);
	    response.success("Email sent!");
	},
	error: function(httpResponse) {
	    console.error(httpResponse);
	    response.error("Uh oh, something went wrong");
	}
    });
});

function FindGiftCost(cost) {
    // take the cost of a collection and return what it costs if gifted w gifting discount
    if (!cost || (cost == "Free")) return "Free";
    var intcost = parseInt(cost);
    if (intcost < 6) return Math.max(1, (intcost - 1));
    return (intcost - 2);
}

Parse.Cloud.beforeSave("Collection", function(request, response) {
    // Add the gift price on to a collection before saving. We want this logic safely on the server.
    
    var price = request.object.get("price");
    var giftprice = FindGiftCost(price);
    request.object.set("giftprice", giftprice)
    response.success();
});

Parse.Cloud.afterSave("Gift", function(request) {
    // After a successful Gift save, send an email to the recipient.

    // only send the email on the initial Gift creation, not subsequent state updates etc
    if (request.object.existed()) return;

    var newGift = request.object;
    var toEmail = newGift.get("email");
    var giftID = newGift.id;
    var from = newGift.get("from");
    var note = newGift.get("note");
    var name = newGift.get("recipientname") || "";
    var mailText = name ? "Hi " + name + ",": "Hi,";
    mailText += "\nYou have been sent the gift of a collection of PoemFlows";
    mailText += from ? " from " + from : "";
    if (note) {
	mailText += from ? " who says:\n" : "\n"
	mailText += note + ".\n";
    }
    mailText += "\nOpen this link to access your Collection on your iOS device: \n poemflowcollections://Gift/" + giftID + "\n";
    mailText += "\nIf you do not already have the PoemFlowCollections app installed you can download it for free from the Apple App Store: http://itunes.apple.com/us/app/id339835648?mt=8 \n";
    mailText += "\n Enjoy your PoemFlows! \n\n - The PoemFlow team \n";

    Mandrill.sendEmail({
	message: {
	    text: mailText,
	    subject: "A Gift of Poetry",
	    from_email: "TextTelevision@poemflowcollections.com",
	    to: [
		{
		    email: toEmail,
		    name: name
		}
	    ]
	},
	async: true
    },{
	success: function(httpResponse) {
	    console.log(httpResponse);
	    newGift.set("state", "Mailed");
	    newGift.save();
	},
	error: function(httpResponse) {
	    console.error(httpResponse);
	}
    });

});

Parse.Cloud.beforeSave("Gift", function(request, response) {
    // If we are saving the the gift has been redeemed then send requested email to sender
    
    var state = request.object.get("state");
    var from = request.object.get("from");
    if (from && (state == "Redeemed")) {
	var name = request.object.get("recipientname") || request.object.get("email");
	var mailText = "Hi, \nYour gift of poetry has been redeemed by " + name + ".";
	mailText += "\n\n Thanks for using Poemflows!";

	Mandrill.sendEmail({
	    message: {
		text: mailText,
		subject: "Your Gift of Poetry",
		from_email: "TextTelevision@poemflowcollections.com",
		to: [
		    {
			email: from
		    }
		]
	    },
	    async: true
	},{
	    success: function(httpResponse) {
		console.log(httpResponse);
	    },
	    error: function(httpResponse) {
		console.error(httpResponse);
	    }
	});

    }

    response.success();
});
