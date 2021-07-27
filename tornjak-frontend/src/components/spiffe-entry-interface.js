import { Component } from 'react';

class SpiffeEntryInterface extends Component {
  getMillisecondsFromEpoch() {
    return new Date().getTime()
  }

  getAgentExpiryMillisecondsFromEpoch(entry) {
    if (typeof entry !== 'undefined') {
      return entry.x509svid_expires_at * 1000
    } else {
      return ""
    }
  }

  getEntryExpiryMillisecondsFromEpoch(entry) {
    if (typeof entry !== 'undefined' && typeof entry.expires_at !== 'undefined') {
      return entry.expires_at * 1000
    } else {
      return ""
    }
  }

  getEntryAdminFlag(entry) {
    if (typeof entry !== 'undefined' && typeof entry.admin !== 'undefined') {
      return entry.admin
    } else {
      return false
    }
  }

  getAgentSpiffeid(entry) {
    if (typeof entry !== 'undefined') {
      return "spiffe://" + entry.id.trust_domain + entry.id.path
    } else {
      return ""
    }
  }

  getEntrySpiffeid(entry) {
    if (typeof entry !== 'undefined') {
      return "spiffe://" + entry.spiffe_id.trust_domain + entry.spiffe_id.path
    } else {
      return ""
    }
  }

  getEntryParentid(entry) {
    if (typeof entry !== 'undefined') {
      return "spiffe://" + entry.parent_id.trust_domain + entry.parent_id.path
    } else {
      return ""
    }
  }

  getAgentStatusString(entry) {
    if (typeof entry !== 'undefined') {
      var banned = entry.banned
      var status = "OK"
      var expiry = this.getAgentExpiryMillisecondsFromEpoch(entry)
      var currentTime = this.getMillisecondsFromEpoch()
      if (banned) {
        status = "Banned"
      } else if (expiry > currentTime) {
        status = "Attested"
      }
      return status
    } else {
      return ""
    }
  }

}

export default SpiffeEntryInterface;
