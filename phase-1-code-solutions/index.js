var list = document.querySelector('.shopping-list');
var form = document.querySelector('.shopping-form');
var filters = document.querySelectorAll('[data-filter]');
var clears = document.querySelectorAll('[data-clear]');

//initialization function called when the dom is fully loaded.
document.addEventListener('DOMContentLoaded', init);

//function-1
function init(){
  load();  //loads saved shopping items from local storage.
  dragdrop();//sets up drag and drop functionality for list items.
  notice();//updates the visibility of the shopping notice based on list items.
  
  form.addEventListener('submit', submit); //listens for form submission events
  
  //attaches click event listeners to each filter button.
  filters.forEach(function(button){
    button.addEventListener('click', filter);
  });
  
  //attaches click event listeners to each clear button.
  clears.forEach(function(button){
    button.addEventListener('click', clear);
  });
}

//function-2
//function to save shopping items to local storage.
function save(){
  var items = list.querySelectorAll('li');//selects all list items in the shopping list.
  var shoppingitems = [];
  items.forEach(function (item){
    var id = item.getAttribute('data-id');//retrieves the unique identifier of the item.
    var name = item.querySelector('.item-name').textContent;//retrieves the name of the item.
    var completed = item.hasAttribute('data-completed');//checks if the item is marked as completed

    //constructs an object representing the shopping item and adds it to the array.
    shoppingitems.push({ id, name, completed });
  });
  localStorage.setItem('shoppingitems', JSON.stringify(shoppingitems));
}

//function-3
//function to load shopping items from local storage.
function load(){
  var shoppingitems = JSON.parse(localStorage.getItem('shoppingitems')) || [];
  list.innerHTML = '';//clears the current items in the shopping list.
  shoppingitems.forEach(function (shoppingitem){
    var li = create(shoppingitem);//creates a new list item based on the loaded shopping item.
    list.appendChild(li);//appends the new list item to the shopping list.
  });
}

//function-4
//function to create a new list item based on a shopping item object.
function create(shoppingitem){
  var id = shoppingitem.id, name = shoppingitem.name, completed = shoppingitem.completed;
  
  //creating checkbox element.
  var input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = completed;
  input.addEventListener('change', toggle);//adds event listener for checkbox state change.
  
  //creating item element.
  var div = document.createElement('div');
  div.textContent = name;
  div.classList.add('item-name');
  div.addEventListener('click', open);//adds event listener for clicking on item name.
  div.addEventListener('blur', close);//adds event listener for losing focus on item name.
  div.addEventListener('keydown', enter);//adds event listener for keyboard input.
  
  //creating delete button element.
  var button = document.createElement('button');
  button.innerHTML = '&times';
  button.classList.add('delete-button');
  button.addEventListener('click', remove);//adds event listener for clicking on delete button.

  //creating drag icon element.
  var span = document.createElement('span');
  span.innerHTML = '&equiv;';
  span.classList.add('drag-icon');

  //creating list item element.
  var li = document.createElement('li');
  li.draggable = true;
  li.setAttribute('data-id', id);
  li.toggleAttribute('data-completed', completed);

  //appending elements to list item.
  li.appendChild(input);
  li.appendChild(div);
  li.appendChild(button);
  li.appendChild(span);

  //returning the created list item.
  return li;
}

//function-5
//function to remove a shopping item from the list.
function remove(e){
  var item = e.target.parentNode;
  list.removeChild(item);
  notice();
  save();
}

//function-6
//function to add a new shopping item to the list
function add(name){
  var newitem = create({
    id: uniqueid(),//generates a unique id for the new item.
    name: name,//sets the name of the new item.
    completed: false,//marks the new item as incomplete.
  });
  
  list.prepend(newitem);//prepends the new item to the top of the list.
  
  update();//updates the filtered view od the shopping list.
  notice();//updates visibility of the shopping notice baced on the list item.
  save();//saves the updated shopping list to the local storage.
}

//function-7
//function to filter displayed items based on the selected filter.
function filteritems(filter){
  var items = list.querySelectorAll('li');//selects all list items in the shopping list.
  items.forEach(function (item){
    var completed = item.hasAttribute('data-completed');//checks if the item is marked as completed.
    if('completed' === filter){
      item.style.display = completed ? 'flex' : 'none';//shows completed items or hides incomplete items.
    }else if('incomplete' === filter){
      item.style.display = completed ? 'none' : 'flex';//shows incomplte items or hides incomplete items.
    }else{
      item.style.display = 'flex';
    }
  });
}

//function-8
//function to toggle the completion state of a shopping item.
function toggle(e){
  var item = e.target.parentNode;
  item.toggleAttribute('data-completed', this.checked);
  
  update();
  save();
}

//funtion-9
//function to enable editing mode for a shopping item's name.
function open(e){
  var name = e.target;
  var item = name.parentNode;//retrives the parent list item of the clicked item name.
  
  //disables editing for completed items.
  if(
    item.hasAttribute('data-completed') === false &&
    name.isContentEditable === false
  ){
    name.contentEditable = true;//enables content editing for the item name.
    item.draggable = false;//disables dragging for the item during exiting.

    //sets focus and moves the cursor to the end of the item name.
    var selection = window.getSelection();
    selection.selectAllChildren(name);
    selection.collapseToEnd();
  }
}

//function-10
//function to save changes and exit editing mode for a shopping item's name.
function close(e){
  var name = e.target;
  var item = name.parentNode;
  
  name.contentEditable = false;
  item.draggable = true;
  
  save();
}

//function-11
//function to handle the 'enter' key press during item name editing.
function enter(e){
  if(e.key === 'Enter'){
    e.preventDefault(); //prevent line breaks.
    close(e);//saves changes and exits editing mode.
  }
}

//function-12
//function to handle drag and drop functionality for list items.
function dragdrop(){
  var dragitem = null;
  list.addEventListener('dragstart', function(e){
    dragitem = e.target;
  });
  
  list.addEventListener('dragover', function(e){
    var target = e.target.closest('li');
    
    if(target && target !== dragitem){
      var targetindex = [...list.children].indexOf(target);
      var dragindex = [...list.children].indexOf(dragitem);
      var item = targetindex > dragindex ? target.nextSibling : target;
      list.insertBefore(dragitem, item);
      save();
    }
  });
}

//function-13
//function to handle form submission for adding new shopping items.
function submit(e){
  e.preventDefault();
  var name = document.getElementById('item').value;
  if(name.trim().length === 0) {
    alert('Don\'t be dumb. Enter a valid item name!');//displays an alert if the entered item name is empty.
    return;
  }
  add(name);
  
  this.reset();
}

//function-14
//function to update the filtered view of the shopping list based on the selected filter.
function filter(e){
  var filter = e.target;
  
  filters.forEach((btn) => btn.classList.remove('active'));
  
  filter.classList.add('active');
  
  filteritems(filter.getAttribute('data-filter'));
}

//function-15
//function to clear items from the shopping list based on the clear button clicked.
function clear(e){
  var button = e.target;
  
  if('all' === button.getAttribute('data-clear')) {
    list.innerHTML = '';
  }else{
    list
    .querySelectorAll('li[data-completed]')
    .forEach((item) => item.remove());
  }
  
  notice();
  save();
}

//function-16
//function to update the filtered view of the shopping list based on the active filter.
function update(){
  var active = document.querySelector('.active[data-filter]');
  
  filteritems(active.getAttribute('data-filter'));
}

//function-17 | damn.
//function to update the visibility of the shopping notice based on list items.
function notice(){
  var isempty = list.querySelectorAll('li').length === 0;
  var message = document.querySelector('.shopping-notice');

  message.classList.toggle('show', isempty);
}

//function-18
//function to generate a unique ID for new shopping items.
function uniqueid(){
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
