
function do_favorite_choice (ev) {
  var target = $(ev.target);
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
  $("#fda-meters").selectize(fda_opts).trigger('change');
  var begin = Date.create('30 minutes ago');
  var end = Date.create('5 minutes from now');
  var control = slippy($('.when-control'),
    { controls: $('.when-input')
    , begin: begin
    , end: end
  } );

});
