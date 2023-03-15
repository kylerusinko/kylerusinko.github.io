/* add loop and other code here ... in this simple exercise we are not
   going to concern ourselves with minimizing globals, etc */
function outputCartRowJS() {
  for (let i = 0; i < 3; i++) {
      outputCartRow(filenames[i], titles[i], quantities[i], prices[i]);
  }
}
