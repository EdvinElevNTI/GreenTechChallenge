
key_value = ""; // Global variable to store the current key value
expired = false; // Global variable to store if the current item is expired or not
var selectedValue = ""; // Global variable to store the selected value from the filter dropdown

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
    var options = element.querySelector('.options');
    options.style.display = 'block';
}

function hideOptions(element)
{
    var options = element.querySelector('.options');
    options.style.display = 'none';
}

// Autofill EditModal and decide index
function openEditModal(key, item) {
  
  var key = Number(key); // convert to number AKA integer

  // Pre-define values
  $.getJSON('/get_item/' + key, function(item) {
    document.getElementById('editIndex').value = key;
    document.getElementById('new_name').value = item.name;
    // Parse the expiration date string into a Date object
    var expirationDate = new Date(item.expiration_date);
    // Format the expiration date to YYYY-MM-DD
    var formattedExpirationDate = expirationDate.toISOString().split('T')[0];
    document.getElementById('new_expiration_date').value = formattedExpirationDate;
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
        "Gör en sås eller soppa! Till exempel med grönsaker, kött, eller fisk",
        "Gör en dryck med mjölken! Till exempel chokladmjölk, varm choklad, eller drick som den är"
      ];
    }
    else if (display_type == "juice")
    {
      display_type = "Juice";
      suggestions =
      [
        "Gör en gelé eller geleé med juice! Till exempel med citrusfrukter, äpple eller hallon.",
        "Blanda juice i marinader eller glaze! Perfekt för kött eller grönsaker.",
        "Skapa sorbet eller granita med juice! Uppfriskande och läckert på varma dagar.",
        "Använd juice i dressings eller vinaigrettes! Ge salladen extra smak.",
        "Gör mocktails eller cocktails med juice! För en läcker och alkoholfri dryck."
      ];
    }
    else if (display_type == "egg")
    {
      display_type = "Ägg";
      suggestions = 
      [
        "Gör en dessert med ägg! Till exempel crème brûlée, mousse au chocolat eller tiramisu.",
        "Baka något med ägg! Till exempel kakor, muffins, bröd eller quiche.",
        "Gör en omelett med ägg! Till exempel med grönsaker, ost eller skinka.",
        "Gör en sås med ägg! Till exempel hollandaise, bearnaise eller aioli.",
        "Gör en dryck med ägg! Till exempel äggnog, pisco sour eller smoothie med ägg."
      ];
    }
    else if (display_type == "cheese")
    {
      display_type = "Ost";
      suggestions = 
      [
        "Gör en aptitretare med ost! Till exempel ostbricka, ostbollar eller ostpinnar.",
        "Baka något med ost! Till exempel paj, ostbröd eller ostkringlor.",
        "Gör en sallad med ost! Till exempel grekisk sallad, caprese eller cobb-sallad.",
        "Gör en sås med ost! Till exempel ost- och skinksås, ostfondue eller ostgratäng.",
        "Gör en dryck med ost! Till exempel ostsmoothie, ostte eller glögg med ost."
      ];
    }
    else
    {
      display_type = "Ingen";
      suggestions =
      [
        "Ingen rekommendation tillgänglig för denna typ av produkt.\nRedigera produkttypför varan för att få rekommendationer (avancerade inställningar)"
      ];
    }

    // Check if item is expired and decide message and color
    var expired = item.expired;
    var warning = item.warning;
    var expiry_value;

    if (expired == true) {
        expiry_value = "<i class='fas fa-exclamation-circle'></i> (Varning: Har gått ut)"; // Icon for expired
        $(".expiry_value").removeClass("warning-text");
        $(".expiry_value").addClass("expired-text");
    } else if (warning != null) {
        expiry_value = "<i class='fas fa-exclamation-triangle'></i> (Varning: Går ut snart)"; // Icon for warning
        $(".expiry_value").removeClass("expired-text");
        $(".expiry_value").addClass("warning-text");
    } else {
        expiry_value = ""; // No icon needed for no warning
        $(".expiry_value").removeClass("expired-text");
        $(".expiry_value").removeClass("warning-text");
    }

    $(".expiry_value").html(expiry_value); // Update HTML content with the icon


    console.log(expiry_value)
    
    // Add or update text and suggestions to modal
    document.getElementById('current_type').textContent = display_type;

    // Create list items for each one in suggestions array
    for (var i = 0; i < suggestions.length; i++)
    {
      var listItem = document.createElement("li");
      listItem.textContent = suggestions[i];
      suggestionsList.appendChild(listItem);
    }


  });
}

// Function to delete items from inside of recommend modal
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

document.addEventListener('DOMContentLoaded', function() {
  var triggerElements = document.querySelectorAll('.list-item');

  triggerElements.forEach(function(element) {
      // Exclude the settings button and options container and its children from the hoverable elements
      if (!element.classList.contains('settings_icon') && !element.classList.contains('options-container-parent')) {
          // Add event listener for hover effect to the parent element
          element.addEventListener('mouseover', function(event) {
              // Check if the event target or its ancestors contain the options-container class
              if (!event.target.closest('.settings_icon') && !event.target.closest('.options-container-parent')) {
                  var children = this.children;
                  for (var i = 0; i < children.length; i++) {
                      children[i].classList.add('hovered');
                  }
              }
          });

          element.addEventListener('mouseout', function(event) {
              // Check if the event target or its ancestors contain the options-container class
              if (!event.target.closest('.settings_icon') && !event.target.closest('.options-container-parent')) {
                  var children = this.children;
                  for (var i = 0; i < children.length; i++) {
                      children[i].classList.remove('hovered');
                  }
              }
          });

          element.addEventListener('click', function(event) {
              // Check if the event target or its ancestors contain the options-container class
              if (!event.target.closest('.settings_icon') && !event.target.closest('.options-container-parent')) {
                  // Extract key and item data from the element's id or other attributes
                  var key = this.getAttribute('id').split('_')[3]; // Extract the key from the id
                  var itemData = this.getAttribute('data-item'); // Extract item data from a custom attribute if available
                  openRecommendModal(key, itemData);
                  $('#recommend').modal('show');
              }
          });
      }
  });
});