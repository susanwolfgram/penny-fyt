var app = angular.module("myApp", ["firebase"]);
//¢
app.controller("myCtrl", function($scope, $firebaseObject, $firebaseArray, $firebaseAuth, $interval) {
	var user;
	var userObj;
	var userIdNum;
	$scope.loggedIn = false; 
	$scope.about = true;
	$scope.showSignup = false;
	$scope.discover = false;
	$scope.feed = false;
	$scope.reload = false;
	$scope.stepOne = true;
	$scope.stepTwo = false;
	$scope.stepThree = false;
	$scope.stepFour = false;
	$scope.stepFive = false;
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
				userIdNum = userData.uid; 
				firebase.database().ref().child("users").child(userData.uid).set({
			      email: $scope.email,
				  fName: $scope.fName,
				  lName: $scope.lName,
				  credits: 0
			    });
				var form = document.getElementById("signupForm");
				form.reset();
				userIdNum = userData.uid; 
				$scope.userId = userIdNum;
	     		currentUser = firebase.database().ref().child("users").child(userIdNum);
				userObj = $firebaseObject(currentUser);
				$scope.user = userObj;
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
					npoEmail: $scope.npoEmail,
					balance: 0,
					raised: 0
				});
				var form = document.getElementById("npoSignupForm");
				form.reset();
			});
		}	
	}

	$scope.follow = function(npo) {
		if ($scope.loggedIn) {
			firebase.database().ref().child("users").child(userIdNum).child("following").child(npo.$id).set({
				name: npo.name
			}).then(function() {
				console.log("followed " + npo.name);
			});
			firebase.database().ref().child("npos").child(npo.$id).child("followers").child(userIdNum).set({
				fName: userObj.fName,
				lName: userObj.lName
			}).then(function() {
				console.log(userObj.fName + " added to followers");
			});
		}
	}

	function allSectionsFalse() {
		$scope.about = false;
		$scope.showSignup = false;
		$scope.discover = false;
		$scope.feed = false;
		$scope.reload = false;
		//$scope.$digest(); 
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
			userIdNum = userData.uid; 
	     	currentUser = firebase.database().ref().child("users").child(userIdNum);
			userObj = $firebaseObject(currentUser);
			$scope.user = userObj;
			var form = document.getElementById("loginForm");
			form.reset();
			var dialog = document.querySelector('dialog');
			dialog.close();
			$scope.loggedIn = true; 
			$scope.userId = userIdNum;
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
		var bgImgCss = imgUrl ? "background-image: url('" + imgUrl + "')" : ""; 
		//imgUrl = imgUrl ? imgUrl : 0; 
		var postHeight = imgUrl ? "412px" : "176px"; 
		if (npoTagged != "Tag an NPO") {
			firebase.database().ref().child("posts").push({
				userId: userIdNum,
				userFName: userObj.fName,
				userLName: userObj.lName,
				text: $scope.postText,
				npo: npoTagged,
				npoId: chosenNpoId,
				raised: 0,
				likes: 0,
				comments: 0,
				commentCount: 0,
				following: 0,
				height: postHeight,
				bg: bgImgCss,
				time: firebase.database.ServerValue.TIMESTAMP
			});
			var form = document.getElementById("createPostForm");
			form.reset();
			document.getElementById("createPostTextarea").placeholder = "Write a post...";
			$scope.deleteImage();
			if (!document.getElementById("photoDiv").classList.contains("none")) {
				photoDiv.classList.add("none");
			}
		}
	}

	$scope.addPhoto = function() {
		var photoDiv = document.getElementById("photoDiv");
		if (photoDiv.classList.contains("none")) {
			photoDiv.classList.remove("none");
		} else {
			photoDiv.classList.add("none");
		}
	}


	
	$scope.loadfeed = function() {
		var userRef = firebase.database().ref().child("posts");
		$scope.posts = $firebaseArray(userRef);
	}

	$scope.loadNpos = function() {
		var userRef = firebase.database().ref().child("npos");
		$scope.npos = $firebaseArray(userRef);
	}

	var chosenNpoId; 
	$scope.choseNpo = function(npo) {
		document.getElementById("chooseNPO").value = npo.name;
		chosenNpoId = npo.$id; 
		document.querySelector(".mdl-menu__container.is-visible").classList.remove("is-visible");
	}

	$scope.loadReloadSelects = function() {
		var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
		$scope.months = monthNames;
		$scope.years = [ "2017", "2018", "2019", "2020", "2021"];
	}

	$scope.choseMonth = function(month) {
		document.getElementById("expireM").value = month; 
		document.querySelector(".mdl-menu__container.is-visible").classList.remove("is-visible");
	}

	$scope.choseYear = function(year) {
		document.getElementById("expireY").value = year; 
		document.querySelector(".mdl-menu__container.is-visible").classList.remove("is-visible");
	}

	$scope.addComment = function(post) {
		var commentsDiv = document.getElementById("commentsFor" + post.$id); 
		if (commentsDiv.innerHTML) {
			commentsDiv.innerHTML = "";
		} else {
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
					if (keyCode == '13' && this.value){
						if (checkUserCredits("comment")) {
							console.log("enter pressed"); 
							firebase.database().ref().child("posts").child(post.$id).child("comments").push({
								user: userIdNum,
								userFName: userObj.fName,
								userLName: userObj.lName,
								text: this.value
							}).then(function() {
								var newCred = userObj.credits - 2;
								firebase.database().ref().child("users").child(userIdNum).child("credits").set(newCred);
								var newCommentCount = (post.commentCount ? post.commentCount : 0) + 1; 
								firebase.database().ref().child("posts").child(post.$id).child("commentCount").set(newCommentCount);
								post.raised += 2;
								$scope.posts.$save(post);
								incrementNpoCredit(post.npoId, 2);
								displayComments(comments, post);
								document.querySelector("#commentsFor" + post.$id + " input").value = "";
							});
							return false;
						}
					}
				}
			});
		}
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

	function incrementNpoCredit(npoId, amount) {
		var npo = $firebaseObject(firebase.database().ref().child("npos").child(npoId));
		npo.$loaded().then(function() { 
			var newRaised = npo.raised ? npo.raised + amount : amount; 
			var newBalance = npo.balance ? npo.balance + amount : amount; 
			firebase.database().ref().child("npos").child(npoId).child("raised").set(newRaised);
			firebase.database().ref().child("npos").child(npoId).child("balance").set(newBalance);
		});
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
			if (comments[i].user == userIdNum) {
				var icon = document.createElement("i");
				icon.classList.add("material-icons");
				icon.classList.add("mdl-list__item-icon");
				icon.innerHTML = "delete";
				icon.id = comments[i].$id;
				icon.title = "Delete comment";
				icon.onclick = function() {
					firebase.database().ref().child("posts").child(post.$id).child("comments").child(this.id).remove();
					var newCount = post.commentCount - 1;
					firebase.database().ref().child("posts").child(post.$id).child("commentCount").set(newCount);
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

	$scope.deletePost = function(post) {
		if (confirm("Delete this post?")) {
			firebase.database().ref().child("posts").child(post.$id).remove();
		}
	}

	$scope.like = function(post) {
		if (checkUserCredits("like")) {
			post.likes++;
			post.raised++; 
			var newCred = userObj.credits - 1;
			firebase.database().ref().child("users").child(userIdNum).child("credits").set(newCred);
			$scope.posts.$save(post);
			incrementNpoCredit(post.npoId, 1);
		}
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
		var amount = document.getElementById("amount").value;
		var centAmount = amount * 100;
		var newCred = userObj.credits + centAmount;
		firebase.database().ref().child("users").child(userIdNum).child("credits").set(newCred);
		var form = document.getElementById("reloadForm");
		form.reset();
		alert("Successfully added $" + amount + " to your account!");
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
						document.querySelector('#preview').src = url;
						imgUrl = url; 
						$scope.fileName = true; 
						$scope.$digest();
					}).catch(function(error) {
						console.log('error while downloading file');
						console.log(error);
					});
				});
			
    }

	$scope.deleteImage = function() {
		var fileInput = document.getElementById('file_input_file');
		//var fileInputText = document.getElementById('file_input_text');
		fileInput.value = "";
		$scope.fileName = false;
		document.querySelector('#preview').src = "assets/placeholder-image.png";
		imgUrl = "";
		//$scope.$digest();
	}

	$scope.feedButton = function () {
		if ($scope.loggedIn && !$scope.feed) {
			allSectionsFalse();
			$scope.feed = true;
			$scope.loadfeed(); 
			//$scope.$digest();
		}
	}

	function checkUserCredits(type) {
		var amount = type == "like" ? 1 : 2; 
		if (userObj.credits < amount) {
			alert("Insufficient funds, please reload your account. This can be done through your user profile page.");
			return false;
		} else {
			return true;
		}
	}


});

// google.charts.load('current', {packages: ['table']});

// function getPostData(){
// 	var posts = [];
// 	var postDT;
// 	var postsRef = firebase.database().ref("posts");
// 	postsRef.orderByChild('npoId').equalTo("JStw39eY06ghvTwWRTOwsSe4OUB3").on('value', function(snap){
// 		snap.forEach(function(item) {
// 			var itemVal = item.val();
// 			posts.push(itemVal);
// 		});
// 		console.log(posts);
// 		postDT = toDataFrame(posts, "posts");
// 	});
// 	return postDT;
// }

// function getFollowers(){
// 	var followers = [];
// 	var followersDT;
// 	var userRef = firebase.database().ref("users")
// 	userRef.orderByChild('lName').on('value', function(snap){
// 		snap.forEach(function(item){
// 			f = item.val().following;
// 			if (f){
// 				if ("JStw39eY06ghvTwWRTOwsSe4OUB3" in f){
// 					followers.push(item.val());
// 				}
// 			}
// 		});
// 		console.log(followers);
// 		followersDT = toDataFrame(followers, "followers")
// 	});
// 	return followersDT;
// }

// function toDataFrame(data, table){
// 	dt = new google.visualization.DataTable();
// 	if (table == "posts"){
// 		//have to add id 
// 		cols = { likes: "number", raised:"number", time:"number", commentCount:"number", userId:"string"};
// 		for (var key in cols){
// 			var value = cols[key];
// 			console.log(key + " " + value);
// 			dt.addColumn(value, key);
// 		}
// 		//another to read data and also place in table
// 		for (o in data){
// 			dt.addRow([data[o].likes, data[o].raised, data[o].time, data[o].commentCount, data[o].userId]);
// 		}
// 	}else if(table == "followers"){
// 		cols = {gender: "string", dob: "datetime"};
// 		for (var key in cols){
// 			var value = cols[key];
// 			console.log(key + " " + value);
// 			dt.addColumn(value, key);
// 		}
// 		//another to read data and also place in table
// 		for (o in data){
// 			dt.addRow([data[o].gender, data[o].dob]);
// 		}
// 	}else if(table == "donations"){
// 		console.log("TODO");
// 	}


// 	console.log(dt.toJSON());
// 	return dt;
// }

// function loadDashboard(){
// 	var postsDT = getPostData();
// 	var followersDT = getFollowers();
// 	drawPieChart(postsDT);
// }
// //not running after load?
// function drawPieChart(){
// 	//var data = getPostData();
// 	var table = new google.visualization.Table(document.getElementById('sexGraph'));

// 	var pieView = new google.visualization.DataView();
// 	pieView.setColumns([4, 1]);
// 	table.draw(pieView)
	
// }

// google.charts.setOnLoadCallback(loadDashboard);

// app.directive('nop', function(){
//     return function($scope, $element) {
// 		$element.find('li.comment', click(function() {
// 			$element.find('div.commentDisplay').innerHTML = "some more stuff";
// 		}))
// 	}
// });

// function alert2(message, title, buttonText) {

//     buttonText = (buttonText == undefined) ? "Ok" : buttonText;
//     title = (title == undefined) ? "The page says:" : title;

//     var div = $('<div>');
//     div.html(message);
//     div.attr('title', title);
//     div.dialog({
//         autoOpen: true,
//         modal: true,
//         draggable: false,
//         resizable: false,
//         buttons: [{
//             text: buttonText,
//             click: function () {
//                 $(this).dialog("close");
//                 div.remove();
//             }
//         }]
//     });
// }