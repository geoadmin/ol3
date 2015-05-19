goog.provide('ga.style');
goog.provide('ga.style.StylesFromLiterals');


goog.require('ol.geom.Point');
goog.require('ol.geom.MultiPoint');
goog.require('ol.geom.LineString');
goog.require('ol.geom.MultiLineString');
goog.require('ol.geom.Polygon');
goog.require('ol.geom.MultiPolygon');
goog.require('ol.style.AtlasManager');
goog.require('ol.style.Style');
goog.require('ol.style.Fill');
goog.require('ol.style.Stroke');
goog.require('ol.style.Circle');
goog.require('ol.style.Text');
goog.require('ol.style.Icon');
goog.require('ol.style.RegularShape');


goog.require('ga');


ga.style = {};
ga.style.StylesFromLiterals = function(properties) {
  var olStyle;

  this.singleStyle = null;

  this.styles = {
    point: {},
    line: {},
    polygon: {}
  };

  this.type = properties.type;

  if (this.type === 'unique' || this.type === 'range') {
      this.key = properties.property;
  }

  if (this.type === 'single') {
    olStyle = this.getOlStyleFromLiterals_(properties);
    this.singleStyle = olStyle;
  } else if (this.type === 'unique') {
    var values = properties.values;
    for (var i = 0; i < values.length; i++) {
      var value = values[i];
      olStyle = this.getOlStyleFromLiterals_(value);
      this.styles[value.geomType][value.value] = olStyle;
    }
  } else if (this.type === 'range') {
    var ranges = properties.ranges;
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      olStyle = this.getOlStyleFromLiterals_(range);
      var key = range.range.toLocaleString();
      this.styles[range.geomType][key] = olStyle;
    }
  }
};


ga.style.StylesFromLiterals.prototype.getFeatureStyle = function(feature) {
  var getGeomTypeFromGeometry = function(olGeometry) {
    if (olGeometry instanceof ol.geom.Point ||
        olGeometry instanceof ol.geom.MultiPoint) {
      return 'point';
    } else if (olGeometry instanceof ol.geom.LineString ||
        olGeometry instanceof ol.geom.MultiLineString) {
      return 'line';
    } else if (olGeometry instanceof ol.geom.Polygon ||
        olGeometry instanceof ol.geom.MultiPolygon) {
      return 'polygon';
    }
  };

  if (this.type === 'single') {
    return this.singleStyle;
  } else if (this.type === 'unique') {
    var properties = feature.getProperties();
    var value = properties[this.key];
    var geomType = getGeomTypeFromGeometry(
      feature.getGeometry()
    );
    return this.styles[geomType][value];
  } else if (this.type === 'range') {
    var properties = feature.getProperties();
    var value = properties[this.key];
    var geomType = getGeomTypeFromGeometry(
      feature.getGeometry()
    );
    return this.findOlStyleInRange_(value, geomType);
  }
};


ga.style.StylesFromLiterals.prototype.findOlStyleInRange_ = function(value, geomType) {
  var olStyle, range;
  for (range in this.styles[geomType]) {
    range = range.split(',');
    if (value >= parseFloat(range[0]) &&
        value <= parseFloat(range[1])) {
      var style = this.styles[geomType][range];
      olStyle = style;
      break;
    }
  }
  return olStyle;
};


ga.style.StylesFromLiterals.prototype.getOlStyleForPoint_ = function(options, shape) {
  if (shape === 'circle') {
    return new ol.style.Circle(options);
  } else if (shape === 'icon') {
    return new ol.style.Icon(options);
  } else {
    var shapes = {
      square: {
        points: 4,
        angle: Math.PI / 4
      },
      triangle: {
        points: 3,
        rotation: Math.PI / 4,
        angle: 0
      },
      star: {
        points: 5,
        angle: 0
      },
      cross: {
        points: 4,
        angle: 0
      }
    };
    var style = {};
    for (var key in shapes[shape]) {
      style[key] = shapes[shape][key];
    }
    for (var key in options) {
      style[key] = options[key];
    }
    return new ol.style.RegularShape(style);
  }
};


ga.style.StylesFromLiterals.prototype.getOlBasicStyles_ = function(options) {
  var olStyles = {};
  for (var type in options) {
    var style = options[type];
    if (type === 'stroke') {
      olStyles[type] = new ol.style.Stroke(style);
    } else if (type === 'fill') {
      olStyles[type] = new ol.style.Fill(style);
    } else if (type === 'text') {
      olStyles[type] = new ol.style.Text(style);
    }
  };
  return olStyles;
};


ga.style.StylesFromLiterals.prototype.getOlStyleFromLiterals_ = function(value) {
  var k;
  var olStyles = {};
  var style = value.vectorOptions;
  var geomType = value.geomType;
  if (geomType === 'point') {
      style = {
        image: style
      };
  }
  for (var key in style) {
    var olStyle = {};
    if (key === 'image') {
      var styleP = style[key];
      var options = this.getOlBasicStyles_(styleP);
      var opts = {};
      for (k in styleP) {
        opts[k] = styleP[k];
      }
      for (k in options) {
        opts[k] = options[k];
      }
      olStyle = this.getOlStyleForPoint_(opts, styleP.type);
      olStyles[key] = olStyle;
    } else {
      for (k in olStyle) {
        olStyles[k] = olStyle[k];
      }
      var basicStyles = this.getOlBasicStyles_(style);
      for (k in basicStyles) {
        olStyles[k] = basicStyles[k];
      }
    }
  };
  return new ol.style.Style(olStyles);
};
