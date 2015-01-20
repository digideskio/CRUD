// Generated by CoffeeScript 1.7.1

/*
 * This is a basic wrapper library around bootstrap-modal javascript.
 *
 * The use case is inside DMenu:
 *
 *     sectionModal = Modal.create({
 *       title: if params.id then 'Edit Menu Section' else 'Create Menu Section'
 *       ajax: {
 *         url: '/dmenu/menu_section_form'
 *         args: params
 *         onReady: (e, ui) ->
 *           form = ui.body.find("form").get(0)
 *           Action.form form,
 *             status: true
 *             clear: true
 *             onSuccess: (data) ->
 *               ui.modal.modal('hide')
 *               setTimeout (->
 *                 self.refresh()
 *                 ui.modal.remove()
 *               ), 800
 *               options.onSave() if options and options.onSave
 *       }
 *       controls: [
 *         {
 *           label: 'Save'
 *           onClick: (e,ui) ->
 *             ui.body.find("form").submit()
 *         }
 *       ]
 *     })
 *     $(sectionModal).modal('show')
 *
 */

(function() {
  window.Modal = {};

  window.Modal.ajax = function(url, args, opts) {};

  window.Modal.create = function(opts) {
    var body, closeBtn, content, controlOpts, dialog, eventPayload, footer, header, modal, _fn, _i, _len, _ref;
    modal = document.createElement('div');
    modal.classList.add('modal');
    dialog = document.createElement('div');
    dialog.classList.add('modal-dialog');
    content = document.createElement('div');
    content.classList.add('modal-content');
    header = document.createElement('div');
    header.classList.add('modal-header');
    closeBtn = $('<button/>').attr('type', 'button').addClass('close');
    closeBtn.append($('<span/>').html('&times;'));
    closeBtn.append($('<span/>').addClass('sr-only').text('Close'));
    closeBtn.appendTo(header);
    closeBtn.click(function(e) {
      return $(modal).modal('hide');
    });
    if (opts.title) {
      $('<h4/>').text(opts.title).addClass('modal-title').appendTo(header);
    }
    body = document.createElement('div');
    body.classList.add('modal-body');
    footer = document.createElement('div');
    footer.classList.add('modal-footer');
    eventPayload = {
      modal: $(modal),
      body: $(body),
      header: $(header)
    };
    if (opts.controls) {
      _ref = opts.controls;
      _fn = (function(_this) {
        return function(controlOpts) {
          var $btn;
          $btn = $('<button/>').text(controlOpts.label).addClass('btn');
          if (controlOpts.primary) {
            $btn.addClass('btn-primary');
          }
          if (controlOpts.onClick) {
            $btn.click(function(e) {
              return controlOpts.onClick(e, eventPayload);
            });
          }
          if (controlOpts.close) {
            $btn.click(function(e) {
              $(modal).modal('hide');
              if (controlOpts.onClose) {
                return controlOpts.onClose(e, eventPayload);
              }
            });
          }
          return $btn.appendTo(footer);
        };
      })(this);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        controlOpts = _ref[_i];
        _fn(controlOpts);
      }
    }
    content.appendChild(header);
    content.appendChild(body);
    content.appendChild(footer);
    dialog.appendChild(content);
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    if (opts.ajax && opts.ajax.url) {
      jQuery.get(opts.ajax.url, opts.ajax.args || {}, function(html) {
        body.innerHTML = html;
        if (opts.ajax.onReady) {
          return opts.ajax.onReady(null, eventPayload);
        }
      });
    }
    return modal;
  };


  /*
  Modal test code
  
  $ ->
    testModal = Modal.create {
      title: 'Test Modal'
      controls: [
        { label: 'Test', primary: true, onClick: (e, ui) -> console.log(e, ui) }
        { label: 'Close', primary: true, close: true, onClose: (e, ui) -> console.log(e, ui) }
      ]
    }
    $(testModal).modal('show')
   */

}).call(this);