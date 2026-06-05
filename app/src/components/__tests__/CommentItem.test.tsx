import React from 'react';
import renderer from 'react-test-renderer';
import {act} from 'react-test-renderer';
import {CommentItem} from '../CommentItem';
import type {ReportUpdate} from '../../types';

const mockUpdate: ReportUpdate = {
  id: 'u1',
  reportId: 'r1',
  createdById: 'staff1',
  createdByName: 'Ana Roja',
  type: 'comment',
  message: 'Se programó visita técnica para el jueves.',
  isOfficial: false,
  createdAt: '2026-01-16T14:30:00Z',
};

describe('CommentItem', () => {
  it('renders citizen comment', () => {
    let tree;
    act(() => {
      tree = renderer.create(<CommentItem update={mockUpdate} />).toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders official comment', () => {
    const official: ReportUpdate = {...mockUpdate, isOfficial: true};
    let tree;
    act(() => {
      tree = renderer.create(<CommentItem update={official} />).toJSON();
    });
    expect(tree).toMatchSnapshot();
  });
});
