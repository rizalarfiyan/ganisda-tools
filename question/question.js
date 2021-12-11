class Draggable {
  defaultOptions = {
    element: "#drag",
  };

  constructor(options) {
    this.options = Object.assign({}, this.defaultOptions, options);
    this.el = document.querySelector(this.options.element);
    this.style = this.el.style;
    this.isMouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.elementX = 0;
    this.elementY = 0;
  }

  eventInit() {
    this.el.addEventListener("mousedown", (event) => this._onMouseDown(event));
    this.el.addEventListener("mouseup", () => this._onMouseUp());
    document.addEventListener("mousemove", (event) => this._onMouseMove(event));
  }

  _onMouseDown(event) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    this.isMouseDown = true;
  }

  _onMouseUp() {
    this.isMouseDown = false;
    this.elementX = parseInt(this.style.right) || 0;
    this.elementY = parseInt(this.style.top) || 0;
  }

  _onMouseMove(event) {
    if (!this.isMouseDown) return;
    let deltaX = event.clientX - this.mouseX;
    let deltaY = event.clientY - this.mouseY;
    this.style.right = this.elementX - deltaX + "px";
    this.style.top = this.elementY + deltaY + "px";
  }
}

class Icons {
  defaultOptions = {
    library: Object.create(null),
    element: "span[data-icon]",
    attributeName: "data-icon",
    attributeSize: "data-size",
    defaultIcon: "times",
    defaultSize: 24,
  };

  constructor(options) {
    this.options = Object.assign({}, this.defaultOptions, options);
    this.el = document.querySelectorAll(this.options.element);
    this._init();
  }

  _init() {
    if (this.options.library[this.options.defaultIcon] === undefined) {
      console.warn("Icon library not loaded!");
      return;
    }
  }

  _getName() {
    return (
      this.elem.getAttribute(this.options.attributeName) ||
      this.options.defaultIcon
    );
  }

  _getSize() {
    return (
      this.elem.getAttribute(this.options.attributeSize) ||
      this.options.defaultSize
    );
  }

  _iconName() {
    const name = this._getName();
    return (
      this.options.library[name] ||
      this.options.library[this.options.defaultIcon]
    );
  }

  _iconTemplate(name, size) {
    return `<svg xmlns="http://www.w3.org/2000/svg" class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="${name}"></path></svg>`;
  }

  createIcons() {
    this.el.forEach((elem) => {
      this.elem = elem;
      const name = this._iconName(elem);
      const size = this._getSize(elem);
      elem.insertAdjacentHTML("beforeend", this._iconTemplate(name, size));
    });
  }
}

class Modal {
  defaultOptions = {
    element: "[data-modal]",
    classActive: "open",
    elementClose: ".modal-exit",
  };

  constructor(options) {
    this.options = Object.assign({}, this.defaultOptions, options);
    this.el = document.querySelectorAll(this.options.element);
  }

  modalInit() {
    this.el.forEach((elem) => {
      elem.addEventListener("click", (event) => this._handleModal(event, elem));
    });
  }

  _handleModal(event, elem) {
    event.preventDefault();
    this.modal = document.getElementById(elem.dataset.modal);
    this.class = this.modal.classList;
    this._open();
    this._handleClose();
  }

  _handleClose() {
    this._shortcutClose();
    const close = this.modal.querySelectorAll(this.options.elementClose);
    close.forEach((event) => {
      event.addEventListener("click", (event) => this._clickClose(event));
    });
  }

  _open() {
    this.class.add(this.options.classActive);
  }

  _close() {
    this.class.remove(this.options.classActive);
  }

  _clickClose(event) {
    event.preventDefault();
    this._close();
  }

  _shortcutClose() {
    shortcuts.add("esc", () => {
      this._close();
      shortcuts.remove("esc");
    });
  }
}

class QuestionController {
  defaultOptions = {
    elementComment: "#stack",
    elementModalQuestion: "#question-modal",
  };

  constructor(options) {
    this.options = Object.assign({}, this.defaultOptions, options);

    this.elComment = document.querySelector(this.options.elementComment);
    this.elQuestion = document.querySelector(this.options.elementModalQuestion);
    this.form = this.elQuestion.querySelector("form");

    this.itemsId = [];
    this.items = [];
    this.current = 0;
    this.itemsTotal = 0;

    // Inject
    this.icons = new Icons({
      library: this.options.iconLibrary,
    });
    this.question = new Draggable();
    this.modal = new Modal();

    this._init();
  }

  _init() {
    this.showNoComment();
    this.formListener();

    // Run inject
    this.icons.createIcons();
    this.question.eventInit();
    this.modal.modalInit();
  }

  formListener() {
    this.form.addEventListener("submit", (event) => this.handleQuestion(event));
  }

  handleQuestion(event) {
    event.preventDefault();
    console.log(this.serializeJSON(this.form));
    this.elQuestion.classList.remove("open");
  }

  serializeJSON(form) {
    const formData = new FormData(form);
    const pairs = {};
    for (const [name, value] of formData) {
      pairs[name] = value;
    }
    return pairs;
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
        this.elComment.appendChild(div);
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
    return this.elComment.querySelector(`.stack_item[data-id="${id}"]`);
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
    this.items = [].slice.call(this.elComment.children);
    this.itemsTotal = this.items.length;
  }

  showNoComment() {
    if (!this.isNoComment()) {
      const div = document.createElement("div");
      div.innerText = "No comment!";
      div.setAttribute("no-comment", true);
      this.elComment.appendChild(div);
    }
  }

  removeNoComment() {
    const elem = this.isNoComment();
    if (!elem) return false;
    elem.remove();
    return true;
  }

  isNoComment() {
    const elem = this.elComment.querySelector("[no-comment]");
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
