/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const _ = require('../lodash.js');
const PRandom = require('./prandom.js');
const {createLHR} = require('./lhr-generator.js');

// To include in next LHR update...
//    - Not applicable audits
//    - Informative audits
//    - 0-value numericValue

/** @typedef {import('./lhr-generator').AuditGenDef} AuditGenDef */

/**
 * @param {Pick<LHCI.ServerCommand.Run, 'projectId'|'buildId'|'url'>} run
 * @param {Record<string, StrictOmit<AuditGenDef, 'auditId'>>} audits
 * @param {number} prandomVariant
 * @param {number} [numberOfRuns]
 * @return {Array<LHCI.ServerCommand.Run>}
 */
function createRuns(run, audits, prandomVariant, numberOfRuns = 5) {
  const auditDefs = Object.keys(audits).map(auditId => ({auditId, ...audits[auditId]}));
  const prandom = new PRandom(prandomVariant);

  /** @type {Array<LHCI.ServerCommand.Run>} */
  const runs = [];

  for (let i = 0; i < numberOfRuns; i++) {
    runs.push({
      ...run,
      representative: false,
      id: '',
      lhr: JSON.stringify(createLHR(run.url, auditDefs, prandom)),
    });
  }

  return runs;
}

/**
 * @return {{projects: Array<LHCI.ServerCommand.Project>, builds: Array<LHCI.ServerCommand.Build>, runs: Array<LHCI.ServerCommand.Run>}}
 */
function createDataset() {
  const fiftyFiftyImages = [
    {
      inclusionRate: 0.5,
      url: 'http://lorempixel.com/200/200/sports/2',
      averageTotalBytes: 100 * 1024,
      averageWastedBytes: 50 * 1024,
    },
    {
      inclusionRate: 0.5,
      url: 'http://lorempixel.com/200/200/sports/3',
      averageTotalBytes: 80 * 1024,
      averageWastedBytes: 20 * 1024,
    },
    {
      inclusionRate: 0.5,
      url: 'http://lorempixel.com/200/200/sports/4',
      averageTotalBytes: 200 * 1024,
      averageWastedBytes: 10 * 1024,
    },
    {
      inclusionRate: 0.5,
      url: 'http://lorempixel.com/200/200/sports/5',
      averageTotalBytes: 150 * 1024,
      averageWastedBytes: 20 * 1024,
    },
    {
      inclusionRate: 0.5,
      url: 'http://lorempixel.com/200/200/sports/6',
      averageTotalBytes: 75 * 1024,
      averageWastedBytes: 10 * 1024,
    },
    {
      inclusionRate: 0.5,
      url: 'http://lorempixel.com/200/200/sports/7',
      averageTotalBytes: 500 * 1024,
      averageWastedBytes: 200 * 1024,
    },
    {
      inclusionRate: 0.5,
      url: 'http://lorempixel.com/200/200/sports/8',
      averageTotalBytes: 25 * 1024,
      averageWastedBytes: 5 * 1024,
    },
  ];

  const permanentScripts = [
    {
      url: '/js/app.js',
      averageWastedMs: 3000,
      averageTotalBytes: 1000 * 1024,
    },
    {
      url: '/js/vendor.js',
      averageWastedMs: 500,
      averageTotalBytes: 5000 * 1024,
    },
    {
      url: 'https://www.google-analytics.com/ga.js',
      averageWastedMs: 200,
      averageTotalBytes: 50 * 1024,
    },
  ];

  const elements = [
    {
      inclusionRate: 0.5,
      node: {type: 'node', snippet: '<a href="/home">Home</a>', selector: 'header > nav > a'},
    },
    {
      inclusionRate: 0.5,
      node: {type: 'node', snippet: '<nav class="my-nav">', selector: 'header > nav'},
    },
    {
      inclusionRate: 0.5,
      node: {type: 'node', snippet: '<header id="header">', selector: 'header'},
    },
    {
      inclusionRate: 0.5,
      node: {type: 'node', snippet: '<a href="/away">Away</a>', selector: 'a.big-link'},
    },
  ];

  const auditsToFake = {
    'first-contentful-paint': {averageNumericValue: 1000},
    'first-meaningful-paint': {averageNumericValue: 1000},
    'first-cpu-idle': {averageNumericValue: 3000},
    'speed-index': {averageNumericValue: 3000},
    interactive: {averageNumericValue: 5000},
    'max-potential-fid': {averageNumericValue: 250},

    'uses-responsive-images': {averageWastedMs: 400, items: fiftyFiftyImages},
    'uses-minified-files': {averageWastedMs: 800, items: fiftyFiftyImages},
    'uses-optimized-images': {averageWastedMs: 1400, items: fiftyFiftyImages},
    'diagnostic-dom-size': {averageNumericValue: 2000, unit: 'elements'},
    'diagnostic-main-thread-time': {averageNumericValue: 5000, unit: 'ms', items: permanentScripts},
    'diagnostic-cache-headers': {passRate: 0.5, items: permanentScripts},
    'diagnostic-total-byte-weight': {
      averageNumericValue: 8000,
      unit: 'KB',
      items: fiftyFiftyImages,
    },

    'a11y-color-contrast': {passRate: 0.5, items: elements},
    'a11y-labels': {passRate: 0.5, items: elements},
    'a11y-duplicate-id': {passRate: 0.5, items: elements},
    'a11y-alt-text': {passRate: 0.5, items: elements},

    'pwa-fast-reliable-https': {passRate: 0.7},
    'pwa-fast-reliable-offline': {passRate: 0.7},
    'pwa-installable-manifest': {passRate: 0.7},
    'pwa-installable-start-url': {passRate: 0.7},
    'pwa-optimized-service-worker': {passRate: 0.7},
    'pwa-optimized-omnibox': {passRate: 0.7},

    'best-practices-console-errors': {passRate: 0.2},
    'best-practices-rel-noopener': {passRate: 0.8},
    'best-practices-password-paste': {passRate: 0.9},

    'seo-font-size': {passRate: 0.5},
    'seo-indexable': {passRate: 0.9},
    'seo-title': {passRate: 0.9},
  };

  return {
    projects: [
      {
        id: '',
        name: 'Lighthouse Viewer',
        externalUrl: 'https://travis-ci.org/GoogleChrome/lighthouse',
        token: '',
      },
      {
        id: '',
        name: 'Lighthouse Dashboard',
        externalUrl: 'https://travis-ci.org/GoogleChrome/lighthouse-ci',
        token: '',
      },
    ],
    builds: [
      {
        id: '0',
        projectId: '0',
        lifecycle: 'unsealed',
        branch: 'master',
        hash: '6e0d172cbf4ce1252fce0b2297c7a1c2b5646ce0',
        externalBuildUrl: 'http://travis-ci.org/org/repo/1020',
        commitMessage: 'feat: initial commit',
        author: 'Patrick Hulce <patrick@example.com>',
        avatarUrl: 'https://avatars1.githubusercontent.com/u/2301202?s=460&v=4',
        ancestorHash: '',
        runAt: '2019-08-05T20:25:28.904Z',
      },
      {
        id: '1',
        projectId: '0',
        lifecycle: 'unsealed',
        branch: 'master',
        hash: '30cf658d9d72669af568d37ea60d945bfb3b0fc3',
        externalBuildUrl: 'http://travis-ci.org/org/repo/1021',
        author: 'Paul Irish <paul@example.com>',
        avatarUrl: 'https://avatars1.githubusercontent.com/u/39191?s=460&v=4',
        commitMessage: 'feat: add some more awesome features',
        ancestorHash: '',
        runAt: '2019-08-05T22:45:28.904Z',
      },
      {
        id: '2',
        projectId: '0',
        lifecycle: 'unsealed',
        branch: 'master',
        hash: 'ac839abb9aa3c1ea447b8c3c9ba5b0ad9f6824d2',
        externalBuildUrl: 'http://travis-ci.org/org/repo/1022',
        commitMessage: 'feat: add a redesigned dashboard',
        author: 'Patrick Hulce <patrick@example.com>',
        avatarUrl: 'https://avatars1.githubusercontent.com/u/2301202?s=460&v=4',
        ancestorHash: '',
        runAt: '2019-08-06T22:13:28.904Z',
      },
      {
        id: '3',
        projectId: '0',
        lifecycle: 'unsealed',
        branch: 'master',
        hash: 'bb9aa3c1ea447b8c3c9ba5b0adac839a9f6824d2',
        externalBuildUrl: 'http://travis-ci.org/org/repo/1023',
        author: 'Paul Irish <paul@example.com>',
        avatarUrl: 'https://avatars1.githubusercontent.com/u/39191?s=460&v=4',
        commitMessage: 'perf: TTI improvements',
        ancestorHash: '',
        runAt: '2019-08-07T20:51:28.904Z',
      },
      {
        id: '4',
        projectId: '0',
        lifecycle: 'unsealed',
        branch: 'test_0',
        hash: 'aaa5b0a3c1ea447b8c3c9bac839abb9d9f6824d2',
        externalBuildUrl: 'http://travis-ci.org/org/repo/1024',
        commitMessage: 'feat: regresses TTI',
        author: 'Patrick Hulce <patrick@example.com>',
        avatarUrl: 'https://avatars1.githubusercontent.com/u/2301202?s=460&v=4',
        ancestorHash: 'ac839abb9aa3c1ea447b8c3c9ba5b0ad9f6824d2', // build 2
        runAt: '2019-08-09T20:15:28.904Z',
      },
      {
        id: '5',
        projectId: '0',
        lifecycle: 'unsealed',
        branch: 'test_1',
        hash: 'c1ea447b8c3c9ba5b0ad9f6824d2ac839abb9aa3',
        externalBuildUrl: 'http://travis-ci.org/org/repo/1025',
        commitMessage: 'feat: improves TTI',
        author: 'Patrick Hulce <patrick@example.com>',
        avatarUrl: 'https://avatars1.githubusercontent.com/u/2301202?s=460&v=4',
        ancestorHash: '30cf658d9d72669af568d37ea60d945bfb3b0fc3', // build 1
        runAt: '2019-08-09T23:15:28.904Z',
      },
      {
        id: '6',
        projectId: '0',
        lifecycle: 'unsealed',
        branch: 'master',
        hash: '5b0ad9f682c1ea447b8c3c9ba4d2ac839abb9aa3',
        externalBuildUrl: 'http://travis-ci.org/org/repo/1025',
        commitMessage: 'test(matched-ancestor): a really really really really really long message',
        author: 'Patrick Hulce <patrick@example.com>',
        avatarUrl: 'https://avatars1.githubusercontent.com/u/2301202?s=460&v=4',
        ancestorHash: '5b0ad9f682c1ea447b8c3c9ba4d2ac839abb9aa3',
        runAt: '2019-08-09T23:55:18.904Z',
      },
      {
        id: '7',
        projectId: '0',
        lifecycle: 'unsealed',
        branch: 'missing_ancestor',
        hash: 'ba5b0ad9f6824c1ea447b8c3c9d2ac839abb9aa3',
        externalBuildUrl: 'http://travis-ci.org/org/repo/1025',
        commitMessage: 'test(unmatched-ancestor): a really really really really long message',
        author: 'Paul Irish <paul@example.com>',
        avatarUrl: 'https://avatars1.githubusercontent.com/u/39191?s=460&v=4',
        ancestorHash: '3c9ba5c17b8ea44cb24d2ac839abb0ad9f689aa3', // this doesn't match anything
        runAt: '2019-08-10T01:13:28.904Z',
      },
    ],
    runs: [
      ...createRuns(
        {projectId: '0', buildId: '0', url: 'http://localhost:1234/viewer/#home'},
        auditsToFake,
        0
      ),
      ...createRuns(
        {projectId: '0', buildId: '1', url: 'http://localhost:1234/viewer/#home'},
        auditsToFake,
        1
      ),
      ...createRuns(
        {projectId: '0', buildId: '2', url: 'http://localhost:1234/viewer/#home'},
        auditsToFake,
        2
      ),
      ...createRuns(
        {projectId: '0', buildId: '0', url: 'http://localhost:1234/viewer/#checkout'},
        auditsToFake,
        3
      ),
      ...createRuns(
        {projectId: '0', buildId: '1', url: 'http://localhost:1234/viewer/#checkout'},
        auditsToFake,
        4
      ),
      ...createRuns(
        {projectId: '0', buildId: '2', url: 'http://localhost:1234/viewer/#checkout'},
        auditsToFake,
        5
      ),
      ...createRuns(
        {projectId: '0', buildId: '3', url: 'http://localhost:1234/viewer/#home'},
        {...auditsToFake, interactive: {averageNumericValue: 4000}},
        6
      ),
      ...createRuns(
        {projectId: '0', buildId: '3', url: 'http://localhost:1234/viewer/#checkout'},
        auditsToFake,
        7
      ),
      ...createRuns(
        // this build is a branch that regresses metrics
        {projectId: '0', buildId: '4', url: 'http://localhost:1234/viewer/#home'},
        {
          ...auditsToFake,
          interactive: {averageNumericValue: 7000},
          'diagnostic-main-thread-time': {
            averageNumericValue: 6000,
            items: permanentScripts.map(item =>
              item.url.includes('app')
                ? {...item, averageWastedMs: item.averageWastedMs + 1000}
                : item
            ),
          },
        },
        8
      ),
      ...createRuns(
        // this build is a branch that improves metrics
        {projectId: '0', buildId: '5', url: 'http://localhost:1234/viewer/#home'},
        {
          ...auditsToFake,
          interactive: {averageNumericValue: 3000},
          'diagnostic-main-thread-time': {
            averageNumericValue: 2000,
            items: permanentScripts.map(item =>
              item.url.includes('app')
                ? {...item, averageWastedMs: item.averageWastedMs - 1000}
                : item
            ),
          },
        },
        9
      ),
      ...createRuns(
        // this build is a branch that improves metrics
        {projectId: '0', buildId: '5', url: 'http://localhost:1234/viewer/#checkout'},
        {
          ...auditsToFake,
          interactive: {averageNumericValue: 2800},
          'diagnostic-main-thread-time': {
            averageNumericValue: 1700,
            items: permanentScripts.map(item =>
              item.url.includes('app')
                ? {...item, averageWastedMs: item.averageWastedMs - 1000}
                : item
            ),
          },
        },
        10
      ),
      ...createRuns(
        {projectId: '0', buildId: '6', url: 'http://localhost:1234/viewer/#home'},
        {...auditsToFake, interactive: {averageNumericValue: 12000}},
        11
      ),
      ...createRuns(
        {projectId: '0', buildId: '6', url: 'http://localhost:1234/viewer/#checkout'},
        {...auditsToFake, interactive: {averageNumericValue: 12000}},
        12
      ),
      ...createRuns(
        {projectId: '0', buildId: '7', url: 'http://localhost:1234/viewer/#home'},
        auditsToFake,
        13
      ),
      ...createRuns(
        {projectId: '0', buildId: '7', url: 'http://localhost:1234/viewer/#checkout'},
        auditsToFake,
        14
      ),
    ],
  };
}

module.exports = {createDataset, createRuns};
