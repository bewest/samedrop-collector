
var express = require('express');
var request = require('request');
var querystring = require('querystring');

var FDA = {
  registrations: 'https://api.fda.gov/device/registrationlisting.json?'
, smbg: {
  regulation: '862.1345'
, product_code: 'CGA'
  }
};

/*

https://open.fda.gov/api/status/
https://open.fda.gov/device/event/
https://open.fda.gov/api/reference/#authentication

https://open.fda.gov/device/registrationlisting/

https://api.fda.gov/device/registrationlisting.json?search=products.openfda.regulation_number:862.1345+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:%22over+the+counter%22&limit=1000&skip=0&count=registration.name.exact

https://api.fda.gov/device/registrationlisting.json
  ?search=
    products.openfda.regulation_number:862.1345
    +AND+
    products.openfda.device_name:glucose
    +AND+
    products.openfda.device_name:%22over+the+counter%22
  &limit=1000
  &skip=0
  &count=registration.name.exact

https://api.fda.gov/device/registrationlisting.json?search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=registration.name.exact

https://api.fda.gov/device/registrationlisting.json
  ?
    search=
      products.openfda.regulation_number:862.1345
      +AND+
      products.product_code:CGA
      +AND+
      products.openfda.device_name:glucose
      +AND+
      products.openfda.device_name:"over+the+counter"&limit=1000&skip=0&count=registration.name.exact

https://api.fda.gov/device/registrationlisting.json?search=products.openfda.regulation_number:862.1345+AND+products.product_code:CGA+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=registration.name.exact

2047  curl -s "https://api.fda.gov/device/registrationlisting.json?search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=proprietary_name.exact" | json results | json -a term count
2048  curl -s "https://api.fda.gov/device/registrationlisting.json?search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=proprietary_name.exact" | json -a results
2049  curl -s "https://api.fda.gov/device/registrationlisting.json?search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=proprietary_name.exact" | json results
2050  curl -g -s "https://api.fda.gov/device/registrationlisting.json?search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=proprietary_name.exact" | json
2051  curl -v  -g -s "https://api.fda.gov/device/registrationlisting.json?search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=proprietary_name.exact" | json
2052  curl -v  -g -s "https://api.fda.gov/device/registrationlisting.json?api_key=EExARXWI4Cl9YVL0zhSqXgkiVfE2a3appP9Xb8Wf&search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=proprietary_name.exact" | json
2053  curl -k -v  -g -s "https://api.fda.gov/device/registrationlisting.json?api_key=EExARXWI4Cl9YVL0zhSqXgkiVfE2a3appP9Xb8Wf&search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=proprietary_name.exact" | json
2054  curl -k -v  -g -s "https://api.fda.gov/device/registrationlisting.json?api_key=EExARXWI4Cl9YVL0zhSqXgkiVfE2a3appP9Xb8Wf&search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=proprietary_name.exact" | json | json -a term count
2055  curl -k   -g -s "https://api.fda.gov/device/registrationlisting.json?api_key=EExARXWI4Cl9YVL0zhSqXgkiVfE2a3appP9Xb8Wf&search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=proprietary_name.exact" | json | json term count
2056  curl -k   -g -s "https://api.fda.gov/device/registrationlisting.json?api_key=EExARXWI4Cl9YVL0zhSqXgkiVfE2a3appP9Xb8Wf&search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=proprietary_name.exact" | json | json -A term count
2057  curl -k   -g -s "https://api.fda.gov/device/registrationlisting.json?api_key=EExARXWI4Cl9YVL0zhSqXgkiVfE2a3appP9Xb8Wf&search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=proprietary_name.exact" | json results | json -a term count
2058  curl -k   -g -s "https://api.fda.gov/device/registrationlisting.json?api_key=EExARXWI4Cl9YVL0zhSqXgkiVfE2a3appP9Xb8Wf&search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=proprietary_name.exact" | json results | json -a term count | wc -l
2059  curl -k   -g -s "https://api.fda.gov/device/registrationlisting.json?api_key=EExARXWI4Cl9YVL0zhSqXgkiVfE2a3appP9Xb8Wf&search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=proprietary_name.exact" | json results | json -a term count | tee meter-names
2060  cat meter-names | sort
2061  curl -k -s -g "https://api.fda.gov/device/registrationlisting.json?search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=registration.name.exact" | json results | json -a term count | tee meter-vendors
2062  curl -k -s -g "https://api.fda.gov/device/registrationlisting.json?search=products.openfda.regulation_number:862.1345+AND+products.product_code=CGA+AND+registration.iso_country_code=US+AND+products.openfda.device_name:glucose+AND+products.openfda.device_name:over+the+counter&limit=1000&skip=0&count=registration.name.exact" | json results | json -a term count | sort | tee meter-vendors

*/

function empty_list (req, res, next) {
  res.json([]);
  next( );
}

function fda_init_spec (req, res, next) {
  var api_key = process.env.OPENFDA_KEY;
  req.fda = { search: [ ], api_key: api_key };
  if (req.query.skip) {
    req.fda.skip = req.params.skip;
  }
  req.fda.limit = 10;
  if (req.query.limit) {
    req.fda.limit = req.query.limit;
  }
  // req.fda.search.push( )
  var frags =   [ ''
    , 'products.openfda.regulation_number:862.1345'
    , '+AND+'
    , 'products.openfda.device_name:glucose'
    , '+AND+'
    , 'products.openfda.device_name:"over+the+counter"'
    ];
  req.fda.search = req.fda.search.concat(frags);
  next( )
}

function fda_vendor_name_spec (req, res, next) {
  next( )
}

function fda_device_name_spec (req, res, next) {
  next( )
}

function count_vendors_spec (req, res, next) {
  var params = {
    // blah: 'count=registration.name.exact'
    count: 'registration.name.exact'
  };
  req.fda.count = params.count;
  next( );
}

function query_fda (req, res, next) {
  var url = FDA.registrations;
  // var qs = { search: req.fda.search.join('') };
  var qs = { };
  if (req.fda.count) {
    qs.count = req.fda.count;
  }
  if (req.fda.skip) {
    qs.skip = req.fda.skip;
  }
  if (req.fda.api_key) {
    qs.api_key = req.fda.api_key;
  }
  if (req.fda.limit) {
    qs.limit = req.fda.limit;
  }
  if (req.fda_vendor) {
    req.fda.search.push('+AND+registration.firm_name:"'+ req.fda_vendor + '"');
  }
  if (req.fda_meter_name) {
    req.fda.search.push('+AND+proprietary_name:"'+ req.fda_meter_name + '"');
  }

  var url = url + querystring.stringify(qs);
  var search =  req.fda.search.join('');
  var options = {url: url + '&search=' + search,  json: true};
  console.log('QUERY', options);
  request.get(options, function (e, r, data) {
    res.fda = data;
    next(e);
  });
}

function fmt_vendor_links (req, res, next) {
  var vendors = [ ];
  res.fda.results.forEach(function iter(item) {
    // item.url = req.url + '/' + encodeURIComponent(item.term);
    item.url = req.path + '/' + item.term.replace(/ /g, '+').replace(/[,.]/g, '');
    vendors.push(item);
  });
  res.json(vendors);
  next( );
}
function fmt_fda_resp (req, res, next) {
  res.json(res.fda);
  next( );
}

exports.routes = function routes (master) {
  var app = express( );

  app.get('/smbg', fda_init_spec, count_vendors_spec, query_fda, fmt_vendor_links);

  app.param('vendor', function (req, res, next, attr) {
    req.fda_vendor = attr;
    // prep vendor query
    next( );
  });
  app.get('/smbg/:vendor', fda_init_spec, query_fda, fmt_fda_resp);

  app.param('attr', function (req, res, next, attr) {
    next( );
  });

  app.get('/smbg/vendors/:attr', fda_init_spec, empty_list);
  return app;

}
