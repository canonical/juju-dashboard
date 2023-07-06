# Contributing to Juju Dashboard

So you want to contribute? Great! We welcome contributions of many kinds to Juju
Dashboard. This document will help you know what kinds of contributions you
can make and how to get started.

- [Vision](#vision)
- [Ways to contribute](#ways-to-contribute)
  - [File bugs](#file-bugs)
  - [QA](#qa)
  - [Write docs](#write-docs)
  - [Provide feedback](#provide-feedback)
  - [Propose features](#propose-features)
  - [Contribute code](#contribute-code)
    - [Setting up for development](#setting-up-for-development)
    - [Submitting a PR](#submitting-a-pr)
- [Getting help](#getting-help)
- [Licence](#licence)

## Vision

Juju Dashboard aims to expose Juju environments, providing at-scale management,
status and collaboration features not found in the Juju CLI.

When designing, or proposing new features it is good to ask whether the feature
supports that vision. If not, is there a way that it could, or does it belong
somewhere else in the Juju ecosystem?

## Ways to contribute

### File bugs

If you've found a bug we'd love to hear about it. Please take a look at [how to
file a bug](https://github.com/canonical/juju-dashboard/#issues).

### QA

While we try to QA the dashboard as much as we can there are always combinations
of Juju environments, browsers, devices etc. that we haven't tested or don't
have access to.

We have some [QA instructions](/RELEASING.md#qa) to help you get started.

### Write docs

The dashboard docs are hosted on
[juju.is](https://juju.is/docs/olm/the-juju-dashboard). Each page has a link to
improve the doc on the forum. We'd love any improvements, suggestions, comments
or new guides.

### Provide feedback

If you're using Juju dashboard and have feedback about your usage you can
provide feedback on the jaas.ai website. We'd particularly like to hear if you
have large deployments or teams using the dashboard.

To provide feedback go to [jaas.ai](https://jaas.ai/) and click the "Site feedback" button
on the right side of the window.

### Propose features

You can propose a new feature for the dashboard by either filing a new [feature
request](https://github.com/canonical/juju-dashboard/issues/new?assignees=&labels=&projects=&template=feature_request.md&title=)
or start a new topic on the
[Discourse](https://discourse.charmhub.io/tags/c/juju/6/dashboard) forum and
give it the "dashboard" tag.

It is well worth considering how the new feature supports [the vision](#vision)
before you submit the request.

### Contribute code

If you'd like to contribute code, either as a bug fix or a new feature then take
a look at the [list of
issues](https://github.com/canonical/juju-dashboard/issues).

All code contributions will need an accompanying issue and please assign the issue to
yourself when you start work on it to avoid doubling up. You might also like to leave a comment on it
about when you plan to do the work.

Before you begin coding you might also like to respond to the issue with how you
propose to resolve it and remember to think about how your proposal supports
[the vision](#vision).

Some solutions might require some input from our in-house design team.

#### Setting up for development

Take a look at our [HACKING doc](/HACKING.md) to find out how to get the
dashboard codebase set up, overview of the codebase and guides on setting up
Juju environments.

#### Submitting a PR

There are a few checks to do before submitting a PR:

- Did you leave code comments where necessary?
- Does your change have good test coverage (CI requires 90% coverage for the
  codebase)?
- Does your code work across browsers?
- Does your code work on mobile?
- Check lint with `yarn lint`.
- Check the tests pass with `yarn test`.
- Does this break main (we try to keep main releasable at all times)?

Once you're ready to submit your PR, push your code to a branch of your fork.

Go to the [upstream pull requests
page](https://github.com/canonical/juju-dashboard/pulls) and click the button in
the notification about your branch. If you don't get the notification then you might
need to go to your fork's pull request page, click 'New pull request' and select
your branch.

Fill out the details in the pull request template. Leave as many details as you
think the reviewer will need to understand the changes you've made.

Add tags for the reviews that are needed ('Review: Code needed', 'Review: QA
needed', 'Review: Design needed' and 'Review: UX needed').

At this point you can create a draft pull request if you're not sure about
anything, otherwise go ahead and create the pull request.

Now that the PR has been created you can go to the 'Files changed' tab and add
any additional comments to any files or lines of code that you think need
additional explanation for the reviewer.

That's it, you're done! We'll review the changes and make suggestions as needed.

## Getting help

If you're stuck at any point please [get in contact](/README.md#community) with us.

## Licence

By contributing to the Juju Dashboard repository you agree that your
contributions will be licensed under [LGPL v3](/LICENSE.md).
