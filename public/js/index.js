/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var AllCollections = new Array();
var AllFlows = new Array();
var app = {
initialized: false,
    // Application Constructor
initialize: function() {
	this.bindEvents();
},
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
bindEvents: function() {
	if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	} else {
		this.onDeviceReady();
	}
},
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
onDeviceReady: function() {
	app.receivedEvent('deviceready');
},
    // Update DOM on a Received Event
receivedEvent: function(id) {
	if (id == 'deviceready') {
        console.log("Device Ready. Opening DB...");
        $.mobile.loading('show');
		ProcessLocalStorage();
        AllCollections = [];
        AllFlows = [];
		PopulateAllFlows();
		PopulateAllCollections();
        PopulateFavorites();
		SetupCallbacks();	// register for rotation events etc
        SetupScreen();
	}
}
};

// Test fn, not called...
function TestCreateFile(fileentry, fileurl) {
    // read xml data from the url into the fileentry
    console.log("Reading in url:"+fileurl);
    var uri = encodeURI(fileurl);
    
    console.log("Populating filesystem...");
    window.requestFileSystem(LocalFileSystem.PERSISTENT,
                             0,
                             function(fs) {
                                console.log("creating base file");
                                fs.root.getFile("file.xml",
                                                {create: true},
                                                function(f) {
                                                    console.log("file created, downloading..." + uri);
                                                    var fileTransfer = new FileTransfer();
                                                    fileTransfer.download(
                                                                          uri,
                                                                          f,
                                                                          function(entry) {
                                                                          console.log("download complete at: " + entry.fullPath);
                                                                          },
                                                                          function(error) {
                                                                          console.log("download error source " + error.source);
                                                                          console.log("download error target " + error.target);
                                                                          console.log("upload error code" + error.code);
                                                                          }
                                                                          );
                                                },
                                                TransactionError);
                             },
                             TransactionError);

    
    /*
    $.ajax({
           type: "GET",
           url: fileurl,
           dataType: "xml",
           success: function(thexml) {
            console.log("Writing out:"+fileurl);           },
           error: function(a,b,c) {console.log(a + b + c);}	// should delete file here
           });
     */
}

