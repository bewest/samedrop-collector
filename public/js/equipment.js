function delete_eq (ev) {
  var target = $(ev.target);
  var prefix = '/my/equipment/list/';
  var nick = target.closest('.group').find('.nick').text( );
  console.log('nick', nick);
  var url = prefix + encodeURIComponent(nick);
  var csrf = $('META[name="csrf-token"]').attr('content');
  $.ajax({
    url: url
  , method: 'DELETE'
  , data: { _csrf: csrf }
  , context: target
  }).done(function (ev, status) {
    console.log('DEETED??', this, arguments);
    if (status == 'success') {
      $('.inventory').trigger('reload');
    }
  });
}

function save_field ( ) {
  console.log('save?', $(this).data('editable'), arguments);

}

function populate_inventory (ev, eq, status) {
  console.log("GOT", status, eq);
  var root = d3.select(this);
  var rows = root.selectAll('DIV.group').data(eq);
  var temp = $('.wrapped .group-template').clone(true).removeClass('group-template').addClass('group');

  rows.enter( ).append(function (datum, i) {
    var dom = temp.clone(true);
    return dom.get(0);
  }).classed('uninitialized', true)
    .each(function (datum, i) {
      var dom = $(this);
  });

  rows.transition( )
    .each(function (datum, i) {
      var dom = $(this);
      var prefix = '/my/equipment/list/' + encodeURIComponent(datum.nick);
      dom.find('.name').text(datum.spec);
      for (var f in datum) {
        var selector = ".v." + f;
        var fields = dom.find(selector);
        var value = datum[f];
        fields.filter(':input').not(":checkbox, :radio").val(value);
        fields.filter('DIV, SPAN, A, H1, H2, H3, H4, H5, H6').text(value);
        fields.filter('.x-editable').each(function ( ) {
          $(this).data('url', prefix + '/' + f)
                 .data('name', 'value')
                 .data('pk', encodeURIComponent(f));
          ;
        });

        }
        if (dom.is('.uninitialized')) {
          dom.find('.x-editable').editable( );
          dom.removeClass('uninitialized');
        }
    });

  rows.exit( ).transition( ).duration(500).style('opacity', 0).remove( );

}

$(document).ready(function() {
  $.fn.editable.defaults.mode = 'inline';
  var csrf = $('META[name="csrf-token"]').attr('content');
  $.fn.editable.defaults.ajaxOptions = {type: 'PUT'};
  $.fn.editable.defaults.params = function add_csrf (params) {
    params._csrf = csrf
    return params;
  };
  $.fn.editable.defaults.name = 'value';
  $.fn.editableform.buttons = $('#editable .buttonstemplate');
    
  $('.editable').editable( );
  $('.inventory').on('loaded', populate_inventory);

  $('.inventory .x-editable').on('save',  save_field);
  $('.inventory').on('click', '.delete-eq',  delete_eq);

  // url = '/fda/meter-vendors';
  // var url = '/fda/smbg';
  function customTokens (data) {
    var tokers = [ ];
    console.log("TOKE", data);
    if (data.spec)
    tokers = tokers.concat(Bloodhound.tokenizers.whitespace(data.spec));
    if (data.products) {
      for (var x=0; x< data.products.length; x++) {
      tokers = tokers.concat(Bloodhound.tokenizers.whitespace(data.products[x]));
      }
    }
    return tokers;
  };
  function polish (resp) {
        var results = resp.results;
        console.log("REC", resp);
        if (resp.meta && resp.results)
        return resp.results;
        if (!resp.error && resp.length) {
          $.each(resp, function (i, item) {
            item.spec = item.term + ' ::: ';
            return item;
          });
          return resp;
        }
        return [ ];

  }
  function customSource (q, sync, async) {
    console.log('QQQ', q, sync, async);
    return findMeters.search(q, async);
  }

/*
  $('#eq-editor .typeahead').typeahead({
    hint: true
  , highlight: true
  , minLength: 0
  }, {
    name: 'meters'
  , source: findMeters
  , display: 'complete'
  });

*/
  function finished_saving (ev, results, status) {
    if (status == 'success') {
      $('.inventory').trigger('reload');
    }
  }
  $('#eq-editor').on('form-submit-done', 'FORM', finished_saving);

});
