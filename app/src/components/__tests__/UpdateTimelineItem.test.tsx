import React from 'react';
import renderer from 'react-test-renderer';
import {act} from 'react-test-renderer';
import {UpdateTimelineItem} from '../UpdateTimelineItem';
import type {ReportUpdate} from '../../types';

const commentUpdate: ReportUpdate = {
  id: 'u1',
  reportId: 'r1',
  createdById: 'staff1',
  createdByName: 'Carlos Mesa',
  type: 'comment',
  message: 'En camino al sitio.',
  isOfficial: true,
  createdAt: '2026-01-17T09:00:00Z',
};

const statusUpdate: ReportUpdate = {
  id: 'u2',
  reportId: 'r1',
  createdById: 'staff1',
  createdByName: 'Carlos Mesa',
  type: 'status_change',
  message: '',
  oldStatus: 'InReview',
  newStatus: 'InProgress',
  isOfficial: true,
  createdAt: '2026-01-17T10:00:00Z',
};

describe('UpdateTimelineItem', () => {
  it('renders comment update', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(<UpdateTimelineItem update={commentUpdate} />)
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders status-change update', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(<UpdateTimelineItem update={statusUpdate} />)
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders last item (no connector line)', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(<UpdateTimelineItem update={commentUpdate} isLast />)
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });
});
