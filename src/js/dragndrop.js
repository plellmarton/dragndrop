function DragNDrop (Container, options) {
  this.Container = null
  this.Repository = []
  this.DropZone = []
  this.data = {}
  this.PlaceHolder = ''
  this.init(Container, options)
}

DragNDrop.prototype = {
  init: function (Container, options) {
    this.Container = Container
    this.data = {
      repository: options.repository,
      dropzone: []
    }
    this.update()
    this.Repository = this.Container.querySelectorAll('[data-ref="repository"]')[0]
    this.DropZone = this.Container.querySelectorAll('[data-ref="dropzone"]')[0]
    var PlaceHolder = document.createElement('div')
    PlaceHolder.className = 'dragndrop__placeholder'
    this.PlaceHolder = PlaceHolder
    this.events()
  },

  renderItem: function (data, index) {
    var template = '<div class="dragndrop__item" draggable="true" data-ref="item" data-id="{{img.id}}" data-index="{{index}}">' +
      '<img src="{{img.src}}" alt="{{img.name}}" draggable="false">' +
      '<span class="dragndrop__item-name" draggable="false">{{img.name}}</span>' +
      '</div>'

    var variables = {
      '{{index}}': index,
      '{{img.id}}': data.id,
      '{{img.src}}': data.url,
      '{{img.name}}': data.name
    }

    template = template.replace(/{{img.src}}|{{img.name}}|{{img.id}}|{{index}}/gi, function (matched) {
      return variables[matched]
    })

    return template
  },

  update: function () {
    var output = this.render()
    this.Container.innerHTML = output
  },

  events: function () {
    this.Container.addEventListener('dragstart', this.dragStartHandler.bind(this))
    this.Container.addEventListener('drag', this.dragHandler)
    this.Container.addEventListener('dragend', this.dragEndHandler.bind(this))
    this.Container.addEventListener('drop', this.dropHandler.bind(this))
    this.Container.addEventListener('dragover', this.dragOverHandler)
  },

  dragStartHandler: function (e) {
    var item = e.target
    var moveFrom = e.path[1].getAttribute('data-ref')
    var dataIndex = parseInt(item.getAttribute('data-index'))

    var crt = e.target.cloneNode(true)
    crt.style.display = 'none'
    crt.style.visibility = 'hidden'
    document.body.appendChild(crt)
    e.dataTransfer.setDragImage(crt, 0, 0)

    e.dataTransfer.setData('moveFrom', moveFrom)
    e.dataTransfer.setData('item', JSON.stringify(this.data[moveFrom][dataIndex]))
    e.dataTransfer.setData('itemIndex', dataIndex)
  },

  dragHandler: function (e) {
    var item = e.target
    var width = item.offsetWidth
    var height = item.offsetHeight

    item.style.width = width + 'px'
    item.style.position = 'absolute'
    item.style.top = e.clientY - (height / 2) + 'px'
    item.style.left = e.clientX - (width / 2) + 'px'
    item.style.transform = 'rotate(5deg)'
    item.style.zIndex = 1000
    item.style.pointerEvents = 'none'
  },

  dragOverHandler: function (e) {
    var target = e.target.getAttribute('data-ref')
    if (target === 'dropzone') {
      e.preventDefault()
    } else if (target === 'repository') {
      e.preventDefault()
    }
  },

  dragEndHandler: function (e) {
    var item = e.target
    var moveFrom = e.path[1].getAttribute('data-ref')
    var dataIndex = parseInt(item.getAttribute('data-index'))

    item.style.width = ''
    item.style.position = ''
    item.style.top = ''
    item.style.left = ''
    item.style.transform = 'rotate(0)'
    item.style.zIndex = ''
    item.style.pointerEvents = ''

    e.dataTransfer.setData('moveFrom', moveFrom)
    e.dataTransfer.setData('item', JSON.stringify(this.data[moveFrom][dataIndex]))
    e.dataTransfer.setData('itemIndex', dataIndex)
  },

  dropHandler: function (e) {
    var moveFrom = e.dataTransfer.getData('moveFrom')
    var item = JSON.parse(e.dataTransfer.getData('item'))
    var itemIndex = e.dataTransfer.getData('itemIndex')
    var target = e.target.getAttribute('data-ref')
    var insertBeforeIndex = e.dataTransfer.getData('insertBeforeIndex')

    if (moveFrom !== target) {
      var data = this.data
      if (data[target] === undefined) {
        data[target] = []
      }
      data[target].push(item)
      data[moveFrom].splice(parseInt(itemIndex), 1)
      this.data = data
    }
    console.log(e)
    this.update()
  },

  render: function () {
    var template = '<div class="dragndrop__repository" data-ref="repository">{{repository.items}}</div>' +
      '<div class="dragndrop__dropzone" data-ref="dropzone">{{dropzone.items}}</div>'

    var variables = {
      '{{repository.items}}': this.data.repository.map(function (item, index) {
        return this.renderItem(item, index)
      }.bind(this)).toString().replace(/,/gi, ''),
      '{{dropzone.items}}': this.data.dropzone !== undefined ? this.data.dropzone.map(function (item, index) {
        return this.renderItem(item, index)
      }.bind(this)).toString().replace(/,/gi, '') : ''
    }

    template = template.replace(/{{repository.items}}|{{dropzone.items}}/gi, function (matched) {
      return variables[matched]
    })

    return template
  }
}
