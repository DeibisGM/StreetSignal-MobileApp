import React from 'react';
import renderer from 'react-test-renderer';
import {act} from 'react-test-renderer';
import {StatusBadge} from '../StatusBadge';
import {LanguageProvider} from '../../i18n';

const STATUSES = [
  'Pending',
  'InReview',
  'Assigned',
  'InProgress',
  'Resolved',
  'Rejected',
] as const;

describe('StatusBadge', () => {
  it.each(STATUSES)('renders %s status correctly', status => {
    let tree;
    act(() => {
      tree = renderer.create(<LanguageProvider><StatusBadge status={status} /></LanguageProvider>).toJSON();
    });
    expect(tree).toMatchSnapshot();
  });
});
