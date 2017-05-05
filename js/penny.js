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
	var userRef = firebase.database().ref().child("users");
	// create a synchronized array
	$scope.users = $firebaseArray(userRef);
	$scope.signup = function () {
		if ($scope.pwd && $scope.pwd.length >= 6 && $scope.pwd == $scope.pwd2) {
			var userRef = firebase.database().ref().child("users");
			// create a synchronized array
			$scope.users = $firebaseArray(userRef);
			firebase.auth().createUserWithEmailAndPassword($scope.email, $scope.pwd).then(function(userData) {
			  	console.log("User " + userData.uid + " created successfully!");
			  	user = firebase.auth().currentUser;
				userIDNum = userData.uid; 
				firebase.database().ref().child("users").child(userData.uid).set({
			      email: $scope.email,
				  fName: $scope.fName,
				  lName: $scope.lName,
				  credits: 0
			    });
				var form = document.getElementById("signupForm");
				form.reset();
				userIDNum = userData.uid; 
	     		currentUser = firebase.database().ref().child("users").child(userIDNum);
				userObj = $firebaseObject(currentUser);
				$scope.loggedIn = true; 
				$scope.loadNpos();
				$scope.discover = true;
			}).catch(function(error) {
				var errorMessage = error.message;
				displayErrorMessage("signUpErrorMsg", errorMessage);
			});
		}
	}

	$scope.npoAdd = function() {
		if ($scope.npoPwd.length >= 6 && $scope.npoPwd == $scope.npoPwd2) {
			firebase.auth().createUserWithEmailAndPassword($scope.npoEmail, $scope.npoPwd).then(function(userData) {
				firebase.database().ref().child("npos").child(userData.uid).set({
					npoId: userData.uid,
					name: $scope.npoName,
					npoEmail: $scope.npoEmail
				});
				var form = document.getElementById("npoSignupForm");
				form.reset();
			});
		}	
	}

	$scope.follow = function(npo) {
		if ($scope.loggedIn) {
			firebase.database().ref().child("users").child(userIDNum).child("following").child(npo.$id).set({
				name: npo.name
			}).then(function() {
				console.log("followed " + npo.name);
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
			document.getElementById("pwd").style.borderBottom = "solid 2px #B8DEB8";
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
			document.getElementById("pwd2").style.borderBottom = "solid 2px #B8DEB8";
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
			userIDNum = userData.uid; 
	     	currentUser = firebase.database().ref().child("users").child(userIDNum);
			userObj = $firebaseObject(currentUser);
			var form = document.getElementById("loginForm");
			form.reset();
			var dialog = document.querySelector('dialog');
			dialog.close();
			$scope.loggedIn = true; 
			allSectionsFalse();
			$scope.loadfeed();
			$scope.loadNpos(); 
			$scope.feed = true;
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
		var npoTagged = document.getElementById("chooseNPO").value;
		firebase.database().ref().child("posts").push({
			userID: userIDNum,
			userFName: userObj.fName,
			userLName: userObj.lName,
			text: $scope.postText,
			npo: npoTagged,
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

	$scope.loadNpos = function() {
		var userRef = firebase.database().ref().child("npos");
		$scope.npos = $firebaseArray(userRef);
	}

	$scope.choseNpo = function(npo) {
		document.getElementById("chooseNPO").value = npo.name;
		document.querySelector(".mdl-menu__container.is-visible").classList.remove("is-visible");
	}

	$scope.addComment = function(post) {
		var commentsDiv = document.getElementById("commentsFor" + post.$id); 
		//var commentsDisplayDiv = document.querySelector("#commentsFor" + post.$id + " div");
		var commentsRef = firebase.database().ref().child("posts").child(post.$id).child("comments");	
		var comments = $firebaseArray(commentsRef);
		comments.$loaded().then(function(comments) {
			commentsDiv.innerHTML = ""; 
			var div = document.createElement("div");
			div.classList.add("commentsDisplay");
			commentsDiv.appendChild(div);
			if (comments.length > 0) {
				displayComments(comments, post);
			} 
			var input = createCommentInput(commentsDiv);
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
						displayComments(comments, post);
						document.querySelector("#commentsFor" + post.$id + " input").value = "";
					});
					return false;
				}
			}
		});
	}
	
	function createCommentInput(commentsDiv) {
		var inputDiv = document.createElement("div");
		inputDiv.classList.add("mdl-textfield");
		inputDiv.classList.add("mdl-js-textfield");
		inputDiv.classList.add("mdl-textfield--floating-label");
		inputDiv.classList.add("commentInput");
		var input = document.createElement("input");
		input.type = "text";
		input.classList.add("mdl-textfield__input");
		input.id = "commentInput";
		var label = document.createElement("label");
		label.classList.add("mdl-textfield__label");
		label.for = "commentInput";
		label.innerHTML = "Add a comment...";
		inputDiv.appendChild(input);
		inputDiv.appendChild(label);
		commentsDiv.appendChild(inputDiv);
		componentHandler.upgradeElements(inputDiv);
		return input;
	}

	function displayComments(comments, post) {
		var div =  document.querySelector("#commentsFor" + post.$id + " div.commentsDisplay");
		var ul = document.createElement("ul");
		ul.classList.add("demo-list-item");
		ul.classList.add("mdl-list");
		for (var i = 0; i < comments.length; i++) {
			var li = document.createElement("li");
			li.classList.add("mdl-list__item");
			var span = document.createElement("span");
			span.classList.add("mdl-list__item-primary-content");
			span.innerHTML = comments[i].text;
			var userSpan = document.createElement("span");
			userSpan.style.fontWeight = "bold";
			userSpan.innerHTML = comments[i].userFName + " " + comments[i].userLName; 
			userSpan.style.marginRight = "1em";
			li.appendChild(userSpan);
			li.appendChild(span);
			if (comments[i].user == userIDNum) {
				var icon = document.createElement("i");
				icon.classList.add("material-icons");
				icon.classList.add("mdl-list__item-icon");
				icon.innerHTML = "delete";
				icon.id = comments[i].$id;
				icon.title = "Delete comment";
				icon.onclick = function() {
					console.log("icon clicked");
					firebase.database().ref().child("posts").child(post.$id).child("comments").child(this.id).remove();
					var listItem = this.parentNode;
					listItem.parentNode.removeChild(listItem);
				}
				li.appendChild(icon);
			}
			ul.appendChild(li);
		}
		div.innerHTML = "";
		div.appendChild(ul);
	}

	$scope.like = function(post) {
		post.likes++;
		post.raised++; 
		$scope.posts.$save(post);
	}

	$scope.setUpLoginDialog = function() {
		var dialog = document.querySelector('dialog');
		var showDialogButton = document.querySelector('#show-dialog');
		if (! dialog.showModal) {
			dialogPolyfill.registerDialog(dialog);
		}
		showDialogButton.addEventListener('click', function() {
			dialog.showModal();
		});
		dialog.querySelector('.close').addEventListener('click', function() {
			dialog.close();
		});
	}

	$scope.reloadCredits = function() {
		var newCred = userObj.credits + 100;
		firebase.database().ref().child("users").child(userIDNum).child("credits").set(newCred);
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