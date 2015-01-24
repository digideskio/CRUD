// Generated by CoffeeScript 1.7.1

/* 
vim:sw=2:ts=2:sts=2:

Bulk Operation API

New BulkCRUD:

    productBulk = new BulkCRUD({
            container: $('#crud-list')
            menu: $('#menu')
            namespace: 'ProductBundle'
            model: 'Product'
    })
    productBulk.selectAll()
    productBulk.unselectAll()
    productBulk.runAction(...)

    productBulk.addPlugin new DeletePlugin(....)
    productBulk.addPlugin new CopyPlugin(....)
 */

(function() {
  var BulkCRUD;

  BulkCRUD = (function() {
    function BulkCRUD() {}

    BulkCRUD.prototype.handlers = {};

    BulkCRUD.prototype.init = function(config) {
      var self;
      this.config = config;
      this.container = this.config.container;
      this.table = this.config.table;
      this.menu = this.config.menu;
      this.namespace = this.config.namespace;
      this.model = this.config.model;
      this.table.on("click", "tbody tr", function(e) {
        var el;
        el = $(this).find('input[name="selected[]"]');
        if (el.attr('checked')) {
          $(this).removeClass('selected');
          el.removeAttr('checked');
        } else {
          el.attr('checked', 'checked');
          $(this).addClass('selected');
        }
        return e.stopPropagation();
      });
      this.table.on("click", 'tbody input[name="selected[]"]', function(e) {
        e.stopPropagation();
        if ($(this).attr('checked')) {
          return $(this).parents("tr").addClass('selected');
        } else {
          return $(this).parents("tr").removeClass('selected');
        }
      });
      this.table.on("click", ".select-all", (function(_this) {
        return function() {
          return _this.toggleSelect();
        };
      })(this));
      this.table.on("click", ".record-edit-btn", function(e) {
        var id, section;
        id = $(this).data("record-id");
        section = $(this).parents(".section").get(0);
        e.stopPropagation();
        return Region.before(section, $(this).data("edit-url"), {
          id: id
        }, this);
      });
      this.table.on("click", ".record-delete-btn", function(e) {
        var id;
        e.stopPropagation();
        if (!$(this).data("delete-action")) {
          console.error("data-delete-action undefined");
        }
        id = $(this).data("record-id");
        return runAction($(this).data("delete-action"), {
          id: id
        }, {
          confirm: "確認刪除? ",
          removeTr: this
        });
      });
      this.menu.empty();
      this.menu.append($('<option/>'));
      self = this;
      return this.menu.change(function() {
        var $select, handler, val;
        $select = $(this);
        val = $(this).val();
        handler = self.handlers[val];
        if (handler) {
          handler.call(self, $select);
        }
        return $select.find('option').first().attr('selected', 'selected');
      });
    };

    BulkCRUD.prototype.getSelectedItems = function() {
      return this.container.find('input[name="selected[]"]:checked');
    };

    BulkCRUD.prototype.getSelectedItemValues = function() {
      return this.getSelectedItems().map(function(i, e) {
        return parseInt(e.value);
      }).get();
    };

    BulkCRUD.prototype.unselectAll = function() {
      this.container.find('.select-all').val(0).removeAttr('checked');
      this.container.find('input[name="selected[]"]').removeAttr('checked');
      return this.table.find('tbody tr').removeClass('selected');
    };

    BulkCRUD.prototype.selectAll = function() {
      this.container.find('.select-all').val(1).attr('checked', 'checked');
      this.container.find('input[name="selected[]"]').attr('checked', 'checked');
      return this.table.find('tbody tr').addClass('selected');
    };

    BulkCRUD.prototype.toggleSelect = function() {
      if (this.container.find('.select-all').val() === "1") {
        return this.unselectAll();
      } else {
        return this.selectAll();
      }
    };

    BulkCRUD.prototype.sendAction = function(action, params, cb) {
      params = $.extend({
        action: action,
        "__ajax_request": 1
      }, params);
      return $.ajax({
        url: '/bs',
        type: 'post',
        data: params,
        dataType: 'json',
        success: cb
      });
    };


    /*
     * Run bulk action on the selected items.
     *
     * @param actionName short action name
     */

    BulkCRUD.prototype.runBulkAction = function(action, extraParams, callback) {
      var fullActionName;
      fullActionName = this.namespace + '::Action::Bulk' + action + this.model;
      return this.runAction(fullActionName, extraParams, callback);
    };

    BulkCRUD.prototype.runAction = function(fullActionName, extraParams, callback) {
      var items, params;
      items = this.getSelectedItemValues();
      params = $.extend({
        items: items
      }, extraParams);
      return this.sendAction(fullActionName, params, callback);
    };

    BulkCRUD.prototype.addMenuItem = function(op, label, cb) {
      var option;
      this.handlers[op] = cb;
      option = $('<option/>').text(label).val(op);
      this.menu.find('[value="' + op + '"]').remove();
      this.menu.append(option);
      return option.data('handler', cb);
    };

    BulkCRUD.prototype.addPlugin = function(plugin) {
      return plugin.register(this);
    };

    return BulkCRUD;

  })();

  window.BulkCRUD = BulkCRUD;

  window.BulkCRUDDeletePlugin = (function() {
    function BulkCRUDDeletePlugin() {}

    BulkCRUDDeletePlugin.prototype.register = function(bulk) {
      return bulk.addMenuItem('delete', '刪除', (function(_this) {
        return function(btn) {
          if (confirm("確定刪除 ?")) {
            return bulk.runBulkAction('Delete', {}, function(result) {
              if (result.success) {
                $.jGrowl(result.message);
                return Region.of(bulk.table).refresh();
              } else {
                return $.jGrowl(result.message, {
                  theme: 'error'
                });
              }
            });
          }
        };
      })(this));
    };

    return BulkCRUDDeletePlugin;

  })();

  window.BulkCRUDCopyPlugin = (function() {
    function BulkCRUDCopyPlugin() {}

    BulkCRUDCopyPlugin.prototype.register = function(bulk) {
      return bulk.addMenuItem('copy', '複製...', function(btn) {
        var $langsel, content, label, lang, languages, runbtn;
        content = $('<div/>');
        languages = {
          '': '--為新語言--',
          en: '英文',
          zh_TW: '繁體',
          ja: '日文',
          zh_CN: '簡體'
        };
        $langsel = $('<select/>');
        for (lang in languages) {
          label = languages[lang];
          $langsel.append(new Option(label, lang));
        }
        runbtn = $('<input/>').attr({
          type: 'button'
        }).val('複製');
        runbtn.click(function() {
          return bulk.runBulkAction('Copy', {
            lang: $langsel.val()
          }, function(result) {
            if (result.success) {
              $.jGrowl(result.message);
              return setTimeout((function() {
                Region.of(bulk.table).refreshWith({
                  page: 1
                });
                return content.dialog('close');
              }), 800);
            } else {
              return $.jGrowl(result.message, {
                theme: 'error'
              });
            }
          });
        });
        return content.attr({
          title: '複製'
        }).append($langsel).append(runbtn).dialog();
      });
    };

    return BulkCRUDCopyPlugin;

  })();

  window.bulkCRUD = new BulkCRUD();

}).call(this);