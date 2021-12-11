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
    iconAttrName: "data-icon",
    iconAttrSize: "data-size",
    defaultIcon: "times",
    defaultIconSize: 24,
    popupElement: "[data-modal]",
  };

  constructor(options) {
    this.options = Object.assign({}, this.defaultOptions, options);

    this.el = document.querySelector(this.options.commentElement);
    this.dragElement = document.querySelector(this.options.dragElement);
    this.iconsElement = document.querySelectorAll(this.options.iconElement);
    this.popupElement = document.querySelectorAll(this.options.popupElement);

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
    this.handlePopup();
  }

  createIcons() {
    if (this.options.iconLibrary[this.options.defaultIcon] === undefined) {
      console.warn("Icon library not loaded!");
      return;
    }

    this.iconsElement.forEach((elem) => {
      const getIconSize =
        elem.getAttribute(this.options.iconAttrSize) ||
        this.options.defaultIconSize;
      const getIconName = elem.getAttribute(this.options.iconAttrName);
      const iconName =
        this.options.iconLibrary[getIconName] ||
        this.options.iconLibrary[this.options.defaultIcon];
      const baseSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" width="${getIconSize}" height="${getIconSize}" viewBox="0 0 24 24" fill="currentColor"><path d="${iconName}"></path></svg>`;
      elem.insertAdjacentHTML("beforeend", baseSvg);
    });
  }

  handlePopup() {
    const mine = this
    
    this.popupElement.forEach((trigger) => {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        const modal = document.getElementById(trigger.dataset.modal);
        modal.classList.add("open");
        const exits = modal.querySelectorAll(".modal-exit");
        exits.forEach(function (exit) {
          const closeModal = () => {
            modal.classList.remove("open");
          }
          
          exit.addEventListener("click", function (event) {
            event.preventDefault();
            closeModal()
          });

          mine.handleEscape(closeModal)
        });
      });
    });
  }

  handleEscape(callback) {
    document.onkeydown = function (evt) {
      evt = evt || window.event;
      let isEscape = false;
      if ("key" in evt) {
        isEscape = evt.key === "Escape" || evt.key === "Esc";
      } else {
        isEscape = evt.keyCode === 27;
      }
      if (isEscape) {
        callback()
      }
    };
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
