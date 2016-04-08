
function get_vendors (res, query) {
  var results = [ ];
  if (res) {
    res.forEach(function iter (item) {
      item.spec = item.term + ' ::: ';
      item.name = '';
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
      // sub.spec = item.registration.name + " ::: " + name;
      sub.spec = query.vendor + " ::: " + name;
      sub.name = name;
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
  , labelField: 'spec'
  , searchField: 'spec'
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
      search.vendor = parts[0].trim( );
      search.name = parts[1].trim( );
      if (search.vendor.length) {
        url = url + '/' + encodeURIComponent(search.vendor);
      }
      if (search.name.length) {
        url = url + '/' + encodeURIComponent(search.name);
      }
      get_payload = get_meters;
    }
    /*
    if (!query.length) get_payload = get_vendors;
    var vendor = query.split('/')[0].trim( );
    var rest = query.split('/').slice(1).join('/');

    var url = '/fda/smbg';
    if  (vendor && query.split('/').length > 1) {
      url = url + '/' + encodeURIComponent(vendor)
    } else {
      console.log("SEARCHING VENDORS");
      get_payload = get_vendors;
    }
    if (rest) {
      console.log("SEARCHING REST");
      // url = url + '/' + encodeURIComponent(rest)
      // get_payload = get_meters;
    }
    */
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
  $("#fda-meters").selectize(fda_opts).trigger('change');

});
