The CDN API provides for multiple use cases, ranging from bad actor targeting scenarios to security enhancement ruleset options.

## General Usage Guidelines

When defining API methods, keep the following in mind:

-   POST methods can return a **409 Conflict** response status code when a call encounters an existing rule with the same **type** and **action**.<br/><br/>
-   Making changes to rules using the PUT method overwrites existing values. When updating a rule using the PUT method, make sure to include all desired values in a list payload, not just the values you want to change.

## Access Control Usage Guidelines

When configuring access control rules, keep the following in mind:

-   When specifying more than one IP address or Country Code value in an allowlist or blocklist, include them all in a single payload. This practice ensures that you do not issue more calls than necessary when a rule is employed.<br/><br/>
-   You can specify any two-letter combination as a Country Code. However, the API recognizes only valid Country Codes in ISO 3166-1 alpha-2 (two-letter code) format. For more information, see the International Organization for Standardization (ISO) [3166 Country Code page](https://www.iso.org/iso-3166-country-codes.html).<br/><br/>
-   Regardless of their use, any Country Codes for countries embargoed or sanctioned by the United States remain blocked. For more information, see the US Department of Commerce [Bureau of Industry and Security page](https://www.bis.doc.gov/index.php/policy-guidance/country-guidance/sanctioned-destinations).
-   Make sure that any IP addresses that you include in Business Manager eCDN allowlists do not contradict IP Access or Regional Access deny rule settings in the CDN API.

    **Note:** Allowlist settings in Business Manager override any contradicting rules in the CDN API.

-   IP and Regional access rules execute in a specific order: 1) embargoed countries (no override due to platform compliance), 2) IP access lists in Business Manager, 3) CDN API IP access deny lists, 4) CDN API Regional Access allowlists, and 5) any customer-requested IP or Regional blocking by Salesforce.

    **Note:** Following any configured allowlist rules, we block all remaining traffic.

## Access Control Usage Examples

When defining IP Access or Regional Access control rules, how the rules are applied depends on rule preferences, rule execution order, and whether other rules exist. Some examples include:

-   If you allow an IP address from a specific region, but create a rule that blocks the region, the IP address is denied because Regional _blocklists_ take precedence.<br/><br/>
-   If you first create a rule to block all IP addresses in a region, but then create a rule that allows that region, all traffic from that region remains blocked because the API evaluates the IP blocklist _first_.<br/><br/>
-   If you create an allowlist of IP addresses, and you do not create any other rules, all other IP addresses, that is, those not included in the allowlist, are blocked.<br/><br/>
-   If you create a rule to _allow_ multiple regions, all traffic from all other regions, that is, any regions not included in your Regional Access rule, are blocked.

## CDN Stacking

The CDN API can enforce that all traffic navigates through a third-party proxy into the eCDN before accessing the B2C Commerce infrastructure. In the following use case, an architect wants to stack another, third-party CDN, or any cloud proxy, in front of the Commerce Cloud eCDN and leverage features of that third-party proxy.

### Create a New CDN Stacking Rule

To create a new CDN stacking rule, use the following method:

`POST /organizations/{organizationId}/zone/{zoneId}/firewall/rules`

Example body:

```
{
   "zoneId": "e4288c0a1f80fa5490b598d74c69bde4",
   "type": "ip",
   "action": "allowlist",
   "values": ["123.123.0.0/16", "123.123.0.1/16", "123.124.127.0/24"]
 }
```

### Update a CDN Stacking Rule

To update an existing CDN stacking rule, use the following method to obtain the specific rule ID that you want to update:

`GET /organizations/{organizationId}/zone/{zoneId}/firewall/rules`

Include the rule ID in the following method to update the rule:

`PUT /organizations/{organizationId}/zone/{zoneId}/firewall/rules/{ruleId}`

Example body:

```
{
   "zoneId": "e4288c0a1f80fa5490b598d74c69bde4",
   "type": "ip",
   "action": "allowlist",
   "values": ["123.123.0.0/16", "123.123.0.1/16", "123.124.127.0/24", "123.123.12.20"]
 }
```

## IP Access Control

The API provides the ability to use a blacklist to deny specific CIDR or IP addresses. The API can prevent known bad actors from accessing the storefront as they attempt to harm or access your web application.

### Create a New Access Control Rule

To create a new access control rule, use the following method:

`POST /organizations/{organizationId}/zone/{zoneId}/firewall/rules`

Example body:

```
{
   "zoneId": "e4288c0a1f80fa5490b598d74c69bde4",
   "type": "ip",
   "action": "blocklist",
   "values": ["123.123.0.0/16", "123.123.0.1/16", "123.124.127.0/24"]
 }
```

### Update an Access Control Rule

To update an existing access control rule, use the following method to obtain the specific rule ID that you want to update:

`GET /organizations/{organizationId}/zone/{zoneId}/firewall/rules`

Include the rule ID in the following method to update the rule:

`PUT /organizations/{organizationId}/zone/{zoneId}/firewall/rules/{ruleId}`

Example body:

```
{
   "zoneId": "e4288c0a1f80fa5490b598d74c69bde4",
   "type": "ip",
   "action": "blocklist",
   "values": ["123.123.0.0/16", "123.123.0.1/16", "123.124.127.0/24", "123.123.12.20"]
 }
```

## Region Access Control

The API provides the ability to block or allow traffic from specific countries. The API can ensure that only certain countries can access a storefront. In the following use case, a security-conscious eCom director wants to limit orders to within the United Kingdom, and disallow orders from outside of this region.

**Note:** By creating an allowlist that contains specific regions, you implicitly block traffic from all other regions not specified.

### Create a New Region Access Control Rule

To create a new access control rule, use the following method:

`POST /organizations/{organizationId}/zone/{zoneId}/firewall/rules`

Example body:

```
{
   "zoneId": "e4288c0a1f80fa5490b598d74c69bde4",
   "type": "country",
   "action": "allowlist",
   "values": ["UK"]
 }
```

### Update a Region Access Control Rule

To update an existing access control rule, use the following method to obtain the specific rule ID that you want to update:

`GET /organizations/{organizationId}/zone/{zoneId}/firewall/rules`

Include the rule ID in the following method to update the rule:

`PUT /organizations/{organizationId}/zone/{zoneId}/firewall/rules/{ruleId}`

Example body:

```
{
   "zoneId": "e4288c0a1f80fa5490b598d74c69bde4",
   "type": "ip",
   "action": "blocklist",
   "values": ["123.123.0.0/16", "123.123.0.1/16", "123.124.127.0/24", "123.123.12.20"]
 }
```

## Site Testing

To test changes before pushing to a production instance, you can create a custom hostname for your Development instance.

## Application Firewall Rule Enhancements

Company security teams want to safeguard their storefront against a landscape in which application attacks continually change. In this use case, the API enables the team to address existing attack vectors, and provides protections against new vulnerabilities as Salesforce updates the ruleset. To enable Salesforce to manage these rulesets for you, you can use “Default” as the action in the API.

**Note:** The API updates each rule individually, and reports back if an error occurs. However, when using the ruleset group method to change an action, we recommend that you check that all rules update appropriately as a best practice. If you determine that a rule was updated inappropriately, you can rerun the group change.

When turning on a Web Application Firewall (WAF) group, we recommend the following general process:

1. Put the group in monitor mode for 7 days.<br/><br/>
2. Check logs for any triggered WAF events.<br/><br/>
3. Check that the WAF rule would stop bad actors properly, or if any WAF rules were triggered incorrectly.<br/><br/>
4. Change the group to default mode.<br/><br/>
5. Check the default setting for any rules triggered over the monitoring period, and adjust as necessary. For example, if the default setting for a triggered rule is “monitor,” change the rule setting to “challenge” or “block”.

### Turn a WAF Group On in Monitor Mode

To update an existing access control rule, use the following method to obtain the specific rule ID that you want to update:

`GET /organizations/{organizationId}/zones/{zoneId}/waf/groups`

Include the group ID in the following method to turn on the group, and place it in **monitor** mode:

`PUT /organizations/{organizationId}/zones/{zoneId}/waf/groups/{groupId}`

Example body:

```
{
   "action": "monitor",
   "mode": "on"
}
```

### Check WAF Rule Settings

Use the following method to obtain a list of all WAF rules, and locate the rule ID of the rule that you want to check:

`GET /organizations/{organizationId}/zones/{zoneId}/waf/rules`

Include the rule ID in the following method to view information specific to the rule:

`GET /organizations/{organizationId}/zones/{zoneId}/waf/rules/{ruleId}`

### Set a WAF Group to Default Mode

Use the following method to obtain a list of all WAF groups, and locate the group ID of the group that you want to set to default mode:

`GET /organizations/{organizationId}/zones/{zoneId}/waf/groups`

Include the group ID in the following method to turn on the group, and place it in **default** mode:

`PUT /organizations/{organizationId}/zones/{zoneId}/waf/groups/{groupId}`

Example body:

```
{
   "action": "default",
   "mode": "on"
}
```

### Modify a WAF Rule

Use the following method to obtain a list of all WAF rules in a WAF group, and locate the rule ID of the rule that you want to modify:

`GET /organizations/{organizationId}/zones/{zoneId}/waf/rules`

Include the rule ID in the following method to modify the rule:

`PUT /organizations/{organizationId}/zones/{zoneId}/waf/rules/{ruleId}`

Example body:

```
{
   "action": "challenge"
 }
```

## Brotli Compression

Brotli is a compression algorithm developed by Google. Developed to decrease the size of transmissions, and best used for text compression, Brotli compression is applied intelligently for large files to reduce downloaded bytes to the browser and improve site performance.

Use the following method to obtain the current state of the API speed settings:

`GET /organizations/{organizationId}/zones/{zoneId}/speed-settings`

To modify the Brotli compression setting:

`PATCH /organizations/{organizationId}/zones/{zoneId}/speed-settings`

Example body:

```
{
   "brotliCompression": "on"
 }
```

## HTTP/2 Prioritization

HTTP/2 is a major revision of the HTTP network protocol. When enabled, HTTP/2 is used on supporting browsers to decrease latency and improve browser page load speed.

Use the following method to obtain the current state of the API speed settings:

`GET /organizations/{organizationId}/zones/{zoneId}/speed-settings`

To modify the HTTP/2 prioritization setting:

`PATCH /organizations/{organizationId}/zones/{zoneId}/speed-settings`

Example body:

```
{
   "http2Prioritization": "on"
}
```

## Rule Firing Investigation

Using the WAF eCDN logs in Business Manager, you can view which firewall rules are firing. By knowing the rule ID, you can use the CDN API endpoints to obtain context and details about why a specific rule is firing for a given HTTP request.

## Enabling Or Disabling OCAPI Caching for product resources

Customers who are using the OCAPI product resources endpoint can enable (or disable) 
caching at the CDN layer in the following manner. Once the customer has determined the zone 
in which the caching needs to be enabled, they can call the following endpoint. 

`PATCH /organizations/{organizationId}/zones/{zoneId}/ocapicachingpagerule`

Example body:

```
{
   "enableOCAPICachingPageRule": true
}
```
Value of `enableOCAPICachingPageRule` needs to be `true` in case it needs to be enabled 
and `false` in case it needs to be disabled.

## Purge cache for OCAPI product resources cached at the CDN layer.
Customers who have enabled the Caching of OCAPI Product resources have the ability to purge 
the cache by using the below utility endpoint. 

`POST /organizations/{organizationId}/zones/{zoneId}/cachepurge`

Example body:

```
{
   "path" : "www.salesforce.com/dw/shop/v21_3/products"
}
```

The pattern of the `path` attribute would usually follow the storefront hostname followed 
by the path of the OCAPI product resource.

## Upload Certificate
Customers have the ability to upload a SSL certificate associated with a specific hostname
by using the following endpoint.

`POST /{organizationId}/zones/{zoneId}/certificates`

Example body:

```
{
    "hostname": "www.salesforce.com",
    "certificate": "-----BEGIN CERTIFICATE-----\nMIIDtTCCAp2gAwIBAgIJAMHAwfXZ5/PWMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV\nBAYTAkFVMRMwEQYDVQQIEwpTb21lLVN0YXRlMSEwHwYDVQQKExhJbnRlcm5ldCBX\naWRnaXRzIFB0eSBMdGQwHhcNMTYwODI0MTY0MzAxWhcNMTYxMTIyMTY0MzAxWjBF\nMQswCQYDVQQGEwJBVTETMBEGA1UECBMKU29tZS1TdGF0ZTEhMB8GA1UEChMYSW50\nZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB\nCgKCAQEAwQHoetcl9+5ikGzV6cMzWtWPJHqXT3wpbEkRU9Yz7lgvddmGdtcGbg/1\nCGZu0jJGkMoppoUo4c3dts3iwqRYmBikUP77wwY2QGmDZw2FvkJCJlKnabIRuGvB\nKwzESIXgKk2016aTP6/dAjEHyo6SeoK8lkIySUvK0fyOVlsiEsCmOpidtnKX/a+5\n0GjB79CJH4ER2lLVZnhePFR/zUOyPxZQQ4naHf7yu/b5jhO0f8fwt+pyFxIXjbEI\ndZliWRkRMtzrHOJIhrmJ2A1J7iOrirbbwillwjjNVUWPf3IJ3M12S9pEewooaeO2\nizNTERcG9HzAacbVRn2Y2SWIyT/18QIDAQABo4GnMIGkMB0GA1UdDgQWBBT/LbE4\n9rWf288N6sJA5BRb6FJIGDB1BgNVHSMEbjBsgBT/LbE49rWf288N6sJA5BRb6FJI\nGKFJpEcwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgTClNvbWUtU3RhdGUxITAfBgNV\nBAoTGEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZIIJAMHAwfXZ5/PWMAwGA1UdEwQF\nMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAHHFwl0tH0quUYZYO0dZYt4R7SJ0pCm2\n2satiyzHl4OnXcHDpekAo7/a09c6Lz6AU83cKy/+x3/djYHXWba7HpEu0dR3ugQP\nMlr4zrhd9xKZ0KZKiYmtJH+ak4OM4L3FbT0owUZPyjLSlhMtJVcoRp5CJsjAMBUG\nSvD8RX+T01wzox/Qb+lnnNnOlaWpqu8eoOenybxKp1a9ULzIVvN/LAcc+14vioFq\n2swRWtmocBAs8QR9n4uvbpiYvS8eYueDCWMM4fvFfBhaDZ3N9IbtySh3SpFdQDhw\nYbjM2rxXiyLGxB4Bol7QTv4zHif7Zt89FReT/NBy4rzaskDJY5L6xmY=\n-----END CERTIFICATE-----\n",
    "privateKey": "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAwQHoetcl9+5ikGzV6cMzWtWPJHqXT3wpbEkRU9Yz7lgvddmG\ndtcGbg/1CGZu0jJGkMoppoUo4c3dts3iwqRYmBikUP77wwY2QGmDZw2FvkJCJlKn\nabIRuGvBKwzESIXgKk2016aTP6/dAjEHyo6SeoK8lkIySUvK0fyOVlsiEsCmOpid\ntnKX/a+50GjB79CJH4ER2lLVZnhePFR/zUOyPxZQQ4naHf7yu/b5jhO0f8fwt+py\nFxIXjbEIdZliWRkRMtzrHOJIhrmJ2A1J7iOrirbbwillwjjNVUWPf3IJ3M12S9pE\newooaeO2izNTERcG9HzAacbVRn2Y2SWIyT/18QIDAQABAoIBACbhTYXBZYKmYPCb\nHBR1IBlCQA2nLGf0qRuJNJZg5iEzXows/6tc8YymZkQE7nolapWsQ+upk2y5Xdp/\naxiuprIs9JzkYK8Ox0r+dlwCG1kSW+UAbX0bQ/qUqlsTvU6muVuMP8vZYHxJ3wmb\n+ufRBKztPTQ/rYWaYQcgC0RWI20HTFBMxlTAyNxYNWzX7RKFkGVVyB9RsAtmcc8g\n+j4OdosbfNoJPS0HeIfNpAznDfHKdxDk2Yc1tV6RHBrC1ynyLE9+TaflIAdo2MVv\nKLMLq51GqYKtgJFIlBRPQqKoyXdz3fGvXrTkf/WY9QNq0J1Vk5ERePZ54mN8iZB7\n9lwy/AkCgYEA6FXzosxswaJ2wQLeoYc7ceaweX/SwTvxHgXzRyJIIT0eJWgx13Wo\n/WA3Iziimsjf6qE+SI/8laxPp2A86VMaIt3Z3mJN/CqSVGw8LK2AQst+OwdPyDMu\niacE8lj/IFGC8mwNUAb9CzGU3JpU4PxxGFjS/eMtGeRXCWkK4NE+G08CgYEA1Kp9\nN2JrVlqUz+gAX+LPmE9OEMAS9WQSQsfCHGogIFDGGcNf7+uwBM7GAaSJIP01zcoe\nVAgWdzXCv3FLhsaZoJ6RyLOLay5phbu1iaTr4UNYm5WtYTzMzqh8l1+MFFDl9xDB\nvULuCIIrglM5MeS/qnSg1uMoH2oVPj9TVst/ir8CgYEAxrI7Ws9Zc4Bt70N1As+U\nlySjaEVZCMkqvHJ6TCuVZFfQoE0r0whdLdRLU2PsLFP+q7qaeZQqgBaNSKeVcDYR\n9B+nY/jOmQoPewPVsp/vQTCnE/R81spu0mp0YI6cIheT1Z9zAy322svcc43JaWB7\nmEbeqyLOP4Z4qSOcmghZBSECgYACvR9Xs0DGn+wCsW4vze/2ei77MD4OQvepPIFX\ndFZtlBy5ADcgE9z0cuVB6CiL8DbdK5kwY9pGNr8HUCI03iHkW6Zs+0L0YmihfEVe\nPG19PSzK9CaDdhD9KFZSbLyVFmWfxOt50H7YRTTiPMgjyFpfi5j2q348yVT0tEQS\nfhRqaQKBgAcWPokmJ7EbYQGeMbS7HC8eWO/RyamlnSffdCdSc7ue3zdVJxpAkQ8W\nqu80pEIF6raIQfAf8MXiiZ7auFOSnHQTXUbhCpvDLKi0Mwq3G8Pl07l+2s6dQG6T\nlv6XTQaMyf6n1yjzL+fzDrH3qXMxHMO/b13EePXpDMpY7HQpoLDi\n-----END RSA PRIVATE KEY-----\n"
}
```