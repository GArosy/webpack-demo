import "./style/index.less";
const btn = document.getElementById("btn");
const index = document.getElementById("index");
let i = 0;

const foo = () => {
  index.textContent = ++i;
  console.log(i);
};

btn.addEventListener("click", foo);
