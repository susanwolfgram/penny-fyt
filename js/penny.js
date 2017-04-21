var app = angular.module("myApp", ["firebase"]);

app.controller("myCtrl", function($scope, $firebaseObject, $firebaseArray, $firebaseAuth, $interval) {
	var user;
	$scope.signup = function () {
		if ($scope.pwd == $scope.pwd2) {
			var userRef = firebase.database().ref().child("users");
			// create a synchronized array
			$scope.users = $firebaseArray(userRef);



			firebase.auth().createUserWithEmailAndPassword($scope.email, $scope.pwd).then(function(userData) {
			  	console.log("User " + userData.uid + " created successfully!");
			  	user = firebase.auth().currentUser;
				console.log(user);
				console.log($scope.users);
				var id = userData.uid;
				// $scope.users.$add({
				// 	fName: $scope.fName, 
				// 	lName: $scope.lName
				// });
				firebase.database().ref().child("users").child(userData.uid).set({
			      name: $scope.fName
			    });
				// var form = document.getElementById("signupForm");
				// form.reset();
			}).catch(function(error) {
			  console.error("Error: ", error);
			});



		}
	}

	$scope.checkPwd = function() {
		if ($scope.pwd2 && $scope.pwd != $scope.pwd2) {
			document.getElementById("pwdMessage").innerHTML = "Passwords do not match.";
			document.getElementById("pwdMessage").style.color = "red";
			document.getElementById("pwd2").style.border = "";
		} else if ($scope.pwd2) {
			document.getElementById("pwd2").style.border = "solid 2px #B8DEB8";
			document.getElementById("pwdMessage").innerHTML = "";
		} else {
			document.getElementById("pwd2").style.border = "";
			document.getElementById("pwdMessage").innerHTML = "";
		}
	}

	$scope.login = function() {
		console.log("login");
		firebase.auth().signInWithEmailAndPassword($scope.loginEmail, $scope.loginPwd).then(function(userData) {
			user = firebase.auth().currentUser;
			console.log(user);
			user = userData.uid; 
	     	currentUser = firebase.database().ref().child("users").child(user);
			userObj = $firebaseObject(currentUser);
			console.log(userObj);
			var form = document.getElementById("loginForm");
			form.reset();
			window.location = "discover.html";
			$scope.loggedIn = true; 
			$scope.user = user; 
		}).catch(function(error) {
		  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  // ...
		});
	}

	$scope.logOut = function() {
		console.log("log out");
		firebase.auth().signOut().then(function() {
		  $scope.loggedIn = false; 
		}).catch(function(error) {
		  // An error happened.
		});
	}

	

});