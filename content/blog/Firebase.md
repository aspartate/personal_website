---
title: "Firebase"
date: 2021-03-25T16:11:36-04:00
draft: false
---


{{< rawhtml >}}


<!doctype html>
<html class="no-js" lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>PHYSCI 70: Introduction to Digital Fabrication</title>
</head>

<body>
	<button id="turn-on" name="turnon">Turn On </button>
	<button id="turn-off" name="turnoff">Turn Off </button>

	<!-- The core Firebase JS SDK is always required and must be listed first -->
	<script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js"></script>

	<!-- TODO: Add SDKs for Firebase products that you want to use
	     https://firebase.google.com/docs/web/setup#available-libraries -->
	<script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-database.js"></script>
	<script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-analytics.js"></script>

	<script>
	  // Your web app's Firebase configuration
	  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
	  var firebaseConfig = {
	    apiKey: "AIzaSyCfqsFi41WknoyTyvnW0BGOX3-uHSuAALU",
	    authDomain: "esp32-led-51dcb.firebaseapp.com",
	    databaseURL: "https://esp32-led-51dcb-default-rtdb.firebaseio.com",
	    projectId: "esp32-led-51dcb",
	    storageBucket: "esp32-led-51dcb.appspot.com",
	    messagingSenderId: "614832026734",
	    appId: "1:614832026734:web:9d786c0df8bd51acaca27f",
	    measurementId: "G-X213GJ9XJ6"
	  };
	  // Initialize Firebase
	  firebase.initializeApp(firebaseConfig);
	  firebase.analytics();

	// Get a database reference to our blog
	var ref = firebase.database().ref("/");

	// make the buttons call the function below 
	document.getElementById('turn-on').addEventListener('click', turnOn, false);
	document.getElementById('turn-off').addEventListener('click', turnOff, false);

	function turnOn(){
		console.log("turning on");
		ref.update({
			"LED_STATUS": "ON"
		});
	}

	function turnOff(){
		console.log("turning off");
		ref.update({
			"LED_STATUS": "OFF"
		});
	}	
    </script>

</body>

{{< /rawhtml >}}