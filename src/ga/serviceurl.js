goog.provide('ga.ServiceUrl');

/**
 * @type {string}
 */
ga.serviceurl_ = '';

/**
 * Set service Url
 * @param {string} url, the url
 * @todo api
 */
ga.setServiceUrl = function(url) {
  ga.serviceurl_ = url;
};

/**
 * Get service Url
 * @todo api
 */
ga.getServiceUrl = function() {
  return ga.serviceurl_;
};

