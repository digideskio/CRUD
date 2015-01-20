// Generated by CoffeeScript 1.7.1

/*
vim:sw=2:ts=2:sts=2:
 */

(function() {
  var CRUDList,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (!window.Phifty) {
    window.Phifty = {};
  }

  Phifty.CRUD = {
    closeEditRegion: function(el) {
      var r;
      r = Region.of(el);
      if ($.scrollTo) {
        return $.scrollTo(r.getEl().parent(), 100, function() {
          return r.remove();
        });
      } else {
        return r.remove();
      }
    },
    initEditRegion: function($el, opts) {
      var actionOptions;
      $(document.body).trigger('phifty.region_load');
      opts = $.extend({
        removeRegion: true
      }, opts);
      if (opts.defaultTinyMCE) {
        use_tinymce('adv1');
      }
      actionOptions = $.extend({
        clear: false,
        onSuccess: function(resp) {
          var r, self;
          self = this;
          if (opts.removeRegion) {
            r = Region.of(self.form());
            if (r) {
              if (r.triggerElement) {
                Region.of(r.triggerElement).refresh();
              }
              return r.remove();
            }
          }
        }
      }, opts.actionOptions || {});
      return $el.find('.ajax-action').each(function(i, f) {
        var a;
        a = Action.form(f, actionOptions);
        if (opts.setupAction) {
          return opts.setupAction(a);
        }
      });
    }
  };


  /*
  
  To generate a image cover element with a hidden input of the primary key:
  
        coverView = new CRUDList.ImageItemView {
            deleteAction: "ProductBundle::Action::DeleteProductImage"
            relation: "images"
          }, { record json }
        coverView.appendTo( $('#productImages') )
  
  Which generates the input name with
  
          name="images[id]" value="{primary id}"
   */

  window.CRUDList = CRUDList = {};

  window.InputHelper = {};

  InputHelper.hiddenInput = function(name, val) {
    return $('<input/>').attr({
      type: 'hidden',
      name: name,
      value: val
    });
  };


  /*
   *
   * @data (hash): Contains anything you need.
   *
   * @uiSettings:
   *   label (string)
   *   labelBy (string)
   *
   * @config:
   *   new (boolean)
   *   primaryKey (string): for example, "id"
   *   relation (string): for example, "product_images"
   */

  CRUDList.NewBaseItemView = (function() {
    function NewBaseItemView(data, uiSettings, config) {
      this.data = data;
      this.uiSettings = uiSettings;
      this.config = config;
      this.config.primaryKey = this.config.primaryKey || "id";
    }

    NewBaseItemView.prototype.renderHiddenField = function($el, fieldName) {
      var index, pkId, val;
      pkId = this.data[this.config.primaryKey];
      val = this.data[fieldName];
      index = this.config.index ? this.config.index : pkId;
      if (!val) {
        return;
      }
      if (this.config.relation) {
        return $el.append(InputHelper.hiddenInput(this.config.relation + ("[" + index + "][" + fieldName + "]"), val));
      } else {
        return $el.append(InputHelper.hiddenInput(fieldName, val));
      }
    };

    NewBaseItemView.prototype.renderFields = function($el) {
      var k, v, _ref;
      _ref = this.data;
      for (k in _ref) {
        v = _ref[k];
        this.renderHiddenField($el, k);
      }
    };

    NewBaseItemView.prototype._render = function() {
      if (this.el) {
        return this.el;
      }
      this.el = this.render();
      return this.el;
    };

    NewBaseItemView.prototype.append = function(el) {
      return this._render().append(el);
    };

    NewBaseItemView.prototype.appendTo = function(target) {
      return this._render().appendTo($(target));
    };

    return NewBaseItemView;

  })();

  CRUDList.NewTextItemView = (function(_super) {
    __extends(NewTextItemView, _super);

    function NewTextItemView() {
      return NewTextItemView.__super__.constructor.apply(this, arguments);
    }

    NewTextItemView.prototype.render = function() {
      var $cover, config, data, label;
      config = this.config;
      data = this.data;
      label = this.uiSettings.label || this.data[this.uiSettings.labelBy] || "Untitled";
      $cover = AdminUI.createTag({
        label: label,
        onRemove: function(e) {
          if (config.deleteAction && data.id) {
            return runAction(config.deleteAction, {
              id: data.id
            }, {
              confirm: '確認刪除? ',
              remove: $cover
            });
          } else {
            return $cover.remove();
          }
        }
      });
      this.renderFields($cover);
      return $cover;
    };

    return NewTextItemView;

  })(CRUDList.NewBaseItemView);

  CRUDList.BaseItemView = (function() {

    /*
    @config: the config.create
     */
    function BaseItemView(config, data, crudConfig) {
      this.config = config;
      this.data = data;
      this.crudConfig = crudConfig;
      this.crudConfig || (this.crudConfig = {});
      this.config.primaryKey = this.config.primaryKey || "id";
    }

    BaseItemView.prototype.createHiddenInput = function(name, val) {
      return $('<input/>').attr({
        type: 'hidden',
        name: name,
        value: val
      });
    };

    BaseItemView.prototype.renderKeyField = function() {
      if (this.config.primaryKey && this.data[this.config.primaryKey]) {
        if (this.config.relation) {
          return this.createHiddenInput(this.config.relation + ("[" + this.data[this.config.primaryKey] + "][" + this.config.primaryKey + "]"), this.data[this.config.primaryKey]);
        } else {
          return this.createHiddenInput("id", this.data[this.config.primaryKey]);
        }
      }
    };

    BaseItemView.prototype.appendTo = function(target) {
      return this.render().appendTo($(target));
    };

    return BaseItemView;

  })();

  CRUDList.TextItemView = (function(_super) {
    __extends(TextItemView, _super);

    function TextItemView() {
      return TextItemView.__super__.constructor.apply(this, arguments);
    }

    TextItemView.prototype.render = function() {
      var $cover, config, data, _ref;
      config = this.config;
      data = this.data;
      $cover = AdminUI.createTextTag(data, {
        onClose: function(e) {
          if (config.deleteAction && data.id) {
            return runAction(config.deleteAction, {
              id: data.id
            }, {
              confirm: '確認刪除? ',
              remove: $cover
            });
          } else {
            return $cover.remove();
          }
        }
      });
      if ((_ref = this.renderKeyField()) != null) {
        _ref.appendTo($cover);
      }
      return $cover;
    };

    return TextItemView;

  })(CRUDList.BaseItemView);

  CRUDList.FileItemView = (function(_super) {
    __extends(FileItemView, _super);

    function FileItemView() {
      return FileItemView.__super__.constructor.apply(this, arguments);
    }

    FileItemView.prototype.render = function() {
      var $close, $cover, $keyField, config, data;
      config = this.config;
      data = this.data;
      $cover = AdminUI.createFileCover(data);
      $close = $('<div/>').addClass('close').click(function() {
        if (config.deleteAction && data.id) {
          return runAction(config.deleteAction, {
            id: data.id
          }, {
            confirm: '確認刪除? ',
            remove: $cover
          });
        } else {
          return $cover.remove();
        }
      });
      $close.appendTo($cover);
      $keyField = this.renderKeyField();
      if ($keyField != null) {
        $keyField.appendTo($cover);
      }
      return $cover;
    };

    return FileItemView;

  })(CRUDList.BaseItemView);

  CRUDList.ResourceItemView = (function(_super) {
    __extends(ResourceItemView, _super);

    function ResourceItemView() {
      return ResourceItemView.__super__.constructor.apply(this, arguments);
    }

    ResourceItemView.prototype.render = function() {
      var $cover, $keyField, config, data;
      config = this.config;
      data = this.data;
      $cover = AdminUI.createResourceCover(data, {
        onClose: function(e) {
          return runAction(config.deleteAction, {
            id: data[config.primaryKey]
          }, {
            confirm: '確認刪除? ',
            remove: this
          });
        }
      });
      $keyField = this.renderKeyField();
      if ($keyField != null) {
        $keyField.appendTo($cover);
      }
      return $cover;
    };

    return ResourceItemView;

  })(CRUDList.BaseItemView);

  CRUDList.ImageItemView = (function(_super) {
    __extends(ImageItemView, _super);

    function ImageItemView() {
      return ImageItemView.__super__.constructor.apply(this, arguments);
    }

    ImageItemView.prototype.render = function() {
      var $cover, $keyField, config, self;
      self = this;
      config = this.config;
      $cover = AdminUI.createImageCover({
        thumb: this.data.thumb,
        image: this.data.image,
        title: this.data.title,
        onClose: function(e) {
          return runAction(config.deleteAction, {
            id: self.data[config.primaryKey]
          }, {
            confirm: '確認刪除? ',
            remove: this
          });
        }
      });
      $keyField = this.renderKeyField();
      if ($keyField != null) {
        $keyField.appendTo($cover);
      }
      return $cover;
    };

    return ImageItemView;

  })(CRUDList.BaseItemView);


  /*
  
  CRUDList.init({
    title: "產品附圖",
    hint: "您可於此處上傳多組產品副圖",
    container: $('#product-images'),
    crudId: "product_image",
    itemView: CRUDList.ImageItemView,
    create: {
      deleteAction: "ProductBundle::Action::DeleteProductImage",
      relation: "images",
    }
  })
   */

  CRUDList.init = function(config) {
    var $container, $createBtn, $hint, $imageContainer, $title, itemViewClass;
    itemViewClass = config.itemView;
    if (config.dialogOptions === void 0) {
      config.dialogOptions = {
        width: 650
      };
    }
    $container = $(config.container);
    $imageContainer = CRUDList.createContainer();
    $createBtn = $('<input/>').attr({
      type: "button"
    }).val("新增" + config.title).addClass("button-s").css({
      float: "right"
    }).click(function(e) {
      var dialog;
      return dialog = new CRUDDialog("/bs/" + config.crudId + "/crud/dialog", {}, {
        dialogOptions: {
          width: config.dialogOptions.width
        },
        init: config.init,
        beforeSubmit: config.beforeSubmit,
        onSuccess: function(resp) {
          var coverView;
          if (itemViewClass) {
            coverView = new itemViewClass(config.create, resp.data, config);
            return coverView.appendTo($imageContainer);
          } else {
            return $.get("/bs/" + config.crudId + "/crud/item", {
              id: resp.data.id
            }, function(html) {
              return $container.append(html);
            });
          }
        }
      });
    });
    $title = $('<h3/>').text(config.title);
    $hint = $('<span/>').text(config.hint).addClass("hint");
    CRUDList.renderRecords($imageContainer, config.records, config);
    return $container.append($createBtn).append($title).append($hint).append($imageContainer);
  };

  CRUDList.createContainer = function() {
    return $('<div/>').addClass("clearfix item-container");
  };

  CRUDList.renderRecord = function($container, record, config) {
    var coverView, itemViewClass;
    if (!record) {
      return;
    }
    itemViewClass = config.itemView;
    coverView = new itemViewClass(config.create, record, config);
    return coverView.appendTo($container);
  };

  CRUDList.renderRecords = function($container, records, config) {
    var coverView, itemViewClass, record, _i, _len, _results;
    if (!records) {
      return;
    }
    itemViewClass = config.itemView;
    _results = [];
    for (_i = 0, _len = records.length; _i < _len; _i++) {
      record = records[_i];
      if (itemViewClass) {
        coverView = new itemViewClass(config.create, record, config);
        _results.push(coverView.appendTo($container));
      } else {
        _results.push($.get("/bs/" + config.crudId + "/crud/item", {
          id: record.id
        }, function(html) {
          return $container.append(html);
        }));
      }
    }
    return _results;
  };

}).call(this);
