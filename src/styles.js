//blob mouse follow
const blob = document.getElementById("blob")

document.body.onpointermove = event => {
  const {clientX, clientY} = event;

  blob.animate({
    left: `${clientX}px`,
    top: `${clientY}px`
  }, {duration: 1000, fill: "forwards"});
}


//cool text effect
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let interval = null;

let buttons = document.querySelectorAll(".button-text");

buttons.forEach(button => {
  button.onmouseover = event => {
    let iteration = 0;
    
    clearInterval(interval);
    
    interval = setInterval(() => {
      event.target.innerText = event.target.innerText
        .split("")
        .map((letter, index) => {
          if (index < iteration) {
            return event.target.dataset.value[index];
          }
        
          return letters[Math.floor(Math.random() * 26)];
        })
        .join("");
      
      if (iteration >= event.target.dataset.value.length) { 
        event.target.innerText = event.target.dataset.value
        clearInterval(interval);
      }
      
      iteration += 1 / 3;
    }, 30);
  };

  button.addEventListener('mouseleave', event => {
    event.target.innerText = event.target.dataset.value; 
    clearInterval(interval); 
  });
});
