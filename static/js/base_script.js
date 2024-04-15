function scrollToBottom() 
{
   // Get the element at the bottom of the page by its ID
   var bottomElement = document.getElementById('bottomElementId');

   // Scroll to the bottom element
   bottomElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
}