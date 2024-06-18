# API Overview

Campaigns enable experiences based on an optional schedule and qualifying criteria.
When an experience is assigned to a campaign, the schedule and qualifiers can only refine those of the containing campaign. A campaign is defined in the context of a site and is not shared among sites. A campaign can be enabled or disabled. A disabled campaign is inactive and not available to consumers. Enabled promotions contained within a disabled campaign are also inactive.

## Qualifiers

Qualifiers are requirements that must be met to enable a campaign's experience.

-   Schedule: A start and end time and date. This can be open ended at one or both ends.
-   Coupon: A coupon
-   Customer Group: Membership in a customer group.
-   Source Code: A code attached to the site URL used to identify where the customer was redirected from.

For more details, see [Qualifiers](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/promotions/b2c_qualifiers.html) on the Salesforce B2C Commerce Infocenter.

## Experiences

Promotion: A monetary discount or bonus item. Promotions can have additional criteria such as quantity or number of products gating the discount.

## Authentication & Authorization

The client requesting the campaign information must have access to the Campaign resource. The API requests pass a bearer token in the header of the request. The client must first authenticate against Account Manager to log in.

## Use Cases

### Flash Sales

Single date promotions can be used when you want to run a campaign only for a short period of time.
For example, a '20% Off Black Friday' campaign enables a 20% off promotion for registered customers on Black Friday.

### No Date or Time Restrictions

Promotions can also be configured with no time or date restrictions. This is useful when running coupon-coded promotions, or qualifier based promotions that require certain criteria to be met.
For example, a 'Free Shipping' campaign enables a free shipping promotion when the coupon code "freeship" is added to the cart.

### Redirections

Redirection promotions can be used to trigger a promotion when a customer arrives at the storefront from a specific location. You may want to use this when partnering with other resources or running external advertisements.
For example, all users directed from Facebook receive a free hat with purchase.
For more information, see [Use Source Codes as Qualifiers](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/promotions/b2c_using_source_codesas_qualifiers.html) in the Salesforce B2C Commerce Infocenter.

## Resources

### Campaign

Details of the campaign including the schedule, qualifiers, and experiences.