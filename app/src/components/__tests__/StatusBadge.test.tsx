import React from 'react';
import renderer from 'react-test-renderer';
import {act} from 'react-test-renderer';
import {StatusBadge} from '../StatusBadge';

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
      tree = renderer.create(<StatusBadge status={status} />).toJSON();
    });
    expect(tree).toMatchSnapshot();
  });
});
