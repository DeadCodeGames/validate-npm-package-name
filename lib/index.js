'use strict'
const { builtinModules: builtins } = require('module')

var scopedPackagePattern = new RegExp('^(?:@([^/]+?)[/])?([^/]+?)$')
var blacklist = [
  'node_modules',
  'favicon.ico',
]

function validate (name) {
  var warnings = []
  var errors = []

  if (name === null) {
    errors.push('name cannot be null')
    return done(warnings, errors)
  }

  if (name === undefined) {
    errors.push('name cannot be undefined')
    return done(warnings, errors)
  }

  if (typeof name !== 'string') {
    errors.push('name must be a string')
    return done(warnings, errors)
  }

  if (!name.length) {
    errors.push('name length must be greater than zero')
  }

  if (name.match(/^\./)) {
    errors.push('name cannot start with a period')
  }

  if (name.match(/^_/)) {
    errors.push('name cannot start with an underscore')
  }

  if (name.trim() !== name) {
    errors.push('name cannot contain leading or trailing spaces')
  }

  // No funny business
  blacklist.forEach(function (blacklistedName) {
    if (name.toLowerCase() === blacklistedName) {
      errors.push(blacklistedName + ' is a blacklisted name')
    }
  })

  // Generate warnings for stuff that used to be allowed

  // core module names like http, events, util, etc
  if (builtins.includes(name.toLowerCase())) {
    warnings.push(name + ' is a core module name')
  }

  if (name.length > 214) {
    warnings.push('name can no longer contain more than 214 characters')
  }

  // mIxeD CaSe nAMEs
  if (name.toLowerCase() !== name) {
    warnings.push('name can no longer contain capital letters')
  }

  if (/[~'!()*]/.test(name.split('/').slice(-1)[0])) {
    warnings.push('name can no longer contain special characters ("~\'!()*")')
  }

  if (encodeURIComponent(name) !== name) {
    // Maybe it's a scoped package name, like @user/package
    var nameMatch = name.match(scopedPackagePattern)
    if (nameMatch) {
      var user = nameMatch[1]
      var pkg = nameMatch[2]
      if (encodeURIComponent(user) === user && encodeURIComponent(pkg) === pkg) {
        return done(warnings, errors)
      }
    }

    errors.push('name can only contain URL-friendly characters')
  }

  return done(warnings, errors)
}

function fixName(name, isScope) {
  if (typeof name !== 'string') return null; // Cannot fix non-string names

  // Trim whitespace
  name = name.trim().replace(/(\s+)/g, '-');

  // Remove leading periods and underscores
  name = isScope ? name.replace(/^\.+/, '') : name.replace(/^\.+/, '').replace(/^_+/, '');

  // Replace special characters with hyphens
  name = name.replace(/[~'!()*]/g, '-');

  // Ensure lowercase
  name = name.toLowerCase();

  // Ensure no blacklisted names
  if (blacklist.includes(name)) {
    name = name + '-pkg';
  }

  // Truncate if too long
  if (name.length > 214) {
    name = name.slice(0, 214);
  }

  // Check if it is a scoped package
  var match = name.match(scopedPackagePattern);
  var hasMatch = match[1] && match[2]
  console.log(match)
  if (hasMatch) {
    const user = fixName(match[1].replace(/[^a-z0-9-_]/g, '-'), true) ? encodeURIComponent(match[1]) : null;
    const pkg = fixName(match[2].replace(/[^a-z0-9-_]/g, '-')) ? encodeURIComponent(match[2]) : null;
    if (user && pkg) {
      return `@${user}/${pkg}`;
    }
  }

  // Ensure URL-friendly characters
  return encodeURIComponent(name).replace(/%/g, '');
}

var done = function (warnings, errors) {
  var result = {
    validForNewPackages: errors.length === 0 && warnings.length === 0,
    validForOldPackages: errors.length === 0,
    warnings: warnings,
    errors: errors,
  }
  if (!result.warnings.length) {
    delete result.warnings
  }
  if (!result.errors.length) {
    delete result.errors
  }
  return result
}

module.exports = {validate, fixName}
