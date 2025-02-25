import { jest } from '@jest/globals';

const mockTabs = {
  getActiveTab: jest.fn()
};
jest.doMock('./tabs.js', () => mockTabs);

const {
  addUrlFilter,
  addResourceFilter,
  removeFilter,
  optimizeUrlFilters,
  optimizeResourceFilters,
  passFilters
} = require('./filter.js');

describe('filter', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('addFilter - empty inputs', async () => {
    const actual = await addUrlFilter([]);

    expect(actual).toEqual([
      {
        comment: '',
        enabled: true,
        urlRegex: ''
      }
    ]);
  });

  test('addFilter - prefill url', async () => {
    mockTabs.getActiveTab.mockResolvedValue({ url: 'https://modheader.com/test' });
    const actual = await addUrlFilter([]);

    expect(actual).toEqual([
      {
        comment: '',
        enabled: true,
        urlRegex: '.*://modheader.com/.*'
      }
    ]);
  });

  test('addFilter - append to existing inputs', async () => {
    const actual = await addUrlFilter([
      {
        comment: 'Test 1',
        enabled: true,
        urlRegex: 'test'
      }
    ]);

    expect(actual).toEqual([
      {
        comment: 'Test 1',
        enabled: true,
        urlRegex: 'test'
      },
      {
        comment: '',
        enabled: true,
        urlRegex: ''
      }
    ]);
  });

  test('addResourceFilter', async () => {
    const actual = await addResourceFilter([
      {
        comment: 'Test 1',
        enabled: true,
        resourceType: ['main_frame']
      }
    ]);

    expect(actual).toEqual([
      {
        comment: 'Test 1',
        enabled: true,
        resourceType: ['main_frame']
      },
      {
        comment: '',
        enabled: true,
        resourceType: []
      }
    ]);
  });

  test('removeFilter - remove at index', async () => {
    const actual = removeFilter(
      [
        {
          comment: 'Test 1'
        },
        {
          comment: 'Test 2'
        }
      ],
      1
    );

    expect(actual).toEqual([
      {
        comment: 'Test 1'
      }
    ]);
  });

  test('removeFilter - index not in array', async () => {
    const actual = removeFilter(
      [
        {
          comment: 'Test 1'
        }
      ],
      1
    );

    expect(actual).toEqual([
      {
        comment: 'Test 1'
      }
    ]);
  });

  test('optimize url filters', async () => {
    const filters = optimizeUrlFilters([
      {
        comment: 'Converted to Regex',
        enabled: true,
        urlRegex: '.*.google.com.*'
      },
      {
        comment: 'Removed',
        enabled: false,
        urlRegex: '.*.google.com.*'
      }
    ]);
    expect(filters).toEqual([
      {
        comment: 'Converted to Regex',
        enabled: true,
        urlRegex: new RegExp('.*.google.com.*')
      }
    ]);
  });

  test('optimize resource filters', async () => {
    const filters = optimizeResourceFilters([
      {
        comment: 'Converted to Set',
        enabled: true,
        resourceType: ['main_frame']
      }
    ]);
    expect(filters).toEqual([
      {
        comment: 'Converted to Set',
        enabled: true,
        resourceType: new Set(['main_frame'])
      }
    ]);
  });

  test('pass filters - urls filter', async () => {
    const filters = optimizeUrlFilters([
      {
        enabled: true,
        urlRegex: '.*.google.com.*'
      }
    ]);
    expect(
      passFilters({
        url: 'https://www.google.com/search',
        type: 'main_frame',
        profile: {
          urlFilters: filters,
          excludeUrlFilters: [],
          resourceFilters: []
        }
      })
    ).toEqual(true);
    expect(
      passFilters({
        url: 'https://www.bing.com/search',
        type: 'main_frame',
        profile: {
          urlFilters: filters,
          excludeUrlFilters: [],
          resourceFilters: []
        }
      })
    ).toEqual(false);
  });

  test('pass filters - excluded urls filter', async () => {
    const filters = optimizeUrlFilters([{ enabled: true, urlRegex: '.*.google.com.*' }]);
    expect(
      passFilters({
        url: 'https://www.google.com/search',
        type: 'main_frame',
        profile: {
          urlFilters: [],
          excludeUrlFilters: filters,
          resourceFilters: []
        }
      })
    ).toEqual(false);
    expect(
      passFilters({
        url: 'https://www.bing.com/search',
        type: 'main_frame',
        profile: {
          urlFilters: [],
          excludeUrlFilters: filters,
          resourceFilters: []
        }
      })
    ).toEqual(true);
  });

  test('pass filters - urls and excluded urls both match - exclude takes precedent', async () => {
    expect(
      passFilters({
        url: 'https://www.google.com/search',
        type: 'main_frame',
        profile: {
          urlFilters: optimizeUrlFilters([{ enabled: true, urlRegex: '.*.google.com.*' }]),
          excludeUrlFilters: optimizeUrlFilters([{ enabled: true, urlRegex: '.*.google.com.*' }]),
          resourceFilters: []
        }
      })
    ).toEqual(false);
  });

  test('pass filters - resource filter', async () => {
    const filters = optimizeResourceFilters([{ enabled: true, resourceType: ['main_frame'] }]);
    expect(
      passFilters({
        url: 'https://www.google.com/search',
        type: 'main_frame',
        profile: {
          urlFilters: [],
          excludeUrlFilters: [],
          resourceFilters: filters
        }
      })
    ).toEqual(true);
    expect(
      passFilters({
        url: 'https://www.google.com/search',
        type: 'sub_frame',
        profile: {
          urlFilters: [],
          excludeUrlFilters: [],
          resourceFilters: filters
        }
      })
    ).toEqual(false);
  });
});
