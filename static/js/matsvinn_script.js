
key_value = ""; // Global variable to store the current key value
expired = false; // Global variable to store if the current item is expired or not

// Auto fill current year when adding item to expiration list
function setYear()
{
  document.getElementById('year').value = new Date().getFullYear();
}

// Advanced setting toggler: Calc (add click event and toggle display: none)
$(document).ready(function () {
  $(".advanced-link_calc").click(function () {
    $(".advanced-content_calc").toggleClass("d-none");
  });
});

// Advanced setting toggler: ExpAdd
$(document).ready(function () {
  $(".advanced-link_expadd").click(function () {
    $(".advanced-content_expadd").toggleClass("d-none");
  });
});

// Advanced setting toggler: Edit
$(document).ready(function () {
  $(".advanced-link_edit").click(function () {
    $(".advanced-content_edit").toggleClass("d-none");
  });
});


// Function to toggle the delete confirmation in recommend modal
function toggleDeleteConfirmation() {
  $(".confirm_delete").toggleClass("d-none");
  $(".open_delete").toggleClass("d-none");
}

// Open delete confirmation in recommend modal
$(document).ready(function () {
  $(".open_delete").click(function () {
    toggleDeleteConfirmation();
  });

  $(".close_delete").click(function () {
    toggleDeleteConfirmation();
  });
});


// Functions to show and hide options in expiration list when hovering
function showOptions(element)
{
  var container = element.closest('.list-item-container');
  var options = container.querySelector('.options');
  options.style.display = 'block';
}
function hideOptions(element)
{
  var container = element.closest('.list-item-container');
  var options = container.querySelector('.options');
  options.style.display = 'none';
}


// Autofill EditModal and decide index
function openEditModal(key, item) {
  
  var key = Number(key); // convert to number AKA integer

  // Pre-define values
  $.getJSON('/get_item/' + key, function(item) {
    document.getElementById('editIndex').value = key;
    document.getElementById('new_name').value = item.name;
    document.getElementById('new_year').value = item.year;
    document.getElementById('new_month').value = item.month;
    document.getElementById('new_day').value = item.day;
    document.getElementById('new_note').value = item.note;
    document.getElementById('new_warning_days').value = item.warning_days;
    document.getElementById('new_type').value = item.type;
    
  });

}


// Autofill recommendation modal and decide suggestions
function openRecommendModal(key, item)
{
  var key = Number(key); // convert to number AKA integer
  key_value = key; // Store key in global variable
  var suggestions = [];
  var suggestionsList = document.getElementById("suggestionsList");
  suggestionsList.innerHTML = ""; // Clear list

  // Define text and suggestions
  $.getJSON('/get_item/' + key, function(item) {
    var display_type = item.type;

    if (display_type == "milk")
    {
      display_type = "Mjölk";
      suggestions = 
      [
        "Gör en dessert med mjölken! Till exempel pannacotta, glass, eller chokladmousse",
        "Baka något med mjölken! Till exempel kakor, muffins, bröd, eller pannkakor",
        "Gör en smoothie med mjölken! Till exempel med frukt, bär, eller grönsaker",
        "Gör en sås eller soppa med mjölken! Till exempel med grönsaker, kött, eller fisk",
        "Gör en dryck med mjölken! Till exempel chokladmjölk, varm choklad, eller drick som den är"
      ];
    }
    else if (display_type == "juice")
    {
      display_type = "Juice";
      suggestions =
      [
        "a",
        "b",
        "c",
        "d",
        "e"
      ];
    }
    else if (display_type == "egg")
    {
      display_type = "Ägg";
      suggestions = 
      [
        "a",
        "b",
        "c",
        "d",
        "e"
      ];
    }
    else if (display_type == "cheese")
    {
      display_type = "Ost";
      suggestions = 
      [
        "a",
        "b",
        "c",
        "d",
        "e"
      ];
    }
    else
    {
      display_type = "Ingen";
      suggestions =
      [
        "Ingen rekommendation tillgänglig för denna typ av produkt.\nRedigera produkttypför varan för att få rekommendationer (advanced settings)"
      ];
    }

    // Check if item is expired
    var expired = item.expired;
    var expiry_value;
    if (expired == true)
    {
      expiry_value = "(Varning: Har gått ut)";
      $(".expiry_value").addClass("text-danger");
    }
    else
    {
      expiry_value = "(Har inte gått ut än)";
      $(".expiry_value").addClass("text-warning");
    }
    console.log(expiry_value)
    // Add text and suggestions to modal
    document.getElementById('current_type').textContent = display_type;
    document.getElementById('expiry_value').textContent = expiry_value;

    // Create list items for suggestions
    for (var i = 0; i < suggestions.length; i++)
    {
      var listItem = document.createElement("li");
      listItem.textContent = suggestions[i];
      suggestionsList.appendChild(listItem);
    }


  });
}


// Function to delete items from recommend modal
function deleteItem() {

  var key = Number(key_value);

  $.ajax({
    type: 'POST',
    url: '/delete_item',
    data: { index: key },
    success: function(response) {
      window.location.reload(); // Reload the page after deletion
      },
      error: function(xhr, status, error) {
        console.error(error);
    }
  });
}