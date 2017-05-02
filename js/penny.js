var app = angular.module("myApp", ["firebase"]);
//¢
app.controller("myCtrl", function($scope, $firebaseObject, $firebaseArray, $firebaseAuth, $interval) {
	var user;
	var userObj;
	var userIDNum;
	$scope.loggedIn = false; 
	$scope.about = true;
	$scope.showSignup = false;
	$scope.discover = false;
	$scope.feed = false;
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
				userIDNum = userData.uid; 
				firebase.database().ref().child("users").child(userData.uid).set({
			      email: $scope.email,
				  fName: $scope.fName,
				  lName: $scope.lName
			    });
				var form = document.getElementById("signupForm");
				form.reset();
				userIDNum = userData.uid; 
	     		currentUser = firebase.database().ref().child("users").child(userIDNum);
				userObj = $firebaseObject(currentUser);
				$scope.loggedIn = true; 
				$scope.discover = true;
			}).catch(function(error) {
				var errorMessage = error.message;
				displayErrorMessage("signUpErrorMsg", errorMessage);
			});
		}
	}

	function allSectionsFalse() {
		$scope.about = false;
		$scope.showSignup = false;
		$scope.discover = false;
		$scope.feed = false;
		$scope.$digest(); 
	}

	function displayErrorMessage(errorType, errorMessage) {
		var errorP = document.getElementById(errorType);
		errorP.innerHTML = errorMessage;
		errorP.style.color = "red";
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
			userIDNum = userData.uid; 
	     	currentUser = firebase.database().ref().child("users").child(userIDNum);
			userObj = $firebaseObject(currentUser);
			console.log(userObj);
			var form = document.getElementById("loginForm");
			form.reset();
			$('#myModal').modal('hide');
			$scope.loggedIn = true; 
			allSectionsFalse();
			$scope.feed = true;
			$scope.loadfeed();
		}).catch(function(error) {
		  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  console.log(errorMessage);
		  var loginError = document.getElementById("loginErrorMsg");
		  loginError.innerHTML = errorMessage;
		  loginError.style.color = "red";
		  // ...
		});
	}

	$scope.logOut = function() {	
		firebase.auth().signOut().then(function() {
			console.log("log out");
		  	$scope.loggedIn = false; 
			allSectionsFalse();
			$scope.about = true;
			$scope.$digest();
		}).catch(function(error) {
		  // An error happened.
		});
	}

	$scope.createPost = function() {
		firebase.database().ref().child("posts").push({
			userID: userIDNum,
			userFName: userObj.fName,
			userLName: userObj.lName,
			text: $scope.postText,
			npo: $scope.npo,
			raised: 0,
			likes: 0,
			comments: 0,
			following: 0
		});
		var form = document.getElementById("createPostForm");
		form.reset();
	}

	$scope.loadfeed = function() {
		var userRef = firebase.database().ref().child("posts");
		$scope.posts = $firebaseArray(userRef);
	}

	// $scope.loadDiscover = function() {
	// 	var userRef = firebase.database().ref().child("npos");
	// 	$scope.npos = $firebaseArray(userRef);
	// }

	$scope.addComment = function(post) {
		var commentsDiv = document.getElementById("commentsFor" + post.$id); 
		//var commentsDisplayDiv = document.querySelector("#commentsFor" + post.$id + " div");
		var commentsRef = firebase.database().ref().child("posts").child(post.$id).child("comments");	
		var comments = $firebaseArray(commentsRef);
		comments.$loaded().then(function(comments) {
			commentsDiv.innerHTML = ""; 
			if (comments.length > 0) {
				displayComments(comments, commentsDiv, post);
			} 
			var input = document.createElement("input");
			input.type = "text";
			input.classList.add("form-control");
			input.placeholder = "Add a comment...";
			input.onkeypress = function(e) {
				if (!e) e = window.event;
				var keyCode = e.keyCode || e.which;
				if (keyCode == '13'){
					console.log("enter pressed"); 
					// Enter pressed
					firebase.database().ref().child("posts").child(post.$id).child("comments").push({
						user: userIDNum,
						userFName: userObj.fName,
						userLName: userObj.lName,
						text: this.value
					}).then(function() {
						displayComments(comments, commentsDiv, post);
						document.querySelector("#commentsFor" + post.$id + " input").value = "";
					});
					return false;
				}
			}
			commentsDiv.appendChild(input);	
		});
	}

	$scope.like = function(post) {
		post.likes++;
		post.raised++; 
		$scope.posts.$save(post);
	}

	function displayComments(comments, commentsDiv, post) {
		var div; 
		if (document.querySelector("#commentsFor" + post.$id + " div")) {
			div = document.querySelector("#commentsFor" + post.$id + " div");
			div.innerHTML = "";
		} else {
			div = document.createElement("div");
			commentsDiv.appendChild(div);
		}
		var ul = document.createElement("ul");
		ul.classList.add("demo-list-item");
		ul.classList.add("mdl-list");
		for (var i = 0; i < comments.length; i++) {
			var li = document.createElement("li");
			li.classList.add("mdl-list__item");
			var span = document.createElement("span");
			span.classList.add("mdl-list__item-primary-content");
			span.innerHTML = comments[i].text;
			li.appendChild(span);
			ul.appendChild(li);
		}
		div.appendChild(ul);
		// for (var i = 0; i < comments.length; i++) {
		// 	var comment = document.createElement("p");
		// 	comment.innerHTML = comments[i].text;
		// 	comment.border = "1px solid gray";
		// 	commentsDisplayDiv.appendChild(comment);
		// }
	}

	$scope.fileName = false;
	var storageRef = firebase.storage().ref();
    var imagesRef = storageRef.child('images');
    var imgUrl; 
    
    $scope.previewFile = function(){
    var file = document.querySelector('input[type=file]').files[0];
    var metadata = {
    	contentType: 'image/jpeg'
    };

    var uploadTask = storageRef.child('images/' + file.name).put(file, metadata);
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
    function(snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: 
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING:
                console.log('Upload is running');
                break;
        }
        }, function(error) {
            console.log('error while uploading')
        }, function() {
            var starsRef = storageRef.child('images/'+ file.name);
            starsRef.getDownloadURL().then(function(url) {
                document.querySelector('#preview').src=url;
                imgUrl = url; 
            }).catch(function(error) {
                console.log('error while downloading file');
            });
        });
		$scope.fileName = true; 
		$scope.$digest();
    }
});

// app.directive('nop', function(){
//     return function($scope, $element) {
// 		$element.find('li.comment', click(function() {
// 			$element.find('div.commentDisplay').innerHTML = "some more stuff";
// 		}))
// 	}
// });