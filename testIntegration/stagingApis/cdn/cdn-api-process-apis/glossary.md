**Cache**: Where the CDN stores copies of resources that it returns to end users. What the cache stores, and for how long, is determined by the cache-control headers returned by the origin. By default, only static content is stored in cache.

**CDN Hostname**: The part of a zone configured by clients to indicate traffic configured for the CDN (for example, www.customer.com.cdn.cloudflare.net). The CDN Hostname is the _target_ for client hostnames. You can use this hostname to spoof host files to direct traffic to the CDN for testing purposes.

**Client**: The primary user (customer) of the CDN service.

**Client Domain**: The DNS zone owned and maintained by the client (for example, https://www.customer.com).

**Client Hostname**: Hostnames tied to client-owned domains that clients configure to direct traffic to the CDN hostname.

**Consumer**: The end user, that is, the consumer of the resources proxied by the CDN.

**Firewall Rule**: Rules that enable the client to set up firewall policies based on various request or connection parameters. For example, a client can configure a firewall blocking rule if the request originated from a certain geographic location.

**Origin**: The source of truth, meaning where actual resources are stored. The origin is what the CDN proxies and protects.

**Resource**: Any content owned and managed by the client that can be delivered using the Internet, for example, html pages, images, javascript, css, fonts, and so on.

**WAF Group**: A collection of WAF rules compiled under a single unit. WAF Groups enable batch update of all rules in a particular group.

**WAF Rule**: A WAF policy designed to defend against a specific application vulnerability or attack.

**Web Application Firewall (WAF)**: Firewall that enables clients to protect the origin from various _application_ level attacks, such as SQL injection, xss, etc. By definition, WAF is stateless and uses request signature to identify threats.

**Zone**: The container of hostnames and properties. Each zone is tied to a single origin.

[1]: https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/account_manager/b2c_account_manager_add_api_client_id.html
