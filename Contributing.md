## Contributing

To contribute to commerce-sdk, follow the guidelines below. This helps us address your pull request in a more timely manner.

## Issues

First, check the [open issues](https://github.com/SalesforceCommerceCloud/commerce-sdk/issues) and [Commerce Cloud Developer Center](https://developer.salesforce.com/developer-centers/commerce-cloud) for any open issues related to the issue that you are experiencing. If not already raised please file a new issue [here](https://github.com/SalesforceCommerceCloud/commerce-sdk/issues/new) with all the necessary details. If you require an urgent resolution to your issue please ask your AM/CSM to file a support ticket with Salesforce Commerce.


## Submit a Pull Request

  1. Create a new issue. It allows us to easily communicate with you about the issue.
  2. Create a fork of this repository.
  3. Create a branch off the master branch.
  4. Add your changes to the fork.
  5. Create a pull request against the master branch.
  6. Grant _dx-runtime_ team access to your fork so we can run automated tests on your pull request prior to merging it.

## Best Practices

* To reduce merge conflicts, squash and rebase your branch before submitting your pull request.
* If applicable, reference the issue number in the comments of your pull request.
* In your pull request, include:
  * A brief description of the problem and your solution
  * Steps to reproduce
  * Screen shots
  * Error logs
* Make sure that your code builds and passes the unit tests.
* Monitor your pull requests. Please respond in a timely manner to any comments, questions for changes requested. We may close abandoned pull requests.

## Updating SCAPI specs

`npm run updateApis` refreshes the specs in `apis/` from the internal ECOM monorepo. `api-versions.txt` lists every API the SDK ships and where ECOM publishes it. Refreshing them requires access to the Salesforce network, so it is done by SDK maintainers:

1. Copy `.env.example` to `.env` and fill in `ECOM_REPO_URL` and `ECOM_BUNDLES_ROOT` (ask the SDK maintainers for the values).
2. Run `npm run updateApis` to refresh every API for the ECOM release in the `api-versions.txt` header, or `npm run updateApis -- --api <key> --ref <ecom-ref>` to refresh only some APIs from an ECOM branch.
3. Review `temp/diffApis.txt`, then run `npm run build` and `npm run test:unit`.

See [ECOM_SPEC_CONTRACT.md](./ECOM_SPEC_CONTRACT.md) for both modes, the checks each run makes, and the release steps.

## What to expect

After you submit your pull request, we'll look it over and consider it for merging.

As long as your submission has met the above guidelines, we should merge it in a timely manner.

## Contributor License Agreement (CLA)

All external contributors must sign our Contributor License Agreement (CLA).  
