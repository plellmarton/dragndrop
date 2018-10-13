function DragNDrop(Container, options) {
  this.Container
  this.Repository
  this.DropZone
  this.data
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
    this.Container.addEventListener('dragstart', function (e) {
      var item = e.target
      var moveFrom = e.path[1].getAttribute('data-ref')
      var dataIndex = parseInt(item.getAttribute('data-index'))

      e.dataTransfer.setData('moveFrom', moveFrom)
      e.dataTransfer.setData('item', JSON.stringify(this.data[moveFrom][dataIndex]))
      e.dataTransfer.setData('itemIndex', dataIndex)
    }.bind(this))

    this.Container.addEventListener('drop', function (e) {
      var moveFrom = e.dataTransfer.getData('moveFrom')
      var item = JSON.parse(e.dataTransfer.getData('item'))
      var itemIndex = e.dataTransfer.getData('itemIndex')
      var target = e.target.getAttribute('data-ref')

      if (moveFrom !== target) {
        var data = this.data
        if (data[target] === undefined) {
          data[target] = []
        }
        data[target].push(item)
        data[moveFrom].splice(parseInt(itemIndex), 1)
        console.log(parseInt(itemIndex))
        this.data = data
      }
      this.update()
    }.bind(this))

    this.Container.addEventListener('dragover', function (e) {
      var target = e.target.getAttribute('data-ref')
      if(target === 'dropzone') {
        e.preventDefault()
      } else if (target === 'repository') {
        e.preventDefault()
      }
    }.bind(this))
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