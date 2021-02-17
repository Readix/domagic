// $(".dice button").on("click", () => {
//     console.log('PANDA')
//     $(this).next(".content").css("max-height", "100px");
//     // content.css("backround-color", "red")
// //     if (content.css("max-height"))
// //         content.css("max-height", null);
// //     else
// //         content.css("max-height", content.scrollHeight + "px");
// })
var coll = document.getElementsByClassName("expand-button");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    // this.classList.toggle("active");
    var content = this.parentNode.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}