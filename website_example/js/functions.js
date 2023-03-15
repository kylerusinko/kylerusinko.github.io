/* define functions here */
function outputCartRow(file, title, quantity, price, total) {
  document.write("<tr>");
  document.write("<td><img src="+file+"></td>");
  document.write("<td>"+title+"</td>");
  document.write("<td>"+quantity+"</td>");
  document.write("<td>"+price.toFixed(2)+"</td>");
  document.write("<td>"+calcTotal(quantity, price).toFixed(2)+"</td>");
  document.write("</tr>");
}
 function calcTotal(quantity, price){
   return quantity*price;
 }

 function calcTax(subtotal, rate) {
   return subtotal*rate;
 }

 function calcShipping(subtotal, threshold) {
   if (subtotal > threshold) {
     return 0;
   }
   else {
     return 40;
   }
 }

 function calcGrandTotal(subtotal, tax, shipping) {
   return subtotal+tax+shipping;
 }

 function formatDollars(num) {
   document.write("$" + num.toFixed(2));
 }
