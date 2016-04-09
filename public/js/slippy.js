
function slippy (dom, opt) {

  var svg = { };
  var chart;
  var container;
  var scales = { x: { }, y: { } };
  var dom_width, dom_height, width, height;
  var scaleExtent = [ 0, 200 ];
  var cursor;
  var zoomer;

  var margin = {top: 0, right: 50, bottom: 0, left: 50};
  // get_dimensions( );


  function frame ( ) {
    get_dimensions( );
    var range = frame.getRange( );

    // var width = dom.width( );
    // var height = dom.height( );
    svg.attr('width', dom_width)
       // .attr('height', height - margin.right - margin.left)
       ;

    var begin = scales.x.invert(0);
    var end = scales.x.invert(width);

    if (end > Date.create('10 minutes from now')) {

      console.log('too far in future');
      return;
    }
    if (begin < d3.time.day.offset(end, -7)) {
      console.log('too far in past');
      return;
    }
    range = frame.setRange(begin, end);
    // var delta = moment(begin).from(moment(end));
    // console.log(Date.create(end));
    var delta = Date.create(end).relative( );
    // .replace(' ago', '');
    var mid = cursor.select('.cursor-mid-point');
    var pos = parseFloat(mid.attr('x1'));
    var current = scales.x.invert(pos);
    opt.controls.val(current.format(Date.ISO8601_DATETIME));
    // opt.controls.find('.begin-input').val(delta);
    // opt.controls.find('.end-input').val(end.format(Date.ISO8601_DATETIME));
    // opt.controls.data('range', {begin: begin, end: end});
    // console.log(width, height, delta)

    // console.log(opt);
    chart.select(".x.axis").call(frame.xAxis);
    dom.trigger('refocus', [range, frame]);

  }

  frame.getRange = function _getRange ( ) {
    return [frame.begin, frame.end];
  }

  frame.setRange = function _setRange (begin, end) {
    frame.begin = Date.create(begin);
    frame.end = Date.create(end);
    return frame.getRange( );
  }

  function get_dimensions( ) {
    dom_width = dom.width( );
    margin = {top: 20, right: 50, bottom: 20, left: 50};
    width = dom_width - margin.left - margin.right;
    dom_height = dom.height( );
    height = dom_height - margin.top - margin.bottom;
  }

  function init ( ) {
    get_dimensions( );
    var begin = opt.begin || opt.controls.find('INPUT.begin-input').val( );
    var end = opt.end || opt.controls.find('INPUT.end-input').val( );
    var range = frame.setRange(begin, end);
    // var width = dom.width( );
    // var height = dom.height( );
    svg = d3.select(dom.get(0)).append('svg')
      .attr('class', 'slippy-chart')
      .attr('height', dom_height)
      ;
       ;
    chart = svg.append('g')
      .attr('class', 'widget')
      .attr("tranform", "translate(" + 0 + ", " + margin.top + ")")
      ;
    scales.x = d3.time.scale( )
      .domain(range)
      .nice(d3.time.minute)
      .rangeRound([0, dom.width( )])
      ;
    scales.y = d3.scale.log( )
      .domain([ 0, 400 ])
      // .rangeRound([1, dom.height( )])
      .rangeRound([1, dom.height( )])
      ;
    frame.xAxis = d3.svg.axis( )
        .scale(scales.x)
        .ticks(7)
        .tickSize(12, 1, 1)
        ;
    chart.append("g")
      .attr("transform", "translate(" + 0 + ", " + (margin.top) + ")")
      .attr("class", "x axis")
      .call(frame.xAxis)
      ;

    var cursor_spec = {
      width: width * .10
    , height: dom_height
    , x: width * 2/3
    , y: 0
    };
    cursor = chart.append("g")
      .attr("transform", "translate(" + 0 + ", " + (0) + ")")
      .attr("class", "current-cursor")
      ;
    cursor.append("rect")
        .attr("class", "cursor")
        .attr("x", cursor_spec.x)
        .attr("y",  cursor_spec.y)
        .attr("width", cursor_spec.width)
        .attr("height", cursor_spec.height)

    cursor.append("line")
        .attr("class", "cursor-mid-point")
        .attr("x1", cursor_spec.x + (cursor_spec.width * .5))
        .attr("y1", 0)
        .attr("x2", cursor_spec.x + (cursor_spec.width * .5))
        .attr("y2", dom_height)
      ;
    zoomer = d3.behavior.zoom( )
      .x(scales.x)
      .scaleExtent(scaleExtent)
      .on('zoom', frame);
      ;
    svg.call(zoomer);

    // frame.setRange(begin, end);
    opt.controls.on('change', 'INPUT', refocus);
    frame( );
    $(window).on('resize', resize);
    return frame;
  }

  function adjust_sizes (ev) {
    get_dimensions( );
    scales.x
      .rangeRound([0, dom.width( )])
      ;
    scales.y
      .rangeRound([1, dom.height( )])
      ;
    chart.selectAll('.x.axis')
      .call(frame.xAxis)
  }

  function resize (ev) {
    adjust_sizes(ev);
    frame( );
  }

  function refocus (ev) {
    var target = $(ev.target);
    if (target.is('INPUT')) {
      var begin = opt.controls.find('INPUT.begin-input').val( );
      var end = opt.controls.find('INPUT.end-input').val( );
      var range = frame.setRange(begin, end);
    }
    scales.x.domain(range)
      .nice(d3.time.week)
      ;
    frame( );
  }

  return init( );
  // return frame;
}


function manager (view, data, opts) {

  // var colorize = d3.scale.category20b( );
  var colorize = d3.scale.ordinal( )
    .domain([0, 10])
    .range(colorbrewer.Set3[10]);
  var templates = opts.templates;
  var item_opts = opts.item_opts || { };
  var pools = [ ];
  var master = { };
  var cache = opts.cache || cached({ });
  function manage ( ) {
  }

  function init ( ) {
    rows = view.find('.reticle');
    if (rows.length > 0) {
    } else {
      var item = make({ });
      pools.push(item);
    }
    view.on('refocus', '.reticle', on_refocus);
    return manage;
  }

  function make (data) {
    var item = templates.find('.reticle').clone(true);
    var pool = templates.find('.pool').clone(true);
    var end = data.end || Date.create('now').format(Date.ISO8601_DATETIME);
    var begin = data.begin || Date.create(end).rewind({weeks: 6}).format(Date.ISO8601_DATETIME);
    view.find('.ranges').append(item);
    view.find('.observations').append(pool);
    var control = slippy(item.find('.timeline'),
      { controls: item.find('.controls')
      , begin: begin
      , end: end
    } );
    var reticle =  {dom: item, control: control};
    var color = colorize(pools.length);
    var lense = ranger(pool, {color: color, begin: begin, end: end, cache: cache});
    var display =  { dom: pool, control: lense };
    reticle.dom.find('.timeline').css('border', '1px solid ' + color);
    display.dom.css('border-color', color);
    reticle.dom.find("span, :input").css('color', color);
    // reticle.dom.find(".x.axis line").('styl', color);
    var axis = d3.select(reticle.dom.get(0)).selectAll('.x.axis');
    axis.selectAll('line').style('stroke', color);
    axis.selectAll('path').style('stroke', color);
    axis.selectAll('text').style('color', color);
    return { reticle: reticle, display: display, color: color };
  }

  function on_refocus (ev, range) {
    var target = $(ev.target);
    var pool = pools.filter(function (pool) {
      var timeline = pool.reticle.dom.find('.timeline');
      return timeline.is(target);
    }).pop( );
    if (pool) {
      pool.display.control.setRange(range[0], range[1]);
    }
  }

  function add_new ( ) {
    var item = make({ });
    pools.push(item);
  }

  manage.add_new = add_new;

  return init( );
}

function pager (opts) {
  var query = { };
  var url = opts.url || '/api/v1/entries.json?find[type]=sgv&find[sgv][$gt]=39&count=500000&';
  query.begin = opts.begin;
  query.end = opts.end;
  var payload = [ ];
  var days = { };
  var cache = opts.cache;
  var DATE_FMT = "{yyyy}-{MM}-{dd}";

  var bisect = d3.bisector(function (d) { return Date.create(d.dateString); });
  function page ( ) {
  }

  function refresh (start, end) {
    // console.log("PAYLOAD?", payload);
    var q = {
      start: Date.create(Date.create(start).format(DATE_FMT))
    , end: Date.create(Date.create(end).format(DATE_FMT))
    };
    query.begin = start;
    query.end = end;
    var range = d3.time.days(q.start, q.end);
    days = { };
    console.log('QUERY FOR', range.length, 'days', q, query);
    iter_query(range);
    return;
    if (payload && payload.length > 0) {
      console.log("NUM DAYS", range.length);
      // TODO: soft update, only get deltas against the edges of the
      // cursor.
      // start.isBefore
      // start.isBetween
      // start.isAfter
      // end.isBefore
      // end.isBetween
      // end.isAfter
      var holding = {
          begin: Date.create(payload[0].dateString)
        , last:  Date.create(payload.slice(-1).pop( ).dateString)
      }
      console.log("BISECT LEFT start", bisect.left(payload, { dateString: start }));
      console.log("BISECT LEFT end", end, bisect.right(payload, { dateString: end }));
      do_query(start, end, first_page);
    } else {
      do_query(start, end, first_page);
    }
    query.begin = start;
    query.end = end;
  }

  function param_string (begin, end) {
    return [
      "find[dateString][$gte]=" + Date.create(begin).format(DATE_FMT)
    , "find[dateString][$lte]=" + Date.create(end).format(DATE_FMT)
    ].join('&')
  }

  function iter (prev, current, index, tail) {
  }

  function iter_query (range) {
    payload = [ ];
    range.forEach(function (day, i) {
      var start = day;
      var end = d3.time.day.offset(start, 1);
      var data = cache.within(start, end);
      if (data.length < 10) {
        do_query(start, end, function _iter_ (resp) {
          days[Date.create(day).format(DATE_FMT)] = true;
          collate(resp);
        });
      } else {
        days[Date.create(day).format(DATE_FMT)] = true;
        payload = payload.concat(data);
        if (Object.keys(days).length >= range.length) {
          do_payload( );
        }
      }
    });

  }

  function accrue (begin, end, cb) {
    var q = {
      start: Date.create(Date.create(start).format(DATE_FMT))
    , end: Date.create(Date.create(end).format(DATE_FMT))
    };
    var range = d3.time.days(q.start, q.end);
    if (range.length > 3) {
      var half = range.length / 2;
      var head = range.slice(0, half);
      var tail = range.slice(half);
      // head.reduce(iter, { });
      // tail.reduce(iter, { });
    }
  }

  function collate (resp) {
    console.log('payload', payload.length, 'resp', resp.length);
    payload = payload.concat(resp);
    cache.add(resp);
    payload.sort(cmp_dateString);
    var range = d3.time.days(query.start, query.end);
    if (Object.keys(days).length >= range.length) {
      do_payload( );
    }
  }

  function cmp_dateString (a, b) {
    return a.dateString > b.dateString;
  }

  function do_query (begin, end, cb) {
    var range = d3.time.days(Date.create(begin), Date.create(end));
    var fetch = url + param_string(begin, end);
    console.log('QUERY FOR', range.length, 'days', query, fetch);
    $.getJSON(fetch, cb);
  }
  
  function first_page (resp) {
    // console.log('resp', resp);
    payload = resp;
    do_payload( );
  }

  function do_payload ( ) {
    if (opts.callback && opts.callback.call) {
      opts.callback(payload);
    } else {
      // console.log(payload);
    }
  }

  function init ( ) {
    if (query.begin && query.end) {
      refresh(query.begin, query.end);
      // do_query(query.begin, query.end, first_page);
    }
    page( );
    return page;
  }

  page.refresh = refresh;

  return init( );
}

function time_in_range (data, opts) {
  var range = {
    high: 180
  , low: 80
  };

  function sgv (d) { return d.sgv; }
  function is_clean (d) { return sgv(d) > 39; }
  function is_in_range (d) { return sgv(d) >= range.low && sgv(d) <= range.high; }
  function is_high (d) { return sgv(d) > range.high; }
  function is_low (d) { return sgv(d) < range.low; }
  var results = [ ];
  var days = d3.nest( )
      .key(function (d) {
        return  Date.create(d.dateString).format('{yyyy}-{MM}-{dd}')
      } )
      .rollup(function (leaves) {
        var clean = leaves.filter(is_clean);
        var nominal = clean.filter(is_in_range);
        var highs = clean.filter(is_high);
        var lows = clean.filter(is_low);
        return {
          length: clean.length
        , color: opts.color || '#eee'
        , target: nominal.length / clean.length * 100
        , highs: highs.length / clean.length * 100
        , lows: lows.length / clean.length * 100
        , mean: d3.mean(clean, sgv)
        , median: d3.median(clean, sgv)
        };
      } )
    .entries(data);
    ;
  return days;
}

