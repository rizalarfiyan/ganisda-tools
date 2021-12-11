const icons = {
  times: 'M13.41,12l4.3-4.29a1,1,0,1,0-1.42-1.42L12,10.59,7.71,6.29A1,1,0,0,0,6.29,7.71L10.59,12l-4.3,4.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,13.41l4.29,4.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42Z',
  setting: 'M21.32,9.55l-1.89-.63.89-1.78A1,1,0,0,0,20.13,6L18,3.87a1,1,0,0,0-1.15-.19l-1.78.89-.63-1.89A1,1,0,0,0,13.5,2h-3a1,1,0,0,0-.95.68L8.92,4.57,7.14,3.68A1,1,0,0,0,6,3.87L3.87,6a1,1,0,0,0-.19,1.15l.89,1.78-1.89.63A1,1,0,0,0,2,10.5v3a1,1,0,0,0,.68.95l1.89.63-.89,1.78A1,1,0,0,0,3.87,18L6,20.13a1,1,0,0,0,1.15.19l1.78-.89.63,1.89a1,1,0,0,0,.95.68h3a1,1,0,0,0,.95-.68l.63-1.89,1.78.89A1,1,0,0,0,18,20.13L20.13,18a1,1,0,0,0,.19-1.15l-.89-1.78,1.89-.63A1,1,0,0,0,22,13.5v-3A1,1,0,0,0,21.32,9.55ZM20,12.78l-1.2.4A2,2,0,0,0,17.64,16l.57,1.14-1.1,1.1L16,17.64a2,2,0,0,0-2.79,1.16l-.4,1.2H11.22l-.4-1.2A2,2,0,0,0,8,17.64l-1.14.57-1.1-1.1L6.36,16A2,2,0,0,0,5.2,13.18L4,12.78V11.22l1.2-.4A2,2,0,0,0,6.36,8L5.79,6.89l1.1-1.1L8,6.36A2,2,0,0,0,10.82,5.2l.4-1.2h1.56l.4,1.2A2,2,0,0,0,16,6.36l1.14-.57,1.1,1.1L17.64,8a2,2,0,0,0,1.16,2.79l1.2.4ZM12,8a4,4,0,1,0,4,4A4,4,0,0,0,12,8Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,12,14Z',
  history: 'M12,2A10,10,0,0,0,5.12,4.77V3a1,1,0,0,0-2,0V7.5a1,1,0,0,0,1,1H8.62a1,1,0,0,0,0-2H6.22A8,8,0,1,1,4,12a1,1,0,0,0-2,0A10,10,0,1,0,12,2Zm0,6a1,1,0,0,0-1,1v3a1,1,0,0,0,1,1h2a1,1,0,0,0,0-2H13V9A1,1,0,0,0,12,8Z'
};

function draggable(element) {
  let isMouseDown = false;
  let mouseX = 0;
  let mouseY = 0;
  let elementX = 0;
  let elementY = 0;
  element.addEventListener("mousedown", onMouseDown);
  element.addEventListener("mouseup", onMouseUp);
  document.addEventListener("mousemove", onMouseMove);

  function onMouseDown(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    isMouseDown = true;
  }

  function onMouseUp() {
    isMouseDown = false;
    elementX = parseInt(element.style.right) || 0;
    elementY = parseInt(element.style.top) || 0;
  }

  function onMouseMove(event) {
    if (!isMouseDown) return;
    let deltaX = event.clientX - mouseX;
    let deltaY = event.clientY - mouseY;
    element.style.right = elementX - deltaX + "px";
    element.style.top = elementY + deltaY + "px";
  }
}

class QuestionController {
  defaultOptions = {
    commentElement: "#stack",
    dragElement: "#drag",
    iconLibrary: Object.create(null),
    iconElement: "span[data-icon]",
    iconAttrName: 'data-icon',
    iconAttrSize: 'data-size',
    defaultIcon: "times",
    defaultIconSize: 24,
  };

  constructor(options) {
    this.options = Object.assign({}, this.defaultOptions, options);

    this.el = document.querySelector(this.options.commentElement);
    this.dragElement = document.querySelector(this.options.dragElement);
    this.iconsElement = document.querySelectorAll(this.options.iconElement);

    this.itemsId = [];
    this.items = [];
    this.current = 0;
    this.itemsTotal = 0;
    this._init();
  }

  _init() {
    this.showNoComment();
    draggable(this.dragElement);
    this.createIcons(); 
  }

  createIcons() {
    if (this.options.iconLibrary[this.options.defaultIcon] === undefined) {
      console.warn('Icon library not loaded!')
      return
    }

    this.iconsElement.forEach(elem => {
      const getIconSize = elem.getAttribute(this.options.iconAttrSize) || this.options.defaultIconSize
      const getIconName = elem.getAttribute(this.options.iconAttrName)
      const iconName = this.options.iconLibrary[getIconName] || this.options.iconLibrary[this.options.defaultIcon]
      const baseSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" width="${getIconSize}" height="${getIconSize}" viewBox="0 0 24 24" fill="currentColor"><path d="${iconName}"></path></svg>`
      elem.insertAdjacentHTML('beforeend', baseSvg)
    });
  }

  update(data) {
    if (data.length != 0) {
      this.removeNoComment();
    }

    // remove element to stack
    this.getUpdateElement();
    const remove = this.getRemoveId(data);
    if (remove.length != 0) {
      for (let val of remove) {
        this.getElemId(val).remove();
      }
    }

    if (data.length == 0) {
      this.showNoComment();
    }

    // add or update element to stack
    for (let key in data) {
      if (this.isHasId(data[key].id)) {
        const div = document.createElement("div");
        div.classList.add("stack_item");
        div.innerText = data[key].text;
        div.setAttribute("data-id", data[key].id);
        this.el.appendChild(div);
      } else {
        this.getElemId(data[key].id).innerText = data[key].text;
      }

      if (this.current == key) {
        this.getElemId(data[key].id).classList.add("show");
      }
    }

    this.updateElement();
    this.updateCurrentPosition();
  }

  updateCurrentPosition() {
    for (let key in this.items) {
      const item = this.items[key];
      item.style.zIndex = this.items.length - key;
    }
  }

  getRemoveId(data) {
    const getUpdateId = data.reduce((prev, cur) => {
      prev.push(cur.id);
      return prev;
    }, []);

    return this.itemsId.filter((remove) => {
      return !getUpdateId.includes(remove) && !!remove;
    });
  }

  isHasId(id) {
    return this.getElemId(id) === null;
  }

  getElemId(id) {
    return this.el.querySelector(`.stack_item[data-id="${id}"]`);
  }

  getUpdateElement() {
    this.updateElement();
    this.itemsId = [];
    for (const key in this.items) {
      const id = this.items[key].getAttribute("data-id");
      this.itemsId.push(id);
    }
  }

  updateElement() {
    this.items = [].slice.call(this.el.children);
    this.itemsTotal = this.items.length;
  }

  showNoComment() {
    if (!this.isNoComment()) {
      const div = document.createElement("div");
      div.innerText = "No comment!";
      div.setAttribute("no-comment", true);
      this.el.appendChild(div);
    }
  }

  removeNoComment() {
    const elem = this.isNoComment();
    if (!elem) return false;
    elem.remove();
    return true;
  }

  isNoComment() {
    const elem = this.el.querySelector("[no-comment]");
    if (elem != null) return elem;
    return false;
  }

  addActiveClass() {
    this.items[this.current].classList.add("show");
  }

  addNonActiveClass() {
    this.current = this.current > this.itemsTotal ? 0 : this.current;
    this.items[this.current].classList.remove("show");
  }

  prev() {
    if (this.isNoComment()) {
      return;
    }
    console.log("prev");
    this.updateElement();
    this.addNonActiveClass();
    this.current = this.current <= 0 ? this.itemsTotal - 1 : this.current - 1;
    this.addActiveClass();
  }

  next() {
    if (this.isNoComment()) {
      return;
    }
    console.log("next");
    this.updateElement();
    this.addNonActiveClass();
    this.current = this.current >= this.itemsTotal - 1 ? 0 : this.current + 1;
    this.addActiveClass();
  }
}

const stack = new QuestionController({
  iconLibrary: icons
});

let data = [];
const generateId = (long) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < long; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

let num = 1;
const add = document.getElementById("add");
add.addEventListener("click", function () {
  data.push({
    id: generateId(20),
    text: "Ini adalah pertanyaan ke-" + num++,
  });
  console.log("add", data);
});

const remove = document.getElementById("remove");
remove.addEventListener("click", function () {
  data = data.slice(1, data.length);
  console.log("remove", data);
});

const update = document.getElementById("update");
update.addEventListener("click", function () {
  stack.update(data);
});

const prev = document.getElementById("prev");
prev.addEventListener("click", function () {
  stack.prev();
});

const next = document.getElementById("next");
next.addEventListener("click", function () {
  stack.next();
});
