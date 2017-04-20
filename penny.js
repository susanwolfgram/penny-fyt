var app = angular.module("myApp", ["firebase"]);

app.controller("myCtrl", function($scope, $firebaseObject, $firebaseArray, $firebaseAuth, $interval) {
	var user;

	$scope.signup = function () {
		if ($scope.pwd == $scope.pwd2) {
			var userRef = firebase.database().ref().child("users");
			// create a synchronized array
			$scope.users = $firebaseArray(userRef);

			console.log($scope.users);
			$scope.users.$add({
				fName: $scope.fName, 
				lName: $scope.lName
			});

			firebase.auth().createUserWithEmailAndPassword($scope.email, $scope.pwd).then(function(userData) {
			  	console.log("User " + userData.uid + " created successfully!");
			  	user = firebase.auth().currentUser;
				console.log(user);
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

	

});