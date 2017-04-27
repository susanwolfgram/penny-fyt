var app = angular.module("myApp", ["firebase"]);

app.controller("myCtrl", function($scope, $firebaseObject, $firebaseArray, $firebaseAuth, $interval) {
	var user;
	var userObj;
	$scope.loggedIn = false; 
	$scope.feed = false;
	$scope.about = true;
	$scope.showSignup = false;
	$scope.feed = false;
	$scope.discover = false;
	$scope.signup = function () {
		if ($scope.pwd.length >= 6 && $scope.pwd == $scope.pwd2) {
			var userRef = firebase.database().ref().child("users");
			// create a synchronized array
			$scope.users = $firebaseArray(userRef);
			firebase.auth().createUserWithEmailAndPassword($scope.email, $scope.pwd).then(function(userData) {
			  	console.log("User " + userData.uid + " created successfully!");
			  	user = firebase.auth().currentUser;
				console.log(user);
				console.log($scope.users);
				// $scope.users.$add({
				// 	fName: $scope.fName, 
				// 	lName: $scope.lName
				// });
				firebase.database().ref().child("users").child(userData.uid).set({
			      name: $scope.fName
			    });
				var form = document.getElementById("signupForm");
				form.reset();
				$scope.loggedIn = true; 
				$scope.discover = true;
			}).catch(function(error) {
			  	console.error("Error: ", error);
			});
		}
	}

	$scope.checkPwd = function() {
		if ($scope.pwd && $scope.pwd.length < 6) {
			document.getElementById("pwdMessage").innerHTML = "Password must be at least 6 characters.";
			document.getElementById("pwdMessage").style.color = "red";
		} else if ($scope.pwd) {
			document.getElementById("pwdMessage").innerHTML = "";
			document.getElementById("pwd").style.border = "solid 2px #B8DEB8";
		} else {
			document.getElementById("pwdMessage").innerHTML = "";
			document.getElementById("pwd").style.border = "";
		}
	}

	$scope.checkPwdMatch = function() {
		if ($scope.pwd2 && $scope.pwd != $scope.pwd2) {
			document.getElementById("pwd2Message").innerHTML = "Passwords do not match.";
			document.getElementById("pwd2Message").style.color = "red";
			document.getElementById("pwd2").style.border = "";
		} else if ($scope.pwd2) {
			document.getElementById("pwd2").style.border = "solid 2px #B8DEB8";
			document.getElementById("pwd2Message").innerHTML = "";
		} else {
			document.getElementById("pwd2").style.border = "";
			document.getElementById("pwd2Message").innerHTML = "";
		}
	}

	$scope.login = function(result) {
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
			// window.location = "discover.html";
			$scope.loggedIn = true; 
			$scope.user = user; 
			$('#myModal').modal('hide');
			$scope.about = false;
			$scope.feed = true;
			$scope.loadfeed();
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

	$scope.createPost = function() {
		console.log(document.getElementById("postText").value);	
		firebase.database().ref().child("posts").push({
			user: userObj.name,
			text: $scope.postText,
			npo: $scope.npo,
			raised: 0,
			likes: 0,
			comments: 0
		});
		var form = document.getElementById("createPostForm");
		form.reset();
	}

	$scope.loadfeed = function() {
		var userRef = firebase.database().ref().child("posts");
		$scope.posts = $firebaseArray(userRef);
		console.log($scope.posts);
	}

	

});