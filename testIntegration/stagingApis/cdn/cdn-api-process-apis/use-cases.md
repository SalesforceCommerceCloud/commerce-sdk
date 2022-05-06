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
