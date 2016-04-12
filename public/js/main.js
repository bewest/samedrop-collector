

function do_ajax_form (ev) {
  var target = $(ev.target);
  ev.preventDefault( );
  // ev.stopPropagation( );
  var params = target.serialize( );
  var opts = {
    data: params
  , url: target.attr('action')
  , method: target.attr('method')
  , context: target
  };

  $.ajax(opts).done(function ( ) {
    console.log("WOW", arguments);
    target.trigger('form-submit-done', [].slice.call(arguments));
  });
  console.log(params);

  return false;
}

function needs_new_meter (ev) {
  var target = $(ev.target);
  console.log("HMM?", ev.type, target);
  $('#find-meter').modal('show');
}
function finished_saving_favorite (ev, results, status) {
  switch (status) {
    case 'success':
      $('#find-meter').modal('hide');
      $("#pairsinsertion").trigger('reload');
      break;
    default:
      console.log("should not happen");
      break;
  }

}

function do_favorite_choice (ev) {
  var target = $(ev.target);
  if (target.is('.empty')) {
  }
  console.log('ev', ev.type, target, ev);
}

function get_vendors (res, query) {
  var results = [ ];
  if (res) {
    res.forEach(function iter (item) {
      item.spec = item.term + ' ::: ';
      item.name = '';
      item.label = item.term;
      item.description = item.count;
      item.by = item.count;
      results.push(item);

    });
  }
  return results;
}

function get_meters (res, query) {
  var results = [ ];
  if (res.results)
  res.results.forEach(function iter (item) {
    item.proprietary_name.forEach(function (name) {
      var sub = Object.create(item);
      sub.name = name;
      // console.log(item.registration);
      // sub.spec = item.registration.name + " ::: " + name;
      // sub.spec = item.registration.registration_number + " ::: " + name;
      sub.spec = query.vendor + " ::: " + name;
      // sub.label = item.registration.name + " ::: " + name;
      sub.label = query.vendor + " ::: " + name;
      results.push(sub);
    });
  });
  return results;
}
$(document).ready(function() {

  // Place JavaScript code here...
  var skel = $('.skeleton-option>div').clone(true);

  $("SELECT.selectize").each(function ( ) {
    var el = $(this);
    var opts = { };
    el.selectize(opts);
  });
  var fda_opts = {
    valueField: 'spec'
  , labelField: 'label'
  , searchField: 'spec'
  , plugins: [ 'restore_on_backspace']
  , create: false
  , render: {
    option: function (item, escape) {
      var dom = skel.clone(true);
      dom.find('.name').text(item.name);
      dom.find('.spec').text(item.spec);
      // console.log("GAH", item);
      if (item.term) {
        dom.find('.by').text(item.count);
      } else {
        dom.find('.by').text(item.registration.name);
        dom.find('.description').text(item.name + item.spec);
      }
      return dom.html( )
    }
  }
  // , score: function (search) { }
  , load: function (query, callback) {
    var get_payload = get_vendors;

    // if (!query.length) return callback( );
    var parts = query.split(':::');
    var search = { };
    var url = '/fda/smbg';
    if (parts.length == 1) {
      url = '/fda/meter-vendors';
      search.vendor = parts[0].trim( );
      if (search.vendor.length) {
        url = url + '/' + encodeURIComponent(search.vendor);
      }
      get_payload = get_vendors;
    }
    if (parts.length == 2) {
      url = '/fda/smbg';
      search.vendor = parts[0].trim( )
        .replace(/[.,]/g, '')
        .replace(/ /g, '+');
      search.name = parts[1].trim( );
      if (search.vendor.length) {
        url = url + '/' + search.vendor;
      }
      if (search.name.length) {
        url = url + '/' + encodeURIComponent(search.name);
      }
      get_payload = get_meters;
    }

    url = url + '?limit=40';
    console.log("SEARCH", url);
    $.ajax({
      url: url
    , type: 'GET'
    , error: function () {
      callback( );
    }
    , success: function (res) {
      var results = [ ];
      console.log(res);
      results = get_payload(res, search);
      callback(results);
    }
    });
  }
  };
  $(".per-meter").on('focus', '.meter-chooser', do_favorite_choice);
  $("#pairsinsertion").on('focus', '.empty.per-meter :input', needs_new_meter);
  $("#fda-meters").selectize(fda_opts).trigger('change');
  var begin = Date.create('30 minutes ago');
  var end = Date.create('5 minutes from now');
  var when = $('.when-control');
  if (when.is('.when-control')) {
  var control = slippy(when,
    { controls: $('.when-input')
    , begin: begin
    , end: end
  } );
  }

  $('[data-ajax-target]').each(function iter () {
    var el = $(this);
    function notify ( ) {
      $(this).trigger('loaded', [].slice.call(arguments));
    }
    function reload ( ) {
      var url = el.data('ajax-target');

      $.ajax({
        url: url
      , context: el
      }).done(notify);
    }
    el.on('reload', reload);
    reload( );

  });

  var root_pairs = d3.select('#pairsinsertion');
  var empty = { required: true, spec: '', empty: true };
  var none = [ empty, empty ];
  var required = root_pairs.selectAll('DIV.per-meter.required').data(none);
  $('#pairsinsertion').on('loaded', function (ev, favorites) {
    var pairs = $('.per-meter'); // .remove( );
    var clone = $('.per-meter.skeleton#test_template').clone(true).removeClass('skeleton').removeClass('hidden').attr('id', null);
    //  pairs.get(0)).clone(true);
    clone.find('select').find('OPTION.favorite').remove( );
    favorites.forEach(function (fave) {
      var opt = $("<OPTION/>").addClass('favorite').attr('value', fave.spec).text(fave.spec);
      console.log(opt);
      clone.find('select').append(opt);
      
    });
    
    var pivot = $(ev.target);
    // d3.select(
    var root = d3.select(pivot.get(0));
    var extra = [ empty ];
    if (favorites.length < 2) {
      console.log('2 extra', favorites.length);
      extra = [ empty, empty ];
    }
    // var head = favorites.slice(0, 2).concat([empty, empty]).slice(0, 2);
    var head = favorites.concat(extra)
    head.forEach(function (item, i) {
      item._id = i.toString( ) + "_" + item.spec;
    });
    var required = root_pairs.selectAll('DIV.per-meter').data(head, function (d) { return d._id; });
    // required.data(head);
    // required = required.data(head)
    // var foo = required.selectAll('.per-meter.required').data(head);
    // required.enter( ).append('DIV').html(function (datum, idx) {
    required.enter( ).append(function (datum, idx) {
      // var temp = $("<div />").append(clone.clone(true ));
      console.log('APPEND', this, datum, idx);
      var temp = clone.clone(true);
      if (datum.spec) {
        temp.find('INPUT.v.in.spec').val(datum.spec);
        temp.find('INPUT.v.in.serial').val(datum.serial);
        /*
        var opts = temp.find('SELECT OPTION').slice(idx+1)[0];
        if (opts) {
          temp.find('SELECT').val($(opts).val( ));
        }
        */
      } else {
        temp.addClass('empty');
      }
      // console.log("APPEND", opts, this, arguments);
      // return d3.select(temp).datum(datum)[0];
      // return $("<div />").append(temp).html( );
      return temp.get(0);
    }).each(function (data, idx) {

      d3.select(this).classed('empty', data.empty);
      if (!data.empty) {
        d3.select(this).select('.v.glucose.in').attr('tabindex', idx+2);
      } else {
        $('#pairs').find('button:submit').attr('tabindex', idx+2);
      }
      // if (data.required && data.empty) { }
      console.log('each', this, 'data', data, idx);
      // d3.select(this).classed('per-meter', true);
    });
    /*
    required.transition( ).duration(800).each(function (data, idx) {

      console.log('transition', this, 'data', data, idx);
    });
    */
    required
      // .data(head, function (d) { return d.spec; })
      .exit( )
      .each(function (data, idx) {
        console.log('exit?', this);
        d3.select(this).classed('removed', true);
      });
    /*
    */
    // var tail = favorites.slice(2);
    // favorites.forEach(function (fave, n) { });
    console.log('favorites', head);

  });

  $('#pairsinsertion').on('change', '.per-meter select', function (ev, favorites) {
    var target = $(ev.target);
    console.log("changed", target, target.val( ));
  });

  $('FORM.ajax-form').on('submit', do_ajax_form);
  $('#find-meter').on('form-submit-done', 'FORM', finished_saving_favorite);
  $('#find-meter').on('shown.bs.modal', function ( ) {
    $(this).find('.meter-finder')[0].selectize.focus( );
  });

  $('.when-input').on('change', function (ev) {
    var target = $(ev.target);
    console.log('zzz', target.val( ));
  });
});

