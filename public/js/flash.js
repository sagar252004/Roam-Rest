
  // Wait for the page to load before running the script
  document.addEventListener("DOMContentLoaded", function() {
    // Find the flash message element
    let flashMessage = document.getElementById('flashSuccess');
    
    // If the flash message exists, set a timer to hide it after 3 seconds
    if (flashMessage) {
      setTimeout(function() {
        // Remove the 'show' class to trigger the fade-out effect
        flashMessage.classList.remove('show');
        
        // After the fade-out animation (500ms), remove the element from the DOM
        setTimeout(function() {
          flashMessage.remove();
        }, 500); // 500ms is the duration of the fade transition
      }, 2000); // 3000 milliseconds = 3 seconds
    }
  });

//   for error flash
 // Wait for the page to load before running the script
 document.addEventListener("DOMContentLoaded", function() {
    // Find the flash message element
    let flashMessage1 = document.getElementById('flashError');
    
    // If the flash message exists, set a timer to hide it after 3 seconds
    if (flashMessage1) {
      setTimeout(function() {
        // Remove the 'show' class to trigger the fade-out effect
        flashMessage1.classList.remove('show');
        
        // After the fade-out animation (500ms), remove the element from the DOM
        setTimeout(function() {
          flashMessage1.remove();
        }, 500); // 500ms is the duration of the fade transition
      }, 2000); // 3000 milliseconds = 3 seconds
    }
  });
