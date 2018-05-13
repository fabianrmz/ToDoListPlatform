firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.

      document.getElementById("user_div").style.display = "block";
      document.getElementById("login_div").style.display = "none";
      document.getElementById("logout_div").style.display = "block";


      var user = firebase.auth().currentUser;

      if(user != null){

        var email_id = user.email;
        document.getElementById("user_para").innerHTML = "Welcome User : " + email_id;
        return firebase.database().ref().child("users/"+(firebase.auth().currentUser.uid)).once("value", function(snapshot){
           var countador=snapshot.child("tasks").val();
           var completed=snapshot.child("completed").val();


           document.getElementById("totalTasks").innerHTML = "Actual tasks created : " + countador;
           document.getElementById("totalDone").innerHTML = "Actual tasks completed : " + completed;
           });
      }

    } else {
      // No user is signed in.

      document.getElementById("user_div").style.display = "none";
      document.getElementById("login_div").style.display = "block";
      document.getElementById("logout_div").style.display = "none";

    }
  });

  function login(){

    var userEmail = document.getElementById("email_field").value;
    var userPass = document.getElementById("password_field").value;

    firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;

      window.alert("Error : " + errorMessage);

      // ...
    });

  }

  function logout(){
    firebase.auth().signOut();
  }


  function signUp(){
    var email = document.getElementById("email_fieldNew").value;
    var password = document.getElementById("password_fieldNew").value;
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  window.alert("Error: "+errorMessage);
  // ...
});
  }


  //Problem: UI doesnt provide desired results
  //Solution: Add interactivity so the user can manage daily tasks

  var taskInput = document.getElementById("new-task"); //new task
  var addButton = document.getElementsByTagName("button")[0]; //first button
  var incompleteTasksHolder = document.getElementById("incomplete-tasks"); //incomplete-task
  var completedTasksHolder = document.getElementById("completed-tasks"); //completed-tasks

  //new task list item
  var createNewTaskElement = function(taskString) {



    //create list item
    var listItem = document.createElement("li");

      //input (checkbox)
    var checkBox = document.createElement("input"); //checkbox
      //label
    var label = document.createElement("label");
      //input (text)
      var editInput = document.createElement("input"); //text

      //button.edit
      var editButton = document.createElement("button");

      //button.delete
      var deleteButton = document.createElement("button");

      //each of the elements needs modifying
    checkBox.type = "checkbox";
    editInput.type = "text";

    editButton.innerText = "Edit";
    editButton.className = "edit";
    deleteButton.innerText = "Delete";
    deleteButton.className= "delete";

    label.innerText = taskString;

    //each element needs appending
    listItem.appendChild(checkBox);
    listItem.appendChild(label);
    listItem.appendChild(editInput);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);

      return listItem;
  }

    //add new task
  var addTask = function() {


    firebase.database().ref('users/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
    var numeroTasks = snapshot.val().tasks;
    var done = snapshot.val().completed;
    numeroTasks+=1

    document.getElementById("totalTasks").innerHTML = "Actual tasks created : " + numeroTasks;
    firebase.database().ref('users/' + firebase.auth().currentUser.uid).set({
    completed: done,
    tasks: numeroTasks

    });
    });






    console.log("Add task...");
    //create new list item with text from #new-task:
    var listItem = createNewTaskElement(taskInput.value);
    //append listItem to incompleteTasksHolder
    incompleteTasksHolder.appendChild(listItem);
    bindTaskEvents(listItem, taskCompleted);

    taskInput.value = "";

  }

  //edit existing task
  var editTask = function() {
      console.log("Edit task...");

  var listItem = this.parentNode;

  var editInput = listItem.querySelector("input[type=text]");
  var label = listItem.querySelector("label");

  var containsClass = listItem.classList.contains("editMode");

    //if the class of the parent is .editMode
    if(containsClass) {
            //switch from .editMode
            //label text become the input's value
      label.innerText = editInput.value;
    } else {
            //switch to .editMode
            //input value becomes the label's text
      editInput.value = label.innerText;
    }
    //toggle .editMode on the list item
    listItem.classList.toggle("editMode");
  }

  //delete an existing task
    var deleteTask = function() {
        console.log("Delete task...");

      var listItem = this.parentNode;
      var ul = listItem.parentNode;

      //remove the parent list item from the ul
      ul.removeChild(listItem);
    }

  //mark a task as complete
  var taskCompleted = function() {
      updateDiv()






      firebase.database().ref('users/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
      var numeroTasks = snapshot.val().tasks;
      var done = snapshot.val().completed;
      done+=1

      document.getElementById("totalTasks").innerHTML = "Actual tasks created : " + numeroTasks;
      document.getElementById("totalDone").innerHTML = "Actual tasks completed : " + done;
      firebase.database().ref('users/' + firebase.auth().currentUser.uid).set({
      completed: done,
      tasks: numeroTasks

      });
      });




      console.log("Complete task...");

      //append the task list item to the #completed-tasks
    var listItem = this.parentNode;
    completedTasksHolder.appendChild(listItem);
        bindTaskEvents(listItem, taskIncomplete);

  }

  //mark a task as incomplete
  var taskIncomplete = function() {

      console.log("Task incomplete task...");

    //when the checkbox is unchecked
        //append the task list item to the #incomplet-tasks
      var listItem = this.parentNode;
      incompleteTasksHolder.appendChild(listItem);
      bindTasksEvents(listItem, taskCompleted);

  }

  var bindTaskEvents = function(taskListItem, checkBoxEventHandler) {
    console.log("Bind list item events");
    //select taskListItem's children
    var checkBox = taskListItem.querySelector("input[type=checkbox]");
    var editButton = taskListItem.querySelector("button.edit");
    var deleteButton = taskListItem.querySelector("button.delete");

      //bind editTask to edit button
      editButton.onclick = editTask;

      //bind deleteTask to delete button
      deleteButton.onclick = deleteTask;

      //bind taskCompleted to checkbox
      checkBox.onchange = checkBoxEventHandler;
  }


  //set the click handler to the addTask function

  addButton.onclick = addTask;

  var ajaxRequest = function() {
     console.log("Ajax request");
  //addButton.onclick = ajaxRequest;
  }

  addButton.addEventListener("click", addTask);
  addButton.addEventListener("click", ajaxRequest);

  //cycle over incompleteTasHolder ul list items
  for(var i = 0; i < incompleteTasksHolder.children.length; i++){
      bindTaskEvents(incompleteTasksHolder.children[i], taskCompleted);
  }


  //cycle over completedTasHolder ul list items
    //for each list item
     for(var i = 0; i < completedTasksHolder.children.length; i++){
      bindTaskEvents(completedTasksHolder.children[i], taskIncomplete);
  }

function updateDiv()
{
  window.alert("Good job!")
  q = "star wars"; // search query

  request = new XMLHttpRequest;
  request.open('GET', 'http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag='+q, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400){
      data = JSON.parse(request.responseText).data.image_url;
      console.log(data);
      document.getElementById("giphyme").innerHTML = '<center><img src = "'+data+'"  title="GIF via Giphy"></center>';
    } else {
      console.log('reached giphy, but API returned an error');
     }
  };

  request.onerror = function() {
    console.log('connection error');
  };

  request.send();
}
